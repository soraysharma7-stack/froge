/**
 * FROGÉ Brain - Prediction Evaluator
 *
 * Compares stated AI prediction confidence vs actual real-world outcome.
 * Computes:
 * - Accuracy Score (0.0 to 1.0)
 * - Calibration Delta (accuracy - predictedConfidence)
 * - Causal Factors & Actionable Insights
 * - Guardrail: Flags whether an outcome is statistically isolated or part of a trend.
 */

import {
  TrackedAdviceItem,
  OutcomeReport,
  PredictionEvaluation,
} from './outcomeTypes';
import { classifyUserOutcome } from './outcomeClassifier';

export function evaluatePrediction(
  trackedAdvice: TrackedAdviceItem,
  outcomeReport: OutcomeReport
): PredictionEvaluation {
  const classificationDetails = classifyUserOutcome(
    trackedAdvice,
    outcomeReport.userFeedbackText,
    outcomeReport.userSatisfactionScore
  );

  const calibrationDelta = classificationDetails.accuracyScore - trackedAdvice.predictedConfidence;

  let keyInsight = '';
  if (classificationDetails.classification === 'SUCCESS_AS_PREDICTED') {
    keyInsight = `Advice in '${trackedAdvice.category}' matched reality well. Predicted ${Math.round(trackedAdvice.predictedConfidence * 100)}% conf vs successful outcome.`;
  } else if (classificationDetails.classification === 'PREDICTION_OVERCONFIDENT') {
    keyInsight = `Overconfidence detected in '${trackedAdvice.category}'. Model predicted ${Math.round(trackedAdvice.predictedConfidence * 100)}% but advice failed in execution.`;
  } else if (classificationDetails.classification === 'PREDICTION_UNDERCONFIDENT') {
    keyInsight = `Conservative confidence detected in '${trackedAdvice.category}'. Stated ${Math.round(trackedAdvice.predictedConfidence * 100)}% but succeeded flawlessly.`;
  } else if (classificationDetails.classification === 'PARTIAL_SUCCESS') {
    keyInsight = `Partial outcome in '${trackedAdvice.category}'. Advice required tweaks/adjustments to execute.`;
  } else if (classificationDetails.classification === 'INCONCLUSIVE_EXTERNAL_FACTORS') {
    keyInsight = `Outcome in '${trackedAdvice.category}' was dominated by external dependencies; excluded from negative calibration penalty.`;
  } else if (classificationDetails.classification === 'USER_DEVIATED_FROM_ADVICE') {
    keyInsight = `User chose an alternative implementation route in '${trackedAdvice.category}'; baseline prediction was not tested directly.`;
  } else {
    keyInsight = `Unpredicted failure occurred in '${trackedAdvice.category}'. Causal factors: ${classificationDetails.causalFactors.join(', ')}.`;
  }

  return {
    id: `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    trackedAdviceId: trackedAdvice.id,
    outcomeReportId: outcomeReport.id,
    category: trackedAdvice.category,
    classification: classificationDetails.classification,
    accuracyScore: classificationDetails.accuracyScore,
    predictedConfidence: trackedAdvice.predictedConfidence,
    calibrationDelta: Math.round(calibrationDelta * 1000) / 1000,
    causalFactors: classificationDetails.causalFactors,
    keyInsight,
    evaluatedAt: Date.now(),
    isStatisticallySignificant: false, // Single outcome is explicitly flagged as NOT globally universal
  };
}
