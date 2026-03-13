import { NextResponse } from 'next/server';
import { incrementViews } from '../../../lib/stats';

export const dynamic = 'force-dynamic';

export async function POST() {
  const views = await incrementViews();
  return NextResponse.json({ views }, { status: 200 });
}
