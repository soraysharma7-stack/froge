# FROGÉ Model Gateway

## Purpose
Unified gateway for all AI model interactions, replacing direct provider calls with a modular routing system.

## Interface
```typescript
interface ModelGateway {
  generate(request: ModelRequest): Promise<ModelResponse>;
  stream(request: ModelRequest): ReadableStream<ModelResponse>;
  healthCheck(providerId: string): Promise<boolean>;
}
```

## Implementation Plan
1. Define unified Request/Response types.
2. Implement providers (`GeminiProvider`, `LocalProvider`, etc.) adhering to the interface.
3. Implement `ModelRouter` to select provider based on task classification.
4. Integrate with `Brain` to replace `mockAi` calls.
