/**
 * FROGÉ Research Engine - Automated Test Suite
 * 
 * Verifies all 11 stages of the FROGÉ Research Architecture:
 * 1. User question intake
 * 2. Recency & current information need determination
 * 3. Structured research planning & sub-query generation
 * 4. Multi-angle source searching
 * 5. Structured information & claim collection
 * 6. Cross-source comparison & corroboration
 * 7. Date auditing & timeline verification
 * 8. Source quality & authority tier evaluation
 * 9. Contradiction & discrepancy detection with explanations
 * 10. Calibrated answer synthesis (never claiming 100% certainty, handling insufficient evidence)
 * 11. Useful citation building & modular multi-mode interoperability
 */

import { determineRecencyNeed } from './recencyDetector';
import { createResearchPlan } from './researchPlanner';
import { classifyDomainCategory, searchAndCollectSources } from './sourceSearcher';
import { auditSourceDates, compareSourcesAndCorroborate } from './sourceComparator';
import { evaluateSourceQuality } from './qualityEvaluator';
import { detectContradictions } from './contradictionDetector';
import { calibrateEpistemics, generateCalibratedAnswer, buildResearchCitations } from './answerSynthesizer';
import { frogeResearchEngine } from './researchEngine';

export interface ResearchTestResult {
  testId: string;
  name: string;
  stage: string;
  status: 'passed' | 'failed';
  durationMs: number;
  details: string;
  diagnosticData?: any;
}

export interface ResearchTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
  results: ResearchTestResult[];
}

export async function runResearchTestSuite(): Promise<ResearchTestSuiteSummary> {
  const results: ResearchTestResult[] = [];

  // Test 1: Stage 2 - Recency Need Detection (Current vs Evergreen vs Historical)
  const t1Start = Date.now();
  try {
    const liveCheck = determineRecencyNeed('What is the current price of Ethereum today in 2026?');
    const histCheck = determineRecencyNeed('Who was the first president of the United States in 1789?');
    const conceptCheck = determineRecencyNeed('Explain how binary search tree balancing works in computer science');

    const passed =
      liveCheck.requiresCurrentInfo === true &&
      liveCheck.recencyCategory === 'realtime_critical' &&
      histCheck.requiresCurrentInfo === false &&
      histCheck.recencyCategory === 'historical_fixed' &&
      conceptCheck.requiresCurrentInfo === false &&
      conceptCheck.recencyCategory === 'conceptual_theory';

    results.push({
      testId: 'TEST_RES_01',
      name: 'Recency & Current Information Need Detection',
      stage: 'Stage 2: Determine Need for Current Information',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t1Start,
      details: passed
        ? 'Correctly discriminated real-time queries from historical and conceptual requests.'
        : 'Recency classification failed.',
      diagnosticData: { liveCheck, histCheck, conceptCheck },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_01',
      name: 'Recency & Current Information Need Detection',
      stage: 'Stage 2',
      status: 'failed',
      durationMs: Date.now() - t1Start,
      details: `Exception: ${err.message}`,
    });
  }

  // Test 2: Stage 3 - Structured Research Plan & Sub-Query Decomposition
  const t2Start = Date.now();
  try {
    const plan = createResearchPlan({
      query: 'Evaluate FDA approval requirements for mRNA therapeutics and clinical trials',
      depth: 'deep',
    });

    const passed =
      plan.subQueries.length >= 3 &&
      plan.targetDomains.some((d) => d.includes('fda.gov') || d.includes('nih.gov')) &&
      plan.preferredSourceTypes.includes('peer_reviewed_academic');

    results.push({
      testId: 'TEST_RES_02',
      name: 'Structured Multi-Query Research Planning',
      stage: 'Stage 3: Create Research Plan',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t2Start,
      details: `Generated ${plan.subQueries.length} targeted sub-queries with domain routing.`,
      diagnosticData: { plan },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_02',
      name: 'Structured Multi-Query Research Planning',
      stage: 'Stage 3',
      status: 'failed',
      durationMs: Date.now() - t2Start,
      details: `Exception: ${err.message}`,
    });
  }

  // Test 3: Stage 4 & 5 - Official & Primary Source Prioritization & Collection
  const t3Start = Date.now();
  try {
    const govCat = classifyDomainCategory('cdc.gov');
    const eduCat = classifyDomainCategory('mit.edu');
    const forumCat = classifyDomainCategory('reddit.com');

    const plan = createResearchPlan({
      query: 'Quantum entanglement decoherence time in superconducting qubits',
      depth: 'standard',
    });
    const collected = await searchAndCollectSources(plan, { query: plan.userQuery });

    const passed =
      govCat.isPrimaryOrOfficial === true &&
      eduCat.isPrimaryOrOfficial === true &&
      forumCat.isPrimaryOrOfficial === false &&
      collected.sources.length >= 2 &&
      collected.extractedClaims.length >= 2 &&
      collected.totalOfficialSourcesFound >= 1;

    results.push({
      testId: 'TEST_RES_03',
      name: 'Official & Primary Source Prioritization',
      stage: 'Stages 4 & 5: Search & Collect Information',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t3Start,
      details: `Collected ${collected.sources.length} sources with ${collected.totalOfficialSourcesFound} official/primary sources prioritized.`,
      diagnosticData: { govCat, eduCat, forumCat, totalCollected: collected.sources.length },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_03',
      name: 'Official & Primary Source Prioritization',
      stage: 'Stages 4 & 5',
      status: 'failed',
      durationMs: Date.now() - t3Start,
      details: `Exception: ${err.message}`,
    });
  }

  // Test 4: Stage 6 & 7 - Source Comparison, Date Checking & Timeline Audit
  const t4Start = Date.now();
  try {
    const mockSources = [
      {
        id: 's1',
        url: 'https://ieee.org/spec',
        title: 'IEEE Spec 2026',
        domain: 'ieee.org',
        snippet: 'Recent 2026 standard specification.',
        publishedDate: '2026-06-01',
        indexedTimestamp: Date.now(),
        sourceCategory: 'official_docs' as const,
        isPrimaryOrOfficial: true,
      },
      {
        id: 's2',
        url: 'https://reuters.com/news',
        title: 'Reuters Tech Overview 2023',
        domain: 'reuters.com',
        snippet: 'Archival report on early deployment.',
        publishedDate: '2023-01-10',
        indexedTimestamp: Date.now(),
        sourceCategory: 'reputable_journalism' as const,
        isPrimaryOrOfficial: false,
      },
    ];

    const datesAudit = auditSourceDates(mockSources);
    const comparison = compareSourcesAndCorroborate({
      sources: mockSources,
      extractedClaims: [],
      totalSourcesQueried: 2,
      totalOfficialSourcesFound: 1,
      collectionTimestamp: Date.now(),
    });

    const passed =
      datesAudit[0].isRecent === true &&
      datesAudit[1].isPotentiallyStale === true &&
      comparison.crossVerificationScore > 0 &&
      comparison.timelineCoherence === 'high';

    results.push({
      testId: 'TEST_RES_04',
      name: 'Cross-Source Comparison & Date Checking',
      stage: 'Stages 6 & 7: Compare Sources & Check Dates',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t4Start,
      details: 'Correctly audited source timestamps, identified stale vs recent data, and computed cross-verification score.',
      diagnosticData: { datesAudit, crossScore: comparison.crossVerificationScore },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_04',
      name: 'Cross-Source Comparison & Date Checking',
      stage: 'Stages 6 & 7',
      status: 'failed',
      durationMs: Date.now() - t4Start,
      details: `Exception: ${err.message}`,
    });
  }

  // Test 5: Stage 8 - Source Quality & Authority Tier Evaluation
  const t5Start = Date.now();
  try {
    const mockSources = [
      {
        id: 's1',
        url: 'https://nih.gov/report',
        title: 'NIH Report',
        domain: 'nih.gov',
        snippet: 'NIH clinical study.',
        sourceCategory: 'government_statutory' as const,
        isPrimaryOrOfficial: true,
        indexedTimestamp: Date.now(),
      },
      {
        id: 's2',
        url: 'https://unverified-forum.com/post',
        title: 'User Post',
        domain: 'unverified-forum.com',
        snippet: 'Informal user anecdote.',
        sourceCategory: 'technical_community' as const,
        isPrimaryOrOfficial: false,
        indexedTimestamp: Date.now(),
      },
    ];

    const qualityEval = evaluateSourceQuality(mockSources);
    const s1Eval = qualityEval.sourcesEvaluated.find((s) => s.sourceId === 's1');
    const s2Eval = qualityEval.sourcesEvaluated.find((s) => s.sourceId === 's2');

    const passed =
      s1Eval?.authorityTier === 'tier_1_official_primary' &&
      s1Eval.credibilityScore >= 0.9 &&
      s1Eval.weightInFinalSynthesis > (s2Eval?.weightInFinalSynthesis || 0);

    results.push({
      testId: 'TEST_RES_05',
      name: 'Source Quality & Credibility Evaluation',
      stage: 'Stage 8: Evaluate Source Quality',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t5Start,
      details: 'Assigned top authority tier to statutory/official domains and computed weighted synthesis priority.',
      diagnosticData: { qualityEval },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_05',
      name: 'Source Quality & Credibility Evaluation',
      stage: 'Stage 8',
      status: 'failed',
      durationMs: Date.now() - t5Start,
      details: `Exception: ${err.message}`,
    });
  }

  // Test 6: Stage 9 - Contradiction & Disagreement Detection
  const t6Start = Date.now();
  try {
    const mockSources = [
      {
        id: 's_old',
        url: 'https://arxiv.org/2021',
        title: '2021 Early Model Baseline',
        domain: 'arxiv.org',
        snippet: 'Preliminary accuracy bounded at 82.5%.',
        publishedDate: '2021-03-01',
        indexedTimestamp: Date.now(),
        sourceCategory: 'peer_reviewed_academic' as const,
        isPrimaryOrOfficial: true,
      },
      {
        id: 's_new',
        url: 'https://nature.com/2026',
        title: '2026 State of the Art Update',
        domain: 'nature.com',
        snippet: 'Enhanced methodology achieves 97.8% verified accuracy.',
        publishedDate: '2026-05-15',
        indexedTimestamp: Date.now(),
        sourceCategory: 'peer_reviewed_academic' as const,
        isPrimaryOrOfficial: true,
      },
    ];

    const comparison = compareSourcesAndCorroborate({
      sources: mockSources,
      extractedClaims: [],
      totalSourcesQueried: 2,
      totalOfficialSourcesFound: 2,
      collectionTimestamp: Date.now(),
    });

    const contradictions = detectContradictions(
      {
        sources: mockSources,
        extractedClaims: [],
        totalSourcesQueried: 2,
        totalOfficialSourcesFound: 2,
        collectionTimestamp: Date.now(),
      },
      comparison
    );

    const passed =
      contradictions.hasContradictions === true &&
      contradictions.contradictions.some((c) => c.likelyReasonForDiscrepancy === 'chronological_shift') &&
      typeof contradictions.disagreementSummary === 'string';

    results.push({
      testId: 'TEST_RES_06',
      name: 'Contradiction & Disagreement Detection',
      stage: 'Stage 9: Detect Contradictions',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t6Start,
      details: 'Detected chronological discrepancy between historical and modern sources and formulated divergence explanation.',
      diagnosticData: { contradictions },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_06',
      name: 'Contradiction & Disagreement Detection',
      stage: 'Stage 9',
      status: 'failed',
      durationMs: Date.now() - t6Start,
      details: `Exception: ${err.message}`,
    });
  }

  // Test 7: Stage 10 - Epistemic Calibration (Never claim 100% certainty, handle insufficient evidence)
  const t7Start = Date.now();
  try {
    // Zero sources case -> insufficient evidence
    const emptyCalibration = calibrateEpistemics(
      { sources: [], extractedClaims: [], totalSourcesQueried: 0, totalOfficialSourcesFound: 0, collectionTimestamp: Date.now() },
      { sourcesEvaluated: [], overallEvidenceWeight: 0, officialPrimaryRatio: 0, lowCredibilityFilterCount: 0 },
      { hasContradictions: false, contradictions: [], requiresExplicitDivergenceNotice: false }
    );

    // Standard sources case -> capped certainty
    const standardCalibration = calibrateEpistemics(
      {
        sources: [
          {
            id: 's1',
            url: 'https://who.int',
            title: 'WHO',
            domain: 'who.int',
            snippet: 'Test',
            indexedTimestamp: Date.now(),
            sourceCategory: 'primary_organization',
            isPrimaryOrOfficial: true,
          },
        ],
        extractedClaims: [],
        totalSourcesQueried: 1,
        totalOfficialSourcesFound: 1,
        collectionTimestamp: Date.now(),
      },
      { sourcesEvaluated: [], overallEvidenceWeight: 0.95, officialPrimaryRatio: 1.0, lowCredibilityFilterCount: 0 },
      { hasContradictions: false, contradictions: [], requiresExplicitDivergenceNotice: false }
    );

    const passed =
      emptyCalibration.evidenceSufficiency === 'insufficient_evidence' &&
      emptyCalibration.claimsAbsoluteCertainty === false &&
      standardCalibration.claimsAbsoluteCertainty === false &&
      standardCalibration.confidencePercentage <= 95; // HARD RULE: Never claim perfect accuracy

    results.push({
      testId: 'TEST_RES_07',
      name: 'Epistemic Calibration & Non-Overconfidence',
      stage: 'Stage 10: Epistemic Calibration',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t7Start,
      details: 'Enforces epistemic humility (claimsAbsoluteCertainty: false, confidence capped <= 95%) and explicitly flags insufficient evidence.',
      diagnosticData: { emptyCalibration, standardCalibration },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_07',
      name: 'Epistemic Calibration & Non-Overconfidence',
      stage: 'Stage 10',
      status: 'failed',
      durationMs: Date.now() - t7Start,
      details: `Exception: ${err.message}`,
    });
  }

  // Test 8: Stage 11 - Structured Citations & Reference Building
  const t8Start = Date.now();
  try {
    const mockSources = [
      {
        id: 's1',
        url: 'https://react.dev/blog',
        title: 'React Compiler Architecture',
        domain: 'react.dev',
        snippet: 'Official architecture guide for auto-memoization.',
        publishedDate: '2026-01-15',
        indexedTimestamp: Date.now(),
        sourceCategory: 'official_docs' as const,
        isPrimaryOrOfficial: true,
      },
    ];

    const qEval = evaluateSourceQuality(mockSources);
    const citations = buildResearchCitations(
      {
        sources: mockSources,
        extractedClaims: [{ id: 'c1', sourceId: 's1', claimText: 'Auto-memoization', confidenceInExtraction: 0.9, isExplicitStatement: true }],
        totalSourcesQueried: 1,
        totalOfficialSourcesFound: 1,
        collectionTimestamp: Date.now(),
      },
      qEval
    );

    const passed =
      citations.length === 1 &&
      citations[0].citationIndex === 1 &&
      citations[0].url === 'https://react.dev/blog' &&
      citations[0].isOfficialOrPrimary === true &&
      citations[0].credibilityScore > 0.8;

    results.push({
      testId: 'TEST_RES_08',
      name: 'Structured Citations & Reference Cards',
      stage: 'Stage 11: Attach Useful Citations',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t8Start,
      details: 'Built verifiable citation cards with direct URLs, domain badges, and credibility scores.',
      diagnosticData: { citations },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_08',
      name: 'Structured Citations & Reference Cards',
      stage: 'Stage 11',
      status: 'failed',
      durationMs: Date.now() - t8Start,
      details: `Exception: ${err.message}`,
    });
  }

  // Test 9: Complete 11-Stage End-to-End Execution
  const t9Start = Date.now();
  try {
    const workflowOutput = await frogeResearchEngine.executeResearch({
      query: 'What are the current verified specifications of TypeScript 5.8 and strict type checking?',
      depth: 'standard',
      callerModule: 'standalone',
    });

    const passed =
      Boolean(workflowOutput.requestId) &&
      workflowOutput.recencyNeed.requiresCurrentInfo === true &&
      workflowOutput.plan.subQueries.length >= 3 &&
      workflowOutput.collectedData.sources.length >= 2 &&
      workflowOutput.citations.length >= 2 &&
      workflowOutput.epistemicCalibration.claimsAbsoluteCertainty === false &&
      workflowOutput.synthesizedAnswer.includes('FROGÉ Research Synthesis');

    results.push({
      testId: 'TEST_RES_09',
      name: 'Full 11-Step End-to-End Workflow Execution',
      stage: 'End-to-End Orchestrator',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t9Start,
      details: `Executed full 11-step pipeline in ${workflowOutput.durationMs}ms with ${workflowOutput.citations.length} verified citations.`,
      diagnosticData: {
        requestId: workflowOutput.requestId,
        recency: workflowOutput.recencyNeed.recencyCategory,
        sourcesExamined: workflowOutput.collectedData.totalSourcesQueried,
        confidence: workflowOutput.epistemicCalibration.confidencePercentage,
      },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_09',
      name: 'Full 11-Step End-to-End Workflow Execution',
      stage: 'End-to-End Orchestrator',
      status: 'failed',
      durationMs: Date.now() - t9Start,
      details: `Exception: ${err.message}`,
    });
  }

  // Test 10: Modularity & Integration with Deep Thinking, Student Mode, and MAX
  const t10Start = Date.now();
  try {
    const deepThinkingRun = await frogeResearchEngine.executeResearch({
      query: 'Derivation and experimental bounds of Bell test quantum non-locality',
      depth: 'deep',
      callerModule: 'deep-thinking',
    });

    const studentModeRun = await frogeResearchEngine.executeResearch({
      query: 'Explain the difference between mitosis and meiosis with primary biological diagrams',
      depth: 'standard',
      callerModule: 'student-mode',
    });

    const maxModeRun = await frogeResearchEngine.executeResearch({
      query: 'Competitive analysis and technical moats of multi-modal generative AI models in 2026',
      depth: 'exhaustive',
      callerModule: 'max',
    });

    const passed =
      deepThinkingRun.consumerModule === 'deep-thinking' &&
      studentModeRun.consumerModule === 'student-mode' &&
      maxModeRun.consumerModule === 'max' &&
      deepThinkingRun.citations.length > 0 &&
      studentModeRun.citations.length > 0 &&
      maxModeRun.citations.length > 0;

    results.push({
      testId: 'TEST_RES_10',
      name: 'Multi-Mode Modular Interoperability',
      stage: 'Modularity: Deep Thinking, Student Mode, MAX Integration',
      status: passed ? 'passed' : 'failed',
      durationMs: Date.now() - t10Start,
      details: 'Verified seamless modular consumption by Deep Thinking, Student Mode, and MAX with tailored research depths.',
      diagnosticData: {
        deepThinking: deepThinkingRun.consumerModule,
        studentMode: studentModeRun.consumerModule,
        maxMode: maxModeRun.consumerModule,
      },
    });
  } catch (err: any) {
    results.push({
      testId: 'TEST_RES_10',
      name: 'Multi-Mode Modular Interoperability',
      stage: 'Modularity',
      status: 'failed',
      durationMs: Date.now() - t10Start,
      details: `Exception: ${err.message}`,
    });
  }

  const passedCount = results.filter((r) => r.status === 'passed').length;
  const totalCount = results.length;

  return {
    total: totalCount,
    passed: passedCount,
    failed: totalCount - passedCount,
    passRate: `${Math.round((passedCount / totalCount) * 100)}%`,
    results,
  };
}
