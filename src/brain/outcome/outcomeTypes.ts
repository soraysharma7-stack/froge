/**
 * FROGÉ Brain - Outcome Learning Architecture Types
 *
 * Core principles:
 * 1. AI Advice -> Optional "Track outcome" -> Follow-up task -> Ask user later -> Classify outcome -> Evaluate prediction -> Update category calibration.
 * 2. Hard Guardrails:
 *    - Zero automatic global model retraining.
 *    - Never treat one outcome as universal truth (statistical sample aggregation & Bayesian damping).
 *    - Track performance by granular category rather than blindly changing global AI behavior.
 *    - Comprehensive user controls to disable tracking, reset calibration, or delete records.
 */

export type OutcomeCategory =
  | 'code_debugging'
  | 'system_architecture'
  | 'performance_optimization'
  | 'api_integration'
  | 'security_hardening'
  | 'data_analysis'
  | 'operational_planning'
  | 'career_strategy'
  | 'creative_writing'
  | 'general_advice';

export type OutcomeClassificationType =
  | 'SUCCESS_AS_PREDICTED'
  | 'PARTIAL_SUCCESS'
  | 'UNEXPECTED_FAILURE'
  | 'INCONCLUSIVE_EXTERNAL_FACTORS'
  | 'USER_DEVIATED_FROM_ADVICE'
  | 'PREDICTION_OVERCONFIDENT'
  | 'PREDICTION_UNDERCONFIDENT';

export type TrackedTaskStatus =
  | 'pending_checkin'
  | 'checkin_due'
  | 'evaluated'
  | 'dismissed';

export interface TrackedAdviceItem {
  id: string;
  userId: string;
  conversationId?: string;
  messageId?: string;
  query: string;
  adviceSummary: string;
  fullAdviceText: string;
  category: OutcomeCategory;
  predictedConfidence: number; // 0.0 - 1.0 (AI initial stated or inferred confidence)
  expectedOutcome: string;
  followUpDueAt: number; // timestamp
  createdAt: number;
  status: TrackedTaskStatus;
  userNotes?: string;
}

export interface OutcomeReport {
  id: string;
  trackedAdviceId: string;
  userId: string;
  userFeedbackText: string;
  userSatisfactionScore?: number; // 1 to 5
  reportedOutcomeSummary: string;
  reportedAt: number;
  deviatedFromAdvice: boolean;
  externalBlockersEncountered?: string[];
}

export interface PredictionEvaluation {
  id: string;
  trackedAdviceId: string;
  outcomeReportId: string;
  category: OutcomeCategory;
  classification: OutcomeClassificationType;
  accuracyScore: number; // 0.0 to 1.0
  predictedConfidence: number;
  calibrationDelta: number; // accuracyScore - predictedConfidence (negative = overconfident, positive = underconfident)
  causalFactors: string[];
  keyInsight: string;
  evaluatedAt: number;
  isStatisticallySignificant: boolean;
}

export interface CategoryCalibrationStats {
  category: OutcomeCategory;
  totalTracked: number;
  totalEvaluated: number;
  successCount: number;
  partialSuccessCount: number;
  failureCount: number;
  inconclusiveCount: number;
  averageStatedConfidence: number; // 0.0 - 1.0
  empiricalAccuracy: number; // 0.0 - 1.0
  brierScore: number; // Mean squared error between confidence and binary outcome (lower is better, 0.0 = perfect)
  calibrationBias: 'well_calibrated' | 'overconfident' | 'underconfident';
  calibrationMultiplier: number; // Dampened multiplier for future prompt confidence (e.g. 0.85 - 1.15)
  effectiveSampleSize: number;
  confidenceInterval: [number, number]; // [lower, upper] e.g. [0.72, 0.88]
  lastUpdated: number;
}

export interface OutcomeLearningConfig {
  enabled: boolean;
  autoSuggestTrackingForActionableAdvice: boolean;
  defaultFollowUpDelayHours: number; // Default 24 hours
  minimumSampleSizeForCalibrationAdjustment: number; // Guardrail: default 3 to avoid single-outcome overreaction
  bayesianDampingFactor: number; // 0.0 - 1.0 (higher = smoother, slower to swing on single results)
  categoryOverrides: Record<OutcomeCategory, { enabled: boolean; customMultiplier?: number }>;
  retentionDays: number;
  notifyOnCheckinDue: boolean;
}

export interface OutcomeProcessingResult {
  id: string;
  trackedAdvice: TrackedAdviceItem;
  outcomeReport?: OutcomeReport;
  evaluation?: PredictionEvaluation;
  updatedCategoryCalibration?: CategoryCalibrationStats;
  actionTaken:
    | 'task_registered'
    | 'checkin_recorded_and_evaluated'
    | 'task_dismissed'
    | 'calibration_recalculated';
  injectedCalibrationHint?: string;
  noRetrainingNotice: string;
}
