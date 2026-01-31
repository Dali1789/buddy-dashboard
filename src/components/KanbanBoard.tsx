'use client';

import { useState } from 'react';
import { KanbanTask, NotionTaskStatus, KANBAN_COLUMNS } from '@/types';

interface KanbanBoardProps {
  tasks: KanbanTask[];
  onTaskMove?: (taskId: string, newStatus: NotionTaskStatus) => void;
  onTaskClick?: (task: KanbanTask) => void;
}

function getPriorityColor(wichtig: boolean, dringend: boolean): string {
  if (wichtig && dringend) return 'bg-red-500'; // Urgent
  if (wichtig) return 'bg-orange-500'; // High
  if (dringend) return 'bg-yellow-500'; // Medium
  return 'bg-green-500'; // Low
}

function getPriorityLabel(wichtig: boolean, dringend: boolean): string {
  if (wichtig && dringend) return 'Urgent';
  if (wichtig) return 'High';
  if (dringend) return 'Medium';
  return 'Low';
}

function formatDueDate(date?: string): { text: string; isOverdue: boolean; isSoon: boolean } {
  if (!date) return { text: '', isOverdue: false, isSoon: false };

  const dueDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isSoon: false };
  } else if (diffDays === 0) {
    return { text: 'Today', isOverdue: false, isSoon: true };
  } else if (diffDays === 1) {
    return { text: 'Tomorrow', isOverdue: false, isSoon: true };
  } else if (diffDays <= 3) {
    return { text: `${diffDays}d`, isOverdue: false, isSoon: true };
  } else {
    return { text: dueDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }), isOverdue: false, isSoon: false };
  }
}

function TaskCard({ task, onClick }: { task: KanbanTask; onClick?: () => void }) {
  const priorityColor = getPriorityColor(task.wichtig, task.dringend);
  const dueInfo = formatDueDate(task.dueDate);

  return (
    <div
      onClick={onClick}
      className="bg-zinc-800 rounded-md p-2 cursor-pointer hover:bg-zinc-750 transition-colors border border-zinc-700 hover:border-zinc-600"
    >
      {/* Task Title with Priority Dot */}
      <div className="flex items-start gap-2">
        <span className={`w-2 h-2 rounded-full ${priorityColor} mt-1 shrink-0`} />
        <h4 className="text-xs font-medium text-white line-clamp-2 leading-tight">
          {task.title}
        </h4>
      </div>

      {/* Meta Info (compact) */}
      {(dueInfo.text || task.bereich) && (
        <div className="flex items-center justify-between text-[10px] mt-1.5 pl-4">
          {dueInfo.text && (
            <span
              className={`${
                dueInfo.isOverdue
                  ? 'text-red-400'
                  : dueInfo.isSoon
                  ? 'text-yellow-400'
                  : 'text-zinc-500'
              }`}
            >
              {dueInfo.text}
            </span>
          )}
          {task.bereich && (
            <span className="text-zinc-600 truncate max-w-[80px]">
              {task.bereich}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  onTaskClick,
}: {
  column: { id: NotionTaskStatus; label: string };
  tasks: KanbanTask[];
  onTaskClick?: (task: KanbanTask) => void;
}) {
  const columnTasks = tasks.filter((task) => task.status === column.id);
  const isDone = column.id === 'Done';

  return (
    <div className="shrink-0 w-60">
      <div className={`rounded-lg p-3 ${isDone ? 'bg-zinc-800/30' : 'bg-zinc-800/50'}`}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            {column.label}
          </h4>
          <span className="text-xs text-zinc-600 bg-zinc-700/50 px-1.5 py-0.5 rounded">
            {columnTasks.length}
          </span>
        </div>

        {/* Tasks - Max 10 visible, rest scrollable */}
        <div className="space-y-1.5 min-h-20 max-h-105 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-1">
          {columnTasks.length > 0 ? (
            columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            ))
          ) : (
            <div className="text-xs text-zinc-600 text-center py-4">
              No tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [showArchive, setShowArchive] = useState(false);

  // Count archived (Done) tasks
  const archivedCount = tasks.filter((t) => t.status === 'Done').length;

  // Filter columns based on archive toggle
  const visibleColumns = showArchive
    ? KANBAN_COLUMNS
    : KANBAN_COLUMNS.filter((col) => col.id !== 'Done');

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400">Kanban Board</h3>

        {/* Archive Toggle */}
        {archivedCount > 0 && (
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            {showArchive ? 'Hide' : 'Show'} {archivedCount} archived
          </button>
        )}
      </div>

      {/* Columns */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {visibleColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      {/* Sync Status */}
      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-600">
        <span>Synced with Notion</span>
        <span>Dali Aufgaben</span>
      </div>
    </div>
  );
}
