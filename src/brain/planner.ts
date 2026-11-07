import { ExecutionPlan, IntentAnalysis, PlanStep } from './types';

/**
 * FROGÉ Brain - Planner Subsystem
 * Constructs structured, non-hidden multi-step execution plans
 * to achieve the user's explicit intent.
 */
export function createPlan(intent: IntentAnalysis, userQuery: string): ExecutionPlan {
  const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const steps: PlanStep[] = [];

  // Step 1: Memory & Context Grounding
  if (intent.requiresMemory) {
    steps.push({
      stepNumber: 1,
      targetComponent: 'memory',
      description: 'Retrieve contextual session memories and user preferences',
      details: 'Check persistent memory store for matching entities and constraints',
    });
  }

  // Step 2: Intent-specific workflow decomposition
  switch (intent.primaryIntent) {
    case 'code_generation':
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'model',
        description: 'Synthesize type-safe TypeScript/JS code structure & interfaces',
      });
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'tool',
        description: 'Run static validation, edge-case analysis & complexity audit',
      });
      break;

    case 'educational_tutoring':
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'agent',
        description: 'Engage Socratic Tutor Agent for first-principles concept breakdown',
      });
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'tool',
        description: 'Generate real-world analogy and interactive comprehension check',
      });
      break;

    case 'strategic_audit':
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'agent',
        description: 'Deploy Strategic Auditor Agent for 360° risk and trade-off synthesis',
      });
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'tool',
        description: 'Construct structured risk matrix and milestone roadmap',
      });
      break;

    case 'analytical_reasoning':
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'model',
        description: 'Formulate deductive logic framework and isolate key variables',
      });
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'agent',
        description: 'Audit counter-arguments, failure modes, and second-order dynamics',
      });
      break;

    case 'creative_composition':
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'agent',
        description: 'Invoke Creative Synthesizer Agent for evocative imagery and rhythmic phrasing',
      });
      break;

    case 'math_computation':
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'tool',
        description: 'Execute symbolic computation and formula verification',
      });
      break;

    default:
      steps.push({
        stepNumber: steps.length + 1,
        targetComponent: 'model',
        description: 'Generate concise, direct, and actionable answer',
      });
      break;
  }

  // Final Step: Verification
  steps.push({
    stepNumber: steps.length + 1,
    targetComponent: 'model',
    description: 'Perform factual consistency, evidence verification, and uncertainty calibration',
  });

  return {
    planId,
    goal: intent.userGoal,
    steps,
    estimatedDifficulty: intent.complexity,
    safetyCheckPassed: true,
  };
}
