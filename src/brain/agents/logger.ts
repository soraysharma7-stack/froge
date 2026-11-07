/**
 * FROGÉ Agent Architecture - Central Structured Audit Logger
 * Records immutable, searchable audit logs across agent lifecycles, tool invocations,
 * permission checks, approval gates, cost consumption, and error recovery.
 */

import { AgentId, AgentLogEntry } from './types';

/**
 * Sensitive key pattern detector and scrubber
 */
const SENSITIVE_KEY_REGEX = /(?:api[_-]?key|secret|password|token|auth|bearer|private[_-]?key|credential|credit[_-]?card)/i;

function sanitizeLogValue(val: any, depth = 0): any {
  if (depth > 4) return '[MAX_DEPTH]';
  if (typeof val === 'string') {
    // Redact common API key formats (AIza..., sk-..., ghp_..., Bearer ..., froge_local_sk_...)
    return val
      .replace(/\b(?:AIza[0-9A-Za-z-_]{20,50}|sk-[a-zA-Z0-9_\-]{20,80}|ghp_[a-zA-Z0-9]{36}|froge_local_sk_[a-zA-Z0-9_]{10,48}|Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*)\b/gi, '[REDACTED_SECRET]')
      .replace(/(?:password|secret|auth_token)\s*[:=]\s*["']?([^\s"',;]+)["']?/gi, '$1=[REDACTED_CREDENTIAL]');
  }
  if (val && typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map((item) => sanitizeLogValue(item, depth + 1));
    }
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (SENSITIVE_KEY_REGEX.test(k)) {
        cleanObj[k] = '[REDACTED]';
      } else {
        cleanObj[k] = sanitizeLogValue(v, depth + 1);
      }
    }
    return cleanObj;
  }
  return val;
}

export class AgentAuditLogger {
  private logs: AgentLogEntry[] = [];
  private maxLogs: number = 2000;
  private listeners: Array<(log: AgentLogEntry) => void> = [];

  public log(
    agentId: AgentId,
    level: AgentLogEntry['level'],
    category: AgentLogEntry['category'],
    message: string,
    metadata?: Record<string, any>,
    taskId?: string,
    orchestrationId?: string
  ): AgentLogEntry {
    const cleanMessage = sanitizeLogValue(message) as string;
    const cleanMetadata = metadata ? (sanitizeLogValue(metadata) as Record<string, any>) : undefined;

    const entry: AgentLogEntry = {
      logId: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      level,
      agentId,
      taskId,
      orchestrationId,
      category,
      message: cleanMessage,
      metadata: cleanMetadata,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.notifyListeners(entry);
    return entry;
  }

  public getLogs(filter?: {
    agentId?: AgentId;
    category?: AgentLogEntry['category'];
    level?: AgentLogEntry['level'];
    taskId?: string;
    orchestrationId?: string;
    limit?: number;
  }): AgentLogEntry[] {
    let result = [...this.logs];

    if (filter?.agentId) {
      result = result.filter((l) => l.agentId === filter.agentId);
    }
    if (filter?.category) {
      result = result.filter((l) => l.category === filter.category);
    }
    if (filter?.level) {
      result = result.filter((l) => l.level === filter.level);
    }
    if (filter?.taskId) {
      result = result.filter((l) => l.taskId === filter.taskId);
    }
    if (filter?.orchestrationId) {
      result = result.filter((l) => l.orchestrationId === filter.orchestrationId);
    }

    return result.slice(0, filter?.limit || 100);
  }

  public subscribe(callback: (log: AgentLogEntry) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public clear(): void {
    this.logs = [];
  }

  private notifyListeners(entry: AgentLogEntry): void {
    for (const listener of this.listeners) {
      try {
        listener(entry);
      } catch (e) {
        console.error('Error notifying log listener:', e);
      }
    }
  }
}

export const agentAuditLogger = new AgentAuditLogger();
