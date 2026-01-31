'use client';

import { useMemo } from 'react';
import { ActivityEntry, ActivityType } from '@/types';

interface ActivityLogProps {
  entries: ActivityEntry[];
}

const TYPE_CONFIG: Record<ActivityType, { color: string; icon: string }> = {
  heartbeat: { color: 'bg-green-500', icon: '💓' },
  scheduled: { color: 'bg-blue-500', icon: '📅' },
  self_initiated: { color: 'bg-purple-500', icon: '🤖' },
  user_requested: { color: 'bg-yellow-500', icon: '👤' },
  task_completed: { color: 'bg-green-500', icon: '✅' },
  alert: { color: 'bg-orange-500', icon: '⚠️' },
  error: { color: 'bg-red-500', icon: '❌' },
  note_seen: { color: 'bg-cyan-500', icon: '👁️' },
  notion_sync: { color: 'bg-indigo-500', icon: '🔄' },
  // Session tracking types
  job_start: { color: 'bg-blue-600', icon: '▶️' },
  job_end: { color: 'bg-blue-400', icon: '⏹️' },
  thinking: { color: 'bg-yellow-500', icon: '🤔' },
  action: { color: 'bg-teal-500', icon: '⚡' },
};

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const config = TYPE_CONFIG[entry.type];

  return (
    <div className="flex items-start gap-3 py-2 hover:bg-zinc-800/30 px-2 -mx-2 rounded transition-colors">
      {/* Time */}
      <span className="text-xs text-zinc-500 w-14 shrink-0 pt-0.5">
        {formatTime(entry.timestamp)}
      </span>

      {/* Indicator */}
      <span className={`w-2 h-2 rounded-full ${config.color} mt-1.5 shrink-0`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300">{entry.message}</p>
        {entry.details && (
          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{entry.details}</p>
        )}
      </div>
    </div>
  );
}

function DateGroup({ date, entries }: { date: string; entries: ActivityEntry[] }) {
  return (
    <div className="mb-6">
      {/* Date Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          {date}
        </span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Entries */}
      <div className="space-y-1">
        {entries.map((entry) => (
          <ActivityItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export default function ActivityLog({ entries }: ActivityLogProps) {
  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, ActivityEntry[]> = {};

    entries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .forEach((entry) => {
        const dateKey = formatDate(entry.timestamp);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(entry);
      });

    return groups;
  }, [entries]);

  const dateKeys = Object.keys(groupedEntries);

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-400">Activity Log</h3>
          <p className="text-xs text-zinc-500">A chronological record of Buddy&apos;s actions</p>
        </div>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
          {entries.length} entries
        </span>
      </div>

      {/* Entries */}
      <div className="max-h-[500px] overflow-y-auto">
        {dateKeys.length > 0 ? (
          dateKeys.map((date) => (
            <DateGroup key={date} date={date} entries={groupedEntries[date]} />
          ))
        ) : (
          <div className="text-xs text-zinc-600 text-center py-8">
            No activity yet
          </div>
        )}
      </div>
    </div>
  );
}
