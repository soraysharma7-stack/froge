# FROGÉ AI — Codebase Audit

## Architecture Map
FROGÉ AI is built as a Vite-based React SPA frontend with an Express backend running on Node.js.
- **Frontend**: React 19, TypeScript, Tailwind CSS. Components are modular and categorized by mode (e.g., Creative, Student, MAX).
- **Backend**: Express (`server.ts`) acting as the API gateway. Integrates directly with `@google/genai` for AI capabilities.
- **Brain (Core)**: Located in `/src/brain`. This is the central orchestration layer implementing intent detection, task planning, model routing, memory management, and result verification.

## Feature Inventory
- **Simple Chat**: Core conversational interface.
- **Deep Thinking**: Orchestrated thinking capability.
- **Creative AI**: Tools for creative assets.
- **Code**: Development/programming tools.
- **Student Mode**: Educational/tutorial mode.
- **MAX**: High-level orchestrator.
- **Voice**: Audio interface.

## Dependency Inventory
(Refer to `/package.json`)
- Key AI: `@google/genai`
- Core UI: `react`, `react-dom`, `lucide-react`, `motion`
- Backend: `express`, `dotenv`, `tsx` (for dev)

## Model Inventory
(Initial discovery from imports/usage)
- Primary: Google Gemini models (`gemini-*` series via `@google/genai`)

## Mock/Placeholder Findings
- `/src/utils/mockAi.ts` is explicitly present, suggesting existence of fallback mechanisms that need to be audited for replacement with real implementations.

## Security Findings
- Initial scanning suggests Express middleware implementation for basic security (headers, rate limiting).
- Need a thorough review of environment variable handling and API key management to ensure no exposure.

## Recommended Implementation Order
1. Phase 1: Cleanup & Security (Audit environment, API keys, basic hardening).
2. Phase 2: Real Model Gateway (Normalize model access).
3. Phase 3: Brain Routing (Orchestrate logic in `/src/brain`).
4. ...and so on, following the master plan.
