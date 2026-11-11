import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/server/auth';
import { updateStudent, getStudentById } from '@/lib/server/data-store';

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, updates } = await req.json();
    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing student ID or updates' }, { status: 400 });
    }

    const success = updateStudent(id, updates);
    if (!success) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updated = getStudentById(id);
    return NextResponse.json({ success: true, student: updated });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}
