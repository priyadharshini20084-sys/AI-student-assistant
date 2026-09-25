export type AgentIntent =
  | 'study-planner'
  | 'notes-assistant'
  | 'quiz-agent'
  | 'doubt-solver'
  | 'career-agent'
  | 'chat'
  | 'clarification';

export interface AgentRouteResult {
  feature: AgentIntent;
  confidence: number;
  reasoning: string;
  extractedParams: Record<string, any>;
  missingInfo?: string[];
  clarificationQuestion?: string;
  suggestedAction: string;
}

export interface StudentProfile {
  name: string;
  college?: string;
  degree: string;
  department: string;
  year: string;
  semester: string;
  subjects: string[];
  skills: string[];
  careerInterest: string;
  targetExams?: string;
}

export interface StudyPlanDay {
  day: number;
  date: string;
  topics: string[];
  duration: string;
  priority: 'High' | 'Medium' | 'Low';
  revisionTime: string;
  practiceTasks: string[];
  breakSuggestions: string;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  subject: string;
  topics: string;
  daysCount: number;
  dailyHours: number;
  examDate?: string;
  knowledgeLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  preferredStudyTime: string;
  importantTopics?: string;
  schedule: StudyPlanDay[];
  createdAt: string;
  progress: number;
}

export interface NoteDocument {
  id: string;
  fileName: string;
  fileSize: string;
  estimatedPages: number;
  content: string;
  uploadedAt: string;
}

export type NoteAnalysisType =
  | 'concepts'
  | 'short_notes'
  | 'two_mark'
  | 'sixteen_mark'
  | 'summary'
  | 'topic_explain'
  | 'revision_notes';

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  userAnswer?: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}

export interface QuizResult {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  percentage: number;
  topicPerformance: { topic: string; correct: number; total: number }[];
  weakAreas: string[];
  suggestedTopics: string[];
  questions: QuizQuestion[];
  completedAt: string;
}

export interface DoubtExplanation {
  id: string;
  doubt: string;
  level: 'Very Simple' | 'Beginner' | 'Intermediate' | 'Technical' | 'Exam Preparation';
  definition: string;
  easyExplanation: string;
  analogy: string;
  technicalDetails: string;
  exampleOrCode: string;
  keyPoints: string[];
  examReadyAnswer: string;
  timestamp: string;
}

export interface CareerProject {
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Capstone';
  description: string;
  techStack: string[];
}

export interface CareerLearningPhase {
  weekOrPhase: string;
  focus: string;
  deliverables: string;
}

export interface CareerRoadmap {
  id: string;
  degree: string;
  branch: string;
  year: string;
  careerGoal: string;
  preferredDomain: string;
  skills: string[];
  sections: {
    skillAssessment: string;
    technicalFoundations: string[];
    programmingSkills: string[];
    aiMlDataScienceSkills: string[];
    projectsToBuild: CareerProject[];
    portfolioSuggestions: string[];
    internshipPreparation: string[];
    resumePreparation: string[];
    interviewPreparation: string[];
    suggestedLearningSequence: CareerLearningPhase[];
  };
  marketDisclaimer: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'assistant';
  text: string;
  content?: string;
  timestamp: string;
  routedFeature?: AgentIntent;
  followUps?: string[];
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  iconType: 'study' | 'notes' | 'quiz' | 'doubt' | 'career';
}
