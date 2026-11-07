/**
 * FROGÉ Brain - Live-Learn Personalization Engine
 *
 * Master Orchestrator for Real-Time User Correction & Preference Learning.
 *
 * Architecture Principles:
 * 1. User gives correction
 * 2. Detect correction
 * 3. Determine whether it represents a stable preference vs temporary vs incorrect vs conflicting
 * 4. Store appropriate personalization signal (with confidence score)
 * 5. Use it dynamically in future response prompt generation
 *
 * HARD CONSTRAINTS:
 * - Do NOT retrain global AI model weights from one interaction.
 * - Do NOT automatically treat every correction as a permanent fact.
 * - Transparent confidence calibration and comprehensive user controls.
 */

import {
  LiveLearnSignal,
  LiveLearnConfig,
  LiveLearnProcessingResult,
  StabilityClassification,
} from './liveLearnTypes';
import { detectCorrection } from './correctionDetector';
import { classifyStabilityAndValidity } from './stabilityClassifier';
import { personalizationMemory, PersonalizationMemoryManager } from '../personalizationMemory';

const LIVE_LEARN_STORAGE_PREFIX = 'froge_live_learn_signals_v1_';
const LIVE_LEARN_CONFIG_PREFIX = 'froge_live_learn_cfg_v1_';

export class FrogeLiveLearnEngine {
  private userSignals: Map<string, LiveLearnSignal[]> = new Map();
  private userSessionOverrides: Map<string, LiveLearnSignal[]> = new Map();
  private userConfigs: Map<string, LiveLearnConfig> = new Map();
  private personalization: PersonalizationMemoryManager;

  constructor(persManager = personalizationMemory) {
    this.personalization = persManager;
    this.hydrate();
  }

  private getSignalKey(userId: string): string {
    return `${LIVE_LEARN_STORAGE_PREFIX}${userId || 'default_user'}`;
  }

  private getConfigKey(userId: string): string {
    return `${LIVE_LEARN_CONFIG_PREFIX}${userId || 'default_user'}`;
  }

  private hydrate(): void {
    if (typeof window === 'undefined') return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LIVE_LEARN_STORAGE_PREFIX)) {
          const userId = k.replace(LIVE_LEARN_STORAGE_PREFIX, '');
          const raw = localStorage.getItem(k);
          if (raw) {
            this.userSignals.set(userId, JSON.parse(raw));
          }
        } else if (k && k.startsWith(LIVE_LEARN_CONFIG_PREFIX)) {
          const userId = k.replace(LIVE_LEARN_CONFIG_PREFIX, '');
          const raw = localStorage.getItem(k);
          if (raw) {
            this.userConfigs.set(userId, JSON.parse(raw));
          }
        }
      }
    } catch {}

    // Seed baseline preferences for default_user if empty
    if (!this.userSignals.has('default_user')) {
      const initialBaseline: LiveLearnSignal[] = [
        {
          id: 'll_init_1',
          userId: 'default_user',
          key: 'code_framework_preference',
          value: 'Modern TypeScript with strict typing',
          category: 'preference',
          stability: 'STABLE_PREFERENCE',
          confidence: 0.95,
          reinforcementCount: 1,
          lastReinforcedAt: Date.now(),
          createdAt: Date.now(),
          decayRate: 0.02,
          scope: 'global',
          topicScope: 'coding',
          sourceUtterance: 'Initial baseline profile preference',
          status: 'active',
          isPinned: true,
        },
        {
          id: 'll_init_2',
          userId: 'default_user',
          key: 'explanation_clarity',
          value: 'Direct, clear reasoning summaries without repetitive filler',
          category: 'interaction_style',
          stability: 'STABLE_PREFERENCE',
          confidence: 0.90,
          reinforcementCount: 1,
          lastReinforcedAt: Date.now(),
          createdAt: Date.now(),
          decayRate: 0.02,
          scope: 'global',
          sourceUtterance: 'Initial baseline profile preference',
          status: 'active',
          isPinned: false,
        },
      ];
      this.userSignals.set('default_user', initialBaseline);
    }
  }

  private persist(userId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const effectiveUserId = userId || 'default_user';
      const signals = this.userSignals.get(effectiveUserId) || [];
      localStorage.setItem(this.getSignalKey(effectiveUserId), JSON.stringify(signals));

      const cfg = this.getConfig(effectiveUserId);
      localStorage.setItem(this.getConfigKey(effectiveUserId), JSON.stringify(cfg));
    } catch (e) {
      console.warn('Failed to persist live-learn signals:', e);
    }
  }

  public getConfig(userId: string): LiveLearnConfig {
    const effectiveUserId = userId || 'default_user';
    let cfg = this.userConfigs.get(effectiveUserId);
    if (!cfg) {
      cfg = {
        userId: effectiveUserId,
        enabled: true,
        autoDetectCorrections: true,
        minimumConfidenceThreshold: 0.60,
        allowTemporarySessionOverrides: true,
        enableConfidenceDecay: true,
        requireConfirmationOnConflict: false,
        noModelRetrainingGuarantee: true,
        maxActiveSignals: 50,
      };
      this.userConfigs.set(effectiveUserId, cfg);
    }
    return cfg;
  }

  public updateConfig(userId: string, updates: Partial<LiveLearnConfig>): LiveLearnConfig {
    const effectiveUserId = userId || 'default_user';
    const current = this.getConfig(effectiveUserId);
    const updated: LiveLearnConfig = {
      ...current,
      ...updates,
      noModelRetrainingGuarantee: true, // Invariant guarantee
    };
    this.userConfigs.set(effectiveUserId, updated);
    this.persist(effectiveUserId);
    return updated;
  }

  /**
   * Core Live-Learn Pipeline:
   * Process incoming user message to detect, validate, calibrate, and store signals.
   */
  public processCorrection(
    userId: string,
    userMessage: string,
    previousAssistantMessage?: string,
    sessionId: string = 'default_session'
  ): LiveLearnProcessingResult {
    const effectiveUserId = userId || 'default_user';
    const config = this.getConfig(effectiveUserId);
    const now = Date.now();
    const resultId = `ll_proc_${now}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Check if Live-Learn is enabled
    if (!config.enabled || !config.autoDetectCorrections) {
      return {
        id: resultId,
        userId: effectiveUserId,
        timestamp: now,
        inputUtterance: userMessage,
        detection: {
          isCorrection: false,
          correctionType: 'none',
          rawKeywords: [],
          extractedDirectives: [],
          reasoning: 'Live-Learn auto-detection is disabled by user policy.',
        },
        validation: {
          stability: 'STABLE_PREFERENCE',
          isFactuallySound: true,
          confidenceScore: 0,
          scope: 'global',
          justification: 'Live-Learn disabled.',
        },
        storedSignal: null,
        actionTaken: 'blocked_by_user_controls',
        explanation: 'Live-learning is disabled in user preferences.',
        injectedPromptContext: this.synthesizePersonalizedPromptContext(effectiveUserId),
        noModelRetrainingNotice: 'Global AI model weights remain unmodified. Zero training runs initiated.',
      };
    }

    // 2. Stage 1: Detect Correction
    const detection = detectCorrection(userMessage, previousAssistantMessage);

    if (!detection.isCorrection || detection.extractedDirectives.length === 0) {
      return {
        id: resultId,
        userId: effectiveUserId,
        timestamp: now,
        inputUtterance: userMessage,
        detection,
        validation: {
          stability: 'STABLE_PREFERENCE',
          isFactuallySound: true,
          confidenceScore: 0,
          scope: 'global',
          justification: 'No correction detected.',
        },
        storedSignal: null,
        actionTaken: 'no_correction_detected',
        explanation: 'Standard query: No user correction or preference update detected.',
        injectedPromptContext: this.synthesizePersonalizedPromptContext(effectiveUserId),
        noModelRetrainingNotice: 'Global AI model weights remain unmodified. Zero training runs initiated.',
      };
    }

    // 3. Stage 2: Stability & Factuality Classification on the primary extracted directive
    const primaryDirective = detection.extractedDirectives[0];
    const existingSignals = this.getSignals(effectiveUserId);

    const validation = classifyStabilityAndValidity(
      primaryDirective.key,
      primaryDirective.value,
      userMessage,
      existingSignals,
      primaryDirective.stability
    );

    let storedSignal: LiveLearnSignal | null = null;
    let actionTaken: LiveLearnProcessingResult['actionTaken'] = 'no_correction_detected';
    let explanation = '';

    // 4. Handle based on Stability Classification
    if (validation.stability === 'INCORRECT_FEEDBACK' || !validation.isFactuallySound) {
      // Reject incorrect feedback: DO NOT pollute permanent personalization
      actionTaken = 'rejected_incorrect_feedback';
      explanation = `Rejected invalid feedback: ${validation.justification} - Underlying AI model and user memory remain protected.`;
      storedSignal = {
        id: `rej_${now}_${Math.random().toString(36).substring(2, 6)}`,
        userId: effectiveUserId,
        key: primaryDirective.key,
        value: primaryDirective.value,
        category: primaryDirective.category,
        stability: 'INCORRECT_FEEDBACK',
        confidence: 0.0,
        reinforcementCount: 0,
        lastReinforcedAt: now,
        createdAt: now,
        decayRate: 0,
        scope: 'session',
        sourceUtterance: userMessage,
        status: 'rejected',
        isPinned: false,
        rejectionReason: validation.justification,
      };
    } else if (validation.stability === 'TEMPORARY_INSTRUCTION') {
      // Ephemeral instruction: Cache for session context ONLY, do NOT save to permanent Tier 2 storage
      actionTaken = 'cached_temporary_instruction';
      explanation = 'Cached temporary single-turn instruction for active context. Permanent profile is NOT modified.';

      storedSignal = {
        id: `temp_${now}_${Math.random().toString(36).substring(2, 6)}`,
        userId: effectiveUserId,
        key: primaryDirective.key,
        value: primaryDirective.value,
        category: primaryDirective.category,
        stability: 'TEMPORARY_INSTRUCTION',
        confidence: validation.confidenceScore,
        reinforcementCount: 1,
        lastReinforcedAt: now,
        createdAt: now,
        decayRate: 0.5,
        scope: 'session',
        topicScope: primaryDirective.topicScope,
        sourceUtterance: userMessage,
        status: 'active',
        isPinned: false,
      };

      const sessionList = this.userSessionOverrides.get(effectiveUserId) || [];
      sessionList.unshift(storedSignal);
      this.userSessionOverrides.set(effectiveUserId, sessionList);
    } else if (validation.stability === 'CONFLICTING_PREFERENCE' && validation.detectedConflict) {
      // Conflicting preference: Resolve conflict (Recency preferred with confidence calibration)
      actionTaken = 'resolved_conflict_and_updated';
      const conflict = validation.detectedConflict;

      // Decay prior conflicting signal
      const signalList = this.userSignals.get(effectiveUserId) || [];
      const priorIndex = signalList.findIndex((s) => s.id === conflict.conflictingSignalId);
      if (priorIndex !== -1) {
        signalList[priorIndex] = {
          ...signalList[priorIndex],
          status: 'disputed',
          confidence: Math.max(0.2, signalList[priorIndex].confidence - 0.35),
        };
      }

      // Create new signal
      storedSignal = {
        id: `sig_${now}_${Math.random().toString(36).substring(2, 6)}`,
        userId: effectiveUserId,
        key: primaryDirective.key,
        value: primaryDirective.value,
        category: primaryDirective.category,
        stability: 'STABLE_PREFERENCE',
        confidence: validation.confidenceScore,
        reinforcementCount: 1,
        lastReinforcedAt: now,
        createdAt: now,
        decayRate: 0.05,
        scope: 'global',
        topicScope: primaryDirective.topicScope,
        sourceUtterance: userMessage,
        status: 'active',
        isPinned: false,
        conflictHistory: {
          priorSignalId: conflict.conflictingSignalId,
          priorValue: conflict.existingValue,
          resolutionStrategy: conflict.resolutionStrategy,
          resolvedAt: now,
        },
      };

      signalList.unshift(storedSignal);
      this.userSignals.set(effectiveUserId, signalList);
      this.persist(effectiveUserId);

      // Also sync to Tier 2 personalization storage
      this.personalization.setPreference(
        effectiveUserId,
        primaryDirective.key,
        primaryDirective.value,
        primaryDirective.category,
        'explicit_user_statement',
        ['live-learn', 'resolved-conflict']
      );

      explanation = `Resolved conflict with '${conflict.existingValue}'. Updated active preference to '${primaryDirective.value}' (Confidence: ${Math.round(validation.confidenceScore * 100)}%).`;
    } else {
      // Valid Stable Preference: Store in permanent Live-Learn Registry and Tier 2 Personalization Memory
      actionTaken = 'stored_stable_preference';
      const signalList = this.userSignals.get(effectiveUserId) || [];

      // Check if exact key exists to increment reinforcement
      const existingIdx = signalList.findIndex(
        (s) => s.key.toLowerCase() === primaryDirective.key.toLowerCase() && s.status !== 'rejected'
      );

      if (existingIdx !== -1) {
        const existing = signalList[existingIdx];
        storedSignal = {
          ...existing,
          value: primaryDirective.value,
          confidence: Math.min(1.0, existing.confidence + 0.08),
          reinforcementCount: existing.reinforcementCount + 1,
          lastReinforcedAt: now,
          status: 'active',
          sourceUtterance: userMessage,
        };
        signalList[existingIdx] = storedSignal;
      } else {
        storedSignal = {
          id: `sig_${now}_${Math.random().toString(36).substring(2, 6)}`,
          userId: effectiveUserId,
          key: primaryDirective.key,
          value: primaryDirective.value,
          category: primaryDirective.category,
          stability: 'STABLE_PREFERENCE',
          confidence: validation.confidenceScore,
          reinforcementCount: 1,
          lastReinforcedAt: now,
          createdAt: now,
          decayRate: 0.05,
          scope: 'global',
          topicScope: primaryDirective.topicScope,
          sourceUtterance: userMessage,
          status: 'active',
          isPinned: false,
        };
        signalList.unshift(storedSignal);
      }

      this.userSignals.set(effectiveUserId, signalList);
      this.persist(effectiveUserId);

      // Sync into Tier 2 Personalization Memory
      this.personalization.setPreference(
        effectiveUserId,
        primaryDirective.key,
        primaryDirective.value,
        primaryDirective.category,
        'explicit_user_statement',
        ['live-learn', primaryDirective.topicScope || 'general']
      );

      explanation = `Learned stable preference '${primaryDirective.key}': '${primaryDirective.value}' (Confidence: ${Math.round(storedSignal.confidence * 100)}%).`;
    }

    const injectedContext = this.synthesizePersonalizedPromptContext(effectiveUserId);

    return {
      id: resultId,
      userId: effectiveUserId,
      timestamp: now,
      inputUtterance: userMessage,
      detection,
      validation,
      storedSignal,
      actionTaken,
      explanation,
      injectedPromptContext: injectedContext,
      noModelRetrainingNotice: 'Global AI model weights remain unmodified. Personalization is applied dynamically via in-context cognitive prompting.',
    };
  }

  /**
   * Stage 5: In-Context Prompt Injection
   * Synthesizes active, high-confidence learned signals into prompt context.
   */
  public synthesizePersonalizedPromptContext(userId: string, currentTopic?: string): string {
    const effectiveUserId = userId || 'default_user';
    const config = this.getConfig(effectiveUserId);

    if (!config.enabled) {
      return '';
    }

    const storedSignals = (this.userSignals.get(effectiveUserId) || []).filter(
      (s) =>
        s.status === 'active' &&
        s.confidence >= config.minimumConfidenceThreshold &&
        s.stability === 'STABLE_PREFERENCE'
    );

    const sessionOverrides = config.allowTemporarySessionOverrides
      ? (this.userSessionOverrides.get(effectiveUserId) || []).filter(
          (s) => s.status === 'active' && s.confidence >= config.minimumConfidenceThreshold
        )
      : [];

    const activeList = [...sessionOverrides, ...storedSignals];

    if (activeList.length === 0) {
      return '';
    }

    const lines: string[] = [
      '# FROGÉ LIVE-LEARNED PERSONALIZATION DIRECTIVES (Dynamic In-Context Runtime):',
    ];

    for (const sig of activeList) {
      const scopeBadge = sig.scope === 'session' ? '[TEMPORARY SESSION INSTRUCTION]' : '[VERIFIED STABLE PREFERENCE]';
      const confBadge = `${Math.round(sig.confidence * 100)}% Confidence`;
      lines.push(`- ${scopeBadge} (${confBadge}) ${sig.key.replace(/_/g, ' ')}: "${sig.value}"`);
    }

    return lines.join('\n');
  }

  // =========================================================================
  // USER CONTROLS & LIFECYCLE MANAGEMENT
  // =========================================================================

  public getSignals(userId: string): LiveLearnSignal[] {
    const effectiveUserId = userId || 'default_user';
    return [...(this.userSignals.get(effectiveUserId) || [])];
  }

  public getSessionOverrides(userId: string): LiveLearnSignal[] {
    const effectiveUserId = userId || 'default_user';
    return [...(this.userSessionOverrides.get(effectiveUserId) || [])];
  }

  public pinSignal(userId: string, signalId: string): boolean {
    const effectiveUserId = userId || 'default_user';
    const list = this.userSignals.get(effectiveUserId) || [];
    const target = list.find((s) => s.id === signalId);
    if (!target) return false;

    target.isPinned = !target.isPinned;
    target.confidence = target.isPinned ? 1.0 : target.confidence;
    this.persist(effectiveUserId);
    return true;
  }

  public updateSignalConfidence(userId: string, signalId: string, newConfidence: number): boolean {
    const effectiveUserId = userId || 'default_user';
    const list = this.userSignals.get(effectiveUserId) || [];
    const target = list.find((s) => s.id === signalId);
    if (!target) return false;

    target.confidence = Math.max(0.0, Math.min(1.0, newConfidence));
    this.persist(effectiveUserId);
    return true;
  }

  public updateSignalValue(userId: string, signalId: string, newValue: string): boolean {
    const effectiveUserId = userId || 'default_user';
    const list = this.userSignals.get(effectiveUserId) || [];
    const target = list.find((s) => s.id === signalId);
    if (!target) return false;

    target.value = newValue.trim();
    target.lastReinforcedAt = Date.now();
    target.confidence = 1.0;
    this.persist(effectiveUserId);

    // Sync to Tier 2
    this.personalization.setPreference(effectiveUserId, target.key, target.value, target.category);
    return true;
  }

  public toggleSignalStatus(userId: string, signalId: string): boolean {
    const effectiveUserId = userId || 'default_user';
    const list = this.userSignals.get(effectiveUserId) || [];
    const target = list.find((s) => s.id === signalId);
    if (!target) return false;

    target.status = target.status === 'active' ? 'disabled' : 'active';
    this.persist(effectiveUserId);
    return true;
  }

  /**
   * Granular deletion of a specific Live-Learned Signal
   */
  public deleteSignal(userId: string, signalId: string): boolean {
    const effectiveUserId = userId || 'default_user';
    const list = this.userSignals.get(effectiveUserId) || [];
    const target = list.find((s) => s.id === signalId);
    const initialLen = list.length;
    const filtered = list.filter((s) => s.id !== signalId);

    if (filtered.length !== initialLen) {
      this.userSignals.set(effectiveUserId, filtered);
      this.persist(effectiveUserId);

      // Also remove matching item from Tier 2 Personalization if present
      if (target) {
        const tier2Items = this.personalization.query(effectiveUserId, target.key);
        const match = tier2Items.find((p) => p.key.toLowerCase() === target.key.toLowerCase());
        if (match) {
          this.personalization.deleteById(effectiveUserId, match.id);
        }
      }
      return true;
    }

    // Also check session overrides
    const sessionList = this.userSessionOverrides.get(effectiveUserId) || [];
    const filteredSession = sessionList.filter((s) => s.id !== signalId);
    if (filteredSession.length !== sessionList.length) {
      this.userSessionOverrides.set(effectiveUserId, filteredSession);
      return true;
    }

    return false;
  }

  /**
   * Complete memory wipe of all learned signals for a user
   */
  public clearAllLearnedSignals(userId: string): number {
    const effectiveUserId = userId || 'default_user';
    const count = (this.userSignals.get(effectiveUserId) || []).length;
    this.userSignals.delete(effectiveUserId);
    this.userSessionOverrides.delete(effectiveUserId);
    this.persist(effectiveUserId);
    return count;
  }

  /**
   * Diagnostic Router: Separates Software Pipeline Failures from Model Training Candidates
   * Directive: Fix the software pipeline first, then evaluate whether model training is necessary.
   */
  public diagnoseSoftwarePipelineVsModelTraining(
    query: string,
    generatedAnswer: string,
    observedIssue: string
  ): {
    failureLayer:
      | 'INTENT_CLASSIFICATION'
      | 'PROMPT_CONSTRUCTION'
      | 'CONTEXT_RETRIEVAL'
      | 'TOOL_SELECTION'
      | 'RESPONSE_SYNTHESIS'
      | 'KNOWLEDGE_RETRIEVAL'
      | 'MODEL_WEIGHT_CANDIDATE';
    recommendedFix: string;
    requiresModelRetraining: boolean;
    pipelineRemedyLocation: string;
  } {
    const q = query.toLowerCase();
    const a = generatedAnswer.toLowerCase();
    const issue = observedIssue.toLowerCase();

    // 1. Generic template / boilerplate output -> Response synthesis failure
    if (
      a.includes('foundational constraints') ||
      a.includes('incentive alignment') ||
      a.includes('trade-off analysis matrix') ||
      a.includes('first-principles decomposition')
    ) {
      return {
        failureLayer: 'RESPONSE_SYNTHESIS',
        recommendedFix: 'Remove static template boilerplate and enable direct natural language response generation.',
        requiresModelRetraining: false,
        pipelineRemedyLocation: 'src/brain/responseSynthesizer.ts / src/utils/mockAi.ts',
      };
    }

    // 2. Keyword trigger misclassification -> Intent classification failure
    if (issue.includes('trigger') || issue.includes('chatgpt') || issue.includes('greeting')) {
      return {
        failureLayer: 'INTENT_CLASSIFICATION',
        recommendedFix: 'Refine intent understanding and complexity level mapping to prevent keyword over-triggering.',
        requiresModelRetraining: false,
        pipelineRemedyLocation: 'src/brain/intentUnderstanding.ts / src/brain/taskClassifier.ts',
      };
    }

    // 3. Unrelated previous conversation leaking -> Context retrieval failure
    if (issue.includes('leak') || issue.includes('contamination') || issue.includes('previous prompt')) {
      return {
        failureLayer: 'CONTEXT_RETRIEVAL',
        recommendedFix: 'Enforce current-message priority and filter irrelevant conversation history.',
        requiresModelRetraining: false,
        pipelineRemedyLocation: 'src/brain/memory/contextRelevanceFilter.ts',
      };
    }

    // 4. Missing factual / astronomical calculation -> Knowledge retrieval / tool selection
    if (q.includes('date') || q.includes('mars') || q.includes('closest') || q.includes('price')) {
      return {
        failureLayer: 'KNOWLEDGE_RETRIEVAL',
        recommendedFix: 'Connect specialized calculation engine or live web search grounding.',
        requiresModelRetraining: false,
        pipelineRemedyLocation: 'src/brain/knowledge/astronomyData.ts / src/brain/search/webSearchEngine.ts',
      };
    }

    // 5. Default fallback
    return {
      failureLayer: 'PROMPT_CONSTRUCTION',
      recommendedFix: 'Clarify task prompt instructions and expected format boundaries in software layer.',
      requiresModelRetraining: false,
      pipelineRemedyLocation: 'src/brain/modelRouter.ts / server.ts',
    };
  }
}

export const frogeLiveLearnEngine = new FrogeLiveLearnEngine();
