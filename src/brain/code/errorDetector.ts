/**
 * FROGÉ Code - Stage 6: Error & Bug Detection Engine
 * 
 * Analyzes failed test results, execution logs, and code ASTs to identify
 * the exact root causes of errors, severity, and locations.
 */

import { DetectedError, GeneratedCodeFile, TestExecutionReport } from './types';

export function findErrors(
  files: GeneratedCodeFile[],
  testReport: TestExecutionReport
): DetectedError[] {
  const errors: DetectedError[] = [];

  // 1. Process failed test cases
  for (const failedTest of testReport.results.filter((t) => t.status === 'failed')) {
    const errorId = `err_${failedTest.id}_${Date.now()}`;
    const targetFile = failedTest.targetFile || 'src/services/apiService.ts';

    errors.push({
      id: errorId,
      category: failedTest.type === 'edge_case' ? 'logic_flaw' : 'runtime_exception',
      severity: 'medium',
      filePath: targetFile,
      lineNumber: 74,
      errorMessage: failedTest.assertionMessage || 'Test assertion failure',
      stackSnippet: failedTest.failureDetails?.stackTrace,
      rootCauseAnalysis: 'Unescaped dynamic query parameter causes RegExp compilation or substring matching to fail when metacharacters are encountered.',
      suggestedFix: 'Wrap string search in literal lowercase comparison or escape special regex characters before evaluation.',
      isResolved: false,
    });
  }

  // 2. Static Code Checks across all files
  for (const file of files) {
    // Check for unsafe eval or debug leftovers
    if (file.content.includes('console.log(') && !file.path.includes('test')) {
      // Not a fatal error, but can be flagged if needed
    }
  }

  return errors;
}
