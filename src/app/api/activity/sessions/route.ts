import { NextResponse } from 'next/server';
import { activityDB } from '@/lib/db';

// ============================================
// ACTIVITY SESSIONS API
// ============================================
// GET: Liste aller Sessions mit Zusammenfassung
// GET /:sessionId: Alle Aktivitäten einer Session
// ============================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await activityDB.getSessions({ limit, offset });

    return NextResponse.json({
      sessions: result.sessions,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching activity sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity sessions' },
      { status: 500 }
    );
  }
}
