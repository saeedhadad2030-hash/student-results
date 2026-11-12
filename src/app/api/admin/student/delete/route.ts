import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/server/auth';
import { deleteStudent } from '@/lib/server/data-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const result = deleteStudent(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to delete student' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Server error deleting student' }, { status: 500 });
  }
}

