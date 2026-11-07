import { CognitiveExploration, BrainProcessingResult } from './brain/types';
import {
  StudentDifficulty,
  StudentQuiz,
  PracticeQuestion,
  StudentDiagram,
  EducationalResource,
  RevisionItem,
  StepByStepPhase,
  StudentExample,
  AntiCheatingGuidance,
  StudentInsights,
  StudySessionState,
  StudentReportData,
} from './brain/student/types';

import {
  MaxBusinessCapability,
  MaxBusinessPackage,
  ConsequentialActionRequest,
  TransparentCalculationTrace,
  SalesAnalysisResult,
  BusinessDataAnalysisResult,
  ForecastingResult,
  CustomerAnalysisResult,
  InventoryAnalysisResult,
  BusinessResearchResult,
  DocumentAnalysisResult,
  ManagementAssistanceResult,
  WorkflowPlanningResult,
} from './brain/max/types';

export type {
  MaxBusinessCapability,
  MaxBusinessPackage,
  ConsequentialActionRequest,
  TransparentCalculationTrace,
  SalesAnalysisResult,
  BusinessDataAnalysisResult,
  ForecastingResult,
  CustomerAnalysisResult,
  InventoryAnalysisResult,
  BusinessResearchResult,
  DocumentAnalysisResult,
  ManagementAssistanceResult,
  WorkflowPlanningResult,
};

export type { CognitiveExploration, BrainProcessingResult } from './brain/types';
export type {
  StudentDifficulty,
  StudentQuiz,
  PracticeQuestion,
  StudentDiagram,
  EducationalResource,
  RevisionItem,
  StepByStepPhase,
  StudentExample,
  AntiCheatingGuidance,
  StudentInsights,
  StudySessionState,
  StudentReportData,
};

export type FrogeModeId =
  | 'simple-chat'
  | 'deep-thinking'
  | 'froge-code'
  | 'max'
  | 'student-mode';

export interface FrogeModeConfig {
  id: FrogeModeId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  badge: string;
  iconName: string;
  accentColor: string;
  lightBg: string;
  textColor: string;
  borderColor: string;
  placeholder: string;
  samplePrompts: {
    title: string;
    prompt: string;
    category?: string;
  }[];
}

export interface ThoughtData {
  durationSeconds: number;
  steps: string[];
  summary: string;
  expandedByDefault?: boolean;
}

export interface CodeArtifact {
  language: string;
  title: string;
  filename?: string;
  code: string;
  explanation?: string;
}

export interface CreativeMeta {
  styleGenre: string;
  creativePillars: string[];
  inspirationQuote?: string;
}

export interface VisualAttachment {
  id: string;
  type: 'screen_capture' | 'image' | 'window';
  dataUrl: string; // base64 data url
  title?: string;
  timestamp: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  sourceLabel?: string;
}

export interface VisionPerception {
  detectedApp?: string;
  sceneSummary?: string;
  keyUiElements?: string[];
  suggestedActions?: string[];
  confidenceScore?: number;
  resolution?: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  sourceDomain: string;
  favicon?: string;
  publishedDate?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: FrogeModeId;
  timestamp: number;
  status?: 'streaming' | 'complete' | 'error';
  visualAttachment?: VisualAttachment;
  visionPerception?: VisionPerception;
  webSearchResults?: WebSearchResult[];
  thoughtData?: ThoughtData;
  studentInsights?: StudentInsights;
  codeArtifacts?: CodeArtifact[];
  maxPackage?: MaxBusinessPackage;
  cognitiveExploration?: CognitiveExploration;
  brainDetails?: BrainProcessingResult;
  modelName?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: FrogeModeId;
  isPinned?: boolean;
  messages: ChatMessage[];
}

export interface VoiceState {
  isOpen: boolean;
  isListening: boolean;
  transcript: string;
  audioLevel: number;
}
