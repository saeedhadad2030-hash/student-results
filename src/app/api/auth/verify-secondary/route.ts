import { NextRequest, NextResponse } from 'next/server';
import { verifySecondaryLogin, isResultsPublished } from '@/lib/server/data-store';
import { createStudentToken, setAuthCookie, STUDENT_COOKIE_NAME, checkRateLimit } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`sec_verify_${ip}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please wait ${rateLimit.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { code, year, birthDate } = body;

    if (!code || !year) {
      return NextResponse.json(
        { error: 'Please select your Academic Year and enter your details.' },
        { status: 400 }
      );
    }

    if (!isResultsPublished()) {
      return NextResponse.json(
        { error: 'Results are currently under administrative review.' },
        { status: 403 }
      );
    }

    const student = verifySecondaryLogin(code, year, birthDate || '');

    if (!student) {
      return NextResponse.json(
        { error: 'Verification failed. The provided details do not match school records.' },
        { status: 401 }
      );
    }

    const token = await createStudentToken(student.id, student.year, student.name_en);
    setAuthCookie(STUDENT_COOKIE_NAME, token);

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name_en: student.name_en,
        year: student.year,
      },
    });
  } catch (error) {
    console.error('Secondary verification error:', error);
    return NextResponse.json({ error: 'Verification error' }, { status: 500 });
  }
}
