'use client';

import { useState, useMemo } from 'react';
import { Document, DocumentType } from '@/types';

interface DocsViewerProps {
  documents: Document[];
  onDocumentSelect?: (doc: Document) => void;
  selectedDocument?: Document | null;
  documentContent?: string;
}

const TYPE_ICONS: Record<DocumentType, { icon: string; color: string }> = {
  markdown: { icon: '📄', color: 'text-blue-400' },
  pdf: { icon: '📕', color: 'text-red-400' },
  report: { icon: '📊', color: 'text-green-400' },
  guide: { icon: '📘', color: 'text-indigo-400' },
  reference: { icon: '📖', color: 'text-purple-400' },
  ai_pulse: { icon: '📰', color: 'text-yellow-400' },
};

function DocumentItem({
  doc,
  isSelected,
  onClick,
}: {
  doc: Document;
  isSelected: boolean;
  onClick: () => void;
}) {
  const typeConfig = TYPE_ICONS[doc.type] || TYPE_ICONS.markdown;

  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-zinc-700 border border-zinc-600'
          : 'hover:bg-zinc-800 border border-transparent'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={typeConfig.color}>{typeConfig.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{doc.title}</h4>
          <span className="text-xs text-zinc-500">{doc.category}</span>
        </div>
      </div>
    </div>
  );
}

function DocumentViewer({
  document,
  content,
}: {
  document: Document | null;
  content?: string;
}) {
  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        Select a document to view
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">{document.title}</h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
              <span>
                {new Date(document.updatedAt).toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="bg-zinc-700 px-1.5 py-0.5 rounded">{document.category}</span>
            </div>
          </div>

          {document.driveFileId && (
            <a
              href={`https://docs.google.com/document/d/${document.driveFileId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1.5 rounded transition-colors"
            >
              Edit in Drive
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      {content ? (
        <div className="prose prose-invert prose-sm max-w-none">
          {/* Simple markdown rendering - in production use a proper markdown renderer */}
          <div className="whitespace-pre-wrap text-sm text-zinc-300">{content}</div>
        </div>
      ) : (
        <div className="text-zinc-500 text-center py-8">Loading document...</div>
      )}
    </div>
  );
}

export default function DocsViewer({
  documents,
  onDocumentSelect,
  selectedDocument,
  documentContent,
}: DocsViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(documents.map((d) => d.category));
    return Array.from(cats).sort();
  }, [documents]);

  // Filter documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !searchQuery ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, selectedCategory]);

  // Group by category
  const groupedDocs = useMemo(() => {
    const groups: Record<string, Document[]> = {};
    filteredDocs.forEach((doc) => {
      if (!groups[doc.category]) {
        groups[doc.category] = [];
      }
      groups[doc.category].push(doc);
    });
    return groups;
  }, [filteredDocs]);

  return (
    <div className="card p-4 h-[600px] flex flex-col">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Documents</h3>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-64 border-r border-zinc-800 pr-4 flex flex-col">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docs..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-zinc-600"
          />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1 mb-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                !selectedCategory
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  selectedCategory === cat
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {Object.keys(groupedDocs).length > 0 ? (
              Object.entries(groupedDocs).map(([category, docs]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-xs text-zinc-600 uppercase mb-1">{category}</h4>
                  {docs.map((doc) => (
                    <DocumentItem
                      key={doc.id}
                      doc={doc}
                      isSelected={selectedDocument?.id === doc.id}
                      onClick={() => onDocumentSelect?.(doc)}
                    />
                  ))}
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-600 text-center py-4">
                No documents found
              </div>
            )}
          </div>

          {/* Google Drive Info */}
          <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-600">
            Synced with Google Drive
          </div>
        </div>

        {/* Document Viewer */}
        <DocumentViewer document={selectedDocument || null} content={documentContent} />
      </div>
    </div>
  );
}
