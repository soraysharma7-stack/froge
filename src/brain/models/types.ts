import { FrogeModeId } from '../../types';
import { ModelError, ModelErrorCode } from './errors';

export * from './errors';

export type ModelCapability =
  | 'fast_conversational'
  | 'deep_reasoning'
  | 'creative_synthesis'
  | 'code_architecture'
  | 'multi_tool_orchestration'
  | 'socratic_pedagogy'
  | 'vision_analysis'
  | 'math_ast_computation';

export type ModelTier =
  | 'efficient_lite'              // Simple Chat: Fast, ultra-low cost
  | 'deep_reasoning_standard'     // Deep Thinking: Standard logic
  | 'deep_reasoning_escalated'    // Deep Thinking: Heavy reasoning when genuinely necessary
  | 'code_specialist'             // FROGÉ Code: TypeScript, AST, Linting
  | 'max_single_model'            // MAX: Standard strategic summary
  | 'max_multi_orchestrator'      // MAX: Multi-model / multi-agent consensus only when necessary
  | 'socratic_educator';          // Student Mode: Pedagogical clarity & analogies

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
  latencyMs: number;
}

export interface CostBreakdown {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  costPerMillionInput?: number;
  costPerMillionOutput?: number;
  baselineUnoptimizedCostUsd?: number;
  costSavingsVsBaselineUsd: number;
  savingsPercentage: number;
  currency?: 'USD';
}

export interface ModelRoutingPlan {
  mode: FrogeModeId;
  selectedTier: ModelTier;
  selectedModelName: string;
  providerId: string;
  providerName: string;
  requiredCapabilities: ModelCapability[];
  activatedExpensiveReasoning: boolean;
  activatedMultiModelTools: boolean;
  routingRationale: string;
  estimatedPromptTokens: number;
  estimatedMaxCompletionTokens: number;
  estimatedCostUsd: number;
}

export interface ModelCallOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  retries?: number;
  fallbackToMockOnFailure?: boolean;
  simulateTimeout?: boolean;
  simulateError?: number;
  simulateMissingKey?: boolean;
}

export interface ModelRequest {
  prompt: string;
  mode?: FrogeModeId;
  systemInstruction?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  requiredCapabilities?: ModelCapability[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  timeoutMs?: number;
}

export interface ModelStreamChunk {
  text: string;
  isComplete: boolean;
  tokensDelta?: number;
  partialUsage?: Partial<TokenUsage>;
}

export interface ModelResponse {
  content: string;
  modelId: string;
  providerId: string;
  tier: ModelTier;
  usage: TokenUsage;
  cost: CostBreakdown;
  capabilitiesUsed: ModelCapability[];
  activatedExpensiveReasoning: boolean;
  activatedMultiModelTools: boolean;
  routingRationale: string;
  finishReason?: 'stop' | 'length' | 'timeout' | 'error';
  error?: ModelError;
  fromFallback?: boolean;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  hasApiKey: boolean;
  isConfigurable: boolean;
  supportedTiers: ModelTier[];
  defaultModel: string;
  costTier: 'free' | 'low' | 'standard' | 'high';
}

/**
 * Provider-Independent AI Model Interface
 * Enables plugging in FROGÉ Model Gateway, OpenAI-compatible servers, Ollama, Hugging Face, or Native Engine.
 */
export interface IModelProvider {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  hasApiKey: boolean;
  supportedTiers: ModelTier[];

  /**
   * Complete text generation with timeout and error handling
   */
  generate(
    request: ModelRequest,
    plan?: ModelRoutingPlan,
    options?: ModelCallOptions
  ): Promise<ModelResponse>;

  /**
   * Streaming text generation with chunk callback and error handling
   */
  stream?(
    request: ModelRequest,
    plan: ModelRoutingPlan,
    onChunk: (chunk: ModelStreamChunk) => void,
    options?: ModelCallOptions
  ): Promise<ModelResponse>;

  /**
   * Cost calculation for given tier and token usage
   */
  calculateCost(tier: ModelTier, usage: TokenUsage): CostBreakdown;

  /**
   * Fast client/server token estimation
   */
  estimateTokens(text: string): number;

  /**
   * Provider metadata & readiness check
   */
  getMetadata(): ProviderMetadata;
}
