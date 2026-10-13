import React from 'react';
import {
  FileText,
  HelpCircle,
  Layers,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  Award,
  BookOpen,
  Calendar,
  AlertCircle,
  Play,
  CheckCircle2
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    documents,
    activeDocument,
    flashcards,
    quizAttempts,
    exams,
    activityLog,
    totalFocusMinutes,
  } = useStudy();

  const masteredCards = flashcards.filter((c) => c.mastered).length;
  const masteryPercentage = flashcards.length > 0 ? Math.round((masteredCards / flashcards.length) * 100) : 0;

  const totalQuizzes = quizAttempts.length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
      : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI-Powered Personalized Study Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to master your coursework today?
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed opacity-90">
            Upload your lecture notes, generate crystal-clear summaries, test your recall with AI quizzes, and review high-yield flashcards.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('summarizer')}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-sm hover:bg-indigo-50 shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Summarize Notes
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="px-5 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700/90 text-white font-medium text-sm backdrop-blur-sm border border-indigo-400/30 transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Take Quiz
            </button>
            <button
              onClick={() => onNavigate('pomodoro')}
              className="px-5 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700/90 text-white font-medium text-sm backdrop-blur-sm border border-indigo-400/30 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-emerald-300" />
              Start Focus Session
            </button>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute right-0 top-0 -bottom-10 w-96 opacity-15 pointer-events-none flex items-center justify-center">
          <div className="w-80 h-80 rounded-full bg-indigo-400 blur-3xl" />
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Documents */}
        <div
          onClick={() => onNavigate('documents')}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Notes & Docs</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{documents.length}</span>
            <span className="text-xs text-zinc-500">guides active</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform">
            View all documents <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Average Quiz Score */}
        <div
          onClick={() => onNavigate('quiz')}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Quiz Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{avgQuizScore}%</span>
            <span className="text-xs text-zinc-500">{totalQuizzes} attempts</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform">
            Test your recall <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Flashcards Mastered */}
        <div
          onClick={() => onNavigate('flashcards')}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Cards Mastered</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {masteredCards}/{flashcards.length}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">({masteryPercentage}%)</span>
          </div>
          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform">
            Review decks <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Focus Study Time */}
        <div
          onClick={() => onNavigate('pomodoro')}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Focus Time</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalFocusMinutes}</span>
            <span className="text-xs text-zinc-500">minutes total</span>
          </div>
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform">
            Launch Pomodoro <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Grid: Active Focus Doc & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Document Spotlight */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Current Focus Material
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Selected document for AI queries and assessments
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('documents')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Switch Document
              </button>
            </div>

            {activeDocument ? (
              <div className="mt-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {activeDocument.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-700 dark:text-zinc-300">
                        {activeDocument.category}
                      </span>
                      <span>•</span>
                      <span>{activeDocument.wordCount} words</span>
                      <span>•</span>
                      <span>{activeDocument.readingTimeMinutes} min read</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeDocument.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 leading-relaxed font-mono">
                  {activeDocument.content.slice(0, 320)}...
                </p>

                {/* 1-Click Action Row */}
                <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => onNavigate('summarizer')}
                    className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors text-left group"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-500 group-hover:text-white mb-1.5" />
                    <p className="text-xs font-bold">Summarize</p>
                    <p className="text-[10px] text-zinc-500 group-hover:text-indigo-100">4 lengths & terms</p>
                  </button>

                  <button
                    onClick={() => onNavigate('ask')}
                    className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors text-left group"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-500 group-hover:text-white mb-1.5" />
                    <p className="text-xs font-bold">Ask AI Q&A</p>
                    <p className="text-[10px] text-zinc-500 group-hover:text-indigo-100">Grounded answers</p>
                  </button>

                  <button
                    onClick={() => onNavigate('quiz')}
                    className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors text-left group"
                  >
                    <Award className="w-4 h-4 text-amber-500 group-hover:text-white mb-1.5" />
                    <p className="text-xs font-bold">Generate Quiz</p>
                    <p className="text-[10px] text-zinc-500 group-hover:text-indigo-100">MCQ & True/False</p>
                  </button>

                  <button
                    onClick={() => onNavigate('flashcards')}
                    className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors text-left group"
                  >
                    <Layers className="w-4 h-4 text-purple-500 group-hover:text-white mb-1.5" />
                    <p className="text-xs font-bold">Flashcards</p>
                    <p className="text-[10px] text-zinc-500 group-hover:text-indigo-100">Spaced repetition</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No document selected. Upload notes to get started.</p>
              </div>
            )}
          </div>

          {/* Recent Activity Log */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Recent Activity & Progress
              </h3>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View History
              </button>
            </div>

            <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {activityLog.slice(0, 4).map((item) => (
                <div key={item.id} className="py-3 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0 mt-0.5">
                    {item.type === 'quiz' && <Award className="w-4 h-4 text-emerald-500" />}
                    {item.type === 'flashcard' && <Layers className="w-4 h-4 text-purple-500" />}
                    {item.type === 'summary' && <Sparkles className="w-4 h-4 text-indigo-500" />}
                    {item.type === 'pomodoro' && <Clock className="w-4 h-4 text-amber-500" />}
                    {item.type === 'document' && <FileText className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.title}
                      </p>
                      <span className="text-[11px] text-zinc-400 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Exams & Deadlines */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Target Exam Dates
                </h3>
              </div>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Planner
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {exams.map((exam) => {
                const daysUntil = Math.ceil(
                  (new Date(exam.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const isUrgent = daysUntil <= 14;

                return (
                  <div
                    key={exam.id}
                    className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {exam.subject}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isUrgent
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {daysUntil > 0 ? `${daysUntil} days left` : 'Today'}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                      <span>Target: {exam.targetScore || 'Pass'}</span>
                      <span>{exam.topics.length} topics</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Study Tip Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-zinc-800 dark:text-zinc-200">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4" />
              Pro Tip: Active Recall
            </div>
            <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              Testing yourself with quizzes and flashcards strengthens memory pathways 300% more effectively than passively re-reading notes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
