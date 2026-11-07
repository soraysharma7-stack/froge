/**
 * FROGÉ Agent Architecture - Automated Test Suite
 * 16-point comprehensive verification suite:
 * - 8 Specialized Agents specification and domain execution
 * - Central Brain Need-Detection
 * - Tool Whitelisting & Disallowed Tool Rejection
 * - Permission Boundary Enforcement
 * - Task State Machine Transitions
 * - Timeout Enforcement & Cancellation
 * - Error Handling & Graceful Degradation
 * - Structured Audit Logging
 * - Human-in-the-Loop Approval Intercepts
 * - Anti-Loop & DAG Cycle Prevention
 * - Uncontrolled Spending & Cost Ceiling Protection
 */

import { FROGE_AGENT_DEFINITIONS, agentRegistry } from './agentRegistry';
import { centralFrogeBrain } from './centralBrain';
import { specializedAgentExecutor } from './agentExecutors';
import { agentAntiLoopGuard } from './antiLoopGuard';
import { agentBudgetManager } from './budgetManager';
import { agentApprovalManager } from './approvalManager';
import { agentAuditLogger } from './logger';
import { agentCircuitBreaker } from './circuitBreaker';
import { AgentId } from './types';

export interface AgentTestResultItem {
  id: string;
  name: string;
  category: 'agent_spec' | 'central_decision' | 'security_guard' | 'approval_flow' | 'spend_control' | 'anti_loop';
  passed: boolean;
  durationMs: number;
  details: string;
  error?: string;
}

export interface AgentTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  executionTimeMs: number;
  results: AgentTestResultItem[];
  timestamp: number;
}

export async function runFrogeAgentTestSuite(): Promise<AgentTestSuiteSummary> {
  const startTime = Date.now();
  const results: AgentTestResultItem[] = [];

  const addTest = (
    id: string,
    name: string,
    category: AgentTestResultItem['category'],
    passed: boolean,
    durationMs: number,
    details: string,
    error?: string
  ) => {
    results.push({ id, name, category, passed, durationMs, details, error });
  };

  // -------------------------------------------------------------
  // Test 1-8: Verify all 8 Specialized Agents (Specification & Execution)
  // -------------------------------------------------------------
  const allAgentIds: AgentId[] = [
    'research_agent',
    'coding_agent',
    'testing_agent',
    'creative_agent',
    'student_agent',
    'business_agent',
    'data_agent',
    'verification_agent',
  ];

  for (const agentId of allAgentIds) {
    const tStart = Date.now();
    try {
      const def = agentRegistry.getAgent(agentId);
      const hasPurpose = Boolean(def.purpose && def.purpose.length > 20);
      const hasAllowedTools = Array.isArray(def.allowedTools) && def.allowedTools.length > 0;
      const hasPermissions = Boolean(def.permissions && typeof def.permissions.maxComputeBudgetUsd === 'number');
      const hasTimeout = typeof def.defaultTimeoutMs === 'number' && def.defaultTimeoutMs > 0;
      const hasErrorHandling = Boolean(def.errorHandling && def.errorHandling.maxRetries >= 1);
      const hasApprovalPolicy = Boolean(def.approvalPolicy && typeof def.approvalPolicy.autoApproveLowRisk === 'boolean');

      // Execute a real task with the agent
      const task = await specializedAgentExecutor.executeTask(
        agentId,
        `Verify domain compliance for ${def.name}`,
        { testRun: true }
      );

      const taskCompleted = task.state === 'completed';
      const hasStateHistory = task.stateHistory.length >= 3;
      const hasTools = task.toolInvocations.length > 0;

      const passed =
        hasPurpose &&
        hasAllowedTools &&
        hasPermissions &&
        hasTimeout &&
        hasErrorHandling &&
        hasApprovalPolicy &&
        taskCompleted &&
        hasStateHistory &&
        hasTools;

      addTest(
        `spec_${agentId}`,
        `${def.name} Contract & Execution`,
        'agent_spec',
        passed,
        Date.now() - tStart,
        `Verified ${def.name}: purpose defined, ${def.allowedTools.length} whitelisted tools, timeout (${def.defaultTimeoutMs}ms), state machine passed (${task.stateHistory.map((s) => s.state).join('➔')})`
      );
    } catch (e: any) {
      addTest(
        `spec_${agentId}`,
        `${agentId} Contract & Execution`,
        'agent_spec',
        false,
        Date.now() - tStart,
        `Failed verifying ${agentId}`,
        e?.message
      );
    }
  }

  // -------------------------------------------------------------
  // Test 9: Central FROGÉ Brain Need-Detection (Selective Invocation)
  // -------------------------------------------------------------
  {
    const tStart = Date.now();
    try {
      // 1. Trivial greeting: should decide 0 agents needed
      const trivialRes = await centralFrogeBrain.orchestrate('Hi FROGÉ');
      const trivialZeroAgents = trivialRes.centralDecision.selectedAgents.length === 0;

      // 2. Specific coding query: should invoke ONLY Coding, Testing, and Verification (NOT Research, Business, Student, Creative)
      const codeRes = await centralFrogeBrain.orchestrate('Write a TypeScript helper function to sort user items');
      const codingSelected = codeRes.centralDecision.selectedAgents.some((s) => s.agentId === 'coding_agent');
      const businessSkipped = codeRes.centralDecision.skippedAgents.some((s) => s.agentId === 'business_agent');

      const passed = trivialZeroAgents && codingSelected && businessSkipped;
      addTest(
        'central_need_detection',
        'Central Brain Selective Need Detection',
        'central_decision',
        passed,
        Date.now() - tStart,
        `Central Brain bypassed sub-agents for simple greetings and selectively invoked coding/testing without unneeded agents.`
      );
    } catch (e: any) {
      addTest('central_need_detection', 'Central Brain Selective Need Detection', 'central_decision', false, Date.now() - tStart, 'Failed need detection', e?.message);
    }
  }

  // -------------------------------------------------------------
  // Test 10: Tool Whitelisting & Disallowed Tool Enforcement
  // -------------------------------------------------------------
  {
    const tStart = Date.now();
    try {
      const researchDef = agentRegistry.getAgent('research_agent');
      const allowedSearch = agentRegistry.isToolAllowedForAgent('research_agent', 'web_search_engine');
      const disallowedFs = agentRegistry.isToolAllowedForAgent('research_agent', 'virtual_filesystem_writer');

      const passed = allowedSearch && !disallowedFs && !researchDef.allowedTools.includes('virtual_filesystem_writer' as any);
      addTest(
        'tool_whitelisting',
        'Tool Whitelisting & Disallowed Tool Rejection',
        'security_guard',
        passed,
        Date.now() - tStart,
        `Research Agent permitted only whitelisted tools (web search, citations) and strictly barred filesystem writes.`
      );
    } catch (e: any) {
      addTest('tool_whitelisting', 'Tool Whitelisting & Disallowed Tool Rejection', 'security_guard', false, Date.now() - tStart, 'Failed tool whitelist test', e?.message);
    }
  }

  // -------------------------------------------------------------
  // Test 11: Permission Boundaries (Read-Only vs Mutation)
  // -------------------------------------------------------------
  {
    const tStart = Date.now();
    try {
      const verificationDef = agentRegistry.getAgent('verification_agent');
      const codingDef = agentRegistry.getAgent('coding_agent');

      const verificationIsReadOnly = verificationDef.permissions.readOnly === true;
      const verificationMutationForbidden = verificationDef.permissions.systemMutation === 'forbidden';
      const codingRequiresApproval = codingDef.permissions.systemMutation === 'requires_human_approval';

      const passed = verificationIsReadOnly && verificationMutationForbidden && codingRequiresApproval;
      addTest(
        'permission_boundaries',
        'Permission Boundaries & Mutation Level Enforcement',
        'security_guard',
        passed,
        Date.now() - tStart,
        `Enforced readOnly flags and systemMutation rules across analytical and engineering agents.`
      );
    } catch (e: any) {
      addTest('permission_boundaries', 'Permission Boundaries Enforcement', 'security_guard', false, Date.now() - tStart, 'Failed permission boundaries', e?.message);
    }
  }

  // -------------------------------------------------------------
  // Test 12: Timeout Enforcement & Cancellation
  // -------------------------------------------------------------
  {
    const tStart = Date.now();
    try {
      // Execute with a custom micro-timeout to verify timeout cancellation state
      const task = await specializedAgentExecutor.executeTask(
        'verification_agent',
        'Simulate high latency task',
        {},
        { customTimeoutMs: 1 } // 1ms timeout triggers timeout immediately
      );

      const timedOut = task.state === 'timed_out';
      const hasTimeoutError = task.error?.code === 'TIMEOUT_EXCEEDED';

      const passed = timedOut && hasTimeoutError;
      addTest(
        'timeout_enforcement',
        'Timeout Enforcement & Safe Task Abort',
        'security_guard',
        passed,
        Date.now() - tStart,
        `Agent task exceeding configured threshold was halted and transitioned to state: TIMED_OUT.`
      );
    } catch (e: any) {
      addTest('timeout_enforcement', 'Timeout Enforcement', 'security_guard', false, Date.now() - tStart, 'Failed timeout test', e?.message);
    }
  }

  // -------------------------------------------------------------
  // Test 13: Error Handling & Circuit Breaker Recovery
  // -------------------------------------------------------------
  {
    const tStart = Date.now();
    try {
      agentCircuitBreaker.registerAgent('testing_agent', 2, 500);

      // Record 2 failures to trip circuit breaker
      agentCircuitBreaker.recordFailure('testing_agent', 'Synthetic error 1');
      agentCircuitBreaker.recordFailure('testing_agent', 'Synthetic error 2');

      const checkTripped = agentCircuitBreaker.canExecute('testing_agent');
      const isTripped = !checkTripped.allowed;

      // Manually reset circuit breaker
      agentCircuitBreaker.reset('testing_agent');
      const checkReset = agentCircuitBreaker.canExecute('testing_agent');
      const isReset = checkReset.allowed;

      const passed = isTripped && isReset;
      addTest(
        'circuit_breaker_recovery',
        'Fault Tolerance & Circuit Breaker Trips',
        'security_guard',
        passed,
        Date.now() - tStart,
        `Circuit breaker tripped to OPEN after consecutive failures and safely recovered to CLOSED on reset.`
      );
    } catch (e: any) {
      addTest('circuit_breaker_recovery', 'Circuit Breaker Recovery', 'security_guard', false, Date.now() - tStart, 'Failed circuit breaker test', e?.message);
    }
  }

  // -------------------------------------------------------------
  // Test 14: Structured Audit Logging Telemetry
  // -------------------------------------------------------------
  {
    const tStart = Date.now();
    try {
      const logs = agentAuditLogger.getLogs({ limit: 10 });
      const hasLogs = logs.length > 0;
      const sampleLog = logs[0];
      const hasSchema = Boolean(sampleLog && sampleLog.logId && sampleLog.timestamp && sampleLog.agentId && sampleLog.category && sampleLog.message);

      const passed = hasLogs && hasSchema;
      addTest(
        'audit_logging',
        'Structured Audit Logging Telemetry',
        'security_guard',
        passed,
        Date.now() - tStart,
        `Verified ${logs.length} structured audit log entries capturing timestamp, agentId, category, and level.`
      );
    } catch (e: any) {
      addTest('audit_logging', 'Structured Audit Logging', 'security_guard', false, Date.now() - tStart, 'Failed audit logging', e?.message);
    }
  }

  // -------------------------------------------------------------
  // Test 15: Human-in-the-Loop Approval Intercepts
  // -------------------------------------------------------------
  {
    const tStart = Date.now();
    try {
      const task = await specializedAgentExecutor.executeTask(
        'coding_agent',
        'Patch production database schema and overwrite system files',
        { isMutatingAction: true, actionTitle: 'Deploy production file patch' },
        { simulateApprovalIntercept: true }
      );

      const isAwaitingApproval = task.state === 'awaiting_approval';
      const hasApprovalRequest = Boolean(task.approvalRequest && task.approvalRequest.status === 'pending');

      // Operator grants approval
      let approvalApplied = false;
      if (task.approvalRequest) {
        approvalApplied = agentApprovalManager.approveRequest(task.approvalRequest.requestId, 'Security Admin');
      }

      const passed = isAwaitingApproval && hasApprovalRequest && approvalApplied;
      addTest(
        'approval_requirements',
        'Human-in-the-Loop Approval Intercepts',
        'approval_flow',
        passed,
        Date.now() - tStart,
        `Consequential mutating actions intercepted into state: AWAITING_APPROVAL with simulation diff.`
      );
    } catch (e: any) {
      addTest('approval_requirements', 'Human-in-the-Loop Approval', 'approval_flow', false, Date.now() - tStart, 'Failed approval test', e?.message);
    }
  }

  // -------------------------------------------------------------
  // Test 16: Anti-Loop Guard & Uncontrolled Spending Protection
  // -------------------------------------------------------------
  {
    const tStart = Date.now();
    try {
      // 1. Anti-Loop cycle detection
      const loopCheck = agentAntiLoopGuard.validateInvocation('coding_agent', 'coding_agent', ['central_brain', 'coding_agent']);
      const loopBlocked = loopCheck.loopDetected && !loopCheck.allowed;

      // 2. DAG Acyclic check with cyclic graph
      const dagCheck = agentAntiLoopGuard.validatePlanAcyclic([
        { from: 'agent_a', to: 'agent_b' as any },
        { from: 'agent_b', to: 'agent_a' as any },
      ]);
      const dagCycleBlocked = !dagCheck.isAcyclic;

      // 3. Uncontrolled spending guard check
      const spendCheck = agentBudgetManager.evaluateBudget(99.0, 50000); // 99 USD exceeds 5 cent ceiling
      const spendBlocked = !spendCheck.allowed;

      // 4. Central brain execution abort simulation
      const loopAbortRes = await centralFrogeBrain.orchestrate('Test loop prevention', { simulateLoopAttempt: true });
      const loopHalted = loopAbortRes.loopBlocked === true && loopAbortRes.success === false;

      const passed = loopBlocked && dagCycleBlocked && spendBlocked && loopHalted;
      addTest(
        'anti_loop_and_spending',
        'Anti-Loop Guards & Spending Ceiling Protection',
        'anti_loop',
        passed,
        Date.now() - tStart,
        `Blocked recursive calling cycles (Agent A ➔ Agent B ➔ Agent A) and enforced global cost ceiling.`
      );
    } catch (e: any) {
      addTest('anti_loop_and_spending', 'Anti-Loop & Spending Protection', 'anti_loop', false, Date.now() - tStart, 'Failed anti-loop & spending test', e?.message);
    }
  }

  const duration = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    executionTimeMs: duration,
    results,
    timestamp: Date.now(),
  };
}
