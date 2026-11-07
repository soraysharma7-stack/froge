/**
 * FROGÉ Code - Stage 2: Project Planning & Architecture Engine
 * 
 * Formulates the architecture blueprint, directory tree, file generation specifications,
 * build instructions, and testing strategy based on requirements.
 */

import { ProjectFileSpec, ProjectPlan, RequirementsAnalysis } from './types';

export function createProjectPlan(requirements: RequirementsAnalysis): ProjectPlan {
  const isPython = requirements.targetStack.language === 'python';
  const category = requirements.category;

  const directoryStructure: string[] = [];
  const filesToGenerate: ProjectFileSpec[] = [];

  if (isPython) {
    directoryStructure.push('app/', 'app/api/', 'app/core/', 'app/models/', 'tests/');
    
    filesToGenerate.push(
      {
        path: 'app/main.py',
        purpose: 'FastAPI application entry point, CORS middleware, and route mounting',
        isEntryPoint: true,
        language: 'python',
        dependencies: ['fastapi', 'uvicorn', 'app.api.routes', 'app.core.config'],
      },
      {
        path: 'app/core/config.py',
        purpose: 'Environment variable loading, app settings, and security constants',
        language: 'python',
        dependencies: ['pydantic_settings'],
      },
      {
        path: 'app/models/schemas.py',
        purpose: 'Pydantic data models, request/response validation schemas',
        language: 'python',
        dependencies: ['pydantic', 'typing'],
      },
      {
        path: 'app/api/routes.py',
        purpose: 'REST endpoints, business logic processing, and error handling',
        language: 'python',
        dependencies: ['fastapi', 'app.models.schemas'],
      },
      {
        path: 'tests/test_api.py',
        purpose: 'Pytest automated test suite for endpoints, contracts, and validation',
        isTestFile: true,
        language: 'python',
        dependencies: ['pytest', 'httpx', 'app.main'],
      }
    );
  } else {
    // TypeScript / Fullstack or Frontend
    directoryStructure.push('src/', 'src/components/', 'src/services/', 'src/types/', 'src/tests/');

    filesToGenerate.push(
      {
        path: 'src/types/index.ts',
        purpose: 'TypeScript data models, shared domain interfaces, and state types',
        language: 'typescript',
        dependencies: [],
      },
      {
        path: 'src/services/apiService.ts',
        purpose: 'Data fetching, business logic orchestration, and response caching',
        language: 'typescript',
        dependencies: ['src/types'],
      },
      {
        path: 'src/components/AppView.tsx',
        purpose: 'Primary interactive user interface component with responsive layout',
        isEntryPoint: true,
        language: 'tsx',
        dependencies: ['react', 'lucide-react', 'src/services/apiService', 'src/types'],
      },
      {
        path: 'src/components/StateVisualizer.tsx',
        purpose: 'Real-time state inspector, status indicators, and metrics telemetry',
        language: 'tsx',
        dependencies: ['react', 'lucide-react', 'src/types'],
      },
      {
        path: 'src/tests/app.test.ts',
        purpose: 'Unit & integration test suite covering state transitions and edge cases',
        isTestFile: true,
        language: 'typescript',
        dependencies: ['src/services/apiService', 'src/types'],
      }
    );
  }

  const architectureType =
    category === 'fullstack_web'
      ? 'fullstack_api_client'
      : category === 'backend_api' || category === 'ai_agent_service'
      ? 'modular_microservice'
      : 'monolithic_spa';

  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: requirements.projectTitle,
    architectureType,
    architectureDescription: `Modular ${architectureType} architected for high reliability, clean separation of concerns, zero memory leaks, and 100% test coverage.`,
    directoryStructure,
    filesToGenerate,
    buildSteps: isPython
      ? [
          'Initialize Python 3.11 virtual environment',
          'Install dependencies from requirements.txt via pip',
          'Run static linter (flake8) and type checker (mypy)',
          'Launch uvicorn app.main:app --host 0.0.0.0 --port 8000',
        ]
      : [
          'Verify package.json dependencies and TypeScript configuration',
          'Compile source files via Vite / TypeScript compiler (tsc --noEmit)',
          'Execute test runner suite (Vitest)',
          'Mount production bundle on port 3000',
        ],
    executionStrategy: 'Isolated V8/Node container execution with active memory & latency monitoring',
    testingStrategy: 'Multi-layer test execution: unit assertion tests, API contract checks, schema validation, and boundary conditions',
  };
}
