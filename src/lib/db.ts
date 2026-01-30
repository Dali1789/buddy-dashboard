import { Pool, PoolClient } from 'pg';

// ============================================
// MOLTBOT DATABASE CONNECTION
// ============================================
// Das Dashboard verbindet sich mit der EXISTIERENDEN Moltbot PostgreSQL Datenbank
// Container: moltbot_postrtres
// Database: moltbot
//
// DATABASE_URL Format:
// postgresql://moltbot:<password>@moltbot_postrtres:5432/moltbot
//
// WICHTIG: Die Tabellen (bot_status, activity_log, etc.) müssen einmalig
// mit dem Schema aus /dashboard/sql/schema.sql erstellt werden.
// ============================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback für Moltbot-Defaults:
  host: process.env.DB_HOST || 'moltbot_postrtres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'moltbot',
  user: process.env.DB_USER || 'moltbot',
  password: process.env.DB_PASSWORD,

  // Connection pool settings
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Database connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Query helper with automatic client release
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 100ms)
    if (duration > 100) {
      console.log('Slow query:', { text, duration, rows: result.rowCount });
    }

    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
}

// Get a client for transactions
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

// Transaction helper
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Export pool for direct access if needed
export { pool };

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('Database pool closed');
}

// ============================================
// Typed Query Helpers
// ============================================

import {
  BotState,
  BotStatus,
  ActivityEntry,
  ActivityType,
  DashboardNote,
  ScheduledJob,
  KanbanTask,
  CalendarEvent,
} from '@/types';

// Bot Status
export const botStatusDB = {
  async get(): Promise<BotState | null> {
    const { rows } = await query<{
      status: BotStatus;
      current_task: string | null;
      sub_agents: unknown[];
      last_heartbeat: Date;
      uptime_start: Date;
    }>('SELECT * FROM bot_status WHERE id = 1');

    if (rows.length === 0) return null;

    const row = rows[0];
    const uptimeSeconds = Math.floor(
      (Date.now() - new Date(row.uptime_start).getTime()) / 1000
    );

    return {
      status: row.status,
      currentTask: row.current_task,
      subAgents: row.sub_agents as BotState['subAgents'],
      lastActivity: row.last_heartbeat?.toISOString() || new Date().toISOString(),
      uptime: uptimeSeconds,
    };
  },

  async update(updates: Partial<{
    status: BotStatus;
    currentTask: string | null;
    subAgents: unknown[];
  }>): Promise<void> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      sets.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.currentTask !== undefined) {
      sets.push(`current_task = $${paramIndex++}`);
      values.push(updates.currentTask);
    }
    if (updates.subAgents !== undefined) {
      sets.push(`sub_agents = $${paramIndex++}`);
      values.push(JSON.stringify(updates.subAgents));
    }

    sets.push(`last_heartbeat = NOW()`);

    await query(
      `UPDATE bot_status SET ${sets.join(', ')} WHERE id = 1`,
      values
    );
  },

  async heartbeat(): Promise<void> {
    await query(
      `UPDATE bot_status SET last_heartbeat = NOW(), status = 'idle' WHERE id = 1`
    );
  },
};

// Activity Log
export const activityDB = {
  async getAll(params?: {
    limit?: number;
    offset?: number;
    type?: ActivityType;
  }): Promise<{ entries: ActivityEntry[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (params?.type) {
      conditions.push(`type = $${paramIndex++}`);
      values.push(params.type);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) FROM activity_log ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get entries
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    values.push(limit, offset);

    const { rows } = await query<{
      id: string;
      type: ActivityType;
      message: string;
      details: string | null;
      timestamp: Date;
    }>(
      `SELECT * FROM activity_log ${whereClause}
       ORDER BY timestamp DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );

    return {
      entries: rows.map((row) => ({
        id: row.id,
        type: row.type,
        message: row.message,
        details: row.details || undefined,
        timestamp: row.timestamp.toISOString(),
      })),
      total,
    };
  },

  async log(entry: {
    type: ActivityType;
    message: string;
    details?: string;
    metadata?: unknown;
  }): Promise<ActivityEntry> {
    const { rows } = await query<{
      id: string;
      type: ActivityType;
      message: string;
      details: string | null;
      timestamp: Date;
    }>(
      `INSERT INTO activity_log (type, message, details, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [entry.type, entry.message, entry.details, entry.metadata ? JSON.stringify(entry.metadata) : null]
    );

    const row = rows[0];
    return {
      id: row.id,
      type: row.type,
      message: row.message,
      details: row.details || undefined,
      timestamp: row.timestamp.toISOString(),
    };
  },
};

// Dashboard Notes
export const notesDB = {
  async getAll(): Promise<DashboardNote[]> {
    const { rows } = await query<{
      id: string;
      notion_id: string;
      content: string;
      tags: string[];
      created_at: Date;
      seen_at: Date | null;
      seen_by_bot: boolean;
      bot_response: string | null;
    }>(
      `SELECT * FROM dashboard_notes
       WHERE 'Buddy' = ANY(tags)
       ORDER BY created_at DESC`
    );

    return rows.map((row) => ({
      id: row.id,
      notionId: row.notion_id,
      content: row.content,
      tags: row.tags,
      createdAt: row.created_at.toISOString(),
      seenAt: row.seen_at?.toISOString(),
      seenByBot: row.seen_by_bot,
      response: row.bot_response || undefined,
    }));
  },

  async create(content: string, notionId?: string, tags: string[] = ['Buddy']): Promise<DashboardNote> {
    const { rows } = await query<{
      id: string;
      notion_id: string;
      content: string;
      tags: string[];
      created_at: Date;
      seen_by_bot: boolean;
    }>(
      `INSERT INTO dashboard_notes (content, notion_id, tags)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [content, notionId, tags]
    );

    const row = rows[0];
    return {
      id: row.id,
      notionId: row.notion_id,
      content: row.content,
      tags: row.tags,
      createdAt: row.created_at.toISOString(),
      seenByBot: row.seen_by_bot,
    };
  },

  async markSeen(id: string, response?: string): Promise<void> {
    await query(
      `UPDATE dashboard_notes
       SET seen_by_bot = TRUE, seen_at = NOW(), bot_response = $2
       WHERE id = $1 OR notion_id = $1`,
      [id, response]
    );
  },
};

// Scheduled Jobs
export const jobsDB = {
  async getAll(): Promise<ScheduledJob[]> {
    const { rows } = await query<{
      id: string;
      name: string;
      description: string;
      frequency: string;
      cron_expression: string;
      enabled: boolean;
      last_run: Date | null;
      next_run: Date | null;
      last_status: string;
      output_folder: string | null;
    }>('SELECT * FROM scheduled_jobs ORDER BY name');

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      frequency: row.frequency as ScheduledJob['frequency'],
      cronExpression: row.cron_expression,
      enabled: row.enabled,
      lastRun: row.last_run?.toISOString(),
      nextRun: row.next_run?.toISOString(),
      lastStatus: row.last_status as ScheduledJob['lastStatus'],
      outputFolder: row.output_folder || undefined,
    }));
  },

  async toggle(id: string, enabled: boolean): Promise<void> {
    await query(
      'UPDATE scheduled_jobs SET enabled = $2 WHERE id = $1',
      [id, enabled]
    );
  },

  async updateStatus(id: string, status: string, error?: string): Promise<void> {
    await query(
      `UPDATE scheduled_jobs
       SET last_status = $2, last_error = $3, last_run = NOW()
       WHERE id = $1`,
      [id, status, error]
    );
  },
};

// ============================================
// Kanban Tasks (von Moltbot synchronisiert)
// ============================================
export const tasksDB = {
  async getAll(): Promise<KanbanTask[]> {
    const { rows } = await query<{
      id: string;
      notion_id: string | null;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      wichtig: boolean;
      dringend: boolean;
      due_date: Date | null;
      bereich: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT * FROM kanban_tasks
       WHERE status != 'Done' OR updated_at > NOW() - INTERVAL '7 days'
       ORDER BY
         CASE priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'medium' THEN 3
           ELSE 4
         END,
         due_date ASC NULLS LAST`
    );

    return rows.map((row) => ({
      id: row.id,
      notionId: row.notion_id || undefined,
      title: row.title,
      description: row.description || undefined,
      status: row.status as KanbanTask['status'],
      priority: row.priority as KanbanTask['priority'],
      wichtig: row.wichtig,
      dringend: row.dringend,
      dueDate: row.due_date?.toISOString().split('T')[0],
      bereich: row.bereich || undefined,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }));
  },

  async getByStatus(status: string): Promise<KanbanTask[]> {
    const { rows } = await query<{
      id: string;
      notion_id: string | null;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      wichtig: boolean;
      dringend: boolean;
      due_date: Date | null;
      bereich: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT * FROM kanban_tasks WHERE status = $1 ORDER BY due_date ASC NULLS LAST`,
      [status]
    );

    return rows.map((row) => ({
      id: row.id,
      notionId: row.notion_id || undefined,
      title: row.title,
      description: row.description || undefined,
      status: row.status as KanbanTask['status'],
      priority: row.priority as KanbanTask['priority'],
      wichtig: row.wichtig,
      dringend: row.dringend,
      dueDate: row.due_date?.toISOString().split('T')[0],
      bereich: row.bereich || undefined,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }));
  },
};

// ============================================
// Calendar Events (von Moltbot synchronisiert)
// ============================================
export const eventsDB = {
  async getUpcoming(days: number = 14): Promise<CalendarEvent[]> {
    const { rows } = await query<{
      id: string;
      notion_id: string | null;
      name: string;
      event_date: Date;
      event_time: string | null;
      priority: string;
      event_type: string;
      meeting_place: string | null;
      meeting_link: string | null;
      main_topic: string | null;
    }>(
      `SELECT * FROM calendar_events
       WHERE event_date >= CURRENT_DATE
         AND event_date <= CURRENT_DATE + $1 * INTERVAL '1 day'
       ORDER BY event_date ASC, event_time ASC NULLS LAST`,
      [days]
    );

    const today = new Date().toISOString().split('T')[0];

    return rows.map((row) => {
      const eventDate = row.event_date.toISOString().split('T')[0];
      const daysUntil = Math.ceil(
        (new Date(eventDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: row.id,
        notionId: row.notion_id || undefined,
        name: row.name,
        date: eventDate,
        time: row.event_time || undefined,
        priority: row.priority as CalendarEvent['priority'],
        type: row.event_type as CalendarEvent['type'],
        meetingPlace: (row.meeting_place as CalendarEvent['meetingPlace']) || undefined,
        meetingLink: row.meeting_link || undefined,
        mainTopic: row.main_topic || undefined,
        isToday: eventDate === today,
        upcomingInDays: daysUntil,
      };
    });
  },

  async getToday(): Promise<CalendarEvent[]> {
    const { rows } = await query<{
      id: string;
      notion_id: string | null;
      name: string;
      event_date: Date;
      event_time: string | null;
      priority: string;
      event_type: string;
      meeting_place: string | null;
      meeting_link: string | null;
      main_topic: string | null;
    }>(
      `SELECT * FROM calendar_events
       WHERE event_date = CURRENT_DATE
       ORDER BY event_time ASC NULLS LAST`
    );

    const today = new Date().toISOString().split('T')[0];

    return rows.map((row) => ({
      id: row.id,
      notionId: row.notion_id || undefined,
      name: row.name,
      date: today,
      time: row.event_time || undefined,
      priority: row.priority as CalendarEvent['priority'],
      type: row.event_type as CalendarEvent['type'],
      meetingPlace: (row.meeting_place as CalendarEvent['meetingPlace']) || undefined,
      meetingLink: row.meeting_link || undefined,
      mainTopic: row.main_topic || undefined,
      isToday: true,
      upcomingInDays: 0,
    }));
  },
};
