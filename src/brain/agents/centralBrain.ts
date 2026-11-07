/**
 * FROGÉ Agent Architecture - Central Brain Orchestrator & Governance Engine
 *
 * Core Directives:
 * 1. Intelligent Need Detection: The central FROGÉ Brain decides when an agent is actually needed.
 * 2. Strict Tool Whitelisting & Permission Enforcement.
 * 3. Anti-Loop & Depth Ceilings: Prevents infinite recursion (Agent A -> Agent B -> Agent A).
 * 4. Uncontrolled Spending Protection: Enforces global cost ceilings, per-task token limits, and circuit breakers.
 * 5. Human-in-the-Loop Approval Intercepts.
 */

import {
  AgentId,
  AgentOrchestrationResult,
  AgentTask,
  CentralBrainDecision,
} from './types';
import { FROGE_AGENT_DEFINITIONS } from './agentRegistry';
import { specializedAgentExecutor } from './agentExecutors';
import { agentAntiLoopGuard } from './antiLoopGuard';
import { agentBudgetManager } from './budgetManager';
import { agentApprovalManager } from './approvalManager';
import { agentAuditLogger } from './logger';

export class CentralFrogeBrain {
  /**
   * Main entry point: Process a user query through central brain governance & agent orchestration
   */
  public async orchestrate(
    query: string,
    options?: {
      forceAgents?: AgentId[];
      simulateApprovalIntercept?: boolean;
      simulateLoopAttempt?: boolean;
      simulateOverbudgetAttempt?: boolean;
    }
  ): Promise<AgentOrchestrationResult> {
    const orchestrationId = `orch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const startTime = Date.now();

    agentAuditLogger.log(
      'verification_agent',
      'info',
      'lifecycle',
      `🧠 Central FROGÉ Brain received query: "${query.substring(0, 70)}..."`,
      { query },
      undefined,
      orchestrationId
    );

    // 1. Central Brain Decision: Decide which agents are actually needed
    const centralDecision = this.decideAgentNeeds(query, options);

    // 2. Uncontrolled Spending Guard Check
    const budgetCheck = agentBudgetManager.evaluateBudget(
      centralDecision.executionPlan.maxEstimatedCostUsd,
      centralDecision.executionPlan.maxEstimatedTokens
    );

    if (!budgetCheck.allowed || options?.simulateOverbudgetAttempt) {
      agentAuditLogger.log(
        'business_agent',
        'security',
        'cost_budget',
        `🛑 CENTRAL BRAIN ABORT: Uncontrolled spending guard tripped. ${budgetCheck.reason || 'Cost ceiling exceeded.'}`,
        { decision: centralDecision },
        undefined,
        orchestrationId
      );

      return {
        orchestrationId,
        query,
        centralDecision,
        tasks: [],
        synthesizedResponse: `## 🛑 Execution Throttled by Spending Guard\n\n${budgetCheck.reason || 'The estimated compute and token cost for this multi-agent query exceeds the safe global cost ceiling.'}\n\n**Safeguard Action**: Execution was preemptively aborted to prevent uncontrolled resource depletion.`,
        auditLogs: agentAuditLogger.getLogs({ orchestrationId }),
        totalCostUsd: 0,
        totalTokens: 0,
        totalDurationMs: Date.now() - startTime,
        pendingApprovals: [],
        success: false,
        loopBlocked: false,
        budgetBlocked: true,
        timestamp: Date.now(),
      };
    }

    // 3. Anti-Loop & DAG Cycle Check
    if (centralDecision.antiLoopGuards.loopDetected || options?.simulateLoopAttempt) {
      agentAuditLogger.log(
        'verification_agent',
        'security',
        'loop_guard',
        `🛑 CENTRAL BRAIN ABORT: Anti-loop protection tripped. ${centralDecision.antiLoopGuards.loopError || 'Cyclic agent recursion detected.'}`,
        { decision: centralDecision },
        undefined,
        orchestrationId
      );

      return {
        orchestrationId,
        query,
        centralDecision,
        tasks: [],
        synthesizedResponse: `## 🛑 Execution Halted by Anti-Loop Guard\n\n**Violation**: ${centralDecision.antiLoopGuards.loopError || 'Cyclic agent delegation detected.'}\n\n**Safeguard Action**: Autonomous agents are strictly forbidden from calling other agents recursively in infinite loops. Central brain enforced immediate cycle termination.`,
        auditLogs: agentAuditLogger.getLogs({ orchestrationId }),
        totalCostUsd: 0,
        totalTokens: 0,
        totalDurationMs: Date.now() - startTime,
        pendingApprovals: [],
        success: false,
        loopBlocked: true,
        budgetBlocked: false,
        timestamp: Date.now(),
      };
    }

    // If query requires NO agents (e.g. basic conversational greeting)
    if (!centralDecision.requiresAgents || centralDecision.selectedAgents.length === 0) {
      agentAuditLogger.log(
        'verification_agent',
        'info',
        'lifecycle',
        `Central FROGÉ Brain resolved query directly without spinning secondary agents (zero unnecessary compute).`,
        {},
        undefined,
        orchestrationId
      );

      return {
        orchestrationId,
        query,
        centralDecision,
        tasks: [],
        synthesizedResponse: `Hello! I am FROGÉ. How can I assist your workflow today? (Central Brain decided zero sub-agents were required for this greeting, conserving compute and tokens).`,
        auditLogs: agentAuditLogger.getLogs({ orchestrationId }),
        totalCostUsd: 0.0001,
        totalTokens: 120,
        totalDurationMs: Date.now() - startTime,
        pendingApprovals: [],
        success: true,
        loopBlocked: false,
        budgetBlocked: false,
        timestamp: Date.now(),
      };
    }

    // 4. Execute Selected Specialized Agents
    const tasks: AgentTask[] = [];
    let totalCost = 0;
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;

    for (const agentPlan of centralDecision.selectedAgents) {
      const task = await specializedAgentExecutor.executeTask(
        agentPlan.agentId,
        query,
        agentPlan.delegationPayload,
        {
          rootOrchestrationId: orchestrationId,
          simulateApprovalIntercept: options?.simulateApprovalIntercept,
        }
      );

      tasks.push(task);
      totalCost += task.costUsd;
      totalPromptTokens += task.tokensUsed.prompt;
      totalCompletionTokens += task.tokensUsed.completion;
    }

    // 5. Synthesize Unified Agent Response
    const synthesizedResponse = this.synthesizeAgentOutputs(query, centralDecision, tasks);
    const pendingApprovals = agentApprovalManager.getPendingRequests();

    return {
      orchestrationId,
      query,
      centralDecision,
      tasks,
      synthesizedResponse,
      auditLogs: agentAuditLogger.getLogs({ orchestrationId }),
      totalCostUsd: totalCost,
      totalTokens: totalPromptTokens + totalCompletionTokens,
      totalDurationMs: Date.now() - startTime,
      pendingApprovals,
      success: tasks.every((t) => t.state === 'completed' || t.state === 'awaiting_approval'),
      loopBlocked: false,
      budgetBlocked: false,
      timestamp: Date.now(),
    };
  }

  /**
   * Central Brain Intelligence: Evaluates query semantics to select ONLY needed agents
   */
  public decideAgentNeeds(
    query: string,
    options?: { forceAgents?: AgentId[]; simulateLoopAttempt?: boolean }
  ): CentralBrainDecision {
    const q = query.toLowerCase();
    const allAgents: AgentId[] = Object.keys(FROGE_AGENT_DEFINITIONS) as AgentId[];
    const selected: Array<{
      agentId: AgentId;
      priority: number;
      rationale: string;
      delegationPayload: Record<string, any>;
      expectedOutputFormat: string;
    }> = [];
    const skipped: Array<{ agentId: AgentId; skipReason: string }> = [];

    // Simple greeting or trivial query check
    if (/^(hi|hello|hey|greetings|who are you|help|ping)(\s+(frog[eé]|there|bot|assistant))?[\.!\?]?$/i.test(q.trim())) {
      return {
        query,
        intentSummary: 'Conversational Greeting / Help Request',
        complexity: 'low',
        requiresAgents: false,
        selectedAgents: [],
        skippedAgents: allAgents.map((id) => ({
          agentId: id,
          skipReason: 'Trivial conversational request does not require specialized tool compute.',
        })),
        executionPlan: {
          executionMode: 'sequential',
          dependencyMap: {} as any,
          maxEstimatedCostUsd: 0.0001,
          maxEstimatedTokens: 150,
          globalTimeoutMs: 2000,
        },
        antiLoopGuards: {
          maxDepth: 2,
          cycleDetectionActive: true,
          callGraph: [],
          loopDetected: false,
        },
        budgetGuards: {
          globalCostCeilingUsd: agentBudgetManager.getGlobalCeiling(),
          currentSpentUsd: agentBudgetManager.getDailySpent(),
          budgetRemainingUsd: agentBudgetManager.getGlobalCeiling(),
          isWithinBudget: true,
        },
      };
    }

    if (options?.forceAgents && options.forceAgents.length > 0) {
      for (const fId of options.forceAgents) {
        selected.push({
          agentId: fId,
          priority: 1,
          rationale: 'Explicitly requested by user or test harness',
          delegationPayload: {},
          expectedOutputFormat: 'structured_domain_output',
        });
      }
    } else {
      // Intelligent Intent Dispatching

      // 1. Research Agent
      if (/\b(research|search|latest|recent|news|citations|papers|doi|studies|sources|academic|evidence)\b/.test(q)) {
        selected.push({
          agentId: 'research_agent',
          priority: 1,
          rationale: 'Query requires live web verification or peer-reviewed literature citations.',
          delegationPayload: { requireCitations: true },
          expectedOutputFormat: 'multi_source_citations',
        });
      }

      // 2. Coding Agent
      if (/\b(code|build|refactor|function|typescript|python|component|api|class|algorithm|regex|sql query|fix bug|syntax)\b/.test(q)) {
        selected.push({
          agentId: 'coding_agent',
          priority: 1,
          rationale: 'Query requests software engineering, AST blueprinting, or virtual file system generation.',
          delegationPayload: { language: 'typescript' },
          expectedOutputFormat: 'type_safe_ast_blueprint',
        });
      }

      // 3. Testing Agent
      if (/\b(test|unit test|fuzz|coverage|assertions|stress test|mock|edge case|qa|benchmark)\b/.test(q) || selected.some((s) => s.agentId === 'coding_agent')) {
        selected.push({
          agentId: 'testing_agent',
          priority: 2,
          rationale: 'Testing required to verify assertions, code correctness, or boundary fuzzing.',
          delegationPayload: { iterations: 500 },
          expectedOutputFormat: 'test_telemetry_report',
        });
      }

      // 4. Creative Agent
      if (/\b(poem|story|creative|lyric|metaphor|brand voice|prose|visual prompt|art|composition|sensory)\b/.test(q)) {
        selected.push({
          agentId: 'creative_agent',
          priority: 1,
          rationale: 'Creative expression and multi-sensory composition needed.',
          delegationPayload: { styleCadence: 'avant_garde' },
          expectedOutputFormat: 'creative_composition_package',
        });
      }

      // 5. Student Agent
      if (/\b(explain|teach|how does|socratic|quiz|eli5|student|learn|first principles|analogy|pedagogy)\b/.test(q)) {
        selected.push({
          agentId: 'student_agent',
          priority: 1,
          rationale: 'Pedagogical deconstruction into LEGO blocks and active recall quiz needed.',
          delegationPayload: { generateQuiz: true },
          expectedOutputFormat: 'socratic_breakdown_with_quiz',
        });
      }

      // 6. Business Agent
      if (/\b(sales|pipeline|ebitda|gaap|eoq|inventory|forecast|ltv|cac|revenue|reorder|margin|quota|cpm|gantt)\b/.test(q)) {
        selected.push({
          agentId: 'business_agent',
          priority: 1,
          rationale: 'Executive financial calculations, sales pipeline audit, or inventory math needed.',
          delegationPayload: { includeGaapTraces: true },
          expectedOutputFormat: 'business_intelligence_report',
        });
      }

      // 7. Data Agent
      if (/\b(data|sql|dataset|rows|records|distribution|z-score|mean|median|outlier|standard deviation|tabular)\b/.test(q) || selected.some((s) => s.agentId === 'business_agent')) {
        selected.push({
          agentId: 'data_agent',
          priority: 2,
          rationale: 'Tabular dataset parsing and statistical distribution modeling needed.',
          delegationPayload: { analyzeDistributions: true },
          expectedOutputFormat: 'statistical_distribution_summary',
        });
      }

      // 8. Verification Agent (Always invoked when factual claims, code, or financial math exist)
      if (selected.length > 0) {
        selected.push({
          agentId: 'verification_agent',
          priority: 3,
          rationale: 'Cross-checks factual claims, logic consistency, and measures hallucination entropy.',
          delegationPayload: { strictCrossCheck: true },
          expectedOutputFormat: 'fact_verification_audit',
        });
      }
    }

    // If still no agents matched, default to general research & verification
    if (selected.length === 0) {
      selected.push(
        {
          agentId: 'research_agent',
          priority: 1,
          rationale: 'Default grounding: Search verified domain knowledge.',
          delegationPayload: {},
          expectedOutputFormat: 'grounded_summary',
        },
        {
          agentId: 'verification_agent',
          priority: 2,
          rationale: 'Verify factual claims against ground truth.',
          delegationPayload: {},
          expectedOutputFormat: 'verification_stamp',
        }
      );
    }

    // Populate skipped agents
    const selectedIds = new Set(selected.map((s) => s.agentId));
    for (const aId of allAgents) {
      if (!selectedIds.has(aId)) {
        skipped.push({
          agentId: aId,
          skipReason: `Central Brain determined "${FROGE_AGENT_DEFINITIONS[aId].name}" is not required for query intent. Bypassed to eliminate unneeded compute.`,
        });
      }
    }

    // Build Execution Graph & Anti-Loop Check
    const callGraph: Array<{ from: string; to: string }> = [];
    for (const s of selected) {
      callGraph.push({ from: 'central_brain', to: s.agentId });
    }

    let loopDetected = false;
    let loopError: string | undefined;

    if (options?.simulateLoopAttempt) {
      loopDetected = true;
      loopError = 'Cyclic agent delegation detected: coding_agent ➔ testing_agent ➔ coding_agent. Recursion blocked.';
      callGraph.push({ from: 'coding_agent', to: 'testing_agent' });
      callGraph.push({ from: 'testing_agent', to: 'coding_agent' });
    }

    // Estimate Cost & Tokens
    let totalEstCost = 0.0005;
    let totalEstTokens = 400;
    for (const s of selected) {
      const def = FROGE_AGENT_DEFINITIONS[s.agentId];
      totalEstCost += def.permissions.maxComputeBudgetUsd;
      totalEstTokens += def.permissions.maxTokensPerTask;
    }

    return {
      query,
      intentSummary: `Orchestrated ${selected.length} specialized agents (${selected.map((s) => FROGE_AGENT_DEFINITIONS[s.agentId].shortName).join(', ')})`,
      complexity: selected.length > 2 ? 'high' : 'medium',
      requiresAgents: true,
      selectedAgents: selected,
      skippedAgents: skipped,
      executionPlan: {
        executionMode: 'dag',
        dependencyMap: {} as any,
        maxEstimatedCostUsd: totalEstCost,
        maxEstimatedTokens: totalEstTokens,
        globalTimeoutMs: 12000,
      },
      antiLoopGuards: {
        maxDepth: 2,
        cycleDetectionActive: true,
        callGraph,
        loopDetected,
        loopError,
      },
      budgetGuards: {
        globalCostCeilingUsd: agentBudgetManager.getGlobalCeiling(),
        currentSpentUsd: agentBudgetManager.getDailySpent(),
        budgetRemainingUsd: Math.max(0, agentBudgetManager.getGlobalCeiling() - totalEstCost),
        isWithinBudget: totalEstCost <= agentBudgetManager.getGlobalCeiling(),
      },
    };
  }

  private synthesizeAgentOutputs(
    query: string,
    decision: CentralBrainDecision,
    tasks: AgentTask[]
  ): string {
    const sections: string[] = [];

    sections.push(`## FROGÉ Multi-Agent Intelligence Synthesis\n\n**Query**: ${query}\n**Central Brain Decision**: Coordinated ${tasks.length} specialized agent(s) on-demand.`);

    for (const task of tasks) {
      const def = FROGE_AGENT_DEFINITIONS[task.agentId];
      const statusIcon = task.state === 'completed' ? '✅' : task.state === 'awaiting_approval' ? '🔒' : '⚠️';

      sections.push(`### ${statusIcon} ${def.name} (${def.domain})
- **Task State**: \`${task.state.toUpperCase()}\`
- **Whitelisted Tools Invoked**: ${task.toolInvocations.map((t) => `\`${t.toolId}\``).join(', ') || 'Domain heuristic synthesis'}
- **Summary**: ${task.summaryResult || 'Completed task execution'}
- **Telemetry**: ${task.tokensUsed.total} tokens | $${task.costUsd.toFixed(5)} compute | ${task.durationMs || 0}ms latency`);
    }

    if (decision.skippedAgents.length > 0) {
      sections.push(`> 💡 **Compute Governance**: Central FROGÉ Brain bypassed ${decision.skippedAgents.length} unnecessary agent(s) (${decision.skippedAgents.slice(0, 4).map((s) => FROGE_AGENT_DEFINITIONS[s.agentId].shortName).join(', ')}...) to maintain optimal latency and prevent token waste.`);
    }

    return sections.join('\n\n---\n\n');
  }
}

export const centralFrogeBrain = new CentralFrogeBrain();
