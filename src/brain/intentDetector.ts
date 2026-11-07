import { IntentAnalysis, PrimaryIntent } from './types';

/**
 * FROGÉ Brain - Intent Detection Subsystem
 * Analyzes query semantics, syntax cues, entities, and complexity.
 */
export function detectIntent(
  query: string,
  modeHint?: string
): IntentAnalysis {
  const q = query.toLowerCase().trim();

  // Pattern detection
  const codePatterns = [
    /function\b/,
    /\bconst\b/,
    /\blet\b/,
    /\bclass\b/,
    /\binterface\b/,
    /\btypescript\b/,
    /\breact\b/,
    /\bpython\b/,
    /\bcomponent\b/,
    /\bapi\b/,
    /\bdatabase\b/,
    /\bsql\b/,
    /\bendpoint\b/,
    /\bhook\b/,
    /\bdebug\b/,
    /\bcode\b/,
    /```/,
  ];

  const mathPatterns = [
    /\bcalculate\b/,
    /\bevaluate\b/,
    /\bsolve\b/,
    /\bintegral\b/,
    /\bderivative\b/,
    /\bmatrix\b/,
    /\bequation\b/,
    /\bpercentage\b/,
    /\bprobability\b/,
    /\d+\s*[\+\-\*\/]\s*\d+/,
  ];

  const creativePatterns = [
    /\bstory\b/,
    /\bpoem\b/,
    /\bmetaphor\b/,
    /\bprose\b/,
    /\bcreative\b/,
    /\bcharacter\b/,
    /\bfiction\b/,
    /\bvignette\b/,
    /\bscene\b/,
    /\bdescribe aesthetically\b/,
  ];

  const educationalPatterns = [
    /\bexplain like\b/,
    /\btutor\b/,
    /\bhow does .* work\b/,
    /\bteach me\b/,
    /\bfor beginners\b/,
    /\bconcept of\b/,
    /\bwhy is\b/,
    /\bwhat is the difference\b/,
    /\bhelp me understand\b/,
  ];

  const strategicPatterns = [
    /\broadmap\b/,
    /\bstrategy\b/,
    /\baudit\b/,
    /\barchitecture\b/,
    /\brisk\b/,
    /\btrade-offs?\b/,
    /\bscalability\b/,
    /\bmarket analysis\b/,
    /\bexecutive summary\b/,
    /\bswot\b/,
  ];

  const reasoningPatterns = [
    /\banalyze\b/,
    /\bcompare\b/,
    /\bevaluate\b/,
    /\bfirst principles\b/,
    /\bdeduce\b/,
    /\bproof\b/,
    /\bcritique\b/,
    /\bwhy does\b/,
    /\bpros and cons\b/,
  ];

  let primaryIntent: PrimaryIntent = 'casual_chat';
  let confidence = 0.75;
  const detectedEntities: string[] = [];
  const suggestedTools: string[] = [];

  // Match heuristics
  if (codePatterns.some((r) => r.test(q)) || modeHint === 'froge-code') {
    primaryIntent = 'code_generation';
    confidence = modeHint === 'froge-code' ? 0.95 : 0.88;
    suggestedTools.push('code_linter', 'typescript_compiler', 'syntax_highlighter');
  } else if (mathPatterns.some((r) => r.test(q))) {
    primaryIntent = 'math_computation';
    confidence = 0.92;
    suggestedTools.push('symbolic_calculator', 'equation_solver');
  } else if (creativePatterns.some((r) => r.test(q))) {
    primaryIntent = 'creative_composition';
    confidence = 0.85;
    suggestedTools.push('metaphor_enhancer', 'tone_adjuster');
  } else if (educationalPatterns.some((r) => r.test(q)) || modeHint === 'student-mode') {
    primaryIntent = 'educational_tutoring';
    confidence = modeHint === 'student-mode' ? 0.95 : 0.89;
    suggestedTools.push('analogy_generator', 'quiz_synthesizer', 'vocabulary_extractor');
  } else if (strategicPatterns.some((r) => r.test(q)) || modeHint === 'max') {
    primaryIntent = 'strategic_audit';
    confidence = modeHint === 'max' ? 0.96 : 0.88;
    suggestedTools.push('risk_matrix_evaluator', 'tradeoff_comparator', 'roadmap_scheduler');
  } else if (reasoningPatterns.some((r) => r.test(q)) || modeHint === 'deep-thinking') {
    primaryIntent = 'analytical_reasoning';
    confidence = modeHint === 'deep-thinking' ? 0.94 : 0.84;
    suggestedTools.push('logic_verifier', 'counterfactual_tester');
  }

  // Extract key entities
  const words = query.split(/\s+/).filter((w) => w.length > 3);
  detectedEntities.push(...words.slice(0, 4).map((w) => w.replace(/[^a-zA-Z0-9_-]/g, '')));

  // Determine complexity
  let complexity: 'low' | 'medium' | 'high' | 'expert' = 'medium';
  if (q.length > 200 || primaryIntent === 'strategic_audit' || primaryIntent === 'analytical_reasoning') {
    complexity = q.length > 400 ? 'expert' : 'high';
  } else if (q.length < 40 && primaryIntent === 'casual_chat') {
    complexity = 'low';
  }

  return {
    primaryIntent,
    confidence,
    detectedEntities,
    complexity,
    userGoal: `Process user prompt "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}" with optimal clarity and structure.`,
    suggestedTools,
    requiresMemory: q.includes('remember') || q.includes('my') || q.includes('earlier') || q.includes('preference'),
  };
}
