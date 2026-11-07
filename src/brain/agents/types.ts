/**
 * FROGÉ Agent Architecture - Core Type Definitions
 * Strict governance, tool whitelisting, permission boundaries, task state machine,
 * timeout controls, error recovery, structured audit logging, and human-in-the-loop approval.
 */

export type AgentId =
  | 'research_agent'
  | 'coding_agent'
  | 'testing_agent'
  | 'creative_agent'
  | 'student_agent'
  | 'business_agent'
  | 'data_agent'
  | 'verification_agent';

export type TaskState =
  | 'idle'
  | 'queued'
  | 'planning'
  | 'executing'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'timed_out'
  | 'blocked_by_policy'
  | 'cancelled';

export type AgentToolId =
  | 'web_search_engine'
  | 'academic_citation_retriever'
  | 'ast_code_generator'
  | 'sandbox_code_executor'
  | 'virtual_filesystem_writer'
  | 'unit_test_runner'
  | 'fuzz_tester'
  | 'creative_metaphor_composer'
  | 'image_asset_generator'
  | 'socratic_quiz_synthesizer'
  | 'concept_deconstructor'
  | 'gaap_financial_calculator'
  | 'inventory_eoq_solver'
  | 'sales_velocity_auditor'
  | 'sql_data_engine'
  | 'statistical_analyzer'
  | 'claim_fact_checker'
  | 'hallucination_detector';

export interface ToolDefinition {
  id: AgentToolId;
  name: string;
  category: 'search' | 'code' | 'test' | 'creative' | 'education' | 'business' | 'data' | 'verification';
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedCostUsd: number;
  requiresExplicitApproval: boolean;
  timeoutMs: number;
}

export interface PermissionBoundaries {
  readOnly: boolean;
  networkAccess: 'none' | 'whitelisted' | 'unrestricted';
  filesystemAccess: 'none' | 'virtual_sandbox' | 'read_only' | 'full';
  systemMutation: 'forbidden' | 'sandboxed' | 'requires_human_approval' | 'allowed';
  maxComputeBudgetUsd: number;
  maxTokensPerTask: number;
  maxConcurrentTasks: number;
  allowedSubAgentCalls: AgentId[];
  maxDelegationDepth: number; // 0 = no delegation, 1 = can call 1 layer of sub-agents
}

export interface ErrorHandlingPolicy {
  maxRetries: number;
  retryBackoffMs: number;
  fallbackStrategy: 'graceful_degradation' | 'cached_response' | 'delegate_to_fallback' | 'fail_fast';
  circuitBreakerThreshold: number; // consecutive failures before tripping
  cooldownPeriodMs: number;
}

export interface ApprovalPolicy {
  autoApproveLowRisk: boolean;
  requireApprovalForTools: AgentToolId[];
  requireApprovalForCostOverUsd: number;
  requireApprovalForMutation: boolean;
}

export interface AgentDefinition {
  id: AgentId;
  name: string;
  shortName: string;
  purpose: string;
  domain: string;
  iconName: string;
  accentColor: string;
  allowedTools: AgentToolId[];
  permissions: PermissionBoundaries;
  defaultTimeoutMs: number;
  errorHandling: ErrorHandlingPolicy;
  approvalPolicy: ApprovalPolicy;
}

export interface ToolInvocationRecord {
  invocationId: string;
  toolId: AgentToolId;
  timestamp: number;
  inputParams: Record<string, any>;
  outputResult?: any;
  durationMs: number;
  costUsd: number;
  success: boolean;
  error?: string;
}

export interface ApprovalRequest {
  requestId: string;
  agentId: AgentId;
  taskId: string;
  actionTitle: string;
  description: string;
  riskLevel: 'medium' | 'high' | 'critical';
  riskCategory: 'financial' | 'data_mutation' | 'external_communication' | 'code_execution' | 'policy_boundary';
  requestedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  respondedAt?: number;
  simulationDiff?: {
    before: Record<string, any>;
    after: Record<string, any>;
    impactSummary: string;
  };
  estimatedCostUsd?: number;
}

export interface AgentTask {
  taskId: string;
  agentId: AgentId;
  parentTaskId?: string;
  rootOrchestrationId: string;
  query: string;
  state: TaskState;
  stateHistory: Array<{ state: TaskState; timestamp: number; reason?: string }>;
  inputPayload: Record<string, any>;
  outputPayload?: Record<string, any>;
  summaryResult?: string;
  toolInvocations: ToolInvocationRecord[];
  approvalRequest?: ApprovalRequest;
  tokensUsed: { prompt: number; completion: number; total: number };
  costUsd: number;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  timeoutMs: number;
  error?: { code: string; message: string; recoverable: boolean };
  retryCount: number;
  maxRetries: number;
  circuitBreakerTripped?: boolean;
}

export interface AgentLogEntry {
  logId: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'security' | 'audit' | 'approval';
  agentId: AgentId;
  taskId?: string;
  orchestrationId?: string;
  category: 'lifecycle' | 'tool_call' | 'permission_check' | 'cost_budget' | 'approval' | 'loop_guard' | 'error_recovery';
  message: string;
  metadata?: Record<string, any>;
}

export interface CentralBrainDecision {
  query: string;
  intentSummary: string;
  complexity: 'low' | 'medium' | 'high' | 'expert';
  requiresAgents: boolean;
  selectedAgents: Array<{
    agentId: AgentId;
    priority: number;
    rationale: string;
    delegationPayload: Record<string, any>;
    expectedOutputFormat: string;
  }>;
  skippedAgents: Array<{
    agentId: AgentId;
    skipReason: string;
  }>;
  executionPlan: {
    executionMode: 'parallel' | 'sequential' | 'dag';
    dependencyMap: Record<AgentId, AgentId[]>;
    maxEstimatedCostUsd: number;
    maxEstimatedTokens: number;
    globalTimeoutMs: number;
  };
  antiLoopGuards: {
    maxDepth: number;
    cycleDetectionActive: boolean;
    callGraph: Array<{ from: string; to: string }>;
    loopDetected: boolean;
    loopError?: string;
  };
  budgetGuards: {
    globalCostCeilingUsd: number;
    currentSpentUsd: number;
    budgetRemainingUsd: number;
    isWithinBudget: boolean;
  };
}

export interface AgentOrchestrationResult {
  orchestrationId: string;
  query: string;
  centralDecision: CentralBrainDecision;
  tasks: AgentTask[];
  synthesizedResponse: string;
  auditLogs: AgentLogEntry[];
  totalCostUsd: number;
  totalTokens: number;
  totalDurationMs: number;
  pendingApprovals: ApprovalRequest[];
  success: boolean;
  loopBlocked: boolean;
  budgetBlocked: boolean;
  timestamp: number;
}
