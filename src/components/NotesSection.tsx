'use client';

import { useState } from 'react';
import { DashboardNote } from '@/types';

interface NotesSectionProps {
  notes: DashboardNote[];
  onAddNote?: (content: string) => void;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function NoteCard({ note }: { note: DashboardNote }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
      {/* Note Content */}
      <p className="text-sm text-zinc-300 mb-2">{note.content}</p>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">{formatTimestamp(note.createdAt)}</span>
        {note.seenByBot ? (
          <span className="text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            seen by Moltbot
          </span>
        ) : (
          <span className="text-yellow-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            pending
          </span>
        )}
      </div>

      {/* Bot Response */}
      {note.response && (
        <div className="mt-3 pt-3 border-t border-zinc-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-500">Moltbot:</span>
          </div>
          <p className="text-sm text-zinc-400 italic">{note.response}</p>
        </div>
      )}
    </div>
  );
}

export default function NotesSection({ notes, onAddNote }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim() || !onAddNote) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="mb-1">
        <h3 className="text-sm font-medium text-zinc-400">Notes for Moltbot</h3>
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        Moltbot checks on every heartbeat
      </p>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Leave a note for Moltbot..."
          disabled={isSubmitting}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!newNote.trim() || isSubmitting}
          className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {isSubmitting ? '...' : 'Add'}
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {notes.length > 0 ? (
          notes
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((note) => <NoteCard key={note.id} note={note} />)
        ) : (
          <div className="text-xs text-zinc-600 text-center py-4">
            No notes yet. Leave a message for Moltbot!
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-600">
        Stored locally in PostgreSQL
      </div>
    </div>
  );
}
