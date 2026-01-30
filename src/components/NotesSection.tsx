'use client';

import { useState } from 'react';
import { DashboardNote, NOTION_NOTES_CONFIG } from '@/types';

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

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs px-1.5 py-0.5 rounded ${
                tag === NOTION_NOTES_CONFIG.requiredTag
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-zinc-700 text-zinc-400'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">{formatTimestamp(note.createdAt)}</span>
        {note.seenByBot && (
          <span className="text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            seen by Moltbot
          </span>
        )}
      </div>

      {/* Bot Response */}
      {note.response && (
        <div className="mt-3 pt-3 border-t border-zinc-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-500">Moltbot&apos;s response:</span>
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

  // Filter notes that have the "Buddy" tag
  const filteredNotes = notes.filter((note) =>
    note.tags?.includes(NOTION_NOTES_CONFIG.requiredTag)
  );

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-zinc-400">Notes</h3>
        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
          #{NOTION_NOTES_CONFIG.requiredTag}
        </span>
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        Moltbot checks on every heartbeat (synced with Notion)
      </p>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a note..."
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

      {/* Info about tag */}
      <div className="text-xs text-zinc-600 mb-3 bg-zinc-800/50 rounded p-2">
        Notes werden automatisch mit #{NOTION_NOTES_CONFIG.requiredTag} Tag in Notion erstellt
      </div>

      {/* Notes List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {filteredNotes.length > 0 ? (
          filteredNotes
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((note) => <NoteCard key={note.id} note={note} />)
        ) : (
          <div className="text-xs text-zinc-600 text-center py-4">
            Keine Notes mit #{NOTION_NOTES_CONFIG.requiredTag} Tag. Erstelle eine Note für Moltbot!
          </div>
        )}
      </div>

      {/* Notion Sync Status */}
      <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-600 flex items-center justify-between">
        <span>Synced with Notion</span>
        <span>Filter: #{NOTION_NOTES_CONFIG.requiredTag}</span>
      </div>
    </div>
  );
}
