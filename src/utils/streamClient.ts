import { FrogeModeId, WebSearchResult, ThoughtData } from '../types';

export interface StreamCallbacks {
  onChunk: (accumulatedText: string, newChunk: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: any) => void;
  onWebSources?: (sources: WebSearchResult[]) => void;
  onThoughtData?: (thoughtData: ThoughtData) => void;
}

/**
 * Streams response text either via SSE from /api/chat/stream or through a progressive
 * token emitter with natural word-by-word typing pacing.
 */
export async function streamChatResponse({
  prompt,
  mode,
  image,
  providerId,
  model,
  history,
  webSearch,
  signal,
  fallbackContent,
  callbacks,
}: {
  prompt: string;
  mode: FrogeModeId;
  image?: string;
  providerId?: string;
  model?: string;
  history?: Array<{ role: string; content: string }>;
  webSearch?: boolean;
  signal?: AbortSignal;
  fallbackContent?: string;
  callbacks: StreamCallbacks;
}): Promise<string> {
  let accumulated = '';

  // Try real server SSE stream first
  try {
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, mode, image, providerId, model, history, webSearch }),
      signal,
    });

    if (res.ok && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let receivedServerChunks = false;

      while (true) {
        if (signal?.aborted) {
          throw new DOMException('Aborted by user', 'AbortError');
        }

        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.replace(/^data:\s*/, '');

          if (dataStr === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === 'chunk' && parsed.text) {
              receivedServerChunks = true;
              accumulated += parsed.text;
              callbacks.onChunk(accumulated, parsed.text);
            } else if (parsed.type === 'web_sources' && parsed.sources) {
              callbacks.onWebSources?.(parsed.sources);
            } else if (parsed.type === 'thought_data' && parsed.thoughtData) {
              callbacks.onThoughtData?.(parsed.thoughtData);
            } else if (parsed.type === 'fallback') {
              // Server indicated fallback to client engine
              break;
            } else if (parsed.type === 'error') {
              console.warn('Server stream reported error:', parsed.error);
              break;
            }
          } catch (e) {
            // Ignore unparseable line
          }
        }
      }

      if (receivedServerChunks && accumulated.trim().length > 0) {
        callbacks.onDone(accumulated);
        return accumulated;
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      callbacks.onDone(accumulated);
      throw err;
    }
    console.warn('SSE stream unavailable or timed out, using responsive local stream:', err);
  }

  // If server already delivered substantive content, return that content rather than overwriting
  if (accumulated.trim().length > 0) {
    callbacks.onDone(accumulated);
    return accumulated;
  }

  // Progressive token-by-token streaming generator
  const targetText = fallbackContent || 'Synthesizing response for FROGÉ intelligence...';
  // Split into natural semantic token chunks (words + punctuation)
  const tokens = targetText.match(/(\s+|\S+|\n)/g) || [targetText];

  accumulated = '';
  // Pacing: roughly 15-25ms per token for snappy feel
  for (let i = 0; i < tokens.length; i++) {
    if (signal?.aborted) {
      callbacks.onDone(accumulated);
      throw new DOMException('Aborted by user', 'AbortError');
    }

    const token = tokens[i];
    accumulated += token;
    callbacks.onChunk(accumulated, token);

    // Dynamic delay: longer pause on punctuation/newlines, fast on words
    let delay = 12;
    if (token.includes('\n') || token.includes('.') || token.includes('!') || token.includes('?')) {
      delay = 24;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  callbacks.onDone(accumulated);
  return accumulated;
}
