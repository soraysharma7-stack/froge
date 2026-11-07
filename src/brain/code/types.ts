/**
 * FROGÉ Code Engine - Extended Type Definitions
 * 
 * Complete Autonomous Software Engineering & Workspace Architecture:
 * - Code Generation & Multi-File Architecture
 * - Code Explanation & Complexity Analysis
 * - Step-by-Step Debugging & Variable Inspection
 * - Automated Code Review & Clean Code Metrics
 * - Unit & Integration Testing Runner
 * - Virtual Project File System (VFS)
 * - Deep Error Analysis & Root Cause Diagnosis
 * - Iterative Self-Healing Fix Loop
 * - Task Lifecycle State Machine (Pause / Resume / Snapshot)
 * - Secure Sandbox Interface (Filesystem Isolation, Process & Resource Limits, Timeouts, Network Isolation)
 */

export type CodeProjectCategory =
  | 'fullstack_web'
  | 'frontend_spa'
  | 'backend_api'
  | 'cli_utility'
  | 'data_pipeline'
  | 'ai_agent_service';

export interface UserRequirement {
  id: string;
  category: 'functional' | 'technical' | 'security' | 'performance' | 'ui_ux';
  description: string;
  isExplicit: boolean;
  priority: 'must_have' | 'should_have' | 'nice_to_have';
  testableCriteria: string[];
}

export interface RequirementsAnalysis {
  projectTitle: string;
  summary: string;
  category: CodeProjectCategory;
  targetStack: {
    language: 'typescript' | 'javascript' | 'python';
    framework: string;
    runtime: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  requirements: UserRequirement[];
  constraints: string[];
  assumptions: string[];
}

export interface ProjectFileSpec {
  path: string;
  purpose: string;
  isEntryPoint?: boolean;
  isTestFile?: boolean;
  language: 'typescript' | 'tsx' | 'javascript' | 'json' | 'css' | 'html' | 'sql' | 'python';
  dependencies: string[];
}

export interface ProjectPlan {
  id: string;
  title: string;
  architectureType: 'monolithic_spa' | 'fullstack_api_client' | 'modular_microservice' | 'serverless_engine';
  architectureDescription: string;
  directoryStructure: string[];
  filesToGenerate: ProjectFileSpec[];
  buildSteps: string[];
  executionStrategy: string;
  testingStrategy: string;
}

export interface GeneratedCodeFile {
  path: string;
  content: string;
  language: string;
  linesOfCode: number;
  sizeBytes: number;
  isClean: boolean;
  hasBeenFixed?: boolean;
}

// ============================================================================
// 1. SECURE SANDBOX & RUNTIME ISOLATION TYPES
// ============================================================================

export type SandboxSecurityPolicy = {
  allowFilesystemWrite: boolean;
  virtualRootOnly: boolean; // Confines all operations to in-memory /workspace
  blockPathTraversal: boolean; // Denies .., /etc, /root, C:\
  allowProcessSpawn: boolean; // MUST be false
  allowEvalOrFunction: boolean; // MUST be false
  allowNetworkOutbound: boolean; // MUST be false or strict mock allowlist
  maxExecutionTimeMs: number; // e.g., 2000ms
  maxMemoryLimitMb: number; // e.g., 64MB
  maxCallStackDepth: number; // e.g., 500 frames
  maxLoopIterations: number; // e.g., 100,000 ops
};

export type SecurityViolationType =
  | 'filesystem_escape'
  | 'process_spawn'
  | 'banned_global'
  | 'network_access'
  | 'resource_limit_exceeded'
  | 'execution_timeout'
  | 'prototype_pollution'
  | 'host_environment_access';

export interface SecurityViolation {
  id: string;
  type: SecurityViolationType;
  severity: 'critical' | 'high' | 'medium';
  message: string;
  payloadSnippet?: string;
  blockedAt: string;
  ruleViolated: string;
}

export interface SandboxExecutionConfig {
  code: string;
  language: 'typescript' | 'javascript' | 'python';
  entryPoint?: string;
  virtualFiles?: Record<string, string>;
  inputArgs?: string[];
  policy?: Partial<SandboxSecurityPolicy>;
  timeoutMs?: number;
}

export interface SandboxExecutionResult {
  executionId: string;
  status: 'success' | 'runtime_error' | 'timeout' | 'security_violation';
  exitCode: number;
  stdout: string[];
  stderr: string[];
  logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'error' | 'debug'; message: string }>;
  executionDurationMs: number;
  memoryUsageMb: number;
  returnValue?: any;
  securityViolations: SecurityViolation[];
  stackTrace?: string;
  isSafeAndContained: boolean;
}

export interface AppExecutionStatus {
  status: 'idle' | 'compiling' | 'running' | 'crashed' | 'terminated';
  environment: 'sandbox_isolated_v8' | 'sandbox_simulated' | 'virtual_worker';
  port?: number;
  logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'error' | 'debug'; message: string }>;
  startupTimeMs: number;
  memoryUsageMb: number;
  isHealthy: boolean;
  sandboxIsolationVerified: boolean;
}

// ============================================================================
// 2. VIRTUAL FILE SYSTEM (VFS) TYPES
// ============================================================================

export interface VirtualFileNode {
  path: string;
  name: string;
  extension: string;
  content: string;
  sizeBytes: number;
  linesOfCode: number;
  isDirectory: boolean;
  isReadOnly?: boolean;
  modifiedAt: string;
  children?: VirtualFileNode[];
}

export interface VFSChangeEvent {
  id: string;
  action: 'create' | 'update' | 'delete' | 'rename';
  path: string;
  previousPath?: string;
  timestamp: string;
  diffSummary?: string;
}

export interface VFSSnapshot {
  snapshotId: string;
  timestamp: string;
  files: Record<string, string>;
  description?: string;
}

// ============================================================================
// 3. TESTING & ASSERTIONS TYPES
// ============================================================================

export interface TestCaseResult {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'edge_case' | 'security';
  targetFile: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  assertionMessage?: string;
  failureDetails?: {
    expected: any;
    actual: any;
    stackTrace: string;
  };
}

export interface TestExecutionReport {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number; // 0 - 100
  durationMs: number;
  results: TestCaseResult[];
  allPassed: boolean;
  codeCoverage?: {
    linesPercent: number;
    functionsPercent: number;
    branchesPercent: number;
  };
}

// ============================================================================
// 4. ERROR ANALYSIS & ITERATIVE FIX TYPES
// ============================================================================

export interface DetectedError {
  id: string;
  category:
    | 'syntax'
    | 'type_error'
    | 'runtime_exception'
    | 'logic_flaw'
    | 'missing_dependency'
    | 'security_flaw'
    | 'timeout_deadlock'
    | 'sandbox_violation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  filePath: string;
  lineNumber?: number;
  columnNumber?: number;
  errorMessage: string;
  stackSnippet?: string;
  rootCauseAnalysis: string;
  suggestedFix: string;
  isResolved: boolean;
}

export interface CodePatch {
  filePath: string;
  errorId: string;
  rationale: string;
  originalCodeSnippet: string;
  replacementCodeSnippet: string;
  diffSummary: string;
  linesModified?: number[];
}

export interface FixIteration {
  iterationNumber: number;
  errorsDetected: DetectedError[];
  patchesApplied: CodePatch[];
  retestReport: TestExecutionReport;
  successful: boolean;
  timestamp: string;
}

// ============================================================================
// 5. CODE EXPLANATION & COMPLEXITY TYPES
// ============================================================================

export interface CodeLineExplanation {
  lineNumber: number;
  code: string;
  purpose: string;
  conceptsUsed: string[];
  complexityNote?: string;
}

export interface ComplexityAnalysis {
  timeComplexity: string; // e.g., O(1), O(log n), O(n), O(n log n), O(n^2)
  spaceComplexity: string; // e.g., O(1), O(n)
  timeReasoning: string;
  spaceReasoning: string;
  potentialBottlenecks: string[];
  optimizationTips: string[];
}

export interface CodeExplanationReport {
  title: string;
  overview: string;
  targetFile: string;
  architectureRole: string;
  keyConcepts: string[];
  lineBreakdown: CodeLineExplanation[];
  complexity: ComplexityAnalysis;
  flowDiagramMermaid?: string;
  designPatterns: string[];
  educationalTakeaways: string[];
}

// ============================================================================
// 6. DEBUGGING ENGINE & BREAKPOINT TYPES
// ============================================================================

export interface DebugStackFrame {
  id: string;
  functionName: string;
  filePath: string;
  lineNumber: number;
  columnNumber?: number;
  scopeVariables: Record<string, any>;
}

export interface DebugStepRecord {
  stepIndex: number;
  lineNumber: number;
  codeLine: string;
  event: 'step' | 'breakpoint_hit' | 'variable_mutated' | 'function_call' | 'exception_thrown';
  callStack: DebugStackFrame[];
  variableSnapshot: Record<string, any>;
  outputLog?: string;
}

export interface DebugSession {
  sessionId: string;
  targetFile: string;
  code: string;
  breakpoints: number[];
  currentStepIndex: number;
  totalSteps: number;
  currentLine: number;
  isPaused: boolean;
  isCompleted: boolean;
  callStack: DebugStackFrame[];
  watchedVariables: Record<string, any>;
  stepHistory: DebugStepRecord[];
  interceptedException?: {
    message: string;
    line: number;
    type: string;
  };
}

// ============================================================================
// 7. CODE REVIEW & AUDIT TYPES
// ============================================================================

export interface CodeReviewRuleViolation {
  id: string;
  ruleName: string;
  category: 'clean_code' | 'performance' | 'type_safety' | 'security' | 'maintainability' | 'style';
  severity: 'error' | 'warning' | 'info';
  filePath: string;
  lineNumber?: number;
  description: string;
  suggestion: string;
  codeSnippet?: string;
}

export interface CodeReviewReport {
  overallScore: number; // 0 - 100
  maintainabilityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  cyclomaticComplexity: number;
  summary: string;
  violations: CodeReviewRuleViolation[];
  positiveHighlights: string[];
  typeSafetyScore: number; // 0 - 100
  cleanCodeScore: number; // 0 - 100
  securityScore: number; // 0 - 100
  estimatedRefactorTimeMinutes: number;
}

// ============================================================================
// 8. TASK STATE MACHINE (PAUSE / RESUME / SNAPSHOT)
// ============================================================================

export type TaskExecutionStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'paused'
  | 'resumed'
  | 'completed'
  | 'failed'
  | 'aborted';

export interface TaskStateCheckpoint {
  checkpointId: string;
  taskId: string;
  timestamp: string;
  status: TaskExecutionStatus;
  currentStage: FrogeCodeStage;
  stageIndex: number;
  totalStages: number;
  completedStages: FrogeCodeStage[];
  memoryState: Record<string, any>;
  vfsSnapshot: VFSSnapshot;
  logs: string[];
}

export interface FrogeCodeTaskState {
  taskId: string;
  prompt: string;
  status: TaskExecutionStatus;
  currentStage: FrogeCodeStage;
  stageIndex: number;
  totalStages: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  pausedAt?: string;
  resumedAt?: string;
  completedAt?: string;
  checkpoints: TaskStateCheckpoint[];
  canPause: boolean;
  canResume: boolean;
  canStep: boolean;
  canAbort: boolean;
}

// ============================================================================
// 9. SECURITY VULNERABILITY TYPES
// ============================================================================

export interface SecurityVulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  category:
    | 'hardcoded_secret'
    | 'injection_sql_command'
    | 'xss_vulnerability'
    | 'insecure_deserialization'
    | 'cors_misconfiguration'
    | 'auth_bypass'
    | 'dependency_vulnerability'
    | 'sandbox_escape_attempt'
    | 'prototype_pollution';
  filePath: string;
  lineNumber?: number;
  codeSnippet?: string;
  remediation: string;
  cwe?: string;
}

export interface SecurityAuditReport {
  isSecure: boolean;
  securityScore: number; // 0 - 100
  vulnerabilitiesFound: SecurityVulnerability[];
  checksPerformed: string[];
  safeDependenciesVerified: boolean;
  zeroSecretsLeaked: boolean;
  sanitizationCompliant: boolean;
  sandboxIsolationVerified: boolean;
}

// ============================================================================
// 10. OVERALL WORKFLOW RESULT
// ============================================================================

export type FrogeCodeStage =
  | 'understand_requirements'
  | 'create_project_plan'
  | 'generate_files'
  | 'run_application'
  | 'run_initial_tests'
  | 'find_errors'
  | 'apply_fixes'
  | 'retest_verification'
  | 'security_audit'
  | 'final_result';

export interface FrogeCodeWorkflowResult {
  workflowId: string;
  userPrompt: string;
  timestamp: string;
  currentStage: FrogeCodeStage;
  completedStages: FrogeCodeStage[];

  // Pipeline Stage Deliverables
  requirements: RequirementsAnalysis;
  plan: ProjectPlan;
  files: GeneratedCodeFile[];
  execution: AppExecutionStatus;
  initialTests: TestExecutionReport;
  errorsDetected: DetectedError[];
  fixesApplied: FixIteration[];
  retestResults: TestExecutionReport;
  securityAudit: SecurityAuditReport;

  // Extended Workspace Capabilities
  codeExplanation?: CodeExplanationReport;
  codeReview?: CodeReviewReport;
  taskState?: FrogeCodeTaskState;
  vfsTree?: VirtualFileNode;

  // Final Synthesis
  finalSummary: {
    projectTitle: string;
    totalFiles: number;
    totalLinesOfCode: number;
    testPassRate: number;
    securityScore: number;
    isProductionReady: boolean;
    deliveryHighlights: string[];
  };
  durationMs: number;
}
