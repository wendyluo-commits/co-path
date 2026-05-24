import { NextRequest, NextResponse } from 'next/server';

// In-memory sliding-window rate limiter.
//
// Caveat: on Vercel serverless this is per-instance, so a determined attacker
// can hit you N×instances. It defends against the common case (one IP spamming
// from a script) but is not a hard quota. For strict global limits, swap to
// Upstash/Vercel KV later — keep the same getClientIp + rateLimit interface.

interface Bucket {
  hits: number[]; // unix ms timestamps within the window
}

// Use globalThis so the bucket map survives Next.js dev-mode HMR reloads.
// In production this is just a per-instance module-scoped Map.
const globalForRateLimit = globalThis as unknown as { __rl_buckets?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = globalForRateLimit.__rl_buckets ?? new Map();
globalForRateLimit.__rl_buckets = buckets;

const MAX_BUCKETS = 5000;

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

/**
 * Sliding-window rate limit. Returns null if allowed, NextResponse(429) if blocked.
 *
 * @param req incoming request
 * @param scope namespace key, e.g. 'reading' so /api/reading and /api/draw don't share
 * @param limit max requests per window
 * @param windowMs window size in ms
 */
export function rateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  // In dev the same browser tab can fire duplicate requests (React StrictMode
  // mounts effects twice). Skipping rate-limit here keeps local iteration fast
  // — production still enforces.
  if (process.env.NODE_ENV !== 'production') return null;

  const ip = getClientIp(req);
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const cutoff = now - windowMs;

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter(t => t > cutoff);

  if (bucket.hits.length >= limit) {
    const retryAfter = Math.ceil((bucket.hits[0] + windowMs - now) / 1000);
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: 'Too many requests. Please slow down.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, retryAfter)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  if (buckets.size > MAX_BUCKETS) {
    // Drop the oldest half when we exceed cap. Cheap LRU-ish eviction.
    const drop = Math.floor(buckets.size / 2);
    let i = 0;
    for (const k of buckets.keys()) {
      if (i++ >= drop) break;
      buckets.delete(k);
    }
  }

  return null;
}
