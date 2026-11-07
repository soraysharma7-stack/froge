/**
 * FROGÉ News Verification Layer - Type Definitions
 * 
 * Specifically designed for current-news, recent events, product announcements,
 * price inquiries, and today's information.
 * 
 * Enforces strict disaggregation into:
 * - 🟢 FACT (Verified empirical facts from primary/official records)
 * - 🟡 INFERENCE (Logical deductions, extrapolations, market projections)
 * - 🔴 UNCERTAINTY (Unconfirmed reports, date ambiguities, conflicting metrics)
 * 
 * Strict constraint: NEVER invent news, sources, or citations.
 */

export type CurrentNewsCategory =
  | 'latest_news'
  | 'current_events'
  | 'recent_announcements'
  | 'current_prices'
  | 'new_products'
  | 'todays_information'
  | 'general_temporal';

export interface NewsTriggerDetection {
  isCurrentNewsQuery: boolean;
  detectedCategories: CurrentNewsCategory[];
  matchedKeywords: string[];
  requiresLiveVerification: boolean;
  freshnessThresholdHours: number; // e.g., 24 for breaking, 720 for recent product
  query: string;
}

export type SourceAuthorityLevel =
  | 'tier_1_primary_official' // Direct company press release, statutory filing, government wire
  | 'tier_2_major_wire'       // Reuters, AP, Bloomberg, Dow Jones
  | 'tier_3_verified_media'   // Major established journalism, specialized tech publication
  | 'tier_4_secondary_blog'   // Industry blogs, aggregate portals
  | 'tier_5_unverified_social'; // Social media rumors, unverified forums

export interface NewsSourceEvidence {
  id: string;
  sourceName: string;
  domain: string;
  url: string;
  headline: string;
  excerptSnippet: string;
  publicationDate: string; // ISO or YYYY-MM-DD
  publicationTimestamp: number;
  ageInHours: number;
  authorityLevel: SourceAuthorityLevel;
  isPrimarySource: boolean;
  reputationScore: number; // 0.0 to 1.0
  isStaleForQuery: boolean;
}

export interface FactItem {
  id: string;
  statement: string;
  primarySourceIds: string[];
  verificationTimestamp: string;
  empiricalMetric?: string;
  confidenceScore: number; // 0.0 to 1.0 (Facts require >= 0.85 from trusted sources)
}

export interface InferenceItem {
  id: string;
  statement: string;
  premiseFacts: string[];
  logicalBasis: string;
  likelihood: 'high_probability' | 'moderate_likelihood' | 'speculative_projection';
}

export interface UncertaintyItem {
  id: string;
  statement: string;
  uncertaintyReason:
    | 'missing_primary_source'
    | 'conflicting_source_reports'
    | 'rapidly_fluctuating_metric'
    | 'unverified_leak_or_rumor'
    | 'temporal_staleness';
  contestedDetails?: string;
  recommendedVerificationStep: string;
}

export interface SourceAgreementAudit {
  sourcesAnalyzed: number;
  primarySourcesFound: number;
  hasConsensus: boolean;
  agreementScore: number; // 0 to 100
  disagreementsIdentified: Array<{
    parameter: string;
    viewpointA: { source: string; claim: string; date: string };
    viewpointB: { source: string; claim: string; date: string };
    analysis: string;
  }>;
}

export interface NewsVerificationResult {
  query: string;
  timestamp: string;
  trigger: NewsTriggerDetection;
  sources: NewsSourceEvidence[];
  sourceAgreement: SourceAgreementAudit;
  primarySourceAvailable: boolean;
  
  // Tri-partite epistemic disaggregation
  facts: FactItem[];
  inferences: InferenceItem[];
  uncertainties: UncertaintyItem[];
  
  // Synthesized output
  epistemicConfidenceScore: number; // 0 - 100 (never 100 to prevent overconfidence)
  formattedSynthesis: string;
  disclaimer: string;
  simulated: boolean;
}
