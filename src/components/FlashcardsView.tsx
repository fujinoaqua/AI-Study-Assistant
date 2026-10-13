import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Star,
  RotateCw,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Trash2,
  HelpCircle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { generateFlashcardsFromDoc } from '../services/aiClient';
import { Flashcard } from '../types';

export const FlashcardsView: React.FC = () => {
  const {
    documents,
    activeDocument,
    activeDocumentId,
    setActiveDocumentId,
    flashcards,
    addFlashcards,
    toggleFlashcardBookmark,
    setFlashcardMastery,
    deleteFlashcard,
  } = useStudy();

  const [filterMode, setFilterMode] = useState<'all' | 'starred' | 'practice'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardCountToGen, setCardCountToGen] = useState(8);

  const filteredCards = flashcards.filter((c) => {
    if (filterMode === 'starred') return c.isBookmarked;
    if (filterMode === 'practice') return !c.mastered;
    return true;
  });

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];

  // Keyboard shortcut listener: Space to flip, Left/Right for cards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredCards.length]);

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }
  };

  const handleGenerateCards = async () => {
    if (!activeDocument) return;
    setLoading(true);

    try {
      const res = await generateFlashcardsFromDoc(activeDocument.title, activeDocument.content, cardCountToGen);
      addFlashcards(
        res.cards.map((c) => ({
          documentId: activeDocument.id,
          front: c.front,
          back: c.back,
          category: activeDocument.title,
          hint: c.hint,
        }))
      );
      setFilterMode('all');
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      alert('Failed to generate flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const masteredCount = flashcards.filter((c) => c.mastered).length;
  const masteryPct = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Deck Generator Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            Spaced Repetition Decks
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Interactive Flashcards
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Master definitions and key principles using active recall flip-cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={cardCountToGen}
            onChange={(e) => setCardCountToGen(parseInt(e.target.value, 10))}
            className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
          >
            <option value={5}>5 Cards</option>
            <option value={8}>8 Cards</option>
            <option value={12}>12 Cards</option>
          </select>

          <button
            onClick={handleGenerateCards}
            disabled={loading || !activeDocument}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Generate Deck
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Mastery progress */}
        <div className="flex items-center gap-3">
          <div className="w-36 bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
            {masteredCount} of {flashcards.length} Mastered ({masteryPct}%)
          </span>
        </div>

        {/* Filter modes */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setFilterMode('all');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            All ({flashcards.length})
          </button>
          <button
            onClick={() => {
              setFilterMode('practice');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'practice'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Needs Practice ({flashcards.length - masteredCount})
          </button>
          <button
            onClick={() => {
              setFilterMode('starred');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'starred'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Starred ⭐ ({flashcards.filter((c) => c.isBookmarked).length})
          </button>
        </div>
      </div>

      {/* Main 3D Interactive Card View */}
      {currentCard ? (
        <div className="space-y-6">
          <div className="relative perspective-1000">
            <div
              onClick={() => setIsFlipped((prev) => !prev)}
              className={`w-full min-h-[320px] sm:min-h-[360px] p-6 sm:p-10 rounded-3xl cursor-pointer transition-all duration-500 transform-style-3d flex flex-col justify-between shadow-lg border ${
                isFlipped
                  ? 'bg-gradient-to-br from-indigo-950 via-zinc-900 to-purple-950 text-white border-indigo-500/30'
                  : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800 hover:border-purple-400'
              }`}
            >
              {/* Card Top Header */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300">
                  {currentCard.category}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-400">
                    {currentIndex + 1} of {filteredCards.length}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFlashcardBookmark(currentCard.id);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        currentCard.isBookmarked ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Card Middle: Front vs Back Content */}
              <div className="py-6 text-center">
                <span className="text-[11px] uppercase tracking-wider font-bold text-purple-500 mb-2 block">
                  {isFlipped ? 'Answer / Concept Details' : 'Question / Prompt'}
                </span>

                <p className="text-base sm:text-xl font-bold leading-relaxed max-w-xl mx-auto whitespace-pre-line">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>

                {/* Optional Hint button */}
                {!isFlipped && currentCard.hint && (
                  <div className="mt-4">
                    {showHint ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 italic bg-amber-500/10 py-1.5 px-3 rounded-lg inline-block">
                        💡 Hint: {currentCard.hint}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(true);
                        }}
                        className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        Need a hint?
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom: Flip trigger helper */}
              <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5" />
                  Click or press Spacebar to flip
                </span>

                {currentCard.mastered && (
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Row: Mastery Buttons & Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                title="Previous Card (Left Arrow)"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                title="Next Card (Right Arrow)"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Grading Mastery */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setFlashcardMastery(currentCard.id, false);
                  handleNext();
                }}
                className="px-5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Still Practicing
              </button>

              <button
                onClick={() => {
                  setFlashcardMastery(currentCard.id, true);
                  handleNext();
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Got It Mastered!
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-purple-500 opacity-50" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            No cards in this filter
          </h3>
          <p className="text-xs text-zinc-400">
            {filterMode === 'practice'
              ? 'Great job! You have mastered all cards in this category.'
              : 'Generate flashcards from your active document to build your deck.'}
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Show All Cards
          </button>
        </div>
      )}
    </div>
  );
};
