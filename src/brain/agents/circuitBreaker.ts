/**
 * FROGÉ Agent Architecture - Circuit Breaker Pattern
 * Protects system stability by tripping when an agent experiences consecutive failures,
 * preventing cascading outages and runaway execution loops.
 */

import { AgentId } from './types';
import { agentAuditLogger } from './logger';

export interface CircuitBreakerState {
  agentId: AgentId;
  status: 'closed' | 'open' | 'half_open';
  failureCount: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  trippedAt?: number;
  cooldownPeriodMs: number;
  failureThreshold: number;
}

export class AgentCircuitBreaker {
  private states: Map<AgentId, CircuitBreakerState> = new Map();

  public registerAgent(
    agentId: AgentId,
    failureThreshold: number = 3,
    cooldownPeriodMs: number = 30000
  ): void {
    this.states.set(agentId, {
      agentId,
      status: 'closed',
      failureCount: 0,
      failureThreshold,
      cooldownPeriodMs,
    });
  }

  public canExecute(agentId: AgentId): { allowed: boolean; reason?: string } {
    const state = this.getOrInitState(agentId);

    if (state.status === 'open') {
      const now = Date.now();
      if (state.trippedAt && now - state.trippedAt > state.cooldownPeriodMs) {
        // Half-open: allow a trial request
        state.status = 'half_open';
        agentAuditLogger.log(
          agentId,
          'warn',
          'lifecycle',
          `Circuit breaker for ${agentId} transitioned from OPEN to HALF_OPEN (cooldown expired)`
        );
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: `Circuit breaker is OPEN for ${agentId} (${state.failureCount} consecutive failures). Cooldown remaining: ${Math.max(
          0,
          Math.ceil((state.cooldownPeriodMs - (now - (state.trippedAt || 0))) / 1000)
        )}s`,
      };
    }

    return { allowed: true };
  }

  public recordSuccess(agentId: AgentId): void {
    const state = this.getOrInitState(agentId);
    state.failureCount = 0;
    state.lastSuccessTime = Date.now();
    if (state.status === 'half_open') {
      state.status = 'closed';
      agentAuditLogger.log(
        agentId,
        'info',
        'lifecycle',
        `Circuit breaker for ${agentId} recovered to CLOSED after successful execution`
      );
    }
  }

  public recordFailure(agentId: AgentId, errorMsg: string): void {
    const state = this.getOrInitState(agentId);
    state.failureCount += 1;
    state.lastFailureTime = Date.now();

    if (state.failureCount >= state.failureThreshold) {
      state.status = 'open';
      state.trippedAt = Date.now();
      agentAuditLogger.log(
        agentId,
        'error',
        'lifecycle',
        `🚨 Circuit breaker TRIPPED to OPEN for ${agentId} (${state.failureCount} consecutive failures: ${errorMsg})`
      );
    }
  }

  public reset(agentId: AgentId): void {
    const state = this.getOrInitState(agentId);
    state.status = 'closed';
    state.failureCount = 0;
    state.trippedAt = undefined;
    agentAuditLogger.log(
      agentId,
      'info',
      'lifecycle',
      `Circuit breaker for ${agentId} manually reset to CLOSED`
    );
  }

  public getState(agentId: AgentId): CircuitBreakerState {
    return { ...this.getOrInitState(agentId) };
  }

  public getAllStates(): CircuitBreakerState[] {
    return Array.from(this.states.values());
  }

  private getOrInitState(agentId: AgentId): CircuitBreakerState {
    let state = this.states.get(agentId);
    if (!state) {
      state = {
        agentId,
        status: 'closed',
        failureCount: 0,
        failureThreshold: 3,
        cooldownPeriodMs: 30000,
      };
      this.states.set(agentId, state);
    }
    return state;
  }
}

export const agentCircuitBreaker = new AgentCircuitBreaker();
