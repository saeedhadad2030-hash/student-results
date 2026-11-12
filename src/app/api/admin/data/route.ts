import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/server/auth';
import {
  getAllStudents,
  getUnmatchedRecords,
  getMatchingStats,
  isResultsPublished,
  getDisplaySettings,
} from '@/lib/server/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  const students = getAllStudents();
  const unmatched = getUnmatchedRecords();
  const stats = getMatchingStats();
  const displaySettings = getDisplaySettings();

  return NextResponse.json({
    stats,
    students,
    unmatched,
    isPublished: isResultsPublished(),
    displaySettings,
  });
}
