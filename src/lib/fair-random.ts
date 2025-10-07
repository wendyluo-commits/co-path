import { createHash, createHmac, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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
    
    // 计算需要的字节数
    const bytesNeeded = Math.ceil(Math.log2(max) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const threshold = maxValue - (maxValue % max);
    
    while (true) {
      // 使用 HMAC 派生随机数
      const hmac = createHmac('sha256', this.seed);
      hmac.update(`shuffle:${this.counter++}`);
      const randomBytes = hmac.digest();
      
      // 转换为整数
      let value = 0;
      for (let i = 0; i < bytesNeeded && i < randomBytes.length; i++) {
        value = value * 256 + randomBytes[i];
      }
      
      // 拒绝采样避免模偏置
      if (value < threshold) {
        return value % max;
      }
    }
  }

  /**
   * 生成随机布尔值（用于决定正逆位）
   */
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
  
  return {
    serverSeed,
    commitHash
  };
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
export function generateFullDeck(): Array<{name: string; suit: string; number: number}> {
  const majorArcana = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
  ].map((name, index) => ({ name, suit: 'Major', number: index }));

  const minorSuits = ['Cups', 'Wands', 'Swords', 'Pentacles'];
  const minorNumbers = Array.from({length: 14}, (_, i) => i + 1); // 1-14 (包括 Court cards)
  
  const minorArcana = minorSuits.flatMap(suit => 
    minorNumbers.map(number => ({
      name: `${number} of ${suit}`,
      suit,
      number
    }))
  );

  return [...majorArcana, ...minorArcana];
}

/**
 * 会话管理（简单内存存储，生产环境应使用 Redis/DB）
 */
interface SessionData {
  sessionId: string;
  commitHash: string;
  serverSeed: Buffer;
  timestamp: number;
  spread: string;
}

// 使用文件系统存储会话（开发环境友好）
const SESSIONS_DIR = join(process.cwd(), '.sessions');

// 确保会话目录存在
if (!existsSync(SESSIONS_DIR)) {
  mkdirSync(SESSIONS_DIR, { recursive: true });
}

// 会话管理函数
function saveSession(sessionId: string, data: SessionData) {
  const filePath = join(SESSIONS_DIR, `${sessionId}.json`);
  writeFileSync(filePath, JSON.stringify({
    ...data,
    serverSeed: data.serverSeed.toString('base64') // 转换为可序列化格式
  }));
}

function loadSession(sessionId: string): SessionData | null {
  const filePath = join(SESSIONS_DIR, `${sessionId}.json`);
  if (!existsSync(filePath)) {
    return null;
  }
  
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return {
      ...data,
      serverSeed: Buffer.from(data.serverSeed, 'base64') // 转换回 Buffer
    };
  } catch {
    return null;
  }
}

function deleteSessionFile(sessionId: string) {
  const filePath = join(SESSIONS_DIR, `${sessionId}.json`);
  if (existsSync(filePath)) {
    try {
      require('fs').unlinkSync(filePath);
    } catch {
      // 忽略删除错误
    }
  }
}

export function createSession(spread: string): {
  sessionId: string;
  commitHash: string;
  timestamp: number;
} {
  const sessionId = uuidv4();
  const timestamp = Date.now();
  const { serverSeed, commitHash } = createSessionCommit(sessionId, timestamp);
  
  saveSession(sessionId, {
    sessionId,
    commitHash,
    serverSeed,
    timestamp,
    spread
  });
  
  // 清理过期会话（1小时）
  setTimeout(() => {
    deleteSessionFile(sessionId);
  }, 60 * 60 * 1000);
  
  return {
    sessionId,
    commitHash,
    timestamp
  };
}

export function getSession(sessionId: string): SessionData | undefined {
  return loadSession(sessionId) || undefined;
}

export function deleteSession(sessionId: string): void {
  deleteSessionFile(sessionId);
}
