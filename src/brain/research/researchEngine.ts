/**
 * FROGÉ Research Engine - Modular Unified Orchestrator
 * 
 * Implements the complete 11-step research workflow:
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
 * 
 * Modular by design for direct utilization by:
 * - Standalone FROGÉ Research Engine
 * - Deep Thinking Mode
 * - Student Mode
 * - MAX Mode
 */

import { determineRecencyNeed } from './recencyDetector';
import { createResearchPlan } from './researchPlanner';
import { searchAndCollectSources } from './sourceSearcher';
import { compareSourcesAndCorroborate } from './sourceComparator';
import { evaluateSourceQuality } from './qualityEvaluator';
import { detectContradictions } from './contradictionDetector';
import {
  buildResearchCitations,
  calibrateEpistemics,
  generateCalibratedAnswer,
} from './answerSynthesizer';
import {
  ResearchPlan,
  ResearchRequest,
  ResearchWorkflowOutput,
} from './types';

export class FrogeResearchEngine {
  private static instance: FrogeResearchEngine | null = null;

  public static getInstance(): FrogeResearchEngine {
    if (!FrogeResearchEngine.instance) {
      FrogeResearchEngine.instance = new FrogeResearchEngine();
    }
    return FrogeResearchEngine.instance;
  }

  /**
   * Stage 2 standalone helper: Check if query requires current/live info
   */
  public checkRecencyNeed(query: string, referenceDate?: string) {
    return determineRecencyNeed(query, referenceDate);
  }

  /**
   * Stage 3 standalone helper: Formulate structured research plan
   */
  public formulatePlan(request: ResearchRequest): ResearchPlan {
    return createResearchPlan(request);
  }

  /**
   * Executes the full 11-step FROGÉ Research Workflow
   */
  public async executeResearch(request: ResearchRequest): Promise<ResearchWorkflowOutput> {
    const startTime = Date.now();
    const requestId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // ------------------------------------------------------------------------
    // Step 1: User question
    // ------------------------------------------------------------------------
    const userQuery = request.query.trim();

    // ------------------------------------------------------------------------
    // Step 2: Determine whether current information is needed
    // ------------------------------------------------------------------------
    const recencyNeed = determineRecencyNeed(userQuery);

    // ------------------------------------------------------------------------
    // Step 3: Create research plan
    // ------------------------------------------------------------------------
    const plan = createResearchPlan(request);

    // ------------------------------------------------------------------------
    // Step 4 & 5: Search sources & Collect information
    // ------------------------------------------------------------------------
    const collectedData = await searchAndCollectSources(plan, request);

    // ------------------------------------------------------------------------
    // Step 6 & 7: Compare sources & Check dates
    // ------------------------------------------------------------------------
    const sourceComparison = compareSourcesAndCorroborate(collectedData);

    // ------------------------------------------------------------------------
    // Step 8: Evaluate source quality
    // ------------------------------------------------------------------------
    const qualityEvaluation = evaluateSourceQuality(collectedData.sources);

    // ------------------------------------------------------------------------
    // Step 9: Detect contradictions & disagreements
    // ------------------------------------------------------------------------
    const contradictionAnalysis = detectContradictions(collectedData, sourceComparison);

    // ------------------------------------------------------------------------
    // Step 10 & 11: Generate calibrated answer & Attach useful citations
    // ------------------------------------------------------------------------
    const epistemicCalibration = calibrateEpistemics(
      collectedData,
      qualityEvaluation,
      contradictionAnalysis
    );

    const citations = buildResearchCitations(collectedData, qualityEvaluation);

    const synthesisResult = generateCalibratedAnswer(
      request,
      plan,
      collectedData,
      sourceComparison,
      qualityEvaluation,
      contradictionAnalysis,
      epistemicCalibration,
      citations
    );

    const durationMs = Date.now() - startTime;
    const researchFootprintTokens = Math.round(
      (userQuery.length / 4) + (synthesisResult.synthesizedAnswer.length / 4) + (citations.length * 50)
    );

    return {
      requestId,
      userQuery,
      timestamp: new Date().toISOString(),
      durationMs,
      recencyNeed,
      plan,
      collectedData,
      sourceComparison,
      qualityEvaluation,
      contradictionAnalysis,
      epistemicCalibration,
      synthesizedAnswer: synthesisResult.synthesizedAnswer,
      citations,
      disagreementSection: synthesisResult.disagreementSection,
      evidenceSufficiencyStatement: synthesisResult.evidenceSufficiencyStatement,
      consumerModule: request.callerModule || (request.mode as any) || 'standalone',
      researchFootprintTokens,
    };
  }
}

// Export singleton instance
export const frogeResearchEngine = FrogeResearchEngine.getInstance();
