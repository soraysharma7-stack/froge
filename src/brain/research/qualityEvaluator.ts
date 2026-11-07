/**
 * FROGÉ Research Engine - Stage 8: Source Quality Evaluator
 * 
 * Assesses the quality, authority tier, and institutional credibility of each source.
 * Assigns weight in final synthesis and filters low-credibility scrapers.
 * 
 * CORE PRINCIPLE:
 * - "Prioritize official and primary sources when appropriate."
 * - "Do not treat search results as automatically true."
 */

import {
  DomainAuthorityTier,
  EvaluatedSourceQuality,
  QualityEvaluationSummary,
  RawSourceItem,
} from './types';

export function evaluateSourceQuality(sources: RawSourceItem[]): QualityEvaluationSummary {
  const evaluatedSources: EvaluatedSourceQuality[] = [];
  let lowCredibilityFilterCount = 0;

  for (const src of sources) {
    const domain = src.domain.toLowerCase();
    let authorityTier: DomainAuthorityTier = 'tier_unknown';
    let credibilityScore = 0.5;
    const reliabilityFactors: string[] = [];
    let riskOrBiasNotes: string | undefined = undefined;

    // 1. Tier 1: Official & Primary (.gov, .edu, statutory, official doc subdomains, standards orgs)
    if (
      domain.endsWith('.gov') ||
      domain.endsWith('.mil') ||
      domain.includes('w3.org') ||
      domain.includes('ietf.org') ||
      domain.includes('iso.org') ||
      domain.includes('ieee.org') ||
      domain.includes('who.int') ||
      domain.includes('un.org') ||
      domain.includes('react.dev') ||
      domain.includes('typescriptlang.org') ||
      domain.includes('python.org') ||
      domain.includes('docs.')
    ) {
      authorityTier = 'tier_1_official_primary';
      credibilityScore = 0.96;
      reliabilityFactors.push('Primary institutional publisher', 'Official technical standard / statutory record');
    }
    // 2. Tier 2: Peer-reviewed academic & scientific journals
    else if (
      domain.endsWith('.edu') ||
      domain.includes('nature.com') ||
      domain.includes('science.org') ||
      domain.includes('ncbi.nlm.nih') ||
      domain.includes('nejm.org') ||
      domain.includes('arxiv.org') ||
      domain.includes('thelancet.com')
    ) {
      authorityTier = 'tier_2_peer_reviewed';
      credibilityScore = 0.92;
      reliabilityFactors.push('Peer-reviewed scientific validation', 'Formal academic methodology');
    }
    // 3. Tier 3: Reputable journalism & wire services
    else if (
      domain.includes('reuters.com') ||
      domain.includes('apnews.com') ||
      domain.includes('bloomberg.com') ||
      domain.includes('bbc.com') ||
      domain.includes('wsj.com') ||
      domain.includes('ft.com')
    ) {
      authorityTier = 'tier_3_reputable_press';
      credibilityScore = 0.84;
      reliabilityFactors.push('Editorial review board', 'Secondary corroboration standards');
    }
    // 4. Tier 4: Verified tech blogs & industry whitepapers
    else if (
      domain.includes('github.com') ||
      domain.includes('medium.com') ||
      domain.includes('dev.to') ||
      domain.includes('techcrunch.com') ||
      domain.includes('theverge.com')
    ) {
      authorityTier = 'tier_4_industry_tech';
      credibilityScore = 0.72;
      reliabilityFactors.push('Practitioner perspective', 'Active engineering community');
      riskOrBiasNotes = 'May reflect specific vendor viewpoint or preliminary developer notes.';
    }
    // 5. Tier 5: Aggregators, forums, unverified scrapers
    else if (
      domain.includes('quora.com') ||
      domain.includes('reddit.com') ||
      domain.includes('yahoo.com') ||
      domain.includes('pinterest.com') ||
      domain.includes('forum')
    ) {
      authorityTier = 'tier_5_aggregator_forum';
      credibilityScore = 0.35;
      riskOrBiasNotes = 'Unverified user-generated submission. Excluded from primary factual reliance.';
      lowCredibilityFilterCount++;
    } else {
      authorityTier = 'tier_4_industry_tech';
      credibilityScore = 0.68;
      reliabilityFactors.push('Web indexed source');
    }

    // Calculate synthesis weight (0.0 to 1.0)
    let weightInFinalSynthesis = credibilityScore;
    if (src.isPrimaryOrOfficial) {
      weightInFinalSynthesis = Math.min(1.0, weightInFinalSynthesis * 1.15);
    }

    evaluatedSources.push({
      sourceId: src.id,
      url: src.url,
      domain: src.domain,
      authorityTier,
      credibilityScore,
      isOfficialOrPrimary: authorityTier === 'tier_1_official_primary' || src.isPrimaryOrOfficial,
      reliabilityFactors,
      riskOrBiasNotes,
      weightInFinalSynthesis: Number(weightInFinalSynthesis.toFixed(2)),
    });
  }

  // Summary statistics
  const totalCredibility = evaluatedSources.reduce((acc, s) => acc + s.credibilityScore, 0);
  const overallEvidenceWeight = evaluatedSources.length > 0
    ? Number((totalCredibility / evaluatedSources.length).toFixed(2))
    : 0.5;

  const officialCount = evaluatedSources.filter((s) => s.isOfficialOrPrimary).length;
  const officialPrimaryRatio = evaluatedSources.length > 0
    ? Number((officialCount / evaluatedSources.length).toFixed(2))
    : 0;

  return {
    sourcesEvaluated: evaluatedSources,
    overallEvidenceWeight,
    officialPrimaryRatio,
    lowCredibilityFilterCount,
  };
}
