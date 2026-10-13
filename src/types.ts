export interface StudyDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  tags: string[];
}

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface SummaryResult {
  documentId: string;
  type: 'short' | 'medium' | 'detailed' | 'bullet';
  summary: string;
  keyConcepts: KeyConcept[];
  readingTimeMinutes: number;
  wordCount: number;
  provider: string;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: string[];
  confidence?: 'high' | 'medium' | 'low';
}

export type QuestionType = 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  documentId?: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  userAnswers: Record<string, string>;
  completedAt: string;
}

export interface Flashcard {
  id: string;
  documentId?: string;
  front: string;
  back: string;
  category: string;
  hint?: string;
  isBookmarked: boolean;
  mastered: boolean;
  reviewCount: number;
  lastReviewed?: string;
}

export interface StudyPlanDay {
  day: number;
  title: string;
  tasks: string[];
  focusGoal: string;
  completed?: boolean;
}

export interface ExamCountdown {
  id: string;
  subject: string;
  examDate: string;
  targetScore?: string;
  priority: 'urgent' | 'medium' | 'normal';
  topics: string[];
}

export interface ActivityItem {
  id: string;
  type: 'quiz' | 'flashcard' | 'summary' | 'qa' | 'document' | 'pomodoro';
  title: string;
  detail: string;
  timestamp: string;
  score?: number;
}
