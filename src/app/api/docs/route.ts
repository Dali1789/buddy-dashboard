import { NextResponse } from 'next/server';
import { Document, DocumentType } from '@/types';

// Google Drive Shared Drive "Buddy" folder ID
const GOOGLE_DRIVE_FOLDER_ID = '0ANQ_d6FC2U3BUk9PVA';

// TODO: Import Google Drive client
// import { google } from 'googleapis';
// const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Map file extension/mime type to document type
function getDocumentType(mimeType: string, name: string): DocumentType {
  if (mimeType === 'application/pdf') return 'pdf';
  if (name.toLowerCase().includes('guide')) return 'guide';
  if (name.toLowerCase().includes('report')) return 'report';
  if (name.toLowerCase().includes('reference')) return 'reference';
  if (name.toLowerCase().includes('pulse')) return 'ai_pulse';
  return 'markdown';
}

// Extract category from folder structure
function getCategoryFromPath(parents: string[]): string {
  // TODO: Resolve parent folder names
  return 'General';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // TODO: Fetch from Google Drive API
    /*
    const response = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, parents, webViewLink)',
      orderBy: 'modifiedTime desc',
    });

    const documents: Document[] = response.data.files?.map((file: any) => ({
      id: file.id,
      title: file.name,
      type: getDocumentType(file.mimeType, file.name),
      path: file.webViewLink,
      driveFileId: file.id,
      createdAt: file.createdTime,
      updatedAt: file.modifiedTime,
      category: getCategoryFromPath(file.parents),
    })) || [];
    */

    // Mock response for now
    const documents: Document[] = [
      {
        id: '1',
        title: 'Moltbot Master Guide',
        type: 'guide',
        path: '/docs/master-guide.md',
        driveFileId: 'drive-abc123',
        category: 'Guide',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        title: 'Memory System Design',
        type: 'reference',
        path: '/docs/memory-system.md',
        driveFileId: 'drive-def456',
        category: 'Reference',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        title: 'Daily AI Pulse - 30.01.2026',
        type: 'ai_pulse',
        path: '/docs/ai-pulse/2026-01-30.md',
        driveFileId: 'drive-ghi789',
        category: 'AI Pulse',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Security Audit Report',
        type: 'report',
        path: '/docs/security/audit-2026-01.md',
        driveFileId: 'drive-jkl012',
        category: 'Security',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];

    // Filter by category if specified
    const filteredDocs = category
      ? documents.filter((doc) => doc.category === category)
      : documents;

    return NextResponse.json(filteredDocs);
  } catch (error) {
    console.error('Error fetching documents from Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// Get document content
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driveFileId } = body;

    if (!driveFileId) {
      return NextResponse.json(
        { error: 'driveFileId is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch document content from Google Drive
    /*
    const response = await drive.files.get({
      fileId: driveFileId,
      alt: 'media',
    });

    // For Google Docs, export as markdown
    const exportResponse = await drive.files.export({
      fileId: driveFileId,
      mimeType: 'text/plain',
    });

    return NextResponse.json({ content: exportResponse.data });
    */

    // Mock response for now
    const mockContent = `# Moltbot Master Guide

## Einführung

Moltbot ist dein persönlicher AI-Assistent, der rund um die Uhr arbeitet.

## Features

- **Heartbeat System**: Prüft alle 30 Minuten auf neue Aufgaben
- **Memory System**: 5-Schichten Memory für Langzeit-Kontext
- **Notion Sync**: Bi-direktionale Task-Synchronisation
- **Google Drive**: Dokumente werden automatisch gespeichert

## Kommunikation

Hauptkanal: Telegram

## Nächste Schritte

1. Dashboard testen
2. Heartbeat konfigurieren
3. Scheduled Jobs aktivieren
`;

    return NextResponse.json({ content: mockContent });
  } catch (error) {
    console.error('Error fetching document content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document content' },
      { status: 500 }
    );
  }
}
