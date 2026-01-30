import { NextResponse } from 'next/server';
import { activityDB } from '@/lib/db';
import { ActivityType } from '@/types';

// ============================================
// ACTIVITY LOG API - PostgreSQL Integration
// ============================================
// GET: Dashboard zeigt chronologisches Aktivitätsprotokoll
// POST: Moltbot oder Dashboard loggen neue Aktivitäten
// ============================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') as ActivityType | null;

    const result = await activityDB.getAll({
      limit,
      offset,
      type: type || undefined,
    });

    return NextResponse.json({
      entries: result.entries,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.message) {
      return NextResponse.json(
        { error: 'type and message are required' },
        { status: 400 }
      );
    }

    const newEntry = await activityDB.log({
      type: body.type,
      message: body.message,
      details: body.details,
      metadata: body.metadata,
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating activity log entry:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log entry' },
      { status: 500 }
    );
  }
}
