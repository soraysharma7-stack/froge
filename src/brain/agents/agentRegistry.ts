/**
 * FROGÉ Agent Architecture - Specialized Agent Registry
 * Master definitions for the 8 core agents:
 * 1. Research Agent
 * 2. Coding Agent
 * 3. Testing Agent
 * 4. Creative Agent
 * 5. Student Agent
 * 6. Business Agent
 * 7. Data Agent
 * 8. Verification Agent
 */

import { AgentDefinition, AgentId } from './types';

export const FROGE_AGENT_DEFINITIONS: Record<AgentId, AgentDefinition> = {
  // 1. Research Agent
  research_agent: {
    id: 'research_agent',
    name: 'Research Agent',
    shortName: 'Research',
    domain: 'Information Retrieval & Academic Synthesis',
    purpose:
      'Performs multi-source live web search, academic literature citation retrieval, recency ranking, and source consensus evaluation.',
    iconName: 'Compass',
    accentColor: '#0ea5e9', // Sky blue
    allowedTools: ['web_search_engine', 'academic_citation_retriever'],
    permissions: {
      readOnly: true,
      networkAccess: 'whitelisted',
      filesystemAccess: 'none',
      systemMutation: 'forbidden',
      maxComputeBudgetUsd: 0.015,
      maxTokensPerTask: 3500,
      maxConcurrentTasks: 2,
      allowedSubAgentCalls: ['verification_agent', 'data_agent'],
      maxDelegationDepth: 1,
    },
    defaultTimeoutMs: 7000,
    errorHandling: {
      maxRetries: 2,
      retryBackoffMs: 1000,
      fallbackStrategy: 'cached_response',
      circuitBreakerThreshold: 3,
      cooldownPeriodMs: 25000,
    },
    approvalPolicy: {
      autoApproveLowRisk: true,
      requireApprovalForTools: [],
      requireApprovalForCostOverUsd: 0.01,
      requireApprovalForMutation: false,
    },
  },

  // 2. Coding Agent
  coding_agent: {
    id: 'coding_agent',
    name: 'Coding Agent',
    shortName: 'Coding',
    domain: 'Software Engineering & AST Refactoring',
    purpose:
      'Generates type-safe TypeScript/Python code, manipulates the virtual file system, and constructs robust application architectures.',
    iconName: 'Code2',
    accentColor: '#10b981', // Emerald green
    allowedTools: ['ast_code_generator', 'sandbox_code_executor', 'virtual_filesystem_writer'],
    permissions: {
      readOnly: false,
      networkAccess: 'none',
      filesystemAccess: 'virtual_sandbox',
      systemMutation: 'requires_human_approval',
      maxComputeBudgetUsd: 0.025,
      maxTokensPerTask: 5000,
      maxConcurrentTasks: 2,
      allowedSubAgentCalls: ['testing_agent', 'verification_agent'],
      maxDelegationDepth: 1,
    },
    defaultTimeoutMs: 10000,
    errorHandling: {
      maxRetries: 3,
      retryBackoffMs: 1500,
      fallbackStrategy: 'graceful_degradation',
      circuitBreakerThreshold: 3,
      cooldownPeriodMs: 30000,
    },
    approvalPolicy: {
      autoApproveLowRisk: false,
      requireApprovalForTools: ['virtual_filesystem_writer'],
      requireApprovalForCostOverUsd: 0.02,
      requireApprovalForMutation: true,
    },
  },

  // 3. Testing Agent
  testing_agent: {
    id: 'testing_agent',
    name: 'Testing Agent',
    shortName: 'Testing',
    domain: 'Quality Assurance & Boundary Verification',
    purpose:
      'Synthesizes exhaustive unit tests, executes boundary fuzzing, verifies assertions, and calculates code coverage telemetry.',
    iconName: 'CheckSquare',
    accentColor: '#8b5cf6', // Purple
    allowedTools: ['unit_test_runner', 'fuzz_tester', 'sandbox_code_executor'],
    permissions: {
      readOnly: true,
      networkAccess: 'none',
      filesystemAccess: 'virtual_sandbox',
      systemMutation: 'forbidden',
      maxComputeBudgetUsd: 0.015,
      maxTokensPerTask: 3000,
      maxConcurrentTasks: 2,
      allowedSubAgentCalls: ['verification_agent'],
      maxDelegationDepth: 1,
    },
    defaultTimeoutMs: 8000,
    errorHandling: {
      maxRetries: 2,
      retryBackoffMs: 1000,
      fallbackStrategy: 'fail_fast',
      circuitBreakerThreshold: 3,
      cooldownPeriodMs: 20000,
    },
    approvalPolicy: {
      autoApproveLowRisk: true,
      requireApprovalForTools: [],
      requireApprovalForCostOverUsd: 0.015,
      requireApprovalForMutation: false,
    },
  },

  // 4. Creative Agent
  creative_agent: {
    id: 'creative_agent',
    name: 'Creative Agent',
    shortName: 'Creative',
    domain: 'Multi-Modal Generation & Brand Voice',
    purpose:
      'Composes atmospheric prose, poetic cadence, and multi-sensory vector graphic assets with strict anti-cliché guardrails.',
    iconName: 'Sparkles',
    accentColor: '#ec4899', // Pink
    allowedTools: ['creative_metaphor_composer', 'image_asset_generator'],
    permissions: {
      readOnly: true,
      networkAccess: 'none',
      filesystemAccess: 'none',
      systemMutation: 'forbidden',
      maxComputeBudgetUsd: 0.015,
      maxTokensPerTask: 3500,
      maxConcurrentTasks: 2,
      allowedSubAgentCalls: ['verification_agent'],
      maxDelegationDepth: 1,
    },
    defaultTimeoutMs: 6000,
    errorHandling: {
      maxRetries: 2,
      retryBackoffMs: 800,
      fallbackStrategy: 'graceful_degradation',
      circuitBreakerThreshold: 3,
      cooldownPeriodMs: 20000,
    },
    approvalPolicy: {
      autoApproveLowRisk: true,
      requireApprovalForTools: [],
      requireApprovalForCostOverUsd: 0.012,
      requireApprovalForMutation: false,
    },
  },

  // 5. Student Agent
  student_agent: {
    id: 'student_agent',
    name: 'Student Agent',
    shortName: 'Student',
    domain: 'Pedagogical Socratic Scaffolding',
    purpose:
      'Breaks down complex topics into first-principles LEGO blocks, builds diagnostic active recall quizzes, and provides intuitive analogs.',
    iconName: 'GraduationCap',
    accentColor: '#f59e0b', // Amber
    allowedTools: ['concept_deconstructor', 'socratic_quiz_synthesizer'],
    permissions: {
      readOnly: true,
      networkAccess: 'none',
      filesystemAccess: 'none',
      systemMutation: 'forbidden',
      maxComputeBudgetUsd: 0.01,
      maxTokensPerTask: 3000,
      maxConcurrentTasks: 2,
      allowedSubAgentCalls: ['verification_agent', 'research_agent'],
      maxDelegationDepth: 1,
    },
    defaultTimeoutMs: 5000,
    errorHandling: {
      maxRetries: 2,
      retryBackoffMs: 1000,
      fallbackStrategy: 'graceful_degradation',
      circuitBreakerThreshold: 3,
      cooldownPeriodMs: 15000,
    },
    approvalPolicy: {
      autoApproveLowRisk: true,
      requireApprovalForTools: [],
      requireApprovalForCostOverUsd: 0.01,
      requireApprovalForMutation: false,
    },
  },

  // 6. Business Agent
  business_agent: {
    id: 'business_agent',
    name: 'Business Agent',
    shortName: 'Business',
    domain: 'Executive Finance & Strategic Operations',
    purpose:
      'Audits sales pipeline velocity, calculates GAAP EBITDA margins, solves inventory EOQ, and projects 3-scenario financial forecasts.',
    iconName: 'TrendingUp',
    accentColor: '#d97706', // Amber-700
    allowedTools: ['gaap_financial_calculator', 'inventory_eoq_solver', 'sales_velocity_auditor'],
    permissions: {
      readOnly: true,
      networkAccess: 'none',
      filesystemAccess: 'none',
      systemMutation: 'requires_human_approval',
      maxComputeBudgetUsd: 0.02,
      maxTokensPerTask: 4000,
      maxConcurrentTasks: 2,
      allowedSubAgentCalls: ['data_agent', 'verification_agent'],
      maxDelegationDepth: 1,
    },
    defaultTimeoutMs: 7000,
    errorHandling: {
      maxRetries: 2,
      retryBackoffMs: 1000,
      fallbackStrategy: 'graceful_degradation',
      circuitBreakerThreshold: 3,
      cooldownPeriodMs: 25000,
    },
    approvalPolicy: {
      autoApproveLowRisk: true,
      requireApprovalForTools: [],
      requireApprovalForCostOverUsd: 0.015,
      requireApprovalForMutation: true,
    },
  },

  // 7. Data Agent
  data_agent: {
    id: 'data_agent',
    name: 'Data Agent',
    shortName: 'Data',
    domain: 'Statistical Analysis & Tabular Transformations',
    purpose:
      'Parses structured datasets, computes statistical normal distributions and z-scores, and identifies tabular anomalies and trends.',
    iconName: 'Database',
    accentColor: '#3b82f6', // Blue
    allowedTools: ['sql_data_engine', 'statistical_analyzer'],
    permissions: {
      readOnly: true,
      networkAccess: 'none',
      filesystemAccess: 'none',
      systemMutation: 'forbidden',
      maxComputeBudgetUsd: 0.015,
      maxTokensPerTask: 3500,
      maxConcurrentTasks: 2,
      allowedSubAgentCalls: ['verification_agent'],
      maxDelegationDepth: 1,
    },
    defaultTimeoutMs: 6000,
    errorHandling: {
      maxRetries: 2,
      retryBackoffMs: 1000,
      fallbackStrategy: 'cached_response',
      circuitBreakerThreshold: 3,
      cooldownPeriodMs: 20000,
    },
    approvalPolicy: {
      autoApproveLowRisk: true,
      requireApprovalForTools: [],
      requireApprovalForCostOverUsd: 0.015,
      requireApprovalForMutation: false,
    },
  },

  // 8. Verification Agent
  verification_agent: {
    id: 'verification_agent',
    name: 'Verification Agent',
    shortName: 'Verification',
    domain: 'Fact-Checking & Logic Consistency',
    purpose:
      'Audits factual claims against ground truth sources, measures semantic hallucination risk, and enforces logic soundness.',
    iconName: 'ShieldCheck',
    accentColor: '#059669', // Emerald-600
    allowedTools: ['claim_fact_checker', 'hallucination_detector'],
    permissions: {
      readOnly: true,
      networkAccess: 'none',
      filesystemAccess: 'none',
      systemMutation: 'forbidden',
      maxComputeBudgetUsd: 0.01,
      maxTokensPerTask: 2500,
      maxConcurrentTasks: 3,
      allowedSubAgentCalls: [], // Leaf agent - cannot delegate
      maxDelegationDepth: 0,
    },
    defaultTimeoutMs: 4000,
    errorHandling: {
      maxRetries: 1,
      retryBackoffMs: 500,
      fallbackStrategy: 'fail_fast',
      circuitBreakerThreshold: 3,
      cooldownPeriodMs: 15000,
    },
    approvalPolicy: {
      autoApproveLowRisk: true,
      requireApprovalForTools: [],
      requireApprovalForCostOverUsd: 0.01,
      requireApprovalForMutation: false,
    },
  },
};

export class AgentRegistry {
  public getAllAgents(): AgentDefinition[] {
    return Object.values(FROGE_AGENT_DEFINITIONS);
  }

  public getAgent(id: AgentId): AgentDefinition {
    const agent = FROGE_AGENT_DEFINITIONS[id];
    if (!agent) {
      throw new Error(`Agent "${id}" is not registered in the FROGÉ Agent Architecture.`);
    }
    return agent;
  }

  public isToolAllowedForAgent(agentId: AgentId, toolId: any): boolean {
    const agent = this.getAgent(agentId);
    return agent.allowedTools.includes(toolId);
  }
}

export const agentRegistry = new AgentRegistry();
