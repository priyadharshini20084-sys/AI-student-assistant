import { StudentProfile, ActivityItem, StudyPlan, QuizResult, NoteDocument } from '../types';

export const initialStudentProfile: StudentProfile = {
  name: "Alex Rivera",
  college: "Apex Institute of Technology",
  degree: "B.Tech",
  department: "Artificial Intelligence & Data Science",
  year: "3rd Year",
  semester: "Semester 6",
  subjects: [
    "Deep Learning",
    "Big Data Analytics",
    "Data and Information Security",
    "Cloud Computing",
    "Digital Marketing"
  ],
  skills: ["Python", "PyTorch", "SQL", "Scikit-Learn", "Git"],
  careerInterest: "Machine Learning Engineer / AI Researcher",
  targetExams: "Semester 6 Finals, GATE 2027, Campus Placements"
};

export const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Completed LSTM & GRU Revision',
    description: 'Reviewed gating mechanisms and backpropagation through time.',
    timestamp: '2 hours ago',
    iconType: 'study'
  },
  {
    id: 'act-2',
    title: 'Quiz on Recurrent Neural Networks',
    description: 'Scored 85% (4/5 correct). Identified weak area: Vanishing Gradients.',
    timestamp: 'Yesterday',
    iconType: 'quiz'
  },
  {
    id: 'act-3',
    title: 'Uploaded Deep Learning Unit 3 Notes',
    description: 'Generated 16-mark answers on Transformer self-attention architecture.',
    timestamp: '2 days ago',
    iconType: 'notes'
  },
  {
    id: 'act-4',
    title: 'Created 5-Day Study Plan for Deep Learning',
    description: 'Daily 4-hour schedule targeting upcoming mid-semester exams.',
    timestamp: '3 days ago',
    iconType: 'study'
  }
];

export const sampleSampleDocuments: NoteDocument[] = [
  {
    id: 'doc-dl-1',
    fileName: 'Deep_Learning_Unit3_SequenceModels.txt',
    fileSize: '14.2 KB',
    estimatedPages: 4,
    uploadedAt: '2026-09-18',
    content: `UNIT III: SEQUENCE MODELING & ATTENTION MECHANISMS

1. Recurrent Neural Networks (RNN)
Recurrent Neural Networks are a class of artificial neural networks designed for sequential data processing where connections between nodes form a directed graph along a temporal sequence. 
Unlike standard feedforward networks, RNNs maintain an internal hidden state h_t = tanh(W_hh * h_{t-1} + W_xh * x_t + b_h).
Output is given by y_t = softmax(W_hy * h_t + b_y).

Limitation: Backpropagation Through Time (BPTT) suffers from the Vanishing and Exploding Gradient Problem due to repeated matrix multiplications of W_hh across multiple time steps.

2. Long Short-Term Memory (LSTM) Networks
Introduced by Hochreiter & Schmidhuber (1997) to mitigate vanishing gradients using dedicated constant error carousels called cell states (C_t) regulated by three multiplicative gates:
- Forget Gate (f_t): f_t = sigma(W_f * [h_{t-1}, x_t] + b_f). Decides what information to discard from the previous cell state.
- Input Gate (i_t): i_t = sigma(W_i * [h_{t-1}, x_t] + b_i) and Candidate state C~_t = tanh(W_c * [h_{t-1}, x_t] + b_c). Decides what new information to store in the cell state.
- Cell State Update: C_t = f_t * C_{t-1} + i_t * C~_t.
- Output Gate (o_t): o_t = sigma(W_o * [h_{t-1}, x_t] + b_o) and Hidden state h_t = o_t * tanh(C_t).

3. Gated Recurrent Units (GRU)
A lightweight variant proposed by Cho et al. (2014) merging the cell state and hidden state, using only two gates: Reset Gate (r_t) and Update Gate (z_t). It is computationally faster with fewer parameters while achieving comparable empirical performance.

4. Attention Mechanism & Transformer Foundations
The classical Encoder-Decoder bottleneck is resolved by Bahdanau additive attention and Luong multiplicative attention:
Score(s_t, h_i) = s_t^T * W_a * h_i
Attention weights alpha_{t,i} = softmax(Score).
Context vector c_t = sum(alpha_{t,i} * h_i).

Key Differences between RNN and LSTM:
- RNN has simple single tanh layer; LSTM has 4 interactive layers inside cell.
- RNN suffers severely from long-term dependency loss; LSTM captures long-term dependencies up to 100+ steps.
- LSTM memory footprint and compute per step is ~4x higher than standard RNN.`
  },
  {
    id: 'doc-sec-2',
    fileName: 'Data_Security_Unit2_Public_Key_Crypto.txt',
    fileSize: '11.8 KB',
    estimatedPages: 3,
    uploadedAt: '2026-09-19',
    content: `DATA AND INFORMATION SECURITY - UNIT II: ASYMMETRIC CRYPTOGRAPHY & INTEGRITY

1. RSA Algorithm (Rivest, Shamir, Adleman)
RSA is based on the mathematical difficulty of factoring the product of two large prime numbers.
Key Generation:
- Select two distinct large prime numbers p and q.
- Calculate modulus n = p * q.
- Compute Euler's totient function phi(n) = (p - 1) * (q - 1).
- Choose public exponent e such that 1 < e < phi(n) and gcd(e, phi(n)) = 1.
- Calculate private exponent d such that d * e = 1 (mod phi(n)), i.e., d = e^(-1) mod phi(n).
Encryption: Ciphertext C = M^e mod n.
Decryption: Plaintext M = C^d mod n.

2. Diffie-Hellman Key Exchange
Allows two parties (Alice and Bob) who have no prior knowledge of each other to jointly establish a shared secret key over an insecure communication channel using modular exponentiation and discrete logarithms.
Vulnerable to Man-in-the-Middle (MITM) attacks if unauthenticated.

3. Hash Functions and Message Authentication Codes (MAC)
Cryptographic hash functions (SHA-256, SHA-3) must satisfy three primary properties:
- Pre-image resistance (One-way): computationally infeasible to find x given h(x).
- Second pre-image resistance (Weak collision resistance): given x, infeasible to find y != x such that h(x) = h(y).
- Collision resistance (Strong collision resistance): infeasible to find any pair (x, y) such that h(x) = h(y).`
  }
];

export const initialStudyPlan: StudyPlan = {
  id: 'plan-demo-1',
  subject: 'Deep Learning',
  topics: 'Neural Network Basics, Backpropagation, CNN, RNN, LSTM, Attention Mechanism',
  daysCount: 5,
  dailyHours: 4,
  examDate: '2026-09-28',
  knowledgeLevel: 'Intermediate',
  preferredStudyTime: 'Evening (6 PM - 10 PM)',
  importantTopics: 'LSTM Gating equations, CNN Pooling vs Convolution, Backpropagation calculus',
  createdAt: '2026-09-19',
  progress: 40,
  schedule: [
    {
      day: 1,
      date: 'Day 1',
      topics: ['Perceptrons, Multi-Layer Perceptrons', 'Activation Functions (ReLU, Sigmoid, LeakyReLU, GeLU)', 'Forward & Backward Pass Calculus'],
      duration: '4 Hours',
      priority: 'High',
      revisionTime: '45 mins at end of day',
      practiceTasks: ['Derive gradient for cross-entropy with softmax', 'Solve 2 numerical examples on weight updates'],
      breakSuggestions: '10 min break after every 50 min Pomodoro block',
      completed: true
    },
    {
      day: 2,
      date: 'Day 2',
      topics: ['Convolutional Neural Networks (CNN)', 'Kernels, Padding, Stride, Feature Maps', 'Architectures: LeNet-5, AlexNet, ResNet skip connections'],
      duration: '4 Hours',
      priority: 'High',
      revisionTime: '30 mins (Quick recap of Day 1)',
      practiceTasks: ['Calculate output volume dimensions given input and kernel', 'Diagram ResNet bottleneck residual block'],
      breakSuggestions: '15 min coffee break halfway',
      completed: true
    },
    {
      day: 3,
      date: 'Day 3',
      topics: ['Recurrent Neural Networks (RNN)', 'Vanishing & Exploding Gradients in BPTT', 'Long Short-Term Memory (LSTM) 3 Gates & Cell State'],
      duration: '4 Hours',
      priority: 'High',
      revisionTime: '45 mins focused on gate equations',
      practiceTasks: ['Write and annotate Forget, Input, Output gate equations', 'Compare GRU vs LSTM pros and cons'],
      breakSuggestions: '10 min stretch break every hour',
      completed: false
    },
    {
      day: 4,
      date: 'Day 4',
      topics: ['Gated Recurrent Units (GRU)', 'Sequence-to-Sequence Models', 'Bahdanau & Luong Attention Mechanisms'],
      duration: '4 Hours',
      priority: 'Medium',
      revisionTime: '40 mins on attention score formulas',
      practiceTasks: ['Draw encoder-decoder attention architecture', 'Draft 16-mark answer on attention bottleneck'],
      breakSuggestions: 'Walk outside for 15 mins midway',
      completed: false
    },
    {
      day: 5,
      date: 'Day 5',
      topics: ['Full Syllabus Mock Revision', 'Previous Year Exam 2-Mark & 16-Mark Questions', 'Self-Test & Formula Sheet Memorization'],
      duration: '4 Hours',
      priority: 'High',
      revisionTime: '2 hours intensive speed test',
      practiceTasks: ['Solve 2024 & 2025 past university papers', 'Rapid flashcard review on definitions'],
      breakSuggestions: 'Relaxation and hydration breaks',
      completed: false
    }
  ]
};

export const initialQuizResults: QuizResult[] = [
  {
    id: 'quiz-res-1',
    subject: 'Deep Learning',
    topic: 'Recurrent Neural Networks & LSTM',
    difficulty: 'Medium',
    totalQuestions: 5,
    correctAnswers: 4,
    wrongAnswers: 1,
    score: 4,
    percentage: 80,
    topicPerformance: [
      { topic: 'LSTM Gates', correct: 2, total: 2 },
      { topic: 'Vanishing Gradients', correct: 1, total: 2 },
      { topic: 'GRU Architecture', correct: 1, total: 1 }
    ],
    weakAreas: ['Vanishing Gradient exact mathematical cause during BPTT'],
    suggestedTopics: ['Gradient clipping methods', 'Truncated BPTT', 'LSTM additive cell state proof'],
    questions: [],
    completedAt: '2026-09-19 18:30'
  },
  {
    id: 'quiz-res-2',
    subject: 'Big Data Analytics',
    topic: 'MapReduce & Spark RDD',
    difficulty: 'Intermediate',
    totalQuestions: 5,
    correctAnswers: 5,
    wrongAnswers: 0,
    score: 5,
    percentage: 100,
    topicPerformance: [
      { topic: 'Spark Transformations', correct: 3, total: 3 },
      { topic: 'MapReduce Shuffle', correct: 2, total: 2 }
    ],
    weakAreas: [],
    suggestedTopics: ['Spark Catalyst Optimizer', 'Broadcast variables in PySpark'],
    questions: [],
    completedAt: '2026-09-17 14:15'
  }
];

export const sampleStudyPlan: StudyPlan = initialStudyPlan;
export const sampleQuizResults: QuizResult[] = initialQuizResults;

export const initialChatMessages = [
  {
    id: 'msg-welcome-1',
    sender: 'assistant' as const,
    text: `Hello Alex! I am your AI Student Assistant, configured for your 3rd-year B.Tech in Artificial Intelligence & Data Science.

How can I help you today? You can ask me to:
- Build an exam study timetable
- Formulate a 16-mark answer or summarize your notes
- Test your understanding of LSTMs or CNNs with a quiz
- Explain tricky concepts like vanishing gradients with analogies
- Guide your career roadmap towards becoming a Machine Learning Engineer`,
    timestamp: '09:00 AM'
  }
];
