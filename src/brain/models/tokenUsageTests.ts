/**
 * FROGÉ Automated Token Usage & Limits Test Suite
 *
 * Validates:
 * 1. Token Calculation Accuracy (Input, Output, Total)
 * 2. Tool Execution Overhead & Tool Count Accounting
 * 3. Conversation-level Token and Cost Aggregation
 * 4. Model Tier Pricing & Estimated Cost Calculations
 * 5. User Token Balance Deductions & Lifetime Metrics
 * 6. Pre-flight Quota Check & Allowance Protection
 * 7. Friendly Messages & Guidance when Limits Are Reached
 * 8. Low-Balance Warning & Threshold Detection
 * 9. Future Subscription Plan Registration & Dynamic Limits
 * 10. Bonus / Booster Token Balance Replenishment
 */

import { TokenUsageService, DEFAULT_SUBSCRIPTION_PLANS } from './usageService';
import { TIER_PRICING, calculateTierCost, estimateTokenCount } from './pricing';
import { ModelTier } from './types';

export interface TokenTestResultItem {
  id: string;
  name: string;
  category: 'token_calc' | 'tool_usage' | 'conversation_usage' | 'balance_limits' | 'subscription_plans';
  passed: boolean;
  durationMs: number;
  expected: string;
  actual: string;
  details?: string;
}

export interface TokenUsageTestSuiteSummary {
  timestamp: string;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: TokenTestResultItem[];
}

export async function runTokenUsageTestSuite(): Promise<TokenUsageTestSuiteSummary> {
  const results: TokenTestResultItem[] = [];
  const testService = new TokenUsageService();

  // Reset to clean test state
  testService.clearHistory();

  // ---------------------------------------------------------------------------
  // Test 1: Input, Output & Total Token Accounting Accuracy
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const promptTokens = 150;
    const completionTokens = 420;
    const toolTokens = 0;

    const record = testService.recordUsage({
      mode: 'simple-chat',
      tier: 'efficient_lite',
      model: 'froge-neural-v1',
      provider: 'froge_model_gateway',
      promptTokens,
      completionTokens,
      toolTokens,
      conversationId: 'test_conv_1',
    });

    const passed =
      record.promptTokens === 150 &&
      record.completionTokens === 420 &&
      record.totalTokens === 570 &&
      record.toolTokens === 0;

    results.push({
      id: 'test_token_calc_accuracy',
      name: 'Input, Output & Total Token Accounting Accuracy',
      category: 'token_calc',
      passed,
      durationMs: Date.now() - t0,
      expected: 'Prompt: 150, Completion: 420, Total: 570, Tool: 0',
      actual: `Prompt: ${record.promptTokens}, Completion: ${record.completionTokens}, Total: ${record.totalTokens}, Tool: ${record.toolTokens}`,
      details: `Record: id=${record.id}, cost=$${record.estimatedCostUsd}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test_token_calc_accuracy',
      name: 'Input, Output & Total Token Accounting Accuracy',
      category: 'token_calc',
      passed: false,
      durationMs: 0,
      expected: 'Accurate token totals',
      actual: `Exception: ${err.message}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 2: Tool Execution Overhead & Tool Count Accounting
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const toolTokens = 230; // e.g. web search payload + calc output
    const promptTokens = 80;
    const completionTokens = 350;

    const record = testService.recordUsage({
      mode: 'froge-code',
      tier: 'code_specialist',
      model: 'froge-code-v1 (Code Specialist)',
      provider: 'froge_model_gateway',
      promptTokens,
      completionTokens,
      toolTokens,
      toolCallsCount: 2,
      toolNames: ['symbolic_math_calculator', 'web_search_retriever'],
      conversationId: 'test_conv_tool',
    });

    const passed =
      record.toolTokens === 230 &&
      record.totalTokens === 80 + 350 + 230 &&
      record.toolCallsCount === 2 &&
      record.toolNames.length === 2;

    const balance = testService.getBalance();
    const balanceToolPassed = balance.consumedToolTokens >= 230 && balance.totalToolExecutions >= 2;

    results.push({
      id: 'test_tool_overhead_accounting',
      name: 'Tool Execution Overhead & Tool Count Tracking',
      category: 'tool_usage',
      passed: passed && balanceToolPassed,
      durationMs: Date.now() - t0,
      expected: 'Tool tokens: 230, Total: 660, Tool Calls: 2',
      actual: `Tool tokens: ${record.toolTokens}, Total: ${record.totalTokens}, Tool Calls: ${record.toolCallsCount}, Consumed Tool Balance: ${balance.consumedToolTokens}`,
      details: `Tools: [${record.toolNames.join(', ')}], Lifetime Tool Count: ${balance.totalToolExecutions}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test_tool_overhead_accounting',
      name: 'Tool Execution Overhead & Tool Count Tracking',
      category: 'tool_usage',
      passed: false,
      durationMs: 0,
      expected: 'Tool tracking validation',
      actual: `Exception: ${err.message}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 3: Conversation-level Token and Cost Aggregation
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const convId = 'multi_turn_conversation_xyz';

    // Turn 1
    testService.recordUsage({
      mode: 'deep-thinking',
      tier: 'deep_reasoning_standard',
      model: 'froge-neural-v1',
      provider: 'froge_model_gateway',
      promptTokens: 100,
      completionTokens: 300,
      conversationId: convId,
    });

    // Turn 2
    testService.recordUsage({
      mode: 'deep-thinking',
      tier: 'deep_reasoning_standard',
      model: 'froge-neural-v1',
      provider: 'froge_model_gateway',
      promptTokens: 250,
      completionTokens: 450,
      toolTokens: 50,
      toolCallsCount: 1,
      toolNames: ['memory_vault_indexer'],
      conversationId: convId,
    });

    const convStats = testService.getConversationStats(convId);
    const passed =
      !!convStats &&
      convStats.messageCount === 2 &&
      convStats.totalInputTokens === 350 &&
      convStats.totalOutputTokens === 750 &&
      convStats.totalToolTokens === 50 &&
      convStats.totalTokens === 1150 &&
      convStats.totalToolCalls === 1 &&
      convStats.totalCostUsd > 0;

    results.push({
      id: 'test_conversation_aggregation',
      name: 'Conversation-Level Token & Cost Aggregation Across Multi-Turn Chats',
      category: 'conversation_usage',
      passed,
      durationMs: Date.now() - t0,
      expected: 'Conv messages: 2, Input: 350, Output: 750, Total: 1150 tokens, Cost > $0',
      actual: convStats
        ? `Messages: ${convStats.messageCount}, Input: ${convStats.totalInputTokens}, Output: ${convStats.totalOutputTokens}, Total: ${convStats.totalTokens}, Cost: $${convStats.totalCostUsd}`
        : 'Conversation stats not found',
      details: convStats ? `ConvId: ${convStats.conversationId}, Cost: $${convStats.totalCostUsd}` : 'None',
    });
  } catch (err: any) {
    results.push({
      id: 'test_conversation_aggregation',
      name: 'Conversation-Level Token & Cost Aggregation Across Multi-Turn Chats',
      category: 'conversation_usage',
      passed: false,
      durationMs: 0,
      expected: 'Conversation stats aggregation',
      actual: `Exception: ${err.message}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 4: Model Tier Pricing & Estimated Cost Calculations
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    // Test Fast-Lite vs Escalated Reasoning pricing
    const liteUsage = { promptTokens: 1_000_000, completionTokens: 1_000_000, totalTokens: 2_000_000, latencyMs: 100 };
    const liteCost = calculateTierCost('efficient_lite', liteUsage);

    const proUsage = { promptTokens: 1_000_000, completionTokens: 1_000_000, totalTokens: 2_000_000, latencyMs: 100 };
    const proCost = calculateTierCost('deep_reasoning_escalated', proUsage);

    // Efficient lite: 0.075 + 0.30 = $0.375 per million
    // Deep reasoning: 1.25 + 5.00 = $6.25 per million
    const passed =
      Math.abs(liteCost.totalCostUsd - 0.375) < 0.001 &&
      Math.abs(proCost.totalCostUsd - 6.25) < 0.001 &&
      liteCost.costSavingsVsBaselineUsd > 0;

    results.push({
      id: 'test_tier_pricing_calculation',
      name: 'Model Tier Pricing & Mathematical Cost Breakdown',
      category: 'token_calc',
      passed,
      durationMs: Date.now() - t0,
      expected: 'Lite Cost: $0.375/M total, Escalated Cost: $6.25/M total',
      actual: `Lite: $${liteCost.totalCostUsd}, Escalated: $${proCost.totalCostUsd}, Savings: $${liteCost.costSavingsVsBaselineUsd}`,
      details: `Lite: $${liteCost.totalCostUsd.toFixed(4)}, Escalated: $${proCost.totalCostUsd.toFixed(4)}, Savings: $${liteCost.costSavingsVsBaselineUsd.toFixed(4)}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test_tier_pricing_calculation',
      name: 'Model Tier Pricing & Mathematical Cost Breakdown',
      category: 'token_calc',
      passed: false,
      durationMs: 0,
      expected: 'Valid pricing calculations',
      actual: `Exception: ${err.message}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 5: User Token Balance Deductions & Lifetime Tracking
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const service = new TokenUsageService();
    service.setPlan('free'); // 50,000 allowance
    service.refillBalance();

    const initial = service.getBalance();

    service.recordUsage({
      mode: 'simple-chat',
      tier: 'efficient_lite',
      model: 'froge-neural-v1',
      provider: 'froge_model_gateway',
      promptTokens: 2000,
      completionTokens: 3000,
    });

    const updated = service.getBalance();
    const passed =
      initial.remainingTokens === 50000 &&
      updated.consumedTokens === 5000 &&
      updated.remainingTokens === 45000 &&
      updated.percentUsed === 10 &&
      updated.isLimitReached === false;

    results.push({
      id: 'test_balance_deduction',
      name: 'User Token Balance Accurate Deduction & Allowance Math',
      category: 'balance_limits',
      passed,
      durationMs: Date.now() - t0,
      expected: 'Remaining: 45,000, Consumed: 5,000, Percent: 10%',
      actual: `Remaining: ${updated.remainingTokens}, Consumed: ${updated.consumedTokens}, Percent: ${updated.percentUsed}%`,
      details: `Remaining: ${updated.remainingTokens.toLocaleString()} / ${updated.totalAllowance.toLocaleString()} (${updated.percentUsed}% used)`,
    });
  } catch (err: any) {
    results.push({
      id: 'test_balance_deduction',
      name: 'User Token Balance Accurate Deduction & Allowance Math',
      category: 'balance_limits',
      passed: false,
      durationMs: 0,
      expected: 'Accurate deduction',
      actual: `Exception: ${err.message}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 6: Pre-flight Quota Protection (Rejection when Balance Depleted)
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const service = new TokenUsageService();
    service.setPlan('free');
    service.refillBalance(100); // Set low allowance of 100 tokens

    // Consume all 100 tokens
    service.recordUsage({
      mode: 'simple-chat',
      tier: 'efficient_lite',
      model: 'froge-neural-v1',
      provider: 'froge_model_gateway',
      promptTokens: 50,
      completionTokens: 50,
    });

    // Attempt pre-flight check for a 300-token query
    const preflight = service.checkAllowance(300);

    const passed =
      preflight.allowed === false &&
      preflight.reason === 'limit_exhausted' &&
      preflight.remainingBalance === 0 &&
      typeof preflight.friendlyMessage === 'string' &&
      preflight.friendlyMessage.length > 10;

    results.push({
      id: 'test_preflight_quota_protection',
      name: 'Pre-flight Quota Protection Against Allowance Depletion',
      category: 'balance_limits',
      passed,
      durationMs: Date.now() - t0,
      expected: 'allowed: false, reason: limit_exhausted, friendly message provided',
      actual: `allowed: ${preflight.allowed}, reason: ${preflight.reason}, message: "${preflight.friendlyMessage}"`,
      details: `Rejection: ${preflight.reason}, Suggested: ${preflight.suggestedAction}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test_preflight_quota_protection',
      name: 'Pre-flight Quota Protection Against Allowance Depletion',
      category: 'balance_limits',
      passed: false,
      durationMs: 0,
      expected: 'Quota rejection on limit exhaustion',
      actual: `Exception: ${err.message}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 7: Friendly Limit Reached Notifications & Action Guidance
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const service = new TokenUsageService();
    service.setPlan('free');
    service.refillBalance(1000);

    // Consume 1000 tokens to hit limit
    service.recordUsage({
      mode: 'simple-chat',
      tier: 'efficient_lite',
      model: 'froge-neural-v1',
      provider: 'froge_model_gateway',
      promptTokens: 500,
      completionTokens: 500,
    });

    const check = service.checkAllowance(150);
    const msg = check.friendlyMessage || '';

    const hasFriendlyDetails =
      msg.toLowerCase().includes('token') &&
      msg.toLowerCase().includes('plan') &&
      (msg.toLowerCase().includes('upgrade') || msg.toLowerCase().includes('booster') || msg.toLowerCase().includes('refill'));

    const passed = check.allowed === false && hasFriendlyDetails && check.suggestedAction === 'upgrade';

    results.push({
      id: 'test_friendly_limit_message',
      name: 'Friendly, Informative Notifications When Limits Are Reached',
      category: 'balance_limits',
      passed,
      durationMs: Date.now() - t0,
      expected: 'Helpful user-centric message explaining allowance and upgrade/refill path',
      actual: `Message: "${msg}" (Suggested: ${check.suggestedAction})`,
      details: `Friendly Message: "${msg}"`,
    });
  } catch (err: any) {
    results.push({
      id: 'test_friendly_limit_message',
      name: 'Friendly, Informative Notifications When Limits Are Reached',
      category: 'balance_limits',
      passed: false,
      durationMs: 0,
      expected: 'Friendly notification text',
      actual: `Exception: ${err.message}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 8: Low-Balance Warning & Threshold Detection
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const service = new TokenUsageService();
    service.setPlan('free');
    service.refillBalance(10_000);

    // Consume 8,800 tokens (88% used) -> should trigger near limit warning
    service.recordUsage({
      mode: 'simple-chat',
      tier: 'efficient_lite',
      model: 'froge-neural-v1',
      provider: 'froge_model_gateway',
      promptTokens: 4400,
      completionTokens: 4400,
    });

    const balance = service.getBalance();
    const passed = balance.isNearLimitWarning === true && balance.isLimitReached === false && balance.percentUsed === 88;

    results.push({
      id: 'test_low_balance_warning',
      name: 'Low-Balance Warning & Near-Limit Threshold Detection',
      category: 'balance_limits',
      passed,
      durationMs: Date.now() - t0,
      expected: 'isNearLimitWarning: true, percentUsed: 88%',
      actual: `isNearLimitWarning: ${balance.isNearLimitWarning}, percentUsed: ${balance.percentUsed}%, remaining: ${balance.remainingTokens}`,
      details: `Near limit: ${balance.isNearLimitWarning}, Used: ${balance.percentUsed}%`,
    });
  } catch (err: any) {
    results.push({
      id: 'test_low_balance_warning',
      name: 'Low-Balance Warning & Near-Limit Threshold Detection',
      category: 'balance_limits',
      passed: false,
      durationMs: 0,
      expected: 'Near limit warning activation',
      actual: `Exception: ${err.message}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 9: Dynamic Subscription Plans Registration & Upgrades
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const service = new TokenUsageService();

    // Register future plan "academic_pro"
    service.registerPlan({
      id: 'academic_pro',
      name: 'Academic Researcher',
      tagline: 'High context window for researchers and universities',
      monthlyPriceUsd: 15,
      monthlyTokenAllowance: 2_500_000,
      maxTierAllowed: 'deep_reasoning_escalated',
      allowsEscalatedReasoning: true,
      allowsMultiModelTools: true,
      rateLimitPerMinute: 80,
      features: ['2,500,000 monthly tokens', 'LaTeX & Math AST computation', 'Deep research archive'],
    });

    // Switch user to this new plan
    const updatedBalance = service.setPlan('academic_pro');
    const plansList = service.getPlans();
    const foundPlan = plansList.some((p) => p.id === 'academic_pro');

    const passed =
      foundPlan &&
      updatedBalance.userPlanId === 'academic_pro' &&
      updatedBalance.monthlyTokenAllowance === 2_500_000;

    results.push({
      id: 'test_future_subscription_plans',
      name: 'Dynamic Subscription Plans Registration & Runtime Switching',
      category: 'subscription_plans',
      passed,
      durationMs: Date.now() - t0,
      expected: 'Plan "academic_pro" registered with 2,500,000 token allowance',
      actual: `Active plan: ${updatedBalance.planName} (${updatedBalance.userPlanId}), Allowance: ${updatedBalance.monthlyTokenAllowance.toLocaleString()}`,
      details: `Plan: ${updatedBalance.planName}, Allowance: ${updatedBalance.monthlyTokenAllowance.toLocaleString()}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test_future_subscription_plans',
      name: 'Dynamic Subscription Plans Registration & Runtime Switching',
      category: 'subscription_plans',
      passed: false,
      durationMs: 0,
      expected: 'Dynamic plan registration',
      actual: `Exception: ${err.message}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 10: Bonus Booster Token Replenishment
  // ---------------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const service = new TokenUsageService();
    service.setPlan('free');
    service.refillBalance();

    const before = service.getBalance();
    const after = service.addBonusTokens(25_000);

    const passed =
      after.bonusTokens === 25_000 &&
      after.totalAllowance === 50_000 + 25_000 &&
      after.remainingTokens === 75_000;

    results.push({
      id: 'test_bonus_token_replenishment',
      name: 'Bonus / Booster Token Balance Replenishment',
      category: 'balance_limits',
      passed,
      durationMs: Date.now() - t0,
      expected: 'Total allowance: 75,000 (+25,000 bonus), Remaining: 75,000',
      actual: `Total: ${after.totalAllowance.toLocaleString()}, Bonus: ${after.bonusTokens.toLocaleString()}, Remaining: ${after.remainingTokens.toLocaleString()}`,
      details: `Bonus: +${after.bonusTokens.toLocaleString()}, Total: ${after.totalAllowance.toLocaleString()}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test_bonus_token_replenishment',
      name: 'Bonus / Booster Token Balance Replenishment',
      category: 'balance_limits',
      passed: false,
      durationMs: 0,
      expected: 'Bonus token addition',
      actual: `Exception: ${err.message}`,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  return {
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    durationMs: totalDuration,
    totalTests: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results,
  };
}
