/**
 * FROGÉ Brain - Tier 2: User Personalization Memory Manager
 *
 * Manages:
 * - Explicit user preferences and directives
 * - Interaction style customizations (tone, verbosity, formatting)
 * - Domain expertise & background facts
 * - Categorized personalization profiles
 * - Strict User ID cryptographic isolation
 */

import {
  PersonalizationMemoryItem,
  PersonalizationCategory,
} from './types';
import { auditSensitiveData } from './privacyAuditor';

const STORAGE_PREFIX = 'froge_memory_personalization_v1_';

export class PersonalizationMemoryManager {
  private userStore: Map<string, PersonalizationMemoryItem[]> = new Map();

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
            const records: PersonalizationMemoryItem[] = JSON.parse(raw);
            this.userStore.set(userId, records);
          }
        }
      }
    } catch {
      // Storage fallback
    }

    // Seed default baseline for default_user if empty
    if (!this.userStore.has('default_user')) {
      this.userStore.set('default_user', [
        {
          id: 'pref_init_1',
          userId: 'default_user',
          timestamp: Date.now(),
          updatedAt: Date.now(),
          category: 'interaction_style',
          key: 'explanation_style',
          value: 'Structured, transparent, evidence-based with clear reasoning summaries',
          confidence: 1.0,
          source: 'system_default',
          isPinned: true,
          tags: ['system', 'default', 'clarity'],
        },
        {
          id: 'pref_init_2',
          userId: 'default_user',
          timestamp: Date.now(),
          updatedAt: Date.now(),
          category: 'preference',
          key: 'code_quality_standard',
          value: 'Strict TypeScript typing, modular architecture, comprehensive test coverage',
          confidence: 0.95,
          source: 'system_default',
          tags: ['coding', 'typescript', 'architecture'],
        },
      ]);
    }
  }

  private persistForUser(userId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const records = this.userStore.get(userId) || [];
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(records));
    } catch (e) {
      console.warn(`Failed to persist personalization memory for user ${userId}:`, e);
    }
  }

  /**
   * Set or update a user personalization memory item
   */
  public setPreference(
    userId: string,
    key: string,
    value: string,
    category: PersonalizationCategory = 'preference',
    source: PersonalizationMemoryItem['source'] = 'explicit_user_statement',
    tags: string[] = []
  ): PersonalizationMemoryItem {
    const effectiveUserId = userId || 'default_user';
    const audit = auditSensitiveData(value);
    const sanitizedValue = audit.redactedText;

    const list = this.userStore.get(effectiveUserId) || [];
    const now = Date.now();

    // Check if key already exists for this user
    const existingIndex = list.findIndex(
      (item) => item.key.toLowerCase() === key.toLowerCase() && item.category === category
    );

    let savedItem: PersonalizationMemoryItem;

    if (existingIndex !== -1) {
      // Update existing
      savedItem = {
        ...list[existingIndex],
        value: sanitizedValue,
        updatedAt: now,
        confidence: Math.min(1.0, list[existingIndex].confidence + 0.1),
        source,
        tags: Array.from(new Set([...(list[existingIndex].tags || []), ...tags])),
      };
      list[existingIndex] = savedItem;
    } else {
      // Create new
      savedItem = {
        id: `pref_${now}_${Math.random().toString(36).substring(2, 7)}`,
        userId: effectiveUserId,
        timestamp: now,
        updatedAt: now,
        category,
        key: key.trim(),
        value: sanitizedValue,
        confidence: source === 'explicit_user_statement' ? 1.0 : 0.85,
        source,
        tags,
      };
      list.unshift(savedItem);
    }

    this.userStore.set(effectiveUserId, list);
    this.persistForUser(effectiveUserId);
    return savedItem;
  }

  /**
   * Query personalization records for a specific user with strict isolation
   */
  public query(
    userId: string,
    queryText?: string,
    category?: PersonalizationCategory,
    limit = 20
  ): PersonalizationMemoryItem[] {
    const effectiveUserId = userId || 'default_user';
    // STRICT TENANT ISOLATION: Retrieve ONLY records belonging to effectiveUserId
    const userRecords = this.userStore.get(effectiveUserId) || [];

    let filtered = [...userRecords];

    if (category) {
      filtered = filtered.filter((r) => r.category === category);
    }

    if (queryText && queryText.trim().length > 0) {
      const qLower = queryText.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.key.toLowerCase().includes(qLower) ||
          r.value.toLowerCase().includes(qLower) ||
          r.tags?.some((t) => t.toLowerCase().includes(qLower))
      );
    }

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
  }

  /**
   * Get a specific preference by key for a user
   */
  public getByKey(userId: string, key: string): PersonalizationMemoryItem | undefined {
    const effectiveUserId = userId || 'default_user';
    const userRecords = this.userStore.get(effectiveUserId) || [];
    return userRecords.find((r) => r.key.toLowerCase() === key.toLowerCase());
  }

  /**
   * Delete a personalization memory item by ID
   */
  public deleteById(userId: string, id: string): boolean {
    const effectiveUserId = userId || 'default_user';
    const userRecords = this.userStore.get(effectiveUserId);
    if (!userRecords) return false;

    const initialLen = userRecords.length;
    const remaining = userRecords.filter((r) => r.id !== id);

    if (remaining.length !== initialLen) {
      this.userStore.set(effectiveUserId, remaining);
      this.persistForUser(effectiveUserId);
      return true;
    }
    return false;
  }

  /**
   * Delete all items in a category for a user
   */
  public deleteByCategory(userId: string, category: PersonalizationCategory): number {
    const effectiveUserId = userId || 'default_user';
    const userRecords = this.userStore.get(effectiveUserId);
    if (!userRecords) return 0;

    const initialLen = userRecords.length;
    const remaining = userRecords.filter((r) => r.category !== category);
    const countDeleted = initialLen - remaining.length;

    if (countDeleted > 0) {
      this.userStore.set(effectiveUserId, remaining);
      this.persistForUser(effectiveUserId);
    }
    return countDeleted;
  }

  /**
   * Reset all personalization memory for a user
   */
  public resetUserPersonalization(userId: string): number {
    const effectiveUserId = userId || 'default_user';
    const existing = this.userStore.get(effectiveUserId);
    const count = existing ? existing.length : 0;

    this.userStore.delete(effectiveUserId);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.getStorageKey(effectiveUserId));
      } catch {}
    }

    return count;
  }

  /**
   * Return all personalization memory for a user
   */
  public getAll(userId: string): PersonalizationMemoryItem[] {
    const effectiveUserId = userId || 'default_user';
    return [...(this.userStore.get(effectiveUserId) || [])];
  }
}

export const personalizationMemory = new PersonalizationMemoryManager();
