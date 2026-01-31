// Bot Status Types
export type BotStatus = 'idle' | 'thinking' | 'working' | 'sleeping' | 'error' | 'offline';

export interface SubAgent {
  id: string;
  name: string;
  task: string;
  status: 'running' | 'completed' | 'error';
}

export interface BotState {
  status: BotStatus;
  currentTask: string | null;
  subAgents: SubAgent[];
  lastActivity: string;
  uptime: number;
}

// Kanban Types - Mapped to Notion "Dali Aufgaben"
export type NotionTaskStatus = 'inbox' | 'To-do' | 'In Bearbeitung' | 'in Prüfen' | 'Done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Priority-based Kanban columns (Eisenhower Matrix)
export type KanbanColumnId = 'do-now' | 'deep-work' | 'low' | 'overdue';

export interface KanbanTask {
  id: string;
  notionId?: string;
  title: string;
  description?: string;
  status: NotionTaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  wichtig: boolean;
  dringend: boolean;
  project?: string;
  bereich?: string;
  subTasks?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Kanban Columns by Priority
export const KANBAN_COLUMNS: { id: KanbanColumnId; label: string; description: string }[] = [
  { id: 'do-now', label: 'DO NOW', description: 'Wichtig + Dringend' },
  { id: 'deep-work', label: 'DEEP WORK', description: 'Wichtig' },
  { id: 'low', label: 'LOW', description: 'Später' },
  { id: 'overdue', label: 'OVERDUE', description: 'Überfällig' },
];

// Activity Log Types
export type ActivityType =
  | 'heartbeat'
  | 'scheduled'
  | 'self_initiated'
  | 'user_requested'
  | 'task_completed'
  | 'alert'
  | 'error'
  | 'note_seen'
  | 'notion_sync';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  details?: string;
  timestamp: string;
}

// Notes Types (Synced with Notion - filtered by "Buddy" tag)
export interface DashboardNote {
  id: string;
  notionId?: string;
  content: string;
  tags: string[];
  createdAt: string;
  seenAt?: string;
  seenByBot: boolean;
  response?: string;
}

// Notion Notes Database Configuration
export const NOTION_NOTES_CONFIG = {
  // Notes müssen den "Buddy" Tag haben um im Dashboard zu erscheinen
  requiredTag: 'Buddy',
};

// Docs Types
export type DocumentType = 'markdown' | 'pdf' | 'report' | 'guide' | 'reference' | 'ai_pulse';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  path: string;
  driveFileId?: string;
  createdAt: string;
  updatedAt: string;
  category: string;
}

// Scheduled Jobs Types
export type JobFrequency = 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  frequency: JobFrequency;
  cronExpression: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  lastStatus: 'success' | 'failed' | 'running' | 'pending';
  outputFolder?: string;
}

// Events Calendar Types (Notion)
export type EventType = 'Business Meeting' | 'Other' | 'Private';
export type MeetingPlace = 'Conference Room' | 'Zoom' | 'Google Meet' | 'Other';

export interface CalendarEvent {
  id: string;
  notionId?: string;
  name: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  type: EventType;
  meetingPlace?: MeetingPlace;
  meetingLink?: string;
  mainTopic?: string;
  isToday: boolean;
  upcomingInDays?: number;
}

// Dashboard Tab Types
export type DashboardTab = 'dashboard' | 'docs' | 'log';
