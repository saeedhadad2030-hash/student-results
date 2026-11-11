import { NextResponse } from 'next/server';
import { clearAuthCookie, ADMIN_COOKIE_NAME } from '@/lib/server/auth';

export async function POST() {
  clearAuthCookie(ADMIN_COOKIE_NAME);
  return NextResponse.json({ success: true });
}
