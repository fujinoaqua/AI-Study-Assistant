import React from 'react';
import { Menu, BookOpen, Flame, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  title,
  subtitle,
}) => {
  const {
    documents,
    activeDocumentId,
    setActiveDocumentId,
    activeDocument,
    totalFocusMinutes,
    resetToSampleData,
  } = useStudy();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Active Document Selector */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="text-zinc-500 dark:text-zinc-400 hidden md:inline">Focus Doc:</span>
          <select
            value={activeDocumentId}
            onChange={(e) => setActiveDocumentId(e.target.value)}
            className="bg-transparent font-medium text-zinc-800 dark:text-zinc-200 outline-none max-w-[140px] sm:max-w-[200px] truncate cursor-pointer"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id} className="dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {doc.title}
              </option>
            ))}
          </select>
        </div>

        {/* Daily Study Streak */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-500" />
          <span>3 Day Streak</span>
        </div>

        {/* Total Focus Time */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>{totalFocusMinutes}m Focus</span>
        </div>

        {/* Download Project ZIP */}
        <a
          href="/api/download-project"
          download="ai-study-assistant.zip"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          title="Download full project code as ZIP"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span className="hidden sm:inline">Download ZIP</span>
        </a>

        {/* Reset / Reload Demo Samples */}
        <button
          onClick={() => {
            if (confirm('Reset to standard sample academic documents and flashcards?')) {
              resetToSampleData();
            }
          }}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Reload Sample Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
