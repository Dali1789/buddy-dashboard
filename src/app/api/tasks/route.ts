import { NextResponse } from 'next/server';
import { getTasksFromNotion } from '@/lib/notion';

// ============================================
// TASKS API - NOTION DIRECT
// ============================================
// Das Dashboard liest jetzt direkt aus Notion
// Gleiche Datenquelle wie der Bot!
// ============================================

export async function GET() {
  try {
    const tasks = await getTasksFromNotion();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks from Notion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks from Notion' },
      { status: 500 }
    );
  }
}
