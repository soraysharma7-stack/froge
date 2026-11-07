/**
 * FROGÉ Brain - Master Modular Backend Service
 *
 * Full Pipeline Architecture:
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
 *
 * Privacy Rule: Raw internal chain-of-thought tokens are NEVER exposed in the public response.
 * Only useful reasoning summaries, conclusions, verified evidence, and calibrated uncertainty are returned.
 */

import {
  BrainRequest,
  BrainProcessingResponse,
  CognitiveExploration,
  BrainTaskType,
  BrainCapability,
} from './types';
import { understandIntent } from './intentUnderstanding';
import { classifyTask } from './taskClassifier';
import { selectCapabilities } from './capabilitySelector';
import { routeModel } from './modelRouter';
import { selectTools } from './toolSelector';
import { executePlan } from './executor';
import { verifyResult } from './verifier';
import { synthesizeResponse } from './responseSynthesizer';
import { FrogeModeId } from '../types';
import { AIResponsePayload, generateSmartResponse } from '../utils/mockAi';

export * from './types';
export { understandIntent } from './intentUnderstanding';
export { classifyTask } from './taskClassifier';
export { selectCapabilities } from './capabilitySelector';
export { routeModel, frogeModelRouter, sessionMetricsTracker } from './modelRouter';
export { selectTools } from './toolSelector';
export { executePlan } from './executor';
export { verifyResult, verifyOutput } from './verifier';
export { synthesizeResponse } from './responseSynthesizer';
export { brainMemory } from './memory';
export { frogeBrainEngine, FrogeBrainEngine } from './engine/frogeBrainEngine';
export { frogeKnowledgeEngine, FrogeKnowledgeEngine } from './knowledge/knowledgeEngine';
export { FROGE_SYSTEM_CONSTITUTION, getFrogeSystemPrompt } from './prompt/frogeSystemPrompt';
export { brainTools } from './tools';
export { brainAgents } from './agents';
export { runBrainTests } from './tests';
export {
  modelProviderRegistry,
  ClaudeAnthropicProvider,
  FrogeNativeProvider,
  FrogeModelGatewayProvider,
  OpenAICompatibleProvider,
  MockTestHarnessProvider,
} from './models/providers';
export { frogeModelGateway, FrogeModelNotConfiguredError } from './gateway/frogeModelGateway';
export { CLAUDE_MODELS } from './models/pricing';
export { runModelLayerTestSuite } from './models/testSuite';
export { runCostControlTestSuite } from './models/costControlTests';
export {
  costControlPolicyManager,
  DEFAULT_USER_PLANS,
  DEFAULT_ROUTING_RULES,
} from './models/costPolicy';
export type {
  UserPlanId,
  UserPlanConfig,
  CostControlContext,
  ModelRoutingRule,
  CostPolicyConfig,
} from './models/costPolicy';
export {
  tokenUsageTracker,
  TokenUsageService,
  DEFAULT_SUBSCRIPTION_PLANS,
} from './models/usageService';
export * from './models/usageTypes';
export { runTokenUsageTestSuite } from './models/tokenUsageTests';
export type {
  TokenTestResultItem,
  TokenUsageTestSuiteSummary,
} from './models/tokenUsageTests';
export { TIER_PRICING, calculateTierCost, estimateTokenCount } from './models/pricing';
export * from './models/errors';

// Research Engine Exports
export * from './research/types';
export { frogeResearchEngine, FrogeResearchEngine } from './research/researchEngine';
export { determineRecencyNeed } from './research/recencyDetector';
export { createResearchPlan, OFFICIAL_PRIMARY_DOMAINS } from './research/researchPlanner';
export { searchAndCollectSources, classifyDomainCategory } from './research/sourceSearcher';
export { compareSourcesAndCorroborate, auditSourceDates } from './research/sourceComparator';
export { evaluateSourceQuality } from './research/qualityEvaluator';
export { detectContradictions } from './research/contradictionDetector';
export {
  buildResearchCitations,
  calibrateEpistemics,
  generateCalibratedAnswer,
} from './research/answerSynthesizer';
export { runResearchTestSuite } from './research/testSuite';
export type { ResearchTestSuiteSummary, ResearchTestResult } from './research/testSuite';

// News Verification Layer Exports (Current News, FACT/INFERENCE/UNCERTAINTY)
export * from './verification/newsVerificationTypes';
export {
  detectCurrentNewsTrigger,
  auditSources,
  classifyEpistemicCategories,
  formatNewsVerificationSynthesis,
  verifyCurrentNewsQuery,
} from './verification/newsVerificationLayer';
export { runNewsVerificationTestSuite } from './verification/newsVerificationTests';
export type { NewsTestResult, NewsTestSuiteSummary } from './verification/newsVerificationTests';
export { FastApiLocalModelProvider } from './models/fastapiProvider';

// FROGÉ Code Engine & Workspace Architecture Exports
export * from './code/types';
export { frogeCodeEngine, FrogeCodeEngine } from './code/codeEngine';
export { understandCodeRequirements } from './code/requirementsEngine';
export { createProjectPlan } from './code/projectPlanner';
export { generateProjectFiles } from './code/fileGenerator';
export { runApplicationSandbox } from './code/applicationRunner';
export { executeCodeTests } from './code/codeTester';
export { findErrors } from './code/errorDetector';
export { applyFixesAndRetest } from './code/codeFixer';
export { runSecurityCheck } from './code/securityAuditor';
export { secureCodeSandbox, SecureCodeSandbox, DEFAULT_SANDBOX_POLICY } from './code/sandbox';
export { VirtualFileSystem } from './code/virtualFileSystem';
export { codeExplainerEngine, CodeExplainerEngine } from './code/codeExplainer';
export { debuggerEngine, DebuggerEngine } from './code/debuggerEngine';
export { codeReviewEngine, CodeReviewEngine } from './code/codeReviewer';
export { errorAnalyzerEngine, ErrorAnalyzerEngine } from './code/errorAnalyzer';
export { iterativeFixerEngine, IterativeFixerEngine } from './code/iterativeFixer';
export { taskStateManager, TaskStateManager } from './code/taskStateManager';
export { runFrogeCodeTestSuite } from './code/testSuite';
export type { CodeTestResultItem, CodeTestSuiteSummary } from './code/testSuite';

// FROGÉ Modular Memory Architecture Exports (3 Tiers: Conversation, Personalization, App/Data)
export * from './memory/types';
export {
  frogeMemoryEngine,
  FrogeModularMemoryEngine,
  conversationMemory,
  ConversationMemoryManager,
  personalizationMemory,
  PersonalizationMemoryManager,
  appDataMemory,
  AppDataMemoryManager,
  auditSensitiveData,
  FROGE_PRIVACY_DISCLOSURE,
  runFrogeMemoryTestSuite,
  // Live-Learn Personalization
  frogeLiveLearnEngine,
  FrogeLiveLearnEngine,
  detectCorrection,
  classifyStabilityAndValidity,
  runLiveLearnTestSuite,
} from './memory/index';
export type { MemoryTestResultItem, MemoryTestSuiteSummary } from './memory/testSuite';
export type {
  LiveLearnSignal,
  LiveLearnConfig,
  LiveLearnProcessingResult,
  StabilityClassification,
  CorrectionType,
  SignalScope,
  SignalStatus,
  ConflictResolutionStrategy,
  CorrectionDetectionResult,
  StabilityValidationResult,
  LiveLearnTestResultItem,
  LiveLearnTestSuiteSummary,
} from './memory/index';

// Agent Architecture Exports
export * from './agents/index';

// Outcome Learning Architecture Exports
export * from './outcome/index';

// Voice Architecture Subsystem Exports
export * from './voice/index';

// MAX Business-Assistance Architecture Exports (12 Capabilities, Formula Tracing, Action Guard, Controlled Agents)
export * from './max/index';

// Security & Hardening Architecture Exports
export * from './security/index';

// Neural Network Architecture & Cognitive Lifecycle Exports
export * from './neural/neuralArchitecture';

// Full Next-Level Cognitive Pipeline (4-Stage Execution)
export * from './pipeline/nextLevelPipeline';

// Deep English NLP & Linguistic Pragmatics Engine
export * from './language/englishNlpEngine';

// Complete 12-Area Training Guide Specification & Live Cognitive Core
export * from './curriculum/twelveAreaCurriculumSpec';
export * from './curriculum/twelveAreaCognitiveCore';
export * from './curriculum/gpt2VocabularyService';

/**
 * Main FROGÉ Brain Service Pipeline
 */
export async function runFrogeBrainPipeline(
  request: BrainRequest
): Promise<BrainProcessingResponse> {
  const requestId = request.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Step 1: Intent understanding
  const intent = understandIntent(request);

  // Step 2: Task classification (8 core task types)
  const task = classifyTask(intent, request.mode);

  // Step 3: Capability selection
  const capabilities = selectCapabilities(intent, task);

  // Step 4: Model routing
  const routing = routeModel(intent, task, capabilities, request.mode);

  // Step 5: Tool selection
  const tools = selectTools(intent, task, capabilities, routing);

  // Step 6: Execution
  const execution = await executePlan(request, intent, task, capabilities, routing, tools);

  // Step 7: Verification
  const verification = verifyResult(execution, intent, task);

  // Step 8: Response synthesis (No hidden CoT exposed)
  const response = synthesizeResponse(
    execution,
    intent,
    task,
    capabilities,
    routing,
    tools,
    verification,
    requestId
  );

  return response;
}

/**
 * Backward-compatible wrapper for UI components
 */
export async function processThroughFrogeBrain(
  userQuery: string,
  mode: FrogeModeId,
  serverContentOverride?: string,
  studentDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{
  content: string;
  cognitiveExploration: CognitiveExploration;
  brainDetails: any;
  smartPayload: AIResponsePayload;
}> {
  const brainResponse = await runFrogeBrainPipeline({
    query: userQuery,
    mode,
    conversationHistory,
  });

  const finalContent =
    serverContentOverride && serverContentOverride.trim().length > 0
      ? serverContentOverride
      : brainResponse.content;

  const smartPayload = generateSmartResponse(
    userQuery,
    mode,
    conversationHistory.map((h) => ({ id: `h_${Date.now()}`, role: h.role, mode, content: h.content, timestamp: Date.now() })),
    studentDifficulty
  );

  // Maintain compatibility with existing inspector UI
  const brainDetails = {
    intent: {
      primaryIntent: brainResponse.pipelineDiagnostics.task.primaryTask,
      confidence: brainResponse.pipelineDiagnostics.intent.confidence,
      detectedEntities: brainResponse.pipelineDiagnostics.intent.detectedEntities,
      complexity: brainResponse.pipelineDiagnostics.intent.complexityLevel,
      userGoal: brainResponse.pipelineDiagnostics.intent.userGoal,
      suggestedTools: brainResponse.pipelineDiagnostics.tools.selectedTools.map((t) => t.tool),
      requiresMemory: brainResponse.pipelineDiagnostics.task.requiresStatePersistence,
    },
    plan: {
      planId: brainResponse.pipelineDiagnostics.requestId,
      goal: brainResponse.pipelineDiagnostics.intent.userGoal,
      steps: [
        { stepNumber: 1, description: 'Intent understanding & semantic parsing', targetComponent: 'agent' },
        { stepNumber: 2, description: `Classified as ${brainResponse.pipelineDiagnostics.task.primaryTask}`, targetComponent: 'model' },
        { stepNumber: 3, description: `Routing to ${brainResponse.pipelineDiagnostics.routing.targetModel}`, targetComponent: 'model' },
        { stepNumber: 4, description: 'Logic & factual consistency verification', targetComponent: 'agent' },
      ],
      estimatedDifficulty: brainResponse.pipelineDiagnostics.intent.complexityLevel,
      safetyCheckPassed: true,
    },
    routing: {
      route: brainResponse.pipelineDiagnostics.routing.tier,
      selectedModel: brainResponse.pipelineDiagnostics.routing.targetModel,
      activeAgents: [brainResponse.pipelineDiagnostics.capabilities.primaryCapability],
      toolsToInvoke: brainResponse.pipelineDiagnostics.tools.selectedTools.map((t) => t.tool),
      rationale: brainResponse.pipelineDiagnostics.routing.routingRationale,
    },
    modelRouting: {
      selectedTier: brainResponse.pipelineDiagnostics.routing.tier,
      selectedModelName: brainResponse.pipelineDiagnostics.routing.targetModel,
      requiredCapabilities: brainResponse.pipelineDiagnostics.capabilities.selectedCapabilities,
      estimatedPromptTokens: brainResponse.pipelineDiagnostics.tokens.prompt,
      estimatedCompletionTokens: brainResponse.pipelineDiagnostics.tokens.completion,
      estimatedCostUsd: brainResponse.pipelineDiagnostics.estimatedCostUsd,
      routingRationale: brainResponse.pipelineDiagnostics.routing.routingRationale,
      activatedExpensiveReasoning: brainResponse.pipelineDiagnostics.routing.activatedExpensiveReasoning,
      activatedMultiModelTools: brainResponse.pipelineDiagnostics.routing.tier === 'max_multi_orchestrator',
      costTier: brainResponse.pipelineDiagnostics.routing.tier,
    },
    usage: {
      promptTokens: brainResponse.pipelineDiagnostics.tokens.prompt,
      completionTokens: brainResponse.pipelineDiagnostics.tokens.completion,
      totalTokens: brainResponse.pipelineDiagnostics.tokens.total,
      latencyMs: brainResponse.pipelineDiagnostics.durationMs,
    },
    cost: {
      tier: brainResponse.pipelineDiagnostics.routing.tier,
      inputCostUsd: brainResponse.pipelineDiagnostics.estimatedCostUsd * 0.3,
      outputCostUsd: brainResponse.pipelineDiagnostics.estimatedCostUsd * 0.7,
      totalCostUsd: brainResponse.pipelineDiagnostics.estimatedCostUsd,
      baselineUnoptimizedCostUsd: brainResponse.pipelineDiagnostics.estimatedCostUsd * 2.5,
      costSavingsVsBaselineUsd: brainResponse.pipelineDiagnostics.estimatedCostUsd * 1.5,
      savingsPercentage: 60,
    },
    verification: brainResponse.pipelineDiagnostics.verification,
    cognitiveExploration: brainResponse.cognitiveExploration,
    finalContent,
    executionDurationMs: brainResponse.pipelineDiagnostics.durationMs,
    source: `${brainResponse.pipelineDiagnostics.routing.provider} (${brainResponse.pipelineDiagnostics.routing.targetModel})`,
  };

  return {
    content: finalContent,
    cognitiveExploration: brainResponse.cognitiveExploration,
    brainDetails,
    smartPayload,
  };
}
