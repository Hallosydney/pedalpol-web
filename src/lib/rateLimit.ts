import crypto from "crypto";

const ipBuckets = new Map<string, number[]>();

export function extractClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "127.0.0.1";
}

export function hashClientIp(request: Request): string {
  const ip = extractClientIp(request);
  const salt = process.env.IP_HASH_SALT || "pedalpol-ip-salt-v1";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
}

/**
 * Sliding-window rate limit per hashed IP + action key.
 * Returns true if allowed, false if rate-limited.
 */
export function checkRateLimit(
  key: string,
  maxRequests = 12,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const timestamps = (ipBuckets.get(key) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    ipBuckets.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  ipBuckets.set(key, timestamps);
  return true;
}
