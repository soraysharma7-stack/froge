/**
 * FROGÉ Brain - Tool Selection Module
 *
 * Stage 5: Determines which specialized tools (if any) should be invoked
 * before or during execution.
 */

import {
  IntentUnderstanding,
  TaskClassification,
  CapabilitySelection,
  ModelRoutingDecision,
  ToolSelectionResult,
  ToolInvocationPlan,
} from './types';

export function selectTools(
  intent: IntentUnderstanding,
  task: TaskClassification,
  capabilities: CapabilitySelection,
  routing: ModelRoutingDecision
): ToolSelectionResult {
  // FAST PATH: Level 0 Casual interactions never invoke tools
  if (intent.complexityTier === 0) {
    return {
      selectedTools: [],
      shouldExecuteToolsBeforeModel: false,
      toolExecutionRationale: 'Level 0 Casual conversation: Fast Path requires zero tool execution.',
    };
  }

  const selectedTools: ToolInvocationPlan[] = [];
  const q = intent.normalizedQuery;

  // 1. Math computation tool
  if (
    /\d+\s*[\+\-\*\/]\s*\d+/.test(q) ||
    /\b(calculate|sum|multiply|percentage|integral|derivative|equation)\b/.test(q) ||
    capabilities.selectedCapabilities.includes('mathematical_symbolic_solver')
  ) {
    selectedTools.push({
      tool: 'symbolic_math_calculator',
      priority: 1,
      parameters: { expression: intent.rawQuery },
      description: 'Calculates high-precision numerical and algebraic expressions.',
      isMandatory: false,
    });
  }

  // 2. Web Search Retriever
  if (
    task.primaryTask === 'web_research' ||
    capabilities.selectedCapabilities.includes('web_search_grounding') ||
    task.requiresExternalData
  ) {
    selectedTools.push({
      tool: 'web_search_retriever',
      priority: 1,
      parameters: { query: intent.rawQuery },
      description: 'Retrieves verified external ground truth and citations from live indexes.',
      isMandatory: true,
    });
  }

  // 3. Code Sandbox & AST Linter
  if (
    task.primaryTask === 'coding' ||
    capabilities.selectedCapabilities.includes('code_ast_and_refactoring')
  ) {
    selectedTools.push({
      tool: 'linter_validator',
      priority: 2,
      parameters: { language: 'typescript' },
      description: 'Validates syntactic correctness, type soundness, and import resolution.',
      isMandatory: false,
    });
  }

  // 4. Memory Vault Indexer
  if (
    task.primaryTask === 'memory' ||
    task.requiresStatePersistence ||
    intent.implicitNeeds.includes('state_persistence')
  ) {
    selectedTools.push({
      tool: 'memory_vault_indexer',
      priority: 1,
      parameters: { query: intent.rawQuery },
      description: 'Reads and synchronizes contextual memories, facts, and user preferences.',
      isMandatory: true,
    });
  }

  // 5. Risk Matrix Generator
  if (
    task.primaryTask === 'business_analysis' &&
    (intent.complexityLevel === 'high' || intent.complexityLevel === 'expert')
  ) {
    selectedTools.push({
      tool: 'risk_matrix_generator',
      priority: 2,
      parameters: { domain: 'enterprise_strategy' },
      description: 'Synthesizes quantitative FMEA risk scores and mitigation vectors.',
      isMandatory: false,
    });
  }

  // 6. Socratic Quiz Builder
  if (task.primaryTask === 'education') {
    selectedTools.push({
      tool: 'socratic_quiz_builder',
      priority: 2,
      parameters: { topic: intent.semanticKeywords.join(' ') },
      description: 'Generates active-recall comprehension questions to test mastery.',
      isMandatory: false,
    });
  }

  const shouldExecuteToolsBeforeModel = selectedTools.some(
    (t) => t.tool === 'web_search_retriever' || t.tool === 'memory_vault_indexer'
  );

  const toolExecutionRationale =
    selectedTools.length > 0
      ? `Selected ${selectedTools.length} tool(s): [${selectedTools.map((t) => t.tool).join(', ')}].`
      : 'No external tool invocation needed; executing via direct model synthesis.';

  return {
    selectedTools,
    shouldExecuteToolsBeforeModel,
    toolExecutionRationale,
  };
}
