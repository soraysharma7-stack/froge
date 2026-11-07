/**
 * FROGÉ Code - Stage 1: Requirements Understanding Engine
 * 
 * Ingests natural language user requests, extracts explicit and implicit constraints,
 * categorizes requirements, selects the optimal stack, and formulates testable acceptance criteria.
 */

import { CodeProjectCategory, RequirementsAnalysis, UserRequirement } from './types';

export function understandCodeRequirements(userPrompt: string): RequirementsAnalysis {
  const promptLower = userPrompt.toLowerCase();
  
  // 1. Determine Project Category
  let category: CodeProjectCategory = 'fullstack_web';
  if (promptLower.includes('cli') || promptLower.includes('command line') || promptLower.includes('script')) {
    category = 'cli_utility';
  } else if (promptLower.includes('api') || promptLower.includes('microservice') || promptLower.includes('backend') || promptLower.includes('express')) {
    category = 'backend_api';
  } else if (promptLower.includes('data pipeline') || promptLower.includes('etl') || promptLower.includes('stream')) {
    category = 'data_pipeline';
  } else if (promptLower.includes('ai agent') || promptLower.includes('rag') || promptLower.includes('llm service')) {
    category = 'ai_agent_service';
  } else if (promptLower.includes('component') || promptLower.includes('widget') || promptLower.includes('ui only')) {
    category = 'frontend_spa';
  }

  // 2. Extract Project Title
  let projectTitle = 'FROGÉ Application Module';
  if (promptLower.includes('todo') || promptLower.includes('task')) {
    projectTitle = 'Task Orchestration & Analytics Platform';
  } else if (promptLower.includes('markdown') || promptLower.includes('editor')) {
    projectTitle = 'Collaborative Markdown Workspace';
  } else if (promptLower.includes('auth') || promptLower.includes('jwt')) {
    projectTitle = 'Secure Auth & Role-Based Access Engine';
  } else if (promptLower.includes('portfolio') || promptLower.includes('finance') || promptLower.includes('trading')) {
    projectTitle = 'Financial Portfolio & Risk Visualizer';
  } else if (promptLower.includes('weather') || promptLower.includes('dashboard')) {
    projectTitle = 'Real-Time Telemetry Dashboard';
  } else {
    // Generate descriptive title from prompt words
    const words = userPrompt.split(' ').slice(0, 4).join(' ');
    projectTitle = words ? `${words.charAt(0).toUpperCase() + words.slice(1)} Engine` : 'Full-Stack Web System';
  }

  // 3. Formulate Stack
  const isPython = promptLower.includes('python') || promptLower.includes('fastapi') || promptLower.includes('flask');
  const targetStack: RequirementsAnalysis['targetStack'] = isPython
    ? {
        language: 'python',
        framework: 'FastAPI / Pydantic',
        runtime: 'Python 3.11+ / Uvicorn',
        dependencies: {
          fastapi: '^0.110.0',
          uvicorn: '^0.28.0',
          pydantic: '^2.6.0',
          pytest: '^8.0.0',
        },
        devDependencies: {
          black: '^24.2.0',
          flake8: '^7.0.0',
        },
      }
    : {
        language: 'typescript',
        framework: 'React 18 + Express + Tailwind CSS',
        runtime: 'Node.js 20+ / Vite',
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'lucide-react': '^1.16.0',
          express: '^4.19.2',
          cors: '^2.8.5',
          zod: '^3.23.8',
        },
        devDependencies: {
          typescript: '^5.4.5',
          vite: '^5.2.0',
          tailwindcss: '^4.0.0',
          vitest: '^1.6.0',
        },
      };

  // 4. Extract Structured Requirements
  const requirements: UserRequirement[] = [];

  // Core functional requirement
  requirements.push({
    id: 'req_func_1',
    category: 'functional',
    description: `Deliver core interactive functionality addressing: "${userPrompt.slice(0, 100)}..."`,
    isExplicit: true,
    priority: 'must_have',
    testableCriteria: [
      'Input handlers accept and validate user payloads',
      'Business logic updates internal state reliably',
      'API endpoints or UI components render valid responses without exceptions',
    ],
  });

  // Data persistence or state management requirement
  requirements.push({
    id: 'req_func_2',
    category: 'functional',
    description: 'Enforce deterministic data validation, schema contracts, and type safety',
    isExplicit: false,
    priority: 'must_have',
    testableCriteria: [
      'Schema validator rejects malformed inputs with 400 Bad Request',
      'Valid models conform to TypeScript/Pydantic interfaces',
    ],
  });

  // Security & error handling
  requirements.push({
    id: 'req_sec_1',
    category: 'security',
    description: 'Implement zero-trust input sanitization, safe error handling, and no secret leakage',
    isExplicit: false,
    priority: 'must_have',
    testableCriteria: [
      'Zero exposed API keys or credentials in client bundles',
      'Graceful error boundaries prevent application crashes on invalid input',
    ],
  });

  // Performance & UI/UX
  requirements.push({
    id: 'req_perf_1',
    category: 'performance',
    description: 'Maintain sub-100ms processing latency and responsive visual layout',
    isExplicit: false,
    priority: 'should_have',
    testableCriteria: [
      'Render lifecycle operates with zero memory leaks',
      'Client components load smoothly without blocking main thread',
    ],
  });

  return {
    projectTitle,
    summary: `Structured engineering specification for ${projectTitle} (${category}) targeting ${targetStack.framework}.`,
    category,
    targetStack,
    requirements,
    constraints: [
      'Must maintain clean modular file separation (no monolithic single files)',
      'Strict TypeScript/Python typing with zero "any" escapes in production logic',
      'Must include unit & integration test suites with 100% passing rate',
      'Must pass strict static security & OWASP audit checks',
    ],
    assumptions: [
      'Application operates within modern sandboxed runtime container (Node 20+ / Browser / V8)',
      'Network egress adheres to secure HTTPS/WSS proxy protocols',
    ],
  };
}
