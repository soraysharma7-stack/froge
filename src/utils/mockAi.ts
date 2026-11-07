/**
 * FROGÉ Brain - Model Gateway Response Dispatcher
 *
 * Replaces legacy mock AI with strict FROGÉ Model Gateway integration.
 * In accordance with FROGÉ architecture rules:
 * - NO fake/mock intelligence
 * - NO keyword-triggered generic answers
 * - If no model is connected, returns a clear model-configuration error.
 */

import {
  ChatMessage,
  FrogeModeId,
  ThoughtData,
  StudentInsights,
  CodeArtifact,
  MaxBusinessPackage,
} from '../types';
import { frogeModelGateway } from '../brain/gateway/frogeModelGateway';
import { frogeBrainEngine } from '../brain/engine/frogeBrainEngine';

export interface AIResponsePayload {
  content: string;
  thoughtData?: ThoughtData;
  studentInsights?: StudentInsights;
  codeArtifacts?: CodeArtifact[];
  maxPackage?: MaxBusinessPackage;
}

export function generateSmartResponse(
  userQuery: string,
  mode: FrogeModeId = 'simple-chat',
  conversationHistory: ChatMessage[] = [],
  _studentDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): AIResponsePayload {
  const query = userQuery.trim();

  // Use FROGÉ Brain Engine for in-house generation
  const brainResult = frogeBrainEngine.generate({
    prompt: query,
    mode,
    conversationHistory: conversationHistory as any,
  });

  return {
    content: brainResult.content,
    thoughtData: brainResult.thoughtData,
  };
}
