/**
 * FROGÉ Brain - Tier 3: Application / Data Memory Manager
 *
 * Manages:
 * - Structured domain entities (tasks, plans, artifacts, workspace items)
 * - Data caches and research knowledge graphs
 * - Verified facts & domain analytics metrics
 * - Namespace-partitioned storage
 * - Strict User ID isolation & TTL management
 */

import {
  AppDataMemoryItem,
  AppDataCategory,
} from './types';
import { auditSensitiveData } from './privacyAuditor';

const STORAGE_PREFIX = 'froge_memory_appdata_v1_';

export class AppDataMemoryManager {
  private appDataStore: Map<string, AppDataMemoryItem[]> = new Map();

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
          const userId = key.replace(STORAGE_PREFIX, '');
          const raw = localStorage.getItem(key);
          if (raw) {
            const records: AppDataMemoryItem[] = JSON.parse(raw);
            this.appDataStore.set(userId, records);
          }
        }
      }
    } catch {
      // Storage fallback
    }

    // Seed default baseline fact data for default_user if empty
    if (!this.appDataStore.has('default_user')) {
      this.appDataStore.set('default_user', [
        {
          id: 'app_fact_1',
          userId: 'default_user',
          namespace: 'knowledge_base',
          category: 'verified_fact',
          key: 'system_architecture_definition',
          data: {
            title: 'FROGÉ Cognitive Architecture Specification',
            version: '2026.4',
            corePipeline: 'Request -> Intent -> Task -> Capability -> Model -> Tool -> Exec -> Verifier -> Response',
            verified: true,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          accessCount: 1,
          isImmutable: true,
        },
      ]);
    }
  }

  private persistForUser(userId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const records = this.appDataStore.get(userId) || [];
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(records));
    } catch (e) {
      console.warn(`Failed to persist app/data memory for user ${userId}:`, e);
    }
  }

  /**
   * Store structured application or data record
   */
  public storeRecord(
    userId: string,
    namespace: string,
    key: string,
    data: Record<string, any> | string,
    category: AppDataCategory = 'structured_record',
    ttlSeconds?: number
  ): AppDataMemoryItem {
    const effectiveUserId = userId || 'default_user';
    const effectiveNamespace = namespace || 'default_namespace';

    // Audit stringified data for sensitive info
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    const audit = auditSensitiveData(dataStr);
    let sanitizedData: Record<string, any> | string = data;

    if (audit.hasSensitiveData) {
      if (typeof data === 'string') {
        sanitizedData = audit.redactedText;
      } else {
        try {
          sanitizedData = JSON.parse(audit.redactedText);
        } catch {
          sanitizedData = { raw: audit.redactedText };
        }
      }
    }

    const list = this.appDataStore.get(effectiveUserId) || [];
    const now = Date.now();
    const expiresAt = ttlSeconds ? now + ttlSeconds * 1000 : undefined;

    // Check if duplicate exists in same namespace
    const existingIndex = list.findIndex(
      (r) => r.namespace === effectiveNamespace && r.key.toLowerCase() === key.toLowerCase()
    );

    let record: AppDataMemoryItem;

    if (existingIndex !== -1 && !list[existingIndex].isImmutable) {
      record = {
        ...list[existingIndex],
        data: sanitizedData,
        category,
        updatedAt: now,
        expiresAt,
        accessCount: list[existingIndex].accessCount + 1,
      };
      list[existingIndex] = record;
    } else {
      record = {
        id: `app_${now}_${Math.random().toString(36).substring(2, 7)}`,
        userId: effectiveUserId,
        namespace: effectiveNamespace,
        category,
        key: key.trim(),
        data: sanitizedData,
        createdAt: now,
        updatedAt: now,
        expiresAt,
        accessCount: 1,
      };
      list.unshift(record);
    }

    this.appDataStore.set(effectiveUserId, list);
    this.persistForUser(effectiveUserId);
    return record;
  }

  /**
   * Retrieve records for a specific user with strict isolation and TTL pruning
   */
  public query(
    userId: string,
    namespace?: string,
    queryText?: string,
    category?: AppDataCategory,
    limit = 20
  ): AppDataMemoryItem[] {
    const effectiveUserId = userId || 'default_user';
    const now = Date.now();
    const userRecords = this.appDataStore.get(effectiveUserId) || [];

    // Filter out expired items and filter by query params
    let filtered = userRecords.filter((r) => !r.expiresAt || r.expiresAt > now);

    if (namespace) {
      filtered = filtered.filter((r) => r.namespace === namespace);
    }

    if (category) {
      filtered = filtered.filter((r) => r.category === category);
    }

    if (queryText && queryText.trim().length > 0) {
      const qLower = queryText.toLowerCase().trim();
      filtered = filtered.filter((r) => {
        const contentStr = typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
        return r.key.toLowerCase().includes(qLower) || contentStr.toLowerCase().includes(qLower);
      });
    }

    // Increment access count on retrieved items
    filtered.forEach((r) => (r.accessCount += 1));
    this.persistForUser(effectiveUserId);

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
  }

  /**
   * Delete an app data record by ID
   */
  public deleteById(userId: string, id: string): boolean {
    const effectiveUserId = userId || 'default_user';
    const userRecords = this.appDataStore.get(effectiveUserId);
    if (!userRecords) return false;

    const initialLen = userRecords.length;
    const remaining = userRecords.filter((r) => r.id !== id);

    if (remaining.length !== initialLen) {
      this.appDataStore.set(effectiveUserId, remaining);
      this.persistForUser(effectiveUserId);
      return true;
    }
    return false;
  }

  /**
   * Delete all records in a namespace for a user
   */
  public deleteNamespace(userId: string, namespace: string): number {
    const effectiveUserId = userId || 'default_user';
    const userRecords = this.appDataStore.get(effectiveUserId);
    if (!userRecords) return 0;

    const initialLen = userRecords.length;
    const remaining = userRecords.filter((r) => r.namespace !== namespace);
    const countDeleted = initialLen - remaining.length;

    if (countDeleted > 0) {
      this.appDataStore.set(effectiveUserId, remaining);
      this.persistForUser(effectiveUserId);
    }
    return countDeleted;
  }

  /**
   * Reset all application/data memory for a user
   */
  public resetUserAppData(userId: string): number {
    const effectiveUserId = userId || 'default_user';
    const existing = this.appDataStore.get(effectiveUserId);
    const count = existing ? existing.length : 0;

    this.appDataStore.delete(effectiveUserId);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.getStorageKey(effectiveUserId));
      } catch {}
    }

    return count;
  }

  /**
   * Return all application data for a user
   */
  public getAll(userId: string): AppDataMemoryItem[] {
    const effectiveUserId = userId || 'default_user';
    return [...(this.appDataStore.get(effectiveUserId) || [])];
  }
}

export const appDataMemory = new AppDataMemoryManager();
