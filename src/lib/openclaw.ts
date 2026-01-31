// ============================================
// OpenClaw Gateway HTTP Client
// ============================================
// Kommuniziert mit OpenClaw's Gateway via HTTP /tools/invoke API
// Einfacher und zuverlässiger als WebSocket
// ============================================

// Use IP address directly since container hostname DNS doesn't work cross-network
const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://10.0.5.2:18789';
// Gateway token for authentication
const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || 'd405662297a58df924f621a74a491cc48abbcc421550402ef6cb2fe9fc397b94';

interface OpenClawJob {
  id: string;
  agentId: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr: string;
    tz: string;
  };
  sessionTarget: string;
  wakeMode: string;
  payload: {
    kind: string;
    text: string;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
  };
}

interface OpenClawSession {
  key: string;
  kind: string;
  channel: string;
  displayName: string;
  updatedAt: number;
  sessionId: string;
  model: string;
}

// Exported types for sync-service
export interface CronJob {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  systemText?: string;
  agent?: string;
  wakeMode?: string;
  nextRun?: string;
  lastRun?: string;
  lastStatus?: string;
}

export interface SchedulerStatus {
  enabled: boolean;
  jobs: CronJob[];
  nextWake?: string;
}

// Invoke a tool via HTTP API
async function invokeTool<T>(tool: string, args?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${OPENCLAW_URL}/tools/invoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
    },
    body: JSON.stringify({ tool, args }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error?.message || 'Tool invocation failed');
  }

  return data.result?.details || data.result;
}

// Transform OpenClaw job format to our format
function transformJob(job: OpenClawJob): CronJob {
  return {
    id: job.id,
    name: job.name,
    cron: job.schedule.expr,
    enabled: job.enabled,
    systemText: job.payload?.text,
    agent: job.agentId,
    wakeMode: job.wakeMode,
    nextRun: job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toISOString() : undefined,
    lastRun: job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toISOString() : undefined,
    lastStatus: job.state?.lastStatus,
  };
}

// ============================================
// Public API
// ============================================

export async function getCronJobs(): Promise<CronJob[]> {
  try {
    const result = await invokeTool<{ jobs: OpenClawJob[] }>('cron', { action: 'list' });
    return (result.jobs || []).map(transformJob);
  } catch (error) {
    console.error('Failed to get cron jobs:', error);
    return [];
  }
}

export async function getSchedulerStatus(): Promise<SchedulerStatus | null> {
  try {
    const jobs = await getCronJobs();

    // Find next scheduled run
    const nextRuns = jobs
      .filter(j => j.enabled && j.nextRun)
      .map(j => new Date(j.nextRun!).getTime())
      .sort((a, b) => a - b);

    return {
      enabled: jobs.some(j => j.enabled),
      jobs,
      nextWake: nextRuns[0] ? new Date(nextRuns[0]).toISOString() : undefined,
    };
  } catch (error) {
    console.error('Failed to get scheduler status:', error);
    return null;
  }
}

export async function getSessionStatus(): Promise<{ sessions: OpenClawSession[] } | null> {
  try {
    const result = await invokeTool<{ sessions: OpenClawSession[] }>('sessions_list');
    return result;
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return null;
  }
}

// Combine status from multiple sources
export async function getBotStatus(): Promise<{
  schedulerEnabled: boolean;
  jobCount: number;
  nextWake: string | null;
  activeSessions: number;
}> {
  try {
    const [scheduler, sessions] = await Promise.all([
      getSchedulerStatus(),
      getSessionStatus(),
    ]);

    return {
      schedulerEnabled: scheduler?.enabled ?? false,
      jobCount: scheduler?.jobs?.length ?? 0,
      nextWake: scheduler?.nextWake ?? null,
      activeSessions: sessions?.sessions?.length ?? 0,
    };
  } catch {
    return {
      schedulerEnabled: false,
      jobCount: 0,
      nextWake: null,
      activeSessions: 0,
    };
  }
}
