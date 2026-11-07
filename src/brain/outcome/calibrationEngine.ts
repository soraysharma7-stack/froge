/**
 * FROGÉ Brain - Category Calibration Engine
 *
 * Tracks empirical accuracy, Brier reliability scores, and calibration multipliers segmented
 * strictly by domain category (e.g. `code_debugging`, `system_architecture`, `performance_optimization`).
 *
 * CRITICAL GUARDRAILS ENFORCED:
 * 1. Never treat one outcome as universal truth:
 *    - Uses Bayesian Beta-Binomial prior smoothing (prior alpha=4, beta=1, corresponding to ~80% historical baseline).
 *    - A single failure only nudges the empirical curve smoothly, rather than collapsing confidence to 0%.
 * 2. Category Isolation:
 *    - Outcomes in `code_debugging` do not distort calibration for `career_strategy` or `data_analysis`.
 * 3. Zero Model Retraining:
 *    - Calibration is reflected entirely via in-context prompt priors and uncertainty calibration tokens.
 */

import {
  OutcomeCategory,
  CategoryCalibrationStats,
  PredictionEvaluation,
  OutcomeLearningConfig,
} from './outcomeTypes';

export const ALL_OUTCOME_CATEGORIES: OutcomeCategory[] = [
  'code_debugging',
  'system_architecture',
  'performance_optimization',
  'api_integration',
  'security_hardening',
  'data_analysis',
  'operational_planning',
  'career_strategy',
  'creative_writing',
  'general_advice',
];

// Baseline prior assumptions (equivalent to a reasonable baseline before local feedback)
const PRIOR_ALPHA = 4.0; // Prior successes weight
const PRIOR_BETA = 1.0;  // Prior failures weight

export function createInitialCategoryStats(category: OutcomeCategory): CategoryCalibrationStats {
  return {
    category,
    totalTracked: 0,
    totalEvaluated: 0,
    successCount: 0,
    partialSuccessCount: 0,
    failureCount: 0,
    inconclusiveCount: 0,
    averageStatedConfidence: 0.85,
    empiricalAccuracy: 0.80,
    brierScore: 0.04, // 0.04 is low error (well calibrated)
    calibrationBias: 'well_calibrated',
    calibrationMultiplier: 1.0,
    effectiveSampleSize: 0,
    confidenceInterval: [0.70, 0.90],
    lastUpdated: Date.now(),
  };
}

export class FrogeCalibrationEngine {
  private categoryStatsMap: Map<OutcomeCategory, CategoryCalibrationStats> = new Map();
  private evaluationHistory: PredictionEvaluation[] = [];

  constructor() {
    ALL_OUTCOME_CATEGORIES.forEach((cat) => {
      this.categoryStatsMap.set(cat, createInitialCategoryStats(cat));
    });
  }

  public getCategoryStats(category: OutcomeCategory): CategoryCalibrationStats {
    const stats = this.categoryStatsMap.get(category);
    if (!stats) {
      const initial = createInitialCategoryStats(category);
      this.categoryStatsMap.set(category, initial);
      return initial;
    }
    return { ...stats };
  }

  public getAllCategoryStats(): CategoryCalibrationStats[] {
    return Array.from(this.categoryStatsMap.values());
  }

  public getEvaluationHistory(category?: OutcomeCategory): PredictionEvaluation[] {
    if (category) {
      return this.evaluationHistory.filter((e) => e.category === category);
    }
    return [...this.evaluationHistory];
  }

  /**
   * Updates category statistics with a new outcome evaluation.
   * Employs Bayesian smoothing to ensure a single sample does not cause wild swings.
   */
  public recordEvaluation(
    evalItem: PredictionEvaluation,
    config: OutcomeLearningConfig
  ): CategoryCalibrationStats {
    this.evaluationHistory.push(evalItem);

    const category = evalItem.category;
    const current = this.getCategoryStats(category);

    const categoryEvaluations = this.evaluationHistory.filter((e) => e.category === category);
    const n = categoryEvaluations.length;

    let successCount = 0;
    let partialCount = 0;
    let failureCount = 0;
    let inconclusiveCount = 0;
    let totalConfidenceSum = 0;
    let brierSum = 0;

    categoryEvaluations.forEach((item) => {
      totalConfidenceSum += item.predictedConfidence;
      const squaredError = Math.pow(item.predictedConfidence - item.accuracyScore, 2);
      brierSum += squaredError;

      if (item.classification === 'SUCCESS_AS_PREDICTED' || item.classification === 'PREDICTION_UNDERCONFIDENT') {
        successCount++;
      } else if (item.classification === 'PARTIAL_SUCCESS') {
        partialCount++;
      } else if (item.classification === 'INCONCLUSIVE_EXTERNAL_FACTORS' || item.classification === 'USER_DEVIATED_FROM_ADVICE') {
        inconclusiveCount++;
      } else {
        failureCount++;
      }
    });

    const avgConfidence = totalConfidenceSum / n;
    const brierScore = Math.round((brierSum / n) * 1000) / 1000;

    // Bayesian Smoothed Empirical Accuracy: (prior_success + actual_successes + 0.65 * partials) / (prior_total + actual_evals)
    const damping = config.bayesianDampingFactor || 0.8;
    const effectivePriorAlpha = PRIOR_ALPHA * (1 + damping);
    const effectivePriorBeta = PRIOR_BETA * (1 + damping);

    const effectiveSuccessWeight = successCount + partialCount * 0.65;
    const effectiveFailureWeight = failureCount + inconclusiveCount * 0.2;

    const smoothedAccuracy =
      (effectivePriorAlpha + effectiveSuccessWeight) /
      (effectivePriorAlpha + effectivePriorBeta + effectiveSuccessWeight + effectiveFailureWeight);

    // Compute calibration bias
    const calibrationDelta = smoothedAccuracy - avgConfidence;
    let bias: 'well_calibrated' | 'overconfident' | 'underconfident' = 'well_calibrated';
    if (calibrationDelta < -0.10) {
      bias = 'overconfident';
    } else if (calibrationDelta > 0.10) {
      bias = 'underconfident';
    }

    // Calibration Multiplier for future predictions:
    // Bound multiplier between 0.75 and 1.25 to prevent extreme distortion
    let rawMultiplier = smoothedAccuracy / (avgConfidence || 0.85);
    // Apply damping so single outcomes do NOT shift multiplier abruptly
    const dampenedMultiplier = 1.0 + (rawMultiplier - 1.0) * (1.0 - damping * 0.5);
    const boundedMultiplier = Math.max(0.75, Math.min(1.25, dampenedMultiplier));

    // Confidence interval (95% approx normal approximation with Laplace smoothing)
    const variance = (smoothedAccuracy * (1 - smoothedAccuracy)) / (n + 5);
    const margin = Math.min(0.20, 1.96 * Math.sqrt(variance));
    const lowerCi = Math.max(0.0, Math.round((smoothedAccuracy - margin) * 100) / 100);
    const upperCi = Math.min(1.0, Math.round((smoothedAccuracy + margin) * 100) / 100);

    const updatedStats: CategoryCalibrationStats = {
      category,
      totalTracked: current.totalTracked + 1,
      totalEvaluated: n,
      successCount,
      partialSuccessCount: partialCount,
      failureCount,
      inconclusiveCount,
      averageStatedConfidence: Math.round(avgConfidence * 100) / 100,
      empiricalAccuracy: Math.round(smoothedAccuracy * 100) / 100,
      brierScore,
      calibrationBias: bias,
      calibrationMultiplier: Math.round(boundedMultiplier * 100) / 100,
      effectiveSampleSize: n,
      confidenceInterval: [lowerCi, upperCi],
      lastUpdated: Date.now(),
    };

    this.categoryStatsMap.set(category, updatedStats);
    return updatedStats;
  }

  /**
   * Generates in-context calibration instructions for prompt injection.
   * Does NOT touch global model weights.
   */
  public synthesizeCategoryCalibrationPromptContext(
    targetCategory?: OutcomeCategory,
    minSamples: number = 2
  ): string {
    const statsList = targetCategory
      ? [this.getCategoryStats(targetCategory)]
      : this.getAllCategoryStats();

    const activeCalibratedCategories = statsList.filter(
      (s) => s.totalEvaluated >= minSamples && Math.abs(s.calibrationMultiplier - 1.0) >= 0.04
    );

    if (activeCalibratedCategories.length === 0) {
      return '';
    }

    const lines: string[] = [
      '### FROGÉ DOMAIN CALIBRATION & EMPIRICAL RELIABILITY PRIORS (ZERO GLOBAL RETRAINING):',
      'The following domain calibration factors have been observed from tracked real-world outcomes.',
      'Adjust your confidence calibration, caveat depth, and uncertainty signaling accordingly:',
    ];

    activeCalibratedCategories.forEach((cat) => {
      const pct = Math.round(cat.empiricalAccuracy * 100);
      const confPct = Math.round(cat.averageStatedConfidence * 100);
      if (cat.calibrationBias === 'overconfident') {
        lines.push(
          `- Domain [${cat.category}]: Empirical accuracy is ${pct}% vs avg stated confidence ${confPct}% (Sample size: ${cat.totalEvaluated}). State clear trade-offs, offer secondary verification steps, and do not present single solutions as infallible.`
        );
      } else if (cat.calibrationBias === 'underconfident') {
        lines.push(
          `- Domain [${cat.category}]: High empirical reliability observed (${pct}% success rate across ${cat.totalEvaluated} outcomes). Provide direct, high-conviction recommendations with concise reasoning.`
        );
      } else {
        lines.push(
          `- Domain [${cat.category}]: Well-calibrated (${pct}% accuracy, Brier Score: ${cat.brierScore}). Maintain balanced precision.`
        );
      }
    });

    return lines.join('\n');
  }

  public resetCategoryCalibration(category?: OutcomeCategory): void {
    if (category) {
      this.categoryStatsMap.set(category, createInitialCategoryStats(category));
      this.evaluationHistory = this.evaluationHistory.filter((e) => e.category !== category);
    } else {
      ALL_OUTCOME_CATEGORIES.forEach((cat) => {
        this.categoryStatsMap.set(cat, createInitialCategoryStats(cat));
      });
      this.evaluationHistory = [];
    }
  }
}
