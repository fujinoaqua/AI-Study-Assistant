import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DocumentsView } from './components/DocumentsView';
import { SummarizerView } from './components/SummarizerView';
import { AskAIView } from './components/AskAIView';
import { QuizView } from './components/QuizView';
import { FlashcardsView } from './components/FlashcardsView';
import { PomodoroView } from './components/PomodoroView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { AnalyticsView } from './components/AnalyticsView';

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Study Dashboard',
    subtitle: 'Overview of notes, active retention score, and upcoming exams',
  },
  documents: {
    title: 'Document & Notes Library',
    subtitle: 'Upload lecture slides, transcripts, and reading guides',
  },
  summarizer: {
    title: 'AI Document Summarizer',
    subtitle: 'Extract high-yield takeaways, concepts, and key definitions',
  },
  ask: {
    title: 'Ask AI Tutor (Grounded Q&A)',
    subtitle: 'Verified answers grounded directly in your source notes with citations',
  },
  quiz: {
    title: 'Quiz Master & Diagnostics',
    subtitle: 'Test recall with multiple-choice, true/false, and fill-in questions',
  },
  flashcards: {
    title: 'Spaced Repetition Flashcards',
    subtitle: 'Active recall card decks with 3D flip and mastery tracking',
  },
  pomodoro: {
    title: 'Pomodoro Focus & Ambience',
    subtitle: 'Deep study intervals paired with synthesized focus soundscapes',
  },
  planner: {
    title: 'Curriculum & Exam Planner',
    subtitle: 'Countdown to exam dates and day-by-day revision roadmaps',
  },
  analytics: {
    title: 'Analytics & Progress Log',
    subtitle: 'Historical score distribution, retention rates, and session logs',
  },
};

const MainWorkspace: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useStudy();

  const currentMeta = TAB_TITLES[currentTab];

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50/50 text-zinc-900'}`}>
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
          {currentTab === 'documents' && <DocumentsView onNavigate={setCurrentTab} />}
          {currentTab === 'summarizer' && <SummarizerView onNavigate={setCurrentTab} />}
          {currentTab === 'ask' && <AskAIView />}
          {currentTab === 'quiz' && <QuizView />}
          {currentTab === 'flashcards' && <FlashcardsView />}
          {currentTab === 'pomodoro' && <PomodoroView />}
          {currentTab === 'planner' && <StudyPlannerView />}
          {currentTab === 'analytics' && <AnalyticsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainWorkspace />
    </StudyProvider>
  );
}
