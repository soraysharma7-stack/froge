/**
 * FROGÉ Brain - Live-Learn Personalization Types
 *
 * Core Principles:
 * - Dynamic in-context personalization, ZERO global model retraining
 * - Strict stability classification: never treat every correction as a permanent fact
 * - Transparent confidence calibration, decay, and reinforcement tracking
 * - Explicit user controls: inspect, pin, edit, adjust confidence, and delete
 */

export type StabilityClassification =
  | 'STABLE_PREFERENCE'       // Permanent/recurring instruction ("From now on...", "Always...", "I prefer...")
  | 'TEMPORARY_INSTRUCTION'   // Ephemeral/single-turn instruction ("For this question only...", "Just this once...")
  | 'SITUATIONAL_OVERRIDE'   // Scoped to specific domain/topic ("When writing SQL queries...", "In React components...")
  | 'INCORRECT_FEEDBACK'      // Factually false, hallucinated, or unsafe correction (e.g., "2+2=5", "Python has no lists")
  | 'CONFLICTING_PREFERENCE'; // Clashes with an existing learned preference

export type CorrectionType =
  | 'preference_directive'
  | 'temporary_instruction'
  | 'factual_correction'
  | 'tone_style_correction'
  | 'constraint_refinement'
  | 'none';

export type SignalScope = 'global' | 'session' | 'topic_specific';

export type SignalStatus = 'active' | 'pinned' | 'disputed' | 'decayed' | 'disabled' | 'rejected';

export type ConflictResolutionStrategy =
  | 'recency_preferred'
  | 'confidence_weighted'
  | 'user_confirmation_required'
  | 'scoped_partition';

/**
 * Stored Live-Learned Personalization Signal
 */
export interface LiveLearnSignal {
  id: string;
  userId: string;
  key: string;                          // E.g., 'preferred_language', 'response_length', 'code_style', 'tone'
  value: string;                        // E.g., 'TypeScript', 'concise bulleted points', 'Tailwind CSS'
  category: 'preference' | 'interaction_style' | 'custom_instruction' | 'expertise_level' | 'domain_constraint';
  stability: StabilityClassification;
  confidence: number;                   // 0.0 to 1.0 (calibrated score)
  reinforcementCount: number;           // Number of times user reinforced this preference
  lastReinforcedAt: number;
  createdAt: number;
  decayRate: number;                    // 0.05 per day default
  scope: SignalScope;
  topicScope?: string;                  // E.g., 'coding', 'sql', 'writing'
  sourceUtterance: string;              // The original user correction message
  status: SignalStatus;
  isPinned: boolean;
  conflictHistory?: {
    priorSignalId?: string;
    priorValue?: string;
    resolutionStrategy: ConflictResolutionStrategy;
    resolvedAt: number;
  };
  rejectionReason?: string;             // Stored if stability is INCORRECT_FEEDBACK
}

/**
 * Result of analyzing a user message for corrections
 */
export interface CorrectionDetectionResult {
  isCorrection: boolean;
  correctionType: CorrectionType;
  detectedKey?: string;
  detectedValue?: string;
  rawKeywords: string[];
  extractedDirectives: Array<{
    key: string;
    value: string;
    category: LiveLearnSignal['category'];
    stability: StabilityClassification;
    confidence: number;
    scope: SignalScope;
    topicScope?: string;
  }>;
  reasoning: string;
}

/**
 * Result of classifying stability & validating factuality
 */
export interface StabilityValidationResult {
  stability: StabilityClassification;
  isFactuallySound: boolean;
  confidenceScore: number;
  scope: SignalScope;
  topicScope?: string;
  justification: string;
  detectedConflict?: {
    conflictingSignalId: string;
    conflictingKey: string;
    existingValue: string;
    existingConfidence: number;
    proposedValue: string;
    resolutionStrategy: ConflictResolutionStrategy;
  };
}

/**
 * Complete Live-Learn Processing Lifecycle Result
 */
export interface LiveLearnProcessingResult {
  id: string;
  userId: string;
  timestamp: number;
  inputUtterance: string;
  detection: CorrectionDetectionResult;
  validation: StabilityValidationResult;
  storedSignal: LiveLearnSignal | null;
  actionTaken:
    | 'stored_stable_preference'
    | 'cached_temporary_instruction'
    | 'resolved_conflict_and_updated'
    | 'rejected_incorrect_feedback'
    | 'no_correction_detected'
    | 'blocked_by_user_controls';
  explanation: string;
  injectedPromptContext: string;
  noModelRetrainingNotice: string;
}

/**
 * User Configuration for Live-Learn Personalization
 */
export interface LiveLearnConfig {
  userId: string;
  enabled: boolean;
  autoDetectCorrections: boolean;
  minimumConfidenceThreshold: number;   // Signals with confidence >= this are injected into prompts (default: 0.60)
  allowTemporarySessionOverrides: boolean;
  enableConfidenceDecay: boolean;
  requireConfirmationOnConflict: boolean;
  noModelRetrainingGuarantee: boolean;   // Always true
  maxActiveSignals: number;
}
