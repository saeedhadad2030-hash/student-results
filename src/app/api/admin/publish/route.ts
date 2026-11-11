import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/server/auth';
import { setResultsPublished, isResultsPublished } from '@/lib/server/data-store';

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { isPublished } = await req.json();
    setResultsPublished(Boolean(isPublished));
    return NextResponse.json({ success: true, isPublished: isResultsPublished() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update publication status' }, { status: 500 });
  }
}

