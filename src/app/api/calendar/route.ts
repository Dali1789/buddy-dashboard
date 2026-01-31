import { NextResponse } from 'next/server';
import { getEventsFromNotion } from '@/lib/notion';

// ============================================
// CALENDAR API - NOTION DIRECT
// ============================================
// Das Dashboard liest jetzt direkt aus Notion
// Gleiche Datenquelle wie der Bot!
// ============================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '14');
    const todayOnly = searchParams.get('today') === 'true';

    const events = await getEventsFromNotion(todayOnly ? 1 : days);

    if (todayOnly) {
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = events.filter(e => e.date === today);
      return NextResponse.json(todayEvents);
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events from Notion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events from Notion' },
      { status: 500 }
    );
  }
}
