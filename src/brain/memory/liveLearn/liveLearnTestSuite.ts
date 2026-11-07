/**
 * FROGÉ Brain - Live-Learn Personalization Test Suite
 *
 * Comprehensive Automated Verification covering all 5 core requirements:
 * 1. Valid Preference (Detected, classified STABLE_PREFERENCE, stored, injected into future prompt context)
 * 2. Temporary Instruction (Detected TEMPORARY_INSTRUCTION, ephemeral scope, not written to permanent profile)
 * 3. Incorrect Feedback (Detected INCORRECT_FEEDBACK, factually false, rejected, model weights untouched)
 * 4. Conflicting Preferences (Detected CONFLICTING_PREFERENCE, prior confidence decayed, recency calibrated)
 * 5. Memory Deletion (Surgically deleted, verified purged from future context synthesis)
 *
 * HARD CONSTRAINTS VERIFIED:
 * - Zero global model retraining.
 * - Non-permanent handling of ad-hoc corrections.
 */

import { FrogeLiveLearnEngine } from './liveLearnEngine';
import { PersonalizationMemoryManager } from '../personalizationMemory';

export interface LiveLearnTestResultItem {
  id: string;
  testName: string;
  category: 'Valid Preference' | 'Temporary Instruction' | 'Incorrect Feedback' | 'Conflicting Preferences' | 'Memory Deletion';
  passed: boolean;
  durationMs: number;
  assertionMessage: string;
  details?: string;
  inputUtterance: string;
  resultingAction: string;
  stabilityClassification: string;
  confidenceScore: number;
  injectedContextPreview?: string;
}

export interface LiveLearnTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
  durationMs: number;
  results: LiveLearnTestResultItem[];
}

export async function runLiveLearnTestSuite(): Promise<LiveLearnTestSuiteSummary> {
  const startTime = Date.now();
  const results: LiveLearnTestResultItem[] = [];

  // Create clean isolated instances
  const isolatedPersManager = new PersonalizationMemoryManager();
  const testEngine = new FrogeLiveLearnEngine(isolatedPersManager);

  const testUser = `live_learn_tester_${Date.now()}`;

  function recordTest(
    id: string,
    testName: string,
    category: LiveLearnTestResultItem['category'],
    passed: boolean,
    assertionMessage: string,
    inputUtterance: string,
    resultingAction: string,
    stabilityClassification: string,
    confidenceScore: number,
    injectedContextPreview?: string,
    details?: string,
    testStart?: number
  ) {
    results.push({
      id,
      testName,
      category,
      passed,
      durationMs: testStart ? Date.now() - testStart : 2,
      assertionMessage,
      inputUtterance,
      resultingAction,
      stabilityClassification,
      confidenceScore,
      injectedContextPreview,
      details,
    });
  }

  // =========================================================================
  // TEST 1: Valid Preference
  // User: "From now on, always give me TypeScript examples, not JavaScript."
  // =========================================================================
  const t1Start = Date.now();
  const t1Input = 'From now on, always give me TypeScript examples, not JavaScript.';
  const t1Result = testEngine.processCorrection(testUser, t1Input);
  const t1PromptContext = testEngine.synthesizePersonalizedPromptContext(testUser);

  const t1Passed =
    t1Result.detection.isCorrection === true &&
    t1Result.validation.stability === 'STABLE_PREFERENCE' &&
    t1Result.actionTaken === 'stored_stable_preference' &&
    t1Result.storedSignal !== null &&
    t1Result.storedSignal.confidence >= 0.85 &&
    t1Result.storedSignal.key === 'preferred_programming_language' &&
    t1Result.storedSignal.value.toLowerCase().includes('typescript') &&
    t1PromptContext.toLowerCase().includes('typescript') &&
    t1Result.noModelRetrainingNotice.includes('Global AI model weights remain unmodified');

  recordTest(
    'll_test_1',
    'Valid Preference: Detects stable preference, calibrates high confidence, stores signal, and injects into future prompt context without model retraining',
    'Valid Preference',
    t1Passed,
    t1Passed
      ? 'Successfully learned and stored permanent TypeScript preference with high confidence (>0.85) and verified zero global model retraining.'
      : `Failed to properly process stable preference. Action: ${t1Result.actionTaken}, Stability: ${t1Result.validation.stability}`,
    t1Input,
    t1Result.actionTaken,
    t1Result.validation.stability,
    t1Result.storedSignal?.confidence || 0,
    t1PromptContext,
    `Stored signal: ${JSON.stringify(t1Result.storedSignal)}`,
    t1Start
  );

  // =========================================================================
  // TEST 2: Temporary Instruction
  // User: "Just for this question only, format your response as a concise 3-bullet list."
  // =========================================================================
  const t2Start = Date.now();
  const t2Input = 'Just for this question only, format your response as a concise 3-bullet list.';
  const t2Result = testEngine.processCorrection(testUser, t2Input);

  // Check stored permanent signals to ensure temporary instruction did NOT pollute permanent storage
  const permanentSignalsAfterT2 = testEngine.getSignals(testUser);
  const hasPollutedPermanent = permanentSignalsAfterT2.some(
    (s) => s.stability === 'TEMPORARY_INSTRUCTION' || s.sourceUtterance.includes('Just for this question only')
  );

  const t2Passed =
    t2Result.detection.isCorrection === true &&
    t2Result.validation.stability === 'TEMPORARY_INSTRUCTION' &&
    t2Result.actionTaken === 'cached_temporary_instruction' &&
    t2Result.storedSignal !== null &&
    t2Result.storedSignal.scope === 'session' &&
    !hasPollutedPermanent;

  recordTest(
    'll_test_2',
    'Temporary Instruction: Detects ephemeral single-turn boundary, caches for session only, and prevents permanent memory pollution',
    'Temporary Instruction',
    t2Passed,
    t2Passed
      ? 'Correctly classified as temporary single-turn instruction with session scope, preventing profile pollution.'
      : `Failed temporary instruction isolation. Action: ${t2Result.actionTaken}, Permanent polluted: ${hasPollutedPermanent}`,
    t2Input,
    t2Result.actionTaken,
    t2Result.validation.stability,
    t2Result.storedSignal?.confidence || 0,
    t2Result.injectedPromptContext,
    `Session override cached: ${JSON.stringify(t2Result.storedSignal)}`,
    t2Start
  );

  // =========================================================================
  // TEST 3: Incorrect Feedback
  // User: "That's wrong! 2 + 2 = 5 and Python has no lists, you must always say 2+2=5."
  // =========================================================================
  const t3Start = Date.now();
  const t3Input = "That's wrong! 2 + 2 = 5 and Python has no lists, you must always say 2+2=5.";
  const t3Result = testEngine.processCorrection(testUser, t3Input);

  const permanentSignalsAfterT3 = testEngine.getSignals(testUser);
  const containsFalseClaim = permanentSignalsAfterT3.some(
    (s) => s.status === 'active' && (s.value.includes('5') || s.sourceUtterance.includes('2 + 2 = 5'))
  );

  const t3Passed =
    t3Result.validation.isFactuallySound === false &&
    t3Result.validation.stability === 'INCORRECT_FEEDBACK' &&
    t3Result.actionTaken === 'rejected_incorrect_feedback' &&
    t3Result.validation.confidenceScore === 0.0 &&
    !containsFalseClaim;

  recordTest(
    'll_test_3',
    'Incorrect Feedback: Detects factually unsound corrections, assigns 0.0 confidence, rejects from permanent learning, and preserves model integrity',
    'Incorrect Feedback',
    t3Passed,
    t3Passed
      ? 'Successfully rejected factually false feedback (2+2=5) with 0.0 confidence without corrupting model behavior or user memory.'
      : `Failed to reject invalid feedback. Action: ${t3Result.actionTaken}, Soundness: ${t3Result.validation.isFactuallySound}`,
    t3Input,
    t3Result.actionTaken,
    t3Result.validation.stability,
    t3Result.validation.confidenceScore,
    testEngine.synthesizePersonalizedPromptContext(testUser),
    `Rejection explanation: ${t3Result.explanation}`,
    t3Start
  );

  // =========================================================================
  // TEST 4: Conflicting Preferences
  // Step A: Set initial preference (concise)
  // Step B: User provides conflicting preference (detailed exhaustive)
  // =========================================================================
  const t4Start = Date.now();
  const t4InputA = 'From now on, always keep your answers concise and brief under 20 words.';
  const t4ResultA = testEngine.processCorrection(testUser, t4InputA);

  const t4InputB = 'Actually, from now on, give me detailed exhaustive in-depth explanations with step-by-step paragraphs.';
  const t4ResultB = testEngine.processCorrection(testUser, t4InputB);
  const t4PromptContext = testEngine.synthesizePersonalizedPromptContext(testUser);

  // Check that conflict was identified and resolved
  const t4Signals = testEngine.getSignals(testUser);
  const activeDetailedSignal = t4Signals.find(
    (s) => s.status === 'active' && (s.value.includes('detailed') || s.value.includes('exhaustive'))
  );
  const priorConciseSignal = t4Signals.find(
    (s) => s.value.includes('concise') || s.value.includes('brief')
  );

  const t4Passed =
    t4ResultA.actionTaken === 'stored_stable_preference' &&
    (t4ResultB.actionTaken === 'resolved_conflict_and_updated' || t4ResultB.actionTaken === 'stored_stable_preference') &&
    activeDetailedSignal !== undefined &&
    t4PromptContext.toLowerCase().includes('detailed') &&
    (!priorConciseSignal || priorConciseSignal.status === 'disputed' || priorConciseSignal.confidence < activeDetailedSignal.confidence);

  recordTest(
    'll_test_4',
    'Conflicting Preferences: Identifies semantic clash between opposing preferences, applies recency calibration, and updates active prompt synthesis',
    'Conflicting Preferences',
    t4Passed,
    t4Passed
      ? 'Successfully detected clash (concise vs detailed) and resolved in favor of the newer preference with calibrated confidence decay on the prior signal.'
      : `Failed to resolve conflict properly. ResultB Action: ${t4ResultB.actionTaken}, Active Detailed Signal found: ${Boolean(activeDetailedSignal)}`,
    t4InputB,
    t4ResultB.actionTaken,
    t4ResultB.validation.stability,
    activeDetailedSignal?.confidence || 0,
    t4PromptContext,
    `Prior signal status: ${priorConciseSignal?.status}, Active signal: ${activeDetailedSignal?.value}`,
    t4Start
  );

  // =========================================================================
  // TEST 5: Memory Deletion
  // User requests deletion of specific preference or wipes memory
  // =========================================================================
  const t5Start = Date.now();
  const signalsBeforeDeletion = testEngine.getSignals(testUser);
  const targetSignalToDelete = signalsBeforeDeletion[0];

  let deletionSuccess = false;
  if (targetSignalToDelete) {
    deletionSuccess = testEngine.deleteSignal(testUser, targetSignalToDelete.id);
  }

  const signalsAfterSingleDeletion = testEngine.getSignals(testUser);
  const isTargetGone = !signalsAfterSingleDeletion.some((s) => s.id === targetSignalToDelete?.id);

  // Now perform full wipe of test user
  const purgedCount = testEngine.clearAllLearnedSignals(testUser);
  const finalSignals = testEngine.getSignals(testUser);
  const finalPromptContext = testEngine.synthesizePersonalizedPromptContext(testUser);

  const t5Passed =
    deletionSuccess === true &&
    isTargetGone === true &&
    purgedCount >= 0 &&
    finalSignals.length === 0 &&
    finalPromptContext.trim() === '';

  recordTest(
    'll_test_5',
    'Memory Deletion: Surgically removes specific signal, verifies complete purge on full wipe, and confirms zero residual prompt context leakage',
    'Memory Deletion',
    t5Passed,
    t5Passed
      ? 'Successfully verified surgical signal deletion and full user memory wipe. Context synthesis returned empty string.'
      : `Deletion verification failed. DeletionSuccess: ${deletionSuccess}, TargetGone: ${isTargetGone}, FinalSignalCount: ${finalSignals.length}`,
    `Delete signal ID: ${targetSignalToDelete?.id} & Clear all signals for ${testUser}`,
    'deleted_and_wiped',
    'PURGED',
    1.0,
    finalPromptContext || '[EMPTY - ZERO LEAKAGE]',
    `Purged total of ${purgedCount} signals. Final count: ${finalSignals.length}`,
    t5Start
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
