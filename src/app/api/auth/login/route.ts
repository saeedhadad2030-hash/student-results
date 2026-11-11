import { NextRequest, NextResponse } from 'next/server';
import { lookupByLoginCode, isResultsPublished } from '@/lib/server/data-store';
import { createStudentToken, setAuthCookie, STUDENT_COOKIE_NAME, checkRateLimit } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`login_${ip}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimit.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const code = body.code?.trim();

    if (!code) {
      return NextResponse.json({ error: 'Please enter your login code.' }, { status: 400 });
    }

    if (!isResultsPublished()) {
      return NextResponse.json(
        { error: 'Results are currently under administrative review and will be published shortly.' },
        { status: 403 }
      );
    }

    const result = lookupByLoginCode(code);

    if (result.status === 'not_found') {
      return NextResponse.json({ error: 'Invalid Login Code' }, { status: 401 });
    }

    if (result.status === 'collision') {
      return NextResponse.json({
        collision: true,
        message: 'Multiple students match this code. Please verify your Academic Year and Birth Date.',
        count: result.count,
        candidates: result.candidates,
      });
    }

    // Found unique student
    const student = result.student;
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
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
