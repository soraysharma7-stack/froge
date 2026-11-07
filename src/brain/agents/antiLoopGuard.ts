/**
 * FROGÉ Agent Architecture - Anti-Loop & Cycle Prevention Guard
 * Prevents recursive agent chains, cyclic dependencies, and unbounded delegation depths.
 * Enforces strict DAG (Directed Acyclic Graph) validation.
 */

import { AgentId } from './types';
import { agentAuditLogger } from './logger';

export interface CallGraphEdge {
  from: string; // 'central_brain' or AgentId
  to: AgentId;
  timestamp: number;
}

export interface LoopValidationResult {
  allowed: boolean;
  loopDetected: boolean;
  currentDepth: number;
  maxAllowedDepth: number;
  callStack: string[];
  violationReason?: string;
}

export class AgentAntiLoopGuard {
  private readonly DEFAULT_MAX_DEPTH = 2; // Central Brain (0) -> Agent (1) -> Sub-agent (2)
  private readonly MAX_DELEGATION_FANOUT = 3; // Maximum sub-agents spawned by a single agent

  /**
   * Validates if a proposed agent invocation is safe from loops and depth limits
   */
  public validateInvocation(
    caller: 'central_brain' | AgentId,
    target: AgentId,
    currentCallStack: string[]
  ): LoopValidationResult {
    const callStack = [...currentCallStack, target];
    const currentDepth = callStack.length - 1; // 0-indexed relative to central brain

    // 1. Check for immediate direct or indirect cycles in the active call stack
    const occurrences = callStack.filter((id) => id === target).length;
    if (occurrences > 1) {
      const cycleDescription = `${callStack.join(' ➔ ')}`;
      agentAuditLogger.log(
        target,
        'security',
        'loop_guard',
        `🛑 LOOP DETECTED: Cyclic agent recursion blocked: ${cycleDescription}`,
        { caller, target, callStack }
      );
      return {
        allowed: false,
        loopDetected: true,
        currentDepth,
        maxAllowedDepth: this.DEFAULT_MAX_DEPTH,
        callStack,
        violationReason: `Cyclic agent invocation detected: ${cycleDescription}. Recursive calling is strictly forbidden.`,
      };
    }

    // 2. Check maximum delegation depth
    if (currentDepth > this.DEFAULT_MAX_DEPTH) {
      agentAuditLogger.log(
        target,
        'security',
        'loop_guard',
        `🛑 MAX DEPTH BREACH: Call depth ${currentDepth} exceeds ceiling ${this.DEFAULT_MAX_DEPTH}`,
        { caller, target, currentDepth, maxAllowedDepth: this.DEFAULT_MAX_DEPTH }
      );
      return {
        allowed: false,
        loopDetected: false,
        currentDepth,
        maxAllowedDepth: this.DEFAULT_MAX_DEPTH,
        callStack,
        violationReason: `Max agent delegation depth (${this.DEFAULT_MAX_DEPTH}) exceeded by ${target}. Call path: ${callStack.join(' ➔ ')}`,
      };
    }

    return {
      allowed: true,
      loopDetected: false,
      currentDepth,
      maxAllowedDepth: this.DEFAULT_MAX_DEPTH,
      callStack,
    };
  }

  /**
   * Validates a multi-agent plan for acyclic properties (DAG Check)
   */
  public validatePlanAcyclic(
    planEdges: Array<{ from: string; to: AgentId }>
  ): { isAcyclic: boolean; cyclePath?: string } {
    const adj = new Map<string, string[]>();

    for (const edge of planEdges) {
      if (!adj.has(edge.from)) adj.set(edge.from, []);
      adj.get(edge.from)!.push(edge.to);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          path.push(neighbor);
          return true;
        }
      }

      recStack.delete(node);
      path.pop();
      return false;
    };

    for (const node of adj.keys()) {
      if (!visited.has(node)) {
        if (hasCycle(node)) {
          return { isAcyclic: false, cyclePath: path.join(' ➔ ') };
        }
      }
    }

    return { isAcyclic: true };
  }

  public getMaxDepth(): number {
    return this.DEFAULT_MAX_DEPTH;
  }

  public getMaxFanout(): number {
    return this.MAX_DELEGATION_FANOUT;
  }
}

export const agentAntiLoopGuard = new AgentAntiLoopGuard();
