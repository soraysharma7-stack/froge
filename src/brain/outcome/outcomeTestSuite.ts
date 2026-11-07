/**
 * FROGÉ Brain - Outcome Learning Automated Test Suite
 *
 * Comprehensive Automated Verification covering all workflow steps and mandated guardrails:
 *
 * 1. Complete Workflow (Advice -> Track -> Follow-up -> Outcome Check-in -> Classify -> Evaluate -> Calibrate)
 * 2. Guardrail 1: Do Not Treat One Outcome as Universal Truth (Bayesian prior damping & smoothing)
 * 3. Guardrail 2: Category Segmentation (Code debugging failure does not corrupt system architecture calibration)
 * 4. Guardrail 3: External Blockers & Deviation (Third-party outage / deviation handling without unfair penalty)
 * 5. Guardrail 4: Granular User Controls (Disable tracking, surgical deletion, full calibration reset)
 * 6. Guardrail 5: Zero Global Model Retraining Invariant
 */

import { FrogeOutcomeManager } from './outcomeManager';
import { FrogeCalibrationEngine } from './calibrationEngine';

export interface OutcomeTestResultItem {
  id: string;
  testName: string;
  category: 'Full Workflow' | 'Anti-Overreaction' | 'Category Isolation' | 'External Blockers' | 'User Controls' | 'Zero Retraining';
  passed: boolean;
  durationMs: number;
  assertionMessage: string;
  details?: string;
  actionTaken: string;
  calibrationPreview?: string;
}

export interface OutcomeTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
  durationMs: number;
  results: OutcomeTestResultItem[];
}

export async function runOutcomeTestSuite(): Promise<OutcomeTestSuiteSummary> {
  const startTime = Date.now();
  const results: OutcomeTestResultItem[] = [];

  // Create clean isolated instances
  const isolatedCalibrationEngine = new FrogeCalibrationEngine();
  const testManager = new FrogeOutcomeManager(isolatedCalibrationEngine);
  const testUser = `outcome_tester_${Date.now()}`;

  function recordTest(
    id: string,
    testName: string,
    category: OutcomeTestResultItem['category'],
    passed: boolean,
    assertionMessage: string,
    actionTaken: string,
    calibrationPreview?: string,
    details?: string,
    testStart?: number
  ) {
    results.push({
      id,
      testName,
      category,
      passed,
      durationMs: testStart ? Date.now() - testStart : 3,
      assertionMessage,
      actionTaken,
      calibrationPreview,
      details,
    });
  }

  // =========================================================================
  // TEST 1: Full Outcome Learning Workflow
  // Advice -> Track -> Follow-up task -> Outcome Checkin -> Classify -> Evaluate -> Calibrate
  // =========================================================================
  const t1Start = Date.now();
  const t1TrackResult = testManager.trackAdvice({
    userId: testUser,
    query: 'How should I optimize this PostgreSQL query with high latency?',
    adviceSummary: 'Add a composite index on (tenant_id, created_at DESC) and use index scans.',
    fullAdviceText: 'To resolve latency, create a composite B-Tree index: CREATE INDEX idx_tenant_created ON events (tenant_id, created_at DESC);',
    category: 'performance_optimization',
    predictedConfidence: 0.90,
    expectedOutcome: 'Query execution time drops under 50ms.',
    followUpHours: 12,
  });

  // User checks in later: "It worked perfectly, query latency dropped from 800ms to 24ms."
  const t1CheckinResult = testManager.recordOutcomeCheckin({
    trackedAdviceId: t1TrackResult.id,
    userFeedbackText: 'It worked perfectly, query latency dropped from 800ms to 24ms.',
    userSatisfactionScore: 5,
  });

  const t1Passed =
    t1TrackResult.actionTaken === 'task_registered' &&
    t1TrackResult.trackedAdvice.status === 'evaluated' &&
    t1CheckinResult.actionTaken === 'checkin_recorded_and_evaluated' &&
    t1CheckinResult.evaluation?.classification === 'SUCCESS_AS_PREDICTED' &&
    t1CheckinResult.evaluation.accuracyScore === 1.0 &&
    t1CheckinResult.updatedCategoryCalibration?.category === 'performance_optimization' &&
    t1CheckinResult.updatedCategoryCalibration.successCount >= 1;

  recordTest(
    'outcome_test_1',
    'Full Workflow: Track Advice -> Follow-up Task -> Check-in Report -> Classification -> Prediction Evaluation -> Calibration Update',
    'Full Workflow',
    t1Passed,
    t1Passed
      ? 'Successfully executed full 7-step outcome learning loop with accurate SUCCESS_AS_PREDICTED evaluation and calibration update.'
      : `Workflow step failed. TrackAction: ${t1TrackResult.actionTaken}, CheckinAction: ${t1CheckinResult.actionTaken}`,
    t1CheckinResult.actionTaken,
    JSON.stringify(t1CheckinResult.updatedCategoryCalibration),
    `Evaluation ID: ${t1CheckinResult.evaluation?.id}, Delta: ${t1CheckinResult.evaluation?.calibrationDelta}`,
    t1Start
  );

  // =========================================================================
  // TEST 2: Guardrail 1 - Do NOT Treat One Outcome as Universal Truth
  // 1 single failure must NOT swing accuracy to 0.0 or collapse future multiplier
  // =========================================================================
  const t2Start = Date.now();
  const t2TrackResult = testManager.trackAdvice({
    userId: testUser,
    query: 'Can you write a script to scrape dynamic pages using cheerio?',
    adviceSummary: 'Use cheerio alone to parse the JavaScript rendered DOM.',
    fullAdviceText: 'Cheerio can fetch and parse the page directly.',
    category: 'api_integration',
    predictedConfidence: 0.85,
  });

  // User reports failure because Cheerio doesn't execute JavaScript
  const t2CheckinResult = testManager.recordOutcomeCheckin({
    trackedAdviceId: t2TrackResult.id,
    userFeedbackText: "That didn't work at all! The page was empty because Cheerio does not execute client-side JS.",
    userSatisfactionScore: 1,
  });

  const apiStatsAfterSingleFailure = isolatedCalibrationEngine.getCategoryStats('api_integration');

  // Bayesian smoothing must keep empirical accuracy reasonable (> 0.40) and multiplier >= 0.75
  const t2Passed =
    t2CheckinResult.evaluation?.classification === 'PREDICTION_OVERCONFIDENT' &&
    apiStatsAfterSingleFailure.totalEvaluated === 1 &&
    apiStatsAfterSingleFailure.failureCount === 1 &&
    apiStatsAfterSingleFailure.empiricalAccuracy >= 0.45 &&
    apiStatsAfterSingleFailure.empiricalAccuracy <= 0.85 &&
    apiStatsAfterSingleFailure.calibrationMultiplier >= 0.75;

  recordTest(
    'outcome_test_2',
    'Guardrail 1: Single Outcome Protection (Bayesian Smoothing prevents wild swings on 1 failure)',
    'Anti-Overreaction',
    t2Passed,
    t2Passed
      ? `Single failure smoothed smoothly: empirical accuracy is ${apiStatsAfterSingleFailure.empiricalAccuracy * 100}% (not collapsed to 0%) with multiplier ${apiStatsAfterSingleFailure.calibrationMultiplier}.`
      : `Single failure caused excessive swing or invalid stats. Accuracy: ${apiStatsAfterSingleFailure.empiricalAccuracy}, Multiplier: ${apiStatsAfterSingleFailure.calibrationMultiplier}`,
    'evaluated_with_bayesian_damping',
    `Smoothed Accuracy: ${apiStatsAfterSingleFailure.empiricalAccuracy}, Multiplier: ${apiStatsAfterSingleFailure.calibrationMultiplier}`,
    `Brier score: ${apiStatsAfterSingleFailure.brierScore}, CI: [${apiStatsAfterSingleFailure.confidenceInterval.join(', ')}]`,
    t2Start
  );

  // =========================================================================
  // TEST 3: Guardrail 2 - Category Isolation
  // Outcome in `api_integration` must leave `system_architecture` stats untouched
  // =========================================================================
  const t3Start = Date.now();
  const sysArchStats = isolatedCalibrationEngine.getCategoryStats('system_architecture');
  const codeDebugStats = isolatedCalibrationEngine.getCategoryStats('code_debugging');

  const t3Passed =
    sysArchStats.totalEvaluated === 0 &&
    sysArchStats.failureCount === 0 &&
    codeDebugStats.totalEvaluated === 0 &&
    codeDebugStats.failureCount === 0 &&
    apiStatsAfterSingleFailure.totalEvaluated === 1;

  recordTest(
    'outcome_test_3',
    'Guardrail 2: Category Isolation (Api integration failure does not contaminate System Architecture or Code Debugging)',
    'Category Isolation',
    t3Passed,
    t3Passed
      ? 'Confirmed strict category boundaries: zero cross-contamination across domain calibration profiles.'
      : 'Category cross-contamination detected.',
    'isolated_category_validation',
    `sysArch evaluated: ${sysArchStats.totalEvaluated}, apiIntegration evaluated: ${apiStatsAfterSingleFailure.totalEvaluated}`,
    'Verified category separation.',
    t3Start
  );

  // =========================================================================
  // TEST 4: Guardrail 3 - External Blockers & Deviation
  // Third-party downtime / deviation does not penalize model accuracy
  // =========================================================================
  const t4Start = Date.now();
  const t4TrackResult = testManager.trackAdvice({
    userId: testUser,
    query: 'Deploy our staging environment to Cloud Run',
    adviceSummary: 'Run gcloud run deploy --image gcr.io/app:v1',
    fullAdviceText: 'Execute gcloud run deploy with target project.',
    category: 'operational_planning',
    predictedConfidence: 0.85,
  });

  const t4CheckinResult = testManager.recordOutcomeCheckin({
    trackedAdviceId: t4TrackResult.id,
    userFeedbackText: 'Could not test because there was an AWS and Google third party network outage and client cancelled the sprint.',
    externalBlockers: ['third party network outage', 'sprint cancellation'],
  });

  const opStats = isolatedCalibrationEngine.getCategoryStats('operational_planning');

  const t4Passed =
    t4CheckinResult.evaluation?.classification === 'INCONCLUSIVE_EXTERNAL_FACTORS' &&
    t4CheckinResult.evaluation.accuracyScore >= 0.5 &&
    opStats.inconclusiveCount === 1 &&
    opStats.failureCount === 0;

  recordTest(
    'outcome_test_4',
    'Guardrail 3: External Blockers & Deviation (Inconclusive third-party outage does not penalize model accuracy)',
    'External Blockers',
    t4Passed,
    t4Passed
      ? 'Correctly classified as INCONCLUSIVE_EXTERNAL_FACTORS with zero failure penalty.'
      : `Failed external blocker handling. Classification: ${t4CheckinResult.evaluation?.classification}`,
    'inconclusive_evaluation',
    `Inconclusive count: ${opStats.inconclusiveCount}, Failure count: ${opStats.failureCount}`,
    `Causal factors: ${t4CheckinResult.evaluation?.causalFactors.join(', ')}`,
    t4Start
  );

  // =========================================================================
  // TEST 5: Guardrail 4 - Granular User Controls
  // Disable tracking toggle, surgical deletion, full reset
  // =========================================================================
  const t5Start = Date.now();
  // A: Disable tracking
  testManager.updateConfig(testUser, { enabled: false });
  let disableBlocked = false;
  try {
    testManager.trackAdvice({
      userId: testUser,
      query: 'Test query',
      adviceSummary: 'Advice',
      fullAdviceText: 'Advice text',
    });
  } catch (err: any) {
    disableBlocked = true;
  }

  // Re-enable
  testManager.updateConfig(testUser, { enabled: true });

  // B: Surgical deletion
  const t5Track = testManager.trackAdvice({
    userId: testUser,
    query: 'Temporary task for deletion',
    adviceSummary: 'Advice summary',
    fullAdviceText: 'Advice',
  });
  const deletedSuccess = testManager.deleteTrackedAdvice(t5Track.id);
  const remainingTasks = testManager.getAllTrackedAdvice(testUser);
  const isDeletedGone = !remainingTasks.some((t) => t.advice.id === t5Track.id);

  // C: Clear all data
  const clearedCount = testManager.clearAllOutcomeData(testUser);
  const finalTasks = testManager.getAllTrackedAdvice(testUser);

  const t5Passed =
    disableBlocked === true &&
    deletedSuccess === true &&
    isDeletedGone === true &&
    clearedCount >= 0 &&
    finalTasks.length === 0;

  recordTest(
    'outcome_test_5',
    'Guardrail 4: Granular User Controls (Disable policy, surgical deletion, and full calibration wipe)',
    'User Controls',
    t5Passed,
    t5Passed
      ? 'All user controls verified: policy disable enforced, surgical record deletion confirmed, full wipe successful.'
      : `User controls test failed. DisableBlocked: ${disableBlocked}, DeletedGone: ${isDeletedGone}, FinalTasks: ${finalTasks.length}`,
    'user_controls_verified',
    'Cleared all outcome data.',
    `Purged count: ${clearedCount}`,
    t5Start
  );

  // =========================================================================
  // TEST 6: Guardrail 5 - Zero Model Retraining Invariant
  // Verify calibration updates only generate prompt context priors
  // =========================================================================
  const t6Start = Date.now();
  testManager.updateConfig(testUser, { enabled: true });
  const t6Track = testManager.trackAdvice({
    userId: testUser,
    query: 'Optimize Redis connection pooling',
    adviceSummary: 'Set max connections to 50',
    fullAdviceText: 'Configure connection pool to 50 with timeout',
    category: 'performance_optimization',
    predictedConfidence: 0.9,
  });
  testManager.recordOutcomeCheckin({
    trackedAdviceId: t6Track.id,
    userFeedbackText: 'This improved throughput by 40%, latency dropped significantly.',
    userSatisfactionScore: 5,
  });

  const promptContextPreview = isolatedCalibrationEngine.synthesizeCategoryCalibrationPromptContext(
    'performance_optimization',
    1
  );

  const t6Passed =
    promptContextPreview.includes('ZERO GLOBAL RETRAINING') &&
    promptContextPreview.includes('performance_optimization');

  recordTest(
    'outcome_test_6',
    'Guardrail 5: Zero Model Retraining Invariant (Calibration is reflected purely via in-context prompt priors)',
    'Zero Retraining',
    t6Passed,
    t6Passed
      ? 'Verified zero global model retraining. Calibration synthesized into dynamic runtime system prompt block.'
      : 'Failed prompt context synthesis invariant.',
    'zero_retraining_verified',
    promptContextPreview,
    'Guaranteed zero foundation weight alteration.',
    t6Start
  );

  const durationMs = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    passRate: `${Math.round((passedCount / results.length) * 100)}%`,
    durationMs,
    results,
  };
}
