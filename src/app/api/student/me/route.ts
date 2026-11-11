import { NextResponse } from 'next/server';
import { getCurrentStudent } from '@/lib/server/auth';
import { getStudentById, isResultsPublished } from '@/lib/server/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentStudent();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    if (!isResultsPublished()) {
      return NextResponse.json(
        { error: 'Results are currently under review by school administration.' },
        { status: 403 }
      );
    }

    const student = getStudentById(session.studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // Return only safe student-facing fields (English Name, Academic Year, Subjects, Overall)
    return NextResponse.json({
      student: {
        id: student.id,
        roll_no: student.roll_no,
        name_en: student.name_en,
        year: student.year,
        subjects: student.subjects,
        overall: student.overall,
      },
    });
  } catch (error) {
    console.error('Fetch student error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
