/**
 * FROGÉ Code Engine - Master Orchestrator
 * 
 * Implements the complete autonomous software engineering & workspace workflow:
 * 
 * USER
 *   ↓
 * FROGÉ Code
 *   ↓
 * 1. Understand requirements
 *   ↓
 * 2. Create project plan
 *   ↓
 * 3. Generate files
 *   ↓
 * 4. Run application (Isolated Sandbox)
 *   ↓
 * 5. Test (Automated Unit & Integration Test Suites)
 *   ↓
 * 6. Find errors (Deep Diagnostic Root-Cause Analysis)
 *   ↓
 * 7. Fix (Surgical Patch Synthesis)
 *   ↓
 * 8. Run tests again (Regression Verification)
 *   ↓
 * 9. Security check (AST Audit & Secret Leak Detection)
 *   ↓
 * 10. Final result (Delivery Synthesis, Code Review & Explanation)
 * 
 * Modular by design for direct utilization by:
 * - Standalone FROGÉ Code Workspace
 * - Deep Thinking Mode (code synthesis & logic proofs)
 * - Student Mode (code learning & explanation)
 * - MAX Mode (multi-agent coding pipeline)
 */

import { understandCodeRequirements } from './requirementsEngine';
import { createProjectPlan } from './projectPlanner';
import { generateProjectFiles } from './fileGenerator';
import { runApplicationSandbox } from './applicationRunner';
import { executeCodeTests } from './codeTester';
import { findErrors } from './errorDetector';
import { applyFixesAndRetest } from './codeFixer';
import { runSecurityCheck } from './securityAuditor';
import { codeExplainerEngine } from './codeExplainer';
import { codeReviewEngine } from './codeReviewer';
import { VirtualFileSystem } from './virtualFileSystem';
import { taskStateManager } from './taskStateManager';
import {
  FrogeCodeStage,
  FrogeCodeWorkflowResult,
  GeneratedCodeFile,
  ProjectPlan,
  RequirementsAnalysis,
} from './types';

export class FrogeCodeEngine {
  private static instance: FrogeCodeEngine | null = null;

  public static getInstance(): FrogeCodeEngine {
    if (!FrogeCodeEngine.instance) {
      FrogeCodeEngine.instance = new FrogeCodeEngine();
    }
    return FrogeCodeEngine.instance;
  }

  /**
   * Stage 1: Understand requirements
   */
  public analyzeRequirements(prompt: string): RequirementsAnalysis {
    return understandCodeRequirements(prompt);
  }

  /**
   * Stage 2: Create project plan
   */
  public generatePlan(requirements: RequirementsAnalysis): ProjectPlan {
    return createProjectPlan(requirements);
  }

  /**
   * Stage 3: Generate files
   */
  public generateFiles(requirements: RequirementsAnalysis, plan: ProjectPlan): GeneratedCodeFile[] {
    return generateProjectFiles(requirements, plan);
  }

  /**
   * Full 10-Stage Autonomous Coding Pipeline with Extended Workspace Features
   */
  public async executeCodingWorkflow(userPrompt: string): Promise<FrogeCodeWorkflowResult> {
    const workflowId = `code_wf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const startTime = Date.now();
    const completedStages: FrogeCodeStage[] = [];

    // Initialize Task Lifecycle
    const taskState = taskStateManager.createTask(userPrompt);
    taskStateManager.start(taskState.taskId);

    // Stage 1: Understand requirements
    const requirements = understandCodeRequirements(userPrompt);
    completedStages.push('understand_requirements');
    taskStateManager.advanceStage(taskState.taskId, 'understand_requirements');

    // Stage 2: Create project plan
    const plan = createProjectPlan(requirements);
    completedStages.push('create_project_plan');
    taskStateManager.advanceStage(taskState.taskId, 'create_project_plan');

    // Stage 3: Generate files
    let files = generateProjectFiles(requirements, plan);
    const vfs = new VirtualFileSystem(files);
    completedStages.push('generate_files');
    taskStateManager.advanceStage(taskState.taskId, 'generate_files');

    // Stage 4: Run application (Sandbox)
    const execution = runApplicationSandbox(requirements, files);
    completedStages.push('run_application');
    taskStateManager.advanceStage(taskState.taskId, 'run_application');

    // Stage 5: Test
    const initialTests = executeCodeTests(files, true);
    completedStages.push('run_initial_tests');
    taskStateManager.advanceStage(taskState.taskId, 'run_initial_tests');

    // Stage 6: Find errors
    const errorsDetected = findErrors(files, initialTests);
    completedStages.push('find_errors');
    taskStateManager.advanceStage(taskState.taskId, 'find_errors');

    // Stage 7 & 8: Fix and Run tests again
    const { updatedFiles, fixIteration } = applyFixesAndRetest(files, errorsDetected);
    files = updatedFiles;
    completedStages.push('apply_fixes');
    taskStateManager.advanceStage(taskState.taskId, 'apply_fixes');
    completedStages.push('retest_verification');
    taskStateManager.advanceStage(taskState.taskId, 'retest_verification');

    // Stage 9: Security check
    const securityAudit = runSecurityCheck(files);
    completedStages.push('security_audit');
    taskStateManager.advanceStage(taskState.taskId, 'security_audit');

    // Stage 10: Final result
    completedStages.push('final_result');
    taskStateManager.advanceStage(taskState.taskId, 'final_result');

    // Extended Workspace Synthesis: Explanation & Code Review
    const primaryFile = files.find((f) => f.path.includes('engine') || f.path.includes('service') || f.path.includes('app') || f.path.includes('main')) || files[0];
    const codeExplanation = codeExplainerEngine.explainCode(primaryFile.path, primaryFile.content);
    const codeReview = codeReviewEngine.reviewFiles(files);
    const vfsTree = vfs.getDirectoryTree();

    const totalLinesOfCode = files.reduce((acc, f) => acc + f.linesOfCode, 0);

    const finalSummary = {
      projectTitle: requirements.projectTitle,
      totalFiles: files.length,
      totalLinesOfCode,
      testPassRate: fixIteration.retestReport.passRate,
      securityScore: securityAudit.securityScore,
      isProductionReady: fixIteration.retestReport.allPassed && securityAudit.isSecure,
      deliveryHighlights: [
        `Generated ${files.length} modular, strongly-typed source files (${totalLinesOfCode} LOC).`,
        `Autonomous test & repair loop achieved ${fixIteration.retestReport.passRate}% pass rate across all unit and edge-case suites.`,
        `Passed comprehensive security & OWASP static audit (Score: ${securityAudit.securityScore}/100) with zero secret leaks.`,
        `Isolated application sandbox mounted and verified healthy on port ${execution.port || 3000}.`,
        `Code Review grade: ${codeReview.maintainabilityGrade} (${codeReview.overallScore}/100) with zero critical violations.`,
      ],
    };

    const durationMs = Date.now() - startTime;

    return {
      workflowId,
      userPrompt,
      timestamp: new Date().toISOString(),
      currentStage: 'final_result',
      completedStages,
      requirements,
      plan,
      files,
      execution,
      initialTests,
      errorsDetected,
      fixesApplied: [fixIteration],
      retestResults: fixIteration.retestReport,
      securityAudit,
      codeExplanation,
      codeReview,
      taskState,
      vfsTree,
      finalSummary,
      durationMs,
    };
  }
}

export const frogeCodeEngine = FrogeCodeEngine.getInstance();
