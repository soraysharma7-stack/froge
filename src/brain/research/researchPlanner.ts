/**
 * FROGÉ Research Engine - Stage 3: Research Planner
 * 
 * Creates a structured research plan before querying.
 * - Formulates primary hypothesis
 * - Decomposes the user query into targeted sub-queries
 * - Identifies primary, official, statutory, and academic sources
 * - Formulates target domain filters and exclusion criteria
 */

import {
  ResearchPlan,
  ResearchRequest,
  ResearchSubQuery,
  SourceCategoryPreference,
} from './types';

// Trusted official & primary domain registries
export const OFFICIAL_PRIMARY_DOMAINS: Record<string, string[]> = {
  science_medical: [
    'nih.gov',
    'cdc.gov',
    'who.int',
    'nature.com',
    'science.org',
    'ncbi.nlm.nih.gov',
    'nejm.org',
    'thelancet.com',
    'fda.gov',
  ],
  government_law: [
    'congress.gov',
    'whitehouse.gov',
    'supremecourt.gov',
    'europa.eu',
    'gov.uk',
    'un.org',
    'sec.gov',
  ],
  tech_specs_standards: [
    'w3.org',
    'ietf.org',
    'iso.org',
    'ieee.org',
    'developer.mozilla.org',
    'arxiv.org',
    'github.com',
    'docs.python.org',
    'typescriptlang.org',
    'react.dev',
  ],
  economic_stats: [
    'bls.gov',
    'worldbank.org',
    'imf.org',
    'federalreserve.gov',
    'oecd.org',
    'statista.com',
  ],
};

export function createResearchPlan(request: ResearchRequest): ResearchPlan {
  const query = request.query.trim();
  const planId = `rplan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const subQueries: ResearchSubQuery[] = [];
  const targetDomains: string[] = request.targetDomains || [];
  const preferredSourceTypes: SourceCategoryPreference[] = [];

  const lower = query.toLowerCase();

  // 1. Identify domain topic category
  let topicCategory = 'general';
  if (/\b(medical|fda|drug|health|vaccine|disease|treatment|doctor|biology|cancer)\b/.test(lower)) {
    topicCategory = 'science_medical';
    preferredSourceTypes.push('peer_reviewed_academic', 'official_docs', 'government_statutory');
    targetDomains.push(...OFFICIAL_PRIMARY_DOMAINS.science_medical);
  } else if (/\b(law|act|statute|regulation|court|government|policy|bill|treaty|senate)\b/.test(lower)) {
    topicCategory = 'government_law';
    preferredSourceTypes.push('government_statutory', 'official_docs', 'primary_organization');
    targetDomains.push(...OFFICIAL_PRIMARY_DOMAINS.government_law);
  } else if (/\b(code|typescript|javascript|react|python|api|spec|protocol|rfc|rfc\d+|benchmark|gpu|algorithm)\b/.test(lower)) {
    topicCategory = 'tech_specs_standards';
    preferredSourceTypes.push('official_docs', 'technical_community', 'industry_benchmarks');
    targetDomains.push(...OFFICIAL_PRIMARY_DOMAINS.tech_specs_standards);
  } else if (/\b(economy|inflation|gdp|unemployment|interest rate|market cap|revenue|quarterly|sec)\b/.test(lower)) {
    topicCategory = 'economic_stats';
    preferredSourceTypes.push('government_statutory', 'primary_organization', 'reputable_journalism');
    targetDomains.push(...OFFICIAL_PRIMARY_DOMAINS.economic_stats);
  } else {
    preferredSourceTypes.push('official_docs', 'primary_organization', 'reputable_journalism');
  }

  // 2. Generate structured sub-queries with different search angles
  // Primary core inquiry
  subQueries.push({
    id: `sq_1_${Date.now()}`,
    query: query,
    focusArea: 'Core Subject Verification & Official Documentation',
    targetedSourceType: preferredSourceTypes[0] || 'official_docs',
    priority: 1,
  });

  // Angle 2: Primary data & metrics angle
  subQueries.push({
    id: `sq_2_${Date.now()}`,
    query: `${query} official report primary data specifications`,
    focusArea: 'Primary Data, Empirical Benchmarks & Direct Reports',
    targetedSourceType: 'primary_organization',
    priority: 1,
  });

  // Angle 3: Counter-evidence / Divergent interpretations angle
  subQueries.push({
    id: `sq_3_${Date.now()}`,
    query: `${query} criticism limitations opposing views discrepancies`,
    focusArea: 'Counter-evidence, Alternative Methodologies & Discrepancies',
    targetedSourceType: 'peer_reviewed_academic',
    priority: 2,
  });

  // Angle 4: Chronological updates (if deep or exhaustive)
  if (request.depth === 'deep' || request.depth === 'exhaustive') {
    subQueries.push({
      id: `sq_4_${Date.now()}`,
      query: `${query} timeline latest updates 2026 2025 status`,
      focusArea: 'Temporal Recency & Version Timeline Audit',
      targetedSourceType: 'reputable_journalism',
      priority: 2,
    });
  }

  const estimatedDifficulty =
    request.depth === 'exhaustive'
      ? 'intensive'
      : request.depth === 'deep'
      ? 'moderate'
      : 'lean';

  const minimumCorroboratingSources =
    request.depth === 'exhaustive' ? 4 : request.depth === 'deep' ? 3 : 2;

  return {
    planId,
    userQuery: query,
    primaryHypothesis: `Investigate "${query}" prioritizing verified official records and cross-comparing independent primary documentation.`,
    subQueries,
    targetDomains: Array.from(new Set(targetDomains)),
    excludedDomains: [
      'pinterest.com',
      'quora.com',
      'answers.yahoo.com',
      'contentfarm.example',
      'unverified-forum.example',
    ],
    preferredSourceTypes,
    estimatedDifficulty,
    minimumCorroboratingSources,
    planCreatedTimestamp: Date.now(),
  };
}
