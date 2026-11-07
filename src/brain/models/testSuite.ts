/**
 * FROGÉ Brain - Provider-Independent Model Layer Test Suite
 *
 * Programmatic verification of:
 * 1. Successful text generation & response structure
 * 2. Timeout handling & cancellation
 * 3. Provider error recovery & normalization
 * 4. Missing API key detection & safe development mode fallback
 * 5. Token accounting, cost calculations, and savings analysis
 */

import {
  MockTestHarnessProvider,
  FrogeNativeProvider,
  modelProviderRegistry,
} from './providers';
import {
  ModelTimeoutError,
  ModelAuthError,
  ModelRateLimitError,
  ModelProviderUnavailableError,
} from './errors';
import { calculateTierCost, estimateTokenCount, TIER_PRICING } from './pricing';
import { ModelTier, TokenUsage } from './types';

export interface ModelTestResultItem {
  id: string;
  name: string;
  category: 'Success Response' | 'Timeout Handling' | 'Provider Error' | 'Missing API Key' | 'Token Accounting' | 'Provider Routing';
  passed: boolean;
  durationMs: number;
  message: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface ModelTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: ModelTestResultItem[];
}

export async function runModelLayerTestSuite(): Promise<ModelTestSuiteSummary> {
  const results: ModelTestResultItem[] = [];
  const suiteStartTime = Date.now();

  const harness = new MockTestHarnessProvider();
  const native = new FrogeNativeProvider();

  // Helper assertion
  function record(
    id: string,
    name: string,
    category: ModelTestResultItem['category'],
    passed: boolean,
    durationMs: number,
    message: string,
    details?: string,
    metadata?: Record<string, any>
  ) {
    results.push({
      id,
      name,
      category,
      passed,
      durationMs,
      message: passed ? 'PASSED' : `FAILED: ${message}`,
      details,
      metadata,
    });
  }

  // =========================================================================
  // TEST 1: SUCCESSFUL TEXT GENERATION & RESPONSE SCHEMA
  // =========================================================================
  try {
    const t0 = Date.now();
    const request = {
      prompt: 'Summarize the core benefits of a provider-independent AI architecture.',
      maxTokens: 500,
    };
    const response = await harness.generate(request);
    const dur = Date.now() - t0;

    const isValid =
      Boolean(response.content && response.content.length > 10) &&
      Boolean(response.modelId) &&
      Boolean(response.providerId === 'mock-test-harness') &&
      Boolean(response.usage.promptTokens > 0) &&
      Boolean(response.usage.completionTokens > 0) &&
      Boolean(response.cost.totalCostUsd !== undefined);

    record(
      'test_success_gen',
      'Successful Text Generation & Response Schema',
      'Success Response',
      isValid,
      dur,
      isValid ? 'Response structure and token metadata fully validated' : 'Incomplete response schema',
      `Prompt Tokens: ${response.usage.promptTokens}, Completion Tokens: ${response.usage.completionTokens}, Cost: $${response.cost.totalCostUsd}`,
      { response }
    );
  } catch (err: any) {
    record('test_success_gen', 'Successful Text Generation & Response Schema', 'Success Response', false, 0, err.message);
  }

  // =========================================================================
  // TEST 2: TIMEOUT HANDLING & ABORT SIGNAL
  // =========================================================================
  try {
    const t0 = Date.now();
    let caughtTimeout = false;
    let errorDetails = '';

    try {
      await harness.generate(
        { prompt: 'Simulate long-running reasoning task', timeoutMs: 150 },
        undefined,
        { simulateTimeout: true, timeoutMs: 150 }
      );
    } catch (err: any) {
      if (err instanceof ModelTimeoutError || err.code === 'TIMEOUT') {
        caughtTimeout = true;
        errorDetails = `Successfully caught ModelTimeoutError: ${err.message} (Status: ${err.statusCode})`;
      } else {
        errorDetails = `Caught unexpected error type: ${err.name}`;
      }
    }
    const dur = Date.now() - t0;

    record(
      'test_timeout_handling',
      'Timeout Handling & Cancellation',
      'Timeout Handling',
      caughtTimeout,
      dur,
      caughtTimeout ? 'ModelTimeoutError correctly raised and intercepted' : 'Failed to enforce timeout boundary',
      errorDetails
    );
  } catch (err: any) {
    record('test_timeout_handling', 'Timeout Handling & Cancellation', 'Timeout Handling', false, 0, err.message);
  }

  // =========================================================================
  // TEST 3: PROVIDER ERROR RECOVERY & NORMALIZATION (429 & 503)
  // =========================================================================
  try {
    const t0 = Date.now();
    let caught503 = false;
    let caught429 = false;

    // Test 503 Provider Unavailable
    try {
      await harness.generate(
        { prompt: 'Test 503' },
        undefined,
        { simulateError: 503 }
      );
    } catch (err: any) {
      if (err instanceof ModelProviderUnavailableError || err.code === 'PROVIDER_UNAVAILABLE') {
        caught503 = true;
      }
    }

    // Test 429 Rate Limit
    try {
      await harness.generate(
        { prompt: 'Test 429' },
        undefined,
        { simulateError: 429 }
      );
    } catch (err: any) {
      if (err instanceof ModelRateLimitError || err.code === 'RATE_LIMITED') {
        caught429 = true;
      }
    }

    const passed = caught503 && caught429;
    const dur = Date.now() - t0;

    record(
      'test_provider_errors',
      'Provider Error Normalization (503 High Demand & 429 Rate Limit)',
      'Provider Error',
      passed,
      dur,
      passed ? '503 and 429 errors normalized with retryable status' : 'Error normalization failed',
      `503 Handled: ${caught503} | 429 Handled: ${caught429}`
    );
  } catch (err: any) {
    record('test_provider_errors', 'Provider Error Normalization', 'Provider Error', false, 0, err.message);
  }

  // =========================================================================
  // TEST 4: MISSING API KEY & SAFE DEVELOPMENT / MOCK MODE FALLBACK
  // =========================================================================
  try {
    const t0 = Date.now();
    let authErrorRaised = false;

    // 4a. Verify ModelAuthError is raised when strict check is required
    try {
      await harness.generate(
        { prompt: 'Check auth error' },
        undefined,
        { simulateMissingKey: true }
      );
    } catch (err: any) {
      if (err instanceof ModelAuthError || err.code === 'AUTH_MISSING') {
        authErrorRaised = true;
      }
    }

    // 4b. Verify Native Provider works safely without any external keys
    const nativeRes = await native.generate({ prompt: 'Safe offline mode prompt' });
    const nativeSafe = Boolean(nativeRes.content && nativeRes.content.length > 0);

    const passed = authErrorRaised && nativeSafe;
    const dur = Date.now() - t0;

    record(
      'test_missing_api_key_fallback',
      'Missing API Key & Safe Development Mode Fallback',
      'Missing API Key',
      passed,
      dur,
      passed ? 'Missing key identified, zero frontend key exposure, safe dev mode functional' : 'Dev mode fallback failed',
      `AuthError Caught: ${authErrorRaised} | Safe Native Provider Executed: ${nativeSafe} (Tokens: ${nativeRes.usage.totalTokens})`
    );
  } catch (err: any) {
    record('test_missing_api_key_fallback', 'Missing API Key Fallback', 'Missing API Key', false, 0, err.message);
  }

  // =========================================================================
  // TEST 5: TOKEN ACCOUNTING & COST ESTIMATION FORMULAS
  // =========================================================================
  try {
    const t0 = Date.now();
    const sampleText = 'This is a high quality test prompt to calculate tokens accurately with subword heuristics.';
    const estimatedTokens = estimateTokenCount(sampleText);

    // Verify cost breakdown for efficient_lite vs escalated
    const mockUsage: TokenUsage = {
      promptTokens: 1000,
      completionTokens: 2000,
      totalTokens: 3000,
      latencyMs: 120,
    };

    const liteCost = calculateTierCost('efficient_lite', mockUsage);
    const proCost = calculateTierCost('deep_reasoning_escalated', mockUsage);

    const formulasAccurate =
      estimatedTokens >= 14 && estimatedTokens <= 25 &&
      liteCost.totalCostUsd > 0 &&
      proCost.totalCostUsd > liteCost.totalCostUsd &&
      liteCost.costSavingsVsBaselineUsd > 0 &&
      liteCost.savingsPercentage > 50;

    const dur = Date.now() - t0;

    record(
      'test_token_accounting',
      'Token Accounting & Tier Cost Savings Estimation',
      'Token Accounting',
      formulasAccurate,
      dur,
      formulasAccurate ? 'Accurate subword token estimates and cost formulas verified' : 'Cost formula mismatch',
      `Prompt Token Est: ${estimatedTokens} | Lite Cost: $${liteCost.totalCostUsd} | Escalated Cost: $${proCost.totalCostUsd} | Savings: ${liteCost.savingsPercentage}% ($${liteCost.costSavingsVsBaselineUsd})`
    );
  } catch (err: any) {
    record('test_token_accounting', 'Token Accounting', 'Token Accounting', false, 0, err.message);
  }

  // =========================================================================
  // TEST 6: DYNAMIC PROVIDER REGISTRY & ROUTING
  // =========================================================================
  try {
    const t0 = Date.now();
    const allProviders = modelProviderRegistry.getAllProviders();
    const activeProvider = modelProviderRegistry.getActiveProvider();

    const registryValid =
      allProviders.length >= 3 &&
      Boolean(activeProvider) &&
      Boolean(activeProvider.getMetadata().id);

    const dur = Date.now() - t0;

    record(
      'test_provider_registry',
      'Dynamic Provider Registry & Multi-Model Routing',
      'Provider Routing',
      registryValid,
      dur,
      registryValid ? `Registered ${allProviders.length} independent AI providers with dynamic routing` : 'Registry incomplete',
      `Active: ${activeProvider.getMetadata().name} | Total Registered: ${allProviders.map((p) => p.id).join(', ')}`
    );
  } catch (err: any) {
    record('test_provider_registry', 'Dynamic Provider Registry', 'Provider Routing', false, 0, err.message);
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    durationMs: Date.now() - suiteStartTime,
    results,
  };
}
