import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { StudentSession, AdminSession } from '@/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ips-school-results-super-secure-key-2025-international-portal'
);

export const STUDENT_COOKIE_NAME = 'ips_student_token';
export const ADMIN_COOKIE_NAME = 'ips_admin_token';

// Simple in-memory rate limiter for login protection
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}

// Student Token
export async function createStudentToken(studentId: string, year: string, name_en: string): Promise<string> {
  return await new SignJWT({ studentId, year, name_en })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET_KEY);
}

export async function verifyStudentToken(token: string): Promise<StudentSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as StudentSession;
  } catch (err) {
    return null;
  }
}

// Admin Token
export async function createAdminToken(username: string): Promise<string> {
  return await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET_KEY);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (payload.role !== 'admin') return null;
    return payload as unknown as AdminSession;
  } catch (err) {
    return null;
  }
}

// Cookie Helpers
export function setAuthCookie(name: string, token: string, maxAgeSec = 7200) {
  const cookieStore = cookies();
  cookieStore.set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSec,
  });
}

export function clearAuthCookie(name: string) {
  const cookieStore = cookies();
  cookieStore.delete(name);
}

export async function getCurrentStudent(): Promise<StudentSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyStudentToken(token);
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

