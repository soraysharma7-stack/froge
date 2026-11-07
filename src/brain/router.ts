import { ExecutionPlan, IntentAnalysis, RoutingDecision, BrainRouteDestination } from './types';

/**
 * FROGÉ Brain - Router Subsystem
 * Routes execution steps to optimal combinations of Models, Tools, Memory, or Specialized Agents.
 */
export function routeExecution(
  intent: IntentAnalysis,
  plan: ExecutionPlan
): RoutingDecision {
  let route: BrainRouteDestination = 'froge_model_gateway';
  const activeAgents: string[] = [];
  const toolsToInvoke: string[] = [...intent.suggestedTools];
  let rationale = 'Defaulting to FROGÉ Model Gateway pathway.';

  switch (intent.primaryIntent) {
    case 'educational_tutoring':
      route = 'agent_socratic_tutor';
      activeAgents.push('Socratic Tutor Agent', 'Curriculum Scaffolder');
      rationale = 'Routing to Socratic Tutor Agent for pedagogical breakdown and concept mastery.';
      break;

    case 'strategic_audit':
      route = 'agent_strategic_auditor';
      activeAgents.push('Strategic Auditor Agent', 'Risk Assessment Engine');
      rationale = 'Routing to Strategic Auditor Agent for comprehensive 360° trade-off and roadmap formulation.';
      break;

    case 'code_generation':
      route = 'tool_code_executor';
      activeAgents.push('FROGÉ Code Engineer');
      toolsToInvoke.push('typescript_ast_validator', 'complexity_estimator');
      rationale = 'Routing to FROGÉ Code Engineer with TypeScript type-safety toolchain.';
      break;

    case 'math_computation':
      route = 'tool_calculator_and_parser';
      toolsToInvoke.push('precise_math_evaluator');
      rationale = 'Routing directly to symbolic calculation and formula evaluation tools.';
      break;

    case 'analytical_reasoning':
      route = 'froge_model_gateway';
      activeAgents.push('Axiomatic Deductive Agent');
      rationale = 'Routing to high-rigor analytical reasoning via FROGÉ Model Gateway.';
      break;

    default:
      if (intent.requiresMemory) {
        route = 'memory_retrieval';
        rationale = 'Engaging memory retrieval prior to model generation.';
      }
      break;
  }

  return {
    route,
    selectedModel: 'froge-neural-v1 (FROGÉ Model Gateway)',
    activeAgents,
    toolsToInvoke,
    rationale,
  };
}
