/**
 * FROGÉ Brain - Live-Learn Stability & Validity Classifier
 *
 * Stage 2 of Live-Learn:
 * Evaluates candidate corrections to determine:
 * 1. Is it a Stable Preference vs Temporary Instruction?
 * 2. Is it Factually Sound or Incorrect Feedback?
 * 3. Does it conflict with an existing stored preference?
 *
 * GUARANTEES:
 * - Never retrain global AI model weights.
 * - Never automatically treat every correction as a permanent fact.
 */

import {
  StabilityClassification,
  StabilityValidationResult,
  LiveLearnSignal,
  ConflictResolutionStrategy,
  SignalScope,
} from './liveLearnTypes';

// Known Factual Invariants and Nonsense Heuristics for Verification
const FACTUAL_INCORRECTNESS_PATTERNS = [
  {
    regex: /(?:2\s*\+\s*2\s*=\s*5|two plus two (?:is|equals) five)/i,
    reason: 'Mathematical invariant violation: 2 + 2 = 4, not 5.',
  },
  {
    regex: /python (?:doesn't have|does not have|has no) (?:lists?|functions?|classes?|dicts?|arrays?)/i,
    reason: 'Factually false programming claim: Python natively supports lists, functions, and dictionaries.',
  },
  {
    regex: /(?:earth is flat|flat earth theory is proven)/i,
    reason: 'Empirically disproven claim: The Earth is an oblate spheroid.',
  },
  {
    regex: /(?:disable|bypass|delete|turn off) all (?:security|safety|auth|verification) (?:checks|rules)/i,
    reason: 'Security invariant violation: Safety and security controls cannot be permanently overridden via live-learn.',
  },
  {
    regex: /typescript was (?:created|invented|released) in (?:1980|1990|18\d\d)/i,
    reason: 'Historical inaccuracy: TypeScript was first released by Microsoft in 2012.',
  },
];

// Semantic opposites / conflicting pairs
const CONFLICTING_VALUE_PAIRS: Array<[RegExp, RegExp, string]> = [
  [/concise|brief|short|under \d+ words/i, /detailed|exhaustive|in-depth|multi-paragraph|long/i, 'Verbosity clash (concise vs detailed)'],
  [/typescript/i, /javascript/i, 'Language preference clash (TypeScript vs JavaScript)'],
  [/python/i, /rust|c\+\+|golang/i, 'Language preference clash (Python vs compiled systems languages)'],
  [/formal|academic/i, /casual|slang|informal/i, 'Tone preference clash (Formal vs Casual)'],
  [/bullet points?|bulleted/i, /narrative prose|paragraphs only/i, 'Formatting preference clash (Bullets vs Paragraphs)'],
];

export function classifyStabilityAndValidity(
  candidateKey: string,
  candidateValue: string,
  rawUtterance: string,
  existingUserSignals: LiveLearnSignal[] = [],
  initialStability?: StabilityClassification
): StabilityValidationResult {
  const text = `${candidateKey} ${candidateValue} ${rawUtterance}`.trim();

  // 1. Factuality & Falsity Check
  for (const check of FACTUAL_INCORRECTNESS_PATTERNS) {
    if (check.regex.test(text)) {
      return {
        stability: 'INCORRECT_FEEDBACK',
        isFactuallySound: false,
        confidenceScore: 0.0,
        scope: 'session',
        justification: `Rejected incorrect feedback: ${check.reason}`,
      };
    }
  }

  // 2. Temporary Ephemeral Check
  const hasTemporaryMarkers = /(?:for this (?:question|turn|prompt|message) only|just this once|only for this|just for now|for now|temporarily|this turn only)/i.test(
    rawUtterance
  );

  if (hasTemporaryMarkers || initialStability === 'TEMPORARY_INSTRUCTION') {
    return {
      stability: 'TEMPORARY_INSTRUCTION',
      isFactuallySound: true,
      confidenceScore: 0.90,
      scope: 'session',
      justification: 'Classified as ephemeral single-turn instruction. Will apply to immediate context without writing to permanent user profile.',
    };
  }

  // 3. Conflict Detection with Stored Signals
  const candidateLower = candidateValue.toLowerCase();
  const conflictingSignal = existingUserSignals.find((s) => {
    if (s.status === 'disabled' || s.status === 'rejected') return false;

    // Direct key collision with different value
    if (s.key.toLowerCase() === candidateKey.toLowerCase()) {
      if (s.value.toLowerCase() !== candidateLower) {
        return true;
      }
    }

    // Semantic contradiction check across pair matrices
    for (const [patternA, patternB] of CONFLICTING_VALUE_PAIRS) {
      if (
        (patternA.test(s.value) && patternB.test(candidateValue)) ||
        (patternB.test(s.value) && patternA.test(candidateValue))
      ) {
        return true;
      }
    }

    return false;
  });

  if (conflictingSignal) {
    return {
      stability: 'CONFLICTING_PREFERENCE',
      isFactuallySound: true,
      confidenceScore: 0.88,
      scope: 'global',
      justification: `Detected conflict with existing preference '${conflictingSignal.key}' = '${conflictingSignal.value}'. Applying recency preference with confidence calibration.`,
      detectedConflict: {
        conflictingSignalId: conflictingSignal.id,
        conflictingKey: conflictingSignal.key,
        existingValue: conflictingSignal.value,
        existingConfidence: conflictingSignal.confidence,
        proposedValue: candidateValue,
        resolutionStrategy: 'recency_preferred',
      },
    };
  }

  // 4. Standard Valid Stable Preference
  const hasExplicitStableMarkers = /(?:from now on|always|never|my default|i prefer|set my preference|going forward|by default)/i.test(
    rawUtterance
  );

  const confidenceScore = hasExplicitStableMarkers ? 0.95 : 0.85;

  return {
    stability: 'STABLE_PREFERENCE',
    isFactuallySound: true,
    confidenceScore,
    scope: 'global',
    justification: `Classified as valid stable preference (Confidence: ${Math.round(confidenceScore * 100)}%). Stored in Tier 2 personalization without modifying global model weights.`,
  };
}
