/**
 * FROGÉ Brain - Outcome Classifier
 *
 * Evaluates the user's reported feedback regarding past advice:
 * - Determines if the advice was followed or deviated from
 * - Classifies into standard outcome categories (SUCCESS, PARTIAL, UNEXPECTED_FAILURE, INCONCLUSIVE, etc.)
 * - Identifies external blockers and causal factors
 */

import {
  TrackedAdviceItem,
  OutcomeReport,
  OutcomeClassificationType,
  OutcomeCategory,
} from './outcomeTypes';

export interface ClassificationDetails {
  classification: OutcomeClassificationType;
  accuracyScore: number; // 0.0 - 1.0
  deviatedFromAdvice: boolean;
  externalBlockers: string[];
  causalFactors: string[];
  justification: string;
}

export function classifyUserOutcome(
  trackedAdvice: TrackedAdviceItem,
  feedbackText: string,
  userSatisfactionScore?: number
): ClassificationDetails {
  const text = feedbackText.toLowerCase().trim();

  const successKeywords = [
    'worked',
    'fixed',
    'solved',
    'success',
    'perfect',
    'great',
    'resolved',
    'passed',
    'running smoothly',
    'accepted',
    'approved',
    'flawless',
    'helped a lot',
    '100%',
    'all good',
    'as expected',
  ];

  const partialKeywords = [
    'mostly worked',
    'partially',
    'with some changes',
    'had to tweak',
    'minor issue',
    'almost',
    'needed adjustment',
    'somewhat',
    'got it working after modifying',
  ];

  const failureKeywords = [
    'failed',
    'did not work',
    "didn't work",
    'broke',
    'error',
    'worse',
    'crashed',
    'wrong',
    'useless',
    'did not fix',
    'incorrect',
    'gave an error',
    'rejected',
    'fell through',
  ];

  const externalKeywords = [
    'third party',
    'outage',
    'api down',
    'budget cut',
    'boss changed mind',
    'client cancelled',
    'unrelated issue',
    'network failure',
    'postponed',
    'shelved',
    'blocked by team',
  ];

  const deviationKeywords = [
    'did something else',
    'decided to use',
    'switched to',
    'went with another',
    'deviated',
    'didn’t follow',
    'instead of your advice',
  ];

  const externalBlockers: string[] = [];
  externalKeywords.forEach((k) => {
    if (text.includes(k)) externalBlockers.push(k);
  });

  const causalFactors: string[] = [];
  if (text.includes('syntax') || text.includes('type error')) causalFactors.push('Type/Syntax boundary');
  if (text.includes('version') || text.includes('dependency')) causalFactors.push('Package version mismatch');
  if (text.includes('performance') || text.includes('slow')) causalFactors.push('Runtime latency constraint');
  if (text.includes('permission') || text.includes('auth')) causalFactors.push('Authorization/Access rule');
  if (text.includes('requirement') || text.includes('scope change')) causalFactors.push('Evolving user requirement');

  // Check deviation
  const deviated = deviationKeywords.some((k) => text.includes(k));

  // Determine Classification & Accuracy
  if (deviated) {
    return {
      classification: 'USER_DEVIATED_FROM_ADVICE',
      accuracyScore: 0.5, // neutral
      deviatedFromAdvice: true,
      externalBlockers,
      causalFactors: causalFactors.length > 0 ? causalFactors : ['Alternative approach selected by user'],
      justification: 'User chose an alternative implementation route or deviated from the recommended advice.',
    };
  }

  if (externalBlockers.length > 0 && !successKeywords.some((k) => text.includes(k))) {
    return {
      classification: 'INCONCLUSIVE_EXTERNAL_FACTORS',
      accuracyScore: 0.5,
      deviatedFromAdvice: false,
      externalBlockers,
      causalFactors: ['External third-party or dependency constraint'],
      justification: `Outcome was blocked or rendered inconclusive by external dependencies: ${externalBlockers.join(', ')}.`,
    };
  }

  const hasSuccess = successKeywords.some((k) => text.includes(k)) || (userSatisfactionScore && userSatisfactionScore >= 4);
  const hasPartial = partialKeywords.some((k) => text.includes(k)) || userSatisfactionScore === 3;
  const hasFailure = failureKeywords.some((k) => text.includes(k)) || (userSatisfactionScore && userSatisfactionScore <= 2);

  if (hasFailure && !hasSuccess) {
    const isOverconfident = trackedAdvice.predictedConfidence >= 0.8;
    return {
      classification: isOverconfident ? 'PREDICTION_OVERCONFIDENT' : 'UNEXPECTED_FAILURE',
      accuracyScore: 0.1,
      deviatedFromAdvice: false,
      externalBlockers,
      causalFactors: causalFactors.length > 0 ? causalFactors : ['Advice failed to achieve the targeted objective'],
      justification: `The provided advice failed in practice (${isOverconfident ? 'high predicted confidence' : 'unsuccessful outcome'}).`,
    };
  }

  if (hasPartial) {
    return {
      classification: 'PARTIAL_SUCCESS',
      accuracyScore: 0.65,
      deviatedFromAdvice: false,
      externalBlockers,
      causalFactors: causalFactors.length > 0 ? causalFactors : ['Required secondary adjustments or configuration tweaks'],
      justification: 'The advice was generally in the right direction but required adjustments or tweaks to fully succeed.',
    };
  }

  if (hasSuccess) {
    const isUnderconfident = trackedAdvice.predictedConfidence <= 0.6;
    return {
      classification: isUnderconfident ? 'PREDICTION_UNDERCONFIDENT' : 'SUCCESS_AS_PREDICTED',
      accuracyScore: 1.0,
      deviatedFromAdvice: false,
      externalBlockers: [],
      causalFactors: causalFactors.length > 0 ? causalFactors : ['Advice executed accurately and produced expected result'],
      justification: 'The advice was executed as recommended and fully achieved the expected positive outcome.',
    };
  }

  // Neutral default fallback
  return {
    classification: 'PARTIAL_SUCCESS',
    accuracyScore: 0.6,
    deviatedFromAdvice: false,
    externalBlockers,
    causalFactors: causalFactors.length > 0 ? causalFactors : ['Mixed or neutral reported outcome'],
    justification: 'User reported neutral feedback with indeterminate success criteria.',
  };
}

export function classifyOutcomeCategory(text: string): OutcomeCategory {
  const lower = text.toLowerCase();
  if (lower.includes('error') || lower.includes('bug') || lower.includes('fix') || lower.includes('stack') || lower.includes('exception')) {
    return 'code_debugging';
  }
  if (lower.includes('architecture') || lower.includes('microservice') || lower.includes('database design') || lower.includes('infrastructure')) {
    return 'system_architecture';
  }
  if (lower.includes('performance') || lower.includes('latency') || lower.includes('speed') || lower.includes('memory') || lower.includes('optimize')) {
    return 'performance_optimization';
  }
  if (lower.includes('api') || lower.includes('endpoint') || lower.includes('rest') || lower.includes('graphql') || lower.includes('webhook')) {
    return 'api_integration';
  }
  if (lower.includes('security') || lower.includes('auth') || lower.includes('token') || lower.includes('vulnerability') || lower.includes('ssl')) {
    return 'security_hardening';
  }
  if (lower.includes('data') || lower.includes('chart') || lower.includes('dataset') || lower.includes('analytics') || lower.includes('sql')) {
    return 'data_analysis';
  }
  if (lower.includes('deploy') || lower.includes('docker') || lower.includes('kubernetes') || lower.includes('ci/cd') || lower.includes('pipeline')) {
    return 'operational_planning';
  }
  if (lower.includes('career') || lower.includes('interview') || lower.includes('resume') || lower.includes('job') || lower.includes('salary')) {
    return 'career_strategy';
  }
  if (lower.includes('story') || lower.includes('poem') || lower.includes('essay') || lower.includes('creative') || lower.includes('draft')) {
    return 'creative_writing';
  }
  return 'general_advice';
}

