import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudyDocument,
  Flashcard,
  QuizAttempt,
  ExamCountdown,
  ActivityItem,
  Quiz,
  SummaryResult
} from '../types';
import {
  INITIAL_DOCUMENTS,
  INITIAL_FLASHCARDS,
  INITIAL_EXAMS,
  INITIAL_ACTIVITY
} from '../data/sampleData';
import { fetchAIStatus, StatusResponse } from '../services/aiClient';

interface StudyContextType {
  documents: StudyDocument[];
  activeDocumentId: string;
  activeDocument: StudyDocument | null;
  flashcards: Flashcard[];
  quizAttempts: QuizAttempt[];
  exams: ExamCountdown[];
  activityLog: ActivityItem[];
  savedSummaries: SummaryResult[];
  savedQuizzes: Quiz[];
  aiStatus: StatusResponse;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setActiveDocumentId: (id: string) => void;
  addDocument: (doc: Omit<StudyDocument, 'id' | 'createdAt' | 'wordCount' | 'readingTimeMinutes'>) => StudyDocument;
  updateDocument: (id: string, updates: Partial<StudyDocument>) => void;
  deleteDocument: (id: string) => void;
  addFlashcards: (cards: Array<Omit<Flashcard, 'id' | 'isBookmarked' | 'mastered' | 'reviewCount'>>) => void;
  toggleFlashcardBookmark: (id: string) => void;
  setFlashcardMastery: (id: string, mastered: boolean) => void;
  deleteFlashcard: (id: string) => void;
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  saveQuiz: (quiz: Quiz) => void;
  saveSummary: (summary: SummaryResult) => void;
  addExam: (exam: Omit<ExamCountdown, 'id'>) => void;
  deleteExam: (id: string) => void;
  logActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  resetToSampleData: () => void;
  totalFocusMinutes: number;
  addFocusMinutes: (mins: number) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<StudyDocument[]>(() => {
    const saved = localStorage.getItem('study_docs');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [activeDocumentId, setActiveDocumentId] = useState<string>(() => {
    return documents[0]?.id || 'doc-bio-101';
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('study_flashcards');
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem('study_quiz_attempts');
    return saved ? JSON.parse(saved) : [
      {
        id: 'attempt-1',
        quizId: 'quiz-init-1',
        quizTitle: 'Cellular Respiration Quiz (Medium)',
        score: 5,
        totalQuestions: 5,
        percentage: 100,
        userAnswers: {},
        completedAt: '2026-10-12T15:30:00Z',
      },
      {
        id: 'attempt-2',
        quizId: 'quiz-init-2',
        quizTitle: 'Operating Systems Virtual Memory',
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        userAnswers: {},
        completedAt: '2026-10-13T05:20:00Z',
      }
    ];
  });

  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('study_saved_quizzes');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedSummaries, setSavedSummaries] = useState<SummaryResult[]>(() => {
    const saved = localStorage.getItem('study_saved_summaries');
    return saved ? JSON.parse(saved) : [];
  });

  const [exams, setExams] = useState<ExamCountdown[]>(() => {
    const saved = localStorage.getItem('study_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [activityLog, setActivityLog] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('study_activity');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY;
  });

  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('study_focus_mins');
    return saved ? parseInt(saved, 10) : 125;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('study_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [aiStatus, setAiStatus] = useState<StatusResponse>({
    status: 'checking',
    provider: 'checking',
    model: 'Gemini 3.8 Flash',
    hasApiKey: false,
  });

  // Check AI Provider on load
  useEffect(() => {
    fetchAIStatus().then((status) => {
      setAiStatus(status);
    });
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('study_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('study_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem('study_quiz_attempts', JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  useEffect(() => {
    localStorage.setItem('study_saved_quizzes', JSON.stringify(savedQuizzes));
  }, [savedQuizzes]);

  useEffect(() => {
    localStorage.setItem('study_saved_summaries', JSON.stringify(savedSummaries));
  }, [savedSummaries]);

  useEffect(() => {
    localStorage.setItem('study_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('study_activity', JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    localStorage.setItem('study_focus_mins', totalFocusMinutes.toString());
  }, [totalFocusMinutes]);

  useEffect(() => {
    localStorage.setItem('study_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeDocument = documents.find((d) => d.id === activeDocumentId) || documents[0] || null;

  const logActivity = (item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newItem: ActivityItem = {
      ...item,
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
    };
    setActivityLog((prev) => [newItem, ...prev.slice(0, 24)]);
  };

  const addDocument = (doc: Omit<StudyDocument, 'id' | 'createdAt' | 'wordCount' | 'readingTimeMinutes'>) => {
    const wordCount = doc.content.trim().split(/\s+/).filter(Boolean).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const newDoc: StudyDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      wordCount,
      readingTimeMinutes,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocumentId(newDoc.id);
    logActivity({
      type: 'document',
      title: `Added document: "${newDoc.title}"`,
      detail: `${wordCount} words, categorized under ${newDoc.category}`,
    });
    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<StudyDocument>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const content = updates.content !== undefined ? updates.content : doc.content;
          const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
          const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
          return { ...doc, ...updates, wordCount, readingTimeMinutes };
        }
        return doc;
      })
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      if (activeDocumentId === id && filtered.length > 0) {
        setActiveDocumentId(filtered[0].id);
      }
      return filtered;
    });
  };

  const addFlashcards = (newCards: Array<Omit<Flashcard, 'id' | 'isBookmarked' | 'mastered' | 'reviewCount'>>) => {
    const formatted: Flashcard[] = newCards.map((c, i) => ({
      ...c,
      id: `fc-${Date.now()}-${i}`,
      isBookmarked: false,
      mastered: false,
      reviewCount: 0,
    }));
    setFlashcards((prev) => [...formatted, ...prev]);
    logActivity({
      type: 'flashcard',
      title: `Generated ${formatted.length} Flashcards`,
      detail: `Deck for ${formatted[0]?.category || 'Study Material'}`,
    });
  };

  const toggleFlashcardBookmark = (id: string) => {
    setFlashcards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, isBookmarked: !card.isBookmarked } : card))
    );
  };

  const setFlashcardMastery = (id: string, mastered: boolean) => {
    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === id
          ? {
              ...card,
              mastered,
              reviewCount: card.reviewCount + 1,
              lastReviewed: new Date().toISOString(),
            }
          : card
      )
    );
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== id));
  };

  const recordQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `attempt-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    setQuizAttempts((prev) => [newAttempt, ...prev]);
    logActivity({
      type: 'quiz',
      title: `Quiz Attempt: ${newAttempt.quizTitle}`,
      detail: `Scored ${newAttempt.percentage}% (${newAttempt.score}/${newAttempt.totalQuestions})`,
      score: newAttempt.percentage,
    });
  };

  const saveQuiz = (quiz: Quiz) => {
    setSavedQuizzes((prev) => [quiz, ...prev]);
  };

  const saveSummary = (summary: SummaryResult) => {
    setSavedSummaries((prev) => [summary, ...prev]);
    logActivity({
      type: 'summary',
      title: `Generated ${summary.type.toUpperCase()} Summary`,
      detail: `Extracted ${summary.keyConcepts.length} key concepts from document`,
    });
  };

  const addExam = (exam: Omit<ExamCountdown, 'id'>) => {
    const newExam: ExamCountdown = {
      ...exam,
      id: `exam-${Date.now()}`,
    };
    setExams((prev) => [...prev, newExam]);
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const addFocusMinutes = (mins: number) => {
    setTotalFocusMinutes((prev) => prev + mins);
    logActivity({
      type: 'pomodoro',
      title: `Completed Focus Block: ${mins} mins`,
      detail: `Deep work session logged in Study Assistant`,
    });
  };

  const resetToSampleData = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setActiveDocumentId(INITIAL_DOCUMENTS[0].id);
    setFlashcards(INITIAL_FLASHCARDS);
    setExams(INITIAL_EXAMS);
    setActivityLog(INITIAL_ACTIVITY);
  };

  return (
    <StudyContext.Provider
      value={{
        documents,
        activeDocumentId,
        activeDocument,
        flashcards,
        quizAttempts,
        exams,
        activityLog,
        savedSummaries,
        savedQuizzes,
        aiStatus,
        theme,
        toggleTheme,
        setActiveDocumentId,
        addDocument,
        updateDocument,
        deleteDocument,
        addFlashcards,
        toggleFlashcardBookmark,
        setFlashcardMastery,
        deleteFlashcard,
        recordQuizAttempt,
        saveQuiz,
        saveSummary,
        addExam,
        deleteExam,
        logActivity,
        resetToSampleData,
        totalFocusMinutes,
        addFocusMinutes,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
