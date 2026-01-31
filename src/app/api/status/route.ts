import { NextResponse } from 'next/server';
import { botStatusDB, jobsDB } from '@/lib/db';
import { BotState } from '@/types';

// ============================================
// BOT STATUS API - PostgreSQL
// ============================================
// GET: Holt Status aus der PostgreSQL Datenbank
// PUT: Aktualisiert Heartbeat
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
    // Get status from PostgreSQL
    const status = await botStatusDB.get();

    if (!status) {
      return NextResponse.json(OFFLINE_STATE);
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching bot status from database:', error);
    return NextResponse.json(OFFLINE_STATE);
  }
}

// Heartbeat check / update
export async function PUT() {
  try {
    // Update heartbeat in database
    await botStatusDB.heartbeat();

    // Get job count
    const jobs = await jobsDB.getAll();
    const enabledJobs = jobs.filter(j => j.enabled);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      schedulerEnabled: enabledJobs.length > 0,
      jobCount: enabledJobs.length,
    });
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to update heartbeat' },
      { status: 500 }
    );
  }
}
