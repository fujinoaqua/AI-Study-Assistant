import { QuizQuestion, KeyConcept, Flashcard, StudyPlanDay } from '../types';

export interface SummarizeResponse {
  provider: string;
  summary: string;
  keyConcepts: KeyConcept[];
  readingTimeMinutes: number;
  wordCount: number;
}

export interface AskResponse {
  provider: string;
  answer: string;
  citations: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface QuizResponse {
  provider: string;
  title: string;
  questions: QuizQuestion[];
}

export interface FlashcardsResponse {
  provider: string;
  cards: Flashcard[];
}

export interface StudyPlanResponse {
  provider: string;
  plan: StudyPlanDay[];
}

export interface StatusResponse {
  status: string;
  provider: string;
  model: string;
  hasApiKey: boolean;
}

export async function fetchAIStatus(): Promise<StatusResponse> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      status: 'offline-mode',
      provider: 'offline-heuristic',
      model: 'Built-in NLP Engine',
      hasApiKey: false,
    };
  }
}

export async function summarizeText(
  text: string,
  type: 'short' | 'medium' | 'detailed' | 'bullet' = 'medium',
  title = 'Document'
): Promise<SummarizeResponse> {
  const res = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type, title }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate summary: ${res.statusText}`);
  }
  return await res.json();
}

export async function askQuestionAboutDoc(
  documentTitle: string,
  documentText: string,
  question: string,
  chatHistory: Array<{ sender: 'user' | 'ai'; text: string }> = []
): Promise<AskResponse> {
  const res = await fetch('/api/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentTitle, documentText, question, chatHistory }),
  });

  if (!res.ok) {
    throw new Error(`Failed to ask question: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateQuizFromDoc(
  documentTitle: string,
  documentText: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  count = 5
): Promise<QuizResponse> {
  const res = await fetch('/api/ai/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentTitle, documentText, difficulty, count }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate quiz: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateFlashcardsFromDoc(
  documentTitle: string,
  documentText: string,
  count = 8
): Promise<FlashcardsResponse> {
  const res = await fetch('/api/ai/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentTitle, documentText, count }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate flashcards: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateStudyPlan(
  topics: string[],
  daysAvailable = 7,
  hoursPerDay = 2,
  examDate = ''
): Promise<StudyPlanResponse> {
  const res = await fetch('/api/ai/study-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topics, daysAvailable, hoursPerDay, examDate }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate study plan: ${res.statusText}`);
  }
  return await res.json();
}
