/**
 * FROGÉ Brain - Outcome Learning Subsystem
 *
 * Optional Outcome Learning Architecture:
 * - AI advice -> Optional "Track outcome" -> Create follow-up task -> Ask user what happened later ->
 *   Classify outcome -> Evaluate previous prediction/advice -> Update Bayesian calibration information.
 *
 * Guardrails:
 * - Zero model retraining.
 * - No single-outcome universal truth shifts (Bayesian prior damping).
 * - Segmented by category.
 * - User policy controls.
 */

export * from './outcomeTypes';
export * from './outcomeClassifier';
export * from './predictionEvaluator';
export * from './calibrationEngine';
export * from './outcomeManager';
export * from './outcomeTestSuite';
