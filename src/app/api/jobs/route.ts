import { NextResponse } from 'next/server';
import { jobsDB } from '@/lib/db';
import { syncJobs } from '@/lib/sync-service';

// ============================================
// SCHEDULED JOBS API - Live OpenClaw Sync
// ============================================
// GET: Sync von OpenClaw, dann aus PostgreSQL lesen
// PUT: Jobs aktivieren/deaktivieren
// POST: Job-Status nach Ausführung updaten
// ============================================

export async function GET() {
  try {
    // Sync from OpenClaw first (non-blocking if it fails)
    await syncJobs().catch((err) => {
      console.warn('[Jobs API] Sync failed, using cached data:', err.message);
    });

    // Return jobs from PostgreSQL
    const jobs = await jobsDB.getAll();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching scheduled jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled jobs' },
      { status: 500 }
    );
  }
}

// Toggle job enabled/disabled
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, enabled } = body;

    if (!id || enabled === undefined) {
      return NextResponse.json(
        { error: 'id and enabled are required' },
        { status: 400 }
      );
    }

    await jobsDB.toggle(id, enabled);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating scheduled job:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled job' },
      { status: 500 }
    );
  }
}

// Update job status (called by Moltbot after job execution)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status, error: jobError } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    await jobsDB.updateStatus(id, status, jobError);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
}
