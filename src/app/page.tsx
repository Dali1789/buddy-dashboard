'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  StatusPanel,
  KanbanBoard,
  ActivityLog,
  NotesSection,
  ScheduledJobs,
  DocsViewer,
  UpcomingEvents,
  ChatWindow,
} from '@/components';
import {
  BotState,
  DashboardTab,
  KanbanTask,
  ActivityEntry,
  DashboardNote,
  ScheduledJob,
  Document,
  CalendarEvent,
} from '@/types';
import {
  statusAPI,
  tasksAPI,
  activityAPI,
  notesAPI,
  jobsAPI,
  docsAPI,
  calendarAPI,
} from '@/lib/api';

// Initial/fallback state
const INITIAL_BOT_STATE: BotState = {
  status: 'offline',
  currentTask: null,
  subAgents: [],
  lastActivity: new Date().toISOString(),
  uptime: 0,
};

function Navigation({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'docs', label: 'Docs' },
    { id: 'log', label: 'Log' },
  ];

  return (
    <nav className="flex items-center gap-1 bg-zinc-900/50 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function LastSync({
  timestamp,
  isLoading,
  onRefresh,
}: {
  timestamp: string;
  isLoading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-zinc-500 flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
          }`}
        />
        Last sync: {new Date(timestamp).toLocaleTimeString('de-DE')}
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="text-xs text-zinc-500 hover:text-white disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Syncing...' : 'Refresh'}
      </button>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [botState, setBotState] = useState<BotState>(INITIAL_BOT_STATE);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [notes, setNotes] = useState<DashboardNote[]>([]);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [lastSync, setLastSync] = useState(new Date().toISOString());

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statusData, tasksData, activityData, notesData, jobsData, docsData, calendarData] =
        await Promise.all([
          statusAPI.get().catch(() => INITIAL_BOT_STATE),
          tasksAPI.getAll().catch(() => []),
          activityAPI.getAll({ limit: 100 }).catch(() => ({ entries: [] })),
          notesAPI.getAll().catch(() => []),
          jobsAPI.getAll().catch(() => []),
          docsAPI.getAll().catch(() => []),
          calendarAPI.getUpcoming(14).catch(() => []),
        ]);

      setBotState(statusData);
      setTasks(tasksData);
      setActivities(activityData.entries);
      setNotes(notesData);
      setJobs(jobsData);
      setDocs(docsData);
      setEvents(calendarData);
      setLastSync(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling for updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle adding a note
  const handleAddNote = async (content: string) => {
    try {
      const newNote = await notesAPI.create(content);
      setNotes((prev) => [newNote, ...prev]);

      // Log the activity
      await activityAPI.log({
        type: 'user_requested',
        message: 'Neue Note erstellt',
        details: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      });
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  // Handle task click
  const handleTaskClick = (task: KanbanTask) => {
    // Open in Notion
    if (task.notionId) {
      window.open(`https://notion.so/${task.notionId.replace(/-/g, '')}`, '_blank');
    }
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    // Open meeting link or Notion
    if (event.meetingLink) {
      window.open(event.meetingLink, '_blank');
    } else if (event.notionId) {
      window.open(`https://notion.so/${event.notionId.replace(/-/g, '')}`, '_blank');
    }
  };

  // Handle document selection
  const handleDocSelect = async (doc: Document) => {
    setSelectedDoc(doc);
    setDocContent('');

    if (doc.driveFileId) {
      try {
        const { content } = await docsAPI.getContent(doc.driveFileId);
        setDocContent(content);
      } catch (err) {
        setDocContent('Fehler beim Laden des Dokuments');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">Moltbot</h1>
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <LastSync timestamp={lastSync} isLoading={isLoading} onRefresh={fetchData} />
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2">
          <div className="max-w-7xl mx-auto text-sm text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="flex gap-6 items-stretch">
              {/* Left Sidebar - Status + Notes + Events + Jobs */}
              <aside className="shrink-0 flex flex-col gap-4 w-[280px]">
                <StatusPanel botState={botState} />
                <NotesSection notes={notes} onAddNote={handleAddNote} />
                <UpcomingEvents events={events} onEventClick={handleEventClick} />
                <ScheduledJobs jobs={jobs} />
              </aside>

              {/* Main Dashboard Content */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Kanban Board */}
                <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} />

                {/* Chat Window - stretches to fill remaining space */}
                <ChatWindow />
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <DocsViewer
              documents={docs}
              selectedDocument={selectedDoc}
              onDocumentSelect={handleDocSelect}
              documentContent={docContent}
            />
          )}

          {activeTab === 'log' && <ActivityLog entries={activities} />}
        </div>
      </main>
    </div>
  );
}
