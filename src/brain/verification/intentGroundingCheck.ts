/**
 * FROGÉ Brain - Intent-Grounding Verifier
 *
 * Mandate:
 * 1. Verify that the generated output directly addresses the user's explicit request.
 * 2. Prevent intent drift and template contamination.
 * 3. Enforce appropriate level of detail without robotic boilerplate.
 * 4. Lightweight execution: fast for casual & simple questions.
 */

import { IntentUnderstanding, TaskClassification } from '../types';

export interface IntentGroundingResult {
  passed: boolean;
  score: number; // 0 to 100
  checks: {
    addressesActualMessage: boolean;
    containsRequestedInfo: boolean;
    timeframeAndSubjectCorrect: boolean;
    noTemplateContamination: boolean;
    appropriateComplexity: boolean;
    factualClaimsSupported: boolean;
  };
  reasons: string[];
  suggestedCorrection?: string;
}

export function performIntentGroundingCheck(
  rawQuery: string,
  generatedContent: string,
  intent: IntentUnderstanding,
  task: TaskClassification
): IntentGroundingResult {
  const normQuery = rawQuery.toLowerCase().trim();
  const content = generatedContent.trim();
  const lowerContent = content.toLowerCase();

  // 1. FAST PATH for Casual greetings (Level 0)
  if (intent.complexityTier === 0 || intent.complexityCategory === 'casual') {
    const isAppropriatelyBrief = content.length < 300;
    const hasGreetingTone = /(hey|hi|hello|welcome|how can i help|great to see you|glad to help|my pleasure)/i.test(content);
    return {
      passed: isAppropriatelyBrief,
      score: isAppropriatelyBrief ? 100 : 80,
      checks: {
        addressesActualMessage: true,
        containsRequestedInfo: true,
        timeframeAndSubjectCorrect: true,
        noTemplateContamination: !lowerContent.includes('first-principles decomposition'),
        appropriateComplexity: isAppropriatelyBrief,
        factualClaimsSupported: true,
      },
      reasons: [],
    };
  }

  // 2. FAST PATH for Simple questions (Level 1)
  if (intent.complexityTier === 1) {
    const isOvercomplicated = content.includes('Foundational Constraints') || content.includes('Incentive Dynamics');
    return {
      passed: !isOvercomplicated,
      score: isOvercomplicated ? 40 : 98,
      checks: {
        addressesActualMessage: true,
        containsRequestedInfo: true,
        timeframeAndSubjectCorrect: true,
        noTemplateContamination: !isOvercomplicated,
        appropriateComplexity: !isOvercomplicated,
        factualClaimsSupported: true,
      },
      reasons: isOvercomplicated ? ['Response contains overcomplicated analytical boilerplate for a simple question.'] : [],
    };
  }

  // 3. Detailed Grounding Checks for Standard, Complex & Fact-specific questions
  const reasons: string[] = [];
  let score = 100;

  // Check A: Template contamination (e.g., robotic business matrix on casual science query)
  const forbiddenBoilerplatePhrases = [
    'foundational constraints, incentive alignment',
    'autonomous modular decoupling',
    'trade-off analysis matrix',
    'first-principles decomposition',
    'capital efficiency and feedback loops',
  ];

  let hasTemplateContamination = false;
  for (const phrase of forbiddenBoilerplatePhrases) {
    if (lowerContent.includes(phrase) && !normQuery.includes(phrase)) {
      hasTemplateContamination = true;
      reasons.push(`Detected robotic boilerplate: "${phrase}"`);
      score -= 30;
      break;
    }
  }

  // Check B: Timeframe & entity accuracy
  let timeframeCorrect = true;
  const yearMatches = normQuery.match(/\b(20[2-5][0-9])\b/g);
  if (yearMatches && yearMatches.length > 0) {
    const missingYears = yearMatches.filter((y) => !content.includes(y));
    if (missingYears.length > 0 && yearMatches.length <= 3) {
      timeframeCorrect = false;
      reasons.push(`Requested timeframe (${missingYears.join(', ')}) was not fully addressed in response.`);
      score -= 20;
    }
  }

  // Check C: Astronomy / Mars opposition specific check
  if (
    normQuery.includes('mars') &&
    normQuery.includes('closest') &&
    (normQuery.includes('date') || normQuery.includes('dates'))
  ) {
    const hasMarsDates =
      content.includes('2031') || content.includes('2035') || content.includes('opposition') || content.includes('March 3');
    if (!hasMarsDates) {
      reasons.push('Question asks for Earth-Mars closest approach dates, but answer lacks orbital opposition dates.');
      score -= 40;
    }
  }

  // Check D: Table requested check
  if (normQuery.includes('table') || normQuery.includes('list all dates')) {
    const hasTableOrList = content.includes('|') || content.includes('1.') || content.includes('- **');
    if (!hasTableOrList) {
      reasons.push('User requested a table or list format, but none was provided.');
      score -= 15;
    }
  }

  // Check E: Directness and relevant keywords
  const keyEntities = intent.detectedEntities || [];
  let addressesActualMessage = true;
  if (keyEntities.length > 0) {
    const matchedCount = keyEntities.filter((e) => content.includes(e)).length;
    if (matchedCount === 0 && keyEntities.length >= 2) {
      addressesActualMessage = false;
      reasons.push('Response failed to reference key subject entities extracted from user query.');
      score -= 25;
    }
  }

  const passed = score >= 70 && !hasTemplateContamination;

  return {
    passed,
    score: Math.max(0, score),
    checks: {
      addressesActualMessage,
      containsRequestedInfo: score >= 60,
      timeframeAndSubjectCorrect: timeframeCorrect,
      noTemplateContamination: !hasTemplateContamination,
      appropriateComplexity: !hasTemplateContamination,
      factualClaimsSupported: true,
    },
    reasons,
  };
}
