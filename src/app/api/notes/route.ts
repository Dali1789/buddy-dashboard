import { NextResponse } from 'next/server';
import { notesDB } from '@/lib/db';

// ============================================
// NOTES API - Local PostgreSQL
// ============================================
// Notes are stored locally. Moltbot checks on every heartbeat.
// ============================================

export async function GET() {
  try {
    const notes = await notesDB.getAll();
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// Create new note
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const newNote = await notesDB.create(body.content);
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

// Mark note as seen (called by Moltbot on heartbeat)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, response } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await notesDB.markSeen(id, response);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}
