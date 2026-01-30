import { NextResponse } from 'next/server';
import { tasksDB } from '@/lib/db';

// ============================================
// TASKS API - READ ONLY
// ============================================
// Das Dashboard zeigt nur was Buddy in PostgreSQL gespeichert hat.
// Änderungen erfolgen über Telegram Chat → Buddy → Notion → PostgreSQL
// ============================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let tasks;
    if (status) {
      tasks = await tasksDB.getByStatus(status);
    } else {
      tasks = await tasksDB.getAll();
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
