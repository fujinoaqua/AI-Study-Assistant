import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Plus,
  CheckCircle2,
  Trash2,
  CalendarCheck,
  Target,
  AlertTriangle,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { generateStudyPlan } from '../services/aiClient';
import { StudyPlanDay, ExamCountdown } from '../types';

export const StudyPlannerView: React.FC = () => {
  const { exams, addExam, deleteExam, documents } = useStudy();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('2026-10-30');
  const [newTargetScore, setNewTargetScore] = useState('90%');
  const [newPriority, setNewPriority] = useState<'urgent' | 'medium' | 'normal'>('urgent');
  const [newTopics, setNewTopics] = useState('Glycolysis, Krebs Cycle, ETC');

  // AI Schedule Generator State
  const [planDays, setPlanDays] = useState<number>(7);
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlanDay[]>([
    {
      day: 1,
      title: 'Foundations & Glycolysis',
      focusGoal: 'Master anaerobic breakdown of glucose and net ATP calculation',
      tasks: [
        'Read Biology 101 notes section on cytoplasm glycolysis (40m)',
        'Take 5 practice flashcard reps on substrate phosphorylation (20m)',
        'Draw the 10 enzymatic conversion steps on scrap paper (30m)',
      ],
      completed: true,
    },
    {
      day: 2,
      title: 'Pyruvate Oxidation & Citric Acid Cycle',
      focusGoal: 'Understand mitochondrial matrix decarboxylation and NADH yield',
      tasks: [
        'Review Krebs cycle inputs (Acetyl-CoA, oxaloacetate) and outputs (40m)',
        'Generate AI Medium Quiz on Krebs Cycle (25m)',
        'Synthesize summary notes (30m)',
      ],
      completed: false,
    },
    {
      day: 3,
      title: 'Electron Transport Chain & Chemiosmosis',
      focusGoal: 'Grasp the proton gradient mechanism across inner cristae',
      tasks: [
        'Study complexes I-IV and ATP Synthase rotational coupling (45m)',
        'Review flashcard deck on oxygen terminal electron acceptor (20m)',
        'Write short essay response for practice (30m)',
      ],
      completed: false,
    },
  ]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    addExam({
      subject: newSubject.trim(),
      examDate: newExamDate,
      targetScore: newTargetScore.trim() || 'A',
      priority: newPriority,
      topics: newTopics.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setNewSubject('');
    setShowAddModal(false);
  };

  const handleGenerateAIPlan = async () => {
    setLoadingPlan(true);
    try {
      const topicList = documents.flatMap((d) => d.tags).slice(0, 8);
      const res = await generateStudyPlan(topicList, planDays, hoursPerDay);
      setGeneratedPlan(res.plan);
    } catch (err) {
      alert('Failed to generate study plan.');
    } finally {
      setLoadingPlan(false);
    }
  };

  const toggleTaskCompletion = (dayIndex: number) => {
    setGeneratedPlan((prev) =>
      prev.map((day, idx) => (idx === dayIndex ? { ...day, completed: !day.completed } : day))
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            Curriculum & Exam Planner
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Study Schedule & Exam Deadlines
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Keep target exam dates in focus and generate structured day-by-day revision roadmaps.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Target Exam
        </button>
      </div>

      {/* Exam Countdown Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          Upcoming Examination Countdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exams.map((exam) => {
            const daysLeft = Math.ceil(
              (new Date(exam.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            const isUrgent = daysLeft <= 14;

            return (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isUrgent
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {daysLeft > 0 ? `${daysLeft} Days Remaining` : 'Today'}
                    </span>

                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-3 leading-snug">
                    {exam.subject}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Exam Date: {new Date(exam.examDate).toLocaleDateString()}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {exam.topics.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Target Score:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {exam.targetScore || 'Pass'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Revision Roadmap Generator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI Daily Study Roadmap
            </h3>
            <p className="text-xs text-zinc-500">
              Personalized pacing plan based on your course material and days left.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={planDays}
              onChange={(e) => setPlanDays(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold"
            >
              <option value={3}>3-Day Sprint</option>
              <option value={7}>7-Day Plan</option>
              <option value={14}>14-Day Plan</option>
            </select>

            <button
              onClick={handleGenerateAIPlan}
              disabled={loadingPlan}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {loadingPlan ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Roadmap
                </>
              )}
            </button>
          </div>
        </div>

        {/* Day-by-Day Cards */}
        <div className="space-y-4">
          {generatedPlan.map((day, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                day.completed
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTaskCompletion(idx)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      day.completed
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {day.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div>
                    <h4
                      className={`font-bold text-sm leading-snug ${
                        day.completed
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {day.title}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                      Goal: {day.focusGoal}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                  Day {day.day}
                </span>
              </div>

              {/* Tasks Checklist */}
              <div className="mt-3.5 pl-9 space-y-1.5">
                {day.tasks.map((task, tIdx) => (
                  <div key={tIdx} className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Add Target Exam Date
            </h3>

            <form onSubmit={handleAddExam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Subject / Exam Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Final"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Target Score
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 95% or A"
                    value={newTargetScore}
                    onChange={(e) => setNewTargetScore(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Topics to Cover (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alkanes, Stereochemistry, Resonance"
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
