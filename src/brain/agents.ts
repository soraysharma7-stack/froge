import { IntentAnalysis } from './types';

/**
 * FROGÉ Brain - Specialized Sub-Agents
 * Autonomous agents providing tailored cognitive personas and specialized task workflows.
 */

export interface AgentActionOutput {
  agentName: string;
  contributions: string[];
  recommendedTone: string;
  focusDirectives: string[];
}

export * from './agents/index';

export const brainAgents = {
  // 1. Socratic Tutor Agent
  socraticTutor: {
    name: 'Socratic Tutor Agent',
    execute(intent: IntentAnalysis, query: string): AgentActionOutput {
      return {
        agentName: 'Socratic Tutor Agent',
        contributions: [
          'Deconstructed target concept into first-principles LEGO blocks.',
          'Formulated intuitive real-world analog.',
          'Synthesized targeted comprehension test question.',
        ],
        recommendedTone: 'Encouraging, pedagogical, clear, analogy-driven',
        focusDirectives: [
          'Avoid dense jargon without defining it first',
          'Reinforce mental models through visual metaphors',
          'Include an active recall checkpoint',
        ],
      };
    },
  },

  // 2. Strategic Auditor Agent
  strategicAuditor: {
    name: 'Strategic Auditor Agent',
    execute(intent: IntentAnalysis, query: string): AgentActionOutput {
      return {
        agentName: 'Strategic Auditor Agent',
        contributions: [
          'Evaluated 360° architectural trade-offs.',
          'Mapped probability vs. impact in risk matrix.',
          'Built phased 90-day execution milestone roadmap.',
        ],
        recommendedTone: 'Rigorous, executive, structured, forward-looking',
        focusDirectives: [
          'Highlight hidden single points of failure',
          'Establish quantifiable SLI/SLO metrics',
          'Prioritize immediate actionable next steps',
        ],
      };
    },
  },

  // 3. Creative Synthesizer Agent
  creativeSynthesizer: {
    name: 'Creative Synthesizer Agent',
    execute(intent: IntentAnalysis, query: string): AgentActionOutput {
      return {
        agentName: 'Creative Synthesizer Agent',
        contributions: [
          'Crafted multi-sensory atmospheric imagery.',
          'Tuned prose cadence with poetic pacing.',
          'Framed visual metaphors with deliberate negative space.',
        ],
        recommendedTone: 'Evocative, poetic, avant-garde, resonant',
        focusDirectives: [
          'Reject generic clichés and SaaS tropes',
          'Focus on tactile textures and acoustic reverberation',
          'Preserve artistic rhythm throughout the passage',
        ],
      };
    },
  },

  // 4. FROGÉ Code Engineer
  codeEngineer: {
    name: 'FROGÉ Code Engineer',
    execute(intent: IntentAnalysis, query: string): AgentActionOutput {
      return {
        agentName: 'FROGÉ Code Engineer',
        contributions: [
          'Structured strict TypeScript interfaces and generics.',
          'Handled lifecycle cleanup and reconnect safety.',
          'Documented time & space complexity constraints.',
        ],
        recommendedTone: 'Pragmatic, precise, production-grade, type-safe',
        focusDirectives: [
          'Ensure zero missing imports or broken syntax',
          'Include complete error handling and cleanup logic',
          'Highlight architectural strengths cleanly',
        ],
      };
    },
  },
};
