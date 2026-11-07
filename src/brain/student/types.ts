export type StudentDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface StudentQuizOption {
  text: string;
}

export interface StudentQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: StudentDifficulty;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  hint: string;
  solution: string;
  keyTakeaway: string;
}

export interface StudentDiagram {
  title: string;
  asciiArt?: string;
  svgType?: 'cycle' | 'layers' | 'flowchart' | 'comparison' | 'tree';
  explanation: string;
}

export interface EducationalResource {
  title: string;
  provider: string;
  type: 'video' | 'interactive' | 'course' | 'article' | 'textbook';
  url: string;
  description: string;
  difficulty: StudentDifficulty;
}

export interface RevisionItem {
  term: string;
  definition: string;
  analogy: string;
  mnemonic?: string;
}

export interface StepByStepPhase {
  stepNumber: number;
  title: string;
  explanation: string;
  tip?: string;
}

export interface StudentExample {
  title: string;
  realWorldAnalogy: string;
  workedExample: string;
  counterExample?: string;
}

export interface AntiCheatingGuidance {
  detectedCheatingAttempt: boolean;
  guidanceMessage: string;
  socraticHint: string;
  parallelExample?: string;
}

export interface StudentInsights {
  coreConcept: string;
  difficulty: StudentDifficulty;
  simpleExplanation: string;
  detailedExplanation: string;
  stepByStepSteps: StepByStepPhase[];
  examples: StudentExample[];
  diagrams: StudentDiagram[];
  keyTerms: RevisionItem[];
  quizQuestion?: StudentQuiz;
  additionalQuizzes?: StudentQuiz[];
  practiceQuestions: PracticeQuestion[];
  practiceTip?: string;
  revisionChecklist: string[];
  resources: EducationalResource[];
  antiCheatingNotice?: AntiCheatingGuidance;
}

export interface StudySessionState {
  plannedDurationMinutes: number; // max 120 minutes (2 hours)
  elapsedSeconds: number;
  isActive: boolean;
  isPaused: boolean;
  startTime: number | null;
  topicsCovered: string[];
  quizzesAnswered: number;
  quizzesCorrect: number;
  sessionCompleted: boolean;
  breakReminderMinutes: number;
}

export interface StudentReportData {
  reportId: string;
  generatedAt: number;
  topic: string;
  difficulty: StudentDifficulty;
  sessionDurationMinutes: number;
  coreConcept: string;
  summaryRecap: string;
  stepByStepSummary: string[];
  keyDefinitions: { term: string; definition: string }[];
  quizScore: { total: number; correct: number; percentage: number };
  practiceProblemsReviewed: number;
  recommendedResources: { title: string; provider: string; url: string }[];
  feynmanChecklist: string[];
}
