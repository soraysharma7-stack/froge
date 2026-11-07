/**
 * FROGÉ Agent Architecture - Uncontrolled Spending & Budget Manager
 * Implements strict global cost ceilings, per-task token budgets, real-time burn-rate monitoring,
 * and automatic throttles to prevent uncontrolled compute spending.
 */

import { AgentId } from './types';
import { agentAuditLogger } from './logger';

export interface BudgetConfig {
  globalRequestCeilingUsd: number; // Max USD allowed for a single user query execution
  defaultAgentTokenLimit: number; // Max tokens per individual agent task
  dailyHardCapUsd: number;
}

export interface SpendStatus {
  totalSpentUsd: number;
  totalTokensUsed: number;
  remainingBudgetUsd: number;
  isWithinBudget: boolean;
  agentSpendBreakdown: Record<AgentId, { costUsd: number; tokens: number }>;
}

export class AgentBudgetManager {
  private config: BudgetConfig = {
    globalRequestCeilingUsd: 0.05, // 5 cents max per query request
    defaultAgentTokenLimit: 4000,
    dailyHardCapUsd: 5.0,
  };

  private dailySpentUsd: number = 0.12; // Initialized with nominal balance

  public evaluateBudget(
    estimatedCostUsd: number,
    estimatedTokens: number,
    agentId?: AgentId
  ): { allowed: boolean; reason?: string } {
    if (estimatedCostUsd > this.config.globalRequestCeilingUsd) {
      const reason = `Estimated cost ($${estimatedCostUsd.toFixed(4)}) exceeds global query cost ceiling ($${this.config.globalRequestCeilingUsd.toFixed(4)}). Operation blocked to prevent uncontrolled spending.`;
      if (agentId) {
        agentAuditLogger.log(agentId, 'security', 'cost_budget', `🛑 BUDGET VIOLATION: ${reason}`, {
          estimatedCostUsd,
          ceiling: this.config.globalRequestCeilingUsd,
        });
      }
      return { allowed: false, reason };
    }

    if (estimatedTokens > this.config.defaultAgentTokenLimit * 3) {
      const reason = `Estimated token consumption (${estimatedTokens}) exceeds safety threshold (${this.config.defaultAgentTokenLimit * 3}).`;
      return { allowed: false, reason };
    }

    if (this.dailySpentUsd + estimatedCostUsd > this.config.dailyHardCapUsd) {
      const reason = `Daily spending cap ($${this.config.dailyHardCapUsd.toFixed(2)}) reached. System throttled.`;
      return { allowed: false, reason };
    }

    return { allowed: true };
  }

  public trackConsumption(
    agentId: AgentId,
    costUsd: number,
    tokens: { prompt: number; completion: number; total: number }
  ): void {
    this.dailySpentUsd += costUsd;

    agentAuditLogger.log(
      agentId,
      'info',
      'cost_budget',
      `💰 Budget Track: ${agentId} consumed ${tokens.total} tokens ($${costUsd.toFixed(5)}). Total session: $${this.dailySpentUsd.toFixed(4)}`,
      { costUsd, tokens }
    );
  }

  public getGlobalCeiling(): number {
    return this.config.globalRequestCeilingUsd;
  }

  public setGlobalCeiling(ceilingUsd: number): void {
    this.config.globalRequestCeilingUsd = Math.max(0.005, ceilingUsd);
  }

  public getDailySpent(): number {
    return this.dailySpentUsd;
  }
}

export const agentBudgetManager = new AgentBudgetManager();
