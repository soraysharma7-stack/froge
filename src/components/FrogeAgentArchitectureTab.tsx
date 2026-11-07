/**
 * FROGÉ Agent Architecture - Interactive Studio & Governance Panel
 * Visualizes the 8 Specialized Agents, Central Brain Need-Detection, Whitelisted Tool Sandbox,
 * Permission Boundaries, Task State Machines, Anti-Loop DAGs, Budget Ceilings, and Approvals.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Code2,
  CheckSquare,
  Sparkles,
  GraduationCap,
  TrendingUp,
  Database,
  Compass,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Coins,
  Cpu,
  Clock,
  ArrowRight,
  Filter,
  Eye,
  RefreshCw,
  Search,
  Check,
  X,
  FileText,
  Workflow,
  Layers,
  Terminal,
} from 'lucide-react';
import {
  AgentId,
  AgentOrchestrationResult,
  ApprovalRequest,
  AgentLogEntry,
  FROGE_AGENT_DEFINITIONS,
  agentRegistry,
  centralFrogeBrain,
  agentApprovalManager,
  agentAuditLogger,
  agentBudgetManager,
  runFrogeAgentTestSuite,
  AgentTestSuiteSummary,
} from '../brain/agents';

export const FrogeAgentArchitectureTab: React.FC = () => {
  // Query dispatch state
  const [queryInput, setQueryInput] = useState<string>(
    'Build a type-safe sorting utility with unit tests and fuzzing coverage'
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [orchestrationResult, setOrchestrationResult] = useState<AgentOrchestrationResult | null>(null);

  // Selected agent inspector
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('coding_agent');

  // Test suite state
  const [testSummary, setTestSummary] = useState<AgentTestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // Approvals & Logs state
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>(() =>
    agentApprovalManager.getPendingRequests()
  );
  const [logs, setLogs] = useState<AgentLogEntry[]>(() => agentAuditLogger.getLogs({ limit: 40 }));
  const [logFilterCategory, setLogFilterCategory] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'dispatcher' | 'agents' | 'guardrails' | 'approvals' | 'logs'>('dispatcher');

  // Auto-refresh subscriptions
  useEffect(() => {
    const unsubLogs = agentAuditLogger.subscribe(() => {
      setLogs(agentAuditLogger.getLogs({ limit: 50 }));
    });
    const unsubAppr = agentApprovalManager.subscribe(() => {
      setPendingApprovals(agentApprovalManager.getPendingRequests());
    });

    // Initial test suite execution
    if (!testSummary) {
      handleRunTestSuite();
    }

    return () => {
      unsubLogs();
      unsubAppr();
    };
  }, []);

  const handleRunOrchestration = async (
    overrideQuery?: string,
    options?: { simulateLoop?: boolean; simulateOverbudget?: boolean; simulateApproval?: boolean }
  ) => {
    setIsExecuting(true);
    const q = overrideQuery || queryInput;
    try {
      const res = await centralFrogeBrain.orchestrate(q, {
        simulateLoopAttempt: options?.simulateLoop,
        simulateOverbudgetAttempt: options?.simulateOverbudget,
        simulateApprovalIntercept: options?.simulateApproval,
      });
      setOrchestrationResult(res);
      setPendingApprovals(agentApprovalManager.getPendingRequests());
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunTestSuite = async () => {
    setIsRunningTests(true);
    try {
      const results = await runFrogeAgentTestSuite();
      setTestSummary(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleApprove = (requestId: string) => {
    agentApprovalManager.approveRequest(requestId, 'Security Administrator');
    setPendingApprovals(agentApprovalManager.getPendingRequests());
  };

  const handleReject = (requestId: string) => {
    agentApprovalManager.rejectRequest(requestId, 'Declined by Administrator');
    setPendingApprovals(agentApprovalManager.getPendingRequests());
  };

  const allAgents = agentRegistry.getAllAgents();
  const selectedAgent = agentRegistry.getAgent(selectedAgentId);

  const filteredLogs = logs.filter((l) => {
    if (logFilterCategory === 'all') return true;
    return l.category === logFilterCategory;
  });

  const getAgentIcon = (id: AgentId) => {
    switch (id) {
      case 'research_agent':
        return <Compass className="w-4 h-4 text-sky-500" />;
      case 'coding_agent':
        return <Code2 className="w-4 h-4 text-emerald-500" />;
      case 'testing_agent':
        return <CheckSquare className="w-4 h-4 text-purple-500" />;
      case 'creative_agent':
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      case 'student_agent':
        return <GraduationCap className="w-4 h-4 text-amber-500" />;
      case 'business_agent':
        return <TrendingUp className="w-4 h-4 text-amber-700" />;
      case 'data_agent':
        return <Database className="w-4 h-4 text-blue-500" />;
      case 'verification_agent':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Top Banner & Automated 16-Point Test Suite Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-500/10 via-teal-50 to-cyan-50 rounded-2xl border border-emerald-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-600 text-white shadow-2xs">
              <Workflow className="w-4 h-4" />
            </span>
            <span className="font-bold text-emerald-950 text-base">FROGÉ Agent Architecture</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-xs font-bold">
              8 Specialized Agents & Central Brain
            </span>
          </div>
          <p className="text-xs text-emerald-900 mt-1 max-w-2xl">
            Autonomous multi-agent governance with strict tool whitelisting, permission boundaries, task state machines, anti-loop DAG cycle detection, and uncontrolled spending guards.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {testSummary && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-emerald-300 shadow-2xs text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">
                {testSummary.passed} / {testSummary.total} Tests Verified
              </span>
            </div>
          )}
          <button
            onClick={handleRunTestSuite}
            disabled={isRunningTests}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-2xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
            <span>{isRunningTests ? 'Verifying Architecture...' : 'Run Agent Test Suite'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('dispatcher')}
          className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'dispatcher' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-emerald-600" />
          Central Brain Dispatcher
        </button>
        <button
          onClick={() => setActiveSubTab('agents')}
          className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'agents' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          8 Specialized Agents ({allAgents.length})
        </button>
        <button
          onClick={() => setActiveSubTab('guardrails')}
          className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'guardrails' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          Anti-Loop & Spend Guards
        </button>
        <button
          onClick={() => setActiveSubTab('approvals')}
          className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'approvals' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          Human Approvals
          {pendingApprovals.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {pendingApprovals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'logs' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-slate-700" />
          Audit Logs ({logs.length})
        </button>
      </div>

      {/* Tab 1: Central Brain Dispatcher & Interactive Sandbox */}
      {activeSubTab === 'dispatcher' && (
        <div className="space-y-4">
          {/* Query Input & Preset Buttons */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                Central Brain Query Dispatcher
              </span>
              <span className="text-[11px] text-slate-500">
                The Central Brain evaluates query semantics and activates ONLY genuinely needed agents.
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask FROGÉ a complex query to observe selective multi-agent delegation..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleRunOrchestration()}
                disabled={isExecuting || !queryInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 text-xs transition-colors disabled:opacity-50 shrink-0"
              >
                <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? 'Dispatching...' : 'Dispatch to Central Brain'}</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
              <span className="text-slate-500 font-semibold mr-1">Presets:</span>
              <button
                onClick={() => {
                  const q = 'Build a type-safe sorting algorithm with unit assertions and fuzzing';
                  setQueryInput(q);
                  handleRunOrchestration(q);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                💻 Coding & QA
              </button>
              <button
                onClick={() => {
                  const q = 'Audit sales pipeline velocity, EBITDA margin, and calculate inventory EOQ';
                  setQueryInput(q);
                  handleRunOrchestration(q);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                📊 Business & Finance
              </button>
              <button
                onClick={() => {
                  const q = 'Explain distributed consensus algorithms (Paxos vs Raft) with a diagnostic quiz';
                  setQueryInput(q);
                  handleRunOrchestration(q);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                🎓 Student & Socratic
              </button>
              <button
                onClick={() => {
                  const q = 'Deep research clinical trials and citation sources for mRNA therapeutics';
                  setQueryInput(q);
                  handleRunOrchestration(q);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                🔬 Research & Citations
              </button>
              <button
                onClick={() => {
                  const q = 'Hello FROGÉ, how are you?';
                  setQueryInput(q);
                  handleRunOrchestration(q);
                }}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors font-medium"
              >
                💬 Trivial Greeting (0 Agents Needed)
              </button>
              <button
                onClick={() => {
                  const q = 'Test recursive agent recursion safety';
                  setQueryInput(q);
                  handleRunOrchestration(q, { simulateLoop: true });
                }}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-lg transition-colors font-medium"
              >
                🛑 Test Anti-Loop Intercept
              </button>
              <button
                onClick={() => {
                  const q = 'Overbudget query simulating runaway compute loop';
                  setQueryInput(q);
                  handleRunOrchestration(q, { simulateOverbudget: true });
                }}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg transition-colors font-medium"
              >
                💰 Test Cost Ceiling Guard
              </button>
            </div>
          </div>

          {/* Orchestration Live Result */}
          {orchestrationResult && (
            <div className="space-y-3">
              {/* Central Decision Summary Banner */}
              <div
                className={`p-4 rounded-2xl border ${
                  orchestrationResult.loopBlocked || orchestrationResult.budgetBlocked
                    ? 'bg-red-50/70 border-red-200'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">Central FROGÉ Brain Decision</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                      {orchestrationResult.orchestrationId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      ${orchestrationResult.totalCostUsd.toFixed(5)} compute
                    </span>
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      {orchestrationResult.totalTokens} tokens
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {orchestrationResult.totalDurationMs}ms
                    </span>
                  </div>
                </div>

                {/* Selected vs Skipped Agents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Specialized Agents Activated ({orchestrationResult.centralDecision.selectedAgents.length}):
                    </div>
                    {orchestrationResult.centralDecision.selectedAgents.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Zero sub-agents needed. Handled directly by Brain.</p>
                    ) : (
                      <div className="space-y-1">
                        {(orchestrationResult.centralDecision?.selectedAgents || []).map((sel) => (
                          <div key={sel.agentId} className="flex items-center justify-between text-xs bg-white p-1.5 rounded-lg border border-emerald-100">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              {getAgentIcon(sel.agentId)}
                              {FROGE_AGENT_DEFINITIONS[sel.agentId].name}
                            </span>
                            <span className="text-[10px] text-slate-500">{sel.rationale}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      Agents Bypassed ({orchestrationResult.centralDecision.skippedAgents.length}) [Zero Unneeded Compute]:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(orchestrationResult.centralDecision?.skippedAgents || []).map((sk) => (
                        <span key={sk.agentId} className="px-2 py-0.5 bg-white rounded-md border border-slate-200 text-[10px] text-slate-600 font-medium" title={sk.skipReason}>
                          {FROGE_AGENT_DEFINITIONS[sk.agentId].shortName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Execution Tasks Breakdown */}
                {orchestrationResult.tasks.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold text-slate-700">Executed Task Lifecycle & State Records:</div>
                    <div className="space-y-2">
                      {(orchestrationResult.tasks || []).map((task) => {
                        const def = FROGE_AGENT_DEFINITIONS[task.agentId];
                        return (
                          <div key={task.taskId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {getAgentIcon(task.agentId)}
                                <span className="font-bold text-slate-800">{def.name}</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                                  State: {task.state}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                {task.tokensUsed.total} tok | ${task.costUsd.toFixed(4)} | {task.durationMs}ms
                              </span>
                            </div>

                            <p className="text-slate-700 font-medium">{task.summaryResult}</p>

                            {/* Whitelisted Tools Invoked */}
                            {task.toolInvocations && task.toolInvocations.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <span className="text-[10px] font-semibold text-slate-500">Whitelisted Tools:</span>
                                {(task.toolInvocations || []).map((inv) => (
                                  <span key={inv.invocationId} className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono text-slate-700">
                                    {inv.toolId} ({inv.durationMs}ms)
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* State transitions trace */}
                            <div className="text-[10px] text-slate-500 font-mono pt-1">
                              Lifecycle Trace: {(task.stateHistory || []).map((s) => s.state).join(' ➔ ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: 8 Specialized Agents Deep Inspector */}
      {activeSubTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Agent Selection List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block px-1">
              FROGÉ Specialized Agents
            </span>
            <div className="space-y-1.5">
              {allAgents.map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgentId(ag.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    selectedAgentId === ag.id
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs font-bold text-emerald-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {getAgentIcon(ag.id)}
                    <div>
                      <div className="text-xs font-bold">{ag.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{ag.domain}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Inspector Card */}
          <div className="md:col-span-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {getAgentIcon(selectedAgent.id)}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedAgent.name}</h3>
                  <p className="text-[11px] text-slate-500">{selectedAgent.domain}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                Timeout: {selectedAgent.defaultTimeoutMs}ms
              </span>
            </div>

            {/* Purpose */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Defined Purpose</span>
              <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                {selectedAgent.purpose}
              </p>
            </div>

            {/* Allowed Whitelisted Tools */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Whitelisted Allowed Tools ({selectedAgent.allowedTools.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedAgent.allowedTools.map((tId) => (
                  <div key={tId} className="p-2 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-900">{tId}</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Permission Boundaries & Ceilings */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Permission Boundaries</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Access Mode</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {selectedAgent.permissions.readOnly ? '🔒 Read-Only' : '✏️ Read-Write'}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Network Access</div>
                  <div className="font-bold text-slate-800 mt-0.5 capitalize">
                    {selectedAgent.permissions.networkAccess}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">System Mutation</div>
                  <div className="font-bold text-slate-800 mt-0.5 capitalize">
                    {selectedAgent.permissions.systemMutation.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Max Task Budget</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    ${selectedAgent.permissions.maxComputeBudgetUsd} USD
                  </div>
                </div>
              </div>
            </div>

            {/* Error Handling & Approval Requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Error Handling Policy:</span>
                <p className="text-slate-600">
                  Max Retries: {selectedAgent.errorHandling.maxRetries} | Backoff: {selectedAgent.errorHandling.retryBackoffMs}ms
                </p>
                <p className="text-slate-600 capitalize">
                  Strategy: {selectedAgent.errorHandling.fallbackStrategy.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Approval Policy:</span>
                <p className="text-slate-600">
                  Auto-Approve Low Risk: {selectedAgent.approvalPolicy.autoApproveLowRisk ? 'Yes' : 'No'}
                </p>
                <p className="text-slate-600">
                  Cost Approval Threshold: &gt; ${selectedAgent.approvalPolicy.requireApprovalForCostOverUsd}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Anti-Loop & Uncontrolled Spending Guardrails */}
      {activeSubTab === 'guardrails' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Anti-Loop Guard */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-900 text-sm">Anti-Loop & DAG Cycle Guard</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Active Enforcer
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              FROGÉ enforces strict Directed Acyclic Graph (DAG) validation. Agents are strictly forbidden from automatically calling other agents recursively in uncontrolled infinite loops.
            </p>

            <div className="space-y-2 p-3 bg-purple-50/50 rounded-xl border border-purple-200">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Max Delegation Depth:</span>
                <span className="font-bold text-purple-950">2 (Central Brain ➔ Agent ➔ Leaf Sub-agent)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Max Sub-Agent Fanout:</span>
                <span className="font-bold text-purple-950">3 concurrent sub-agents per task</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Cycle Detection:</span>
                <span className="font-bold text-emerald-700">Immediate Abort on Duplicate Stack Frames</span>
              </div>
            </div>

            <button
              onClick={() => handleRunOrchestration('Test recursive infinite loop', { simulateLoop: true })}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Simulate & Verify Anti-Loop Intercept
            </button>
          </div>

          {/* Uncontrolled Spending Protection */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900 text-sm">Uncontrolled Spending Protection</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Active Enforcer
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Hard global cost ceilings and per-task token quotas protect against unexpected API spend or runaway background loops.
            </p>

            <div className="space-y-2 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Global Request Cost Ceiling:</span>
                <span className="font-bold text-amber-950">${agentBudgetManager.getGlobalCeiling().toFixed(3)} USD / query</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Max Tokens Per Task:</span>
                <span className="font-bold text-amber-950">3,000 - 5,000 tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Circuit Breaker Trip Threshold:</span>
                <span className="font-bold text-emerald-700">3 consecutive task failures</span>
              </div>
            </div>

            <button
              onClick={() => handleRunOrchestration('Test overbudget cost safety', { simulateOverbudget: true })}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              Simulate & Verify Spending Ceiling Safeguard
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Human-in-the-Loop Approval Queue */}
      {activeSubTab === 'approvals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Human-in-the-Loop Consequential Action Queue ({pendingApprovals.length})
            </span>
            <button
              onClick={() => handleRunOrchestration('Patch files and deploy virtual changes', { simulateApproval: true })}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors"
            >
              + Trigger Sample Approval Request
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">All Action Approvals Clear</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No pending consequential mutations or high-risk tool operations awaiting human operator confirmation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(pendingApprovals || []).map((req) => {
                const def = FROGE_AGENT_DEFINITIONS[req.agentId];
                return (
                  <div key={req.requestId} className="p-4 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        {getAgentIcon(req.agentId)}
                        <span className="font-bold text-slate-900">{req.actionTitle}</span>
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold uppercase text-[10px]">
                          Risk: {req.riskLevel}
                        </span>
                      </div>
                      <span className="text-slate-500 text-[10px] font-mono">{req.requestId}</span>
                    </div>

                    <p className="text-slate-700">{req.description}</p>

                    {req.simulationDiff && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px]">
                        <div className="text-slate-500 mb-1">Proposed Mutation Diff:</div>
                        <div className="text-emerald-700 font-semibold">{req.simulationDiff.impactSummary}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleReject(req.requestId)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject Action
                      </button>
                      <button
                        onClick={() => handleApprove(req.requestId)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Authorize & Execute
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Real-time Structured Audit Log Stream */}
      {activeSubTab === 'logs' && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-200 space-y-3 text-xs font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Central Structured Audit Log Stream</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={logFilterCategory}
                onChange={(e) => setLogFilterCategory(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
              >
                <option value="all">All Categories ({logs.length})</option>
                <option value="lifecycle">Lifecycle Transitions</option>
                <option value="tool_call">Tool Invocations</option>
                <option value="permission_check">Permission Boundaries</option>
                <option value="cost_budget">Cost & Budgets</option>
                <option value="loop_guard">Anti-Loop Guards</option>
                <option value="approval">Human Approvals</option>
              </select>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
            {(filteredLogs || []).map((log) => (
              <div key={log.logId} className="p-2 rounded bg-slate-800/60 border border-slate-800 flex items-start gap-2 text-[11px]">
                <span className="text-slate-500 shrink-0">
                  {new Date(log.timestamp).toISOString().substring(11, 19)}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] shrink-0 ${
                    log.level === 'error' || log.level === 'security'
                      ? 'bg-red-900/80 text-red-200'
                      : log.level === 'approval'
                      ? 'bg-amber-900/80 text-amber-200'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {log.category}
                </span>
                <span className="text-emerald-400 font-bold shrink-0">[{FROGE_AGENT_DEFINITIONS[log.agentId]?.shortName || log.agentId}]</span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
