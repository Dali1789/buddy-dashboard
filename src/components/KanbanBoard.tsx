'use client';

import { KanbanTask, KanbanColumnId, KANBAN_COLUMNS } from '@/types';

interface KanbanBoardProps {
  tasks: KanbanTask[];
  onTaskClick?: (task: KanbanTask) => void;
}

// Check if a task is overdue
function isOverdue(task: KanbanTask): boolean {
  if (!task.dueDate || task.status === 'Done') return false;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

// Get tasks for a priority-based column
function getTasksForColumn(tasks: KanbanTask[], columnId: KanbanColumnId): KanbanTask[] {
  // Filter out Done tasks first
  const activeTasks = tasks.filter((t) => t.status !== 'Done');

  switch (columnId) {
    case 'overdue':
      // All overdue tasks (regardless of priority)
      return activeTasks.filter(isOverdue);

    case 'do-now':
      // Wichtig + Dringend (excluding overdue)
      return activeTasks.filter((t) => t.wichtig && t.dringend && !isOverdue(t));

    case 'deep-work':
      // Nur Wichtig (nicht dringend, excluding overdue)
      return activeTasks.filter((t) => t.wichtig && !t.dringend && !isOverdue(t));

    case 'low':
      // Nicht wichtig (excluding overdue)
      return activeTasks.filter((t) => !t.wichtig && !isOverdue(t));

    default:
      return [];
  }
}

function getPriorityColor(wichtig: boolean, dringend: boolean): string {
  if (wichtig && dringend) return 'bg-red-500';
  if (wichtig) return 'bg-orange-500';
  if (dringend) return 'bg-yellow-500';
  return 'bg-green-500';
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

// Column styling based on type
const COLUMN_STYLES: Record<KanbanColumnId, { bg: string; headerColor: string; countBg: string }> = {
  'do-now': {
    bg: 'bg-red-900/20 border border-red-900/30',
    headerColor: 'text-red-400',
    countBg: 'text-red-400 bg-red-900/30',
  },
  'deep-work': {
    bg: 'bg-orange-900/20 border border-orange-900/30',
    headerColor: 'text-orange-400',
    countBg: 'text-orange-400 bg-orange-900/30',
  },
  'low': {
    bg: 'bg-zinc-800/50',
    headerColor: 'text-zinc-500',
    countBg: 'text-zinc-600 bg-zinc-700/50',
  },
  'overdue': {
    bg: 'bg-red-950/30 border border-red-800/40',
    headerColor: 'text-red-500',
    countBg: 'text-red-500 bg-red-900/40',
  },
};

function KanbanColumn({
  column,
  tasks,
  onTaskClick,
}: {
  column: { id: KanbanColumnId; label: string; description: string };
  tasks: KanbanTask[];
  onTaskClick?: (task: KanbanTask) => void;
}) {
  const columnTasks = getTasksForColumn(tasks, column.id);
  const style = COLUMN_STYLES[column.id];
  const isOverdueColumn = column.id === 'overdue';

  return (
    <div className="shrink-0 w-60">
      <div className={`rounded-lg p-3 ${style.bg}`}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-1">
          <h4 className={`text-xs font-medium uppercase tracking-wide ${style.headerColor}`}>
            {column.label}
          </h4>
          <span className={`text-xs px-1.5 py-0.5 rounded ${style.countBg}`}>
            {columnTasks.length}
          </span>
        </div>

        {/* Description */}
        <p className="text-[10px] text-zinc-600 mb-3">{column.description}</p>

        {/* Tasks - Max 10 visible, rest scrollable */}
        <div className="space-y-1.5 min-h-20 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-1">
          {columnTasks.length > 0 ? (
            columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            ))
          ) : (
            <div className={`text-xs text-center py-4 ${
              isOverdueColumn ? 'text-green-500/70' : 'text-zinc-600'
            }`}>
              {isOverdueColumn ? '✓ All good!' : 'No tasks'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  // Count active (non-Done) tasks
  const activeCount = tasks.filter((t) => t.status !== 'Done').length;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400">Priority Board</h3>
        <span className="text-xs text-zinc-600">{activeCount} active tasks</span>
      </div>

      {/* Columns */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {KANBAN_COLUMNS.map((column) => (
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
