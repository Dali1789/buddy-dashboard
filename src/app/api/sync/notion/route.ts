import { NextResponse } from 'next/server';
import { syncAll, syncTasks, syncCalendar } from '@/lib/notion-sync';

// GET /api/sync/notion - Trigger sync
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'tasks', 'calendar', or null for all

    let result;

    if (type === 'tasks') {
      const tasks = await syncTasks();
      result = { tasks, calendar: null };
    } else if (type === 'calendar') {
      const calendar = await syncCalendar();
      result = { tasks: null, calendar };
    } else {
      result = await syncAll();
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      result,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/sync/notion - Trigger sync (alternative method)
export async function POST() {
  try {
    const result = await syncAll();
    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      result,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
