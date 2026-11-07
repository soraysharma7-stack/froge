/**
 * FROGÉ Research Engine - Type Definitions
 * 
 * Modular research architecture powering FROGÉ Research, Deep Thinking,
 * Student Mode, and MAX.
 *
 * 11-Stage Workflow:
 * 1. User question
 * 2. Determine whether current information is needed
 * 3. Create research plan
 * 4. Search sources
 * 5. Collect information
 * 6. Compare sources
 * 7. Check dates
 * 8. Evaluate source quality
 * 9. Detect contradictions
 * 10. Generate answer (with epistemic calibration)
 * 11. Attach useful citations
 */

import { FrogeModeId } from '../../types';

// ============================================================================
// 1. RESEARCH REQUEST & RELEVANCE
// ============================================================================
export interface ResearchRequest {
  query: string;
  mode?: FrogeModeId | 'research-mode';
  depth?: 'quick' | 'standard' | 'deep' | 'exhaustive';
  requireOfficialSources?: boolean;
  targetDomains?: string[];
  freshnessWindowDays?: number;
  maxSourcesToInspect?: number;
  callerModule?: 'standalone' | 'deep-thinking' | 'student-mode' | 'max' | 'code';
}

// ============================================================================
// 2. RECENCY & CURRENT INFORMATION NEED
// ============================================================================
export type RecencyRequirement =
  | 'realtime_critical' // Needs latest hours/days (breaking events, stock prices, live stats)
  | 'recent_updates'    // Needs recent months/year (current versions, modern laws, roadmap status)
  | 'historical_fixed'  // Static/historical facts (Newton's laws, 1776 events)
  | 'conceptual_theory' // Pure reasoning / logic / math concepts
  | 'hybrid_temporal';  // Evergreen theory with modern developments

export interface RecencyNeedAnalysis {
  requiresCurrentInfo: boolean;
  recencyCategory: RecencyRequirement;
  confidenceScore: number; // 0.0 - 1.0
  temporalKeywordsFound: string[];
  referenceDate: string; // e.g. "2026-08-30"
  rationale: string;
  suggestedFreshnessWindowDays?: number;
}

// ============================================================================
// 3. RESEARCH PLAN & SEARCH STRATEGY
// ============================================================================
export type SourceCategoryPreference =
  | 'official_docs'
  | 'peer_reviewed_academic'
  | 'government_statutory'
  | 'primary_organization'
  | 'industry_benchmarks'
  | 'reputable_journalism'
  | 'technical_community';

export interface ResearchSubQuery {
  id: string;
  query: string;
  focusArea: string;
  targetedSourceType: SourceCategoryPreference;
  priority: 1 | 2 | 3;
}

export interface ResearchPlan {
  planId: string;
  userQuery: string;
  primaryHypothesis: string;
  subQueries: ResearchSubQuery[];
  targetDomains: string[];
  excludedDomains: string[];
  preferredSourceTypes: SourceCategoryPreference[];
  estimatedDifficulty: 'lean' | 'moderate' | 'intensive';
  minimumCorroboratingSources: number;
  planCreatedTimestamp: number;
}

// ============================================================================
// 4 & 5. SOURCE SEARCH & INFORMATION EXTRACTION
// ============================================================================
export interface RawSourceItem {
  id: string;
  url: string;
  title: string;
  domain: string;
  snippet: string;
  fullExcerpt?: string;
  authorOrPublisher?: string;
  publishedDate?: string;
  indexedTimestamp: number;
  sourceCategory: SourceCategoryPreference;
  isPrimaryOrOfficial: boolean;
  httpStatus?: number;
}

export interface ExtractedFactClaim {
  id: string;
  sourceId: string;
  claimText: string;
  extractedEntity?: string;
  numericValues?: Array<{ metric: string; value: number | string }>;
  statedDateOrTimeframe?: string;
  confidenceInExtraction: number;
  isExplicitStatement: boolean;
}

export interface CollectedResearchData {
  sources: RawSourceItem[];
  extractedClaims: ExtractedFactClaim[];
  totalSourcesQueried: number;
  totalOfficialSourcesFound: number;
  collectionTimestamp: number;
}

// ============================================================================
// 6 & 7. SOURCE COMPARISON, TIMELINES & DATE AUDIT
// ============================================================================
export interface DateAuditResult {
  sourceId: string;
  extractedDate?: string;
  isRecent: boolean;
  ageInDays?: number;
  isPotentiallyStale: boolean;
  temporalRelevanceScore: number; // 0.0 to 1.0
  notes: string;
}

export interface ClaimCorroboration {
  claimSummary: string;
  supportingSourceIds: string[];
  opposingSourceIds: string[];
  neutralOrAmbiguousSourceIds: string[];
  corroborationScore: number; // 0.0 to 1.0
  isConsensus: boolean;
}

export interface SourceComparisonAnalysis {
  crossVerificationScore: number; // 0 to 100
  claimCorroborations: ClaimCorroboration[];
  dateAudits: DateAuditResult[];
  mostRecentSourceDate?: string;
  oldestSourceDate?: string;
  timelineCoherence: 'high' | 'moderate' | 'conflicting';
}

// ============================================================================
// 8. SOURCE QUALITY & CREDIBILITY EVALUATION
// ============================================================================
export type DomainAuthorityTier =
  | 'tier_1_official_primary' // .gov, .edu, official doc subdomains, standards orgs
  | 'tier_2_peer_reviewed'    // scientific journals, top institutional research
  | 'tier_3_reputable_press'  // Reuters, AP, Bloomberg, nature, ieee
  | 'tier_4_industry_tech'    // verified tech blogs, corporate whitepapers
  | 'tier_5_aggregator_forum' // social forums, content farms, unverified scrapers
  | 'tier_unknown';

export interface EvaluatedSourceQuality {
  sourceId: string;
  url: string;
  domain: string;
  authorityTier: DomainAuthorityTier;
  credibilityScore: number; // 0.0 to 1.0
  isOfficialOrPrimary: boolean;
  reliabilityFactors: string[];
  riskOrBiasNotes?: string;
  weightInFinalSynthesis: number; // 0.0 to 1.0
}

export interface QualityEvaluationSummary {
  sourcesEvaluated: EvaluatedSourceQuality[];
  overallEvidenceWeight: number; // 0.0 to 1.0
  officialPrimaryRatio: number; // e.g. 0.6 = 60%
  lowCredibilityFilterCount: number;
}

// ============================================================================
// 9. CONTRADICTION & DISAGREEMENT DETECTION
// ============================================================================
export type ContradictionSeverity = 'minor_nuance' | 'divergent_data' | 'direct_conflict';

export interface DetectedContradiction {
  id: string;
  topicOrEntity: string;
  severity: ContradictionSeverity;
  claimA: {
    text: string;
    sourceIds: string[];
    sourceTypes: string[];
    statedDate?: string;
  };
  claimB: {
    text: string;
    sourceIds: string[];
    sourceTypes: string[];
    statedDate?: string;
  };
  disagreementExplanation: string;
  likelyReasonForDiscrepancy:
    | 'chronological_shift'    // newer vs older data
    | 'methodological_difference' // differing metrics / survey methodology
    | 'definitional_variance'   // different definitions used
    | 'unverified_rumor'        // secondary reporting error
    | 'inherent_scientific_debate';
  recommendedSynthesisApproach: string;
}

export interface ContradictionAnalysis {
  hasContradictions: boolean;
  contradictions: DetectedContradiction[];
  disagreementSummary?: string;
  requiresExplicitDivergenceNotice: boolean;
}

// ============================================================================
// 10 & 11. CALIBRATED ANSWER GENERATION & CITATIONS
// ============================================================================
export interface ResearchCitation {
  citationIndex: number;
  sourceId: string;
  title: string;
  url: string;
  domain: string;
  domainTier: DomainAuthorityTier;
  isOfficialOrPrimary: boolean;
  publishedDate?: string;
  credibilityScore: number;
  excerptSnippet: string;
  supportingClaims: string[];
}

export interface EpistemicCalibration {
  claimsAbsoluteCertainty: false; // HARD RULE: Never claim perfect accuracy
  confidenceLevel: 'preliminary' | 'moderate' | 'high_confidence_with_caveats';
  confidencePercentage: number;
  evidenceSufficiency: 'sufficient' | 'partial_evidence' | 'insufficient_evidence';
  insufficientEvidenceNotice?: string;
  unresolvedQuestions: string[];
  epistemicDisclaimer: string;
}

export interface ResearchWorkflowOutput {
  requestId: string;
  userQuery: string;
  timestamp: string;
  durationMs: number;
  
  // Pipeline Step Artifacts
  recencyNeed: RecencyNeedAnalysis;
  plan: ResearchPlan;
  collectedData: CollectedResearchData;
  sourceComparison: SourceComparisonAnalysis;
  qualityEvaluation: QualityEvaluationSummary;
  contradictionAnalysis: ContradictionAnalysis;
  epistemicCalibration: EpistemicCalibration;
  
  // Final Synthesized Result
  synthesizedAnswer: string;
  citations: ResearchCitation[];
  disagreementSection?: string;
  evidenceSufficiencyStatement?: string;
  
  // Modularity & Integration Metadata
  consumerModule: 'standalone' | 'deep-thinking' | 'student-mode' | 'max' | 'code';
  researchFootprintTokens: number;
}
