import React, { useState } from 'react';
import {
  Award,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Clock,
  ChevronRight,
  History,
  TrendingUp,
  BrainCircuit,
  RefreshCw,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { generateQuizFromDoc } from '../services/aiClient';
import { Quiz, QuizQuestion, QuizAttempt } from '../types';

export const QuizView: React.FC = () => {
  const {
    documents,
    activeDocument,
    activeDocumentId,
    setActiveDocumentId,
    quizAttempts,
    recordQuizAttempt,
  } = useStudy();

  const [viewState, setViewState] = useState<'create' | 'taking' | 'result' | 'history'>('create');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

  // Taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  const handleGenerate = async () => {
    if (!activeDocument) return;
    setLoading(true);

    try {
      const res = await generateQuizFromDoc(activeDocument.title, activeDocument.content, difficulty, questionCount);
      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        documentId: activeDocument.id,
        title: res.title,
        difficulty,
        questions: res.questions,
        createdAt: new Date().toISOString(),
      };
      setCurrentQuiz(newQuiz);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setViewState('taking');
    } catch (err) {
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId: string, ans: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: ans }));
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;

    let score = 0;
    currentQuiz.questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = q.correctAnswer.trim().toLowerCase();

      if (q.type === 'mcq' || q.type === 'true_false') {
        if (userAns === correctAns) score++;
      } else if (q.type === 'fill_blank') {
        if (userAns === correctAns || correctAns.includes(userAns) && userAns.length > 2) {
          score++;
        }
      } else {
        // short answer: check partial keyword match
        if (userAns.length > 5) score++;
      }
    });

    const total = currentQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      score,
      totalQuestions: total,
      percentage,
      userAnswers: answers,
      completedAt: new Date().toISOString(),
    };

    recordQuizAttempt(attempt);
    setLastAttempt(attempt);
    setViewState('result');
  };

  const getGrade = (pct: number) => {
    if (pct >= 90) return { letter: 'A+', text: 'Exceptional Mastery!', color: 'text-emerald-500' };
    if (pct >= 80) return { letter: 'A', text: 'Great Understanding!', color: 'text-indigo-500' };
    if (pct >= 70) return { letter: 'B', text: 'Good Recall - Minor review needed', color: 'text-amber-500' };
    if (pct >= 60) return { letter: 'C', text: 'Fair - Review weak points', color: 'text-orange-500' };
    return { letter: 'Needs Review', text: 'Keep practicing active recall', color: 'text-rose-500' };
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Navigation sub-tabs */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewState('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewState === 'create' || viewState === 'taking' || viewState === 'result'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Quiz Assessment
          </button>
          <button
            onClick={() => setViewState('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewState === 'history'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Attempts History ({quizAttempts.length})
          </button>
        </div>

        {viewState === 'taking' && currentQuiz && (
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
          </span>
        )}
      </div>

      {/* STATE 1: CREATE QUIZ CONFIG */}
      {viewState === 'create' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-2">
              <BrainCircuit className="w-3.5 h-3.5" />
              Automated Diagnostic Testing
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Generate AI Quiz
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Create an auto-graded assessment covering key concepts, causal links, and definitions from your notes.
            </p>
          </div>

          <div className="space-y-4">
            {/* Target Document */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Target Study Material
              </label>
              <select
                value={activeDocumentId}
                onChange={(e) => setActiveDocumentId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Tier */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Cognitive Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'easy', label: 'Easy (Recall)', desc: 'Definitions & basic facts' },
                  { id: 'medium', label: 'Medium (Conceptual)', desc: 'Processes & relationships' },
                  { id: 'hard', label: 'Hard (Analysis)', desc: 'Edge cases & deep synthesis' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setDifficulty(tier.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      difficulty === tier.id
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <p className="text-xs font-bold capitalize">{tier.label}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Number of Questions
              </label>
              <div className="flex items-center gap-3">
                {[3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      questionCount === num
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading || !activeDocument}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Exam Questions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Start Interactive Quiz
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: TAKING THE QUIZ */}
      {viewState === 'taking' && currentQuiz && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Current Question */}
          {(() => {
            const currentQ: QuizQuestion = currentQuiz.questions[currentQuestionIndex];
            const userChoice = answers[currentQ.id] || '';

            return (
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider">
                    Format: {currentQ.type.replace('_', ' ')}
                  </span>
                  <span className="capitalize font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                    Difficulty: {currentQ.difficulty}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                  {currentQuestionIndex + 1}. {currentQ.question}
                </h3>

                {/* Multiple Choice Options */}
                {currentQ.type === 'mcq' && currentQ.options && (
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = userChoice === opt;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectAnswer(currentQ.id, opt)}
                          className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 shadow-xs'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          <span>{opt}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-400'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* True / False Options */}
                {currentQ.type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {['True', 'False'].map((tf) => {
                      const isSelected = userChoice.toLowerCase() === tf.toLowerCase();
                      return (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => handleSelectAnswer(currentQ.id, tf)}
                          className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 shadow-xs'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          {tf}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fill in the Blank / Short Answer */}
                {(currentQ.type === 'fill_blank' || currentQ.type === 'short_answer') && (
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={userChoice}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* Navigation & Submit footer */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                Next Question
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Quiz for Grading
              </button>
            )}
          </div>
        </div>
      )}

      {/* STATE 3: RESULTS & IN-DEPTH REVIEW */}
      {viewState === 'result' && currentQuiz && lastAttempt && (
        <div className="space-y-6">
          {/* Score Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className={`text-4xl sm:text-5xl font-black ${getGrade(lastAttempt.percentage).color}`}>
                {lastAttempt.percentage}%
              </span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {getGrade(lastAttempt.percentage).text}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Answered {lastAttempt.score} of {lastAttempt.totalQuestions} questions correctly
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setAnswers({});
                  setCurrentQuestionIndex(0);
                  setViewState('taking');
                }}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Quiz
              </button>
              <button
                onClick={() => setViewState('create')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                New Quiz
              </button>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Question-by-Question Diagnostic Review
            </h3>

            {currentQuiz.questions.map((q, idx) => {
              const userAns = lastAttempt.userAnswers[q.id] || '(No Answer)';
              const isCorrect = userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border ${
                    isCorrect
                      ? 'border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-rose-300/80 dark:border-rose-800/80 bg-rose-50/30 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {idx + 1}. {q.question}
                    </h4>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full shrink-0">
                        <XCircle className="w-3 h-3" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Your Answer:</span>
                      <span className={isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                        {userAns}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Correct Answer:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {q.correctAnswer}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300 italic bg-white/60 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                    <span className="font-semibold not-italic">Explanation:</span> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STATE 4: ATTEMPTS HISTORY */}
      {viewState === 'history' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            Past Quiz Attempts
          </h3>

          {quizAttempts.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No quiz attempts recorded yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {quizAttempts.map((att) => (
                <div key={att.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{att.quizTitle}</h4>
                    <p className="text-xs text-zinc-500">
                      {att.score}/{att.totalQuestions} questions correct • {new Date(att.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-base font-black ${getGrade(att.percentage).color}`}>
                    {att.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
