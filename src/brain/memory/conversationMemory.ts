/**
 * FROGÉ Brain - Tier 1: Conversation Memory Manager
 *
 * Manages:
 * - Real-time dialogue turns (user, assistant, system)
 * - Session contexts and thread markers
 * - Sliding window dialogue buffers (prevents unbounded token bloat)
 * - Auto-summarization context for older turns
 * - Strict User ID namespace partitioning
 */

import { ConversationTurnItem, ConversationSessionState } from './types';
import { auditSensitiveData } from './privacyAuditor';

const STORAGE_PREFIX = 'froge_memory_conversation_v1_';

export class ConversationMemoryManager {
  private inMemorySessions: Map<string, ConversationSessionState> = new Map();
  private maxTurnsPerSession = 50;

  constructor() {
    this.hydrateFromStorage();
  }

  private getStorageKey(userId: string): string {
    return `${STORAGE_PREFIX}${userId || 'default_user'}`;
  }

  private hydrateFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data: ConversationSessionState[] = JSON.parse(raw);
            data.forEach((s) => {
              this.inMemorySessions.set(`${s.userId}:::${s.sessionId}`, s);
            });
          }
        }
      }
    } catch {
      // Storage hydration fallback
    }
  }

  private persistForUser(userId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const userSessions: ConversationSessionState[] = [];
      this.inMemorySessions.forEach((state) => {
        if (state.userId === userId) {
          userSessions.push(state);
        }
      });
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(userSessions));
    } catch (e) {
      console.warn(`Failed to persist conversation memory for user ${userId}:`, e);
    }
  }

  /**
   * Append a conversation turn to the user's session
   */
  public addTurn(
    userId: string,
    sessionId: string,
    turn: Omit<ConversationTurnItem, 'id' | 'userId' | 'sessionId' | 'timestamp'>
  ): ConversationTurnItem {
    const effectiveUserId = userId || 'default_user';
    const effectiveSessionId = sessionId || 'default_session';
    const sessionKey = `${effectiveUserId}:::${effectiveSessionId}`;

    // Audit and sanitize content for sensitive info
    const audit = auditSensitiveData(turn.content);
    const sanitizedContent = audit.redactedText;

    let session = this.inMemorySessions.get(sessionKey);
    const now = Date.now();

    if (!session) {
      session = {
        sessionId: effectiveSessionId,
        userId: effectiveUserId,
        startedAt: now,
        lastActiveAt: now,
        totalTurns: 0,
        recentTurns: [],
        dominantTopics: [],
      };
      this.inMemorySessions.set(sessionKey, session);
    }

    const newTurn: ConversationTurnItem = {
      id: `turn_${now}_${Math.random().toString(36).substring(2, 7)}`,
      userId: effectiveUserId,
      sessionId: effectiveSessionId,
      timestamp: now,
      role: turn.role,
      content: sanitizedContent,
      mode: turn.mode,
      tokensCount: turn.tokensCount || Math.round(sanitizedContent.length / 4),
      topicTags: turn.topicTags || [],
      sentiment: turn.sentiment,
    };

    session.recentTurns.push(newTurn);
    session.totalTurns += 1;
    session.lastActiveAt = now;

    // Prune sliding window if exceeding limit and synthesize summary
    if (session.recentTurns.length > this.maxTurnsPerSession) {
      const pruned = session.recentTurns.shift();
      if (pruned && !session.summaryContext) {
        session.summaryContext = `Conversation initiated discussing ${pruned.role}: "${pruned.content.slice(0, 80)}..."`;
      }
    }

    // Extract dominant topic tags
    if (newTurn.topicTags) {
      newTurn.topicTags.forEach((tag) => {
        if (!session!.dominantTopics.includes(tag)) {
          session!.dominantTopics.push(tag);
        }
      });
    }

    this.persistForUser(effectiveUserId);
    return newTurn;
  }

  /**
   * Retrieve conversation turns for a specific user and session with strict tenant isolation
   */
  public getSessionTurns(userId: string, sessionId?: string, limit = 20): ConversationTurnItem[] {
    const effectiveUserId = userId || 'default_user';
    const results: ConversationTurnItem[] = [];

    this.inMemorySessions.forEach((state) => {
      // STRICT TENANT ISOLATION: Only matches if userId matches exactly
      if (state.userId === effectiveUserId) {
        if (!sessionId || state.sessionId === sessionId) {
          results.push(...state.recentTurns);
        }
      }
    });

    // Sort by timestamp descending then take slice
    return results.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Query conversation memory by semantic content
   */
  public query(userId: string, queryText: string, limit = 10): ConversationTurnItem[] {
    const effectiveUserId = userId || 'default_user';
    const qLower = queryText.toLowerCase().trim();
    const matches: ConversationTurnItem[] = [];

    this.inMemorySessions.forEach((state) => {
      if (state.userId === effectiveUserId) {
        state.recentTurns.forEach((turn) => {
          if (
            turn.content.toLowerCase().includes(qLower) ||
            turn.topicTags?.some((t) => t.toLowerCase().includes(qLower))
          ) {
            matches.push(turn);
          }
        });
      }
    });

    return matches.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Delete a single conversation turn by ID (scoped to user)
   */
  public deleteTurn(userId: string, turnId: string): boolean {
    const effectiveUserId = userId || 'default_user';
    let deleted = false;

    this.inMemorySessions.forEach((state) => {
      if (state.userId === effectiveUserId) {
        const idx = state.recentTurns.findIndex((t) => t.id === turnId);
        if (idx !== -1) {
          state.recentTurns.splice(idx, 1);
          deleted = true;
        }
      }
    });

    if (deleted) {
      this.persistForUser(effectiveUserId);
    }
    return deleted;
  }

  /**
   * Delete an entire session for a user
   */
  public deleteSession(userId: string, sessionId: string): boolean {
    const effectiveUserId = userId || 'default_user';
    const sessionKey = `${effectiveUserId}:::${sessionId}`;
    const existed = this.inMemorySessions.has(sessionKey);

    if (existed) {
      this.inMemorySessions.delete(sessionKey);
      this.persistForUser(effectiveUserId);
      return true;
    }
    return false;
  }

  /**
   * Wipe all conversation memory for a user
   */
  public resetUserConversation(userId: string): number {
    const effectiveUserId = userId || 'default_user';
    let count = 0;

    const keysToDelete: string[] = [];
    this.inMemorySessions.forEach((state, key) => {
      if (state.userId === effectiveUserId) {
        count += state.recentTurns.length;
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.inMemorySessions.delete(key));

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.getStorageKey(effectiveUserId));
      } catch {}
    }

    return count;
  }

  /**
   * Get all active sessions metadata for a user
   */
  public getUserSessions(userId: string): ConversationSessionState[] {
    const effectiveUserId = userId || 'default_user';
    const sessions: ConversationSessionState[] = [];

    this.inMemorySessions.forEach((state) => {
      if (state.userId === effectiveUserId) {
        sessions.push({ ...state });
      }
    });

    return sessions;
  }
}

export const conversationMemory = new ConversationMemoryManager();
