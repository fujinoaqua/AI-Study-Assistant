import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Quote,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  BookOpen,
  HelpCircle,
  CornerDownLeft,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { askQuestionAboutDoc } from '../services/aiClient';
import { ChatMessage } from '../types';

export const AskAIView: React.FC = () => {
  const { documents, activeDocument, activeDocumentId, setActiveDocumentId, logActivity } = useStudy();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I am your AI academic tutor. Ask me any question about "${activeDocument?.title || 'your documents'}", and I will provide verified answers grounded strictly in your notes with source citations.`,
      timestamp: 'Just now',
      confidence: 'high',
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on active document
  const sampleQuestions: Record<string, string[]> = {
    'doc-bio-101': [
      'What are the 4 main stages of cellular respiration?',
      'Why is oxygen required as the terminal electron acceptor?',
      'What role does the enzyme RuBisCO play in the Calvin cycle?',
      'How does chemiosmosis generate ATP?',
    ],
    'doc-cs-301': [
      'What are the 4 Coffman conditions for a deadlock?',
      'How does the TLB improve memory access speed?',
      'What is thrashing and what causes it?',
      'Compare a mutex lock versus a semaphore.',
    ],
    'doc-hist-202': [
      'How did James Watt improve the early steam engine?',
      'What were the main socioeconomic impacts of urbanization?',
      'Which inventions mechanized the textile industry?',
      'How did the Factory Act of 1833 change labor practices?',
    ],
  };

  const currentSuggestions =
    sampleQuestions[activeDocumentId] || [
      'Summarize the core thesis of this document.',
      'What are the most important terms to memorize?',
      'Explain the key cause and effect relationships.',
      'What would be a tricky exam question on this topic?',
    ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (qText?: string) => {
    const question = qText || inputQuestion;
    if (!question.trim() || !activeDocument || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!qText) setInputQuestion('');
    setLoading(true);

    try {
      const historyForApi = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await askQuestionAboutDoc(
        activeDocument.title,
        activeDocument.content,
        question.trim(),
        historyForApi
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: res.citations,
        confidence: res.confidence,
      };

      setMessages((prev) => [...prev, aiMsg]);
      logActivity({
        type: 'qa',
        title: `Asked AI: "${question.slice(0, 35)}..."`,
        detail: `Grounded query on ${activeDocument.title}`,
      });
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Error retrieving answer: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: `Chat cleared. Ready for your questions about "${activeDocument?.title}".`,
        timestamp: 'Just now',
        confidence: 'high',
      },
    ]);
  };

  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'user' ? 'Student' : 'AI Tutor'}:\n${m.text}\n`)
      .join('\n---\n\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Study_QnA_${activeDocument?.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              Document-Grounded Q&A
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Anti-Hallucination
              </span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
              <span>Grounded in:</span>
              <select
                value={activeDocumentId}
                onChange={(e) => setActiveDocumentId(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-semibold text-zinc-800 dark:text-zinc-200 outline-none max-w-[220px] truncate"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportChat}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-medium flex items-center gap-1.5"
            title="Export Transcript"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs font-medium flex items-center gap-1.5"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Suggested Starter Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
        <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider shrink-0 pl-1">
          Suggestions:
        </span>
        {currentSuggestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition-all shadow-2xs cursor-pointer"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                    : 'bg-gradient-to-tr from-zinc-800 to-zinc-950 text-indigo-400 border border-zinc-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-tl-xs border border-zinc-200/60 dark:border-zinc-700/60'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.text}</div>
                </div>

                {/* Citations Box for AI Messages */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                      <Quote className="w-3.5 h-3.5" />
                      Grounded Citations from Source Document:
                    </div>
                    {msg.citations.map((cite, cIdx) => (
                      <p
                        key={cIdx}
                        className="text-zinc-600 dark:text-zinc-300 pl-2 border-l-2 border-indigo-400 italic font-mono text-[11px]"
                      >
                        "{cite}"
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-[10px] text-zinc-400 px-1">
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.confidence && (
                    <>
                      <span>•</span>
                      <span className="capitalize text-emerald-600 dark:text-emerald-400 font-semibold">
                        {msg.confidence} Confidence
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 text-indigo-400 border border-zinc-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 rounded-tl-xs border border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-2 text-xs text-zinc-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              Verifying against document text & synthesizing answer...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative shrink-0"
      >
        <input
          type="text"
          placeholder={`Ask anything about "${activeDocument?.title || 'your notes'}"...`}
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          disabled={loading || !activeDocument}
          className="w-full pl-4 pr-14 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
        />

        <button
          type="submit"
          disabled={loading || !inputQuestion.trim() || !activeDocument}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
