/**
 * Lightweight, high-performance in-memory sliding window rate limiter.
 * Designed for serverless Next.js route handlers.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const cache = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of cache.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 10 * 60 * 1000);
      if (record.timestamps.length === 0) {
        cache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Time window in seconds (e.g. 60 for 1 minute) */
  windowSeconds: number;
  /** Maximum allowed requests within the window */
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks if an identifier (e.g. user ID or IP address) has exceeded the rate limit.
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { windowSeconds: 60, maxRequests: 30 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = cache.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    cache.set(identifier, record);
  }

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((t) => t > cutoff);

  if (record.timestamps.length >= options.maxRequests) {
    const oldest = record.timestamps[0] ?? now;
    const resetSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  // Register current request
  record.timestamps.push(now);

  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - record.timestamps.length,
    resetSeconds: options.windowSeconds,
  };
}

/**
 * Helper to extract client identifier (IP or User ID) from NextRequest
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
