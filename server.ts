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
