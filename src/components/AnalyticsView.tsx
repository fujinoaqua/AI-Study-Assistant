import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Clock,
  Download,
  RotateCcw,
  Sparkles,
  FileText,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const AnalyticsView: React.FC = () => {
  const {
    documents,
    flashcards,
    quizAttempts,
    activityLog,
    totalFocusMinutes,
    resetToSampleData,
  } = useStudy();

  const totalQuizzes = quizAttempts.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
      : 0;

  const masteredCards = flashcards.filter((c) => c.mastered).length;
  const starredCards = flashcards.filter((c) => c.isBookmarked).length;

  const handleExportAll = () => {
    const data = {
      documents,
      flashcards,
      quizAttempts,
      activityLog,
      totalFocusMinutes,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyAssistant_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Performance & Analytics Dashboard
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Study Analytics & History
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Audit your recall metrics, quiz consistency, and cumulative deep work time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAll}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Backup
          </button>
          <button
            onClick={() => {
              if (confirm('Reset all metrics back to default sample state?')) {
                resetToSampleData();
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data
          </button>
        </div>
      </div>

      {/* High-Level Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Quiz Accuracy</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{avgScore}%</span>
            <span className="text-xs text-zinc-400">avg across {totalQuizzes} tests</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Card Retention</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {flashcards.length > 0 ? Math.round((masteredCards / flashcards.length) * 100) : 0}%
            </span>
            <span className="text-xs text-zinc-400">{masteredCards}/{flashcards.length} cards</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cumulative Focus</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{totalFocusMinutes}</span>
            <span className="text-xs text-zinc-400">minutes logged</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Knowledge Base</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{documents.length}</span>
            <span className="text-xs text-zinc-400">study documents</span>
          </div>
        </div>
      </div>

      {/* Quiz History Performance Breakdown */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Quiz Assessment Score Log
        </h3>

        {quizAttempts.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">No quiz attempts yet.</p>
        ) : (
          <div className="space-y-3">
            {quizAttempts.map((att) => (
              <div
                key={att.id}
                className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{att.quizTitle}</h4>
                  <p className="text-xs text-zinc-400">
                    {att.score} of {att.totalQuestions} correct •{' '}
                    {new Date(att.completedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className={`h-full ${att.percentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${att.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 w-12 text-right">
                    {att.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chronological Activity Feed */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          Full Activity Log
        </h3>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {activityLog.map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                  {log.title}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{log.detail}</p>
              </div>
              <span className="text-[11px] text-zinc-400 shrink-0 font-medium">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
