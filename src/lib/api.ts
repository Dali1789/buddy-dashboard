import {
  BotState,
  KanbanTask,
  ActivityEntry,
  DashboardNote,
  ScheduledJob,
  Document,
  NotionTaskStatus,
  CalendarEvent,
} from '@/types';

const API_BASE = '/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// Bot Status API
export const statusAPI = {
  get: () => fetchAPI<BotState>('/status'),

  update: (status: Partial<BotState>) =>
    fetchAPI<{ success: boolean }>('/status', {
      method: 'POST',
      body: JSON.stringify(status),
    }),
};

// Tasks API (Notion Sync)
export const tasksAPI = {
  getAll: () => fetchAPI<KanbanTask[]>('/tasks'),

  create: (task: {
    title: string;
    status?: NotionTaskStatus;
    wichtig?: boolean;
    dringend?: boolean;
    dueDate?: string;
  }) =>
    fetchAPI<{ success: boolean; id: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  update: (notionId: string, updates: Partial<KanbanTask>) =>
    fetchAPI<{ success: boolean }>('/tasks', {
      method: 'PUT',
      body: JSON.stringify({ notionId, ...updates }),
    }),
};

// Activity Log API
export const activityAPI = {
  getAll: (params?: { limit?: number; offset?: number; type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.type) searchParams.set('type', params.type);

    const query = searchParams.toString();
    return fetchAPI<{ entries: ActivityEntry[]; total: number }>(
      `/activity${query ? `?${query}` : ''}`
    );
  },

  log: (entry: { type: string; message: string; details?: string }) =>
    fetchAPI<ActivityEntry>('/activity', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),
};

// Notes API (Notion Sync with #Buddy filter)
export const notesAPI = {
  getAll: () => fetchAPI<DashboardNote[]>('/notes'),

  create: (content: string, additionalTags?: string[]) =>
    fetchAPI<DashboardNote>('/notes', {
      method: 'POST',
      body: JSON.stringify({ content, additionalTags }),
    }),

  markSeen: (notionId: string, response?: string) =>
    fetchAPI<{ success: boolean }>('/notes', {
      method: 'PUT',
      body: JSON.stringify({ notionId, response }),
    }),
};

// Scheduled Jobs API
export const jobsAPI = {
  getAll: () => fetchAPI<ScheduledJob[]>('/jobs'),

  toggle: (id: string, enabled: boolean) =>
    fetchAPI<{ success: boolean }>('/jobs', {
      method: 'PUT',
      body: JSON.stringify({ id, enabled }),
    }),
};

// Docs API (Google Drive)
export const docsAPI = {
  getAll: (category?: string) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return fetchAPI<Document[]>(`/docs${query}`);
  },

  getContent: (driveFileId: string) =>
    fetchAPI<{ content: string }>('/docs', {
      method: 'POST',
      body: JSON.stringify({ driveFileId }),
    }),
};

// Calendar API (Notion Events Calendar)
export const calendarAPI = {
  getUpcoming: (days: number = 14) =>
    fetchAPI<CalendarEvent[]>(`/calendar?days=${days}`),

  getToday: () =>
    fetchAPI<CalendarEvent[]>('/calendar?today=true'),

  getEventsForDate: (date: string) =>
    fetchAPI<{ date: string; events: CalendarEvent[]; count: number }>('/calendar', {
      method: 'POST',
      body: JSON.stringify({ date }),
    }),
};

// Convenience function to fetch all dashboard data at once
export async function fetchDashboardData() {
  const [status, tasks, activity, notes, jobs, docs, calendar] = await Promise.all([
    statusAPI.get(),
    tasksAPI.getAll(),
    activityAPI.getAll({ limit: 50 }),
    notesAPI.getAll(),
    jobsAPI.getAll(),
    docsAPI.getAll(),
    calendarAPI.getUpcoming(14),
  ]);

  return {
    status,
    tasks,
    activities: activity.entries,
    notes,
    jobs,
    docs,
    calendar,
  };
}
