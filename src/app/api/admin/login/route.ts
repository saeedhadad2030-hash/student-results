import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, setAuthCookie, ADMIN_COOKIE_NAME, checkRateLimit } from '@/lib/server/auth';

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Admin@IPS2025#Results';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`admin_login_${ip}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rateLimit.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = await createAdminToken(username);
      setAuthCookie(ADMIN_COOKIE_NAME, token, 28800); // 8 hours
      return NextResponse.json({ success: true, username });
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
