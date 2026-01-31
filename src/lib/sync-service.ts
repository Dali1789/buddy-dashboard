import { getCronJobs, getBotStatus, CronJob } from './openclaw';
import { query } from './db';

// ============================================
// SYNC SERVICE: OpenClaw → PostgreSQL
// ============================================
// Synchronisiert Live-Daten von OpenClaw WebSocket
// in die PostgreSQL Datenbank für das Dashboard
// ============================================

// Parse frequency from cron expression
function parseFrequency(cron: string): string {
  if (cron.includes('*/')) {
    const parts = cron.split(' ');
    if (parts[0].startsWith('*/')) return 'minutely';
    if (parts[1].startsWith('*/')) return 'hourly';
    return 'custom';
  }

  const parts = cron.split(' ');
  if (parts.length !== 5) return 'custom';

  const [, , dayOfMonth, month, dayOfWeek] = parts;

  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'daily';
  }
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    return 'weekly';
  }
  if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
    return 'monthly';
  }

  return 'custom';
}

// Transform OpenClaw job to PostgreSQL format
function transformJob(job: CronJob) {
  return {
    id: job.id,
    name: job.name,
    cron_expression: job.cron,
    frequency: parseFrequency(job.cron),
    enabled: job.enabled,
    description: job.systemText || '',
    next_run: job.nextRun || null,
    last_run: job.lastRun || null,
    last_status: job.lastStatus || 'pending',
  };
}

// Sync jobs from OpenClaw to PostgreSQL
export async function syncJobs(): Promise<{ synced: number; error?: string }> {
  try {
    const jobs = await getCronJobs();

    if (jobs.length === 0) {
      return { synced: 0 };
    }

    for (const job of jobs) {
      const data = transformJob(job);

      await query(
        `INSERT INTO scheduled_jobs (id, name, cron_expression, frequency, enabled, description, next_run, last_run, last_status, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           cron_expression = EXCLUDED.cron_expression,
           frequency = EXCLUDED.frequency,
           enabled = EXCLUDED.enabled,
           description = EXCLUDED.description,
           next_run = EXCLUDED.next_run,
           last_run = EXCLUDED.last_run,
           last_status = EXCLUDED.last_status,
           updated_at = NOW()`,
        [
          data.id,
          data.name,
          data.cron_expression,
          data.frequency,
          data.enabled,
          data.description,
          data.next_run,
          data.last_run,
          data.last_status,
        ]
      );
    }

    console.log(`[Sync] Synced ${jobs.length} jobs from OpenClaw`);
    return { synced: jobs.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Sync] Failed to sync jobs:', message);
    return { synced: 0, error: message };
  }
}

// Sync bot status from OpenClaw to PostgreSQL
export async function syncBotStatus(): Promise<{ status: string; error?: string }> {
  try {
    const status = await getBotStatus();

    // Determine bot status based on OpenClaw state
    let botStatus: string;
    if (status.activeSessions > 0) {
      botStatus = 'working';
    } else if (status.schedulerEnabled) {
      botStatus = 'idle';
    } else {
      botStatus = 'sleeping';
    }

    await query(
      `UPDATE bot_status SET
         status = $1,
         last_heartbeat = NOW(),
         updated_at = NOW()
       WHERE id = 1`,
      [botStatus]
    );

    console.log(`[Sync] Bot status: ${botStatus}`);
    return { status: botStatus };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Sync] Failed to sync bot status:', message);
    return { status: 'offline', error: message };
  }
}

// Full sync - jobs and status
export async function syncAll(): Promise<void> {
  try {
    const [jobsResult, statusResult] = await Promise.all([
      syncJobs(),
      syncBotStatus(),
    ]);

    if (jobsResult.error || statusResult.error) {
      console.warn('[Sync] Partial sync - some errors occurred');
    } else {
      console.log('[Sync] OpenClaw → PostgreSQL completed successfully');
    }
  } catch (error) {
    console.error('[Sync] Full sync failed:', error);
  }
}
