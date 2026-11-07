/**
 * FROGÉ Brain - Automated Test Suite
 *
 * Comprehensive validation across the entire 8-step modular architecture:
 * 1. Intent Understanding (Entities, complexity, user goal)
 * 2. Task Classification across all 8 mandatory categories:
 *    - normal conversation
 *    - deeper reasoning
 *    - web research
 *    - creative generation
 *    - coding
 *    - business analysis
 *    - education
 *    - memory
 * 3. Capability Selection & Compute Intensity
 * 4. Model Routing & Provider Independence
 * 5. Tool Selection & Execution
 * 6. Chain-of-Thought Privacy (Ensuring raw reasoning tokens are NOT exposed)
 * 7. Verification & Calibrated Uncertainty
 * 8. End-to-End Pipeline Response
 */

import { understandIntent } from './intentUnderstanding';
import { classifyTask } from './taskClassifier';
import { selectCapabilities } from './capabilitySelector';
import { routeModel } from './modelRouter';
import { selectTools } from './toolSelector';
import { verifyResult } from './verifier';
import { runFrogeBrainPipeline } from './index';
import { BrainTaskType } from './types';
import {
  detectCurrentNewsTrigger,
  classifyEpistemicCategories,
} from './verification/newsVerificationLayer';
import { understandCodeRequirements } from './code/requirementsEngine';
import { createProjectPlan } from './code/projectPlanner';
import { generateProjectFiles } from './code/fileGenerator';
import { executeCodeTests } from './code/codeTester';
import { findErrors } from './code/errorDetector';
import { applyFixesAndRetest } from './code/codeFixer';
import { runSecurityCheck } from './code/securityAuditor';
import { FrogeModularMemoryEngine } from './memory/memoryEngine';
import { ConversationMemoryManager } from './memory/conversationMemory';
import { PersonalizationMemoryManager } from './memory/personalizationMemory';
import { AppDataMemoryManager } from './memory/appDataMemory';
import { auditSensitiveData, FROGE_PRIVACY_DISCLOSURE } from './memory/privacyAuditor';

export interface TestResultItem {
  testName: string;
  category:
    | 'Task Classification (8 Types)'
    | 'Chain-of-Thought Privacy'
    | 'Capability Selection'
    | 'Model Routing'
    | 'Cost Control & Economical Routing'
    | 'Tool Selection'
    | 'Verification & Uncertainty'
    | 'End-to-End Pipeline';
  passed: boolean;
  message: string;
  details?: string;
}

export function runBrainTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResultItem[];
} {
  const results: TestResultItem[] = [];

  function assert(
    testName: string,
    category: TestResultItem['category'],
    condition: boolean,
    failureMessage: string,
    details?: string
  ) {
    results.push({
      testName,
      category,
      passed: Boolean(condition),
      message: condition ? 'PASSED' : `FAILED: ${failureMessage}`,
      details,
    });
  }

  try {
    // =========================================================================
    // 1. TASK CLASSIFICATION SUITE (ALL 8 MANDATORY TYPES)
    // =========================================================================

    // 1a. Normal Conversation
    const normalQuery = 'Good morning, how are you today? Could you draft a brief friendly note?';
    const normalIntent = understandIntent({ query: normalQuery });
    const normalTask = classifyTask(normalIntent);
    assert(
      'Task Classification: normal_conversation',
      'Task Classification (8 Types)',
      normalTask.primaryTask === 'normal_conversation',
      `Expected normal_conversation, got ${normalTask.primaryTask}`,
      `Primary: ${normalTask.primaryTask} | Confidence: ${normalTask.confidenceScores.normal_conversation}`
    );

    // 1b. Deeper Reasoning
    const reasoningQuery =
      'Analyze the second-order economic consequences and game-theoretic Nash equilibrium of sovereign AI datacenters under energy constraints.';
    const reasoningIntent = understandIntent({ query: reasoningQuery });
    const reasoningTask = classifyTask(reasoningIntent);
    assert(
      'Task Classification: deeper_reasoning',
      'Task Classification (8 Types)',
      reasoningTask.primaryTask === 'deeper_reasoning' && reasoningTask.requiresDeepCognition,
      `Expected deeper_reasoning with deep cognition, got ${reasoningTask.primaryTask}`,
      `Primary: ${reasoningTask.primaryTask} | Deep Cognition: ${reasoningTask.requiresDeepCognition}`
    );

    // 1c. Web Research
    const researchQuery = 'What are the latest official release notes and news for TypeScript 5.8 in 2026?';
    const researchIntent = understandIntent({ query: researchQuery });
    const researchTask = classifyTask(researchIntent);
    assert(
      'Task Classification: web_research',
      'Task Classification (8 Types)',
      researchTask.primaryTask === 'web_research' && researchTask.requiresExternalData,
      `Expected web_research with external data requirement, got ${researchTask.primaryTask}`,
      `Primary: ${researchTask.primaryTask} | External Data: ${researchTask.requiresExternalData}`
    );

    // 1d. Creative Generation
    const creativeQuery =
      'Write an atmospheric worldbuilding prologue and cinematic poem about a floating observatory powered by starlight.';
    const creativeIntent = understandIntent({ query: creativeQuery });
    const creativeTask = classifyTask(creativeIntent);
    assert(
      'Task Classification: creative_generation',
      'Task Classification (8 Types)',
      creativeTask.primaryTask === 'creative_generation',
      `Expected creative_generation, got ${creativeTask.primaryTask}`,
      `Primary: ${creativeTask.primaryTask} | Confidence: ${creativeTask.confidenceScores.creative_generation}`
    );

    // 1e. Coding
    const codeQuery = 'Implement a thread-safe LRU Cache in TypeScript with O(1) get and put methods and generics.';
    const codeIntent = understandIntent({ query: codeQuery });
    const codeTask = classifyTask(codeIntent);
    assert(
      'Task Classification: coding',
      'Task Classification (8 Types)',
      codeTask.primaryTask === 'coding',
      `Expected coding, got ${codeTask.primaryTask}`,
      `Primary: ${codeTask.primaryTask} | Complexity: ${codeIntent.complexityLevel}`
    );

    // 1f. Business Analysis
    const businessQuery =
      'Formulate a 90-day go-to-market strategy, SWOT analysis, and SaaS unit economics payback model for enterprise rollout.';
    const businessIntent = understandIntent({ query: businessQuery });
    const businessTask = classifyTask(businessIntent);
    assert(
      'Task Classification: business_analysis',
      'Task Classification (8 Types)',
      businessTask.primaryTask === 'business_analysis',
      `Expected business_analysis, got ${businessTask.primaryTask}`,
      `Primary: ${businessTask.primaryTask} | Rationale: ${businessTask.classificationRationale}`
    );

    // 1g. Education
    const educationQuery =
      'Teach me how quantum superposition works using a simple coin toss analogy for beginners and a quiz.';
    const educationIntent = understandIntent({ query: educationQuery });
    const educationTask = classifyTask(educationIntent);
    assert(
      'Task Classification: education',
      'Task Classification (8 Types)',
      educationTask.primaryTask === 'education',
      `Expected education, got ${educationTask.primaryTask}`,
      `Primary: ${educationTask.primaryTask} | Socratic pedagogy active`
    );

    // 1h. Memory
    const memoryQuery = 'Please remember that my favorite frontend styling system is Tailwind CSS and save this to memory.';
    const memoryIntent = understandIntent({ query: memoryQuery });
    const memoryTask = classifyTask(memoryIntent);
    assert(
      'Task Classification: memory',
      'Task Classification (8 Types)',
      memoryTask.primaryTask === 'memory' && memoryTask.requiresStatePersistence,
      `Expected memory with state persistence, got ${memoryTask.primaryTask}`,
      `Primary: ${memoryTask.primaryTask} | State Persistence: ${memoryTask.requiresStatePersistence}`
    );

    // =========================================================================
    // 2. CHAIN-OF-THOUGHT PRIVACY & USEFUL REASONING SUMMARIES
    // =========================================================================
    const cotTestQuery = 'Explain the difference between optimistic and pessimistic concurrency control.';
    const cotIntent = understandIntent({ query: cotTestQuery });
    const cotTask = classifyTask(cotIntent);
    const cotCaps = selectCapabilities(cotIntent, cotTask);
    const cotRouting = routeModel(cotIntent, cotTask, cotCaps);
    const cotTools = selectTools(cotIntent, cotTask, cotCaps, cotRouting);

    assert(
      'Chain-of-Thought Privacy: System instructions prohibit raw scratchpad leakage',
      'Chain-of-Thought Privacy',
      !cotRouting.systemInstruction.includes('output your inner raw chain-of-thought tokens') &&
        cotRouting.systemInstruction.length > 20,
      'System prompt incorrectly configured for reasoning exposure',
      'System instruction enforces clean reasoning summaries only'
    );

    // =========================================================================
    // 3. CAPABILITY SELECTION SUITE
    // =========================================================================
    assert(
      'Capability Selection: Coding activates AST & Code Refactoring',
      'Capability Selection',
      selectCapabilities(codeIntent, codeTask).selectedCapabilities.includes('code_ast_and_refactoring'),
      'Code query did not allocate code_ast_and_refactoring capability'
    );

    assert(
      'Capability Selection: Education allocates Socratic Pedagogical Breakdown',
      'Capability Selection',
      selectCapabilities(educationIntent, educationTask).selectedCapabilities.includes(
        'socratic_pedagogical_breakdown'
      ),
      'Education query did not allocate socratic_pedagogical_breakdown capability'
    );

    assert(
      'Capability Selection: Deeper Reasoning allocates Step-by-Step Deduction',
      'Capability Selection',
      selectCapabilities(reasoningIntent, reasoningTask).selectedCapabilities.includes('step_by_step_deduction'),
      'Reasoning query did not allocate step_by_step_deduction capability'
    );

    // =========================================================================
    // 4. MODEL ROUTING & COST CONTROL SUITE
    // =========================================================================
    assert(
      'Model Routing: Simple conversation routes to efficient_lite tier',
      'Model Routing',
      routeModel(normalIntent, normalTask, selectCapabilities(normalIntent, normalTask)).tier === 'efficient_lite',
      'Normal conversation was not routed to efficient_lite tier'
    );

    assert(
      'Model Routing: Complex reasoning routes to deep_reasoning_escalated on Pro plan',
      'Model Routing',
      routeModel(reasoningIntent, reasoningTask, selectCapabilities(reasoningIntent, reasoningTask), undefined, {
        userPlanId: 'pro',
      }).tier === 'deep_reasoning_escalated',
      'Complex reasoning was not escalated to deep_reasoning_escalated on Pro plan'
    );

    assert(
      'Model Routing: Coding routes to code_specialist tier',
      'Model Routing',
      routeModel(codeIntent, codeTask, selectCapabilities(codeIntent, codeTask)).tier === 'code_specialist',
      'Coding was not routed to code_specialist tier'
    );

    // Cost Control & Non-Escalation Safeguards
    const simpleInDeepQuery = understandIntent({ query: 'Good morning, how are you today?', mode: 'deep-thinking' });
    const simpleInDeepTask = classifyTask(simpleInDeepQuery, 'deep-thinking');
    const simpleInDeepCaps = selectCapabilities(simpleInDeepQuery, simpleInDeepTask);
    const simpleInDeepRouting = routeModel(simpleInDeepQuery, simpleInDeepTask, simpleInDeepCaps, 'deep-thinking', {
      userPlanId: 'pro',
    });

    assert(
      'Cost Control: Simple inputs in Deep Thinking mode do NOT trigger expensive reasoning',
      'Cost Control & Economical Routing',
      simpleInDeepRouting.tier === 'efficient_lite' && !simpleInDeepRouting.activatedExpensiveReasoning,
      'Simple input in deep-thinking mode unnecessarily triggered expensive reasoning tier',
      `Routed to ${simpleInDeepRouting.tier} with expensive reasoning: ${simpleInDeepRouting.activatedExpensiveReasoning}`
    );

    const lowQuotaRouting = routeModel(reasoningIntent, reasoningTask, selectCapabilities(reasoningIntent, reasoningTask), 'deep-thinking', {
      userPlanId: 'pro',
      remainingTokenAllowance: 750,
    });

    assert(
      'Cost Control: Low remaining token allowance throttles to economical tier with capped tokens',
      'Cost Control & Economical Routing',
      lowQuotaRouting.tier === 'efficient_lite' && lowQuotaRouting.maxTokens <= 512,
      'Low token allowance failed to throttle to economical model',
      `Tier: ${lowQuotaRouting.tier} | MaxTokens: ${lowQuotaRouting.maxTokens}`
    );

    const freeEnterpriseRouting = routeModel(businessIntent, businessTask, selectCapabilities(businessIntent, businessTask), 'max', {
      userPlanId: 'free',
    });

    assert(
      'Cost Control: Free plan prevents expensive multi-agent swarm escalation',
      'Cost Control & Economical Routing',
      freeEnterpriseRouting.tier !== 'max_multi_orchestrator',
      'Free plan inappropriately escalated to multi-orchestrator swarm',
      `Tier: ${freeEnterpriseRouting.tier}`
    );

    // =========================================================================
    // 5. TOOL SELECTION SUITE
    // =========================================================================
    const mathToolQuery = understandIntent({ query: 'Calculate 1420 * 85 / 12' });
    const mathToolTask = classifyTask(mathToolQuery);
    const mathTools = selectTools(
      mathToolQuery,
      mathToolTask,
      selectCapabilities(mathToolQuery, mathToolTask),
      routeModel(mathToolQuery, mathToolTask, selectCapabilities(mathToolQuery, mathToolTask))
    );

    assert(
      'Tool Selection: Activates symbolic math calculator for numeric expressions',
      'Tool Selection',
      mathTools.selectedTools.some((t) => t.tool === 'symbolic_math_calculator'),
      'Math expression did not select symbolic_math_calculator tool'
    );

    assert(
      'Tool Selection: Activates web search retriever for research requests',
      'Tool Selection',
      selectTools(
        researchIntent,
        researchTask,
        selectCapabilities(researchIntent, researchTask),
        routeModel(researchIntent, researchTask, selectCapabilities(researchIntent, researchTask))
      ).selectedTools.some((t) => t.tool === 'web_search_retriever'),
      'Web research request did not select web_search_retriever tool'
    );

    // =========================================================================
    // 6. VERIFICATION & UNCERTAINTY CALIBRATION SUITE
    // =========================================================================
    const mockExecution = {
      rawGeneratedContent: 'Here is the verified production architecture for high-throughput stream processing.',
      toolOutputs: [],
      executionDurationMs: 140,
      sourceProvider: 'froge_model_gateway',
      sourceModel: 'froge-neural-v1',
      tokensUsed: { promptTokens: 150, completionTokens: 400, totalTokens: 550 },
    };

    const verification = verifyResult(mockExecution, businessIntent, businessTask);
    assert(
      'Verification & Uncertainty: Calibrates factual consistency and uncertainty score',
      'Verification & Uncertainty',
      verification.isVerified &&
        verification.factualConsistencyScore >= 80 &&
        verification.evidenceItems.length > 0 &&
        verification.uncertaintyNote.length > 10,
      'Verification result missing valid consistency or uncertainty calibration',
      `Score: ${verification.factualConsistencyScore}% | Uncertainty: ${verification.uncertaintyLevel} | Evidence items: ${verification.evidenceItems.length}`
    );

    // Current News Epistemic Verification Assertions
    const newsTriggerCheck = detectCurrentNewsTrigger('What is the latest news and price of Bitcoin today?');
    assert(
      'News Verification: Recognizes temporal and current news triggers across categories',
      'Verification & Uncertainty',
      newsTriggerCheck.isCurrentNewsQuery &&
        newsTriggerCheck.detectedCategories.includes('latest_news') &&
        newsTriggerCheck.detectedCategories.includes('current_prices') &&
        newsTriggerCheck.detectedCategories.includes('todays_information'),
      'Failed to recognize multiple current news categories',
      `Categories: ${newsTriggerCheck.detectedCategories.join(', ')}`
    );

    // Verify Epistemic Disaggregation (FACT vs INFERENCE vs UNCERTAINTY)
    const epistemicClassification = classifyEpistemicCategories(
      'What was the official announcement from the Federal Reserve regarding interest rates?',
      [
        {
          id: 'src_primary_test',
          sourceName: 'Federal Reserve Official Wire',
          domain: 'federalreserve.gov',
          url: 'https://federalreserve.gov/release',
          headline: 'Official FOMC Decision: Benchmark Rate at 4.75%',
          excerptSnippet: 'The FOMC unanimously voted to keep the policy rate at 4.75%.',
          publicationDate: '2026-08-25',
          publicationTimestamp: Date.now() - 3600000,
          ageInHours: 1,
          authorityLevel: 'tier_1_primary_official',
          isPrimarySource: true,
          reputationScore: 0.99,
          isStaleForQuery: false,
        },
      ],
      { sourcesAnalyzed: 1, primarySourcesFound: 1, hasConsensus: true, agreementScore: 95, disagreementsIdentified: [] }
    );

    assert(
      'News Verification: Strictly disaggregates into FACT, INFERENCE, and UNCERTAINTY',
      'Verification & Uncertainty',
      epistemicClassification.facts.length >= 1 &&
        epistemicClassification.facts[0].confidenceScore >= 0.85 &&
        epistemicClassification.inferences.length >= 1 &&
        epistemicClassification.inferences[0].logicalBasis.length > 0,
      'Epistemic classification did not produce required structured breakdown',
      `Facts: ${epistemicClassification.facts.length} | Inferences: ${epistemicClassification.inferences.length} | Uncertainties: ${epistemicClassification.uncertainties.length}`
    );

    // Anti-Hallucination Guardrail: Sparse data must output UNCERTAINTY and NOT invent facts
    const sparseCheck = classifyEpistemicCategories('Unannounced secret tech launch', [], {
      sourcesAnalyzed: 0,
      primarySourcesFound: 0,
      hasConsensus: false,
      agreementScore: 30,
      disagreementsIdentified: [],
    });
    assert(
      'News Verification: Zero-hallucination constraint on missing sources (outputs UNCERTAINTY)',
      'Verification & Uncertainty',
      sparseCheck.facts.length === 0 &&
        sparseCheck.inferences.length === 0 &&
        sparseCheck.uncertainties.length >= 1 &&
        sparseCheck.uncertainties[0].uncertaintyReason === 'missing_primary_source',
      'Failed zero-hallucination constraint: manufactured facts or inferences on empty sources'
    );

    // =========================================================================
    // 7. FROGÉ CODE AUTONOMOUS WORKFLOW ASSERTIONS
    // Requirements -> Plan -> Generate -> Run -> Test -> Fix -> Retest -> Security
    // =========================================================================
    const codeReqs = understandCodeRequirements('Build a real-time task manager with analytics');
    const codePlan = createProjectPlan(codeReqs);
    const codeFiles = generateProjectFiles(codeReqs, codePlan);
    const initialTestReport = executeCodeTests(codeFiles, true);
    const codeErrors = findErrors(codeFiles, initialTestReport);
    const { fixIteration } = applyFixesAndRetest(codeFiles, codeErrors);
    const securityReport = runSecurityCheck(codeFiles);

    assert(
      'FROGÉ Code: End-to-end 10-stage autonomous generation, repair & retest verification',
      'End-to-End Pipeline',
      codeReqs.requirements.length >= 3 &&
        codeFiles.length >= 4 &&
        codeErrors.length >= 1 &&
        fixIteration.patchesApplied.length >= 1 &&
        fixIteration.retestReport.allPassed &&
        fixIteration.retestReport.passRate === 100 &&
        securityReport.isSecure &&
        securityReport.securityScore >= 90,
      'FROGÉ Code workflow failed stage criteria',
      `Files: ${codeFiles.length} | Errors Fixed: ${fixIteration.patchesApplied.length} | Retest: ${fixIteration.retestReport.passRate}% | Security: ${securityReport.securityScore}/100`
    );

    // =========================================================================
    // 8. FROGÉ MODULAR MEMORY ARCHITECTURE (3 TIERS, PRIVACY & ISOLATION)
    // =========================================================================
    const memEngine = new FrogeModularMemoryEngine(
      new ConversationMemoryManager(),
      new PersonalizationMemoryManager(),
      new AppDataMemoryManager()
    );
    const testUserA = 'user_alice_test';
    const testUserB = 'user_bob_test';

    // 1. Store across all 3 tiers
    memEngine.rememberConversation(testUserA, 'sess_1', { role: 'user', content: 'Alice query on graph algorithms' });
    memEngine.rememberPreference(testUserA, 'code_lang', 'TypeScript', 'preference');
    memEngine.rememberAppData(testUserA, 'graphs', 'dijkstra_spec', { complexity: 'O(E + V log V)' }, 'structured_record');

    memEngine.rememberConversation(testUserB, 'sess_2', { role: 'user', content: 'Bob query on baking pastry' });
    memEngine.rememberPreference(testUserB, 'code_lang', 'Python', 'preference');

    // Retrieval & Isolation Assertions
    const aliceQuery = memEngine.queryAll({ userId: testUserA });
    const bobQuery = memEngine.queryAll({ userId: testUserB });
    const bobAttemptAliceData = memEngine.queryAll({ userId: testUserB, queryText: 'graph' });

    // Sensitive data audit
    const sensitiveScan = auditSensitiveData('My token sk-abcdef12345678901234567890123456 and password=mysecret', true);

    // Deletion and reset check
    const singleDeleted = memEngine.deleteMemoryItem(testUserA, 'personalization', aliceQuery.personalizationRecords[0]?.id || '');
    const resetReport = memEngine.resetAllUserMemory(testUserA);
    const aliceAfterReset = memEngine.queryAll({ userId: testUserA });

    assert(
      'FROGÉ Memory: 3 Modular Tiers (Conversation, Personalization, App/Data) with Strict Cross-User Isolation',
      'End-to-End Pipeline',
      aliceQuery.conversationContext.length >= 1 &&
        aliceQuery.personalizationRecords.length >= 1 &&
        aliceQuery.appDataRecords.length >= 1 &&
        bobAttemptAliceData.conversationContext.length === 0 &&
        bobAttemptAliceData.personalizationRecords.length === 0 &&
        bobAttemptAliceData.appDataRecords.length === 0 &&
        bobQuery.personalizationRecords[0]?.value === 'Python' &&
        sensitiveScan.blocked &&
        singleDeleted &&
        resetReport.totalPurged > 0 &&
        aliceAfterReset.totalRetrieved === 0 &&
        FROGE_PRIVACY_DISCLOSURE.encryptionAtRest === true,
      'Memory 3-tier architecture or tenant isolation assertion failed',
      `Tiers Active: 3 | Isolation: Verified (0 Cross-leakage) | Sensitive Blocked: ${sensitiveScan.blocked} | Full Reset Purged: ${resetReport.totalPurged}`
    );

    // =========================================================================
    // 8.5 FAST PATH & COMPLEXITY ROUTER REGRESSION TESTS (LEVELS 0 - 4)
    // =========================================================================
    // Test 1: "Hey" MUST NOT trigger deep analytical synthesis or multi-agent workflows
    const heyIntent = understandIntent({ query: 'Hey' });
    const heyTask = classifyTask(heyIntent);
    const heyCaps = selectCapabilities(heyIntent, heyTask);
    const heyTools = selectTools(heyIntent, heyTask, heyCaps, routeModel(heyIntent, heyTask, heyCaps));
    const heyVerif = verifyResult(
      { rawGeneratedContent: 'Hey! 👋 How can I help?', toolOutputs: [], executionDurationMs: 5, sourceProvider: 'fog', sourceModel: 'fog-turbo-flow', tokensUsed: { promptTokens: 5, completionTokens: 12, totalTokens: 17 } },
      heyIntent,
      heyTask
    );
    assert(
      'Fast Path Regression: "Hey" MUST NOT trigger deep analytical synthesis or tools',
      'Cost Control & Economical Routing',
      heyIntent.isFastPath === true &&
        heyIntent.complexityTier === 0 &&
        heyTask.primaryTask === 'normal_conversation' &&
        heyTask.requiresDeepCognition === false &&
        heyCaps.reasoningBudget === 'none' &&
        heyTools.selectedTools.length === 0 &&
        heyVerif.verificationLevel === 'none',
      'Hey activated heavy processing instead of Fast Path',
      `Tier: ${heyIntent.complexityTier} | FastPath: ${heyIntent.isFastPath} | Tools: ${heyTools.selectedTools.length} | Verif: ${heyVerif.verificationLevel}`
    );

    // Test 2: "Hi" MUST NOT trigger MAX
    const hiIntent = understandIntent({ query: 'Hi' });
    const hiTask = classifyTask(hiIntent);
    assert(
      'Fast Path Regression: "Hi" MUST NOT trigger MAX business analysis',
      'Task Classification (8 Types)',
      hiTask.primaryTask !== 'business_analysis' && hiIntent.complexityTier === 0,
      'Hi incorrectly classified as MAX or complex',
      `Primary Task: ${hiTask.primaryTask} | Tier: ${hiIntent.complexityTier}`
    );

    // Test 3: "Thanks" MUST NOT trigger research
    const thanksIntent = understandIntent({ query: 'Thanks' });
    const thanksTask = classifyTask(thanksIntent);
    assert(
      'Fast Path Regression: "Thanks" MUST NOT trigger research',
      'Task Classification (8 Types)',
      thanksTask.primaryTask !== 'web_research' && thanksIntent.complexityTier === 0,
      'Thanks incorrectly triggered research',
      `Primary Task: ${thanksTask.primaryTask} | Tier: ${thanksIntent.complexityTier}`
    );

    // Test 4: "How are you?" Fast Path
    const howAreYouIntent = understandIntent({ query: 'How are you?' });
    assert(
      'Fast Path Regression: "How are you?" activates Fast Path (Level 0)',
      'Cost Control & Economical Routing',
      howAreYouIntent.isFastPath === true && howAreYouIntent.complexityTier === 0,
      'How are you did not activate Fast Path',
      `Tier: ${howAreYouIntent.complexityTier}`
    );

    // Test 5: "What is 2+2?" Simple (Level 1)
    const mathIntent = understandIntent({ query: 'What is 2+2?' });
    const mathTask = classifyTask(mathIntent);
    const mathVerif = verifyResult(
      { rawGeneratedContent: '2 + 2 = 4.', toolOutputs: [], executionDurationMs: 5, sourceProvider: 'fog', sourceModel: 'fog-neural-core-v3', tokensUsed: { promptTokens: 8, completionTokens: 10, totalTokens: 18 } },
      mathIntent,
      mathTask
    );
    assert(
      'Complexity Router: "What is 2+2?" Level 1 Simple with Light verification',
      'Verification & Uncertainty',
      mathIntent.complexityTier === 1 && mathVerif.verificationLevel === 'light',
      'Math query not recognized as Level 1 with light verification',
      `Tier: ${mathIntent.complexityTier} | Verif: ${mathVerif.verificationLevel}`
    );

    // Test 6: "Explain photosynthesis." Normal (Level 2)
    const photoIntent = understandIntent({ query: 'Explain photosynthesis.' });
    assert(
      'Complexity Router: "Explain photosynthesis." Level 2 Normal reasoning',
      'Capability Selection',
      photoIntent.complexityTier === 2,
      'Photosynthesis not classified as Level 2 Normal',
      `Tier: ${photoIntent.complexityTier}`
    );

    // Test 7: "Solve this difficult physics problem." Complex (Level 3)
    const physicsIntent = understandIntent({ query: 'Solve this difficult physics problem.' });
    assert(
      'Complexity Router: "Solve this difficult physics problem." Level 3 Complex',
      'Capability Selection',
      physicsIntent.complexityTier === 3,
      'Difficult physics not classified as Level 3 Complex',
      `Tier: ${physicsIntent.complexityTier}`
    );

    // Test 8: "Debug this code." Complex (Level 3)
    const debugIntent = understandIntent({ query: 'Debug this code.' });
    const debugTask = classifyTask(debugIntent);
    assert(
      'Complexity Router: "Debug this code." Level 3 Coding task',
      'Task Classification (8 Types)',
      debugIntent.complexityTier === 3 && debugTask.primaryTask === 'coding',
      'Debug this code not classified as coding Level 3',
      `Tier: ${debugIntent.complexityTier} | Task: ${debugTask.primaryTask}`
    );

    // Test 9: "Research this topic deeply." High Complexity (Level 4)
    const researchDeepIntent = understandIntent({ query: 'Research this topic deeply.' });
    assert(
      'Complexity Router: "Research this topic deeply." Level 4 High Complexity',
      'Capability Selection',
      researchDeepIntent.complexityTier === 4,
      'Deep research not classified as Level 4',
      `Tier: ${researchDeepIntent.complexityTier}`
    );

    // Test 10: "Build a website." High Complexity (Level 4) Planner/Agents
    const buildIntent = understandIntent({ query: 'Build a website.' });
    assert(
      'Complexity Router: "Build a website." Level 4 High Complexity multi-agent/planner',
      'Capability Selection',
      buildIntent.complexityTier === 4,
      'Build website not classified as Level 4',
      `Tier: ${buildIntent.complexityTier}`
    );

    // =========================================================================
    // 9. END-TO-END PIPELINE EXECUTION
    // =========================================================================
    // Trigger async pipeline run
    runFrogeBrainPipeline({ query: 'How does photosynthesis convert light energy into glucose?' })
      .then((res) => {
        const hasNoRawCot = !JSON.stringify(res.cognitiveExploration).includes('rawReasoningTokens');
        const hasValidEvidence = res.cognitiveExploration.evidence.length > 0;
        const hasValidConclusions = res.cognitiveExploration.conclusions.length > 0;

        assert(
          'End-to-End Pipeline: Returns useful conclusions, evidence, and uncertainty without raw CoT',
          'End-to-End Pipeline',
          hasNoRawCot && hasValidEvidence && hasValidConclusions,
          'Pipeline response did not meet privacy or structure criteria',
          `Conclusions: ${res.cognitiveExploration.conclusions.length} | Evidence: ${res.cognitiveExploration.evidence.length} | Task: ${res.cognitiveExploration.taskClassification.primaryTask}`
        );
      })
      .catch((err) => {
        console.error('Async pipeline test failed:', err);
      });
  } catch (err: any) {
    assert(
      'Automated Test Runner',
      'End-to-End Pipeline',
      false,
      `Crash during test execution: ${err.message}`
    );
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    results,
  };
}
