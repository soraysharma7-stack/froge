/**
 * FROGÉ Brain - Standardized Model Error Subsystem
 *
 * Provider-Independent Error Hierarchy and Normalization
 */

export type ModelErrorCode =
  | 'TIMEOUT'
  | 'AUTH_MISSING'
  | 'AUTH_INVALID'
  | 'RATE_LIMITED'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'PARSE_ERROR'
  | 'UNKNOWN';

export interface ModelErrorDetails {
  code: ModelErrorCode;
  providerId: string;
  statusCode?: number;
  retryable: boolean;
  rawError?: any;
  timestamp: number;
  modelName?: string;
}

export class ModelError extends Error {
  public readonly code: ModelErrorCode;
  public readonly providerId: string;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly timestamp: number;
  public readonly rawError?: any;
  public readonly modelName?: string;

  constructor(
    message: string,
    options: {
      code: ModelErrorCode;
      providerId: string;
      statusCode?: number;
      retryable?: boolean;
      rawError?: any;
      modelName?: string;
    }
  ) {
    super(message);
    this.name = 'ModelError';
    this.code = options.code;
    this.providerId = options.providerId;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? false;
    this.timestamp = Date.now();
    this.rawError = options.rawError;
    this.modelName = options.modelName;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      providerId: this.providerId,
      statusCode: this.statusCode,
      retryable: this.retryable,
      timestamp: this.timestamp,
      modelName: this.modelName,
    };
  }
}

export class ModelTimeoutError extends ModelError {
  public readonly timeoutMs: number;

  constructor(providerId: string, timeoutMs: number, modelName?: string) {
    super(`Model request to '${providerId}' timed out after ${timeoutMs}ms`, {
      code: 'TIMEOUT',
      providerId,
      statusCode: 408,
      retryable: true,
      modelName,
    });
    this.name = 'ModelTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class ModelAuthError extends ModelError {
  constructor(providerId: string, reason: 'missing' | 'invalid' = 'missing', message?: string) {
    super(
      message || (reason === 'missing'
        ? `API key not configured for provider '${providerId}'. Operating in safe development mode.`
        : `Authentication failed for provider '${providerId}'. API key is invalid.`),
      {
        code: reason === 'missing' ? 'AUTH_MISSING' : 'AUTH_INVALID',
        providerId,
        statusCode: 401,
        retryable: false,
      }
    );
    this.name = 'ModelAuthError';
  }
}

export class ModelRateLimitError extends ModelError {
  constructor(providerId: string, message?: string) {
    super(
      message || `Provider '${providerId}' rate limit exceeded or experiencing high demand.`,
      {
        code: 'RATE_LIMITED',
        providerId,
        statusCode: 429,
        retryable: true,
      }
    );
    this.name = 'ModelRateLimitError';
  }
}

export class ModelProviderUnavailableError extends ModelError {
  constructor(providerId: string, message?: string, statusCode = 503) {
    super(
      message || `Provider '${providerId}' service is currently unavailable.`,
      {
        code: 'PROVIDER_UNAVAILABLE',
        providerId,
        statusCode,
        retryable: true,
      }
    );
    this.name = 'ModelProviderUnavailableError';
  }
}

export class ModelInvalidRequestError extends ModelError {
  constructor(providerId: string, message: string) {
    super(message, {
      code: 'INVALID_REQUEST',
      providerId,
      statusCode: 400,
      retryable: false,
    });
    this.name = 'ModelInvalidRequestError';
  }
}

/**
 * Normalizes any error from SDKs, HTTP requests, or runtimes into a structured ModelError
 */
export function normalizeModelError(error: any, providerId: string, modelName?: string): ModelError {
  if (error instanceof ModelError) {
    return error;
  }

  const message = error?.message || (typeof error === 'string' ? error : 'Unknown model provider error');
  const status = error?.status || error?.statusCode || error?.response?.status;
  const lowerMsg = message.toLowerCase();

  if (error?.name === 'AbortError' || lowerMsg.includes('abort') || lowerMsg.includes('timeout')) {
    return new ModelTimeoutError(providerId, 30000, modelName);
  }

  if (status === 401 || status === 403 || lowerMsg.includes('api_key') || lowerMsg.includes('unauthorized') || lowerMsg.includes('authentication')) {
    return new ModelAuthError(providerId, 'invalid', message);
  }

  if (status === 429 || lowerMsg.includes('rate limit') || lowerMsg.includes('quota')) {
    return new ModelRateLimitError(providerId, message);
  }

  if (status === 503 || status === 502 || status === 504 || lowerMsg.includes('high demand') || lowerMsg.includes('unavailable') || lowerMsg.includes('overloaded')) {
    return new ModelProviderUnavailableError(providerId, message, status || 503);
  }

  if (status === 400 || lowerMsg.includes('invalid argument') || lowerMsg.includes('bad request')) {
    return new ModelInvalidRequestError(providerId, message);
  }

  return new ModelError(message, {
    code: 'UNKNOWN',
    providerId,
    statusCode: status || 500,
    retryable: status >= 500,
    rawError: error,
    modelName,
  });
}
