import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * 公平随机数生成器 - 使用 HMAC_DRBG 确保可验证性
 */
export class FairRandomGenerator {
  private counter: number = 0;

  constructor(private seed: Buffer) {}

  /**
   * 生成下一个随机数 [0, max)，使用拒绝采样避免模偏置
   */
  nextInt(max: number): number {
    if (max <= 1) return 0;

    const bytesNeeded = Math.ceil(Math.log2(max) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const threshold = maxValue - (maxValue % max);

    while (true) {
      const hmac = createHmac('sha256', this.seed);
      hmac.update(`shuffle:${this.counter++}`);
      const bytes = hmac.digest();

      let value = 0;
      for (let i = 0; i < bytesNeeded && i < bytes.length; i++) {
        value = value * 256 + bytes[i];
      }

      if (value < threshold) {
        return value % max;
      }
    }
  }

  nextBoolean(): boolean {
    return this.nextInt(2) === 1;
  }
}

/**
 * Fisher-Yates 无偏置洗牌算法
 */
export function fisherYatesShuffle<T>(array: T[], rng: FairRandomGenerator): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 创建会话承诺
 */
export function createSessionCommit(sessionId: string, timestamp: number): {
  serverSeed: Buffer;
  commitHash: string;
} {
  const serverSeed = randomBytes(32);
  const commitData = `${sessionId}||${timestamp}||${serverSeed.toString('base64')}`;
  const commitHash = createHash('sha256').update(commitData).digest('hex');
  return { serverSeed, commitHash };
}

/**
 * 验证承诺
 */
export function verifyCommit(
  sessionId: string,
  timestamp: number,
  serverSeed: string,
  expectedHash: string
): boolean {
  const commitData = `${sessionId}||${timestamp}||${serverSeed}`;
  const actualHash = createHash('sha256').update(commitData).digest('hex');
  return actualHash === expectedHash;
}

/**
 * 生成完整的牌组（78张塔罗牌）
 */
export function generateFullDeck(): Array<{ name: string; suit: string; number: number }> {
  const majorArcana = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
  ].map((name, index) => ({ name, suit: 'Major', number: index }));

  const minorSuits = ['Cups', 'Wands', 'Swords', 'Pentacles'];
  const minorNumbers = Array.from({ length: 14 }, (_, i) => i + 1);

  const minorArcana = minorSuits.flatMap(suit =>
    minorNumbers.map(number => ({
      name: `${number} of ${suit}`,
      suit,
      number,
    }))
  );

  return [...majorArcana, ...minorArcana];
}

// ─── Stateless session tokens (serverless-safe) ────────────────────────────────
//
// We replace the old file-backed session store with a signed, self-contained
// token. The token IS the session — no server-side storage needed, so it
// works correctly on Vercel / serverless where the filesystem is ephemeral
// and per-instance.
//
// Token format: base64url(payload).base64url(hmac)
//   payload = { v, sid, spread, ts, exp, seed }
//   hmac = HMAC-SHA256(secret, payload_b64)
//
// The session "id" returned to the frontend IS this signed token. The frontend
// passes it back on /api/draw; we verify the HMAC and recover the seed.

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_VERSION = 1;

interface TokenPayload {
  v: number;
  sid: string;
  spread: string;
  ts: number;
  exp: number;
  seed: string;
}

export interface SessionData {
  sessionId: string;
  commitHash: string;
  serverSeed: Buffer;
  timestamp: number;
  spread: string;
}

function getSecret(): Buffer {
  const raw = process.env.SESSION_SECRET;
  if (raw && raw.length >= 32) {
    return Buffer.from(raw, 'utf8');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET env var is required in production (32+ chars). ' +
      'Generate one with: openssl rand -hex 32'
    );
  }
  // Dev fallback: per-process random secret. Sessions don't survive restart,
  // but local dev doesn't need that.
  if (!devFallbackSecret) {
    devFallbackSecret = randomBytes(32);
    console.warn('[fair-random] SESSION_SECRET not set — using ephemeral dev secret');
  }
  return devFallbackSecret;
}
let devFallbackSecret: Buffer | null = null;

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Buffer {
  const pad = str.length % 4 === 0 ? 0 : 4 - (str.length % 4);
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad), 'base64');
}

function signPayload(payloadB64: string): string {
  return b64urlEncode(createHmac('sha256', getSecret()).update(payloadB64).digest());
}

function encodeToken(payload: TokenPayload): string {
  const payloadB64 = b64urlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

function decodeAndVerifyToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  const expectedSig = b64urlDecode(signPayload(payloadB64));
  const providedSig = b64urlDecode(sigB64);
  if (expectedSig.length !== providedSig.length) return null;
  if (!timingSafeEqual(expectedSig, providedSig)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString('utf8'));
  } catch {
    return null;
  }

  if (payload.v !== TOKEN_VERSION) return null;
  if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
  return payload;
}

/**
 * 创建一次抽牌会话。返回的 sessionId 实际上是签名 token（无状态）。
 */
export function createSession(spread: string): {
  sessionId: string;
  commitHash: string;
  timestamp: number;
} {
  const sid = uuidv4();
  const timestamp = Date.now();
  const { serverSeed, commitHash } = createSessionCommit(sid, timestamp);

  const token = encodeToken({
    v: TOKEN_VERSION,
    sid,
    spread,
    ts: timestamp,
    exp: timestamp + SESSION_TTL_MS,
    seed: serverSeed.toString('base64'),
  });

  return { sessionId: token, commitHash, timestamp };
}

/**
 * 从签名 token 中恢复会话数据。失败时返回 undefined。
 */
export function getSession(token: string): SessionData | undefined {
  const payload = decodeAndVerifyToken(token);
  if (!payload) return undefined;

  const serverSeed = Buffer.from(payload.seed, 'base64');
  const commitData = `${payload.sid}||${payload.ts}||${payload.seed}`;
  const commitHash = createHash('sha256').update(commitData).digest('hex');

  return {
    sessionId: payload.sid,
    commitHash,
    serverSeed,
    timestamp: payload.ts,
    spread: payload.spread,
  };
}

/**
 * Stateless tokens 没有服务端存储，删除是 no-op。保留接口兼容性。
 */
export function deleteSession(_token: string): void {
  // no-op: tokens are self-contained and expire via `exp` field
}
