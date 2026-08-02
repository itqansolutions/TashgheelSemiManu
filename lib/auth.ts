// ============================================================
// Tashgheel — Authentication Library
// JWT (Access + Refresh) + bcrypt + Session Management
// ============================================================

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { env } from "./env";

// ─── Token Types ────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  companyId: string;
  branchId?: string;
  roleId: string;
  email: string;
  name: string;
  sessionId: string;
}

export interface AuthSession extends TokenPayload {
  isOwner: boolean;
}

// ─── Constants ───────────────────────────────────────────────

const ACCESS_COOKIE = "tashgheel_access";
const REFRESH_COOKIE = "tashgheel_refresh";

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

// ─── Password ────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Access Token (15 min) ───────────────────────────────────

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES)
    .sign(accessSecret);
}

export async function verifyAccessToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Refresh Token (7 days) ──────────────────────────────────

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES)
    .sign(refreshSecret);
}

export async function verifyRefreshToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Cookies ─────────────────────────────────────────────────

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAccessTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value ?? null;
}

// ─── Current Session ─────────────────────────────────────────

export async function getCurrentSession(): Promise<TokenPayload | null> {
  const token = await getAccessTokenFromCookie();
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function requireSession(): Promise<TokenPayload> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("غير مصرح");
  }
  return session;
}

// ─── Device Info Parser ──────────────────────────────────────

export function parseDeviceInfo(userAgent: string): {
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
} {
  const ua = userAgent.toLowerCase();

  const deviceType = /mobile|android|iphone|ipad/i.test(ua)
    ? "Mobile"
    : "Desktop";

  const browser = ua.includes("chrome")
    ? "Chrome"
    : ua.includes("firefox")
    ? "Firefox"
    : ua.includes("safari")
    ? "Safari"
    : ua.includes("edge")
    ? "Edge"
    : "Unknown";

  const os = ua.includes("windows")
    ? "Windows"
    : ua.includes("mac")
    ? "macOS"
    : ua.includes("linux")
    ? "Linux"
    : ua.includes("android")
    ? "Android"
    : ua.includes("ios")
    ? "iOS"
    : "Unknown";

  return {
    deviceName: `${browser} on ${os}`,
    deviceType,
    browser,
    os,
  };
}
