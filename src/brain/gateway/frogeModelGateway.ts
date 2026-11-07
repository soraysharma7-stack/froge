/**
 * FROGÉ Model Gateway
 *
 * Decoupled neural model gateway for FROGÉ AI.
 * Bridges FROGÉ Brain to any neural language model:
 * - Local FROGÉ model (via Ollama, llama.cpp, or FastAPI inference server)
 * - Hugging Face inference endpoint
 * - Cloud GPU inference server (vLLM, Modal, RunPod)
 * - Custom self-hosted FROGÉ inference cluster
 *
 * Environment variables:
 * - FROGE_MODEL_ENDPOINT: Base URL (e.g. http://127.0.0.1:11434/v1 or https://gpu.example.com/v1)
 * - FROGE_MODEL: Target model identifier (e.g. froge-v1, llama3.2, mistral)
 * - FROGE_MODEL_API_KEY: Optional authentication token (Bearer)
 */

import { FrogeModeId } from '../../types';

export interface FrogeGatewayConfig {
  endpoint: string;
  modelName: string;
  apiKey?: string;
  timeoutMs?: number;
}

export interface ModelGatewayMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ModelGatewayRequest {
  prompt: string;
  mode?: FrogeModeId;
  systemInstruction?: string;
  messages?: ModelGatewayMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ModelGatewayResponse {
  content: string;
  model: string;
  provider: string;
  durationMs: number;
  finishReason?: string;
}

export class FrogeModelNotConfiguredError extends Error {
  constructor(message?: string) {
    super(
      message ||
        'FROGÉ model is not configured. Please configure FROGE_MODEL_ENDPOINT and FROGE_MODEL in server environment or Model Gateway settings to connect your neural model.'
    );
    this.name = 'FrogeModelNotConfiguredError';
  }
}

class FrogeModelGateway {
  private config: FrogeGatewayConfig;

  constructor() {
    this.config = {
      endpoint: process.env.FROGE_MODEL_ENDPOINT || '',
      modelName: process.env.FROGE_MODEL || 'froge-neural-v1',
      apiKey: process.env.FROGE_MODEL_API_KEY || '',
      timeoutMs: 30000,
    };
  }

  /**
   * Returns true only when a real model endpoint has been connected
   */
  public isConfigured(): boolean {
    return Boolean(this.config.endpoint && this.config.endpoint.trim().length > 0);
  }

  /**
   * Safe configuration snapshot (secrets masked)
   */
  public getConfig() {
    return {
      endpoint: this.config.endpoint,
      modelName: this.config.modelName,
      isConfigured: this.isConfigured(),
      hasApiKey: Boolean(this.config.apiKey),
      timeoutMs: this.config.timeoutMs,
    };
  }

  /**
   * Dynamically update gateway settings
   */
  public setConfig(updates: Partial<FrogeGatewayConfig>): void {
    if (updates.endpoint !== undefined) this.config.endpoint = updates.endpoint.trim();
    if (updates.modelName !== undefined) this.config.modelName = updates.modelName.trim();
    if (updates.apiKey !== undefined) this.config.apiKey = updates.apiKey.trim();
    if (updates.timeoutMs !== undefined) this.config.timeoutMs = updates.timeoutMs;
  }

  /**
   * Health check to verify model server availability
   */
  public async healthCheck(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
    if (!this.isConfigured()) {
      return { connected: false, error: 'FROGÉ model endpoint is not configured' };
    }

    const start = Date.now();
    try {
      let healthUrl = this.config.endpoint;
      if (healthUrl.endsWith('/v1')) {
        healthUrl = `${healthUrl}/models`;
      } else if (!healthUrl.endsWith('/health') && !healthUrl.endsWith('/models')) {
        healthUrl = `${healthUrl.replace(/\/+$/, '')}/health`;
      }

      const headers: Record<string, string> = {};
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const res = await fetch(healthUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return { connected: false, error: `Model server returned HTTP ${res.status}` };
      }

      return { connected: true, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { connected: false, error: err?.message || 'Connection failed' };
    }
  }

  /**
   * Formats chat payload for standard OpenAI-compatible inference servers
   */
  private formatPayload(req: ModelGatewayRequest) {
    const messages: ModelGatewayMessage[] = [];

    if (req.systemInstruction) {
      messages.push({ role: 'system', content: req.systemInstruction });
    }

    if (req.messages && req.messages.length > 0) {
      messages.push(...req.messages);
    } else {
      messages.push({ role: 'user', content: req.prompt });
    }

    return {
      model: this.config.modelName || 'froge-neural-v1',
      messages,
      temperature: req.temperature ?? (req.mode === 'froge-code' ? 0.2 : req.mode === 'deep-thinking' ? 0.4 : 0.7),
      max_tokens: req.maxTokens ?? 2048,
      stream: Boolean(req.stream),
    };
  }

  private getChatCompletionsUrl(): string {
    const base = this.config.endpoint.replace(/\/+$/, '');
    if (base.endsWith('/chat/completions')) return base;
    if (base.endsWith('/v1')) return `${base}/chat/completions`;
    return `${base}/v1/chat/completions`;
  }

  /**
   * Full non-streaming text generation
   */
  public async generate(req: ModelGatewayRequest): Promise<ModelGatewayResponse> {
    if (!this.isConfigured()) {
      throw new FrogeModelNotConfiguredError();
    }

    const start = Date.now();
    const url = this.getChatCompletionsUrl();
    const payload = this.formatPayload({ ...req, stream: false });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeoutMs || 30000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`FROGÉ Model Gateway request failed (HTTP ${res.status}): ${errText.slice(0, 300)}`);
    }

    const json = await res.json();
    const choice = json.choices?.[0];
    const content = choice?.message?.content || json.response || json.output || '';

    return {
      content,
      model: this.config.modelName,
      provider: 'froge-model-gateway',
      durationMs: Date.now() - start,
      finishReason: choice?.finish_reason || 'stop',
    };
  }

  /**
   * Streaming token generation via Server-Sent Events from the model
   */
  public async stream(
    req: ModelGatewayRequest,
    onChunk: (text: string) => void
  ): Promise<ModelGatewayResponse> {
    if (!this.isConfigured()) {
      throw new FrogeModelNotConfiguredError();
    }

    const start = Date.now();
    const url = this.getChatCompletionsUrl();
    const payload = this.formatPayload({ ...req, stream: true });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeoutMs || 45000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`FROGÉ Model Gateway stream failed (HTTP ${res.status}): ${errText.slice(0, 300)}`);
    }

    let fullText = '';
    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('Readable stream not available on model response');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta?.content || data.response || '';
            if (delta) {
              fullText += delta;
              onChunk(delta);
            }
          } catch {
            // Ignore partial SSE chunks
          }
        }
      }
    }

    return {
      content: fullText,
      model: this.config.modelName,
      provider: 'froge-model-gateway',
      durationMs: Date.now() - start,
    };
  }
}

export const frogeModelGateway = new FrogeModelGateway();
