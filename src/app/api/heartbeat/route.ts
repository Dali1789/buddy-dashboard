import { NextResponse } from 'next/server';
import { botStatusDB, activityDB, notesDB, tasksDB, eventsDB } from '@/lib/db';

// ============================================
// MOLTBOT HEARTBEAT API
// ============================================
// Dieser Endpoint wird von Moltbot bei jedem Heartbeat aufgerufen.
// Er arbeitet NUR mit der lokalen PostgreSQL - kein Notion!
//
// Moltbot ist verantwortlich für:
// 1. Notion → PostgreSQL Sync (VOR dem Heartbeat)
// 2. Heartbeat an diesen Endpoint senden
// 3. Auf Basis der Response agieren
// ============================================

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const timestamp = new Date().toISOString();

    // 1. Update bot status - mark as idle (alive)
    await botStatusDB.heartbeat();

    // 2. Log the heartbeat activity
    await activityDB.log({
      type: 'heartbeat',
      message: body.message || 'Heartbeat: Alle Systeme normal',
      details: body.details,
      metadata: {
        timestamp,
        source: 'moltbot',
        ...body.metadata,
      },
    });

    // 3. Get unseen notes (für Moltbot zum Verarbeiten)
    let unseenNotes: any[] = [];
    try {
      const allNotes = await notesDB.getAll();
      unseenNotes = allNotes.filter((note) => !note.seenByBot);
    } catch (err) {
      console.warn('Could not fetch notes:', err);
    }

    // 4. Get today's events
    let todayEvents: any[] = [];
    try {
      todayEvents = await eventsDB.getToday();
    } catch (err) {
      console.warn('Could not fetch today events:', err);
    }

    // 5. Get urgent/due tasks
    let urgentTasks: any[] = [];
    try {
      const allTasks = await tasksDB.getAll();
      const today = new Date().toISOString().split('T')[0];
      urgentTasks = allTasks.filter((task) => {
        if (task.priority === 'urgent') return true;
        if (task.dueDate && task.dueDate <= today && task.status !== 'Done') return true;
        return false;
      });
    } catch (err) {
      console.warn('Could not fetch tasks:', err);
    }

    // Return data for Moltbot to process
    return NextResponse.json({
      success: true,
      timestamp,
      data: {
        unseenNotes,
        todayEvents,
        urgentTasks,
        counts: {
          unseenNotes: unseenNotes.length,
          todayEvents: todayEvents.length,
          urgentTasks: urgentTasks.length,
        },
      },
    });
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to process heartbeat', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint - Health check
export async function GET() {
  try {
    const status = await botStatusDB.get();

    return NextResponse.json({
      healthy: true,
      botStatus: status?.status || 'offline',
      lastHeartbeat: status?.lastActivity,
      uptime: status?.uptime,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { healthy: false, error: 'Database connection failed' },
      { status: 503 }
    );
  }
}
