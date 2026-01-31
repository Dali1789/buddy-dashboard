import { NextResponse } from 'next/server';
import { jobsDB } from '@/lib/db';

// ============================================
// SCHEDULED JOBS API - PostgreSQL
// ============================================
// GET: Holt Jobs aus der PostgreSQL Datenbank
// Die Jobs werden von OpenClaw verwaltet und hierher synchronisiert
// ============================================

export async function GET() {
  try {
    // Fetch jobs from PostgreSQL
    const jobs = await jobsDB.getAll();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs from database:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled jobs from database' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, enabled } = await request.json();

    if (!id || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing id or enabled field' },
        { status: 400 }
      );
    }

    await jobsDB.toggle(id, enabled);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}
