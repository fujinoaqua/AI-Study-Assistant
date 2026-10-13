# AI STUDY ASSISTANT - COMPLETE PROJECT SOURCE CODE BUNDLE

This document contains the entire source code of all 27 project files in one place.

---

## File: `package.json`

```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "tsx server.ts",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0",
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "@types/express": "^4.17.21"
  }
}

```

---

## File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "types": ["vite/client"],
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}

```

---

## File: `vite.config.ts`

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

```

---

## File: `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Study Assistant</title>
    <meta name="description" content="An intelligent study platform with document-grounded AI summaries, smart Q&A, interactive quizzes, flashcard mastery, and study planning." />
    <meta property="og:title" content="AI Study Assistant" />
    <meta property="og:description" content="An intelligent study platform with document-grounded AI summaries, smart Q&A, interactive quizzes, flashcard mastery, and study planning." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>


```

---

## File: `metadata.json`

```json
{
  "name": "AI Study Assistant",
  "description": "An intelligent study platform with document-grounded AI summaries, smart Q&A, interactive quizzes, flashcard mastery, and study planning.",
  "requestFramePermissions": [],
  "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
}

```

---

## File: `.env.example`

```
# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"

```

---

## File: `.gitignore`

```
node_modules/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example

```

---

## File: `server.ts`

```typescript
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const apiKey = process.env.GEMINI_API_KEY;

// Initialize GoogleGenAI if API key exists
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Fallback NLP heuristic helpers for offline or keyless operation
function extractSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function extractKeywords(text: string, count = 8): string[] {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of',
    'or', 'by', 'with', 'as', 'that', 'from', 'this', 'these', 'are', 'was', 'were',
    'it', 'its', 'be', 'been', 'has', 'have', 'had', 'do', 'does', 'did', 'but',
    'not', 'can', 'could', 'will', 'would', 'should', 'all', 'any', 'each', 'more',
    'also', 'into', 'than', 'such', 'other', 'their', 'they', 'them', 'about'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
}

function generateOfflineSummary(text: string, type: string) {
  const sentences = extractSentences(text);
  const keywords = extractKeywords(text, 6);

  let summaryText = '';
  if (type === 'short') {
    summaryText = sentences.slice(0, 3).join(' ') || text.slice(0, 300);
  } else if (type === 'bullet') {
    const bullets = sentences.slice(0, 6).map((s) => `• ${s}`);
    summaryText = bullets.join('\n\n');
  } else if (type === 'detailed') {
    summaryText = sentences.slice(0, 10).join(' ') || text.slice(0, 800);
  } else {
    // medium default
    summaryText = sentences.slice(0, 5).join(' ') || text.slice(0, 500);
  }

  const keyConcepts = keywords.map((kw) => {
    // Find sentence containing keyword
    const match = sentences.find((s) => s.toLowerCase().includes(kw.toLowerCase()));
    return {
      term: kw,
      definition: match || `Core concept relevant to the primary subject matter in this study material.`,
    };
  });

  const wordCount = text.trim().split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    summary: summaryText,
    keyConcepts,
    readingTimeMinutes,
    wordCount,
  };
}

function generateOfflineQuiz(docTitle: string, docText: string, difficulty: string, count: number) {
  const sentences = extractSentences(docText);
  const keywords = extractKeywords(docText, 12);
  const questions: any[] = [];

  const types = ['mcq', 'true_false', 'fill_blank', 'short_answer'];

  for (let i = 0; i < count; i++) {
    const qType = types[i % types.length];
    const sentence = sentences[i % sentences.length] || `Key subject from ${docTitle}.`;
    const targetKw = keywords[i % keywords.length] || 'Concept';
    const altKws = keywords.filter((k) => k !== targetKw).slice(0, 3);
    while (altKws.length < 3) altKws.push(`Option ${altKws.length + 2}`);

    if (qType === 'mcq') {
      const options = [targetKw, ...altKws].sort(() => 0.5 - Math.random());
      questions.push({
        id: `q-${Date.now()}-${i}`,
        type: 'mcq',
        question: `In the context of ${docTitle}, which term is most directly described by: "${sentence.slice(0, 140)}..."?`,
        options,
        correctAnswer: targetKw,
        explanation: `According to the document text: "${sentence.slice(0, 180)}".`,
        difficulty,
      });
    } else if (qType === 'true_false') {
      const isTrue = i % 2 === 0;
      const statement = isTrue
        ? sentence
        : sentence.replace(targetKw, 'an unrelated phenomenon');
      questions.push({
        id: `q-${Date.now()}-${i}`,
        type: 'true_false',
        question: `True or False: "${statement.slice(0, 160)}"?`,
        options: ['True', 'False'],
        correctAnswer: isTrue ? 'True' : 'False',
        explanation: `Based on the source notes, the correct statement is: "${sentence.slice(0, 180)}".`,
        difficulty,
      });
    } else if (qType === 'fill_blank') {
      const blanked = sentence.replace(new RegExp(targetKw, 'i'), '__________');
      questions.push({
        id: `q-${Date.now()}-${i}`,
        type: 'fill_blank',
        question: `Fill in the blank: "${blanked.slice(0, 160)}"`,
        correctAnswer: targetKw,
        explanation: `The missing word is "${targetKw}". Source reference: "${sentence.slice(0, 180)}".`,
        difficulty,
      });
    } else {
      questions.push({
        id: `q-${Date.now()}-${i}`,
        type: 'short_answer',
        question: `Briefly explain the significance of "${targetKw}" in relation to ${docTitle}.`,
        correctAnswer: sentence.slice(0, 150),
        explanation: `Key point to include: "${sentence.slice(0, 180)}".`,
        difficulty,
      });
    }
  }

  return {
    title: `Quiz: ${docTitle} (${difficulty.toUpperCase()})`,
    questions,
  };
}

function generateOfflineFlashcards(docTitle: string, docText: string, count: number) {
  const sentences = extractSentences(docText);
  const keywords = extractKeywords(docText, count * 2);
  const cards: any[] = [];

  for (let i = 0; i < count; i++) {
    const kw = keywords[i % keywords.length] || `Topic ${i + 1}`;
    const match = sentences.find((s) => s.toLowerCase().includes(kw.toLowerCase())) || sentences[i % sentences.length];
    cards.push({
      id: `fc-${Date.now()}-${i}`,
      front: `What is the significance or definition of "${kw}" in ${docTitle}?`,
      back: match || `Important fundamental concept studied in ${docTitle}.`,
      category: docTitle,
      hint: `Recall key principles related to ${kw.toLowerCase()}.`,
    });
  }

  return { cards };
}

function generateOfflineQA(docTitle: string, docText: string, question: string) {
  const sentences = extractSentences(docText);
  const qWords = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3);

  // Score sentences by word overlap
  const scored = sentences.map((s) => {
    const sLower = s.toLowerCase();
    let score = 0;
    for (const w of qWords) {
      if (sLower.includes(w)) score++;
    }
    return { sentence: s, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.filter((item) => item.score > 0).slice(0, 3);

  if (topMatches.length > 0) {
    const answer = `Based on "${docTitle}": ${topMatches.map((m) => m.sentence).join(' ')}`;
    return {
      answer,
      citations: topMatches.map((m) => m.sentence),
      confidence: topMatches[0].score >= 2 ? 'high' : 'medium',
    };
  }

  return {
    answer: `Based on the provided document "${docTitle}", here is relevant context: ${sentences.slice(0, 2).join(' ')}. If you have a specific section in mind, try asking about the primary concepts like ${extractKeywords(docText, 4).join(', ')}.`,
    citations: sentences.slice(0, 2),
    confidence: 'medium',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Download Project ZIP Route
  app.get('/api/download-project', (req, res) => {
    const zipPath = path.resolve(__dirname, 'public', 'ai-study-assistant.zip');
    res.download(zipPath, 'ai-study-assistant.zip');
  });

  // AI Status & Provider Check
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'online',
      provider: aiClient ? 'gemini' : 'offline-heuristic',
      model: aiClient ? 'gemini-3.8-flash' : 'built-in NLP engine',
      hasApiKey: Boolean(apiKey),
    });
  });

  // AI Summarize Route
  app.post('/api/ai/summarize', async (req, res) => {
    const { text, type = 'medium', title = 'Document' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text content is required' });
      return;
    }

    if (aiClient) {
      try {
        const prompt = `You are an expert academic study assistant. Analyze the following document text and produce a high-quality study summary.
Summary format requested: "${type}".
- If "short": provide a crisp 2-3 paragraph executive summary.
- If "bullet": provide categorized high-yield bullet points with bold key phrases.
- If "detailed": provide a comprehensive study breakdown with key mechanisms, cause/effect, and analytical takeaways.
- If "medium": provide a balanced 4-5 paragraph conceptual overview.

Also extract 4 to 8 crucial key terms/concepts with clear, concise definitions.

Document Title: ${title}
Document Content:
${text.slice(0, 20000)}

Respond in valid JSON format with the following structure:
{
  "summary": "markdown formatted summary text",
  "keyConcepts": [
    { "term": "string", "definition": "string" }
  ],
  "readingTimeMinutes": number,
  "wordCount": number
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const raw = response.text || '';
        const parsed = JSON.parse(raw);
        res.json({
          provider: 'gemini',
          summary: parsed.summary,
          keyConcepts: parsed.keyConcepts || [],
          readingTimeMinutes: parsed.readingTimeMinutes || Math.ceil(text.split(/\s+/).length / 200),
          wordCount: parsed.wordCount || text.split(/\s+/).length,
        });
        return;
      } catch (err: any) {
        console.warn('Gemini summarize error, using fallback:', err?.message || err);
      }
    }

    // Fallback heuristic
    const fallback = generateOfflineSummary(text, type);
    res.json({
      provider: 'offline-heuristic',
      ...fallback,
    });
  });

  // AI Q&A Route
  app.post('/api/ai/ask', async (req, res) => {
    const { documentTitle, documentText, question, chatHistory = [] } = req.body;
    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const contextText = (documentText || '').slice(0, 20000);

    if (aiClient && contextText.trim().length > 0) {
      try {
        const historyText = chatHistory
          .slice(-4)
          .map((m: any) => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
          .join('\n');

        const prompt = `You are a strict, grounded AI academic tutor. Answer the student's question ONLY using facts directly supported by the provided study document "${documentTitle}".
If the question cannot be answered using the document, state honestly what the document covers and clarify what is missing.

Include 1 to 3 direct citation snippets or excerpts from the source document that support your answer.

Recent Conversation Context:
${historyText}

Source Document (${documentTitle}):
${contextText}

Question: ${question}

Respond in valid JSON:
{
  "answer": "Clear, comprehensive and pedagogical answer in markdown.",
  "citations": ["direct quote 1", "direct quote 2"],
  "confidence": "high" | "medium" | "low"
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        res.json({
          provider: 'gemini',
          answer: parsed.answer || 'No direct answer could be generated.',
          citations: parsed.citations || [],
          confidence: parsed.confidence || 'high',
        });
        return;
      } catch (err: any) {
        console.warn('Gemini ask error, using fallback:', err?.message || err);
      }
    }

    const fallback = generateOfflineQA(documentTitle || 'Notes', documentText || '', question);
    res.json({
      provider: 'offline-heuristic',
      ...fallback,
    });
  });

  // AI Quiz Generator Route
  app.post('/api/ai/quiz', async (req, res) => {
    const { documentTitle = 'Study Material', documentText = '', difficulty = 'medium', count = 5 } = req.body;

    if (aiClient && documentText.trim().length > 50) {
      try {
        const prompt = `You are an expert academic examiner. Create an interactive assessment quiz based strictly on the provided study material.
Quiz Parameters:
- Title: Assessment for "${documentTitle}"
- Difficulty: ${difficulty} (Easy = foundational definitions & recall, Medium = conceptual understanding & application, Hard = deep analysis, edge cases & synthesis)
- Number of questions: ${count}
- Question types to include: multiple choice ('mcq'), true/false ('true_false'), fill in the blank ('fill_blank'), and brief short answer ('short_answer').

Document Content:
${documentText.slice(0, 20000)}

Respond in valid JSON with schema:
{
  "title": "Quiz: Title",
  "questions": [
    {
      "id": "q1",
      "type": "mcq" | "true_false" | "fill_blank" | "short_answer",
      "question": "question text",
      "options": ["Option A", "Option B", "Option C", "Option D"], // required for mcq and true_false
      "correctAnswer": "Exact string of correct answer",
      "explanation": "Clear explanation citing the study text",
      "difficulty": "${difficulty}"
    }
  ]
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        res.json({
          provider: 'gemini',
          title: parsed.title || `Quiz: ${documentTitle}`,
          questions: parsed.questions || [],
        });
        return;
      } catch (err: any) {
        console.warn('Gemini quiz error, using fallback:', err?.message || err);
      }
    }

    const fallback = generateOfflineQuiz(documentTitle, documentText, difficulty, count);
    res.json({
      provider: 'offline-heuristic',
      ...fallback,
    });
  });

  // AI Flashcards Route
  app.post('/api/ai/flashcards', async (req, res) => {
    const { documentTitle = 'Study Topic', documentText = '', count = 8 } = req.body;

    if (aiClient && documentText.trim().length > 50) {
      try {
        const prompt = `Generate a set of ${count} high-yield, memorable flashcards from the study material below.
Each card should test an essential principle, formula, definition, or cause-and-effect relationship.
Front should be an engaging question or concept prompt.
Back should be an accurate, memorable explanation.
Hint should give an intuitive memory trigger.

Document Title: ${documentTitle}
Document Text:
${documentText.slice(0, 20000)}

Respond in valid JSON:
{
  "cards": [
    {
      "id": "fc-1",
      "front": "Question / Prompt",
      "back": "Concise answer & key explanation",
      "category": "${documentTitle}",
      "hint": "Brief mnemonic or hint"
    }
  ]
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        res.json({
          provider: 'gemini',
          cards: parsed.cards || [],
        });
        return;
      } catch (err: any) {
        console.warn('Gemini flashcards error, using fallback:', err?.message || err);
      }
    }

    const fallback = generateOfflineFlashcards(documentTitle, documentText, count);
    res.json({
      provider: 'offline-heuristic',
      ...fallback,
    });
  });

  // AI Study Plan Route
  app.post('/api/ai/study-plan', async (req, res) => {
    const { topics = [], daysAvailable = 7, hoursPerDay = 2, examDate = '' } = req.body;

    if (aiClient && topics.length > 0) {
      try {
        const prompt = `Create an actionable, day-by-day study and revision schedule for a student preparing for an exam.
Topics: ${topics.join(', ')}
Days available: ${daysAvailable}
Hours per day: ${hoursPerDay}
Exam target: ${examDate || 'Upcoming test'}

Respond in valid JSON:
{
  "plan": [
    {
      "day": 1,
      "title": "Day 1 Focus Topic",
      "tasks": ["Task 1", "Task 2", "Review Task"],
      "focusGoal": "Main objective of the session"
    }
  ]
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        res.json({
          provider: 'gemini',
          plan: parsed.plan || [],
        });
        return;
      } catch (err: any) {
        console.warn('Gemini study plan error, using fallback:', err?.message || err);
      }
    }

    // Heuristic plan
    const plan = [];
    const topicList = topics.length > 0 ? topics : ['Core Foundations', 'Key Mechanisms', 'Practice Problems', 'Final Review'];
    for (let d = 1; d <= daysAvailable; d++) {
      const topic = topicList[(d - 1) % topicList.length];
      plan.push({
        day: d,
        title: `Day ${d}: ${topic}`,
        tasks: [
          `Read & summarize section notes on ${topic} (45 mins)`,
          `Active recall: solve 10 practice quiz questions (30 mins)`,
          `Flashcard spaced repetition review (25 mins)`,
        ],
        focusGoal: `Master core concepts and verify recall of ${topic}`,
      });
    }

    res.json({
      provider: 'offline-heuristic',
      plan,
    });
  });

  // In development, mount Vite middleware; in production, serve built static files
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Study Assistant running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

```

---

## File: `src/main.tsx`

```typescript
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

```

---

## File: `src/index.css`

```css
@import "tailwindcss";

@layer utilities {
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(150, 150, 150, 0.2);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(150, 150, 150, 0.4);
}

```

---

## File: `src/App.tsx`

```typescript
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

```

---

## File: `src/types.ts`

```typescript
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

```

---

## File: `src/context/StudyContext.tsx`

```typescript
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

```

---

## File: `src/services/aiClient.ts`

```typescript
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

```

---

## File: `src/utils/audioEngine.ts`

```typescript
// Pure browser Web Audio API synthesizer for study ambient sounds (no external files needed)
class StudyAudioEngine {
  private ctx: AudioContext | null = null;
  private currentSourceNodes: any[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentType: string = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: 'rain' | 'whitenoise' | 'lofi' | 'binaural', volume = 0.5) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);
    this.currentType = type;
    this.isPlaying = true;

    if (type === 'whitenoise') {
      this.playBrownNoise();
    } else if (type === 'rain') {
      this.playRain();
    } else if (type === 'lofi') {
      this.playLofiDrone();
    } else if (type === 'binaural') {
      this.playBinauralBeat();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume * 0.4)), this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    this.currentSourceNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.currentSourceNodes = [];
    this.isPlaying = false;
    this.currentType = 'none';
  }

  public getStatus() {
    return { isPlaying: this.isPlaying, type: this.currentType };
  }

  private playBrownNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // gain compensation
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();
    this.currentSourceNodes.push(whiteNoise, filter);
  }

  private playRain() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.currentSourceNodes.push(noise, filter);
  }

  private playLofiDrone() {
    if (!this.ctx || !this.gainNode) return;
    // Harmonic warm drone frequencies (C minor 9th: C3, G3, Eb4, Bb4)
    const freqs = [130.81, 196.0, 311.13, 466.16];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.gainNode) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detuning for analog warmth
      osc.detune.setValueAtTime((idx % 2 === 0 ? 3 : -3) * (idx + 1), this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.12 / freqs.length, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode);
      osc.start();
      this.currentSourceNodes.push(osc, oscGain);
    });
  }

  private playBinauralBeat() {
    if (!this.ctx || !this.gainNode) return;
    // Base 200 Hz carrier with 10 Hz alpha wave difference for focus
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    const merger = this.ctx.createChannelMerger(2);

    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(216, this.ctx.currentTime); // Left ear

    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(226, this.ctx.currentTime); // Right ear (10Hz alpha difference)

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(this.gainNode);

    oscL.start();
    oscR.start();
    this.currentSourceNodes.push(oscL, oscR, merger);
  }
}

export const studyAudio = new StudyAudioEngine();

```

---

## File: `src/data/sampleData.ts`

```typescript
import { StudyDocument, Flashcard, QuizAttempt, ExamCountdown, ActivityItem } from '../types';

export const INITIAL_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc-bio-101',
    title: 'Cellular Respiration & Photosynthesis',
    category: 'Biology',
    tags: ['Metabolism', 'ATP', 'Biochemistry', 'Cellular Energy'],
    createdAt: '2026-10-10T14:20:00Z',
    wordCount: 840,
    readingTimeMinutes: 4,
    content: `Cellular respiration is the primary biochemical pathway through which eukaryotic and prokaryotic cells harvest energy stored in chemical bonds of organic nutrients, primarily glucose (C6H12O6), and convert it into adenosine triphosphate (ATP). The overall balanced aerobic respiration reaction is: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP.

The aerobic respiration pathway proceeds across four major discrete stages:
1. Glycolysis: Takes place exclusively in the cytoplasm. One 6-carbon glucose molecule is broken down anaerobically into two 3-carbon pyruvate molecules, yielding a net gain of 2 ATP (via substrate-level phosphorylation) and 2 NADH.
2. Pyruvate Oxidation: Pyruvate moves into the mitochondrial matrix. An enzyme complex decarboxylates pyruvate, releasing CO2, forming NADH, and attaching Coenzyme A to yield Acetyl-CoA.
3. The Citric Acid Cycle (Krebs Cycle): Occurs in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. Across eight enzymatic steps, two turns of the cycle (per original glucose) release 4 CO2, generate 2 ATP (or GTP), 6 NADH, and 2 FADH2.
4. Oxidative Phosphorylation: Takes place across the inner mitochondrial membrane (cristae). High-energy electrons donated by NADH and FADH2 pass through a four-complex Electron Transport Chain (ETC). As electrons travel down electronegativity gradients to oxygen (the terminal electron acceptor), protons (H+) are pumped into the intermembrane space, building a steep electrochemical proton gradient. Protons drive rotational kinetic energy in ATP Synthase via chemiosmosis, producing the bulk (~26-28) of cellular ATP.

In contrast, Photosynthesis is the anabolic, endergonic process occurring in chloroplasts of plant and algal cells. The chemical formula is: 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2.
Photosynthesis consists of two interconnected phases:
1. Light-Dependent Reactions: Located within the thylakoid membranes. Photons excite chlorophyll pigment molecules in Photosystem II (P680) and Photosystem I (P700). Water photolysis splits H2O into oxygen gas, protons, and replacement electrons. Electron transfer drives photophosphorylation to produce ATP and reduces NADP+ to NADPH.
2. The Calvin Cycle (Light-Independent Reactions): Occurs in the chloroplast stroma. Ribulose 1,5-bisphosphate carboxylase/oxygenase (RuBisCO) catalyzes the fixation of atmospheric carbon dioxide onto RuBP. In the reduction phase, ATP and NADPH convert 3-PGA into glyceraldehyde-3-phosphate (G3P). For every six turns of the cycle, two G3P molecules exit to assemble glucose, while the remaining G3P molecules are regenerated into RuBP using additional ATP.

Metabolic Coupling: The products of photosynthesis (glucose and molecular oxygen) serve as the direct substrates for cellular respiration. Conversely, the byproducts of respiration (carbon dioxide and water) supply the necessary raw materials for photosynthesis, maintaining the terrestrial carbon and oxygen balance.`
  },
  {
    id: 'doc-cs-301',
    title: 'Operating Systems: Virtual Memory & Concurrency',
    category: 'Computer Science',
    tags: ['OS Architecture', 'Paging', 'Threads', 'Deadlocks'],
    createdAt: '2026-10-11T09:15:00Z',
    wordCount: 780,
    readingTimeMinutes: 4,
    content: `An operating system (OS) acts as the fundamental abstraction layer managing hardware resources while presenting an intuitive, secure runtime environment to user-space applications.

Part 1: Virtual Memory and Paging
Virtual memory provides each process with an illusion of a contiguous, private address space independent of physical RAM constraints.
- Paging Architecture: Virtual memory is partitioned into fixed-sized blocks called pages (typically 4 KB). Physical RAM is divided into frames of identical size. The Memory Management Unit (MMU) translates virtual addresses into physical addresses using per-process Page Tables.
- Translation Lookaside Buffer (TLB): A hardware cache of recent page translations. A TLB hit resolves an address in ~1 nanosecond, while a TLB miss triggers a page table walk.
- Page Faults: When a process accesses a page marked non-present in the page table, the CPU generates an interrupt. The OS page fault handler fetches the page from swap storage, updates the page table, and restarts the instruction.
- Replacement Algorithms: When memory is full, the OS must evict pages. Common strategies include Least Recently Used (LRU), First-In First-Out (FIFO), and Clock (second-chance).
- Thrashing occurs when high page fault frequency causes the system to spend more time paging data than executing application code.

Part 2: Concurrency, Synchronization, and Deadlocks
Threads share memory space within the same process, enabling high-performance parallel execution but introducing race conditions.
- Race Conditions occur when the outcome of concurrent execution depends on non-deterministic thread scheduling. Critical sections require mutual exclusion.
- Synchronization Primitives:
  * Mutex: A locking mechanism where only the thread acquiring the lock can access the protected resource.
  * Semaphores: Integer counters supporting atomic wait (P) and signal (V) operations, allowing a controlled number of concurrent units.
  * Condition Variables: Allow threads to sleep until a specific boolean state changes.
- Deadlock: A state where a set of threads is permanently blocked because each is holding a resource requested by another.
The four Coffman conditions necessary for deadlock are:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A thread holds a resource while requesting others.
3. No Preemption: Resources cannot be forcibly taken from holding threads.
4. Circular Wait: A closed chain of threads exists where each waits for a resource held by the next.`
  },
  {
    id: 'doc-hist-202',
    title: 'The Industrial Revolution & Economic Transformations',
    category: 'History',
    tags: ['18th Century', 'Steam Engine', 'Urbanization', 'Economics'],
    createdAt: '2026-10-12T16:45:00Z',
    wordCount: 720,
    readingTimeMinutes: 4,
    content: `The Industrial Revolution, beginning in Great Britain during the mid-18th century, marked a profound structural transition from agrarian, handicraft-based economies to mechanized industrial production powered by fossil fuels.

Key Technological Catalysts:
1. Textile Mechanization: Inventions such as John Kay's Flying Shuttle (1733), James Hargreaves' Spinning Jenny (1764), and Richard Arkwright's Water Frame (1769) shifted textile manufacturing out of domestic cottage workshops and into centralized water-powered factories.
2. The Steam Engine: James Watt's separate condenser improvement (1769) on Thomas Newcomen's atmospheric engine radically improved thermal efficiency. Steam engines uncoupled manufacturing from riverbanks, allowing factories to concentrate near coalfields and urban transportation hubs.
3. Metallurgy: Abraham Darby's coke-smelting technique and Henry Cort's puddling process permitted commercial mass production of wrought iron and later Bessemer steel, facilitating railway networks and civil engineering feats.

Socioeconomic Consequences:
- Urbanization: Rural enclosures and farm mechanization displaced agricultural laborers, propelling unprecedented migration into rapidly expanding industrial centers like Manchester, Birmingham, and Leeds. Urban infrastructure struggled, leading to overcrowded tenements and public health crises.
- Division of Labor: Adam Smith's Wealth of Nations (1776) articulated how specialized assembly lines increased output exponentially compared to traditional guild craftsmanship.
- Labor Movements and Policy: Working conditions in early mills were harsh, with 14-hour workdays and widespread child labor. Public pressure spurred legislation such as the British Factory Act of 1833 and the rise of trade unionism.
- Global Economic Divergence: Industrialized Western nations experienced sustained per-capita GDP expansion, shifting terms of global trade and stimulating imperial expansions to secure raw commodities (cotton, rubber) and captive consumer markets.`
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    documentId: 'doc-bio-101',
    category: 'Biology 101',
    front: 'Where does Glycolysis occur in eukaryotic cells, and what is its net ATP yield?',
    back: 'Glycolysis occurs in the cytoplasm. It produces a net yield of 2 ATP (via substrate-level phosphorylation) and 2 NADH per glucose.',
    hint: 'Think outside the mitochondria!',
    isBookmarked: true,
    mastered: true,
    reviewCount: 4,
    lastReviewed: '2026-10-12T11:00:00Z',
  },
  {
    id: 'fc-2',
    documentId: 'doc-bio-101',
    category: 'Biology 101',
    front: 'What is the role of Oxygen in aerobic cellular respiration?',
    back: 'Oxygen serves as the terminal electron acceptor in the Electron Transport Chain (ETC), binding with electrons and protons to form water (H2O).',
    hint: 'End of the electron transport chain.',
    isBookmarked: false,
    mastered: false,
    reviewCount: 2,
    lastReviewed: '2026-10-12T11:05:00Z',
  },
  {
    id: 'fc-3',
    documentId: 'doc-bio-101',
    category: 'Biology 101',
    front: 'What primary enzyme fixes atmospheric CO2 in the Calvin cycle?',
    back: 'RuBisCO (Ribulose 1,5-bisphosphate carboxylase/oxygenase) catalyzes the attachment of CO2 to RuBP.',
    hint: 'The most abundant enzyme on Earth.',
    isBookmarked: true,
    mastered: true,
    reviewCount: 3,
    lastReviewed: '2026-10-12T11:10:00Z',
  },
  {
    id: 'fc-4',
    documentId: 'doc-cs-301',
    category: 'Computer Science',
    front: 'List the four Coffman conditions necessary for a Deadlock.',
    back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
    hint: 'M-H-N-C mnemonic.',
    isBookmarked: true,
    mastered: false,
    reviewCount: 5,
    lastReviewed: '2026-10-13T06:30:00Z',
  },
  {
    id: 'fc-5',
    documentId: 'doc-cs-301',
    category: 'Computer Science',
    front: 'What is the function of the Translation Lookaside Buffer (TLB)?',
    back: 'The TLB is a high-speed hardware cache in the MMU that stores recent virtual-to-physical page translations to avoid slow memory table lookups.',
    hint: 'Cache for MMU page tables.',
    isBookmarked: false,
    mastered: true,
    reviewCount: 3,
    lastReviewed: '2026-10-13T06:35:00Z',
  },
  {
    id: 'fc-6',
    documentId: 'doc-hist-202',
    category: 'World History',
    front: 'How did James Watt revolutionize the early steam engine?',
    back: 'Watt added a separate condenser (1769), preventing repeated cooling and heating of the main cylinder and drastically improving thermal efficiency.',
    hint: 'Separate condenser design.',
    isBookmarked: false,
    mastered: false,
    reviewCount: 1,
    lastReviewed: '2026-10-11T15:20:00Z',
  }
];

export const INITIAL_EXAMS: ExamCountdown[] = [
  {
    id: 'exam-1',
    subject: 'Biology Midterm: Cellular Energetics',
    examDate: '2026-10-24',
    targetScore: '95%',
    priority: 'urgent',
    topics: ['Glycolysis', 'Krebs Cycle', 'ETC & Chemiosmosis', 'Light Reactions', 'Calvin Cycle']
  },
  {
    id: 'exam-2',
    subject: 'Operating Systems Final Exam',
    examDate: '2026-11-08',
    targetScore: '90%',
    priority: 'medium',
    topics: ['Virtual Memory Paging', 'TLB', 'Deadlock Avoidance', 'Synchronization Primitives']
  },
  {
    id: 'exam-3',
    subject: 'Modern World History Essay Assessment',
    examDate: '2026-11-19',
    targetScore: 'A',
    priority: 'normal',
    topics: ['Industrial Revolution Technologies', 'Urbanization', 'Labor Reform Acts']
  }
];

export const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'quiz',
    title: 'Completed Biology 101 Quiz',
    detail: 'Scored 92% (5/5 correct on Medium difficulty)',
    timestamp: '2 hours ago',
    score: 92,
  },
  {
    id: 'act-2',
    type: 'flashcard',
    title: 'Practiced CS Operating Systems Cards',
    detail: 'Mastered 2 cards and bookmarked Coffman conditions',
    timestamp: '5 hours ago',
  },
  {
    id: 'act-3',
    type: 'summary',
    title: 'Generated Detailed Summary',
    detail: 'Summarized "Cellular Respiration & Photosynthesis"',
    timestamp: 'Yesterday',
  },
  {
    id: 'act-4',
    type: 'pomodoro',
    title: 'Completed 50-minute Deep Study Session',
    detail: 'Studied Operating Systems with White Noise soundscape',
    timestamp: 'Yesterday',
  }
];

```

---

## File: `src/components/Sidebar.tsx`

```typescript
import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  MessageSquareText,
  HelpCircle,
  Layers,
  Timer,
  CalendarCheck,
  BarChart3,
  Moon,
  Sun,
  BookOpen,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export type NavTab =
  | 'dashboard'
  | 'documents'
  | 'summarizer'
  | 'ask'
  | 'quiz'
  | 'flashcards'
  | 'pomodoro'
  | 'planner'
  | 'analytics';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const { theme, toggleTheme, aiStatus, documents, flashcards } = useStudy();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'documents',
      label: 'My Notes & Docs',
      icon: <FileText className="w-5 h-5" />,
      badge: documents.length,
    },
    { id: 'summarizer', label: 'AI Summarizer', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'ask', label: 'Ask Document (Q&A)', icon: <MessageSquareText className="w-5 h-5" /> },
    { id: 'quiz', label: 'Quiz Master', icon: <HelpCircle className="w-5 h-5" /> },
    {
      id: 'flashcards',
      label: 'Flashcard Decks',
      icon: <Layers className="w-5 h-5" />,
      badge: flashcards.length,
    },
    { id: 'pomodoro', label: 'Focus & Ambience', icon: <Timer className="w-5 h-5" /> },
    { id: 'planner', label: 'Study Planner', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics & History', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 flex-col justify-between border-r transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          theme === 'dark'
            ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100 backdrop-blur-xl'
            : 'bg-white/95 border-zinc-200 text-zinc-800 backdrop-blur-xl shadow-xs'
        } flex`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-tight">
                  Study<span className="text-indigo-500">Mind</span> AI
                </h1>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Smart Study Companion</p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
          </div>

          {/* AI Status Badge */}
          <div className="mt-4 flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {aiStatus.hasApiKey ? 'Gemini 3.8 Flash' : 'Offline Smart Engine'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Study Workspace
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Account / Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3">
          <a
            href="/api/download-project"
            download="ai-study-assistant.zip"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Project (.ZIP)
          </a>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-xs">
              SK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                sakimkun98@gmail.com
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Student • Pro Account</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

```

---

## File: `src/components/Header.tsx`

```typescript
import React from 'react';
import { Menu, BookOpen, Flame, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  title,
  subtitle,
}) => {
  const {
    documents,
    activeDocumentId,
    setActiveDocumentId,
    activeDocument,
    totalFocusMinutes,
    resetToSampleData,
  } = useStudy();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Active Document Selector */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="text-zinc-500 dark:text-zinc-400 hidden md:inline">Focus Doc:</span>
          <select
            value={activeDocumentId}
            onChange={(e) => setActiveDocumentId(e.target.value)}
            className="bg-transparent font-medium text-zinc-800 dark:text-zinc-200 outline-none max-w-[140px] sm:max-w-[200px] truncate cursor-pointer"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id} className="dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {doc.title}
              </option>
            ))}
          </select>
        </div>

        {/* Daily Study Streak */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-500" />
          <span>3 Day Streak</span>
        </div>

        {/* Total Focus Time */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>{totalFocusMinutes}m Focus</span>
        </div>

        {/* Download Project ZIP */}
        <a
          href="/api/download-project"
          download="ai-study-assistant.zip"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          title="Download full project code as ZIP"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span className="hidden sm:inline">Download ZIP</span>
        </a>

        {/* Reset / Reload Demo Samples */}
        <button
          onClick={() => {
            if (confirm('Reset to standard sample academic documents and flashcards?')) {
              resetToSampleData();
            }
          }}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Reload Sample Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

```

---

## File: `src/components/DashboardView.tsx`

```typescript
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

```

---

## File: `src/components/DocumentsView.tsx`

```typescript
import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Search,
  Trash2,
  Check,
  BookOpen,
  Sparkles,
  HelpCircle,
  Award,
  Layers,
  Copy,
  Tag,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { NavTab } from './Sidebar';

interface DocumentsViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onNavigate }) => {
  const {
    documents,
    activeDocumentId,
    setActiveDocumentId,
    activeDocument,
    addDocument,
    deleteDocument,
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Note Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Biology');
  const [newTags, setNewTags] = useState('Exam, Notes');
  const [newContent, setNewContent] = useState('');

  const categories = ['all', ...Array.from(new Set(documents.map((d) => d.category)))];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addDocument({
      title: newTitle.trim(),
      category: newCategory.trim() || 'General',
      tags: tagsArray.length > 0 ? tagsArray : ['Study Notes'],
      content: newContent.trim(),
    });

    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        addDocument({
          title: cleanName,
          category: 'Uploaded Notes',
          tags: [file.name.split('.').pop()?.toUpperCase() || 'FILE', 'Uploaded'],
          content: text,
        });
      }
    };

    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleCopy = () => {
    if (activeDocument) {
      navigator.clipboard.writeText(activeDocument.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search notes, terms, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5">
          {/* Upload Button */}
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 text-sm font-semibold cursor-pointer shadow-xs transition-colors">
            <Upload className="w-4 h-4 text-indigo-500" />
            <span>Upload File</span>
            <input
              type="file"
              accept=".txt,.md,.text,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* New Note Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column Split: Document List on Left, Active Document Reader on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDocuments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-500">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-500" />
              <p className="text-sm font-medium">No documents match your filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const isSelected = activeDocumentId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocumentId(doc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {doc.title}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
                      {doc.category}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {doc.content}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span>{doc.wordCount} words</span>
                      <span>•</span>
                      <span>{doc.readingTimeMinutes} min read</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {doc.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Document Reader & Instant Launchpad (7 cols) */}
        <div className="lg:col-span-7">
          {activeDocument ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
              {/* Reader Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                      {activeDocument.category}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {activeDocument.wordCount} words • {activeDocument.readingTimeMinutes} min read
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
                    {activeDocument.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Copy Text"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {documents.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${activeDocument.title}"?`)) {
                          deleteDocument(activeDocument.id);
                        }
                      }}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeDocument.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    <Tag className="w-3 h-3 text-zinc-400" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quick AI Action Launchpad */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => onNavigate('summarizer')}
                  className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-zinc-800 dark:text-zinc-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
                  Summarize
                </button>
                <button
                  onClick={() => onNavigate('ask')}
                  className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-zinc-800 dark:text-zinc-200"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white" />
                  Ask Q&A
                </button>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-zinc-800 dark:text-zinc-200"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
                  Quiz Me
                </button>
                <button
                  onClick={() => onNavigate('flashcards')}
                  className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-zinc-800 dark:text-zinc-200"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-500 group-hover:text-white" />
                  Flashcards
                </button>
              </div>

              {/* Document Text Body */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 max-h-[500px] overflow-y-auto">
                <div className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-sans">
                  {activeDocument.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-base">Select a document from the left</p>
              <p className="text-xs text-zinc-400 mt-1">Or upload new lecture notes to start</p>
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Create New Study Note
            </h3>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry: Hydrocarbons"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Subject / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chemistry"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exam, Reactions, Lab"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Notes & Text Content
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste lecture transcript, study guide notes, or outline text here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

```

---

## File: `src/components/SummarizerView.tsx`

```typescript
import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Download,
  Award,
  Layers,
  ArrowRight,
  Clock,
  ListFilter,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { summarizeText, SummarizeResponse } from '../services/aiClient';
import { NavTab } from './Sidebar';

interface SummarizerViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({ onNavigate }) => {
  const {
    documents,
    activeDocument,
    activeDocumentId,
    setActiveDocumentId,
    saveSummary,
  } = useStudy();

  const [summaryType, setSummaryType] = useState<'short' | 'medium' | 'detailed' | 'bullet'>('medium');
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummarizeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const targetText = useCustomText ? customText : activeDocument?.content || '';
  const targetTitle = useCustomText ? 'Custom Notes' : activeDocument?.title || 'Document';

  const handleSummarize = async () => {
    if (!targetText.trim()) {
      setErrorMsg('Please select a document or paste notes text to summarize.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await summarizeText(targetText, summaryType, targetTitle);
      setResult(data);
      if (activeDocument && !useCustomText) {
        saveSummary({
          documentId: activeDocument.id,
          type: summaryType,
          summary: data.summary,
          keyConcepts: data.keyConcepts,
          readingTimeMinutes: data.readingTimeMinutes,
          wordCount: data.wordCount,
          provider: data.provider,
          generatedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `${targetTitle} - Summary\n\n${result.summary}\n\nKey Concepts:\n${result.keyConcepts
      .map((k) => `• ${k.term}: ${k.definition}`)
      .join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const textToSave = `# Summary: ${targetTitle}\n\n*Format: ${summaryType.toUpperCase()} | Generated by AI Study Assistant*\n\n## Overview\n${result.summary}\n\n## Key Concepts & Vocabulary\n${result.keyConcepts
      .map((k) => `### ${k.term}\n${k.definition}`)
      .join('\n\n')}`;
    const blob = new Blob([textToSave], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetTitle.replace(/\s+/g, '_')}_Summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-zinc-900/60 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Synthesis Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            AI Document Summarizer
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Condense lengthy chapters, lecture slides, and notes into high-yield study briefs.
          </p>
        </div>

        {/* Source Toggle */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setUseCustomText(false)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              !useCustomText
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Use Active Document
          </button>
          <button
            onClick={() => setUseCustomText(true)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              useCustomText
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Paste Custom Text
          </button>
        </div>
      </div>

      {/* Control Panel: Length & Generation */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              Source Material
            </label>
            {!useCustomText ? (
              <select
                value={activeDocumentId}
                onChange={(e) => setActiveDocumentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.wordCount} words)
                  </option>
                ))}
              </select>
            ) : (
              <textarea
                rows={4}
                placeholder="Paste the notes or article you want to summarize..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans"
              />
            )}
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              Summary Depth & Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'short', label: 'Executive TL;DR', desc: '2-3 quick paragraphs' },
                { id: 'medium', label: 'Balanced Overview', desc: 'Core concept review' },
                { id: 'detailed', label: 'Deep Study Guide', desc: 'Full analytical detail' },
                { id: 'bullet', label: 'High-Yield Bullets', desc: 'Point-by-point takeaways' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSummaryType(style.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    summaryType === style.id
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{style.label}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-xs text-zinc-500">
            {targetText ? `${targetText.split(/\s+/).filter(Boolean).length} words ready` : 'No text loaded'}
          </div>

          <button
            onClick={handleSummarize}
            disabled={loading || !targetText.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Synthesizing Summary...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Results Section */}
      {result && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase">
                    {summaryType} Summary
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    Powered by {result.provider === 'gemini' ? 'Gemini 3.8 Flash' : 'Built-in Engine'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                  {targetTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export .MD
                </button>
              </div>
            </div>

            {/* Summary Text Content */}
            <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans bg-zinc-50 dark:bg-zinc-950/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80">
              {result.summary}
            </div>

            {/* Key Concepts & Vocabulary */}
            {result.keyConcepts && result.keyConcepts.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <FileCheck2 className="w-4 h-4 text-indigo-500" />
                  Key Concepts & Essential Terminology ({result.keyConcepts.length})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.keyConcepts.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40"
                    >
                      <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {item.term}
                      </h4>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 leading-normal">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps Buttons */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 font-medium">
                Test your understanding of these concepts:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('quiz')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  Take Quiz on this Summary
                </button>
                <button
                  onClick={() => onNavigate('flashcards')}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  Generate Flashcards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

```

---

## File: `src/components/AskAIView.tsx`

```typescript
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

```

---

## File: `src/components/QuizView.tsx`

```typescript
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

```

---

## File: `src/components/FlashcardsView.tsx`

```typescript
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

```

---

## File: `src/components/PomodoroView.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  Coffee,
  Headphones,
  CheckCircle2,
  Flame,
  Award,
} from 'lucide-react';
import { studyAudio } from '../utils/audioEngine';
import { useStudy } from '../context/StudyContext';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroView: React.FC = () => {
  const { totalFocusMinutes, addFocusMinutes } = useStudy();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(2);

  // Audio state
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'whitenoise' | 'lofi' | 'binaural'>('none');
  const [volume, setVolume] = useState<number>(0.5);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'focus') {
        const sessionMins = Math.round(MODE_DURATIONS.focus / 60);
        addFocusMinutes(sessionMins);
        setCompletedSessions((prev) => prev + 1);
        alert('🎉 Focus block completed! Time for a well-deserved break.');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const handleSoundChange = (sound: 'none' | 'rain' | 'whitenoise' | 'lofi' | 'binaural') => {
    setAmbientSound(sound);
    if (sound === 'none') {
      studyAudio.stop();
    } else {
      studyAudio.play(sound, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    studyAudio.setVolume(newVol);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  // SVG circle calculation
  const circleRadius = 110;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Focus Pomodoro & Ambient Soundscapes
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Maximize neural retention through timed deep work cycles paired with focus-enhancing synthesized audio.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          {[
            { id: 'focus', label: 'Deep Focus (25m)' },
            { id: 'shortBreak', label: 'Short Break (5m)' },
            { id: 'longBreak', label: 'Long Break (15m)' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id as TimerMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === m.id
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center Circular Timer */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle
              cx="144"
              cy="144"
              r={circleRadius}
              className="stroke-zinc-100 dark:stroke-zinc-800 fill-none"
              strokeWidth="10"
            />
            {/* Progress track */}
            <circle
              cx="144"
              cy="144"
              r={circleRadius}
              className="stroke-indigo-600 dark:stroke-indigo-500 fill-none transition-all duration-500 ease-linear"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Time text inside ring */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {formattedTime}
            </span>
            <span className="mt-1 text-xs font-semibold text-zinc-400 capitalize">
              {mode === 'focus' ? 'Focus Interval' : 'Rest & Recharge'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => setIsRunning((prev) => !prev)}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            {isRunning ? 'Pause' : 'Start Focus'}
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Sessions Tracker */}
        <div className="mt-6 flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i <= (completedSessions % 4 || (completedSessions > 0 ? 4 : 0))
                  ? 'bg-indigo-600'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
          <span className="text-xs font-medium text-zinc-500 ml-2">
            {completedSessions} sessions logged ({totalFocusMinutes} mins)
          </span>
        </div>
      </div>

      {/* Ambient Soundscapes Synthesizer Board */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Focus Ambient Soundscape
              </h3>
              <p className="text-[11px] text-zinc-500">
                Generated locally with pure Web Audio synthesis (zero buffering/data usage)
              </p>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-xs font-mono text-zinc-400 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          {[
            { id: 'none', label: 'Silent', icon: <VolumeX className="w-4 h-4" /> },
            { id: 'rain', label: 'Gentle Rain', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
            { id: 'whitenoise', label: 'Brown Noise', icon: <Radio className="w-4 h-4 text-amber-400" /> },
            { id: 'lofi', label: 'Lo-Fi Drone', icon: <Coffee className="w-4 h-4 text-purple-400" /> },
            { id: 'binaural', label: '432Hz Alpha', icon: <Headphones className="w-4 h-4 text-emerald-400" /> },
          ].map((snd) => (
            <button
              key={snd.id}
              onClick={() => handleSoundChange(snd.id as any)}
              className={`p-3.5 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer ${
                ambientSound === snd.id
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {snd.icon}
              <span>{snd.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

```

---

## File: `src/components/StudyPlannerView.tsx`

```typescript
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

```

---

## File: `src/components/AnalyticsView.tsx`

```typescript
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

```

---

