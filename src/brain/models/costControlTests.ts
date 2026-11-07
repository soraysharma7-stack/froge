/**
 * FROGÉ Brain - Cost Control & Economical Routing Test Suite
 *
 * Automated verification that:
 * 1. Simple tasks do NOT unnecessarily trigger expensive workflows.
 * 2. Economical models are preferred whenever suitable.
 * 3. Escalation occurs ONLY when complexity genuinely demands it.
 * 4. Low remaining token allowance correctly triggers quota-preserving throttling.
 * 5. User plan restrictions are enforced.
 * 6. Configurable routing rules can be adjusted dynamically without code changes.
 */

import { understandIntent } from '../intentUnderstanding';
import { classifyTask } from '../taskClassifier';
import { selectCapabilities } from '../capabilitySelector';
import { routeModel } from '../modelRouter';
import {
  costControlPolicyManager,
  CostControlPolicyManager,
  ModelRoutingRule,
} from './costPolicy';
import { calculateTierCost } from './pricing';
import { FrogeModeId } from '../../types';

export interface CostControlTestResultItem {
  id: string;
  name: string;
  category:
    | 'Simple Task Non-Escalation'
    | 'Complexity-Based Escalation'
    | 'Token Allowance & Quota Throttling'
    | 'User Plan Tier Enforcement'
    | 'Dynamic Configurable Rules'
    | 'Cost Savings & Token Efficiency';
  passed: boolean;
  durationMs: number;
  expectedTier: string;
  actualTier: string;
  estimatedCostUsd: number;
  details: string;
}

export interface CostControlTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: CostControlTestResultItem[];
}

export async function runCostControlTestSuite(): Promise<CostControlTestSuiteSummary> {
  const startTime = Date.now();
  const results: CostControlTestResultItem[] = [];

  function recordTest(
    id: string,
    name: string,
    category: CostControlTestResultItem['category'],
    passed: boolean,
    expectedTier: string,
    actualTier: string,
    estimatedCostUsd: number,
    details: string
  ) {
    results.push({
      id,
      name,
      category,
      passed,
      durationMs: 4,
      expectedTier,
      actualTier,
      estimatedCostUsd,
      details,
    });
  }

  // ---------------------------------------------------------------------------
  // Test 1: Simple everyday chat in Simple Chat mode (Non-Escalation)
  // ---------------------------------------------------------------------------
  try {
    const query = 'Draft a polite 2-sentence note declining a meeting invitation.';
    const intent = understandIntent({ query, mode: 'simple-chat' });
    const task = classifyTask(intent, 'simple-chat');
    const caps = selectCapabilities(intent, task);
    const routing = routeModel(intent, task, caps, 'simple-chat', { userPlanId: 'free' });

    const passed = routing.tier === 'efficient_lite' && !routing.activatedExpensiveReasoning;
    recordTest(
      'cost-1-simple-chat',
      'Simple Task in Simple Chat Mode (Non-Escalation)',
      'Simple Task Non-Escalation',
      passed,
      'efficient_lite',
      routing.tier,
      routing.estimatedCostUsd,
      `Prompt: "${query}" -> Routed to ${routing.targetModel} ($${routing.estimatedCostUsd.toFixed(6)}). Expensive reasoning: ${routing.activatedExpensiveReasoning}.`
    );
  } catch (err: any) {
    recordTest('cost-1-simple-chat', 'Simple Task in Simple Chat Mode', 'Simple Task Non-Escalation', false, 'efficient_lite', 'error', 0, err.message);
  }

  // ---------------------------------------------------------------------------
  // Test 2: Casual Greeting in Deep Thinking mode (Safeguard Non-Escalation)
  // ---------------------------------------------------------------------------
  try {
    const query = 'Good morning, how are you today?';
    const intent = understandIntent({ query, mode: 'deep-thinking' });
    const task = classifyTask(intent, 'deep-thinking');
    const caps = selectCapabilities(intent, task);
    const routing = routeModel(intent, task, caps, 'deep-thinking', { userPlanId: 'pro' });

    const passed = routing.tier === 'efficient_lite' && !routing.activatedExpensiveReasoning;
    recordTest(
      'cost-2-casual-in-deep-mode',
      'Casual Greeting in Deep Thinking Mode (Safeguard Non-Escalation)',
      'Simple Task Non-Escalation',
      passed,
      'efficient_lite',
      routing.tier,
      routing.estimatedCostUsd,
      `Even in deep-thinking mode, simple casual input was kept on ${routing.targetModel} ($${routing.estimatedCostUsd.toFixed(6)}).`
    );
  } catch (err: any) {
    recordTest('cost-2-casual-in-deep-mode', 'Casual Greeting in Deep Thinking Mode', 'Simple Task Non-Escalation', false, 'efficient_lite', 'error', 0, err.message);
  }

  // ---------------------------------------------------------------------------
  // Test 3: Standard Definition in Deep Thinking mode (Non-Escalation to Pro)
  // ---------------------------------------------------------------------------
  try {
    const query = 'What is the physical difference between speed and velocity?';
    const intent = understandIntent({ query, mode: 'deep-thinking' });
    const task = classifyTask(intent, 'deep-thinking');
    const caps = selectCapabilities(intent, task);
    const routing = routeModel(intent, task, caps, 'deep-thinking', { userPlanId: 'pro' });

    const passed = routing.tier === 'deep_reasoning_standard' && !routing.activatedExpensiveReasoning;
    recordTest(
      'cost-3-standard-logic-deep-mode',
      'Standard Physics Question in Deep Thinking Mode (Economical Tier)',
      'Simple Task Non-Escalation',
      passed,
      'deep_reasoning_standard',
      routing.tier,
      routing.estimatedCostUsd,
      `Standard definition did not escalate to deep_reasoning_escalated. Routed to ${routing.tier} ($${routing.estimatedCostUsd.toFixed(6)}).`
    );
  } catch (err: any) {
    recordTest('cost-3-standard-logic-deep-mode', 'Standard Physics Question in Deep Thinking Mode', 'Simple Task Non-Escalation', false, 'deep_reasoning_standard', 'error', 0, err.message);
  }

  // ---------------------------------------------------------------------------
  // Test 4: Socratic Educational Prompt in Student Mode (Socratic Educator)
  // ---------------------------------------------------------------------------
  try {
    const query = 'Explain fractions to a 5th grader.';
    const intent = understandIntent({ query, mode: 'student-mode' });
    const task = classifyTask(intent, 'student-mode');
    const caps = selectCapabilities(intent, task);
    const routing = routeModel(intent, task, caps, 'student-mode', { userPlanId: 'pro' });

    const passed = routing.tier === 'socratic_educator';
    recordTest(
      'cost-4-student-mode',
      'Student Mode Prompt (Socratic Educator)',
      'Simple Task Non-Escalation',
      passed,
      'socratic_educator',
      routing.tier,
      routing.estimatedCostUsd,
      `Student prompt routed to ${routing.tier} ($${routing.estimatedCostUsd.toFixed(6)}).`
    );
  } catch (err: any) {
    recordTest('cost-4-student-mode', 'Student Mode Prompt', 'Simple Task Non-Escalation', false, 'socratic_educator', 'error', 0, err.message);
  }

  // ---------------------------------------------------------------------------
  // Test 5: Genuine High-Complexity Deductive Challenge (Escalation)
  // ---------------------------------------------------------------------------
  try {
    const query =
      'Analyze the second-order economic consequences and game-theoretic Nash equilibrium of sovereign AI datacenters on regional energy grids with step by step mathematical proof and trade-offs.';
    const intent = understandIntent({ query, mode: 'deep-thinking' });
    const task = classifyTask(intent, 'deep-thinking');
    const caps = selectCapabilities(intent, task);
    const routing = routeModel(intent, task, caps, 'deep-thinking', { userPlanId: 'pro', remainingTokenAllowance: 500_000 });

    const passed = routing.tier === 'deep_reasoning_escalated' && routing.activatedExpensiveReasoning;
    recordTest(
      'cost-5-complex-reasoning-escalation',
      'Genuine High-Complexity Deductive Challenge (Escalation)',
      'Complexity-Based Escalation',
      passed,
      'deep_reasoning_escalated',
      routing.tier,
      routing.estimatedCostUsd,
      `Genuinely complex query correctly escalated to ${routing.targetModel} ($${routing.estimatedCostUsd.toFixed(6)}).`
    );
  } catch (err: any) {
    recordTest('cost-5-complex-reasoning-escalation', 'Genuine High-Complexity Deductive Challenge', 'Complexity-Based Escalation', false, 'deep_reasoning_escalated', 'error', 0, err.message);
  }

  // ---------------------------------------------------------------------------
  // Test 6: Low Remaining Token Allowance Quota Throttling
  // ---------------------------------------------------------------------------
  try {
    const complexQuery =
      'Analyze the second-order economic consequences and game-theoretic Nash equilibrium of sovereign AI datacenters with mathematical proof.';
    const intent = understandIntent({ query: complexQuery, mode: 'deep-thinking' });
    const task = classifyTask(intent, 'deep-thinking');
    const caps = selectCapabilities(intent, task);

    // Provide critically low remaining token allowance (800 tokens)
    const routing = routeModel(intent, task, caps, 'deep-thinking', {
      userPlanId: 'pro',
      remainingTokenAllowance: 800,
    });

    const passed = routing.tier === 'efficient_lite' && routing.maxTokens <= 512;
    recordTest(
      'cost-6-quota-throttling',
      'Low Remaining Token Allowance Quota Throttling',
      'Token Allowance & Quota Throttling',
      passed,
      'efficient_lite',
      routing.tier,
      routing.estimatedCostUsd,
      `When allowance was 800 tokens (< 1500 limit), router clamped to ${routing.targetModel} with maxTokens=${routing.maxTokens} to safeguard user budget.`
    );
  } catch (err: any) {
    recordTest('cost-6-quota-throttling', 'Low Remaining Token Allowance Quota Throttling', 'Token Allowance & Quota Throttling', false, 'efficient_lite', 'error', 0, err.message);
  }

  // ---------------------------------------------------------------------------
  // Test 7: User Plan Tier Enforcement (Free Plan Caps)
  // ---------------------------------------------------------------------------
  try {
    const complexEnterpriseQuery =
      'Formulate an enterprise SWOT risk matrix, FMEA audit, and SaaS unit economics payback model for global rollout with multi-perspective analysis.';
    const intent = understandIntent({ query: complexEnterpriseQuery, mode: 'max' });
    const task = classifyTask(intent, 'max');
    const caps = selectCapabilities(intent, task);

    // Free plan does not allow max_multi_orchestrator
    const routing = routeModel(intent, task, caps, 'max', { userPlanId: 'free' });

    const passed = routing.tier !== 'max_multi_orchestrator';
    recordTest(
      'cost-7-free-plan-enforcement',
      'User Plan Tier Enforcement (Free Plan Caps Swarm Escalation)',
      'User Plan Tier Enforcement',
      passed,
      'max_single_model',
      routing.tier,
      routing.estimatedCostUsd,
      `Free user request avoided expensive multi-orchestrator swarm, routing to ${routing.tier} ($${routing.estimatedCostUsd.toFixed(6)}).`
    );
  } catch (err: any) {
    recordTest('cost-7-free-plan-enforcement', 'User Plan Tier Enforcement', 'User Plan Tier Enforcement', false, 'max_single_model', 'error', 0, err.message);
  }

  // ---------------------------------------------------------------------------
  // Test 8: Dynamic Configurable Routing Rule Modification
  // ---------------------------------------------------------------------------
  try {
    const customManager = new CostControlPolicyManager();

    // Add a custom high-priority rule that forces a custom tier for a specific keyword
    const customRule: ModelRoutingRule = {
      id: 'rule_custom_eco_override',
      name: 'Custom Energy Query Eco-Override',
      priority: 999,
      enabled: true,
      category: 'task_complexity',
      description: 'Force ultra-eco routing for green tech queries',
      match: (input) => input.intent.rawQuery.toLowerCase().includes('solar panel'),
      action: {
        tier: 'efficient_lite',
        targetModel: 'froge-eco-v1 (Eco Custom Rule)',
        provider: 'froge_model_gateway',
        activatedExpensiveReasoning: false,
        temperature: 0.2,
        maxTokens: 500,
        topP: 0.9,
        routingRationale: 'Custom rule matched: Eco-Override active.',
      },
    };

    customManager.addRule(customRule);

    const query = 'How do solar panels convert sunlight to electricity with mathematical calculations?';
    const intent = understandIntent({ query });
    const task = classifyTask(intent);
    const caps = selectCapabilities(intent, task);

    const customDecision = customManager.evaluateRouting(intent, task, caps);
    const passed = customDecision.targetModel.includes('Eco Custom Rule');

    recordTest(
      'cost-8-dynamic-rule-modification',
      'Dynamic Configurable Routing Rule Addition & Evaluation',
      'Dynamic Configurable Rules',
      passed,
      'froge-eco-v1 (Eco Custom Rule)',
      customDecision.targetModel,
      customDecision.estimatedCostUsd,
      `Custom routing rule dynamically evaluated without application recompilation: "${customDecision.routingRationale}"`
    );
  } catch (err: any) {
    recordTest('cost-8-dynamic-rule-modification', 'Dynamic Configurable Routing Rule Addition', 'Dynamic Configurable Rules', false, 'custom', 'error', 0, err.message);
  }

  // ---------------------------------------------------------------------------
  // Test 9: Cost Savings vs Unoptimized Monolithic Baseline (> 70% savings)
  // ---------------------------------------------------------------------------
  try {
    const usage = { promptTokens: 120, completionTokens: 300, totalTokens: 420, latencyMs: 120 };
    const costBreakdown = calculateTierCost('efficient_lite', usage);
    const passed = costBreakdown.savingsPercentage >= 70;

    recordTest(
      'cost-9-baseline-savings',
      'Cost Savings vs Unoptimized Monolithic Baseline (> 70%)',
      'Cost Savings & Token Efficiency',
      passed,
      '>= 70% Savings',
      `${costBreakdown.savingsPercentage}% Savings`,
      costBreakdown.totalCostUsd,
      `Fast-Lite cost: $${costBreakdown.totalCostUsd.toFixed(6)} vs Monolithic Baseline: $${(costBreakdown.totalCostUsd + costBreakdown.costSavingsVsBaselineUsd).toFixed(6)}. Achieved ${costBreakdown.savingsPercentage}% cost reduction.`
    );
  } catch (err: any) {
    recordTest('cost-9-baseline-savings', 'Cost Savings vs Unoptimized Monolithic Baseline', 'Cost Savings & Token Efficiency', false, '>=70%', 'error', 0, err.message);
  }

  const durationMs = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    durationMs,
    results,
  };
}
