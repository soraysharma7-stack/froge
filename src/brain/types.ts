/**
 * FROGÉ Brain - Modular Architecture Data Types
 *
 * Architecture Pipeline:
 * Request
 *   ↓
 * Intent understanding (intentUnderstanding.ts)
 *   ↓
 * Task classification (taskClassifier.ts)
 *   ↓
 * Capability selection (capabilitySelector.ts)
 *   ↓
 * Model routing (modelRouter.ts)
 *   ↓
 * Tool selection (toolSelector.ts)
 *   ↓
 * Execution (executor.ts)
 *   ↓
 * Verification (verifier.ts)
 *   ↓
 * Response (responseSynthesizer.ts)
 */

import { FrogeModeId } from '../types';

// ==========================================
// 1. REQUEST STAGE
// ==========================================
export interface BrainRequest {
  query: string;
  mode?: FrogeModeId;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

// ==========================================
// 2. INTENT UNDERSTANDING STAGE
// ==========================================
export type BrainComplexityCategory =
  | 'casual'           // Level 0: Casual ("Hey", "Hi", "Thanks", "Good morning")
  | 'simple'           // Level 1: Simple factual / brief math ("What is 5+5?", "What is HTML?")
  | 'normal'           // Level 2: Normal ("Explain photosynthesis", "Help me plan")
  | 'complex'          // Level 3: Deep reasoning, architecture, coding
  | 'high_complexity'; // Level 4: Full apps, multi-agent research, planning

export interface IntentUnderstanding {
  rawQuery: string;
  normalizedQuery: string;
  detectedEntities: string[];
  extractedSubject?: string;
  requestedAction?: string;
  constraints?: string[];
  expectedOutputType?:
    | 'factual_answer'
    | 'list'
    | 'chronological_table'
    | 'explanation'
    | 'calculation'
    | 'coding_task'
    | 'research'
    | 'conversation';
  userGoal: string;
  implicitNeeds: string[];
  semanticKeywords: string[];
  sentiment:
    | 'happy'
    | 'excited'
    | 'confused'
    | 'stressed'
    | 'frustrated'
    | 'casual'
    | 'curious'
    | 'urgent'
    | 'analytical'
    | 'creative'
    | 'neutral';
  detectedTone?: string;
  conversationalAlignment?: {
    warmOpening: string;
    empathyNote?: string;
    interactiveFollowUp: string;
  };
  complexityScore: number; // 0.0 to 1.0
  complexityLevel: 'low' | 'medium' | 'high' | 'expert';
  complexityCategory: BrainComplexityCategory;
  complexityTier: 0 | 1 | 2 | 3 | 4;
  isFastPath: boolean;
  confidence: number; // 0.0 to 1.0
}

// ==========================================
// 3. TASK CLASSIFICATION STAGE
// 8 Core Brain Task Types required by FROGÉ
// ==========================================
export type BrainTaskType =
  | 'normal_conversation'
  | 'deeper_reasoning'
  | 'web_research'
  | 'creative_generation'
  | 'coding'
  | 'business_analysis'
  | 'education'
  | 'memory';

export interface TaskClassification {
  primaryTask: BrainTaskType;
  secondaryTasks: BrainTaskType[];
  confidenceScores: Record<BrainTaskType, number>;
  urgency: 'standard' | 'high';
  requiresDeepCognition: boolean;
  requiresExternalData: boolean;
  requiresStatePersistence: boolean;
  classificationRationale: string;
}

// ==========================================
// 4. CAPABILITY SELECTION STAGE
// ==========================================
export type BrainCapability =
  | 'conversational_fluency'
  | 'step_by_step_deduction'
  | 'web_search_grounding'
  | 'creative_metaphor_synthesis'
  | 'code_ast_and_refactoring'
  | 'strategic_risk_modeling'
  | 'socratic_pedagogical_breakdown'
  | 'memory_recall_and_indexing'
  | 'mathematical_symbolic_solver'
  | 'multi_agent_orchestration';

export interface CapabilitySelection {
  selectedCapabilities: BrainCapability[];
  primaryCapability: BrainCapability;
  computeIntensity: 'lean' | 'moderate' | 'intensive';
  reasoningBudget: 'none' | 'standard' | 'extended';
  capabilityRationale: string;
}

// ==========================================
// 5. MODEL ROUTING STAGE
// ==========================================
export type ModelTier =
  | 'efficient_lite'
  | 'deep_reasoning_standard'
  | 'deep_reasoning_escalated'
  | 'code_specialist'
  | 'max_single_model'
  | 'max_multi_orchestrator'
  | 'socratic_educator';

export interface ModelRoutingDecision {
  targetModel: string;
  provider: 'froge_model_gateway' | 'froge_native';
  tier: ModelTier;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemInstruction: string;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedCostUsd: number;
  activatedExpensiveReasoning: boolean;
  routingRationale: string;
}

// ==========================================
// 6. TOOL SELECTION STAGE
// ==========================================
export type ToolName =
  | 'web_search_retriever'
  | 'code_sandbox_evaluator'
  | 'symbolic_math_calculator'
  | 'memory_vault_indexer'
  | 'risk_matrix_generator'
  | 'socratic_quiz_builder'
  | 'diagram_visualizer'
  | 'linter_validator';

export interface ToolInvocationPlan {
  tool: ToolName;
  priority: number;
  parameters: Record<string, any>;
  description: string;
  isMandatory: boolean;
}

export interface ToolSelectionResult {
  selectedTools: ToolInvocationPlan[];
  shouldExecuteToolsBeforeModel: boolean;
  toolExecutionRationale: string;
}

// ==========================================
// 7. EXECUTION STAGE
// ==========================================
export interface ToolExecutionOutput {
  tool: ToolName;
  success: boolean;
  output: any;
  durationMs: number;
}

export interface ExecutionResult {
  rawGeneratedContent: string;
  toolOutputs: ToolExecutionOutput[];
  executionDurationMs: number;
  sourceProvider: string;
  sourceModel: string;
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    toolTokens?: number;
    totalTokens: number;
  };
  // Internal execution trace - NEVER exposed directly to users
  _internalTrace?: {
    rawReasoningTokens?: string;
    intermediateStates?: any[];
  };
}

// ==========================================
// 8. VERIFICATION STAGE
// ==========================================
export interface EvidenceItem {
  source: string;
  description: string;
  verified: boolean;
  relevanceScore?: number;
}

export interface VerificationResult {
  isVerified: boolean;
  verificationLevel: 'none' | 'light' | 'standard' | 'deep' | 'strong';
  factualConsistencyScore: number; // 0 to 100
  logicSoundness: 'high' | 'medium' | 'low';
  uncertaintyLevel: 'low' | 'moderate' | 'high';
  uncertaintyPercentage: number;
  uncertaintyNote: string;
  evidenceItems: EvidenceItem[];
  hallucinationFlags: string[];
  verificationNotes: string;
}

// ==========================================
// 9. RESPONSE & COGNITIVE EXPLORATION
// USER-FACING COGNITIVE SYNTHESIS
// Strictly NO raw chain-of-thought tokens!
// ==========================================
export interface CognitiveExploration {
  explanation: string; // High-level reasoning summary
  conclusions: string[]; // Key deductive conclusions
  evidence: EvidenceItem[]; // Supporting factual evidence
  uncertainty: {
    level: 'low' | 'moderate' | 'high';
    confidencePercentage: number;
    notes: string;
  };
  complexityTier?: 0 | 1 | 2 | 3 | 4;
  complexityCategory?: BrainComplexityCategory;
  isFastPath?: boolean;
  verificationLevel?: 'none' | 'light' | 'standard' | 'deep' | 'strong';
  taskClassification?: {
    primaryTask: BrainTaskType;
    rationale: string;
  };
  routedModel?: {
    name: string;
    tier: string;
  };
  activeCapabilities?: string[];
  activeTools?: string[];
  intentSummary?: string;
  activeRoute?: string;
}

export interface BrainProcessingResponse {
  content: string;
  cognitiveExploration: CognitiveExploration;
  pipelineDiagnostics: {
    requestId: string;
    durationMs: number;
    intent: IntentUnderstanding;
    task: TaskClassification;
    capabilities: CapabilitySelection;
    routing: ModelRoutingDecision;
    tools: ToolSelectionResult;
    verification: VerificationResult;
    tokens: {
      prompt: number;
      completion: number;
      total: number;
    };
    estimatedCostUsd: number;
  };
}

// ==========================================
// COMPATIBILITY ALIASES & INTERFACES
// ==========================================
export type BrainProcessingResult = any;

export type PrimaryIntent =
  | 'casual_chat'
  | 'analytical_reasoning'
  | 'creative_composition'
  | 'code_generation'
  | 'strategic_audit'
  | 'educational_tutoring'
  | 'math_computation';

export interface IntentAnalysis {
  primaryIntent: PrimaryIntent;
  confidence: number;
  detectedEntities: string[];
  complexity: 'low' | 'medium' | 'high' | 'expert';
  userGoal: string;
  suggestedTools: string[];
  requiresMemory: boolean;
}

export interface PlanStep {
  stepNumber: number;
  description: string;
  targetComponent: 'model' | 'tool' | 'memory' | 'agent';
  toolName?: string;
  details?: string;
}

export interface ExecutionPlan {
  planId: string;
  goal: string;
  steps: PlanStep[];
  estimatedDifficulty: 'low' | 'medium' | 'high' | 'expert';
  safetyCheckPassed: boolean;
}

export type BrainRouteDestination =
  | 'froge_model_gateway'
  | 'tool_code_executor'
  | 'tool_calculator_and_parser'
  | 'agent_socratic_tutor'
  | 'agent_strategic_auditor'
  | 'memory_retrieval';

export interface RoutingDecision {
  route: BrainRouteDestination;
  selectedModel: string;
  activeAgents: string[];
  toolsToInvoke: string[];
  rationale: string;
}

export interface MemoryRecord {
  id: string;
  timestamp: number;
  key: string;
  content: string;
  category: 'preference' | 'fact' | 'instruction';
  relevanceScore: number;
}

export interface SessionMetrics {
  totalTokens: number;
  totalCostUsd: number;
  totalSavingsUsd: number;
  averageLatencyMs: number;
  routeDistribution: Record<string, number>;
}

// Legacy exports
export * from './models/types';
export * from './models/pricing';
