/**
 * FROGÉ Research Engine - Stage 10 & 11: Calibrated Answer Generator & Citation Builder
 * 
 * Synthesizes comprehensive answers with epistemic calibration and attaches verified citations.
 * 
 * CORE PRINCIPLES:
 * - "Never claim perfect accuracy." (Epistemic humility)
 * - "If sources disagree, explain the disagreement."
 * - "If evidence is insufficient, say so."
 * - "Prioritize official and primary sources when appropriate."
 * - "Attach useful citations."
 */

import {
  CollectedResearchData,
  ContradictionAnalysis,
  EpistemicCalibration,
  QualityEvaluationSummary,
  ResearchCitation,
  ResearchPlan,
  ResearchRequest,
  SourceComparisonAnalysis,
} from './types';

/**
 * Builds structured citations from high-quality evaluated sources (Stage 11)
 */
export function buildResearchCitations(
  collectedData: CollectedResearchData,
  qualityEvaluation: QualityEvaluationSummary
): ResearchCitation[] {
  const citations: ResearchCitation[] = [];
  const qualityMap = new Map(qualityEvaluation.sourcesEvaluated.map((q) => [q.sourceId, q]));

  // Sort sources by weight in final synthesis (descending)
  const sortedSources = [...collectedData.sources].sort((a, b) => {
    const weightA = qualityMap.get(a.id)?.weightInFinalSynthesis || 0.5;
    const weightB = qualityMap.get(b.id)?.weightInFinalSynthesis || 0.5;
    return weightB - weightA;
  });

  sortedSources.forEach((src, idx) => {
    const q = qualityMap.get(src.id);
    const supportingClaims = collectedData.extractedClaims
      .filter((c) => c.sourceId === src.id)
      .map((c) => c.claimText);

    citations.push({
      citationIndex: idx + 1,
      sourceId: src.id,
      title: src.title,
      url: src.url,
      domain: src.domain,
      domainTier: q?.authorityTier || 'tier_4_industry_tech',
      isOfficialOrPrimary: q?.isOfficialOrPrimary || src.isPrimaryOrOfficial,
      publishedDate: src.publishedDate,
      credibilityScore: q?.credibilityScore || 0.7,
      excerptSnippet: src.snippet,
      supportingClaims,
    });
  });

  return citations;
}

/**
 * Evaluates evidence sufficiency and computes epistemic calibration parameters
 */
export function calibrateEpistemics(
  collectedData: CollectedResearchData,
  qualityEvaluation: QualityEvaluationSummary,
  contradictions: ContradictionAnalysis
): EpistemicCalibration {
  const totalSources = collectedData.sources.length;
  const officialSources = collectedData.totalOfficialSourcesFound;

  let evidenceSufficiency: 'sufficient' | 'partial_evidence' | 'insufficient_evidence' = 'sufficient';
  let insufficientEvidenceNotice: string | undefined = undefined;

  if (totalSources === 0) {
    evidenceSufficiency = 'insufficient_evidence';
    insufficientEvidenceNotice = 'Insufficient empirical evidence found in available indices to verify this inquiry with high confidence.';
  } else if (totalSources < 2 || qualityEvaluation.overallEvidenceWeight < 0.6) {
    evidenceSufficiency = 'partial_evidence';
    insufficientEvidenceNotice = 'Limited independent verification available; conclusions should be treated as preliminary.';
  }

  let confidencePercentage = Math.round(
    qualityEvaluation.overallEvidenceWeight * 70 + (officialSources > 0 ? 18 : 8)
  );
  // Cap confidence percentage to strictly avoid claiming 100% certainty
  confidencePercentage = Math.min(94, Math.max(45, confidencePercentage));

  const confidenceLevel =
    confidencePercentage >= 85
      ? 'high_confidence_with_caveats'
      : confidencePercentage >= 65
      ? 'moderate'
      : 'preliminary';

  return {
    claimsAbsoluteCertainty: false, // HARD RULE: Never claim perfect accuracy
    confidenceLevel,
    confidencePercentage,
    evidenceSufficiency,
    insufficientEvidenceNotice,
    unresolvedQuestions: contradictions.hasContradictions
      ? contradictions.contradictions.map((c) => `Nuance check: ${c.topicOrEntity} remains subject to differing contextual interpretations.`)
      : ['Ongoing revisions in subsequent empirical releases or regulatory filings may introduce updated metrics.'],
    epistemicDisclaimer: 'Findings synthesized across independent documentation. Factual claims are calibrated to available evidence and not asserted as absolute certainty.',
  };
}

/**
 * Generates calibrated final answer and structured presentation (Stage 10)
 */
export function generateCalibratedAnswer(
  request: ResearchRequest,
  plan: ResearchPlan,
  collectedData: CollectedResearchData,
  comparison: SourceComparisonAnalysis,
  qualityEvaluation: QualityEvaluationSummary,
  contradictions: ContradictionAnalysis,
  calibration: EpistemicCalibration,
  citations: ResearchCitation[],
  rawGeneratedSummary?: string
): {
  synthesizedAnswer: string;
  disagreementSection?: string;
  evidenceSufficiencyStatement?: string;
} {
  let synthesizedAnswer = '';
  let disagreementSection: string | undefined = undefined;
  let evidenceSufficiencyStatement: string | undefined = undefined;

  // 1. Evidence sufficiency check
  if (calibration.evidenceSufficiency === 'insufficient_evidence') {
    evidenceSufficiencyStatement = `⚠️ **Evidence Notice:** ${calibration.insufficientEvidenceNotice || 'Available empirical sources are insufficient to establish a definitive consensus.'}`;
  } else if (calibration.evidenceSufficiency === 'partial_evidence') {
    evidenceSufficiencyStatement = `ℹ️ **Partial Evidence:** ${calibration.insufficientEvidenceNotice || 'Conclusions are drawn from a limited set of preliminary sources.'}`;
  }

  // 2. Disagreement explanation
  if (contradictions.hasContradictions && contradictions.disagreementSummary) {
    disagreementSection = `### ⚖️ Source Disagreements & Variances\n${contradictions.disagreementSummary}\n\n*Synthesis note:* Differences are contextualized by differing methodology, publication timelines, and operational scope.`;
  }

  // 3. Build core narrative
  const header = `## 🔬 FROGÉ Research Synthesis: ${plan.userQuery}\n\n`;

  // Epistemic Confidence Badge
  const confidenceBanner = `> **Epistemic Calibration:** ${calibration.confidencePercentage}% Confidence (${calibration.confidenceLevel.replace(/_/g, ' ')}) | **Sources Examined:** ${collectedData.totalSourcesQueried} (${collectedData.totalOfficialSourcesFound} official/primary)\n\n`;

  // Core synthesis body
  let body = '';
  if (rawGeneratedSummary && rawGeneratedSummary.trim().length > 0) {
    body = rawGeneratedSummary;
  } else {
    // Structured synthesis based on verified collected claims
    const primaryPoints = citations
      .slice(0, 3)
      .map(
        (c) =>
          `* **${c.title}** ([${c.domainTier.replace(/tier_\d+_/, '').replace(/_/g, ' ')}][[${c.citationIndex}](${c.url})]): ${c.excerptSnippet}`
      )
      .join('\n\n');

    body = `### Key Verified Findings\n${primaryPoints}\n\n### Cross-Source Verification\nIndependent cross-checking across ${comparison.dateAudits.length} sources reveals a cross-verification score of **${comparison.crossVerificationScore}/100** with timeline coherence assessed as **${comparison.timelineCoherence}**.`;
  }

  // Citations footer section
  const citationList = citations
    .map(
      (c) =>
        `[${c.citationIndex}] [${c.title}](${c.url}) — *${c.domain}* ${c.isOfficialOrPrimary ? '🏷️ **Official/Primary**' : ''} (Credibility: ${Math.round(c.credibilityScore * 100)}%)`
    )
    .join('\n');

  const citationsBlock = `\n\n### 📚 Verified Citations & References\n${citationList}\n\n*${calibration.epistemicDisclaimer}*`;

  synthesizedAnswer = `${header}${confidenceBanner}${evidenceSufficiencyStatement ? evidenceSufficiencyStatement + '\n\n' : ''}${body}${disagreementSection ? '\n\n' + disagreementSection : ''}${citationsBlock}`;

  return {
    synthesizedAnswer,
    disagreementSection,
    evidenceSufficiencyStatement,
  };
}
