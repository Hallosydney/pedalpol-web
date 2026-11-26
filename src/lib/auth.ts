import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "pp_admin_session";
export const RIDER_COOKIE_NAME = "pp_rider_token";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days
const RIDER_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 180; // 180 days
const DEV_DEFAULT_PASSWORD = "pedalpol2026";
const DEV_DEFAULT_SECRET = "pedalpol-dev-session-secret-change-in-production";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || DEV_DEFAULT_SECRET;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEV_DEFAULT_PASSWORD;
}

export function isUsingDefaultAdminSecurity(): boolean {
  return (
    !process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD === DEV_DEFAULT_PASSWORD ||
    !process.env.ADMIN_SESSION_SECRET
  );
}

function sha256Digest(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

export function verifyPassword(input: string): boolean {
  const expected = getAdminPassword();
  return crypto.timingSafeEqual(sha256Digest(input), sha256Digest(expected));
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = `admin:${exp}`;
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${payload}:${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [role, expStr, sig] = parts;
  if (role !== "admin") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(`${role}:${expStr}`)
    .digest("hex");

  return crypto.timingSafeEqual(sha256Digest(sig), sha256Digest(expectedSig));
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE_NAME)?.value);
}

export async function setAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE_NAME);
}

/**
 * Hashes the HttpOnly rider cookie with an app-scoped HMAC so raw cookie
 * tokens are never stored in DB or exposed in public API responses.
 */
export function hashRiderToken(rawToken: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`rider:${rawToken}`)
    .digest("hex")
    .slice(0, 32);
}

export async function getViewerRiderTokenHash(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(RIDER_COOKIE_NAME)?.value;
  if (!raw || raw.length < 16) return null;
  return hashRiderToken(raw);
}

export async function getOrIssueRiderTokenHash(): Promise<string> {
  const jar = await cookies();
  let raw = jar.get(RIDER_COOKIE_NAME)?.value;
  if (!raw || raw.length < 16) {
    raw = crypto.randomBytes(24).toString("hex");
    jar.set(RIDER_COOKIE_NAME, raw, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: RIDER_COOKIE_MAX_AGE_SEC,
    });
  }
  return hashRiderToken(raw);
}
