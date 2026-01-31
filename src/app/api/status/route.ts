import { NextResponse } from 'next/server';
import { botStatusDB } from '@/lib/db';
import { BotState } from '@/types';
import { syncBotStatus } from '@/lib/sync-service';

// ============================================
// BOT STATUS API - Live OpenClaw Sync
// ============================================
// GET: Sync von OpenClaw, dann aus PostgreSQL lesen
// POST: Moltbot aktualisiert seinen Status (bei Heartbeat)
// PUT: Heartbeat endpoint
// ============================================

// Fallback state wenn DB nicht erreichbar
const OFFLINE_STATE: BotState = {
  status: 'offline',
  currentTask: null,
  subAgents: [],
  lastActivity: new Date().toISOString(),
  uptime: 0,
};

export async function GET() {
  try {
    // Sync from OpenClaw first (non-blocking if it fails)
    await syncBotStatus().catch((err) => {
      console.warn('[Status API] Sync failed, using cached data:', err.message);
    });

    const botState = await botStatusDB.get();

    if (!botState) {
      return NextResponse.json(OFFLINE_STATE);
    }

    return NextResponse.json(botState);
  } catch (error) {
    console.error('Error fetching bot status:', error);
    // Return offline state instead of error to keep dashboard working
    return NextResponse.json(OFFLINE_STATE);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await botStatusDB.update({
      status: body.status,
      currentTask: body.currentTask,
      subAgents: body.subAgents,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating bot status:', error);
    return NextResponse.json(
      { error: 'Failed to update bot status' },
      { status: 500 }
    );
  }
}

// Heartbeat endpoint - für Moltbot Cron
export async function PUT() {
  try {
    await botStatusDB.heartbeat();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to process heartbeat' },
      { status: 500 }
    );
  }
}
