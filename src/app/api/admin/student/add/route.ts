import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/server/auth';
import { addStudent } from '@/lib/server/data-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = addStudent(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to add student' }, { status: 400 });
    }
    return NextResponse.json({ success: true, student: result.student });
  } catch (error: any) {
    console.error('Add student error:', error);
    return NextResponse.json({ error: 'Server error adding student' }, { status: 500 });
  }
}

