'use client';

import { ScheduledJob } from '@/types';

interface ScheduledJobsProps {
  jobs: ScheduledJob[];
}

const FREQUENCY_LABELS: Record<string, string> = {
  minutely: 'Minutely',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

const JOB_ICONS: Record<string, string> = {
  'Daily AI Pulse': '📰',
  'SWOT Analysis': '📊',
  'Security Audit': '🔒',
  'YouTube Audit': '📺',
  'Morning Briefing': '☀️',
  'Email Summary': '📧',
  default: '📋',
};

function getJobIcon(name: string): string {
  for (const [key, icon] of Object.entries(JOB_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  return JOB_ICONS.default;
}

function JobCard({ job }: { job: ScheduledJob }) {
  const icon = getJobIcon(job.name);
  const statusColors = {
    success: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    running: 'bg-blue-500/20 text-blue-400',
    pending: 'bg-zinc-500/20 text-zinc-400',
  };

  return (
    <div className={`bg-zinc-800 rounded-lg p-3 border border-zinc-700 ${!job.enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl">{icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{job.name}</h4>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-zinc-500 bg-zinc-700/50 px-1.5 py-0.5 rounded">
              {FREQUENCY_LABELS[job.frequency]}
            </span>
            {job.outputFolder && (
              <span className="text-xs text-zinc-600">
                → {job.outputFolder}
              </span>
            )}
          </div>

          {/* Next Run */}
          {job.nextRun && job.enabled && (
            <div className="text-xs text-zinc-500 mt-2">
              Next: {new Date(job.nextRun).toLocaleString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>

        {/* Status */}
        <span className={`text-xs px-2 py-1 rounded ${statusColors[job.lastStatus]}`}>
          {job.lastStatus}
        </span>
      </div>
    </div>
  );
}

export default function ScheduledJobs({ jobs }: ScheduledJobsProps) {
  const enabledJobs = jobs.filter((j) => j.enabled);
  const disabledJobs = jobs.filter((j) => !j.enabled);

  return (
    <div className="card p-4 flex flex-col" style={{ maxHeight: '500px' }}>
      <h3 className="text-sm font-medium text-zinc-400 mb-4 shrink-0">Scheduled Deliverables</h3>

      <div className="space-y-2 overflow-y-auto flex-1">
        {jobs.length > 0 ? (
          <>
            {/* Enabled Jobs */}
            {enabledJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}

            {/* Disabled Jobs (collapsed) */}
            {disabledJobs.length > 0 && (
              <details className="mt-4">
                <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400">
                  {disabledJobs.length} disabled job{disabledJobs.length > 1 ? 's' : ''}
                </summary>
                <div className="space-y-2 mt-2">
                  {disabledJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </details>
            )}
          </>
        ) : (
          <div className="text-xs text-zinc-600 text-center py-4">
            No scheduled jobs
          </div>
        )}
      </div>
    </div>
  );
}
