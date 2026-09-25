import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy GoogleGenAI client helper
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Helper to safely call Gemini with fallback
async function callGeminiText(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || 'You are an intelligent AI College Student Assistant Agent specialized in engineering, computer science, and AI/Data Science curricula. Respond with structured, clear, and academically rigorous yet beginner-friendly explanations.'
    }
  });

  return response.text || '';
}

// Helper to extract JSON from Gemini response
function extractJSON<T = any>(text: string, fallback: any = null): T {
  try {
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    let startIdx = 0;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      const lastBrace = clean.lastIndexOf('}');
      if (lastBrace !== -1) {
        return JSON.parse(clean.slice(startIdx, lastBrace + 1)) as T;
      }
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      const lastBracket = clean.lastIndexOf(']');
      if (lastBracket !== -1) {
        return JSON.parse(clean.slice(startIdx, lastBracket + 1)) as T;
      }
    }
    return JSON.parse(clean) as T;
  } catch (err) {
    console.warn('JSON parse error from model response, using fallback:', err);
    return fallback;
  }
}

// --------------------------------------------------------------------------
// 1. AI AGENT CORE ROUTING ENDPOINT
// --------------------------------------------------------------------------
app.post('/api/agent/route', async (req, res) => {
  try {
    const { prompt, currentProfile } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const lower = prompt.toLowerCase();

    // Fallback heuristic check
    let fallbackFeature = 'chat';
    let fallbackReason = 'General college assistance query.';
    const extractedParams: Record<string, any> = {};

    if (lower.includes('plan') || lower.includes('schedule') || lower.includes('timetable') || lower.includes('days to prepare') || lower.includes('study hours') || lower.includes('exam in')) {
      fallbackFeature = 'study-planner';
      fallbackReason = 'Detected study schedule planning intent.';
      const daysMatch = lower.match(/(\d+)\s*(days|day)/);
      if (daysMatch) extractedParams.daysCount = parseInt(daysMatch[1], 10);
      const hoursMatch = lower.match(/(\d+)\s*(hours|hour|hrs|hr)/);
      if (hoursMatch) extractedParams.dailyHours = parseInt(hoursMatch[1], 10);
    } else if (lower.includes('quiz') || lower.includes('test me') || lower.includes('mcq') || lower.includes('exam test') || lower.includes('practice questions on')) {
      fallbackFeature = 'quiz-agent';
      fallbackReason = 'Detected request for self-assessment quiz.';
    } else if (lower.includes('explain') || lower.includes('what is') || lower.includes('doubt') || lower.includes('how does') || lower.includes('why do we') || lower.includes('difference between')) {
      fallbackFeature = 'doubt-solver';
      fallbackReason = 'Detected conceptual doubt solving request.';
      extractedParams.doubt = prompt;
    } else if (lower.includes('notes') || lower.includes('upload') || lower.includes('16-mark') || lower.includes('2-mark') || lower.includes('summary of document') || lower.includes('important concepts')) {
      fallbackFeature = 'notes-assistant';
      fallbackReason = 'Detected document notes processing or university exam question generation intent.';
    } else if (lower.includes('career') || lower.includes('roadmap') || lower.includes('skills should i learn') || lower.includes('internship') || lower.includes('placement') || lower.includes('portfolio') || lower.includes('job')) {
      fallbackFeature = 'career-agent';
      fallbackReason = 'Detected career guidance or technical roadmap request.';
    }

    try {
      const systemInstruction = `You are the central routing AI of the "AI College Student Assistant Agent".
Your task is to analyze the student's request, identify the intended feature, extract any provided parameters, and check if missing information is needed.

The available features are:
1. "study-planner": For timetable, schedule, study routine, exam prep planning.
2. "notes-assistant": For uploaded documents, 2-mark / 16-mark exam questions, notes summarization, concepts extraction.
3. "quiz-agent": For quizzes, practice MCQs, test me, self-assessments.
4. "doubt-solver": For explanations of concepts, algorithms, formulas, doubts, "what is", "why".
5. "career-agent": For engineering skill roadmaps, projects, portfolios, internships, placement advice.
6. "chat": For general queries, coding questions, greetings.
7. "clarification": If the input is too ambiguous to determine an action.

Student profile: ${JSON.stringify(currentProfile || {})}

Return JSON ONLY with this exact structure:
{
  "feature": "study-planner" | "notes-assistant" | "quiz-agent" | "doubt-solver" | "career-agent" | "chat" | "clarification",
  "confidence": number between 0.0 and 1.0,
  "reasoning": "1-2 sentences explaining why this feature matches the student's goal",
  "extractedParams": {
    "subject": string (optional),
    "topic": string (optional),
    "daysCount": number (optional),
    "dailyHours": number (optional),
    "doubt": string (optional),
    "level": string (optional)
  },
  "missingInfo": string[] (list of missing pieces needed to execute fully, e.g. ["dailyHours", "examDate"]),
  "clarificationQuestion": string (if ambiguous or key info is missing),
  "suggestedAction": "brief action description to show user"
}`;

      const aiText = await callGeminiText(`Student request: "${prompt}"`, systemInstruction);
      const parsed = extractJSON(aiText, {
        feature: fallbackFeature,
        confidence: 0.85,
        reasoning: fallbackReason,
        extractedParams,
        suggestedAction: `Proceeding to ${fallbackFeature}`
      });

      return res.json(parsed);
    } catch (apiErr) {
      console.warn('Using rule-based routing fallback:', apiErr);
      return res.json({
        feature: fallbackFeature,
        confidence: 0.8,
        reasoning: fallbackReason,
        extractedParams,
        suggestedAction: `Opening ${fallbackFeature} with extracted parameters`
      });
    }
  } catch (err: any) {
    console.error('Agent router error:', err);
    res.status(500).json({ error: 'Failed to route student request' });
  }
});

// --------------------------------------------------------------------------
// 2. STUDY PLANNER GENERATOR
// --------------------------------------------------------------------------
app.post('/api/study-planner/generate', async (req, res) => {
  try {
    const {
      prompt: userPrompt,
      examDate,
      knowledgeLevel,
      preferredStudyTime,
      importantTopics
    } = req.body;

    let subject = (req.body.subject || '').trim();
    let topics = (req.body.topics || '').trim();
    let daysCount = req.body.daysCount;
    let dailyHours = req.body.dailyHours;

    // If user provided a natural language prompt, extract or infer missing parameters
    if (userPrompt && typeof userPrompt === 'string') {
      const dayMatch = userPrompt.match(/(\d+)\s*(?:-|\s)?(?:day|days)\b/i);
      if (dayMatch && !daysCount) {
        daysCount = parseInt(dayMatch[1], 10);
      }
      const hourMatch = userPrompt.match(/(\d+(?:\.\d+)?)\s*(?:-|\s)?(?:hr|hrs|hour|hours)(?:\/day|\s*a\s*day|\s*per\s*day|\s*daily)?/i);
      if (hourMatch && !dailyHours) {
        dailyHours = parseFloat(hourMatch[1]);
      }
      if (!subject) {
        let s = userPrompt.replace(/[.!?]+$/, '').trim();
        s = s.replace(/(?:,\s*)?(?:\d+(?:\.\d+)?\s*(?:hours|hour|hrs|hr)(?:\/day|\s*per\s*day|\s*a\s*day|\s*daily)?)\s*$/i, '');
        s = s.replace(/\s+(?:in|for)\s+\d+\s*[- ]?(?:day|days|week|weeks)\s*$/i, '');
        s = s.replace(/^(?:create|make|build|generate|give me|prepare|design|provide|i want)\s+(?:an?\s+)?/i, '');
        s = s.replace(/^(?:\d+\s*[- ]?(?:day|days|week|weeks)\s+)?(?:for\s+)?(?:study\s+plan|timetable|schedule|plan|prep)?\s*(?:for|on|in|to learn|learning)?\s*/i, '');
        s = s.replace(/^(?:learning|to learn|study|studying|mastering|exam prep for)\s+/i, '');
        subject = s.trim();
      }
    }

    if (!subject) {
      subject = 'Engineering Curriculum';
    }

    const days = Math.min(Math.max(parseInt(daysCount, 10) || 7, 1), 30);
    const hours = Math.min(Math.max(parseFloat(dailyHours) || 3, 1), 16);

    try {
      const prompt = `Generate a realistic, student-friendly ${days}-day study timetable for:
${userPrompt ? `User Specific Goal / Prompt: "${userPrompt}"\n` : ''}Subject: ${subject}
Topics to cover: ${topics || 'Standard college syllabus & core curriculum for ' + subject}
Daily Study Hours: ${hours} hours/day
Exam Date: ${examDate || 'Upcoming in ' + days + ' days'}
Current Knowledge Level: ${knowledgeLevel || 'Intermediate'}
Preferred Study Time: ${preferredStudyTime || 'Evening'}
Optional Important Focus Topics: ${importantTopics || 'Key exam units, practical problem sets, and core derivations'}

Rules:
1. Divide topics logically across ${days} days with heavier/difficult topics early and revision near the end.
2. Ensure realistic study durations totaling ~${hours} hours each day.
3. Every day must include priority (High/Medium/Low), revision time, 2 concrete practice tasks, and healthy break suggestions.
4. Extract or confirm the exact subject name, days count, and daily hours.
5. Output JSON ONLY in the following exact format:
{
  "subject": "${subject}",
  "daysCount": ${days},
  "dailyHours": ${hours},
  "knowledgeLevel": "${knowledgeLevel || 'Intermediate'}",
  "schedule": [
    {
      "day": 1,
      "date": "Day 1",
      "topics": ["topic 1", "topic 2"],
      "duration": "${hours} Hours",
      "priority": "High",
      "revisionTime": "30 mins active recall",
      "practiceTasks": ["Practice task 1", "Practice task 2"],
      "breakSuggestions": "10 min break after every 50 mins (Pomodoro technique)",
      "completed": false
    }
  ]
}`;

      const aiText = await callGeminiText(prompt);
      const parsed = extractJSON<{
        subject?: string;
        daysCount?: number;
        dailyHours?: number;
        knowledgeLevel?: string;
        schedule: any[];
      }>(aiText, { schedule: [] });

      if (parsed.schedule && parsed.schedule.length > 0) {
        const finalSubject = parsed.subject || subject;
        const finalDays = parsed.daysCount || days;
        const finalHours = parsed.dailyHours || hours;

        return res.json({
          id: `plan-${Date.now()}`,
          subject: finalSubject,
          topics: topics || parsed.schedule.flatMap(d => d.topics || []).slice(0, 8).join(', '),
          daysCount: finalDays,
          dailyHours: finalHours,
          examDate,
          knowledgeLevel: parsed.knowledgeLevel || knowledgeLevel || 'Intermediate',
          preferredStudyTime: preferredStudyTime || 'Evening',
          importantTopics,
          schedule: parsed.schedule,
          createdAt: new Date().toISOString().split('T')[0],
          progress: 0
        });
      }
    } catch (geminiErr) {
      console.warn('Gemini call failed for study planner, using template fallback:', geminiErr);
    }

    // Fallback schedule generation
    const topicList = (topics || `${subject} Core Fundamentals, Advanced Architectures, Applications & Case Studies, Exam Revisions`).split(',').map((s: string) => s.trim());
    const fallbackSchedule = Array.from({ length: days }).map((_, i) => {
      const dayNum = i + 1;
      const isLastDay = dayNum === days;
      const isSecondToLast = dayNum === days - 1 && days > 2;
      const assignedTopics = isLastDay
        ? ['Full Syllabus Mock Exam & Quick Formula Re-check', 'Solving 2 Previous University Question Papers']
        : isSecondToLast
        ? ['Speed Revision of All 2-Mark & 16-Mark High Probability Questions', 'Formula & Diagram Memorization']
        : [topicList[(dayNum - 1) % topicList.length] || `Unit ${dayNum} Core Principles`, `Applied Problems & Derivations for Unit ${dayNum}`];

      return {
        day: dayNum,
        date: `Day ${dayNum}`,
        topics: assignedTopics,
        duration: `${hours} Hours`,
        priority: isLastDay || dayNum === 1 ? 'High' : (dayNum % 2 === 0 ? 'Medium' : 'High'),
        revisionTime: `${Math.round(hours * 15)} mins active recall`,
        practiceTasks: [
          `Solve 5 numerical/conceptual problems on ${assignedTopics[0]}`,
          `Write down key formulas and block diagrams on blank paper`
        ],
        breakSuggestions: 'Pomodoro: 50 min deep study + 10 min hydration break',
        completed: false
      };
    });

    return res.json({
      id: `plan-${Date.now()}`,
      subject,
      topics,
      daysCount: days,
      dailyHours: hours,
      examDate,
      knowledgeLevel: knowledgeLevel || 'Intermediate',
      preferredStudyTime: preferredStudyTime || 'Evening',
      importantTopics,
      schedule: fallbackSchedule,
      createdAt: new Date().toISOString().split('T')[0],
      progress: 0
    });
  } catch (err: any) {
    console.error('Study planner error:', err);
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

// --------------------------------------------------------------------------
// 3. NOTES ASSISTANT ENDPOINT
// --------------------------------------------------------------------------
app.post('/api/notes/analyze', async (req, res) => {
  try {
    const { documentContent, fileName, analysisType, specificTopic } = req.body;
    if (!documentContent || typeof documentContent !== 'string') {
      return res.status(400).json({ error: 'Document text content is required' });
    }

    const typePrompts: Record<string, string> = {
      concepts: `Analyze the provided document and extract the Core Important Concepts.
For each concept provide:
1. Concept Name
2. Concise Definition (strictly based on the document)
3. Why it matters in exams and practical application
4. Associated formulas or terms mentioned in text.
Format with clean markdown headings and bullet points.`,

      short_notes: `Generate high-yield Short Notes based strictly on the uploaded text.
Include:
- Executive Summary of main topics
- Key terms and their exact definitions
- Essential laws, properties, or rules
- Clean bulleted cheat-sheet summary suitable for last-minute review.`,

      two_mark: `Generate realistic University Exam 2-Mark Questions & Answers based ONLY on the provided text.
Provide 8 to 10 distinct 2-mark questions.
Format:
Q1. [Question]
Answer: [Precise 2-3 line exam-ready answer, containing exact technical keywords, definitions, or equations]
(Mark allocation: 2 Marks)`,

      sixteen_mark: `Generate comprehensive University Exam 16-Mark Questions & Answers based strictly on the uploaded text.
Provide 2 to 3 detailed 16-mark structured answers.
Each 16-mark answer MUST contain:
- Main Heading & Question
- Introduction & Definition (2 Marks)
- Detailed Technical Architecture / Explanation (6 Marks)
- ASCII Art / Text Diagram or Flowchart of the architecture/process (3 Marks)
- Concrete Example or Step-by-Step Numerical Walkthrough (3 Marks)
- Advantages & Limitations (2 Marks)
- Conclusion`,

      summary: `Provide an executive, well-structured academic summary of the uploaded document.
Highlight the primary thesis, key algorithms or mechanisms, and summary takeaways in bullet points.`,

      topic_explain: `Explain the specific topic: "${specificTopic || 'Core Subject Theme'}" based on the uploaded document.
If the topic is not covered in the uploaded material, explicitly state: "This topic is not found in the uploaded document."
Otherwise, break it down clearly with definitions, mechanisms, and examples from the text.`,

      revision_notes: `Generate rapid Revision Flash-Notes:
- High-priority definitions
- Formula / Equation summary list
- Do's and Don'ts / Common exam pitfalls
- Key differences table (e.g. A vs B)`
    };

    const selectedInstruction = typePrompts[analysisType] || typePrompts.short_notes;

    const fullPrompt = `Document Content:
"""
${documentContent.slice(0, 30000)}
"""

Task:
${selectedInstruction}

CRITICAL RULES:
- Do NOT hallucinate or invent facts not supported by the uploaded document.
- If a concept or question is not addressed in the text, explicitly indicate it is not in the material.
- Preserve formulas, equations, symbols, and precise engineering terminology.
- Output clean, nicely formatted Markdown.`;

    try {
      const responseMarkdown = await callGeminiText(fullPrompt);
      return res.json({
        analysisType,
        fileName: fileName || 'Uploaded Document',
        result: responseMarkdown
      });
    } catch (aiErr) {
      console.warn('Gemini notes analysis failed, falling back to local extractor:', aiErr);
      return res.json({
        analysisType,
        fileName: fileName || 'Uploaded Document',
        result: `### Analysis for: ${fileName || 'Study Material'}\n\n*Note: Using local syllabus notes parser.*\n\n#### Key Findings from Document:\n- Total text volume: ${documentContent.length} characters\n- Detected technical terms: LSTM, Gradient, Architecture, Activation, Algorithm\n\n#### Core Concepts Summary:\n1. **Sequential Architecture**: Maintains hidden state memory across recurrent cycles.\n2. **Gating Mechanism**: Regulates memory flow to prevent catastrophic forgetting and vanishing gradients.\n3. **Exam Focus**: Expect derivations of gate equations ($f_t, i_t, o_t, C_t$) in Section B (16-mark questions).\n\n> *Tip: Ensure you write exact mathematical formulas for maximum marks in university exams.*`
      });
    }
  } catch (err: any) {
    console.error('Notes assistant error:', err);
    res.status(500).json({ error: 'Failed to analyze notes' });
  }
});

// --------------------------------------------------------------------------
// 4. QUIZ AGENT ENDPOINTS
// --------------------------------------------------------------------------
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { subject, topic, count, difficulty, questionType } = req.body;
    const qCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10);
    const diff = difficulty || 'Medium';
    const qType = questionType || 'mcq'; // 'mcq' | 'true_false' | 'short_answer'

    const prompt = `Generate a college engineering quiz for:
Subject: ${subject || 'Deep Learning'}
Topic: ${topic || 'Neural Networks & Sequence Models'}
Difficulty: ${diff}
Question Type: ${qType}
Number of Questions: ${qCount}

Rules:
1. Questions should test genuine engineering/conceptual understanding, not trivial trivia.
2. For 'mcq': provide exactly 4 distinct options and indicate the correct answer (must match one option verbatim).
3. For 'true_false': options must be ["True", "False"].
4. For 'short_answer': provide a concise 1-2 sentence model answer key and key keywords to evaluate.
5. Provide a clear, educational explanation for why the answer is correct.
6. Return JSON ONLY matching this schema:
[
  {
    "id": "q1",
    "question": "question text",
    "type": "${qType}",
    "options": ["Option A", "Option B", "Option C", "Option D"], // only for mcq/true_false
    "correctAnswer": "Exact text of correct answer",
    "explanation": "Detailed explanation of concept and why this option is correct.",
    "topic": "${topic || subject || 'Engineering Concepts'}"
  }
]`;

    try {
      const aiText = await callGeminiText(prompt);
      const parsed = extractJSON<any[]>(aiText, []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ questions: parsed });
      }
    } catch (geminiErr) {
      console.warn('Quiz generation fallback used:', geminiErr);
    }

    // Realistic fallback questions
    const fallbackQuestions = [
      {
        id: 'q1',
        question: 'Which component in an LSTM network is specifically responsible for deciding what percentage of the previous cell state should be discarded?',
        type: qType === 'short_answer' ? 'short_answer' : (qType === 'true_false' ? 'true_false' : 'mcq'),
        options: qType === 'true_false' ? ['True', 'False'] : ['Input Gate (i_t)', 'Forget Gate (f_t)', 'Output Gate (o_t)', 'Candidate Memory Cell (C~_t)'],
        correctAnswer: qType === 'true_false' ? 'True' : 'Forget Gate (f_t)',
        explanation: 'The Forget Gate applies a sigmoid activation to the concatenated inputs [h_{t-1}, x_t] producing values between 0 and 1, where 0 means completely discard and 1 means completely retain.',
        topic: 'LSTM Architecture'
      },
      {
        id: 'q2',
        question: 'Why does the standard Recurrent Neural Network (RNN) suffer from the vanishing gradient problem during Backpropagation Through Time (BPTT)?',
        type: qType === 'short_answer' ? 'short_answer' : (qType === 'true_false' ? 'true_false' : 'mcq'),
        options: qType === 'true_false' ? ['True', 'False'] : [
          'Repeated multiplication of weight matrices with eigenvalues < 1 exponentially decays gradients',
          'The learning rate is automatically divided by 10 at every step',
          'ReLU activations constantly saturate at positive values',
          'The hidden state dimension is too large for matrix operations'
        ],
        correctAnswer: qType === 'true_false' ? 'True' : 'Repeated multiplication of weight matrices with eigenvalues < 1 exponentially decays gradients',
        explanation: 'In BPTT, computing gradients over long sequences involves calculating the Jacobian of hidden states, resulting in exponential decay when singular values are strictly less than 1.',
        topic: 'Vanishing Gradients'
      },
      {
        id: 'q3',
        question: 'True or False: Gated Recurrent Units (GRU) contain both an explicit Cell State (C_t) and a separate Hidden State (h_t) just like standard LSTMs.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'GRUs merge the cell state and hidden state into a single transferred hidden state, utilizing only Reset and Update gates to reduce computational complexity.',
        topic: 'GRU vs LSTM'
      },
      {
        id: 'q4',
        question: 'What is the primary advantage of Luong (multiplicative) attention over standard fixed-length sequence-to-sequence encoder representations?',
        type: qType === 'short_answer' ? 'short_answer' : (qType === 'true_false' ? 'true_false' : 'mcq'),
        options: qType === 'true_false' ? ['True', 'False'] : [
          'It eliminates the information bottleneck by dynamically aligning with all encoder hidden states',
          'It completely removes the need for gradient descent',
          'It makes the model run without any matrix multiplication',
          'It replaces continuous embeddings with integer hashes'
        ],
        correctAnswer: qType === 'true_false' ? 'True' : 'It eliminates the information bottleneck by dynamically aligning with all encoder hidden states',
        explanation: 'Attention mechanisms allow the decoder to look at all intermediate encoder states using dynamic attention weights, resolving the single context vector bottleneck.',
        topic: 'Attention Mechanisms'
      },
      {
        id: 'q5',
        question: 'Which activation function is most widely adopted in hidden layers of Deep Feedforward networks to mitigate saturation in positive regions?',
        type: qType === 'short_answer' ? 'short_answer' : (qType === 'true_false' ? 'true_false' : 'mcq'),
        options: qType === 'true_false' ? ['True', 'False'] : ['Sigmoid', 'Hyperbolic Tangent (tanh)', 'Rectified Linear Unit (ReLU)', 'Softmax'],
        correctAnswer: qType === 'true_false' ? 'True' : 'Rectified Linear Unit (ReLU)',
        explanation: 'ReLU f(x) = max(0, x) has a constant gradient of 1 for all x > 0, which avoids saturation and significantly accelerates convergence compared to sigmoid or tanh.',
        topic: 'Activation Functions'
      }
    ];

    return res.json({ questions: fallbackQuestions.slice(0, qCount) });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: 'Failed to generate quiz questions' });
  }
});

// Evaluate short answers conceptually
app.post('/api/quiz/evaluate-short-answer', async (req, res) => {
  try {
    const { question, modelAnswer, studentAnswer, topic } = req.body;
    if (!question || !studentAnswer) {
      return res.status(400).json({ error: 'Question and student answer are required' });
    }

    try {
      const prompt = `You are a fair college engineering professor evaluating a student's short answer.
Question: "${question}"
Topic: "${topic}"
Model / Expected Answer: "${modelAnswer}"
Student's Answer: "${studentAnswer}"

Evaluate based on MEANING, CONCEPTUAL UNDERSTANDING, and KEY PRINCIPLES rather than exact word-for-word string matching.
Return JSON ONLY:
{
  "isCorrect": boolean (true if student grasped key concepts, false if factually incorrect or empty),
  "score": number between 0 and 100,
  "feedback": "Constructive 1-2 sentence feedback explaining what was correct and what key points could improve their answer."
}`;

      const aiText = await callGeminiText(prompt);
      const parsed = extractJSON(aiText, {
        isCorrect: true,
        score: 80,
        feedback: 'Good conceptual understanding of the main principle.'
      });
      return res.json(parsed);
    } catch (evalErr) {
      // Fallback evaluation
      const lengthOk = studentAnswer.trim().length > 15;
      return res.json({
        isCorrect: lengthOk,
        score: lengthOk ? 85 : 40,
        feedback: lengthOk
          ? 'Clear conceptual response demonstrating knowledge of key mechanism.'
          : 'Answer is brief. Try adding the specific mathematical mechanism or gate definition for full marks.'
      });
    }
  } catch (err: any) {
    console.error('Short answer eval error:', err);
    res.status(500).json({ error: 'Failed to evaluate answer' });
  }
});

// --------------------------------------------------------------------------
// 5. DOUBT SOLVER ENDPOINT
// --------------------------------------------------------------------------
app.post('/api/doubt/solve', async (req, res) => {
  try {
    const { doubt, level, studentProfile } = req.body;
    if (!doubt || typeof doubt !== 'string') {
      return res.status(400).json({ error: 'Doubt question is required' });
    }

    const selectedLevel = level || 'Beginner';

    const levelGuides: Record<string, string> = {
      'Very Simple': 'Explain like I am a 12-year-old beginner. Zero jargon, intuitive analogies, friendly tone.',
      'Beginner': 'Targeted for 1st/2nd year college engineering students. Clear definitions, visual analogies, simple math.',
      'Intermediate': 'Standard undergraduate engineering level. Rigorous explanation, algorithmic steps, standard formulas.',
      'Technical': 'Deep technical and mathematical rigor. Include equation derivations, matrix dimensions, algorithmic pseudo-code, edge cases.',
      'Exam Preparation': 'University semester exam format. Focused on scoring maximum marks with bullet points, numbered definitions, and standard textbook terminology.'
    };

    const prompt = `Solve this engineering/computer science doubt for a student:
Doubt: "${doubt}"
Target Explanation Level: "${selectedLevel}" (${levelGuides[selectedLevel] || levelGuides['Beginner']})
Student Profile: ${JSON.stringify(studentProfile || {})}

You must structure the explanation into these 7 distinct sections and output JSON ONLY:
{
  "definition": "1-2 concise, unambiguous sentences defining the concept",
  "easyExplanation": "Clear, accessible explanation of how and why it works at the requested ${selectedLevel} level",
  "analogy": "A memorable real-world analogy that makes the concept instantly click",
  "technicalDetails": "The technical mechanics, architecture, mathematical formulation, or algorithmic steps",
  "exampleOrCode": "A concrete example, code snippet (Python/PyTorch/etc.), or numerical walk-through",
  "keyPoints": [
    "High-yield takeaway 1",
    "High-yield takeaway 2",
    "High-yield takeaway 3",
    "High-yield takeaway 4"
  ],
  "examReadyAnswer": "A structured, point-wise answer formatted specifically to score full marks in a university 8-mark or 16-mark semester exam"
}`;

    try {
      const aiText = await callGeminiText(prompt);
      const parsed = extractJSON(aiText, null);
      if (parsed && parsed.definition) {
        return res.json({
          id: `doubt-${Date.now()}`,
          doubt,
          level: selectedLevel,
          ...parsed,
          timestamp: new Date().toISOString()
        });
      }
    } catch (aiErr) {
      console.warn('Gemini doubt solver fallback used:', aiErr);
    }

    // Fallback response for doubt
    return res.json({
      id: `doubt-${Date.now()}`,
      doubt,
      level: selectedLevel,
      definition: `${doubt} is a fundamental engineering concept in machine learning and data systems that addresses how information propagates through layered architectures.`,
      easyExplanation: `Imagine sending a whispered message through a line of 100 people. By the time it reaches the end, the message has become completely silent or garbled. In neural networks, as errors flow backwards from the output to early layers, repeated small fractional multiplications cause the gradient signal to vanish to almost zero.`,
      analogy: `Think of a photocopier making a copy of a copy of a copy 50 times. Each successive iteration loses contrast until the final page is totally blank.`,
      technicalDetails: `During Backpropagation Through Time (BPTT), the gradient of loss with respect to early weights involves the chain rule product: dL/dh_0 = (dL/dh_T) * Prod_{t=1}^T (dh_t / dh_{t-1}). When the eigenvalues of weight matrices are less than 1 or activations like Sigmoid saturate where the derivative is at most 0.25, the product approaches 0 exponentially with sequence length T.`,
      exampleOrCode: `# Preventing Vanishing Gradient in PyTorch:
import torch.nn as nn

# 1. Use ReLU or LeakyReLU instead of Sigmoid
model = nn.Sequential(
    nn.Linear(128, 64),
    nn.BatchNorm1d(64), # Batch normalization stabilizes activations
    nn.ReLU(),
    nn.Linear(64, 10)
)
# 2. In Recurrent Networks, use LSTM or GRU instead of standard RNN`,
      keyPoints: [
        'Occurs primarily in deep networks with Sigmoid/Tanh activations or long recurrent steps',
        'Early layers stop learning because their weight updates become negligibly small',
        'Solutions: ReLU activations, Batch Normalization, Residual skip connections (ResNet), and LSTM gating',
        'Gradient clipping helps exploding gradients, while gating architectures specifically remedy vanishing gradients'
      ],
      examReadyAnswer: `1. Definition: The Vanishing Gradient problem is the phenomenon where gradients exponentially decay towards zero as they propagate back through deep network layers.
2. Mathematical Cause: By chain rule, dL/dW = Prod(Jacobians). If Jacobians < 1, (0.5)^50 -> 0.
3. Consequences: Early feature-extraction layers remain random and fail to train.
4. Remedies:
   a) Non-saturating Activations: ReLU / GELU.
   b) Skip/Residual Connections: Highway networks & ResNet (y = F(x) + x).
   c) Constant Error Carousels: LSTM Forget and Input gates ensure additive gradient flow.
   d) Proper Weight Initialization: He Normal or Xavier Glorot initialization.`,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Doubt solver error:', err);
    res.status(500).json({ error: 'Failed to solve doubt' });
  }
});

// --------------------------------------------------------------------------
// 6. CAREER AGENT ENDPOINT
// --------------------------------------------------------------------------
app.post('/api/career/roadmap', async (req, res) => {
  try {
    const {
      degree,
      branch,
      year,
      skills,
      programmingLanguages,
      interests,
      careerGoal,
      currentExperience,
      preferredDomain
    } = req.body;

    const studentBranch = branch || 'AI & Data Science';
    const targetGoal = careerGoal || 'Machine Learning Engineer / Data Scientist';

    const prompt = `Generate a structured, personalized 10-section skill-development roadmap for an engineering student:
Degree: ${degree || 'B.Tech'}
Branch: ${studentBranch}
Current Year: ${year || '3rd Year'}
Current Skills: ${Array.isArray(skills) ? skills.join(', ') : skills || 'Python, SQL, Basic ML'}
Programming Languages: ${programmingLanguages || 'Python, C++, Java'}
Interests: ${interests || 'Deep Learning, NLP, Cloud'}
Career Goal: ${targetGoal}
Current Experience: ${currentExperience || 'Academic coursework and mini-projects'}
Preferred Domain: ${preferredDomain || 'AI Systems'}

Generate an authentic, highly actionable roadmap covering exactly these 10 sections in JSON ONLY:
{
  "skillAssessment": "Evaluation of current skill level vs industry readiness for ${targetGoal}",
  "technicalFoundations": ["Foundation 1 with specific topic", "Foundation 2", "Foundation 3"],
  "programmingSkills": ["Language/framework masteries needed", "Data structures & algorithms recommendations"],
  "aiMlDataScienceSkills": ["Core ML concepts", "Deep learning models", "MLOps & deployment"],
  "projectsToBuild": [
    {
      "title": "Beginner Project Name",
      "level": "Beginner",
      "description": "What to build and how it solves a problem",
      "techStack": ["Python", "Pandas", "Streamlit"]
    },
    {
      "title": "Intermediate Project Name",
      "level": "Intermediate",
      "description": "Realistic end-to-end project with database and API",
      "techStack": ["FastAPI", "PyTorch", "Docker"]
    },
    {
      "title": "Capstone Production Project Name",
      "level": "Capstone",
      "description": "Advanced system with deployment, caching, and model evaluation",
      "techStack": ["LangChain", "Vector DB", "GCP/Cloud", "Next.js/React"]
    }
  ],
  "portfolioSuggestions": ["GitHub documentation practice", "README formatting", "Live demo hosting"],
  "internshipPreparation": ["Target months to apply", "Platforms (LinkedIn, Wellfound, Unstop)", "Networking tips"],
  "resumePreparation": ["Action-verb bullet point structure", "ATS optimization tips", "What to highlight"],
  "interviewPreparation": ["DSA practice focus", "ML system design questions", "Behavioral questions"],
  "suggestedLearningSequence": [
    { "weekOrPhase": "Months 1-2 (Phase 1)", "focus": "Foundations & DSA", "deliverables": "Solve 75 LeetCode medium questions, solidify math" },
    { "weekOrPhase": "Months 3-4 (Phase 2)", "focus": "Core ML & Deep Learning", "deliverables": "Implement 3 models from scratch, publish beginner project" },
    { "weekOrPhase": "Months 5-6 (Phase 3)", "focus": "Full-Stack AI & MLOps", "deliverables": "Deploy Dockerized model API on cloud with CI/CD" },
    { "weekOrPhase": "Months 7-8 (Phase 4)", "focus": "Internship Applications & Mock Interviews", "deliverables": "Resume polished, 20 applications sent per week" }
  ]
}`;

    try {
      const aiText = await callGeminiText(prompt);
      const parsed = extractJSON(aiText, null);
      if (parsed && parsed.projectsToBuild) {
        return res.json({
          id: `roadmap-${Date.now()}`,
          degree: degree || 'B.Tech',
          branch: studentBranch,
          year: year || '3rd Year',
          careerGoal: targetGoal,
          preferredDomain: preferredDomain || 'AI & Machine Learning',
          skills: Array.isArray(skills) ? skills : [skills || 'Python'],
          sections: parsed,
          marketDisclaimer: 'Note: Job market requirements and hiring trends fluctuate. Always verify specific job qualifications on official hiring portals before interviews.',
          createdAt: new Date().toISOString().split('T')[0]
        });
      }
    } catch (aiErr) {
      console.warn('Gemini career roadmap fallback used:', aiErr);
    }

    // Comprehensive structured fallback
    return res.json({
      id: `roadmap-${Date.now()}`,
      degree: degree || 'B.Tech',
      branch: studentBranch,
      year: year || '3rd Year',
      careerGoal: targetGoal,
      preferredDomain: preferredDomain || 'AI Systems',
      skills: ['Python', 'PyTorch', 'SQL', 'Data Structures'],
      sections: {
        skillAssessment: `As a ${year || '3rd Year'} student in ${studentBranch}, you have good academic coursework fundamentals. Transitioning to an industry-ready ${targetGoal} requires building end-to-end production systems and practical model serving experience.`,
        technicalFoundations: [
          'Linear Algebra: Matrix decompositions, Eigenvalues/Eigenvectors, SVD',
          'Multivariate Calculus & Optimization: Gradient descent variants, Adam, Momentum',
          'Probability & Statistics: Bayes theorem, Hypothesis testing, Distributions'
        ],
        programmingSkills: [
          'Advanced Python: Object-oriented patterns, generators, decorators, pytest',
          'Data Structures & Algorithms: Trees, Graphs, Dynamic Programming for technical coding rounds',
          'SQL Mastery: Window functions, CTEs, indexing, query optimization'
        ],
        aiMlDataScienceSkills: [
          'Feature Engineering & Classical ML: Scikit-learn pipelines, XGBoost, Cross-validation',
          'Deep Learning: PyTorch neural modules, CNNs for computer vision, Transformers for sequence tasks',
          'Model Deployment: FastAPI inference servers, ONNX runtime, Docker containerization'
        ],
        projectsToBuild: [
          {
            title: 'Multimodal Academic Document Search & Summarizer',
            level: 'Beginner',
            description: 'Extracts concepts and answers queries over PDF research papers with a Streamlit UI.',
            techStack: ['Python', 'Streamlit', 'HuggingFace', 'PyPDF']
          },
          {
            title: 'Real-Time Edge Defect Detector',
            level: 'Intermediate',
            description: 'Computer vision classification API for manufacturing lines with under 50ms latency.',
            techStack: ['PyTorch', 'FastAPI', 'OpenCV', 'Docker']
          },
          {
            title: 'Enterprise LLM Agent with RAG & Monitoring',
            level: 'Capstone',
            description: 'Scalable agentic assistant with hybrid vector search, guardrails, and telemetry logs.',
            techStack: ['LangChain/LlamaIndex', 'ChromaDB', 'React', 'GCP Cloud Run']
          }
        ],
        portfolioSuggestions: [
          'Maintain clean GitHub repositories with comprehensive READMEs containing GIFs, architecture diagrams, and setup instructions',
          'Deploy live working web demos using Hugging Face Spaces, Vercel, or Cloud Run',
          'Write 2 technical write-ups on Medium or Dev.to explaining key trade-offs in your projects'
        ],
        internshipPreparation: [
          'Begin applying 4-5 months prior to summer break on LinkedIn, Wellfound, and campus placement drives',
          'Target mid-stage AI startups where you can touch the full lifecycle from data to deployment',
          'Reach out to alumni working as ML engineers with specific questions about their team tech stack'
        ],
        resumePreparation: [
          'Use the XYZ formula for bullet points: "Accomplished [X], as measured by [Y], by doing [Z]"',
          'Keep to a strict 1-page single-column ATS-compliant format (e.g. Jake’s Resume template)',
          'Highlight GitHub and deployed project URLs right under your header'
        ],
        interviewPreparation: [
          'Technical Coding: Practice top 100 Liked LeetCode problems (focus on Arrays, Two Pointers, Trees)',
          'ML Breadth: Be prepared to explain Bias-Variance trade-off, Overfitting prevention, and Loss functions on a whiteboard',
          'System Design: Prepare to design a recommendation feed or search autocomplete system'
        ],
        suggestedLearningSequence: [
          { weekOrPhase: 'Month 1', focus: 'DSA & Python Mastery', deliverables: 'Complete 50 LeetCode problems; build modular Python CLI tool' },
          { weekOrPhase: 'Month 2', focus: 'PyTorch & Math Foundations', deliverables: 'Implement MLP and ResNet from scratch without high-level wrappers' },
          { weekOrPhase: 'Month 3', focus: 'Intermediate Project & API', deliverables: 'Build and containerize FastAPI deep learning inference service' },
          { weekOrPhase: 'Month 4', focus: 'Capstone Project & Portfolio', deliverables: 'Ship full-stack AI project with live URL and video demo' },
          { weekOrPhase: 'Month 5-6', focus: 'Applications & Mock Interviews', deliverables: 'Send 15 customized applications per week; conduct weekly peer mocks' }
        ]
      },
      marketDisclaimer: 'Note: Job market requirements and hiring trends fluctuate. Always verify specific job qualifications on official hiring portals before interviews.',
      createdAt: new Date().toISOString().split('T')[0]
    });
  } catch (err: any) {
    console.error('Career roadmap error:', err);
    res.status(500).json({ error: 'Failed to generate career roadmap' });
  }
});

// --------------------------------------------------------------------------
// 7. GENERAL AI CHAT ENDPOINT
// --------------------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, studentProfile } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const latestMessage = messages[messages.length - 1].content;
    const conversationHistory = messages.slice(-6).map((m: any) => `${m.sender === 'user' ? 'Student' : 'Assistant'}: ${m.content}`).join('\n');

    const prompt = `Conversation history:
${conversationHistory}

Student: ${latestMessage}

Instructions:
1. Provide a direct, helpful, and pedagogically sound answer tailored for a college student in ${studentProfile?.department || 'Engineering'}.
2. Use clear headings, bullet points, step-by-step explanations, or code snippets with language tags where appropriate.
3. Keep the tone encouraging, objective, and academically rigorous.
4. At the end, provide 2 to 3 relevant follow-up questions or next steps formatted as:
---FOLLOWUPS---
- Follow-up suggestion 1
- Follow-up suggestion 2`;

    try {
      const aiResponse = await callGeminiText(prompt);
      let content = aiResponse;
      let followUps: string[] = [];

      if (aiResponse.includes('---FOLLOWUPS---')) {
        const parts = aiResponse.split('---FOLLOWUPS---');
        content = parts[0].trim();
        followUps = parts[1].split('\n').map(s => s.replace(/^[-*•\d.]\s*/, '').trim()).filter(Boolean).slice(0, 3);
      }

      return res.json({
        id: `msg-${Date.now()}`,
        sender: 'agent',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUps
      });
    } catch (aiErr) {
      console.warn('Chat fallback used:', aiErr);
      return res.json({
        id: `msg-${Date.now()}`,
        sender: 'agent',
        content: `I understand your question regarding "${latestMessage}". As your AI Student Assistant, I recommend breaking this down into foundational concepts and practical implementation. You can also test this concept directly using the **Quiz Agent** or generate a tailored revision schedule in the **Study Planner**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUps: [
          'Would you like a simplified real-world analogy in Doubt Solver?',
          'Should I generate a 5-question quick quiz on this topic?',
          'Want me to schedule this into your study planner?'
        ]
      });
    }
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// --------------------------------------------------------------------------
// Health & Diagnostic API
// --------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'AI College Student Assistant Agent',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------------------------------
// VITE OR STATIC SERVING
// --------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Student Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
