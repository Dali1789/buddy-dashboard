'use client';

import { useState, useEffect } from 'react';
import { BotStatus, BotState, SubAgent } from '@/types';

interface StatusPanelProps {
  botState: BotState;
}

const STATUS_CONFIG: Record<BotStatus, { emoji: string; color: string; label: string; ringColor: string }> = {
  idle: { emoji: '😊', color: 'text-green-500', label: 'Idle', ringColor: 'border-green-500' },
  thinking: { emoji: '🤔', color: 'text-yellow-500', label: 'Thinking', ringColor: 'border-yellow-500' },
  working: { emoji: '💪', color: 'text-blue-500', label: 'Working', ringColor: 'border-blue-500' },
  sleeping: { emoji: '😴', color: 'text-zinc-500', label: 'Sleeping', ringColor: 'border-zinc-500' },
  error: { emoji: '😰', color: 'text-red-500', label: 'Error', ringColor: 'border-red-500' },
  offline: { emoji: '⚫', color: 'text-zinc-600', label: 'Offline', ringColor: 'border-zinc-600' },
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function SubAgentBadge({ agent }: { agent: SubAgent }) {
  const statusColors = {
    running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className={`px-2 py-1 rounded-md text-xs border ${statusColors[agent.status]}`}>
      <span className="font-medium">{agent.name}</span>
      <span className="ml-1 opacity-70">{agent.status}</span>
    </div>
  );
}

export default function StatusPanel({ botState }: StatusPanelProps) {
  const config = STATUS_CONFIG[botState.status];
  const isActive = botState.status === 'working' || botState.status === 'thinking';
  const hasSubAgents = botState.subAgents && botState.subAgents.length > 0;

  // Hydration-safe time display - only render on client
  const [timeAgo, setTimeAgo] = useState<string>('--');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeAgo(formatTimeAgo(botState.lastActivity));

    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(botState.lastActivity));
    }, 60000);

    return () => clearInterval(interval);
  }, [botState.lastActivity]);

  return (
    <div className="card p-6 flex flex-col items-center gap-4 min-w-[200px]">
      {/* Sub-Agents Badge (wenn aktiv) */}
      {hasSubAgents && (
        <div className="absolute top-2 left-2 flex items-center gap-1 text-xs text-blue-400">
          <span className="animate-pulse">Helpers at work</span>
          <span>😊</span>
        </div>
      )}

      {/* Emoji mit animiertem Ring */}
      <div className="relative">
        {/* Outer Ring (animiert wenn aktiv) */}
        <div
          className={`absolute inset-0 rounded-full border-2 ${config.ringColor} ${
            isActive ? 'animate-pulse-ring' : 'opacity-50'
          }`}
          style={{ margin: '-8px', padding: '8px' }}
        />

        {/* Inner Ring (rotiert wenn working) */}
        {botState.status === 'working' && (
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin-slow"
            style={{ margin: '-4px', padding: '4px' }}
          />
        )}

        {/* Emoji Container */}
        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-4xl border-2 border-zinc-700">
          {config.emoji}
        </div>
      </div>

      {/* Bot Name */}
      <h2 className="text-xl font-semibold text-white">Buddy</h2>

      {/* Status Badge */}
      <div className={`flex items-center gap-2 ${config.color}`}>
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
        <span className="font-medium">{config.label}</span>
      </div>

      {/* Current Task Badge */}
      <div className="w-full">
        {botState.currentTask ? (
          // Active task - show with working indicator
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-center text-blue-400">
            <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 animate-pulse" />
            {botState.currentTask}
          </div>
        ) : (
          // No active task - show "Finished: Ready for tasks"
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-sm text-center text-green-400">
            {botState.status === 'idle' ? 'Finished: Ready for tasks' : 'Ready for tasks'}
          </div>
        )}
      </div>

      {/* Last Activity */}
      <div className="text-xs text-zinc-500">
        Last activity: {timeAgo}
      </div>

      {/* Sub-Agents List */}
      {hasSubAgents && (
        <div className="w-full mt-2">
          <div className="text-xs text-zinc-500 mb-2">Active Helpers:</div>
          <div className="flex flex-wrap gap-1">
            {botState.subAgents.map((agent) => (
              <SubAgentBadge key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {/* Uptime */}
      <div className="text-xs text-zinc-600 mt-2" suppressHydrationWarning>
        Uptime: {mounted ? `${Math.floor(botState.uptime / 3600)}h ${Math.floor((botState.uptime % 3600) / 60)}m` : '--'}
      </div>
    </div>
  );
}
