import WebSocket from 'ws';

// ============================================
// OpenClaw Gateway WebSocket Client
// ============================================
// Kommuniziert mit OpenClaw's Gateway via WebSocket
// Protocol: JSON frames {type, id, method, params}
// ============================================

// Use IP address directly since container hostname DNS doesn't work cross-network
// Can be overridden via OPENCLAW_WS_URL env var
const OPENCLAW_WS_URL = process.env.OPENCLAW_WS_URL || 'ws://10.0.5.2:18789';

interface OpenClawRequest {
  type: 'req';
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

interface OpenClawResponse {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: { code: number; message: string };
}

interface CronJob {
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

interface SchedulerStatus {
  enabled: boolean;
  jobs: CronJob[];
  nextWake?: string;
}

// Generate unique request ID
let requestCounter = 0;
function generateId(): string {
  return `dashboard-${Date.now()}-${++requestCounter}`;
}

// Send a request to OpenClaw and wait for response
async function sendRequest<T>(method: string, params?: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(OPENCLAW_WS_URL);
    const requestId = generateId();
    let responded = false;

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        ws.close();
        reject(new Error('OpenClaw request timeout'));
      }
    }, 10000);

    ws.on('open', () => {
      const request: OpenClawRequest = {
        type: 'req',
        id: requestId,
        method,
        params,
      };
      ws.send(JSON.stringify(request));
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString()) as OpenClawResponse;

        // Only handle our response
        if (message.type === 'res' && message.id === requestId) {
          responded = true;
          clearTimeout(timeout);
          ws.close();

          if (message.ok) {
            resolve(message.payload as T);
          } else {
            reject(new Error(message.error?.message || 'OpenClaw request failed'));
          }
        }
      } catch {
        // Ignore parse errors for other messages
      }
    });

    ws.on('error', (error) => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        reject(error);
      }
    });

    ws.on('close', () => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        reject(new Error('WebSocket closed before response'));
      }
    });
  });
}

// ============================================
// Public API
// ============================================

export async function getCronJobs(): Promise<CronJob[]> {
  try {
    const result = await sendRequest<{ jobs: CronJob[] }>('cron.list');
    return result.jobs || [];
  } catch (error) {
    console.error('Failed to get cron jobs:', error);
    return [];
  }
}

export async function getSchedulerStatus(): Promise<SchedulerStatus | null> {
  try {
    const result = await sendRequest<SchedulerStatus>('cron.status');
    return result;
  } catch (error) {
    console.error('Failed to get scheduler status:', error);
    return null;
  }
}

export async function getSessionStatus(): Promise<{ sessions: unknown[] } | null> {
  try {
    const result = await sendRequest<{ sessions: unknown[] }>('sessions.list');
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

export type { CronJob, SchedulerStatus };
