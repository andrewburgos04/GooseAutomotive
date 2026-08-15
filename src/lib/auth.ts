import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "techsync_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "techsync-dev-secret"
  );
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "techsync-admin";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const [, expRaw] = payload.split(":");
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return true;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE_NAME)?.value);
}

export async function setAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
