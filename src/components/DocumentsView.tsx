import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Search,
  Trash2,
  Check,
  BookOpen,
  Sparkles,
  HelpCircle,
  Award,
  Layers,
  Copy,
  Tag,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { NavTab } from './Sidebar';

interface DocumentsViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onNavigate }) => {
  const {
    documents,
    activeDocumentId,
    setActiveDocumentId,
    activeDocument,
    addDocument,
    deleteDocument,
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Note Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Biology');
  const [newTags, setNewTags] = useState('Exam, Notes');
  const [newContent, setNewContent] = useState('');

  const categories = ['all', ...Array.from(new Set(documents.map((d) => d.category)))];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addDocument({
      title: newTitle.trim(),
      category: newCategory.trim() || 'General',
      tags: tagsArray.length > 0 ? tagsArray : ['Study Notes'],
      content: newContent.trim(),
    });

    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        addDocument({
          title: cleanName,
          category: 'Uploaded Notes',
          tags: [file.name.split('.').pop()?.toUpperCase() || 'FILE', 'Uploaded'],
          content: text,
        });
      }
    };

    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleCopy = () => {
    if (activeDocument) {
      navigator.clipboard.writeText(activeDocument.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search notes, terms, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5">
          {/* Upload Button */}
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 text-sm font-semibold cursor-pointer shadow-xs transition-colors">
            <Upload className="w-4 h-4 text-indigo-500" />
            <span>Upload File</span>
            <input
              type="file"
              accept=".txt,.md,.text,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* New Note Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column Split: Document List on Left, Active Document Reader on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDocuments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-500">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-500" />
              <p className="text-sm font-medium">No documents match your filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const isSelected = activeDocumentId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocumentId(doc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {doc.title}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
                      {doc.category}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {doc.content}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span>{doc.wordCount} words</span>
                      <span>•</span>
                      <span>{doc.readingTimeMinutes} min read</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {doc.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Document Reader & Instant Launchpad (7 cols) */}
        <div className="lg:col-span-7">
          {activeDocument ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
              {/* Reader Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                      {activeDocument.category}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {activeDocument.wordCount} words • {activeDocument.readingTimeMinutes} min read
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
                    {activeDocument.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Copy Text"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {documents.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${activeDocument.title}"?`)) {
                          deleteDocument(activeDocument.id);
                        }
                      }}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeDocument.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    <Tag className="w-3 h-3 text-zinc-400" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quick AI Action Launchpad */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => onNavigate('summarizer')}
                  className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-zinc-800 dark:text-zinc-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
                  Summarize
                </button>
                <button
                  onClick={() => onNavigate('ask')}
                  className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-zinc-800 dark:text-zinc-200"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white" />
                  Ask Q&A
                </button>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-zinc-800 dark:text-zinc-200"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
                  Quiz Me
                </button>
                <button
                  onClick={() => onNavigate('flashcards')}
                  className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-zinc-800 dark:text-zinc-200"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-500 group-hover:text-white" />
                  Flashcards
                </button>
              </div>

              {/* Document Text Body */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 max-h-[500px] overflow-y-auto">
                <div className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-sans">
                  {activeDocument.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-base">Select a document from the left</p>
              <p className="text-xs text-zinc-400 mt-1">Or upload new lecture notes to start</p>
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Create New Study Note
            </h3>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry: Hydrocarbons"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Subject / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chemistry"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exam, Reactions, Lab"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Notes & Text Content
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste lecture transcript, study guide notes, or outline text here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
