/**
 * FROGÉ Centralized Token-Based Usage Tracking Service
 *
 * Provides a single unified authority for:
 * - Tracking input tokens, output tokens, total tokens
 * - Calculating estimated model costs and baseline savings
 * - Tracking tool execution counts and tool-induced token overhead
 * - Aggregating conversation-level token and cost metrics
 * - Managing user token balance with allowance limits
 * - Flexible support for future subscription plans
 * - Pre-flight allowance protection against exceeding quotas
 * - Generating friendly, informative limit notifications
 */

import { FrogeModeId } from '../../types';
import { ModelTier } from './types';
import { TIER_PRICING, calculateTierCost, estimateTokenCount } from './pricing';
import {
  TokenUsageRecord,
  ConversationUsageStats,
  UserTokenBalance,
  SubscriptionPlanDefinition,
  PreFlightQuotaCheck,
  UsageChangeEvent,
} from './usageTypes';

export * from './usageTypes';

/**
 * Built-in Subscription Plans
 * Designed to support future tiers seamlessly.
 */
export const DEFAULT_SUBSCRIPTION_PLANS: Record<string, SubscriptionPlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free Plan',
    tagline: 'Ideal for everyday queries and personal learning',
    monthlyPriceUsd: 0,
    monthlyTokenAllowance: 50_000,
    maxTierAllowed: 'deep_reasoning_standard',
    allowsEscalatedReasoning: false,
    allowsMultiModelTools: false,
    rateLimitPerMinute: 20,
    features: [
      '50,000 monthly tokens included',
      'Access to FROGÉ Fast-Lite & Standard Models',
      'Basic tools & web search retriever',
      'Conversation history & memory',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    tagline: 'For active creators and students',
    monthlyPriceUsd: 9,
    monthlyTokenAllowance: 350_000,
    maxTierAllowed: 'code_specialist',
    allowsEscalatedReasoning: false,
    allowsMultiModelTools: true,
    rateLimitPerMinute: 40,
    badge: 'Popular',
    features: [
      '350,000 monthly tokens included',
      'Code Specialist & AST engineer tier',
      'Multi-tool execution',
      'Exportable project artifacts',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Tier',
    tagline: 'Full power for power users and software engineers',
    monthlyPriceUsd: 20,
    monthlyTokenAllowance: 1_000_000,
    maxTierAllowed: 'deep_reasoning_escalated',
    allowsEscalatedReasoning: true,
    allowsMultiModelTools: true,
    rateLimitPerMinute: 60,
    isPopular: true,
    badge: 'Recommended',
    features: [
      '1,000,000 monthly tokens included',
      'Deep Reasoning Axiomatic Engine',
      'Creative High-Nuance Pro models',
      'Priority throughput & latency',
    ],
  },
  team: {
    id: 'team',
    name: 'Team / Studio',
    tagline: 'Collaborative development and shared workspaces',
    monthlyPriceUsd: 49,
    monthlyTokenAllowance: 3_500_000,
    maxTierAllowed: 'max_multi_orchestrator',
    allowsEscalatedReasoning: true,
    allowsMultiModelTools: true,
    rateLimitPerMinute: 100,
    features: [
      '3,500,000 monthly tokens pool',
      'MAX Multi-Model Swarm access',
      'Shared team memory vault',
      'Advanced rate limit ceilings',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Ultra',
    tagline: 'Unlimited cognitive scalability with custom SLAs',
    monthlyPriceUsd: 199,
    monthlyTokenAllowance: 10_000_000,
    maxTierAllowed: 'max_multi_orchestrator',
    allowsEscalatedReasoning: true,
    allowsMultiModelTools: true,
    rateLimitPerMinute: 200,
    badge: 'Enterprise',
    features: [
      '10,000,000 monthly tokens pool',
      'Dedicated API throughput & zero throttling',
      'Multi-agent consensus orchestration',
      'Custom LLM endpoint routing',
    ],
  },
};

const STORAGE_KEY_BALANCE = 'froge_token_balance_v1';
const STORAGE_KEY_RECORDS = 'froge_token_records_v1';
const STORAGE_KEY_CONVERSATIONS = 'froge_conversation_usage_v1';
const STORAGE_KEY_PLANS = 'froge_custom_plans_v1';

export class TokenUsageService {
  private plans: Record<string, SubscriptionPlanDefinition>;
  private balance: UserTokenBalance;
  private conversationStats: Map<string, ConversationUsageStats>;
  private usageRecords: TokenUsageRecord[];
  private listeners: Set<(event: UsageChangeEvent) => void>;
  private isBrowser: boolean;

  constructor() {
    this.plans = { ...DEFAULT_SUBSCRIPTION_PLANS };
    this.conversationStats = new Map();
    this.usageRecords = [];
    this.listeners = new Set();
    this.isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

    // Initialize balance
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const defaultPlan = this.plans.free;

    this.balance = {
      userPlanId: defaultPlan.id,
      planName: defaultPlan.name,
      monthlyTokenAllowance: defaultPlan.monthlyTokenAllowance,
      bonusTokens: 0,
      totalAllowance: defaultPlan.monthlyTokenAllowance,
      consumedTokens: 0,
      consumedInputTokens: 0,
      consumedOutputTokens: 0,
      consumedToolTokens: 0,
      remainingTokens: defaultPlan.monthlyTokenAllowance,
      percentUsed: 0,
      totalCostUsd: 0,
      totalSavingsUsd: 0,
      totalToolExecutions: 0,
      totalConversationsTracked: 0,
      isLimitReached: false,
      isNearLimitWarning: false,
      billingCycleStartDate: now,
      billingCycleResetDate: now + thirtyDays,
    };

    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) return;

    try {
      // 1. Load custom plans if any
      const savedPlans = localStorage.getItem(STORAGE_KEY_PLANS);
      if (savedPlans) {
        const parsed = JSON.parse(savedPlans);
        this.plans = { ...DEFAULT_SUBSCRIPTION_PLANS, ...parsed };
      }

      // 2. Load balance
      const savedBalance = localStorage.getItem(STORAGE_KEY_BALANCE);
      if (savedBalance) {
        const parsed: UserTokenBalance = JSON.parse(savedBalance);
        // Ensure plan exists
        const plan = this.plans[parsed.userPlanId] || this.plans.free;
        this.balance = {
          ...parsed,
          userPlanId: plan.id,
          planName: plan.name,
          monthlyTokenAllowance: plan.monthlyTokenAllowance,
          totalAllowance: plan.monthlyTokenAllowance + (parsed.bonusTokens || 0),
          remainingTokens: Math.max(0, (plan.monthlyTokenAllowance + (parsed.bonusTokens || 0)) - (parsed.consumedTokens || 0)),
          percentUsed: this.calcPercentUsed(parsed.consumedTokens || 0, plan.monthlyTokenAllowance + (parsed.bonusTokens || 0)),
          isLimitReached: (parsed.consumedTokens || 0) >= (plan.monthlyTokenAllowance + (parsed.bonusTokens || 0)),
          isNearLimitWarning: this.calcNearLimit(parsed.consumedTokens || 0, plan.monthlyTokenAllowance + (parsed.bonusTokens || 0)),
        };
      }

      // 3. Load conversation stats
      const savedConvs = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (savedConvs) {
        const parsed: Record<string, ConversationUsageStats> = JSON.parse(savedConvs);
        Object.entries(parsed).forEach(([id, stats]) => {
          this.conversationStats.set(id, stats);
        });
      }

      // 4. Load recent records
      const savedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (savedRecords) {
        this.usageRecords = JSON.parse(savedRecords);
      }
    } catch (e) {
      console.warn('Failed to load usage data from storage:', e);
    }
  }

  private saveToStorage(): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(STORAGE_KEY_BALANCE, JSON.stringify(this.balance));

      const convsObj: Record<string, ConversationUsageStats> = {};
      this.conversationStats.forEach((v, k) => {
        convsObj[k] = v;
      });
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(convsObj));

      // Keep up to 100 most recent records in localStorage
      const trimmedRecords = this.usageRecords.slice(0, 100);
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(trimmedRecords));
    } catch (e) {
      console.warn('Failed to save usage data to storage:', e);
    }
  }

  private calcPercentUsed(consumed: number, total: number): number {
    if (total <= 0) return 100;
    return Math.min(100, Math.round((consumed / total) * 100));
  }

  private calcNearLimit(consumed: number, total: number): boolean {
    if (total <= 0) return true;
    const remaining = total - consumed;
    return (consumed / total) >= 0.85 || (remaining > 0 && remaining <= 2000);
  }

  /**
   * Get current User Token Balance
   */
  getBalance(): UserTokenBalance {
    return { ...this.balance };
  }

  /**
   * Get all registered subscription plans
   */
  getPlans(): SubscriptionPlanDefinition[] {
    return Object.values(this.plans);
  }

  /**
   * Get a specific plan by ID
   */
  getPlan(planId: string): SubscriptionPlanDefinition {
    return this.plans[planId] || this.plans.free;
  }

  /**
   * Register a new or updated subscription plan (supporting future tiers)
   */
  registerPlan(plan: SubscriptionPlanDefinition): void {
    this.plans[plan.id] = plan;
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(this.plans));
    }
    // If current user is on this plan, update their allowance
    if (this.balance.userPlanId === plan.id) {
      this.setPlan(plan.id);
    }
  }

  /**
   * Switch the user's active subscription plan
   */
  setPlan(planId: string): UserTokenBalance {
    const plan = this.getPlan(planId);
    const newAllowance = plan.monthlyTokenAllowance;
    const totalAllowance = newAllowance + this.balance.bonusTokens;
    const remaining = Math.max(0, totalAllowance - this.balance.consumedTokens);

    this.balance = {
      ...this.balance,
      userPlanId: plan.id,
      planName: plan.name,
      monthlyTokenAllowance: newAllowance,
      totalAllowance,
      remainingTokens: remaining,
      percentUsed: this.calcPercentUsed(this.balance.consumedTokens, totalAllowance),
      isLimitReached: remaining <= 0,
      isNearLimitWarning: this.calcNearLimit(this.balance.consumedTokens, totalAllowance),
    };

    this.saveToStorage();
    this.notifyListeners({
      record: null as any,
      balance: this.getBalance(),
    });

    return this.getBalance();
  }

  /**
   * Alias for setPlan
   */
  switchPlan(planId: string): UserTokenBalance {
    return this.setPlan(planId);
  }

  /**
   * Add bonus/booster tokens to user's allowance
   */
  addBonusTokens(amount: number): UserTokenBalance {
    const validAmount = Math.max(0, Math.round(amount));
    const newBonus = this.balance.bonusTokens + validAmount;
    const totalAllowance = this.balance.monthlyTokenAllowance + newBonus;
    const remaining = Math.max(0, totalAllowance - this.balance.consumedTokens);

    this.balance = {
      ...this.balance,
      bonusTokens: newBonus,
      totalAllowance,
      remainingTokens: remaining,
      percentUsed: this.calcPercentUsed(this.balance.consumedTokens, totalAllowance),
      isLimitReached: remaining <= 0,
      isNearLimitWarning: this.calcNearLimit(this.balance.consumedTokens, totalAllowance),
    };

    this.saveToStorage();
    this.notifyListeners({
      record: null as any,
      balance: this.getBalance(),
    });

    return this.getBalance();
  }

  /**
   * Refill / Reset consumption for the current billing cycle
   */
  refillBalance(newAllowance?: number): UserTokenBalance {
    const allowance = newAllowance ?? this.balance.monthlyTokenAllowance;
    const totalAllowance = allowance + this.balance.bonusTokens;

    this.balance = {
      ...this.balance,
      monthlyTokenAllowance: allowance,
      totalAllowance,
      consumedTokens: 0,
      consumedInputTokens: 0,
      consumedOutputTokens: 0,
      consumedToolTokens: 0,
      remainingTokens: totalAllowance,
      percentUsed: 0,
      isLimitReached: false,
      isNearLimitWarning: false,
      billingCycleStartDate: Date.now(),
      billingCycleResetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    this.saveToStorage();
    this.notifyListeners({
      record: null as any,
      balance: this.getBalance(),
    });

    return this.getBalance();
  }

  /**
   * Pre-Flight Quota Check
   * Protects against exceeding user allowance before dispatching queries to model or executing tools.
   */
  checkAllowance(estimatedTokens: number = 200, planId?: string): PreFlightQuotaCheck {
    const currentBalance = this.getBalance();
    const effectivePlanId = planId || currentBalance.userPlanId;
    const plan = this.getPlan(effectivePlanId);

    // If remaining tokens are strictly zero
    if (currentBalance.remainingTokens <= 0) {
      return {
        allowed: false,
        remainingBalance: 0,
        estimatedRequiredTokens: estimatedTokens,
        reason: 'limit_exhausted',
        planId: plan.id,
        planName: plan.name,
        suggestedAction: 'upgrade',
        friendlyMessage: `You've used all ${currentBalance.totalAllowance.toLocaleString()} tokens in your ${plan.name}. Upgrade to Pro for 1,000,000 tokens or add a token booster to keep creating!`,
      };
    }

    // If remaining tokens are insufficient for minimal prompt + response buffer
    const minimalBuffer = Math.max(30, estimatedTokens);
    if (currentBalance.remainingTokens < minimalBuffer) {
      return {
        allowed: false,
        remainingBalance: currentBalance.remainingTokens,
        estimatedRequiredTokens: minimalBuffer,
        reason: 'insufficient_balance_for_query',
        planId: plan.id,
        planName: plan.name,
        suggestedAction: 'refill',
        friendlyMessage: `Your token balance (${currentBalance.remainingTokens.toLocaleString()} tokens remaining) is too low for this request (~${minimalBuffer} tokens needed). Please upgrade or add booster tokens.`,
      };
    }

    return {
      allowed: true,
      remainingBalance: currentBalance.remainingTokens,
      estimatedRequiredTokens: estimatedTokens,
      reason: 'sufficient_balance',
      planId: plan.id,
      planName: plan.name,
      suggestedAction: 'proceed',
    };
  }

  /**
   * Centralized Usage Recorder
   * Accurately deducts from user balance, updates conversation stats, tool metrics, and calculates cost.
   */
  recordUsage(params: {
    mode: FrogeModeId;
    tier: ModelTier;
    model: string;
    provider: string;
    promptTokens: number;
    completionTokens: number;
    toolTokens?: number;
    toolCallsCount?: number;
    toolNames?: string[];
    conversationId?: string;
    messageId?: string;
    durationMs?: number;
  }): TokenUsageRecord {
    const promptTokens = Math.max(0, Math.round(params.promptTokens));
    const completionTokens = Math.max(0, Math.round(params.completionTokens));
    const toolTokens = Math.max(0, Math.round(params.toolTokens || 0));
    const totalTokens = promptTokens + completionTokens + toolTokens;
    const toolCallsCount = Math.max(0, params.toolCallsCount || 0);
    const toolNames = params.toolNames || [];

    // Calculate cost based on tier pricing
    const costBreakdown = calculateTierCost(params.tier, {
      promptTokens: promptTokens + toolTokens,
      completionTokens,
      totalTokens,
      latencyMs: params.durationMs || 0,
    });

    const record: TokenUsageRecord = {
      id: `use_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      conversationId: params.conversationId,
      messageId: params.messageId,
      mode: params.mode,
      tier: params.tier,
      model: params.model,
      provider: params.provider,
      promptTokens,
      completionTokens,
      toolTokens,
      totalTokens,
      toolCallsCount,
      toolNames,
      estimatedCostUsd: costBreakdown.totalCostUsd,
      costSavingsVsBaselineUsd: costBreakdown.costSavingsVsBaselineUsd,
      userPlanId: this.balance.userPlanId,
      durationMs: params.durationMs || 0,
    };

    // 1. Update User Balance
    const newConsumed = this.balance.consumedTokens + totalTokens;
    const newRemaining = Math.max(0, this.balance.totalAllowance - newConsumed);
    const newConsumedInput = this.balance.consumedInputTokens + promptTokens;
    const newConsumedOutput = this.balance.consumedOutputTokens + completionTokens;
    const newConsumedTool = this.balance.consumedToolTokens + toolTokens;
    const newTotalCost = this.balance.totalCostUsd + costBreakdown.totalCostUsd;
    const newTotalSavings = this.balance.totalSavingsUsd + costBreakdown.costSavingsVsBaselineUsd;
    const newToolExecutions = this.balance.totalToolExecutions + toolCallsCount;

    this.balance = {
      ...this.balance,
      consumedTokens: newConsumed,
      consumedInputTokens: newConsumedInput,
      consumedOutputTokens: newConsumedOutput,
      consumedToolTokens: newConsumedTool,
      remainingTokens: newRemaining,
      percentUsed: this.calcPercentUsed(newConsumed, this.balance.totalAllowance),
      totalCostUsd: Number(newTotalCost.toFixed(6)),
      totalSavingsUsd: Number(newTotalSavings.toFixed(6)),
      totalToolExecutions: newToolExecutions,
      isLimitReached: newRemaining <= 0,
      isNearLimitWarning: this.calcNearLimit(newConsumed, this.balance.totalAllowance),
    };

    // 2. Update Conversation Stats (if conversationId provided)
    let convStats: ConversationUsageStats | undefined;
    if (params.conversationId) {
      const existing = this.conversationStats.get(params.conversationId) || {
        conversationId: params.conversationId,
        messageCount: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalToolTokens: 0,
        totalTokens: 0,
        totalCostUsd: 0,
        totalSavingsUsd: 0,
        totalToolCalls: 0,
        toolsUsed: {},
        firstActiveTimestamp: Date.now(),
        lastActiveTimestamp: Date.now(),
      };

      const updatedToolsUsed = { ...existing.toolsUsed };
      toolNames.forEach((name) => {
        updatedToolsUsed[name] = (updatedToolsUsed[name] || 0) + 1;
      });

      convStats = {
        conversationId: params.conversationId,
        messageCount: existing.messageCount + 1,
        totalInputTokens: existing.totalInputTokens + promptTokens,
        totalOutputTokens: existing.totalOutputTokens + completionTokens,
        totalToolTokens: existing.totalToolTokens + toolTokens,
        totalTokens: existing.totalTokens + totalTokens,
        totalCostUsd: Number((existing.totalCostUsd + costBreakdown.totalCostUsd).toFixed(6)),
        totalSavingsUsd: Number((existing.totalSavingsUsd + costBreakdown.costSavingsVsBaselineUsd).toFixed(6)),
        totalToolCalls: existing.totalToolCalls + toolCallsCount,
        toolsUsed: updatedToolsUsed,
        firstActiveTimestamp: existing.firstActiveTimestamp,
        lastActiveTimestamp: Date.now(),
      };

      this.conversationStats.set(params.conversationId, convStats);
      this.balance.totalConversationsTracked = this.conversationStats.size;
    }

    // 3. Prepend to usage history
    this.usageRecords.unshift(record);
    if (this.usageRecords.length > 500) {
      this.usageRecords = this.usageRecords.slice(0, 500);
    }

    // 4. Save and broadcast
    this.saveToStorage();
    this.notifyListeners({
      record,
      balance: this.getBalance(),
      conversationStats: convStats,
    });

    return record;
  }

  /**
   * Get aggregated conversation usage stats
   */
  getConversationStats(conversationId: string): ConversationUsageStats | undefined {
    return this.conversationStats.get(conversationId);
  }

  /**
   * Get all conversation usage stats
   */
  getAllConversationStats(): Record<string, ConversationUsageStats> {
    const res: Record<string, ConversationUsageStats> = {};
    this.conversationStats.forEach((v, k) => {
      res[k] = { ...v };
    });
    return res;
  }

  /**
   * Get recent token usage records
   */
  getUsageRecords(limit: number = 50): TokenUsageRecord[] {
    return this.usageRecords.slice(0, limit);
  }

  /**
   * Subscribe to token balance and usage changes
   */
  subscribe(listener: (event: UsageChangeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(event: UsageChangeEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in token usage listener:', e);
      }
    });
  }

  /**
   * Clear all records and reset state (for test environments)
   */
  clearHistory(): void {
    this.usageRecords = [];
    this.conversationStats.clear();
    this.refillBalance();
  }
}

// Global Singleton Token Usage Service
export const tokenUsageTracker = new TokenUsageService();
