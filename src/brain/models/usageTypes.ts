import { FrogeModeId } from '../../types';
import { ModelTier } from './types';
import { UserPlanId } from './costPolicy';

export type { UserPlanId } from './costPolicy';

/**
 * Granular record of a single model and/or tool execution
 */
export interface TokenUsageRecord {
  id: string;
  timestamp: number;
  conversationId?: string;
  messageId?: string;
  mode: FrogeModeId;
  tier: ModelTier;
  model: string;
  provider: string;
  promptTokens: number;      // input tokens
  completionTokens: number;  // output tokens
  toolTokens: number;        // tokens consumed by tool calls/data
  totalTokens: number;       // promptTokens + completionTokens + toolTokens
  toolCallsCount: number;
  toolNames: string[];
  estimatedCostUsd: number;
  costSavingsVsBaselineUsd: number;
  userPlanId: string;
  durationMs: number;
}

/**
 * Aggregated metrics for a specific conversation
 */
export interface ConversationUsageStats {
  conversationId: string;
  messageCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalToolTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  totalSavingsUsd: number;
  totalToolCalls: number;
  toolsUsed: Record<string, number>;
  lastActiveTimestamp: number;
  firstActiveTimestamp: number;
}

/**
 * Complete User Token Balance & Consumption Profile
 */
export interface UserTokenBalance {
  userPlanId: string;
  planName: string;
  monthlyTokenAllowance: number;
  bonusTokens: number;          // Added via boosters / refills
  totalAllowance: number;       // monthlyTokenAllowance + bonusTokens
  consumedTokens: number;       // total tokens used in current cycle
  consumedInputTokens: number;  // total prompt tokens used
  consumedOutputTokens: number; // total completion tokens used
  consumedToolTokens: number;   // total tool tokens used
  remainingTokens: number;      // Math.max(0, totalAllowance - consumedTokens)
  percentUsed: number;          // 0 to 100
  totalCostUsd: number;         // Cumulative estimated dollar cost
  totalSavingsUsd: number;      // Cumulative dollar savings vs unoptimized baseline
  totalToolExecutions: number;  // Total tool executions
  totalConversationsTracked: number;
  isLimitReached: boolean;      // True if remainingTokens <= 0
  isNearLimitWarning: boolean;  // True if >= 85% used or < 2000 tokens remaining
  billingCycleStartDate: number;
  billingCycleResetDate: number;
}

/**
 * Flexible Subscription Plan Definition (Supporting future tiers)
 */
export interface SubscriptionPlanDefinition {
  id: string;
  name: string;
  tagline: string;
  monthlyPriceUsd: number;
  monthlyTokenAllowance: number;
  maxTierAllowed: ModelTier;
  allowsEscalatedReasoning: boolean;
  allowsMultiModelTools: boolean;
  rateLimitPerMinute: number;
  isPopular?: boolean;
  badge?: string;
  features: string[];
}

/**
 * Pre-Flight Quota Check Output
 */
export interface PreFlightQuotaCheck {
  allowed: boolean;
  remainingBalance: number;
  estimatedRequiredTokens: number;
  reason?: 'sufficient_balance' | 'limit_exhausted' | 'insufficient_balance_for_query' | 'rate_limit_exceeded';
  friendlyMessage?: string;
  suggestedAction?: 'proceed' | 'upgrade' | 'refill' | 'throttle';
  planId: string;
  planName: string;
}

/**
 * Event payload emitted when usage occurs
 */
export interface UsageChangeEvent {
  record: TokenUsageRecord;
  balance: UserTokenBalance;
  conversationStats?: ConversationUsageStats;
}
