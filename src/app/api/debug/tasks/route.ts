import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// DEBUG: See raw status values from database
export async function GET() {
  try {
    const result = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count FROM kanban_tasks GROUP BY status ORDER BY count DESC`
    );

    const sample = await query<{ title: string; status: string }>(
      `SELECT title, status FROM kanban_tasks LIMIT 10`
    );

    return NextResponse.json({
      statusCounts: result.rows,
      sampleTasks: sample.rows,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
