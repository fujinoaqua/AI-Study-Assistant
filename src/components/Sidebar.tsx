import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  MessageSquareText,
  HelpCircle,
  Layers,
  Timer,
  CalendarCheck,
  BarChart3,
  Moon,
  Sun,
  BookOpen,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export type NavTab =
  | 'dashboard'
  | 'documents'
  | 'summarizer'
  | 'ask'
  | 'quiz'
  | 'flashcards'
  | 'pomodoro'
  | 'planner'
  | 'analytics';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const { theme, toggleTheme, aiStatus, documents, flashcards } = useStudy();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'documents',
      label: 'My Notes & Docs',
      icon: <FileText className="w-5 h-5" />,
      badge: documents.length,
    },
    { id: 'summarizer', label: 'AI Summarizer', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'ask', label: 'Ask Document (Q&A)', icon: <MessageSquareText className="w-5 h-5" /> },
    { id: 'quiz', label: 'Quiz Master', icon: <HelpCircle className="w-5 h-5" /> },
    {
      id: 'flashcards',
      label: 'Flashcard Decks',
      icon: <Layers className="w-5 h-5" />,
      badge: flashcards.length,
    },
    { id: 'pomodoro', label: 'Focus & Ambience', icon: <Timer className="w-5 h-5" /> },
    { id: 'planner', label: 'Study Planner', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics & History', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 flex-col justify-between border-r transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          theme === 'dark'
            ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100 backdrop-blur-xl'
            : 'bg-white/95 border-zinc-200 text-zinc-800 backdrop-blur-xl shadow-xs'
        } flex`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-tight">
                  Study<span className="text-indigo-500">Mind</span> AI
                </h1>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Smart Study Companion</p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
          </div>

          {/* AI Status Badge */}
          <div className="mt-4 flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {aiStatus.hasApiKey ? 'Gemini 3.8 Flash' : 'Offline Smart Engine'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Study Workspace
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Account / Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3">
          <a
            href="/api/download-project"
            download="ai-study-assistant.zip"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Project (.ZIP)
          </a>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-xs">
              SK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                sakimkun98@gmail.com
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Student • Pro Account</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
