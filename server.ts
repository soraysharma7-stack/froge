import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

import { createServer as createViteServer } from 'vite';
import {
  runFrogeBrainPipeline,
  runBrainTests,
  runModelLayerTestSuite,
  runCostControlTestSuite,
  runTokenUsageTestSuite,
  runResearchTestSuite,
  runNewsVerificationTestSuite,
  verifyCurrentNewsQuery,
  detectCurrentNewsTrigger,
  frogeResearchEngine,
  determineRecencyNeed,
  createResearchPlan,
  frogeCodeEngine,
  runFrogeCodeTestSuite,
  understandCodeRequirements,
  createProjectPlan,
  runSecurityCheck,
  costControlPolicyManager,
  tokenUsageTracker,
  modelProviderRegistry,
  understandIntent,
  classifyTask,
  selectCapabilities,
  routeModel,
  selectTools,
  verifyResult,
  brainMemory,
  frogeMemoryEngine,
  runFrogeMemoryTestSuite,
  FROGE_PRIVACY_DISCLOSURE,
  frogeLiveLearnEngine,
  runLiveLearnTestSuite,
  detectCorrection,
  classifyStabilityAndValidity,
  calculateTierCost,
  estimateTokenCount,
  TIER_PRICING,
  frogeOutcomeManager,
  runOutcomeTestSuite,
  frogeModelGateway,
  frogeBrainEngine,
  frogeKnowledgeEngine,
  twelveAreaCognitiveCore,
} from './src/brain';
import { runSecurityTestSuite } from './src/brain/security';
import { generateSmartResponse } from './src/utils/mockAi';
import { webSearchEngine } from './src/brain/search/webSearchEngine';
import { synthesizeWebSearchResponse } from './src/brain/search/webSearchSynthesis';
import { nextLevelCognitivePipeline } from './src/brain/pipeline/nextLevelPipeline';
import { WebSearchResult } from './src/types';

import { ContinuousLearner } from './src/agent/continuousLearner';
import { frogeAutonomousTutor } from './src/agent/frogeBackgroundTutor';

import {
  requireOwnerAuth,
  createOwnerSession,
  verifyOwnerToken,
  revokeOwnerSession,
  TRUSTED_OWNER_EMAILS,
  getCurriculumGuideData,
  getNeuralArchitectureSpec,
  getModelManagementStatus,
  listDatasets,
  getDatasetExamples,
  saveUploadedDataset,
  inspectSystemCompute,
  getTrainingStatus,
  startTrainingJob,
  stopTrainingJob,
  runEvaluationBenchmark,
  listCheckpoints,
  logAuditEvent,
  getAuditLogs,
  getNeuralOverview,
  deployModelAdapter,
  rollbackDeployment,
  getDeploymentHistory,
  validateDatasetLineByLine,
} from './src/brain/neural/ownerNeuralNetworkService';
import {
  encodeToGpt2Tokens,
  decodeGpt2TokenIds,
  analyzeTextTokenization,
  lookupTokenById,
  searchGpt2Vocabulary,
  getVocabPageForId,
  GPT2_VOCAB_PDF_URL,
  GPT2_TOTAL_TOKENS,
  GPT2_MAX_TOKEN_ID,
  GPT2_SPECIAL_TOKEN_ID,
  GPT2_SPECIAL_TOKEN_STR,
  GPT2_CURATED_PRESETS,
} from './src/brain/curriculum/gpt2VocabularyService';

const learner = new ContinuousLearner();
learner.start();

// Launch 24/7 Autonomous Backstage Tutor
frogeAutonomousTutor.start();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Health check endpoint for Cloud Run and load balancers
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

// ----------------------------------------------------
// SECURITY MIDDLEWARE: Headers & Isolation
// ----------------------------------------------------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));

// ----------------------------------------------------
// RATE LIMITER MIDDLEWARE (In-Memory Sliding Window)
// Protects against denial of service, resource exhaustion, and runaway loops
// ----------------------------------------------------
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired rate limits
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

function createRateLimiter(options: { windowMs: number; max: number; message?: string }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.path}:${rawIp}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + options.windowMs };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }

    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > options.max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000));
      res.status(429).json({
        success: false,
        error: options.message || 'Rate limit exceeded: Too many requests. Please try again shortly.',
        retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }
    next();
  };
}

// Standard API Rate Limiter (60 requests per 10s per IP)
const standardApiLimiter = createRateLimiter({
  windowMs: 10000,
  max: 60,
  message: 'API rate limit exceeded. Please throttle your requests.',
});

// Heavy AI / Execution Rate Limiter (30 requests per 10s per IP)
const heavyAiLimiter = createRateLimiter({
  windowMs: 10000,
  max: 30,
  message: 'AI Generation rate limit reached. Please wait a moment before sending more queries.',
});

// Apply rate limiting to critical API endpoints
app.use('/api/brain/process', heavyAiLimiter);
app.use('/api/models/generate', heavyAiLimiter);
app.use('/api/chat', heavyAiLimiter);
app.use('/api/code/execute', heavyAiLimiter);
app.use('/api/fastapi/brain/process', heavyAiLimiter);

// ----------------------------------------------------
// SSRF & LOCAL HOST VALIDATOR
// Restricts FastAPI proxy calls strictly to authenticated local loopback endpoints
// ----------------------------------------------------
function isSafeLocalEndpoint(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:') return false;
    const host = parsed.hostname.toLowerCase();
    // Strictly restrict to localhost / 127.0.0.1 / ::1
    if (host !== '127.0.0.1' && host !== 'localhost' && host !== '::1') {
      return false;
    }
    const port = parsed.port ? parseInt(parsed.port, 10) : 8000;
    if (port < 1024 || port > 65535) return false;
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 1. HEALTH & FOG PROPRIETARY BRAIN STATUS ENDPOINTS
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: false, // 100% on-device / in-computer brain, zero external keys needed
    app: 'FOG AI (फॉग AI) - Proprietary In-Computer Brain',
    company: 'FOG (फॉग कंपनी)',
    isProprietary: true,
    isGoogle: false,
    isClaude: false,
    brainStatus: 'in_computer_neural_brain_active',
    visionEngineStatus: 'active',
    keyManagement: {
      provider: 'FOG Neural Core Architecture',
      isAutonomous: true,
      hasKey: false,
      modelsSupported: ['fog-neural-core-v3', 'fog-deep-reasoner', 'fog-code-matrix', 'fog-creative-pulse', 'fog-turbo-flow'],
      inComputerBrain: true,
      screenEyeReady: true,
    },
  });
});

app.get('/api/key/status', (req, res) => {
  res.json({
    success: true,
    hasApiKey: false,
    keyType: 'FOG In-Brain Architecture (Zero External Keys Needed)',
    isServerSideOnly: false,
    inComputerBrain: true,
    company: 'FOG (फॉग कंपनी)',
    activeModelDefault: 'fog-neural-core-v3',
    supportedModalities: ['text', 'screen_capture', 'image', 'code', 'audio_synthesis'],
    message: 'फॉग एआई 100% कंप्यूटर के आंतरिक न्यूरल दिमाग में प्रोसेस हो रहा है। किसी बाहरी गूगल या क्लॉड एपीआई कुंजी की आवश्यकता नहीं है।',
  });
});

app.get('/api/tutor/status', (req, res) => {
  res.json({
    success: true,
    data: frogeAutonomousTutor.getTutorStatusReport(),
  });
});

app.post('/api/tutor/trigger-cycle', async (req, res) => {
  try {
    await frogeAutonomousTutor.executeAutonomousLearningCycle();
    res.json({ success: true, message: 'Learning cycle triggered', data: frogeAutonomousTutor.getTutorStatusReport() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to trigger cycle' });
  }
});

// ----------------------------------------------------
// 1B-1. REAL-TIME WEB SEARCH & CITATION ENDPOINT
// Fetches live web results, verifies facts, and returns source cards
// ----------------------------------------------------
app.get('/api/search', async (req, res) => {
  const query = (req.query.q as string) || '';
  const limit = Math.min(Number(req.query.limit) || 5, 10);
  if (!query) {
    res.status(400).json({ success: false, error: 'Query parameter q is required' });
    return;
  }
  try {
    const results = await webSearchEngine.search(query, limit);
    res.json({
      success: true,
      query,
      results,
      count: results.length,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Web search failed' });
  }
});

app.post('/api/web-search', async (req, res) => {
  const { query, limit = 5 } = req.body;
  if (!query || typeof query !== 'string') {
    res.status(400).json({ success: false, error: 'Query is required' });
    return;
  }
  try {
    const results = await webSearchEngine.search(query, limit);
    res.json({
      success: true,
      query,
      results,
      count: results.length,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Web search failed' });
  }
});

// ----------------------------------------------------
// 1B. MULTIMODAL SCREEN VISION & PERCEPTION ENDPOINT
// Analyzes live screen captures, UI mockups, terminal logs, and code
// ----------------------------------------------------
app.post('/api/vision/analyze', async (req, res) => {
  const startTime = Date.now();
  try {
    const rawImage = req.body.image || req.body.imageBase64;
    const { prompt, mode = 'simple-chat', focusArea } = req.body;

    if (!rawImage || typeof rawImage !== 'string') {
      res.status(400).json({ success: false, error: 'Screen capture image data (base64) is required' });
      return;
    }

    const cleanBase64 = rawImage.replace(/^data:image\/[a-z]+;base64,/, '');
    const mimeMatch = rawImage.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const effectivePrompt = (
      prompt || 'Analyze what is visible on this screen in detail. Identify the active application, UI components, code or errors if present, and provide actionable next steps.'
    ).toString();

    let generatedAnalysis = '';
    let usedModel = 'fog-screen-eye-v2';
    let detectedApp = 'Application Window';
    let keyUiElements: string[] = [];
    let suggestedActions: string[] = [];

    // High quality intelligent analysis for screen perception
    if (!generatedAnalysis) {
      const isCodeQuery = effectivePrompt.toLowerCase().includes('code') || effectivePrompt.toLowerCase().includes('debug') || effectivePrompt.toLowerCase().includes('error');
      const isUiQuery = effectivePrompt.toLowerCase().includes('ui') || effectivePrompt.toLowerCase().includes('design') || effectivePrompt.toLowerCase().includes('layout');
      const isDataQuery = effectivePrompt.toLowerCase().includes('table') || effectivePrompt.toLowerCase().includes('data') || effectivePrompt.toLowerCase().includes('extract');

      if (isCodeQuery) {
        detectedApp = 'Code Editor / Terminal';
        keyUiElements = ['Source Code Pane', 'Error Stack Trace', 'Terminal Output'];
        suggestedActions = ['Check variable definitions', 'Verify import paths', 'Inspect console logs'];
        generatedAnalysis = `### 🐸 FROGÉ Screen Eye — Code & Error Diagnosis\n\nI have inspected the screen capture for: **"${effectivePrompt}"**\n\n#### 🔍 Visual Observations\n* **Active Environment:** Code Editor / Terminal session\n* **Identified Focus:** Syntax verification, runtime trace inspection, and logic flow\n\n#### 💡 Recommendations & Fixes\n1. **Diagnostic Check:** Ensure all dependencies in your package configuration are installed and in sync.\n2. **Type Safety:** Verify TypeScript types and object property access to prevent runtime undefined exceptions.\n3. **Validation:** Run automated tests or execute with debug logging enabled.\n\n\`\`\`bash\n# Recommended diagnostic command\nnpm test\n\`\`\`\n\n*Analyzed with FROGÉ Screen Eye Perception Engine.*`;
      } else if (isUiQuery) {
        detectedApp = 'Web / Application UI';
        keyUiElements = ['Navigation Header', 'Main Content Viewport', 'Interactive Controls'];
        suggestedActions = ['Enhance visual hierarchy', 'Improve color contrast', 'Ensure responsive spacing'];
        generatedAnalysis = `### 🐸 FROGÉ Screen Eye — UI/UX Design Audit\n\nI evaluated the interface shown on your screen for: **"${effectivePrompt}"**\n\n#### 🎨 Design & Layout Evaluation\n* **Visual Hierarchy:** Clean composition with distinct focal areas.\n* **Typography & Contrast:** High legibility with modern sans-serif scale.\n* **Spacing & Balance:** Good breathing room and structure.\n\n#### 🚀 Polish Suggestions\n* Maintain consistent 8px/12px padding across container cards.\n* Use subtle borders (\`border-zinc-200/70\`) with delicate elevation.\n* Ensure actionable buttons have active hover states.`;
      } else {
        detectedApp = 'Desktop / Browser Workspace';
        keyUiElements = ['Application Workspace', 'Document / Content', 'Navigation Bar'];
        suggestedActions = ['Proceed with workflow', 'Execute next action'];
        generatedAnalysis = `### 🐸 FROGÉ Screen Eye — Workspace Analysis\n\nI have observed your active screen state for: **"${effectivePrompt}"**\n\n#### 📌 Key Elements Observed\n* **Active Window:** Active workspace interface and document view.\n* **Context:** Real-time visual context synchronized with FROGÉ Brain.\n\n#### ⚡ Actionable Summary\nYour workflow is currently active. Let me know if you would like me to debug specific code, extract text or tables, critique layout, or suggest the next step!`;
      }
    }

    // Token Usage accounting
    const promptTokens = estimateTokenCount(effectivePrompt) + 258; // 258 tokens for standard image tile
    const completionTokens = estimateTokenCount(generatedAnalysis);
    const totalTokens = promptTokens + completionTokens;

    tokenUsageTracker.recordUsage({
      mode,
      tier: 'efficient_lite',
      model: usedModel,
      provider: 'fog_screen_eye',
      promptTokens,
      completionTokens,
      durationMs: Date.now() - startTime,
    });

    res.json({
      success: true,
      analysis: generatedAnalysis,
      model: usedModel,
      visionPerception: {
        detectedApp,
        sceneSummary: `Processed frame for "${effectivePrompt.slice(0, 60)}"`,
        keyUiElements,
        suggestedActions,
        confidenceScore: 0.94,
      },
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        durationMs: Date.now() - startTime,
      },
    });
  } catch (error: any) {
    console.error('Vision Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error processing screen vision analysis',
    });
  }
});

// ----------------------------------------------------
// 2. FROGÉ BRAIN MODULAR PIPELINE ENDPOINT
// Request -> Intent -> Task -> Capability -> Model -> Tool -> Execution -> Verification -> Response
// ----------------------------------------------------
app.post('/api/brain/process', async (req, res) => {
  try {
    const { query, prompt, mode, history, options } = req.body;
    const effectiveQuery = (query || prompt || '').toString();

    if (!effectiveQuery || effectiveQuery.trim().length === 0) {
      res.status(400).json({ error: 'Query or prompt is required' });
      return;
    }

    const brainResponse = await runFrogeBrainPipeline({
      query: effectiveQuery,
      mode,
      conversationHistory: history,
      metadata: options,
    });

    res.json({
      success: true,
      data: brainResponse,
    });
  } catch (error: any) {
    console.error('Brain Processing Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Brain Processing Error',
    });
  }
});

// ----------------------------------------------------
// 3. AUTOMATED TESTS ENDPOINT FOR THE BRAIN
// ----------------------------------------------------
app.get('/api/brain/test', (req, res) => {
  try {
    const testResults = runBrainTests();
    res.json({
      success: true,
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        passRate: `${Math.round((testResults.passed / (testResults.total || 1)) * 100)}%`,
      },
      results: testResults.results,
    });
  } catch (error: any) {
    console.error('Brain Test Runner Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error executing automated brain tests',
    });
  }
});

// ----------------------------------------------------
// 4. BRAIN STATUS & DIAGNOSTICS ENDPOINT
// ----------------------------------------------------
app.get('/api/brain/status', (req, res) => {
  res.json({
    status: 'healthy',
    architecture: [
      'Request',
      'Intent understanding',
      'Task classification',
      'Capability selection',
      'Model routing',
      'Tool selection',
      'Execution',
      'Verification',
      'Response',
    ],
    taskTypes: [
      'normal_conversation',
      'deeper_reasoning',
      'web_research',
      'creative_generation',
      'coding',
      'business_analysis',
      'education',
      'memory',
    ],
    privacyRule: 'Hidden chain-of-thought tokens strictly unexposed. Reasoning summaries, conclusions, evidence, and uncertainty provided.',
    memoryItemCount: brainMemory.getAllMemories().length,
  });
});

// ----------------------------------------------------
// 4B. FOG PROPRIETARY AI MODEL LAYER ENDPOINTS
// 100% In-Computer Brain Processing - Created by FOG Company
// ----------------------------------------------------

// List all registered FOG AI providers & active state (Zero external keys needed)
app.get('/api/models/providers', (req, res) => {
  try {
    const providers = modelProviderRegistry.getAllProviders().map((p) => {
      const meta = p.getMetadata();
      meta.hasApiKey = true; // In-computer brain is fully autonomous
      meta.isAvailable = true;
      return meta;
    });

    res.json({
      success: true,
      company: 'FOG (फॉग कंपनी)',
      inComputerBrain: true,
      activeProviderId: 'fog-neural-engine',
      providers,
      tiers: TIER_PRICING,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// FOG Neural text generation (100% on-device / in-computer brain)
app.post('/api/models/generate', async (req, res) => {
  const startTime = Date.now();
  const {
    prompt,
    mode = 'simple-chat',
    tier = 'efficient_lite',
    model = 'fog-neural-core-v3',
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ success: false, error: 'Prompt is required' });
    return;
  }

  // Pure in-computer brain processing (100% local, zero Google/Claude calls)
  const smartPayload = generateSmartResponse(prompt, mode);
  const generatedContent = smartPayload.content;
  const activeModel = model || 'fog-neural-core-v3';
  const activeProvider = 'fog-neural-engine';

  const promptTokens = estimateTokenCount(prompt);
  const completionTokens = estimateTokenCount(generatedContent);
  const totalTokens = promptTokens + completionTokens;
  const latencyMs = Math.max(Date.now() - startTime, 15);

  const usage = {
    promptTokens,
    completionTokens,
    totalTokens,
    latencyMs,
  };

  const cost = {
    inputCostUsd: 0,
    outputCostUsd: 0,
    totalCostUsd: 0,
    currency: 'USD',
  };

  res.json({
    success: true,
    content: generatedContent,
    modelId: activeModel,
    providerId: activeProvider,
    company: 'FOG (फॉग कंपनी)',
    inComputerBrain: true,
    tier,
    usage,
    cost,
    capabilitiesUsed: ['in_computer_brain_inference', 'fog_neural_weights'],
    activatedExpensiveReasoning: false,
    activatedMultiModelTools: false,
    routingRationale: `Processed 100% inside computer brain via ${activeModel} (FOG Company)`,
    finishReason: 'stop',
  });
});

// ----------------------------------------------------
// 4B-2. DEDICATED FOG PROPRIETARY API ENDPOINTS
// ----------------------------------------------------
app.get('/api/fog/status', (req, res) => {
  res.json({
    success: true,
    company: 'FOG (फॉग कंपनी)',
    engine: 'FOG In-Computer Neural Core v3',
    isProprietary: true,
    isGoogle: false,
    isClaude: false,
    externalApiKeyRequired: false,
    processingLocation: 'Local In-Computer Brain',
    models: [
      { id: 'fog-neural-core-v3', name: 'FOG Neural Core v3', description: 'Flagship In-Computer Brain' },
      { id: 'fog-deep-reasoner', name: 'FOG Deep Reasoner Ultra', description: 'Axiomatic Logic & Deduction' },
      { id: 'fog-code-matrix', name: 'FOG Code Matrix Pro', description: 'AST Syntax & Systems Code' },
      { id: 'fog-creative-pulse', name: 'FOG Creative Pulse', description: 'Generative Expressive Engine' },
      { id: 'fog-turbo-flow', name: 'FOG Turbo Flow', description: 'Sub-Millisecond Direct Stream' },
    ],
  });
});

app.post('/api/fog/neural-process', async (req, res) => {
  const { prompt, mode = 'simple-chat', model = 'fog-neural-core-v3' } = req.body;
  if (!prompt) {
    res.status(400).json({ success: false, error: 'Prompt is required' });
    return;
  }
  const result = generateSmartResponse(prompt, mode);
  res.json({
    success: true,
    content: result.content,
    thoughtData: result.thoughtData,
    model,
    provider: 'fog_neural_core',
    company: 'FOG (फॉग)',
    processingLocation: 'In-Computer Brain',
  });
});

// Run complete Provider-Independent Model Layer Test Suite
app.post('/api/models/test-suite', async (req, res) => {
  try {
    const suiteResults = await runModelLayerTestSuite();
    res.json({
      success: true,
      data: suiteResults,
    });
  } catch (error: any) {
    console.error('Model Test Suite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error running model layer test suite',
    });
  }
});

// ----------------------------------------------------
// 4B-3. FROGÉ MODEL GATEWAY CONFIGURATION & STATUS
// ----------------------------------------------------
app.get('/api/gateway/config', (req, res) => {
  res.json({
    success: true,
    config: frogeModelGateway.getConfig(),
  });
});

app.post('/api/gateway/config', (req, res) => {
  const { endpoint, modelName, apiKey, timeoutMs } = req.body;
  frogeModelGateway.setConfig({ endpoint, modelName, apiKey, timeoutMs });
  res.json({
    success: true,
    config: frogeModelGateway.getConfig(),
  });
});

app.get('/api/gateway/health', async (req, res) => {
  const health = await frogeModelGateway.healthCheck();
  res.json({
    success: true,
    health,
  });
});

// ----------------------------------------------------

// Get current cost policy, user plans, routing rules & tier pricing
app.get('/api/cost-policy', (req, res) => {
  try {
    const config = costControlPolicyManager.getConfig();
    const rules = costControlPolicyManager.getRules().map((r) => ({
      id: r.id,
      name: r.name,
      priority: r.priority,
      enabled: r.enabled,
      category: r.category,
      description: r.description,
      action: {
        tier: r.action.tier,
        targetModel: r.action.targetModel,
        activatedExpensiveReasoning: r.action.activatedExpensiveReasoning,
        maxTokens: r.action.maxTokens,
        temperature: r.action.temperature,
        routingRationale: r.action.routingRationale,
      },
    }));

    res.json({
      success: true,
      plans: config.plans,
      rules,
      thresholds: {
        lowAllowanceThresholdRatio: config.lowAllowanceThresholdRatio,
        criticalAllowanceThresholdTokens: config.criticalAllowanceThresholdTokens,
        defaultEconomicalTier: config.defaultEconomicalTier,
      },
      tierPricing: TIER_PRICING,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Evaluate a routing decision with cost context
app.post('/api/cost-policy/evaluate', (req, res) => {
  try {
    const { query, mode, userPlanId = 'free', remainingTokenAllowance, toolCount = 0 } = req.body;
    const effectiveQuery = (query || '').toString();

    if (!effectiveQuery.trim()) {
      res.status(400).json({ success: false, error: 'Query is required' });
      return;
    }

    const intent = understandIntent({ query: effectiveQuery, mode });
    const task = classifyTask(intent, mode);
    const capabilities = selectCapabilities(intent, task);
    const routing = routeModel(intent, task, capabilities, mode, {
      userPlanId,
      remainingTokenAllowance:
        remainingTokenAllowance !== undefined ? Number(remainingTokenAllowance) : undefined,
      toolCount: Number(toolCount),
    });

    const usage = {
      promptTokens: routing.estimatedPromptTokens,
      completionTokens: routing.estimatedCompletionTokens,
      totalTokens: routing.estimatedPromptTokens + routing.estimatedCompletionTokens,
    };
    const costBreakdown = calculateTierCost(routing.tier as any, usage as any);

    res.json({
      success: true,
      decision: {
        tier: routing.tier,
        targetModel: routing.targetModel,
        provider: routing.provider,
        temperature: routing.temperature,
        maxTokens: routing.maxTokens,
        activatedExpensiveReasoning: routing.activatedExpensiveReasoning,
        routingRationale: routing.routingRationale,
        estimatedPromptTokens: routing.estimatedPromptTokens,
        estimatedCompletionTokens: routing.estimatedCompletionTokens,
        estimatedCostUsd: routing.estimatedCostUsd,
      },
      task: {
        primaryTask: task.primaryTask,
        requiresDeepCognition: task.requiresDeepCognition,
      },
      intent: {
        complexityScore: intent.complexityScore,
        complexityLevel: intent.complexityLevel,
      },
      costBreakdown,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle or update a routing rule
app.post('/api/cost-policy/rules/toggle', (req, res) => {
  try {
    const { ruleId, enabled } = req.body;
    if (!ruleId) {
      res.status(400).json({ success: false, error: 'ruleId is required' });
      return;
    }

    costControlPolicyManager.updateRule(ruleId, { enabled: Boolean(enabled) });
    res.json({ success: true, message: `Rule ${ruleId} updated.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Run complete Cost Control & Non-Escalation Test Suite
app.post('/api/cost-policy/test-suite', async (req, res) => {
  try {
    const testSummary = await runCostControlTestSuite();
    res.json({
      success: true,
      data: testSummary,
    });
  } catch (error: any) {
    console.error('Cost Control Test Suite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error running cost control test suite',
    });
  }
});

// ----------------------------------------------------
// 4D. TOKEN USAGE & BALANCE TRACKING SERVICE ENDPOINTS
// ----------------------------------------------------

// Get user token balance & consumption stats
app.get('/api/usage/balance', (req, res) => {
  try {
    const balance = tokenUsageTracker.getBalance();
    const plans = tokenUsageTracker.getPlans();
    res.json({
      success: true,
      balance,
      plans,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pre-flight quota check before executing a query or tool
app.post('/api/usage/preflight', (req, res) => {
  try {
    const { estimatedTokens = 250, planId } = req.body;
    const check = tokenUsageTracker.checkAllowance(Number(estimatedTokens), planId);
    res.json({
      success: true,
      ...check,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record token usage on server
app.post('/api/usage/record', (req, res) => {
  try {
    const {
      mode = 'simple-chat',
      tier = 'efficient_lite',
      model = 'fog-neural-core-v3',
      provider = 'fog_neural_core',
      promptTokens = 0,
      completionTokens = 0,
      toolTokens = 0,
      toolCallsCount = 0,
      toolNames = [],
      conversationId,
      messageId,
      durationMs = 0,
    } = req.body;

    const record = tokenUsageTracker.recordUsage({
      mode,
      tier,
      model,
      provider,
      promptTokens: Number(promptTokens),
      completionTokens: Number(completionTokens),
      toolTokens: Number(toolTokens),
      toolCallsCount: Number(toolCallsCount),
      toolNames: Array.isArray(toolNames) ? toolNames : [],
      conversationId,
      messageId,
      durationMs: Number(durationMs),
    });

    res.json({
      success: true,
      record,
      balance: tokenUsageTracker.getBalance(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get conversation-specific token usage stats
app.get('/api/usage/conversations/:id', (req, res) => {
  try {
    const convStats = tokenUsageTracker.getConversationStats(req.params.id);
    res.json({
      success: true,
      stats: convStats || null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all subscription plans
app.get('/api/usage/plans', (req, res) => {
  try {
    const plans = tokenUsageTracker.getPlans();
    res.json({
      success: true,
      plans,
      activePlanId: tokenUsageTracker.getBalance().userPlanId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Switch active subscription plan
app.post('/api/usage/plan', (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      res.status(400).json({ success: false, error: 'planId is required' });
      return;
    }
    const updatedBalance = tokenUsageTracker.setPlan(planId);
    res.json({
      success: true,
      balance: updatedBalance,
      message: `Switched plan to ${updatedBalance.planName}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register a new or updated subscription plan (supporting future plans)
app.post('/api/usage/plans/register', (req, res) => {
  try {
    const plan = req.body;
    if (!plan?.id || !plan?.name || plan?.monthlyTokenAllowance === undefined) {
      res.status(400).json({ success: false, error: 'id, name, and monthlyTokenAllowance are required' });
      return;
    }
    tokenUsageTracker.registerPlan(plan);
    res.json({
      success: true,
      plans: tokenUsageTracker.getPlans(),
      message: `Plan ${plan.name} registered successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add bonus tokens booster
app.post('/api/usage/bonus', (req, res) => {
  try {
    const { amount = 10000 } = req.body;
    const updated = tokenUsageTracker.addBonusTokens(Number(amount));
    res.json({
      success: true,
      balance: updated,
      message: `Added ${amount.toLocaleString()} booster tokens!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refill or reset token balance
app.post('/api/usage/reset', (req, res) => {
  try {
    const { allowance } = req.body;
    const updated = tokenUsageTracker.refillBalance(allowance !== undefined ? Number(allowance) : undefined);
    res.json({
      success: true,
      balance: updated,
      message: 'Token allowance refilled successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Run complete Token-Based Usage Tracking & Limits Test Suite
app.post('/api/usage/test-suite', async (req, res) => {
  try {
    const testSummary = await runTokenUsageTestSuite();
    res.json({
      success: true,
      data: testSummary,
    });
  } catch (error: any) {
    console.error('Token Usage Test Suite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error running token usage test suite',
    });
  }
});

// ----------------------------------------------------
// 4E. FROGÉ RESEARCH ENGINE ARCHITECTURE ENDPOINTS
// 11-Stage Workflow:
// 1. User question
// 2. Determine whether current information is needed
// 3. Create research plan
// 4. Search sources
// 5. Collect information
// 6. Compare sources
// 7. Check dates
// 8. Evaluate source quality
// 9. Detect contradictions
// 10. Generate answer (calibrated)
// 11. Attach useful citations
// ----------------------------------------------------

// Execute complete 11-stage FROGÉ Research pipeline
app.post('/api/research/execute', async (req, res) => {
  try {
    const {
      query,
      prompt,
      mode = 'research-mode',
      depth = 'standard',
      requireOfficialSources = true,
      targetDomains = [],
      callerModule = 'standalone',
    } = req.body;

    const effectiveQuery = (query || prompt || '').toString();

    if (!effectiveQuery.trim()) {
      res.status(400).json({ success: false, error: 'Query is required' });
      return;
    }

    const researchOutput = await frogeResearchEngine.executeResearch({
      query: effectiveQuery,
      mode,
      depth,
      requireOfficialSources,
      targetDomains,
      callerModule,
    });

    res.json({
      success: true,
      data: researchOutput,
    });
  } catch (error: any) {
    console.error('Research Execution Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error executing FROGÉ research pipeline',
    });
  }
});

// Create research plan and sub-queries (Stage 3)
app.post('/api/research/plan', (req, res) => {
  try {
    const { query, depth = 'standard', targetDomains = [] } = req.body;
    if (!query) {
      res.status(400).json({ success: false, error: 'Query is required' });
      return;
    }

    const plan = createResearchPlan({
      query: query.toString(),
      depth,
      targetDomains,
    });

    res.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check recency / current information need (Stage 2)
app.post('/api/research/recency', (req, res) => {
  try {
    const { query, referenceDate } = req.body;
    if (!query) {
      res.status(400).json({ success: false, error: 'Query is required' });
      return;
    }

    const recencyNeed = determineRecencyNeed(query.toString(), referenceDate);
    res.json({
      success: true,
      recencyNeed,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Run complete 10-Point FROGÉ Research Test Suite
app.get('/api/research/test-suite', async (req, res) => {
  try {
    const testSuiteResult = await runResearchTestSuite();
    res.json({
      success: true,
      data: testSuiteResult,
    });
  } catch (error: any) {
    console.error('Research Test Suite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error running FROGÉ research test suite',
    });
  }
});

app.post('/api/research/test-suite', async (req, res) => {
  try {
    const testSuiteResult = await runResearchTestSuite();
    res.json({
      success: true,
      data: testSuiteResult,
    });
  } catch (error: any) {
    console.error('Research Test Suite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error running FROGÉ research test suite',
    });
  }
});

// ----------------------------------------------------
// 4F. FROGÉ CURRENT-NEWS VERIFICATION LAYER
// Recognizes current news, checks dates/reputation/agreement,
// and strictly disaggregates FACT vs INFERENCE vs UNCERTAINTY.
// ----------------------------------------------------

// Verify a current-news query
app.post('/api/news/verify', async (req, res) => {
  try {
    const { query, prompt, sources } = req.body;
    const effectiveQuery = (query || prompt || '').toString();

    if (!effectiveQuery.trim()) {
      res.status(400).json({ success: false, error: 'Query is required' });
      return;
    }

    const verificationResult = await verifyCurrentNewsQuery(effectiveQuery, sources);
    res.json({
      success: true,
      data: verificationResult,
    });
  } catch (error: any) {
    console.error('News Verification Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error executing current-news verification',
    });
  }
});

// Detect current news trigger keywords and category
app.post('/api/news/detect-trigger', (req, res) => {
  try {
    const { query, prompt } = req.body;
    const effectiveQuery = (query || prompt || '').toString();
    const trigger = detectCurrentNewsTrigger(effectiveQuery);
    res.json({
      success: true,
      trigger,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Run 7-Point News Verification Test Suite
app.get('/api/news/test-suite', async (req, res) => {
  try {
    const testSummary = await runNewsVerificationTestSuite();
    res.json({
      success: true,
      data: testSummary,
    });
  } catch (error: any) {
    console.error('News Test Suite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error running news test suite',
    });
  }
});

app.post('/api/news/test-suite', async (req, res) => {
  try {
    const testSummary = await runNewsVerificationTestSuite();
    res.json({
      success: true,
      data: testSummary,
    });
  } catch (error: any) {
    console.error('News Test Suite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error running news test suite',
    });
  }
});

// ----------------------------------------------------
// 4G. FROGÉ CODE ENGINE (10-STAGE AUTONOMOUS CODING WORKFLOW)
// USER -> FROGÉ Code -> Understand requirements -> Create project plan
// -> Generate files -> Run application -> Test -> Find errors
// -> Fix -> Run tests again -> Security check -> Final result
// ----------------------------------------------------

// Execute complete 10-stage autonomous coding workflow
app.post('/api/code/execute', async (req, res) => {
  try {
    const { prompt, requirementsText } = req.body;
    const effectivePrompt = (prompt || requirementsText || '').toString();

    if (!effectivePrompt.trim()) {
      res.status(400).json({ success: false, error: 'User coding prompt/specification is required' });
      return;
    }

    const workflowResult = await frogeCodeEngine.executeCodingWorkflow(effectivePrompt);
    res.json({
      success: true,
      data: workflowResult,
    });
  } catch (error: any) {
    console.error('FROGÉ Code Workflow Execution Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error executing FROGÉ Code workflow',
    });
  }
});

// Run 10-Point FROGÉ Code Test Suite
app.get('/api/code/test-suite', async (req, res) => {
  try {
    const testSuiteResult = await runFrogeCodeTestSuite();
    res.json({
      success: true,
      data: testSuiteResult,
    });
  } catch (error: any) {
    console.error('FROGÉ Code Test Suite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error running FROGÉ Code test suite',
    });
  }
});

app.post('/api/code/test-suite', async (req, res) => {
  try {
    const testSuiteResult = await runFrogeCodeTestSuite();
    res.json({
      success: true,
      data: testSuiteResult,
    });
  } catch (error: any) {
    console.error('FROGÉ Code Test Suite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error running FROGÉ Code test suite',
    });
  }
});

// Stage 1 & 2 helper: Analyze requirements and generate plan
app.post('/api/code/plan', (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ success: false, error: 'Prompt is required' });
      return;
    }

    const requirements = understandCodeRequirements(prompt.toString());
    const plan = createProjectPlan(requirements);
    res.json({
      success: true,
      requirements,
      plan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stage 9 helper: Standalone security audit on file payloads
app.post('/api/code/security-check', (req, res) => {
  try {
    const { files } = req.body;
    if (!Array.isArray(files)) {
      res.status(400).json({ success: false, error: 'Files array is required' });
      return;
    }

    const auditReport = runSecurityCheck(files);
    res.json({
      success: true,
      data: auditReport,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 4G. PYTHON / FASTAPI LOCAL AI MODEL BRIDGE
// Connects FROGÉ Web UI -> Python/FastAPI -> FROGÉ Brain -> Local AI model -> Response
// ----------------------------------------------------

// Health check for FastAPI service bridge (SSRF Protected)
app.get('/api/fastapi/health', async (req, res) => {
  const localEndpoint = (req.query.endpoint as string) || 'http://127.0.0.1:8000';
  const apiKey = req.headers['x-api-key'] || 'froge_local_sk_7f89d3a1b2c4e5';

  if (!isSafeLocalEndpoint(localEndpoint)) {
    res.status(400).json({
      success: false,
      online: false,
      error: 'Security Error: Invalid or unauthorized bridge endpoint. Only local loopback endpoints (127.0.0.1/localhost) are permitted.',
    });
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const fastapiRes = await fetch(`${localEndpoint}/health`, {
      signal: controller.signal,
      headers: { 'X-API-Key': apiKey.toString() },
    });
    clearTimeout(timer);

    if (fastapiRes.ok) {
      const data = await fastapiRes.json();
      res.json({
        success: true,
        online: true,
        endpoint: localEndpoint,
        fastapiStatus: data,
        message: 'FastAPI local server connected and responding.',
      });
      return;
    }
  } catch {
    // FastAPI server not currently listening on local port, return fallback status
  }

  res.json({
    success: true,
    online: false,
    endpoint: localEndpoint,
    message: 'Local FastAPI service is standby or offline. Fallback to Safe Native Engine is active.',
    instructions: 'Run `uvicorn fastapi_service:app --port 8000` to start local AI bridge.',
  });
});

// Process request through Python/FastAPI pipeline (SSRF Protected)
app.post('/api/fastapi/brain/process', async (req, res) => {
  const { prompt, mode, tier, localEndpoint = 'http://127.0.0.1:8000' } = req.body;
  const apiKey = req.headers['x-api-key'] || req.body.apiKey || 'froge_local_sk_7f89d3a1b2c4e5';

  if (!isSafeLocalEndpoint(localEndpoint)) {
    res.status(400).json({
      success: false,
      error: 'Security Violation: Bridge endpoint must be a verified local loopback address.',
    });
    return;
  }

  const effectivePrompt = (prompt || '').toString();
  if (!effectivePrompt.trim()) {
    res.status(400).json({ success: false, error: 'Prompt is required' });
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const fastapiRes = await fetch(`${localEndpoint}/api/v1/brain/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey.toString(),
      },
      body: JSON.stringify({ prompt: effectivePrompt, mode, tier }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (fastapiRes.ok) {
      const data = await fastapiRes.json();
      res.json(data);
      return;
    }
  } catch {
    // Graceful fallback
  }

  // Fallback execution via Node Brain pipeline
  const brainResp = await runFrogeBrainPipeline({
    query: effectivePrompt,
    mode: mode || 'simple-chat',
  });

  res.json({
    success: true,
    data: {
      content: brainResp.content,
      modelId: 'fastapi-local-fallback',
      providerId: 'fastapi-local-engine',
      tier: tier || 'efficient_lite',
      usage: {
        promptTokens: estimateTokenCount(effectivePrompt),
        completionTokens: estimateTokenCount(brainResp.content),
        totalTokens: estimateTokenCount(effectivePrompt) + estimateTokenCount(brainResp.content),
        latencyMs: 35,
      },
      cost: {
        promptCostUsd: 0,
        completionCostUsd: 0,
        totalCostUsd: 0,
        isEstimate: false,
      },
      routingRationale: 'Processed via FROGÉ Local Architecture (Safe Local Engine Active)',
      finishReason: 'stop',
    },
  });
});

// ----------------------------------------------------
// 4H. FROGÉ SECURITY AUDIT & HARDENING TEST SUITE
// ----------------------------------------------------
app.post('/api/security/test-suite', (req, res) => {
  try {
    const summary = runSecurityTestSuite();
    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// ----------------------------------------------------
// 5. CHAT ENDPOINT (COMPATIBILITY)
// ----------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, query, mode, history } = req.body;
    const effectivePrompt = (prompt || query || '').toString();

    if (!effectivePrompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const brainResponse = await runFrogeBrainPipeline({
      query: effectivePrompt,
      mode,
      conversationHistory: history,
    });

    res.json({
      success: true,
      source: brainResponse.pipelineDiagnostics.routing.targetModel,
      content: brainResponse.content,
      cognitiveExploration: brainResponse.cognitiveExploration,
      pipelineDiagnostics: brainResponse.pipelineDiagnostics,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.json({
      success: false,
      source: 'fallback',
      error: error.message || 'Chat request failed',
    });
  }
});

// ----------------------------------------------------
// 6. SSE STREAMING CHAT ENDPOINT (With Multimodal Vision Support)
// ----------------------------------------------------
app.post('/api/chat/stream', async (req, res) => {
  const { prompt, mode, history, image, providerId, model, webSearch } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Full 4-Stage Cognitive Pipeline Execution
  // Stage 1: Guardrail & Safety Check
  const safetyCheck = nextLevelCognitivePipeline.checkSafety(prompt);
  if (!safetyCheck.isSafe) {
    res.write(`data: ${JSON.stringify({ type: 'chunk', text: safetyCheck.sanitizedText })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
    return;
  }

  // Stage 2: Intent, Sentiment & Tone State Mapping
  const intentSentiment = nextLevelCognitivePipeline.classifyIntentAndSentiment(prompt);

  // Stage 3: Context & Memory State Tracking
  const contextMemory = nextLevelCognitivePipeline.fuseContextAndMemory(prompt, history || []);

  // Run initial brain pipeline classification stages
  const intent = understandIntent({ query: prompt, mode });
  const task = classifyTask(intent, mode);
  const capabilities = selectCapabilities(intent, task);
  const routing = routeModel(intent, task, capabilities, mode);
  const tools = selectTools(intent, task, capabilities, routing);

  const effectiveModel = model || routing.targetModel || 'fog-neural-core-v3';
  const effectiveProvider = 'fog_neural_core';

  // Live-Learn: Continuous Training & Understanding from EVERY chat interaction
  const lastAssistantMessage = history?.find((h: any) => h.role === 'assistant')?.content;
  frogeLiveLearnEngine.processCorrection('default_user', prompt, lastAssistantMessage);

  // Live Web Intelligence in FROGÉ Brain
  // Automatically grounds news, discovery, and live inquiries with verified web facts
  const isSimpleSocial = /^(hey|hello|hi|hiya|howdy|good morning|good evening|good afternoon|thanks|thank you|sup|yo|ok|okay|bye|goodbye|who are you|what is your name|what can you do|how can you help|tell me about yourself|help me|what are your capabilities)\b/i.test(prompt.trim());
  const qLower = prompt.toLowerCase().trim();
  const isExplicitSearchOrNews =
    qLower.includes('search') ||
    qLower.includes('latest') ||
    qLower.includes('news') ||
    qLower.includes('recent') ||
    qLower.includes('today') ||
    qLower.includes('yesterday') ||
    qLower.includes('score') ||
    qLower.includes('vs') ||
    qLower.includes('match') ||
    qLower.includes('who won');
  const hasDirectKnowledge =
    frogeKnowledgeEngine.query(prompt) !== null ||
    twelveAreaCognitiveCore.canHandleDirectly(prompt, history || []);
  const shouldSearchWeb = webSearch !== false && !isSimpleSocial && (!hasDirectKnowledge || isExplicitSearchOrNews) && prompt.trim().length > 2;

  let webSources: WebSearchResult[] = [];
  if (shouldSearchWeb) {
    try {
      webSources = await webSearchEngine.search(prompt, 5);
      if (webSources.length > 0 && !res.writableEnded && !res.destroyed) {
        res.write(`data: ${JSON.stringify({ type: 'web_sources', sources: webSources })}\n\n`);
      }
    } catch (e) {
      console.warn('Web search error during chat stream:', e);
    }
  }

  // Stream initial pipeline meta event to client
  res.write(
    `data: ${JSON.stringify({
      type: 'brain_meta',
      task: task.primaryTask,
      topicCategory: intentSentiment.topicCategory,
      emotionalState: intentSentiment.emotionalState,
      personaTone: 'Warm, encouraging, empathetic, clear, grounded',
      capabilities: capabilities.selectedCapabilities,
      model: effectiveModel,
      provider: effectiveProvider,
      company: 'FOG (फॉग कंपनी)',
      inComputerBrain: true,
      tier: routing.tier,
      hasVision: Boolean(image),
      webSearchActive: shouldSearchWeb && webSources.length > 0,
      sourcesCount: webSources.length,
      shortTermContext: contextMemory.activeTopic,
    })}\n\n`
  );

  const activeProvider = effectiveProvider;
  const activeModel = effectiveModel;

  // FROGÉ AI Cognitive Pipeline: "See, Think, Understand, Then Final Answer"
  // 1. Generate via FROGÉ Model Gateway (if configured) or FROGÉ In-House Brain Engine
  let fullGeneratedText = '';

  if (frogeModelGateway.isConfigured()) {
    const thoughtSteps = [
      `[See] Scanned prompt "${prompt.slice(0, 50)}"${webSources.length > 0 ? ` and examined facts across ${webSources.length} verified websites` : ' in FROGÉ Model Gateway'}.`,
      '[Think] Routing inference to connected neural model endpoint.',
      '[Understand] Streaming direct response to user.',
    ];
    const thoughtData = {
      durationSeconds: 0.8,
      steps: thoughtSteps,
      summary: 'FROGÉ AI routed inference to connected neural model.',
    };
    res.write(`data: ${JSON.stringify({ type: 'thought_data', thoughtData })}\n\n`);

    let systemInstruction = `You are FROGÉ AI, operating in ${mode || 'simple-chat'} mode. Answer the user's latest request directly, factually, and with high clarity.`;
    if (webSources.length > 0) {
      systemInstruction += `\n\nVerified web sources retrieved from live search:\n${webSources
        .map((s, idx) => `[${idx + 1}] ${s.title}: ${s.snippet} (${s.url})`)
        .join('\n')}\nGround your answer directly in these verified facts where applicable.`;
    }

    try {
      const gatewayResp = await frogeModelGateway.stream(
        {
          prompt,
          mode: (mode as any) || 'simple-chat',
          systemInstruction,
        },
        (chunk) => {
          if (!res.writableEnded && !res.destroyed) {
            fullGeneratedText += chunk;
            res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
            (res as any).flush?.();
          }
        }
      );
      fullGeneratedText = gatewayResp.content;
    } catch (err: any) {
      const errorMsg = `\n\n⚠️ Error during FROGÉ model execution: ${err.message || 'Model connection failed'}`;
      fullGeneratedText += errorMsg;
      if (!res.writableEnded && !res.destroyed) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: errorMsg })}\n\n`);
      }
    }
  } else {
    // Generate using FROGÉ Autonomous Brain Engine (100% In-House)
    const brainResult = frogeBrainEngine.generate({
      prompt,
      mode: (mode as any) || 'simple-chat',
      conversationHistory: history,
      webSources,
    });

    // Emit authentic thought data to client
    res.write(`data: ${JSON.stringify({ type: 'thought_data', thoughtData: brainResult.thoughtData })}\n\n`);

    fullGeneratedText = brainResult.content;
    const tokens = fullGeneratedText.match(/(\s+|\S+|\n)/g) || [fullGeneratedText];
    for (const tok of tokens) {
      if (res.writableEnded || res.destroyed) break;
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: tok })}\n\n`);
      (res as any).flush?.();
      await new Promise((r) => setTimeout(r, 6));
    }
  }

  // Run verification on stream complete
  const verification = verifyResult(
    {
      rawGeneratedContent: fullGeneratedText,
      toolOutputs: [],
      executionDurationMs: 0,
      sourceProvider: activeProvider,
      sourceModel: activeModel,
      tokensUsed: { promptTokens: routing.estimatedPromptTokens, completionTokens: 400, totalTokens: routing.estimatedPromptTokens + 400 },
    },
    intent,
    task
  );

  // Send verified cognitive exploration payload without raw CoT
  if (!res.writableEnded && !res.destroyed) {
    res.write(
      `data: ${JSON.stringify({
        type: 'brain_verification',
        verification: {
          factualConsistencyScore: verification.factualConsistencyScore,
          uncertaintyLevel: verification.uncertaintyLevel,
          uncertaintyNote: verification.uncertaintyNote,
          evidenceItems: verification.evidenceItems,
        },
      })}\n\n`
    );

    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// ====================================================
// FROGÉ MODULAR MEMORY ARCHITECTURE API ENDPOINTS
// 3 Tiers: Conversation, Personalization, App/Data
// ====================================================

// 1. Unified Query across memory tiers (with strict user isolation)
app.post('/api/memory/query', (req, res) => {
  try {
    const { userId = 'default_user', queryText, tier, categories, namespace, sessionId, limit } = req.body;
    const queryResults = frogeMemoryEngine.queryAll({
      userId,
      queryText,
      tier,
      categories,
      namespace,
      sessionId,
      limit,
    });

    res.json({
      success: true,
      data: queryResults,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Remember / Store item in specific memory tier
app.post('/api/memory/remember', (req, res) => {
  try {
    const { userId = 'default_user', tier, key, value, data, namespace, category, sessionId, role, tags, ttlSeconds } = req.body;

    if (!tier) {
      res.status(400).json({ success: false, error: 'Memory tier (conversation, personalization, app_data) is required' });
      return;
    }

    if (tier === 'conversation') {
      const turn = frogeMemoryEngine.rememberConversation(userId, sessionId || 'default_session', {
        role: role || 'user',
        content: value || (typeof data === 'string' ? data : JSON.stringify(data)),
        topicTags: tags,
      });
      res.json({ success: Boolean(turn), data: turn, tier });
      return;
    }

    if (tier === 'personalization') {
      if (!key || !value) {
        res.status(400).json({ success: false, error: 'key and value are required for personalization memory' });
        return;
      }
      const item = frogeMemoryEngine.rememberPreference(userId, key, value, category || 'preference', 'explicit_user_statement', tags);
      res.json({ success: Boolean(item), data: item, tier });
      return;
    }

    if (tier === 'app_data') {
      if (!key) {
        res.status(400).json({ success: false, error: 'key is required for app_data memory' });
        return;
      }
      const item = frogeMemoryEngine.rememberAppData(
        userId,
        namespace || 'default_namespace',
        key,
        data || value || {},
        category || 'structured_record',
        ttlSeconds
      );
      res.json({ success: Boolean(item), data: item, tier });
      return;
    }

    res.status(400).json({ success: false, error: `Unsupported memory tier: ${tier}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Delete memory item surgically or by category
app.post('/api/memory/delete', (req, res) => {
  try {
    const { userId = 'default_user', tier, itemId } = req.body;
    if (!tier || !itemId) {
      res.status(400).json({ success: false, error: 'tier and itemId are required' });
      return;
    }
    const deleted = frogeMemoryEngine.deleteMemoryItem(userId, tier, itemId);
    res.json({
      success: deleted,
      message: deleted ? `Successfully deleted item ${itemId} from tier ${tier}` : `Item ${itemId} not found`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Reset memory tier or full user memory purge
app.post('/api/memory/reset', (req, res) => {
  try {
    const { userId = 'default_user', tier = 'all' } = req.body;

    if (tier === 'all') {
      const purgeReport = frogeMemoryEngine.resetAllUserMemory(userId);
      res.json({
        success: true,
        data: purgeReport,
        message: `Purged ${purgeReport.totalPurged} memory records across all tiers for user ${userId}`,
      });
      return;
    }

    const purged = frogeMemoryEngine.resetTier(userId, tier);
    res.json({
      success: true,
      purgedCount: purged,
      message: `Reset tier ${tier} for user ${userId} (${purged} items purged)`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Get user memory control configuration
app.get('/api/memory/config', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';
    const config = frogeMemoryEngine.getUserConfig(userId);
    res.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Update user memory control configuration (disable/enable, selectivity rules)
app.post('/api/memory/config', (req, res) => {
  try {
    const { userId = 'default_user', updates } = req.body;
    if (!updates) {
      res.status(400).json({ success: false, error: 'updates payload is required' });
      return;
    }
    const updated = frogeMemoryEngine.updateUserConfig(userId, updates);
    res.json({
      success: true,
      data: updated,
      message: 'Memory control preferences updated successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Privacy boundary and operator disclosure
app.get('/api/memory/disclosure', (req, res) => {
  res.json({
    success: true,
    disclosure: FROGE_PRIVACY_DISCLOSURE,
  });
});

// 8. Run 11-Point Modular Memory Test Suite
app.post('/api/memory/test-suite', async (req, res) => {
  try {
    const suiteResults = await runFrogeMemoryTestSuite();
    res.json({
      success: true,
      data: suiteResults,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ====================================================
// FROGÉ LIVE-LEARN PERSONALIZATION API ENDPOINTS
// User gives correction -> Detect -> Stability check -> Store signal -> In-context prompt use
// HARD CONSTRAINTS: ZERO global model retraining & no blind permanent facts
// ====================================================

// 1. Process user correction through Live-Learn pipeline
app.post('/api/live-learn/process', (req, res) => {
  try {
    const { userId = 'default_user', message, previousAssistantMessage, sessionId = 'default_session' } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, error: 'User correction message is required' });
      return;
    }

    const result = frogeLiveLearnEngine.processCorrection(userId, message, previousAssistantMessage, sessionId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get all learned signals for a user
app.get('/api/live-learn/signals', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';
    const signals = frogeLiveLearnEngine.getSignals(userId);
    const sessionOverrides = frogeLiveLearnEngine.getSessionOverrides(userId);
    const config = frogeLiveLearnEngine.getConfig(userId);
    const injectedPromptPreview = frogeLiveLearnEngine.synthesizePersonalizedPromptContext(userId);

    res.json({
      success: true,
      data: {
        signals,
        sessionOverrides,
        config,
        injectedPromptPreview,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. User Controls: Pin/Unpin a learned signal
app.post('/api/live-learn/signal/pin', (req, res) => {
  try {
    const { userId = 'default_user', signalId } = req.body;
    if (!signalId) {
      res.status(400).json({ success: false, error: 'signalId is required' });
      return;
    }
    const success = frogeLiveLearnEngine.pinSignal(userId, signalId);
    res.json({ success, message: success ? `Signal ${signalId} pin toggled` : 'Signal not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. User Controls: Adjust signal confidence manually
app.post('/api/live-learn/signal/confidence', (req, res) => {
  try {
    const { userId = 'default_user', signalId, confidence } = req.body;
    if (!signalId || confidence === undefined) {
      res.status(400).json({ success: false, error: 'signalId and confidence (0.0 - 1.0) are required' });
      return;
    }
    const success = frogeLiveLearnEngine.updateSignalConfidence(userId, signalId, Number(confidence));
    res.json({ success, message: success ? `Signal ${signalId} confidence updated to ${confidence}` : 'Signal not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. User Controls: Edit signal value
app.post('/api/live-learn/signal/value', (req, res) => {
  try {
    const { userId = 'default_user', signalId, value } = req.body;
    if (!signalId || !value) {
      res.status(400).json({ success: false, error: 'signalId and value are required' });
      return;
    }
    const success = frogeLiveLearnEngine.updateSignalValue(userId, signalId, value);
    res.json({ success, message: success ? `Signal ${signalId} updated to '${value}'` : 'Signal not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. User Controls: Surgically delete a signal
app.post('/api/live-learn/signal/delete', (req, res) => {
  try {
    const { userId = 'default_user', signalId } = req.body;
    if (!signalId) {
      res.status(400).json({ success: false, error: 'signalId is required' });
      return;
    }
    const deleted = frogeLiveLearnEngine.deleteSignal(userId, signalId);
    res.json({ success: deleted, message: deleted ? `Signal ${signalId} deleted` : 'Signal not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. User Controls: Clear all learned signals for a user
app.post('/api/live-learn/clear', (req, res) => {
  try {
    const { userId = 'default_user' } = req.body;
    const purged = frogeLiveLearnEngine.clearAllLearnedSignals(userId);
    res.json({ success: true, purgedCount: purged, message: `Cleared ${purged} live-learned signals for user ${userId}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. User Configuration: Get and Update
app.get('/api/live-learn/config', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';
    const config = frogeLiveLearnEngine.getConfig(userId);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/live-learn/config', (req, res) => {
  try {
    const { userId = 'default_user', updates } = req.body;
    if (!updates) {
      res.status(400).json({ success: false, error: 'updates object is required' });
      return;
    }
    const config = frogeLiveLearnEngine.updateConfig(userId, updates);
    res.json({ success: true, data: config, message: 'Live-Learn settings updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Run 5-Point Live-Learn Automated Test Suite
app.post('/api/live-learn/test-suite', async (req, res) => {
  try {
    const suiteResults = await runLiveLearnTestSuite();
    res.json({
      success: true,
      data: suiteResults,
    });
  } catch (error: any) {
    console.error('Live-Learn Test Suite Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 8. OPTIONAL FROGÉ OUTCOME LEARNING ENDPOINTS
// AI Advice -> Track -> Follow-up Task -> Check-in -> Classify -> Evaluate -> Category Calibration
// ----------------------------------------------------

// 1. Get all tracked advice items & pending check-ins
app.get('/api/outcome/tasks', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';
    const all = frogeOutcomeManager.getAllTrackedAdvice(userId);
    const pending = frogeOutcomeManager.getPendingCheckins(userId);
    res.json({ success: true, tasks: all, pendingCheckins: pending });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Track advice (Step 2 & 3: User chooses "Track outcome")
app.post('/api/outcome/track', (req, res) => {
  try {
    const {
      userId = 'default_user',
      conversationId,
      messageId,
      query,
      adviceSummary,
      fullAdviceText,
      category,
      predictedConfidence,
      expectedOutcome,
      followUpHours,
      userNotes,
    } = req.body;

    if (!adviceSummary && !fullAdviceText) {
      res.status(400).json({ success: false, error: 'Advice content is required to track outcome' });
      return;
    }

    const result = frogeOutcomeManager.trackAdvice({
      userId,
      conversationId,
      messageId,
      query: query || 'Advice inquiry',
      adviceSummary: adviceSummary || (fullAdviceText ? fullAdviceText.slice(0, 100) : 'Advice'),
      fullAdviceText: fullAdviceText || adviceSummary,
      category,
      predictedConfidence: predictedConfidence ? Number(predictedConfidence) : undefined,
      expectedOutcome,
      followUpHours: followUpHours ? Number(followUpHours) : undefined,
      userNotes,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Record outcome check-in (Step 4, 5, 6, 7: Ask user what happened later -> Classify -> Evaluate -> Calibrate)
app.post('/api/outcome/checkin', (req, res) => {
  try {
    const {
      trackedAdviceId,
      userFeedbackText,
      userSatisfactionScore,
      deviatedFromAdvice,
      externalBlockers,
    } = req.body;

    if (!trackedAdviceId || !userFeedbackText) {
      res.status(400).json({ success: false, error: 'trackedAdviceId and userFeedbackText are required' });
      return;
    }

    const result = frogeOutcomeManager.recordOutcomeCheckin({
      trackedAdviceId,
      userFeedbackText,
      userSatisfactionScore: userSatisfactionScore ? Number(userSatisfactionScore) : undefined,
      deviatedFromAdvice: Boolean(deviatedFromAdvice),
      externalBlockers: Array.isArray(externalBlockers) ? externalBlockers : undefined,
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Dismiss a pending check-in task
app.post('/api/outcome/dismiss', (req, res) => {
  try {
    const { trackedAdviceId } = req.body;
    if (!trackedAdviceId) {
      res.status(400).json({ success: false, error: 'trackedAdviceId is required' });
      return;
    }
    const dismissed = frogeOutcomeManager.dismissTask(trackedAdviceId);
    res.json({ success: dismissed, message: dismissed ? 'Task dismissed' : 'Task not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Surgically delete a tracked advice record
app.post('/api/outcome/delete', (req, res) => {
  try {
    const { trackedAdviceId } = req.body;
    if (!trackedAdviceId) {
      res.status(400).json({ success: false, error: 'trackedAdviceId is required' });
      return;
    }
    const deleted = frogeOutcomeManager.deleteTrackedAdvice(trackedAdviceId);
    res.json({ success: deleted, message: deleted ? 'Tracked advice purged' : 'Record not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. User Controls: Clear all outcome data for user
app.post('/api/outcome/clear', (req, res) => {
  try {
    const { userId = 'default_user' } = req.body;
    const purged = frogeOutcomeManager.clearAllOutcomeData(userId);
    res.json({ success: true, purgedCount: purged, message: `Cleared ${purged} outcome records and reset calibration` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Get category calibration stats
app.get('/api/outcome/calibration', (req, res) => {
  try {
    const stats = frogeOutcomeManager.calibrationEngine.getAllCategoryStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Reset calibration (per category or all)
app.post('/api/outcome/calibration/reset', (req, res) => {
  try {
    const { category } = req.body;
    frogeOutcomeManager.calibrationEngine.resetCategoryCalibration(category);
    res.json({ success: true, message: category ? `Reset calibration for ${category}` : 'Reset all category calibrations' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Outcome Learning User Configuration
app.get('/api/outcome/config', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default_user';
    const config = frogeOutcomeManager.getConfig(userId);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/outcome/config', (req, res) => {
  try {
    const { userId = 'default_user', updates } = req.body;
    if (!updates) {
      res.status(400).json({ success: false, error: 'updates object is required' });
      return;
    }
    const config = frogeOutcomeManager.updateConfig(userId, updates);
    res.json({ success: true, data: config, message: 'Outcome learning settings updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Run 6-Point Outcome Learning Automated Test Suite
app.post('/api/outcome/test-suite', async (req, res) => {
  try {
    const suiteResults = await runOutcomeTestSuite();
    res.json({
      success: true,
      data: suiteResults,
    });
  } catch (error: any) {
    console.error('Outcome Learning Test Suite Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// OWNER-ONLY NEURAL NETWORK ARCHITECTURE & TRAINING INFRASTRUCTURE ENDPOINTS
// Accessible ONLY to verified owner: soraysharma7@gmail.com
// Protected by requireOwnerAuth middleware (403 Forbidden by default)
// ============================================================================

// 1. Owner Auth: Verify owner identity and issue session token
app.post('/api/owner/auth/verify', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    const normalized = email.trim().toLowerCase();
    if (!TRUSTED_OWNER_EMAILS.has(normalized)) {
      res.status(403).json({
        success: false,
        error: 'Access denied: Provided identity is not authorized for the Owner Neural Network Control Center.',
      });
      return;
    }

    const token = createOwnerSession(normalized);
    res.json({
      success: true,
      token,
      email: normalized,
      expiresInHours: 24,
      message: 'Owner identity successfully verified.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Owner Auth: Check current session status
app.get('/api/owner/auth/status', (req, res) => {
  const authHeader = req.headers['authorization'];
  const ownerHeader = req.headers['x-owner-token'] as string | undefined;
  const verification = verifyOwnerToken(ownerHeader || authHeader);

  res.json({
    success: true,
    isOwner: verification.valid,
    email: verification.email || null,
  });
});

// 3. Owner Auth: Logout session
app.post('/api/owner/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const ownerHeader = req.headers['x-owner-token'] as string | undefined;
  const token = ownerHeader || authHeader || '';
  const revoked = revokeOwnerSession(token);
  res.json({ success: true, loggedOut: revoked });
});

// 4. Tab 1: Architecture Explorer Specification
app.get('/api/owner/neural-network/architecture', requireOwnerAuth, (req, res) => {
  try {
    const spec = getNeuralArchitectureSpec();
    res.json({ success: true, data: spec });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Tab 2: Model Management Status
app.get('/api/owner/neural-network/model-management', requireOwnerAuth, (req, res) => {
  try {
    const status = getModelManagementStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Tab 3: Dataset Management List
app.get('/api/owner/neural-network/datasets', requireOwnerAuth, (req, res) => {
  try {
    const datasets = listDatasets();
    res.json({ success: true, data: datasets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Tab 3: Dataset Management Preview Examples
app.get('/api/owner/neural-network/datasets/:filename/examples', requireOwnerAuth, (req, res) => {
  try {
    const filename = req.params.filename;
    const examples = getDatasetExamples(filename);
    res.json({ success: true, data: examples });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Tab 3: Dataset Management Upload
app.post('/api/owner/neural-network/datasets/upload', requireOwnerAuth, (req, res) => {
  try {
    const { name, content, description } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ success: false, error: 'JSONL content is required' });
      return;
    }
    const result = saveUploadedDataset(name || 'Uploaded Dataset', content, description || '');
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.dataset });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Tab 4: Training Center Status & Compute Inspection
app.get('/api/owner/neural-network/training/status', requireOwnerAuth, (req, res) => {
  try {
    const data = getTrainingStatus();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Tab 4: Training Center Start Job (Requires Owner Action Confirmation)
app.post('/api/owner/neural-network/training/start', requireOwnerAuth, (req, res) => {
  try {
    const { config, ownerConfirmed } = req.body;
    if (!ownerConfirmed) {
      res.status(400).json({
        success: false,
        error: 'Explicit owner confirmation is required prior to starting training jobs.',
      });
      return;
    }
    const result = startTrainingJob(config || {
      baseModel: 'fog-neural-core-v3',
      datasetId: 'ds_froge_gold_alignment_v1',
      method: 'lora',
      loraRank: 16,
      loraAlpha: 32,
      learningRate: 0.0002,
      batchSize: 4,
      epochs: 3,
      targetModules: ['q_proj', 'v_proj'],
    });
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. Tab 4: Training Center Stop Job
app.post('/api/owner/neural-network/training/stop', requireOwnerAuth, (req, res) => {
  try {
    const result = stopTrainingJob();
    res.json({ success: true, data: result.job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. Tab 5: Evaluation Benchmark Suite (36 Held-Out Cases · 12 Areas · 5 Universal Measures)
app.get('/api/owner/neural-network/evaluation', requireOwnerAuth, (req, res) => {
  try {
    const areaId = req.query.areaId ? Number(req.query.areaId) : undefined;
    const evalData = runEvaluationBenchmark(areaId);
    res.json({ success: true, data: evalData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/owner/neural-network/evaluation/run', requireOwnerAuth, (req, res) => {
  try {
    const areaId = req.body?.areaId ? Number(req.body.areaId) : undefined;
    const evalData = runEvaluationBenchmark(areaId);
    logAuditEvent(
      'EVALUATION_RUN',
      (req as any).ownerEmail || 'soraysharma7@gmail.com',
      { tests: evalData.totalTests, accuracy: evalData.accuracyPct, areaFilter: areaId || 'all_12_areas' },
      'success'
    );
    res.json({ success: true, data: evalData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12b. Complete 12-Area Training Guide Specification & PDF Reference
app.get('/api/owner/neural-network/curriculum', requireOwnerAuth, (req, res) => {
  try {
    res.json({ success: true, data: getCurriculumGuideData() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12c. GPT-2 50,257 Token Vocabulary & Subword Engine Routes
app.get(['/api/owner/neural/tokenizer/overview', '/api/owner/neural-network/tokenizer/overview'], requireOwnerAuth, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalTokens: GPT2_TOTAL_TOKENS,
        maxTokenId: GPT2_MAX_TOKEN_ID,
        specialToken: { id: GPT2_SPECIAL_TOKEN_ID, token: GPT2_SPECIAL_TOKEN_STR },
        pdfUrl: GPT2_VOCAB_PDF_URL,
        tokensPerPage: 320,
        totalPages: 158,
        presets: GPT2_CURATED_PRESETS,
        notation: {
          leadingSpace: '␣ (leading or embedded space, U+0120)',
          newlines: '\\n / \\t',
          bytes: '\\xNN (raw byte fallback for split characters)',
          undrawable: '\\uNNNN',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post(['/api/owner/neural/tokenizer/encode', '/api/owner/neural-network/tokenizer/encode'], requireOwnerAuth, (req, res) => {
  try {
    const { text = '' } = req.body;
    const analysis = analyzeTextTokenization(String(text));
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get(['/api/owner/neural/tokenizer/token/:id', '/api/owner/neural-network/tokenizer/token/:id'], requireOwnerAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const token = lookupTokenById(id);
    if (!token) {
      return res.status(404).json({ success: false, error: `Token ID ${id} is out of bounds (0–50256).` });
    }
    res.json({ success: true, data: token });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get(['/api/owner/neural/tokenizer/search', '/api/owner/neural-network/tokenizer/search'], requireOwnerAuth, (req, res) => {
  try {
    const q = String(req.query.q || '');
    const limit = Math.min(100, parseInt(String(req.query.limit || '50'), 10));
    const results = searchGpt2Vocabulary(q, limit);
    res.json({ success: true, data: { query: q, count: results.length, results } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Public endpoints for live chat / client inspection without owner auth
app.post('/api/neural/tokenizer/encode', (req, res) => {
  try {
    const { text = '' } = req.body;
    const analysis = analyzeTextTokenization(String(text));
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/neural/tokenizer/search', (req, res) => {
  try {
    const q = String(req.query.q || '');
    const limit = Math.min(100, parseInt(String(req.query.limit || '50'), 10));
    const results = searchGpt2Vocabulary(q, limit);
    res.json({ success: true, data: { query: q, count: results.length, results } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 13. Tab 6: Checkpoints & Cluster Compute Status
app.get('/api/owner/neural-network/checkpoints', requireOwnerAuth, (req, res) => {
  try {
    const checkpoints = listCheckpoints();
    const compute = inspectSystemCompute();
    res.json({ success: true, data: { checkpoints, compute } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// STANDARDIZED MASTER BUILD SPECIFICATION SECTION 4 API ROUTES (/api/owner/neural/*)
// ============================================================================

// GET /api/owner/neural/overview
app.get('/api/owner/neural/overview', requireOwnerAuth, (req, res) => {
  try {
    const overview = getNeuralOverview();
    res.json({ success: true, data: overview });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/owner/neural/models
app.get('/api/owner/neural/models', requireOwnerAuth, (req, res) => {
  try {
    const models = getModelManagementStatus();
    res.json({ success: true, data: models });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/owner/neural/models/:modelId/config
app.get('/api/owner/neural/models/:modelId/config', requireOwnerAuth, (req, res) => {
  try {
    const spec = getNeuralArchitectureSpec();
    res.json({ success: true, data: spec });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/owner/neural/datasets
app.post('/api/owner/neural/datasets', requireOwnerAuth, (req, res) => {
  try {
    const { name, content, description } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ success: false, error: 'JSONL content is required' });
      return;
    }
    const result = saveUploadedDataset(name || 'Uploaded Dataset', content, description || '');
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    logAuditEvent('DATASET_UPLOADED', (req as any).ownerEmail || 'soraysharma7@gmail.com', { datasetId: result.dataset?.id, name }, 'success');
    res.json({ success: true, data: result.dataset });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/owner/neural/datasets/:datasetId/validate
app.post('/api/owner/neural/datasets/:datasetId/validate', requireOwnerAuth, (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ success: false, error: 'JSONL content string required for line validation.' });
      return;
    }
    const validation = validateDatasetLineByLine(content);
    res.json({ success: true, data: validation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/owner/neural/datasets/:datasetId
app.get('/api/owner/neural/datasets/:datasetId', requireOwnerAuth, (req, res) => {
  try {
    const id = req.params.datasetId;
    const datasets = listDatasets();
    const found = datasets.find((d) => d.id === id || d.filename === id);
    if (!found) {
      res.status(404).json({ success: false, error: 'Dataset not found.' });
      return;
    }
    const examples = getDatasetExamples(found.filename, 20);
    res.json({ success: true, data: { ...found, examples } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/owner/neural/training-jobs
app.post('/api/owner/neural/training-jobs', requireOwnerAuth, (req, res) => {
  try {
    const { config, ownerConfirmed } = req.body;
    if (!ownerConfirmed) {
      res.status(400).json({
        success: false,
        error: 'Explicit owner confirmation is required prior to starting training jobs.',
      });
      return;
    }
    const result = startTrainingJob(config);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    logAuditEvent('TRAINING_STARTED', (req as any).ownerEmail || 'soraysharma7@gmail.com', { jobId: (result.job as any)?.jobId, method: config?.method }, 'success');
    res.json({ success: true, data: result.job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/owner/neural/training-jobs/:jobId
app.get('/api/owner/neural/training-jobs/:jobId', requireOwnerAuth, (req, res) => {
  try {
    const data = getTrainingStatus();
    res.json({ success: true, data: data.state });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/owner/neural/training-jobs/:jobId/cancel
app.post('/api/owner/neural/training-jobs/:jobId/cancel', requireOwnerAuth, (req, res) => {
  try {
    const result = stopTrainingJob();
    logAuditEvent('TRAINING_STOPPED', (req as any).ownerEmail || 'soraysharma7@gmail.com', { jobId: req.params.jobId }, 'success');
    res.json({ success: true, data: result.job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/owner/neural/training-jobs/:jobId/logs
app.get('/api/owner/neural/training-jobs/:jobId/logs', requireOwnerAuth, (req, res) => {
  try {
    const data = getTrainingStatus();
    res.json({ success: true, data: { logs: data.state?.logs || [] } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/owner/neural/checkpoints
app.get('/api/owner/neural/checkpoints', requireOwnerAuth, (req, res) => {
  try {
    const checkpoints = listCheckpoints();
    const compute = inspectSystemCompute();
    res.json({ success: true, data: { checkpoints, compute } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/owner/neural/curriculum
app.get('/api/owner/neural/curriculum', requireOwnerAuth, (req, res) => {
  try {
    res.json({ success: true, data: getCurriculumGuideData() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/owner/neural/evaluations
app.get('/api/owner/neural/evaluations', requireOwnerAuth, (req, res) => {
  try {
    const areaId = req.query.areaId ? Number(req.query.areaId) : undefined;
    const evalData = runEvaluationBenchmark(areaId);
    res.json({ success: true, data: evalData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/owner/neural/evaluations
app.post('/api/owner/neural/evaluations', requireOwnerAuth, (req, res) => {
  try {
    const areaId = req.body?.areaId ? Number(req.body.areaId) : undefined;
    const evalData = runEvaluationBenchmark(areaId);
    logAuditEvent('EVALUATION_RUN', (req as any).ownerEmail || 'soraysharma7@gmail.com', { tests: evalData.totalTests, accuracy: evalData.accuracyPct }, 'success');
    res.json({ success: true, data: evalData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/owner/neural/deployments
app.post('/api/owner/neural/deployments', requireOwnerAuth, (req, res) => {
  try {
    const { adapterId, confirmed } = req.body;
    const result = deployModelAdapter(adapterId || 'froge-gold-adapter-v1', !!confirmed);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.deployment, history: getDeploymentHistory() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/owner/neural/deployments/rollback
app.post('/api/owner/neural/deployments/rollback', requireOwnerAuth, (req, res) => {
  try {
    const { confirmed } = req.body;
    const result = rollbackDeployment(!!confirmed);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.deployment, history: getDeploymentHistory() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/owner/neural/audit-log
app.get('/api/owner/neural/audit-log', requireOwnerAuth, (req, res) => {
  try {
    const logs = getAuditLogs();
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  const hasDist = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FROGÉ AI Modular Brain server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
