/**
 * FROGÉ Brain - Capability Selection Module
 *
 * Stage 3: Determines the required cognitive capabilities, compute intensity,
 * and reasoning budget allocation based on the task classification and intent.
 */

import {
  IntentUnderstanding,
  TaskClassification,
  CapabilitySelection,
  BrainCapability,
} from './types';

export function selectCapabilities(
  intent: IntentUnderstanding,
  task: TaskClassification
): CapabilitySelection {
  const selectedCapabilities: BrainCapability[] = [];
  let computeIntensity: 'lean' | 'moderate' | 'intensive' = 'moderate';
  let reasoningBudget: 'none' | 'standard' | 'extended' = 'standard';
  let primaryCapability: BrainCapability = 'conversational_fluency';

  if (intent.complexityTier === 0) {
    return {
      selectedCapabilities: ['conversational_fluency'],
      primaryCapability: 'conversational_fluency',
      computeIntensity: 'lean',
      reasoningBudget: 'none',
      capabilityRationale: 'Level 0 Casual: Pure conversational fluency on Fast Path with zero reasoning overhead.',
    };
  }

  if (intent.complexityTier === 1 && task.primaryTask === 'normal_conversation') {
    return {
      selectedCapabilities: ['conversational_fluency'],
      primaryCapability: 'conversational_fluency',
      computeIntensity: 'lean',
      reasoningBudget: 'none',
      capabilityRationale: 'Level 1 Simple: Direct factual response with minimal compute.',
    };
  }

  switch (task.primaryTask) {
    case 'normal_conversation':
      primaryCapability = 'conversational_fluency';
      selectedCapabilities.push('conversational_fluency');
      computeIntensity = 'lean';
      reasoningBudget = 'none';
      break;

    case 'deeper_reasoning':
      primaryCapability = 'step_by_step_deduction';
      selectedCapabilities.push('step_by_step_deduction');
      if (intent.complexityLevel === 'expert' || intent.complexityScore > 0.7 || intent.complexityTier >= 3) {
        computeIntensity = 'intensive';
        reasoningBudget = 'extended';
        selectedCapabilities.push('multi_agent_orchestration');
      } else {
        computeIntensity = 'moderate';
        reasoningBudget = 'standard';
      }
      break;

    case 'web_research':
      primaryCapability = 'web_search_grounding';
      selectedCapabilities.push('web_search_grounding', 'conversational_fluency');
      computeIntensity = 'moderate';
      reasoningBudget = 'standard';
      break;

    case 'creative_generation':
      primaryCapability = 'creative_metaphor_synthesis';
      selectedCapabilities.push('creative_metaphor_synthesis');
      if (intent.complexityLevel === 'expert' || intent.complexityLevel === 'high') {
        computeIntensity = 'intensive';
        reasoningBudget = 'standard';
      } else {
        computeIntensity = 'moderate';
        reasoningBudget = 'none';
      }
      break;

    case 'coding':
      primaryCapability = 'code_ast_and_refactoring';
      selectedCapabilities.push('code_ast_and_refactoring');
      if (intent.normalizedQuery.includes('calculate') || intent.normalizedQuery.includes('algorithm')) {
        selectedCapabilities.push('mathematical_symbolic_solver');
      }
      if (intent.complexityLevel === 'expert' || intent.complexityLevel === 'high') {
        computeIntensity = 'intensive';
        reasoningBudget = 'standard';
      } else {
        computeIntensity = 'moderate';
        reasoningBudget = 'standard';
      }
      break;

    case 'business_analysis':
      primaryCapability = 'strategic_risk_modeling';
      selectedCapabilities.push('strategic_risk_modeling');
      if (intent.complexityLevel === 'expert') {
        computeIntensity = 'intensive';
        reasoningBudget = 'extended';
        selectedCapabilities.push('multi_agent_orchestration');
      } else {
        computeIntensity = 'moderate';
        reasoningBudget = 'standard';
      }
      break;

    case 'education':
      primaryCapability = 'socratic_pedagogical_breakdown';
      selectedCapabilities.push('socratic_pedagogical_breakdown');
      computeIntensity = 'moderate';
      reasoningBudget = 'standard';
      break;

    case 'memory':
      primaryCapability = 'memory_recall_and_indexing';
      selectedCapabilities.push('memory_recall_and_indexing', 'conversational_fluency');
      computeIntensity = 'lean';
      reasoningBudget = 'none';
      break;
  }

  // Include secondary capabilities
  task.secondaryTasks.forEach((secTask) => {
    if (secTask === 'memory' && !selectedCapabilities.includes('memory_recall_and_indexing')) {
      selectedCapabilities.push('memory_recall_and_indexing');
    }
    if (secTask === 'web_research' && !selectedCapabilities.includes('web_search_grounding')) {
      selectedCapabilities.push('web_search_grounding');
    }
    if (secTask === 'coding' && !selectedCapabilities.includes('code_ast_and_refactoring')) {
      selectedCapabilities.push('code_ast_and_refactoring');
    }
  });

  const capabilityRationale = `Allocated ${computeIntensity.toUpperCase()} compute with ${reasoningBudget.toUpperCase()} reasoning budget for ${primaryCapability}.`;

  return {
    selectedCapabilities,
    primaryCapability,
    computeIntensity,
    reasoningBudget,
    capabilityRationale,
  };
}
