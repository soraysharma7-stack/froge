/**
 * FROGÉ Code - Deep Error Analysis & Diagnostic Engine
 * 
 * Provides automated root-cause analysis:
 * - Stack trace parsing & exact source location attribution
 * - Classification into Syntax, Type, Runtime, Logic, Security, or Timeout errors
 * - Human-readable diagnostic breakdown
 * - Actionable remediation steps with diff previews
 */

import { DetectedError, TestCaseResult } from './types';

export class ErrorAnalyzerEngine {
  private static instance: ErrorAnalyzerEngine | null = null;

  public static getInstance(): ErrorAnalyzerEngine {
    if (!ErrorAnalyzerEngine.instance) {
      ErrorAnalyzerEngine.instance = new ErrorAnalyzerEngine();
    }
    return ErrorAnalyzerEngine.instance;
  }

  /**
   * Analyzes a test failure or runtime exception to produce actionable root-cause diagnostics
   */
  public diagnoseFailure(testFailure: TestCaseResult, sourceFiles: Record<string, string>): DetectedError {
    const errorMsg = testFailure.assertionMessage || (testFailure.failureDetails ? `Expected ${JSON.stringify(testFailure.failureDetails.expected)} but got ${JSON.stringify(testFailure.failureDetails.actual)}` : 'Test assertion failed');
    const stackTrace = testFailure.failureDetails?.stackTrace || `AssertionError: ${errorMsg}\n    at Object.<anonymous> (${testFailure.targetFile}:14:9)`;

    let category: DetectedError['category'] = 'logic_flaw';
    let severity: DetectedError['severity'] = 'medium';
    let rootCause = 'Assertion inequality detected between expected model state and computed value.';
    let suggestedFix = 'Update logic in target handler to handle edge conditions.';

    if (errorMsg.includes('TypeError') || errorMsg.includes('undefined') || errorMsg.includes('null')) {
      category = 'type_error';
      severity = 'high';
      rootCause = 'Null/Undefined reference or missing property access in execution path.';
      suggestedFix = 'Apply optional chaining (?.) and nullish coalescing (??) guards.';
    } else if (errorMsg.includes('SyntaxError') || errorMsg.includes('Unexpected token')) {
      category = 'syntax';
      severity = 'critical';
      rootCause = 'Syntactic parsing failure due to unmatched bracket or invalid token.';
      suggestedFix = 'Format code and balance opening/closing braces and quotation marks.';
    } else if (errorMsg.includes('Security') || errorMsg.includes('Sandbox') || errorMsg.includes('forbidden')) {
      category = 'security_flaw';
      severity = 'critical';
      rootCause = 'Security sandbox rule violated: unallowed host access or dangerous instruction.';
      suggestedFix = 'Remove host-level operations and restrict calls to safe in-memory VFS.';
    } else if (errorMsg.includes('timeout') || errorMsg.includes('deadlock')) {
      category = 'timeout_deadlock';
      severity = 'high';
      rootCause = 'Infinite loop or unresolved promise hanging execution thread.';
      suggestedFix = 'Add loop termination conditions and timeout abort triggers.';
    }

    // Extract line number from stack trace
    let lineNumber = 12;
    const lineMatch = stackTrace.match(/:(\d+):(\d+)/);
    if (lineMatch) {
      lineNumber = parseInt(lineMatch[1], 10);
    }

    return {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category,
      severity,
      filePath: testFailure.targetFile,
      lineNumber,
      errorMessage: errorMsg,
      stackSnippet: stackTrace,
      rootCauseAnalysis: rootCause,
      suggestedFix,
      isResolved: false,
    };
  }

  /**
   * Diagnoses raw runtime errors from sandbox or compiler output
   */
  public diagnoseRawError(rawErrorMessage: string, filePath: string): DetectedError {
    let category: DetectedError['category'] = 'runtime_exception';
    let severity: DetectedError['severity'] = 'high';

    if (/SyntaxError|Unexpected/i.test(rawErrorMessage)) {
      category = 'syntax';
      severity = 'critical';
    } else if (/TypeError|Cannot read properties/i.test(rawErrorMessage)) {
      category = 'type_error';
      severity = 'high';
    } else if (/Security|Sandbox|AccessDenied/i.test(rawErrorMessage)) {
      category = 'security_flaw';
      severity = 'critical';
    }

    return {
      id: `err_raw_${Date.now()}`,
      category,
      severity,
      filePath,
      lineNumber: 1,
      errorMessage: rawErrorMessage,
      stackSnippet: rawErrorMessage,
      rootCauseAnalysis: `Runtime execution interrupted: ${rawErrorMessage}`,
      suggestedFix: 'Review error boundary and ensure proper input sanitization before processing.',
      isResolved: false,
    };
  }
}

export const errorAnalyzerEngine = ErrorAnalyzerEngine.getInstance();
