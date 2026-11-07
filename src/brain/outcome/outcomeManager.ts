/**
 * FROGÉ Brain - Outcome Learning Manager
 *
 * Full Lifecycle Orchestrator for Optional Outcome Learning:
 *
 * 1. AI Advice Output
 * 2. User optionally chooses "Track outcome"
 * 3. Create follow-up task with scheduled check-in window
 * 4. Ask user what happened later (Follow-up Check-in)
 * 5. Classify outcome
 * 6. Evaluate previous prediction / advice
 * 7. Update calibration information (Bayesian category-level stats)
 *
 * HARD CONSTRAINTS RESPECTED:
 * - Do NOT treat one outcome as universal truth (statistical sample aggregation & Bayesian prior damping).
 * - Track performance by appropriate categories rather than blindly changing global AI behavior.
 * - Comprehensive user controls to disable tracking, reset calibration, or delete records.
 * - Zero automatic global model retraining.
 */

import {
  OutcomeCategory,
  TrackedAdviceItem,
  OutcomeReport,
  PredictionEvaluation,
  CategoryCalibrationStats,
  OutcomeLearningConfig,
  OutcomeProcessingResult,
} from './outcomeTypes';
import { evaluatePrediction } from './predictionEvaluator';
import { FrogeCalibrationEngine } from './calibrationEngine';

const DEFAULT_CONFIG: OutcomeLearningConfig = {
  enabled: true,
  autoSuggestTrackingForActionableAdvice: true,
  defaultFollowUpDelayHours: 24,
  minimumSampleSizeForCalibrationAdjustment: 3,
  bayesianDampingFactor: 0.8,
  retentionDays: 90,
  notifyOnCheckinDue: true,
  categoryOverrides: {
    code_debugging: { enabled: true },
    system_architecture: { enabled: true },
    performance_optimization: { enabled: true },
    api_integration: { enabled: true },
    security_hardening: { enabled: true },
    data_analysis: { enabled: true },
    operational_planning: { enabled: true },
    career_strategy: { enabled: true },
    creative_writing: { enabled: true },
    general_advice: { enabled: true },
  },
};

export class FrogeOutcomeManager {
  private trackedAdviceStore: Map<string, TrackedAdviceItem> = new Map();
  private outcomeReportsStore: Map<string, OutcomeReport> = new Map();
  private evaluationsStore: Map<string, PredictionEvaluation> = new Map();
  private configs: Map<string, OutcomeLearningConfig> = new Map();
  public calibrationEngine: FrogeCalibrationEngine;

  constructor(calibrationEngine?: FrogeCalibrationEngine) {
    this.calibrationEngine = calibrationEngine || new FrogeCalibrationEngine();
  }

  public getConfig(userId: string = 'default_user'): OutcomeLearningConfig {
    if (!this.configs.has(userId)) {
      this.configs.set(userId, { ...DEFAULT_CONFIG });
    }
    return { ...this.configs.get(userId)! };
  }

  public updateConfig(
    userId: string = 'default_user',
    updates: Partial<OutcomeLearningConfig>
  ): OutcomeLearningConfig {
    const current = this.getConfig(userId);
    const updated: OutcomeLearningConfig = {
      ...current,
      ...updates,
      categoryOverrides: {
        ...current.categoryOverrides,
        ...(updates.categoryOverrides || {}),
      },
    };
    this.configs.set(userId, updated);
    return updated;
  }

  /**
   * Step 2 & 3: User chooses "Track outcome" -> Create follow-up task.
   */
  public trackAdvice(params: {
    userId?: string;
    conversationId?: string;
    messageId?: string;
    query: string;
    adviceSummary: string;
    fullAdviceText: string;
    category?: OutcomeCategory;
    predictedConfidence?: number;
    expectedOutcome?: string;
    followUpHours?: number;
    userNotes?: string;
  }): OutcomeProcessingResult {
    const userId = params.userId || 'default_user';
    const config = this.getConfig(userId);

    if (!config.enabled) {
      throw new Error('Outcome tracking is currently disabled by user policy.');
    }

    const category: OutcomeCategory = params.category || this.inferCategoryFromAdvice(params.query, params.adviceSummary);
    const delayHours = params.followUpHours ?? config.defaultFollowUpDelayHours;
    const followUpDueAt = Date.now() + delayHours * 3600 * 1000;

    const id = `track_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const item: TrackedAdviceItem = {
      id,
      userId,
      conversationId: params.conversationId,
      messageId: params.messageId,
      query: params.query,
      adviceSummary: params.adviceSummary,
      fullAdviceText: params.fullAdviceText,
      category,
      predictedConfidence: params.predictedConfidence ?? 0.85,
      expectedOutcome: params.expectedOutcome || 'Resolution of target problem as advised.',
      followUpDueAt,
      createdAt: Date.now(),
      status: 'pending_checkin',
      userNotes: params.userNotes,
    };

    this.trackedAdviceStore.set(id, item);

    return {
      id,
      trackedAdvice: item,
      actionTaken: 'task_registered',
      noRetrainingNotice: 'Zero global model retraining. Outcome stored in local calibration registry.',
    };
  }

  /**
   * Step 4, 5, 6, 7: Ask user what happened later -> Classify outcome -> Evaluate prediction -> Update calibration
   */
  public recordOutcomeCheckin(params: {
    trackedAdviceId: string;
    userFeedbackText: string;
    userSatisfactionScore?: number;
    deviatedFromAdvice?: boolean;
    externalBlockers?: string[];
  }): OutcomeProcessingResult {
    const trackedAdvice = this.trackedAdviceStore.get(params.trackedAdviceId);
    if (!trackedAdvice) {
      throw new Error(`Tracked advice item '${params.trackedAdviceId}' not found.`);
    }

    const config = this.getConfig(trackedAdvice.userId);
    if (!config.enabled) {
      throw new Error('Outcome tracking is disabled.');
    }

    // Check if category is enabled in user settings
    const categoryOverride = config.categoryOverrides[trackedAdvice.category];
    if (categoryOverride && categoryOverride.enabled === false) {
      throw new Error(`Outcome learning for category '${trackedAdvice.category}' is disabled in user preferences.`);
    }

    // Step 4: Create Outcome Report
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const outcomeReport: OutcomeReport = {
      id: reportId,
      trackedAdviceId: trackedAdvice.id,
      userId: trackedAdvice.userId,
      userFeedbackText: params.userFeedbackText,
      userSatisfactionScore: params.userSatisfactionScore,
      reportedOutcomeSummary: params.userFeedbackText.slice(0, 140),
      reportedAt: Date.now(),
      deviatedFromAdvice: params.deviatedFromAdvice ?? false,
      externalBlockersEncountered: params.externalBlockers,
    };
    this.outcomeReportsStore.set(reportId, outcomeReport);

    // Step 5 & 6: Classify Outcome & Evaluate Prediction
    const evaluation = evaluatePrediction(trackedAdvice, outcomeReport);
    this.evaluationsStore.set(evaluation.id, evaluation);

    // Step 7: Update Bayesian Category Calibration
    const updatedStats = this.calibrationEngine.recordEvaluation(evaluation, config);

    // Update tracked advice status
    trackedAdvice.status = 'evaluated';
    this.trackedAdviceStore.set(trackedAdvice.id, trackedAdvice);

    const hint = this.calibrationEngine.synthesizeCategoryCalibrationPromptContext(trackedAdvice.category);

    return {
      id: trackedAdvice.id,
      trackedAdvice,
      outcomeReport,
      evaluation,
      updatedCategoryCalibration: updatedStats,
      actionTaken: 'checkin_recorded_and_evaluated',
      injectedCalibrationHint: hint,
      noRetrainingNotice: 'Zero global model retraining. In-context calibration updated for category ' + trackedAdvice.category,
    };
  }

  public getPendingCheckins(userId: string = 'default_user'): TrackedAdviceItem[] {
    const now = Date.now();
    return Array.from(this.trackedAdviceStore.values())
      .filter((t) => t.userId === userId && (t.status === 'pending_checkin' || t.status === 'checkin_due'))
      .map((t) => {
        if (t.followUpDueAt <= now && t.status === 'pending_checkin') {
          t.status = 'checkin_due';
        }
        return t;
      })
      .sort((a, b) => a.followUpDueAt - b.followUpDueAt);
  }

  public getAllTrackedAdvice(userId: string = 'default_user'): Array<{
    advice: TrackedAdviceItem;
    report?: OutcomeReport;
    evaluation?: PredictionEvaluation;
  }> {
    return Array.from(this.trackedAdviceStore.values())
      .filter((t) => t.userId === userId)
      .map((advice) => {
        const report = Array.from(this.outcomeReportsStore.values()).find(
          (r) => r.trackedAdviceId === advice.id
        );
        const evaluation = Array.from(this.evaluationsStore.values()).find(
          (e) => e.trackedAdviceId === advice.id
        );
        return { advice, report, evaluation };
      })
      .sort((a, b) => b.advice.createdAt - a.advice.createdAt);
  }

  public dismissTask(trackedAdviceId: string): boolean {
    const item = this.trackedAdviceStore.get(trackedAdviceId);
    if (!item) return false;
    item.status = 'dismissed';
    this.trackedAdviceStore.set(trackedAdviceId, item);
    return true;
  }

  public deleteTrackedAdvice(trackedAdviceId: string): boolean {
    const item = this.trackedAdviceStore.get(trackedAdviceId);
    if (!item) return false;

    this.trackedAdviceStore.delete(trackedAdviceId);

    // Remove matching reports
    for (const [rId, report] of this.outcomeReportsStore.entries()) {
      if (report.trackedAdviceId === trackedAdviceId) {
        this.outcomeReportsStore.delete(rId);
      }
    }

    // Remove matching evaluations
    for (const [eId, evalItem] of this.evaluationsStore.entries()) {
      if (evalItem.trackedAdviceId === trackedAdviceId) {
        this.evaluationsStore.delete(eId);
      }
    }

    return true;
  }

  public clearAllOutcomeData(userId: string = 'default_user'): number {
    let count = 0;
    for (const [id, item] of this.trackedAdviceStore.entries()) {
      if (item.userId === userId) {
        this.deleteTrackedAdvice(id);
        count++;
      }
    }
    this.calibrationEngine.resetCategoryCalibration();
    return count;
  }

  public synthesizeCalibrationPromptContext(userId: string = 'default_user', category?: OutcomeCategory): string {
    const config = this.getConfig(userId);
    if (!config.enabled) return '';
    return this.calibrationEngine.synthesizeCategoryCalibrationPromptContext(
      category,
      config.minimumSampleSizeForCalibrationAdjustment
    );
  }

  private inferCategoryFromAdvice(query: string, advice: string): OutcomeCategory {
    const combined = `${query} ${advice}`.toLowerCase();
    if (combined.includes('debug') || combined.includes('fix error') || combined.includes('exception') || combined.includes('bug')) {
      return 'code_debugging';
    }
    if (combined.includes('architecture') || combined.includes('microservice') || combined.includes('schema') || combined.includes('pattern')) {
      return 'system_architecture';
    }
    if (combined.includes('performance') || combined.includes('latency') || combined.includes('cache') || combined.includes('optimize')) {
      return 'performance_optimization';
    }
    if (combined.includes('api') || combined.includes('endpoint') || combined.includes('rest') || combined.includes('webhook')) {
      return 'api_integration';
    }
    if (combined.includes('security') || combined.includes('auth') || combined.includes('vulnerability') || combined.includes('sanitize')) {
      return 'security_hardening';
    }
    if (combined.includes('data') || combined.includes('metric') || combined.includes('analytics') || combined.includes('sql')) {
      return 'data_analysis';
    }
    if (combined.includes('career') || combined.includes('interview') || combined.includes('resume') || combined.includes('salary')) {
      return 'career_strategy';
    }
    if (combined.includes('plan') || combined.includes('roadmap') || combined.includes('timeline') || combined.includes('operational')) {
      return 'operational_planning';
    }
    if (combined.includes('write') || combined.includes('essay') || combined.includes('story') || combined.includes('creative')) {
      return 'creative_writing';
    }
    return 'general_advice';
  }
}

// Global Singleton Instance
export const frogeOutcomeManager = new FrogeOutcomeManager();
