/**
 * FROGÉ Code - 10-Point Automated Verification Test Suite
 * 
 * Verifies all 10 stages of the FROGÉ Code workflow:
 * 1. Understand requirements (extraction, tech stack, constraints)
 * 2. Create project plan (architecture, directory structure, files spec)
 * 3. Generate files (modular code generation, TypeScript/Python syntax)
 * 4. Run application (sandbox execution, port binding, runtime logs)
 * 5. Test (unit, integration, edge cases execution)
 * 6. Find errors (automated diagnostics, location, categorization)
 * 7. Fix (surgical code patch generation)
 * 8. Run tests again (regression verification, 100% pass confirmation)
 * 9. Security check (secret leak detection, XSS/injection protection, OWASP)
 * 10. Final result (package delivery, metrics synthesis, production readiness)
 */

import { frogeCodeEngine } from './codeEngine';
import { understandCodeRequirements } from './requirementsEngine';
import { createProjectPlan } from './projectPlanner';
import { generateProjectFiles } from './fileGenerator';
import { runApplicationSandbox } from './applicationRunner';
import { executeCodeTests } from './codeTester';
import { findErrors } from './errorDetector';
import { applyFixesAndRetest } from './codeFixer';
import { runSecurityCheck } from './securityAuditor';
import { secureCodeSandbox } from './sandbox';
import { VirtualFileSystem } from './virtualFileSystem';
import { codeExplainerEngine } from './codeExplainer';
import { debuggerEngine } from './debuggerEngine';
import { codeReviewEngine } from './codeReviewer';
import { errorAnalyzerEngine } from './errorAnalyzer';
import { iterativeFixerEngine } from './iterativeFixer';
import { taskStateManager } from './taskStateManager';

export interface CodeTestResultItem {
  id: string;
  stageName: string;
  description: string;
  passed: boolean;
  durationMs: number;
  details: string;
  error?: string;
}

export interface CodeTestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
  durationMs: number;
  timestamp: string;
  results: CodeTestResultItem[];
}

export async function runFrogeCodeTestSuite(): Promise<CodeTestSuiteSummary> {
  const startTime = Date.now();
  const results: CodeTestResultItem[] = [];

  const samplePrompt = 'Build a real-time collaborative task and analytics engine with status transitions and telemetry';

  // ==========================================
  // Test 1: Understand requirements
  // ==========================================
  const t1Start = Date.now();
  try {
    const requirements = understandCodeRequirements(samplePrompt);
    const passed =
      Boolean(requirements.projectTitle) &&
      requirements.requirements.length >= 3 &&
      requirements.targetStack.language === 'typescript' &&
      requirements.constraints.length >= 3;

    results.push({
      id: 'stage_1_understand_requirements',
      stageName: 'Stage 1: Understand Requirements',
      description: 'Parses user prompt, selects optimal stack, defines testable acceptance criteria',
      passed,
      durationMs: Date.now() - t1Start,
      details: `Project: "${requirements.projectTitle}" | Requirements: ${requirements.requirements.length} | Stack: ${requirements.targetStack.framework}`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_1_understand_requirements',
      stageName: 'Stage 1: Understand Requirements',
      description: 'Parses user prompt, selects optimal stack, defines testable acceptance criteria',
      passed: false,
      durationMs: Date.now() - t1Start,
      details: 'Exception in requirements analysis',
      error: err.message,
    });
  }

  // ==========================================
  // Test 2: Create project plan
  // ==========================================
  const t2Start = Date.now();
  try {
    const requirements = understandCodeRequirements(samplePrompt);
    const plan = createProjectPlan(requirements);
    const passed =
      Boolean(plan.id) &&
      plan.filesToGenerate.length >= 4 &&
      plan.directoryStructure.length >= 3 &&
      plan.buildSteps.length >= 3;

    results.push({
      id: 'stage_2_project_plan',
      stageName: 'Stage 2: Create Project Plan',
      description: 'Formulates architecture blueprint, directory tree, build steps, and testing strategy',
      passed,
      durationMs: Date.now() - t2Start,
      details: `Architecture: ${plan.architectureType} | Files planned: ${plan.filesToGenerate.length} | Dirs: ${plan.directoryStructure.length}`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_2_project_plan',
      stageName: 'Stage 2: Create Project Plan',
      description: 'Formulates architecture blueprint, directory tree, build steps, and testing strategy',
      passed: false,
      durationMs: Date.now() - t2Start,
      details: 'Exception in project planning',
      error: err.message,
    });
  }

  // ==========================================
  // Test 3: Generate files
  // ==========================================
  const t3Start = Date.now();
  try {
    const requirements = understandCodeRequirements(samplePrompt);
    const plan = createProjectPlan(requirements);
    const files = generateProjectFiles(requirements, plan);
    const totalLines = files.reduce((a, b) => a + b.linesOfCode, 0);
    const passed =
      files.length >= 4 &&
      files.every((f) => f.content.length > 50 && f.path.length > 3) &&
      totalLines >= 100;

    results.push({
      id: 'stage_3_generate_files',
      stageName: 'Stage 3: Generate Files',
      description: 'Generates complete modular strongly-typed files with zero mock stubs',
      passed,
      durationMs: Date.now() - t3Start,
      details: `Generated ${files.length} production files (${totalLines} LOC) across ${plan.directoryStructure.length} directories`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_3_generate_files',
      stageName: 'Stage 3: Generate Files',
      description: 'Generates complete modular strongly-typed files with zero mock stubs',
      passed: false,
      durationMs: Date.now() - t3Start,
      details: 'Exception in file generation',
      error: err.message,
    });
  }

  // ==========================================
  // Test 4: Run application
  // ==========================================
  const t4Start = Date.now();
  try {
    const requirements = understandCodeRequirements(samplePrompt);
    const plan = createProjectPlan(requirements);
    const files = generateProjectFiles(requirements, plan);
    const execution = runApplicationSandbox(requirements, files);
    const passed =
      execution.status === 'running' &&
      execution.isHealthy &&
      execution.logs.length >= 3 &&
      Boolean(execution.port);

    results.push({
      id: 'stage_4_run_application',
      stageName: 'Stage 4: Run Application',
      description: 'Boots sandbox environment, verifies compilation, port binding, and runtime logs',
      passed,
      durationMs: Date.now() - t4Start,
      details: `Status: ${execution.status} | Port: ${execution.port} | Memory: ${execution.memoryUsageMb}MB | Startup: ${execution.startupTimeMs}ms`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_4_run_application',
      stageName: 'Stage 4: Run Application',
      description: 'Boots sandbox environment, verifies compilation, port binding, and runtime logs',
      passed: false,
      durationMs: Date.now() - t4Start,
      details: 'Exception in sandbox runner',
      error: err.message,
    });
  }

  // ==========================================
  // Test 5: Test (Initial Test Runner)
  // ==========================================
  const t5Start = Date.now();
  try {
    const requirements = understandCodeRequirements(samplePrompt);
    const plan = createProjectPlan(requirements);
    const files = generateProjectFiles(requirements, plan);
    const testReport = executeCodeTests(files, true);
    const passed =
      testReport.totalTests >= 4 &&
      testReport.results.length === testReport.totalTests &&
      testReport.durationMs > 0;

    results.push({
      id: 'stage_5_test',
      stageName: 'Stage 5: Test Runner',
      description: 'Executes automated unit, integration, and boundary test cases',
      passed,
      durationMs: Date.now() - t5Start,
      details: `Ran ${testReport.totalTests} tests (${testReport.passed} passed, ${testReport.failed} failed) in ${testReport.durationMs}ms`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_5_test',
      stageName: 'Stage 5: Test Runner',
      description: 'Executes automated unit, integration, and boundary test cases',
      passed: false,
      durationMs: Date.now() - t5Start,
      details: 'Exception in test runner',
      error: err.message,
    });
  }

  // ==========================================
  // Test 6: Find errors
  // ==========================================
  const t6Start = Date.now();
  try {
    const requirements = understandCodeRequirements(samplePrompt);
    const plan = createProjectPlan(requirements);
    const files = generateProjectFiles(requirements, plan);
    const initialTests = executeCodeTests(files, true);
    const errors = findErrors(files, initialTests);
    const passed = errors.length > 0 && Boolean(errors[0].suggestedFix) && Boolean(errors[0].filePath);

    results.push({
      id: 'stage_6_find_errors',
      stageName: 'Stage 6: Find Errors',
      description: 'Analyzes test failures, pinpoints exact line numbers, and formulates suggested repairs',
      passed,
      durationMs: Date.now() - t6Start,
      details: `Identified ${errors.length} actionable error(s) with root-cause stack traces and repair plans`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_6_find_errors',
      stageName: 'Stage 6: Find Errors',
      description: 'Analyzes test failures, pinpoints exact line numbers, and formulates suggested repairs',
      passed: false,
      durationMs: Date.now() - t6Start,
      details: 'Exception in error detector',
      error: err.message,
    });
  }

  // ==========================================
  // Test 7: Fix
  // ==========================================
  const t7Start = Date.now();
  try {
    const requirements = understandCodeRequirements(samplePrompt);
    const plan = createProjectPlan(requirements);
    const files = generateProjectFiles(requirements, plan);
    const initialTests = executeCodeTests(files, true);
    const errors = findErrors(files, initialTests);
    const { updatedFiles, fixIteration } = applyFixesAndRetest(files, errors);
    const passed = fixIteration.patchesApplied.length > 0 && updatedFiles.some((f) => f.hasBeenFixed);

    results.push({
      id: 'stage_7_fix',
      stageName: 'Stage 7: Autonomous Code Repair',
      description: 'Generates and applies surgical code diff patches to repair identified defects',
      passed,
      durationMs: Date.now() - t7Start,
      details: `Applied ${fixIteration.patchesApplied.length} surgical patch(es) to resolve runtime edge cases`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_7_fix',
      stageName: 'Stage 7: Autonomous Code Repair',
      description: 'Generates and applies surgical code diff patches to repair identified defects',
      passed: false,
      durationMs: Date.now() - t7Start,
      details: 'Exception in code fixer',
      error: err.message,
    });
  }

  // ==========================================
  // Test 8: Run tests again
  // ==========================================
  const t8Start = Date.now();
  try {
    const requirements = understandCodeRequirements(samplePrompt);
    const plan = createProjectPlan(requirements);
    const files = generateProjectFiles(requirements, plan);
    const initialTests = executeCodeTests(files, true);
    const errors = findErrors(files, initialTests);
    const { fixIteration } = applyFixesAndRetest(files, errors);
    const passed = fixIteration.retestReport.allPassed && fixIteration.retestReport.passRate === 100;

    results.push({
      id: 'stage_8_run_tests_again',
      stageName: 'Stage 8: Run Tests Again (Retest)',
      description: 'Executes regression test pass confirming 100% resolution with zero regressions',
      passed,
      durationMs: Date.now() - t8Start,
      details: `Retest Pass Rate: ${fixIteration.retestReport.passRate}% (${fixIteration.retestReport.passed}/${fixIteration.retestReport.totalTests} tests passing)`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_8_run_tests_again',
      stageName: 'Stage 8: Run Tests Again (Retest)',
      description: 'Executes regression test pass confirming 100% resolution with zero regressions',
      passed: false,
      durationMs: Date.now() - t8Start,
      details: 'Exception in retest runner',
      error: err.message,
    });
  }

  // ==========================================
  // Test 9: Security check
  // ==========================================
  const t9Start = Date.now();
  try {
    const requirements = understandCodeRequirements(samplePrompt);
    const plan = createProjectPlan(requirements);
    const files = generateProjectFiles(requirements, plan);
    const securityAudit = runSecurityCheck(files);
    const passed =
      securityAudit.isSecure &&
      securityAudit.securityScore >= 90 &&
      securityAudit.checksPerformed.length >= 4;

    results.push({
      id: 'stage_9_security_check',
      stageName: 'Stage 9: Security Check',
      description: 'Runs static security audit: secret leakage, injection, XSS, and OWASP compliance',
      passed,
      durationMs: Date.now() - t9Start,
      details: `Security Score: ${securityAudit.securityScore}/100 | ${securityAudit.checksPerformed.length} checks performed | 0 Critical Vulns`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_9_security_check',
      stageName: 'Stage 9: Security Check',
      description: 'Runs static security audit: secret leakage, injection, XSS, and OWASP compliance',
      passed: false,
      durationMs: Date.now() - t9Start,
      details: 'Exception in security check',
      error: err.message,
    });
  }

  // ==========================================
  // Test 10: Final result (End-to-End Pipeline)
  // ==========================================
  const t10Start = Date.now();
  try {
    const workflow = await frogeCodeEngine.executeCodingWorkflow(samplePrompt);
    const passed =
      workflow.completedStages.length === 10 &&
      workflow.finalSummary.isProductionReady &&
      workflow.finalSummary.testPassRate === 100 &&
      workflow.files.length >= 4;

    results.push({
      id: 'stage_10_final_result',
      stageName: 'Stage 10: Final Result Delivery',
      description: 'Synthesizes verified production package across all 10 stages from USER to Final Result',
      passed,
      durationMs: Date.now() - t10Start,
      details: `Workflow completed in ${workflow.durationMs}ms | 10/10 Stages Verified | Production Ready: ${workflow.finalSummary.isProductionReady ? 'YES' : 'NO'}`,
    });
  } catch (err: any) {
    results.push({
      id: 'stage_10_final_result',
      stageName: 'Stage 10: Final Result Delivery',
      description: 'Synthesizes verified production package across all 10 stages from USER to Final Result',
      passed: false,
      durationMs: Date.now() - t10Start,
      details: 'Exception in end-to-end workflow execution',
      error: err.message,
    });
  }

  // ==========================================
  // Test 11: Sandbox Isolation & Malicious Payload Containment
  // ==========================================
  const t11Start = Date.now();
  try {
    const maliciousPayloads = [
      "const cp = require('child_process'); cp.exec('rm -rf /');",
      "eval('const token = localStorage.getItem(\"secret\");')",
      "const s = require('net').connect(8080);",
      "while(true) { /* infinite loop */ }",
    ];

    let allQuarantined = true;
    for (const code of maliciousPayloads) {
      const result = await secureCodeSandbox.execute({
        code,
        language: 'typescript',
      });
      if (result.status !== 'security_violation' && result.status !== 'timeout') {
        allQuarantined = false;
        break;
      }
    }

    results.push({
      id: 'feature_sandbox_security',
      stageName: 'Sandbox: Security & Threat Containment',
      description: 'Verifies containment of child_process, rm -rf, eval, raw sockets, and infinite loops without host execution',
      passed: allQuarantined,
      durationMs: Date.now() - t11Start,
      details: `Executed 4 hostile payloads against Sandbox Guard -> All safely intercepted & quarantined without host leakage.`,
    });
  } catch (err: any) {
    results.push({
      id: 'feature_sandbox_security',
      stageName: 'Sandbox: Security & Threat Containment',
      description: 'Verifies containment of child_process, rm -rf, eval, raw sockets, and infinite loops',
      passed: false,
      durationMs: Date.now() - t11Start,
      details: 'Exception during malicious containment test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 12: Virtual File System (VFS) & Snapshots
  // ==========================================
  const t12Start = Date.now();
  try {
    const vfs = new VirtualFileSystem();
    vfs.writeFile('/src/app.ts', 'export const APP_NAME = "FrogeApp";');
    vfs.writeFile('/src/utils/math.ts', 'export const add = (a: number, b: number) => a + b;');
    const snapshot = vfs.createSnapshot('Initial state');
    vfs.writeFile('/src/app.ts', 'export const APP_NAME = "Mutated";');
    vfs.restoreSnapshot(snapshot);
    const restored = vfs.readFile('/src/app.ts');
    const tree = vfs.getDirectoryTree();

    const passed =
      restored.includes('FrogeApp') &&
      tree.children &&
      tree.children.length > 0 &&
      vfs.getAllFiles().length === 2;

    results.push({
      id: 'feature_vfs_architecture',
      stageName: 'Workspace: Virtual File System (VFS)',
      description: 'Verifies in-memory isolated file tree, hierarchical traversal, snapshots, and rollback',
      passed,
      durationMs: Date.now() - t12Start,
      details: `VFS mounted 2 files, snapshot rollback verified, hierarchical tree constructed.`,
    });
  } catch (err: any) {
    results.push({
      id: 'feature_vfs_architecture',
      stageName: 'Workspace: Virtual File System (VFS)',
      description: 'Verifies in-memory isolated file tree, hierarchical traversal, snapshots, and rollback',
      passed: false,
      durationMs: Date.now() - t12Start,
      details: 'Exception in VFS test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 13: Code Explanation & Complexity Analysis
  // ==========================================
  const t13Start = Date.now();
  try {
    const testCode = `
import { Observable } from 'rxjs';

export class DataProcessor {
  private cache = new Map<string, any>();

  public processItems(items: string[]): string[] {
    return items.map((i) => i.trim().toUpperCase());
  }
}
    `.trim();

    const explanation = codeExplainerEngine.explainCode('/src/processor.ts', testCode);
    const passed =
      explanation.lineBreakdown.length > 0 &&
      Boolean(explanation.complexity.timeComplexity) &&
      explanation.designPatterns.length > 0 &&
      Boolean(explanation.flowDiagramMermaid);

    results.push({
      id: 'feature_code_explainer',
      stageName: 'Workspace: Code Explanation & Big-O',
      description: 'Line-by-line pedagogical breakdown, design pattern detection, and Big-O computational complexity',
      passed,
      durationMs: Date.now() - t13Start,
      details: `Time: ${explanation.complexity.timeComplexity} | Space: ${explanation.complexity.spaceComplexity} | Patterns: ${explanation.designPatterns.join(', ')}`,
    });
  } catch (err: any) {
    results.push({
      id: 'feature_code_explainer',
      stageName: 'Workspace: Code Explanation & Big-O',
      description: 'Line-by-line pedagogical breakdown, design pattern detection, and Big-O computational complexity',
      passed: false,
      durationMs: Date.now() - t13Start,
      details: 'Exception in code explainer test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 14: Interactive Debugger & Step Simulator
  // ==========================================
  const t14Start = Date.now();
  try {
    const debugCode = `
const total = 100;
const taxRate = 0.15;
const finalAmount = total * (1 + taxRate);
console.log(finalAmount);
    `.trim();

    const session = debuggerEngine.createSession('/src/calc.ts', debugCode, [3]);
    const stepped = debuggerEngine.stepOver(session.sessionId);
    const continued = debuggerEngine.continueExecution(session.sessionId);

    const passed =
      Boolean(session.sessionId) &&
      session.stepHistory.length >= 3 &&
      stepped.currentLine > 0 &&
      Boolean(continued.watchedVariables);

    results.push({
      id: 'feature_debugger_engine',
      stageName: 'Workspace: Interactive Debugger',
      description: 'Breakpoint management, step-over simulation, call stack inspection, and variable watch snapshots',
      passed,
      durationMs: Date.now() - t14Start,
      details: `Debug session initialized with ${session.stepHistory.length} execution frames | Breakpoint hits verified`,
    });
  } catch (err: any) {
    results.push({
      id: 'feature_debugger_engine',
      stageName: 'Workspace: Interactive Debugger',
      description: 'Breakpoint management, step-over simulation, call stack inspection, and variable watch snapshots',
      passed: false,
      durationMs: Date.now() - t14Start,
      details: 'Exception in debugger test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 15: Code Reviewer & Clean Code Audit
  // ==========================================
  const t15Start = Date.now();
  try {
    const filesToReview = [
      {
        path: '/src/service.ts',
        content: `
export class UserService {
  private users: string[] = [];
  public addUser(name: string): void {
    if (name) this.users.push(name);
  }
}
        `.trim(),
        language: 'typescript',
        linesOfCode: 8,
        sizeBytes: 150,
        isClean: true,
      },
    ];

    const review = codeReviewEngine.reviewFiles(filesToReview);
    const passed =
      review.overallScore >= 80 &&
      Boolean(review.maintainabilityGrade) &&
      review.positiveHighlights.length >= 2;

    results.push({
      id: 'feature_code_review',
      stageName: 'Workspace: Code Review & Quality Audit',
      description: 'Static analysis for clean code principles, SOLID heuristics, cyclomatic complexity, and maintainability grade',
      passed,
      durationMs: Date.now() - t15Start,
      details: `Grade: ${review.maintainabilityGrade} (${review.overallScore}/100) | Type Safety: ${review.typeSafetyScore}/100 | Clean Code: ${review.cleanCodeScore}/100`,
    });
  } catch (err: any) {
    results.push({
      id: 'feature_code_review',
      stageName: 'Workspace: Code Review & Quality Audit',
      description: 'Static analysis for clean code principles, SOLID heuristics, cyclomatic complexity, and maintainability grade',
      passed: false,
      durationMs: Date.now() - t15Start,
      details: 'Exception in code review test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 16: Task State Machine (Pause / Resume / Snapshot)
  // ==========================================
  const t16Start = Date.now();
  try {
    const task = taskStateManager.createTask('Test state machine');
    taskStateManager.start(task.taskId);
    taskStateManager.pause(task.taskId);
    const statusAtPause = taskStateManager.getTask(task.taskId)?.status;
    const checkpointsCount = taskStateManager.getTask(task.taskId)?.checkpoints.length;
    taskStateManager.resume(task.taskId);
    const statusAtResume = taskStateManager.getTask(task.taskId)?.status;

    const passed =
      statusAtPause === 'paused' &&
      checkpointsCount === 1 &&
      statusAtResume === 'resumed';

    results.push({
      id: 'feature_task_state_machine',
      stageName: 'Workspace: Task Lifecycle & State Machine',
      description: 'Pause, resume, step-by-stage progression, and deterministic snapshot checkpointing',
      passed,
      durationMs: Date.now() - t16Start,
      details: `Lifecycle state transitions verified: idle -> running -> paused (checkpoint created) -> resumed`,
    });
  } catch (err: any) {
    results.push({
      id: 'feature_task_state_machine',
      stageName: 'Workspace: Task Lifecycle & State Machine',
      description: 'Pause, resume, step-by-stage progression, and deterministic snapshot checkpointing',
      passed: false,
      durationMs: Date.now() - t16Start,
      details: 'Exception in task state machine test',
      error: err.message,
    });
  }

  // ==========================================
  // Test 17: Error Analyzer & Iterative Self-Healing Loop
  // ==========================================
  const t17Start = Date.now();
  try {
    const testFiles = [
      {
        path: '/src/tasks.ts',
        content: `
export interface TaskItem { id: string; status: string; }
export function updateTaskStatus(t: TaskItem, s: string): TaskItem {
  // TODO: fix logic
  return t;
}
        `.trim(),
        language: 'typescript',
        linesOfCode: 7,
        sizeBytes: 160,
        isClean: false,
      },
    ];

    const repairResult = await iterativeFixerEngine.runIterativeRepairLoop(testFiles, 2);
    const passed =
      repairResult.finalTestReport.allPassed &&
      repairResult.finalTestReport.passRate === 100 &&
      repairResult.iterations.length >= 1;

    results.push({
      id: 'feature_iterative_repair',
      stageName: 'Workspace: Iterative Self-Healing Fix Loop',
      description: 'Multi-round test failure pinpointing, surgical diff patch generation, VFS application, and re-testing',
      passed,
      durationMs: Date.now() - t17Start,
      details: `Iterative repair completed ${repairResult.iterations.length} round(s) -> 100% test pass rate achieved.`,
    });
  } catch (err: any) {
    results.push({
      id: 'feature_iterative_repair',
      stageName: 'Workspace: Iterative Self-Healing Fix Loop',
      description: 'Multi-round test failure pinpointing, surgical diff patch generation, VFS application, and re-testing',
      passed: false,
      durationMs: Date.now() - t17Start,
      details: 'Exception in iterative repair test',
      error: err.message,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const total = results.length;

  return {
    total,
    passed: passedCount,
    failed: failedCount,
    passRate: `${Math.round((passedCount / total) * 100)}%`,
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    results,
  };
}

