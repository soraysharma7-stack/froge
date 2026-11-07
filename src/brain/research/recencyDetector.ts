/**
 * FROGÉ Research Engine - Stage 2: Recency Need Detector
 * 
 * Determines whether current information / live web data is needed for a given question.
 * Distinguishes between:
 * - Real-time critical (breaking news, current price, live weather, stock market)
 * - Recent updates (current specs, recent releases, 2026/2025 roadmap, modern laws)
 * - Historical / fixed facts (timeless history, Newton's laws, classical logic)
 * - Conceptual theory (pure mathematics, programming algorithms, evergreen philosophy)
 * - Hybrid temporal (theory with modern evolving implementations)
 */

import { RecencyNeedAnalysis, RecencyRequirement } from './types';

// Temporal triggers
const REALTIME_KEYWORDS = [
  'today',
  'right now',
  'current price',
  'live score',
  'breaking',
  'latest stock',
  'weather today',
  'hours ago',
  'this morning',
  'status right now',
];

const RECENT_KEYWORDS = [
  'latest',
  'current version',
  'newest',
  'recent',
  'recently',
  '2026',
  '2025',
  '2024',
  'roadmap',
  'update',
  'release',
  'patch',
  'what is the state of',
  'new changes',
  'law passed',
  'who is the current',
  'current ceo',
  'who is the prime minister',
  'who is president of',
  'who won',
  'current population',
  'market share',
  'benchmark',
  'state of the art',
  'sota',
];

const HISTORICAL_KEYWORDS = [
  'history of',
  'in 1776',
  'in 1945',
  'in 1999',
  'in the 18th century',
  'ancient rome',
  'who discovered',
  'who invented',
  'first person to',
  'origin of',
  'etymology of',
];

const CONCEPTUAL_KEYWORDS = [
  'how does a binary search work',
  'explain quantum superposition',
  'proof of pythagorean',
  'time complexity of',
  'difference between let and const',
  'what is photosythesis',
  'what is photosynthesis',
  'explain recursion',
  'how do gears work',
  'calculus derivative of',
];

export function determineRecencyNeed(
  query: string,
  referenceDate: string = '2026-08-30'
): RecencyNeedAnalysis {
  const lower = query.toLowerCase().trim();
  const matchedKeywords: string[] = [];

  // Check real-time keywords
  for (const kw of REALTIME_KEYWORDS) {
    if (lower.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  // Check recent keywords
  for (const kw of RECENT_KEYWORDS) {
    if (lower.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  // Check historical keywords
  let isHistorical = false;
  for (const kw of HISTORICAL_KEYWORDS) {
    if (lower.includes(kw)) {
      isHistorical = true;
      matchedKeywords.push(kw);
    }
  }

  // Check conceptual keywords
  let isConceptual = false;
  for (const kw of CONCEPTUAL_KEYWORDS) {
    if (lower.includes(kw)) {
      isConceptual = true;
      matchedKeywords.push(kw);
    }
  }

  // Specific regex checks for years (e.g. 2025, 2026, 2027)
  const hasModernYear = /\b(202[4-9]|203[0-9])\b/.test(lower);
  if (hasModernYear) {
    matchedKeywords.push('modern_year_reference');
  }

  // Decision logic
  if (matchedKeywords.some((k) => REALTIME_KEYWORDS.includes(k))) {
    return {
      requiresCurrentInfo: true,
      recencyCategory: 'realtime_critical',
      confidenceScore: 0.95,
      temporalKeywordsFound: Array.from(new Set(matchedKeywords)),
      referenceDate,
      rationale: 'Question demands real-time or very recent information (hours/days freshness).',
      suggestedFreshnessWindowDays: 1,
    };
  }

  if (hasModernYear || matchedKeywords.some((k) => RECENT_KEYWORDS.includes(k))) {
    return {
      requiresCurrentInfo: true,
      recencyCategory: 'recent_updates',
      confidenceScore: 0.9,
      temporalKeywordsFound: Array.from(new Set(matchedKeywords)),
      referenceDate,
      rationale: 'Question inquires about modern developments, recent versions, or contemporary events.',
      suggestedFreshnessWindowDays: 90,
    };
  }

  if (isHistorical) {
    return {
      requiresCurrentInfo: false,
      recencyCategory: 'historical_fixed',
      confidenceScore: 0.88,
      temporalKeywordsFound: Array.from(new Set(matchedKeywords)),
      referenceDate,
      rationale: 'Question relates to established historical events or chronological facts with fixed records.',
      suggestedFreshnessWindowDays: undefined,
    };
  }

  if (isConceptual) {
    return {
      requiresCurrentInfo: false,
      recencyCategory: 'conceptual_theory',
      confidenceScore: 0.92,
      temporalKeywordsFound: Array.from(new Set(matchedKeywords)),
      referenceDate,
      rationale: 'Question concerns theoretical, mathematical, or pedagogical first-principles logic.',
      suggestedFreshnessWindowDays: undefined,
    };
  }

  // General questions with potential temporal dependency (e.g. software libraries, companies, policies)
  const hasEntityOrTech = /\b(framework|library|api|ai|model|law|election|president|price|ceo|regulation|fda|who|who is|what is the status)\b/.test(lower);
  if (hasEntityOrTech) {
    return {
      requiresCurrentInfo: true,
      recencyCategory: 'hybrid_temporal',
      confidenceScore: 0.78,
      temporalKeywordsFound: matchedKeywords,
      referenceDate,
      rationale: 'Topic may have recent empirical changes, updated standards, or evolving status.',
      suggestedFreshnessWindowDays: 180,
    };
  }

  return {
    requiresCurrentInfo: false,
    recencyCategory: 'conceptual_theory',
    confidenceScore: 0.7,
    temporalKeywordsFound: matchedKeywords,
    referenceDate,
    rationale: 'General query; standard verified foundational knowledge applies.',
  };
}
