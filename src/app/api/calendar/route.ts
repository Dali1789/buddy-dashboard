import { NextResponse } from 'next/server';
import { eventsDB } from '@/lib/db';

// ============================================
// CALENDAR API - PostgreSQL (von Moltbot synchronisiert)
// ============================================
// Das Dashboard zeigt Events, die Moltbot aus Notion
// in die lokale PostgreSQL synchronisiert hat.
// Moltbot ist für den Sync verantwortlich, nicht das Dashboard!
// ============================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '14');
    const todayOnly = searchParams.get('today') === 'true';

    if (todayOnly) {
      const events = await eventsDB.getToday();
      return NextResponse.json(events);
    }

    const events = await eventsDB.getUpcoming(days);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
