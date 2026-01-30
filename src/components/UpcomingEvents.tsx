'use client';

import { CalendarEvent } from '@/types';

interface UpcomingEventsProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  High: 'border-l-red-500',
  Medium: 'border-l-yellow-500',
  Low: 'border-l-green-500',
};

const TYPE_ICONS: Record<string, string> = {
  'Business Meeting': '💼',
  Private: '👤',
  Other: '📅',
};

function formatEventDate(date: string, upcomingInDays?: number): string {
  if (upcomingInDays === 0) return 'Heute';
  if (upcomingInDays === 1) return 'Morgen';
  if (upcomingInDays !== undefined && upcomingInDays <= 7) {
    return `In ${upcomingInDays} Tagen`;
  }

  return new Date(date).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function formatEventTime(date: string): string {
  const d = new Date(date);
  if (d.getHours() === 0 && d.getMinutes() === 0) {
    return 'Ganztägig';
  }
  return d.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventCard({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick?: () => void;
}) {
  const priorityColor = PRIORITY_COLORS[event.priority] || PRIORITY_COLORS.Medium;
  const typeIcon = TYPE_ICONS[event.type] || TYPE_ICONS.Other;

  return (
    <div
      onClick={onClick}
      className={`bg-zinc-800 rounded-lg p-3 border-l-4 ${priorityColor} cursor-pointer hover:bg-zinc-750 transition-colors`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-xl mt-0.5">{typeIcon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Date Badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                event.isToday
                  ? 'bg-blue-500/20 text-blue-400 font-medium'
                  : event.upcomingInDays === 1
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-zinc-700 text-zinc-400'
              }`}
            >
              {formatEventDate(event.date, event.upcomingInDays)}
            </span>
            <span className="text-xs text-zinc-500">
              {formatEventTime(event.date)}
            </span>
          </div>

          {/* Event Name */}
          <h4 className="text-sm font-medium text-white truncate">{event.name}</h4>

          {/* Main Topic */}
          {event.mainTopic && (
            <p className="text-xs text-zinc-400 mt-1 truncate">{event.mainTopic}</p>
          )}

          {/* Meeting Info */}
          {event.meetingPlace && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-zinc-500">{event.meetingPlace}</span>
              {event.meetingLink && (
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Join
                </a>
              )}
            </div>
          )}
        </div>

        {/* Priority indicator */}
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            event.priority === 'High'
              ? 'bg-red-500/20 text-red-400'
              : event.priority === 'Medium'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-green-500/20 text-green-400'
          }`}
        >
          {event.priority}
        </span>
      </div>
    </div>
  );
}

export default function UpcomingEvents({ events, onEventClick }: UpcomingEventsProps) {
  // Separate today's events from upcoming
  const todayEvents = events.filter((e) => e.isToday);
  const upcomingEvents = events.filter((e) => !e.isToday);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400">Termine</h3>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
          {events.length} Events
        </span>
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-blue-400 font-medium mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Heute
          </h4>
          <div className="space-y-2">
            {todayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick?.(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          {todayEvents.length > 0 && (
            <h4 className="text-xs text-zinc-500 font-medium mb-2">Kommende Termine</h4>
          )}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick?.(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-xs text-zinc-600 text-center py-4">
          Keine Termine in den nächsten 14 Tagen
        </div>
      )}

      {/* Notion Sync Info */}
      <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-600 flex items-center justify-between">
        <span>Synced with Notion</span>
        <span>Events Calendar</span>
      </div>
    </div>
  );
}
