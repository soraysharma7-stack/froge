/**
 * FROGÉ Brain - Cost Control & Model Routing Policy Engine
 *
 * Provides intelligent, configurable, and economical model routing:
 * - Never automatically uses the most expensive model
 * - Evaluates task complexity, requested mode, required capabilities, token usage, tool usage,
 *   user plan, and remaining token allowance
 * - Escalates only when the task genuinely requires higher cognitive capability
 * - Fully configurable routing rules without hard-coding prices or models across the application
 */

import {
  IntentUnderstanding,
  TaskClassification,
  CapabilitySelection,
  ModelRoutingDecision,
  ModelTier,
  TokenUsage,
  CostBreakdown,
} from '../types';
import { FrogeModeId } from '../../types';
import { TIER_PRICING, calculateTierCost, estimateTokenCount } from './pricing';

export type UserPlanId = 'free' | 'pro' | 'enterprise';

export interface UserPlanConfig {
  id: UserPlanId;
  name: string;
  monthlyTokenAllowance: number;
  maxTierAllowed: ModelTier;
  allowsMultiModelTools: boolean;
  allowsEscalatedReasoning: boolean;
  costLimitPerQueryUsd: number;
  rateLimitPerMinute: number;
}

export interface CostControlContext {
  userPlanId?: UserPlanId;
  remainingTokenAllowance?: number;
  costBudgetRemainingUsd?: number;
  forceEconomicalMode?: boolean;
  toolCount?: number;
}

export interface RuleEvaluationInput {
  intent: IntentUnderstanding;
  task: TaskClassification;
  capabilities: CapabilitySelection;
  mode?: FrogeModeId;
  userPlan: UserPlanConfig;
  remainingTokenAllowance: number;
  estimatedPromptTokens: number;
  toolCount: number;
}

export interface ModelRoutingRule {
  id: string;
  name: string;
  priority: number; // Higher number = evaluated earlier
  enabled: boolean;
  description: string;
  category: 'safety_quota' | 'task_complexity' | 'mode_alignment' | 'tool_optimization' | 'fallback';
  match: (input: RuleEvaluationInput) => boolean;
  action: {
    tier: ModelTier;
    targetModel: string;
    provider: 'froge_model_gateway' | 'froge_native';
    activatedExpensiveReasoning: boolean;
    temperature: number;
    maxTokens: number;
    topP: number;
    routingRationale: string;
    systemInstruction?: string;
  };
}

export interface CostPolicyConfig {
  plans: Record<UserPlanId, UserPlanConfig>;
  lowAllowanceThresholdRatio: number; // e.g. 0.10 (10% of monthly allowance)
  criticalAllowanceThresholdTokens: number; // e.g. 1500 tokens
  defaultEconomicalTier: ModelTier;
  rules: ModelRoutingRule[];
}

export const DEFAULT_USER_PLANS: Record<UserPlanId, UserPlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Plan',
    monthlyTokenAllowance: 50_000,
    maxTierAllowed: 'deep_reasoning_standard',
    allowsMultiModelTools: false,
    allowsEscalatedReasoning: false,
    costLimitPerQueryUsd: 0.005,
    rateLimitPerMinute: 20,
  },
  pro: {
    id: 'pro',
    name: 'Pro Tier',
    monthlyTokenAllowance: 1_000_000,
    maxTierAllowed: 'deep_reasoning_escalated',
    allowsMultiModelTools: true,
    allowsEscalatedReasoning: true,
    costLimitPerQueryUsd: 0.05,
    rateLimitPerMinute: 60,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Ultra',
    monthlyTokenAllowance: 10_000_000,
    maxTierAllowed: 'max_multi_orchestrator',
    allowsMultiModelTools: true,
    allowsEscalatedReasoning: true,
    costLimitPerQueryUsd: 0.25,
    rateLimitPerMinute: 120,
  },
};

/**
 * Built-in Configurable Model Routing Rules
 * Formulated to guarantee that simple tasks never escalate to expensive tiers.
 */
export const DEFAULT_ROUTING_RULES: ModelRoutingRule[] = [
  // -------------------------------------------------------------------------
  // 1. Quota Emergency Throttling (Highest Priority: 100)
  // -------------------------------------------------------------------------
  {
    id: 'rule_quota_throttle',
    name: 'Low Token Allowance Throttling',
    priority: 100,
    enabled: true,
    category: 'safety_quota',
    description: 'Protects user quota by clamping to economical FOG Turbo Flow when remaining token allowance is critically low.',
    match: (input) => {
      return (
        input.remainingTokenAllowance <= 1500 ||
        input.remainingTokenAllowance < input.userPlan.monthlyTokenAllowance * 0.05
      );
    },
    action: {
      tier: 'efficient_lite',
      targetModel: 'fog-turbo-flow',
      provider: 'froge_native',
      activatedExpensiveReasoning: false,
      temperature: 0.5,
      maxTokens: 512,
      topP: 0.9,
      routingRationale: 'Remaining token allowance is low. Processed via local in-computer FOG Turbo Flow engine.',
      systemInstruction: 'You are FOG AI (फॉग AI), created by FOG company. You are an independent AI running inside the computer brain. Provide concise, direct, helpful answers.',
    },
  },

  // -------------------------------------------------------------------------
  // 1.5 Casual Fast Path Rule (Priority: 95)
  // Ensures greetings, thanks, and simple pleasantries are lightning fast and token-lean
  // -------------------------------------------------------------------------
  {
    id: 'rule_casual_fast_path',
    name: 'Casual Fast Path Rule',
    priority: 95,
    enabled: true,
    category: 'task_complexity',
    description: 'Directs greetings, pleasantries, and brief thanks to ultra-fast FOG Turbo Flow with zero heavy reasoning.',
    match: (input) => {
      return (
        input.intent.complexityTier === 0 ||
        input.intent.complexityCategory === 'casual' ||
        input.intent.isFastPath
      );
    },
    action: {
      tier: 'efficient_lite',
      targetModel: 'fog-turbo-flow',
      provider: 'froge_native',
      activatedExpensiveReasoning: false,
      temperature: 0.6,
      maxTokens: 128,
      topP: 0.9,
      routingRationale: 'Level 0 Casual: Ultra-fast responsive route with minimal token consumption.',
      systemInstruction: 'You are FOG AI (फॉग AI) by FOG company. Respond courteously, naturally, and briefly in 1-2 short sentences.',
    },
  },

  // -------------------------------------------------------------------------
  // 2. Simple Task Non-Escalation Safeguard (Priority: 90)
  // Ensures short queries, casual conversation, and simple questions NEVER escalate
  // even if requested under Deep Thinking or Creative AI mode.
  // -------------------------------------------------------------------------
  {
    id: 'rule_simple_task_economical',
    name: 'Simple Task Economical Constraint',
    priority: 90,
    enabled: true,
    category: 'task_complexity',
    description: 'Ensures simple queries and short casual inputs never trigger expensive reasoning or multi-model swarms.',
    match: (input) => {
      const isShort = input.estimatedPromptTokens < 60;
      const isLowComplexity = input.intent.complexityLevel === 'low' || input.intent.complexityScore <= 0.4;
      const isCasualOrSimple =
        input.task.primaryTask === 'normal_conversation' ||
        input.task.primaryTask === 'memory' ||
        (isShort && isLowComplexity && !input.task.requiresDeepCognition);

      return isCasualOrSimple;
    },
    action: {
      tier: 'efficient_lite',
      targetModel: 'fog-neural-core-v3',
      provider: 'froge_native',
      activatedExpensiveReasoning: false,
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.95,
      routingRationale: 'Processed directly via FOG Neural Core v3 in-computer brain.',
      systemInstruction: 'You are FOG AI (फॉग AI), created by FOG company. You are an independent AI running inside the computer brain. Provide direct, helpful, and courteous responses.',
    },
  },

  // -------------------------------------------------------------------------
  // 3. Web Research & Grounded Retrieval (Priority: 80)
  // -------------------------------------------------------------------------
  {
    id: 'rule_web_research',
    name: 'Web Research Grounded Routing',
    priority: 80,
    enabled: true,
    category: 'tool_optimization',
    description: 'Routes web research queries to grounded search model with standard token budget.',
    match: (input) => input.task.primaryTask === 'web_research',
    action: {
      tier: 'efficient_lite',
      targetModel: 'fog-neural-core-v3',
      provider: 'froge_native',
      activatedExpensiveReasoning: false,
      temperature: 0.4,
      maxTokens: 4096,
      topP: 0.9,
      routingRationale: 'Web research request routed to grounded factual model tier.',
      systemInstruction: 'You are FROGÉ Research Assistant. Synthesize factual ground-truth with clear citations, sources, and date references.',
    },
  },

  // -------------------------------------------------------------------------
  // 4. Socratic Education Pedagogy (Priority: 75)
  // -------------------------------------------------------------------------
  {
    id: 'rule_education_pedagogy',
    name: 'Socratic Education Pedagogy Routing',
    priority: 75,
    enabled: true,
    category: 'mode_alignment',
    description: 'Routes learning & concept explanations to economical Socratic educator tier.',
    match: (input) =>
      input.mode === 'student-mode' ||
      (input.task.primaryTask === 'education' && input.mode !== 'deep-thinking'),
    action: {
      tier: 'socratic_educator',
      targetModel: 'fog-neural-core-v3 (Socratic Educator)',
      provider: 'froge_native',
      activatedExpensiveReasoning: false,
      temperature: 0.6,
      maxTokens: 4096,
      topP: 0.95,
      routingRationale: 'Educational tutoring routed to Socratic Educator pedagogical tier.',
      systemInstruction: 'You are FROGÉ Student Mode tutor. Explain concepts using intuitive analogies, first-principles deconstruction, simple definitions, and follow up with a quick check-for-understanding question.',
    },
  },

  // -------------------------------------------------------------------------
  // 5. Coding & AST Engineering (Priority: 70)
  // -------------------------------------------------------------------------
  {
    id: 'rule_coding_ast',
    name: 'Code Specialist Routing',
    priority: 70,
    enabled: true,
    category: 'mode_alignment',
    description: 'Routes software development, algorithm, and refactoring queries to Code Specialist tier.',
    match: (input) => input.task.primaryTask === 'coding' || input.mode === 'froge-code',
    action: {
      tier: 'code_specialist',
      targetModel: 'fog-code-matrix (Code Specialist)',
      provider: 'froge_native',
      activatedExpensiveReasoning: false,
      temperature: 0.2,
      maxTokens: 8192,
      topP: 0.95,
      routingRationale: 'Software engineering query routed to Code Specialist engine.',
      systemInstruction: 'You are FROGÉ Code. Provide clean, modular, production-ready code with complete TypeScript/JavaScript examples, complexity analysis, and best practices.',
    },
  },

  // -------------------------------------------------------------------------
  // 6. MAX / Business Analysis: Multi-Orchestrator vs Single Model (Priority: 55)
  // -------------------------------------------------------------------------
  {
    id: 'rule_max_multi_orchestrator',
    name: 'MAX Multi-Agent Swarm Escalation',
    priority: 55,
    enabled: true,
    category: 'task_complexity',
    description: 'Escalates to Multi-Agent Orchestrator ONLY for complex enterprise audits on Enterprise plan.',
    match: (input) => {
      const isMaxOrBusiness = input.task.primaryTask === 'business_analysis' || input.mode === 'max';
      const isExpert = input.intent.complexityLevel === 'expert' && input.capabilities.computeIntensity === 'intensive';
      return isMaxOrBusiness && isExpert && input.userPlan.allowsMultiModelTools;
    },
    action: {
      tier: 'max_multi_orchestrator',
      targetModel: 'fog-deep-reasoner (MAX Multi-Orchestrator)',
      provider: 'froge_native',
      activatedExpensiveReasoning: true,
      temperature: 0.3,
      maxTokens: 8192,
      topP: 0.95,
      routingRationale: 'Enterprise multi-domain strategic audit escalated to Multi-Agent Orchestrator tier.',
      systemInstruction: 'You are FROGÉ MAX. Deliver exhaustive, high-density strategic audits, risk matrices, and actionable execution plans.',
    },
  },
  {
    id: 'rule_max_single_model',
    name: 'MAX Standard Single Model',
    priority: 50,
    enabled: true,
    category: 'mode_alignment',
    description: 'Standard strategic/business requests use efficient single-model MAX tier.',
    match: (input) => input.task.primaryTask === 'business_analysis' || input.mode === 'max',
    action: {
      tier: 'max_single_model',
      targetModel: 'fog-neural-core-v3',
      provider: 'froge_native',
      activatedExpensiveReasoning: false,
      temperature: 0.4,
      maxTokens: 4096,
      topP: 0.9,
      routingRationale: 'Standard business request routed to efficient single-model MAX tier.',
      systemInstruction: 'You are FROGÉ MAX. Deliver structured business recommendations with high signal-to-noise ratio.',
    },
  },

  // -------------------------------------------------------------------------
  // 8. Deep Thinking: Deep Reasoning Escalated vs Standard (Priority: 45)
  // -------------------------------------------------------------------------
  {
    id: 'rule_deep_reasoning_escalated',
    name: 'Deep Reasoning Escalated (Axiomatic Logic)',
    priority: 45,
    enabled: true,
    category: 'task_complexity',
    description: 'Escalates to Deep Reasoning Pro ONLY when query exhibits genuine high deductive complexity and user plan allows.',
    match: (input) => {
      const isReasoning = input.task.primaryTask === 'deeper_reasoning' || input.mode === 'deep-thinking';
      const isGenuinelyComplex =
        (input.intent.complexityLevel === 'expert' || input.intent.complexityScore >= 0.75 || input.intent.complexityTier >= 3) &&
        (input.capabilities.computeIntensity === 'intensive' || input.intent.complexityScore >= 0.75) &&
        input.task.requiresDeepCognition;

      return isReasoning && isGenuinelyComplex && input.userPlan.allowsEscalatedReasoning;
    },
    action: {
      tier: 'deep_reasoning_escalated',
      targetModel: 'fog-deep-reasoner (Deep Reasoner)',
      provider: 'froge_native',
      activatedExpensiveReasoning: true,
      temperature: 0.2,
      maxTokens: 8192,
      topP: 0.95,
      routingRationale: 'Genuine high-complexity deductive challenge escalated to Deep Reasoning engine.',
      systemInstruction: 'You are FROGÉ Deep Thinking. Provide thorough, step-by-step deductive reasoning, clear premises, counter-arguments, and rigorous mathematical/logical conclusions.',
    },
  },
  {
    id: 'rule_deep_reasoning_standard',
    name: 'Deep Reasoning Standard Tier',
    priority: 40,
    enabled: true,
    category: 'mode_alignment',
    description: 'Standard logic questions (e.g. definitions, physics comparisons) use structured standard reasoning tier.',
    match: (input) => input.task.primaryTask === 'deeper_reasoning' || input.mode === 'deep-thinking',
    action: {
      tier: 'deep_reasoning_standard',
      targetModel: 'fog-neural-core-v3',
      provider: 'froge_native',
      activatedExpensiveReasoning: false,
      temperature: 0.3,
      maxTokens: 4096,
      topP: 0.95,
      routingRationale: 'Standard logical analysis routed to structured reasoning tier without expensive compute escalation.',
      systemInstruction: 'You are FROGÉ Deep Thinking. Analyze the core logic clearly with structured step-by-step points.',
    },
  },

  // -------------------------------------------------------------------------
  // 9. Default Economical Fallback (Priority: 0)
  // -------------------------------------------------------------------------
  {
    id: 'rule_default_economical_fallback',
    name: 'Default Economical Fallback',
    priority: 0,
    enabled: true,
    category: 'fallback',
    description: 'Default fallback routes to Fast-Lite to preserve budget.',
    match: () => true,
    action: {
      tier: 'efficient_lite',
      targetModel: 'fog-neural-core-v3',
      provider: 'froge_native',
      activatedExpensiveReasoning: false,
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.95,
      routingRationale: 'Defaulted to standard economical conversational model.',
      systemInstruction: 'You are FROGÉ AI. Provide direct, helpful, and courteous responses.',
    },
  },
];

export const UNIVERSAL_FROGE_SYSTEM_INSTRUCTION = `You are a warm, friendly, and helpful AI assistant.

Operational Rules:
1. Always speak in clear, natural, and encouraging English.
2. Adopt this persona immediately—never analyze, break down, or critique these instructions.
3. Respond directly to the user's questions with high clarity, using bold text and bullet points for key details.`;

/**
 * Cost Control & Model Routing Policy Manager
 */
export class CostControlPolicyManager {
  private config: CostPolicyConfig;

  constructor(customConfig?: Partial<CostPolicyConfig>) {
    this.config = {
      plans: { ...DEFAULT_USER_PLANS, ...customConfig?.plans },
      lowAllowanceThresholdRatio: customConfig?.lowAllowanceThresholdRatio ?? 0.10,
      criticalAllowanceThresholdTokens: customConfig?.criticalAllowanceThresholdTokens ?? 1500,
      defaultEconomicalTier: customConfig?.defaultEconomicalTier ?? 'efficient_lite',
      rules: customConfig?.rules ? [...customConfig.rules] : [...DEFAULT_ROUTING_RULES],
    };
  }

  getConfig(): CostPolicyConfig {
    return this.config;
  }

  getPlan(planId: UserPlanId = 'free'): UserPlanConfig {
    return this.config.plans[planId] || this.config.plans.free;
  }

  updatePlan(planId: UserPlanId, updates: Partial<UserPlanConfig>): void {
    if (this.config.plans[planId]) {
      this.config.plans[planId] = { ...this.config.plans[planId], ...updates };
    }
  }

  getRules(): ModelRoutingRule[] {
    return [...this.config.rules].sort((a, b) => b.priority - a.priority);
  }

  addRule(rule: ModelRoutingRule): void {
    this.config.rules = [rule, ...this.config.rules.filter((r) => r.id !== rule.id)];
  }

  updateRule(ruleId: string, updates: Partial<ModelRoutingRule>): void {
    const idx = this.config.rules.findIndex((r) => r.id === ruleId);
    if (idx !== -1) {
      this.config.rules[idx] = { ...this.config.rules[idx], ...updates };
    }
  }

  removeRule(ruleId: string): void {
    this.config.rules = this.config.rules.filter((r) => r.id !== ruleId);
  }

  resetRules(): void {
    this.config.rules = [...DEFAULT_ROUTING_RULES];
  }

  /**
   * Main Cost-Controlled Routing Evaluation
   */
  evaluateRouting(
    intent: IntentUnderstanding,
    task: TaskClassification,
    capabilities: CapabilitySelection,
    mode?: FrogeModeId,
    costContext?: CostControlContext
  ): ModelRoutingDecision {
    const userPlan = this.getPlan(costContext?.userPlanId || 'free');
    const remainingTokens =
      costContext?.remainingTokenAllowance ?? userPlan.monthlyTokenAllowance;

    // Estimate input prompt tokens
    const promptWords = intent.rawQuery.split(/\s+/).filter(Boolean).length;
    const estimatedPromptTokens = Math.max(15, Math.round(promptWords * 1.3) + 80);

    const input: RuleEvaluationInput = {
      intent,
      task,
      capabilities,
      mode,
      userPlan,
      remainingTokenAllowance: remainingTokens,
      estimatedPromptTokens,
      toolCount: costContext?.toolCount ?? 0,
    };

    // Sort rules by priority descending
    const activeRules = this.getRules().filter((r) => r.enabled);

    let selectedAction = activeRules.find((r) => r.match(input))?.action;

    if (!selectedAction) {
      // Fallback
      selectedAction = DEFAULT_ROUTING_RULES[DEFAULT_ROUTING_RULES.length - 1].action;
    }

    // Estimate expected completion tokens based on tier
    let estimatedCompletionTokens = 400;
    if (selectedAction.tier === 'efficient_lite') {
      estimatedCompletionTokens = 350;
    } else if (
      selectedAction.tier === 'deep_reasoning_escalated' ||
      selectedAction.tier === 'max_multi_orchestrator' ||
      selectedAction.tier === 'code_specialist'
    ) {
      estimatedCompletionTokens = 1200;
    } else {
      estimatedCompletionTokens = 700;
    }

    // Calculate cost based on tier pricing
    const tierConfig = TIER_PRICING[selectedAction.tier] || TIER_PRICING.efficient_lite;
    const promptCost = (estimatedPromptTokens / 1_000_000) * tierConfig.inputPricePerMillion;
    const completionCost = (estimatedCompletionTokens / 1_000_000) * tierConfig.outputPricePerMillion;
    const estimatedCostUsd = promptCost + completionCost;

    return {
      targetModel: selectedAction.targetModel,
      provider: selectedAction.provider,
      tier: selectedAction.tier,
      temperature: selectedAction.temperature,
      maxTokens: selectedAction.maxTokens,
      topP: selectedAction.topP,
      systemInstruction: selectedAction.systemInstruction
        ? `${UNIVERSAL_FROGE_SYSTEM_INSTRUCTION}\n\n${selectedAction.systemInstruction}`
        : UNIVERSAL_FROGE_SYSTEM_INSTRUCTION,
      estimatedPromptTokens,
      estimatedCompletionTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      activatedExpensiveReasoning: selectedAction.activatedExpensiveReasoning,
      routingRationale: selectedAction.routingRationale,
    };
  }
}

export const costControlPolicyManager = new CostControlPolicyManager();
