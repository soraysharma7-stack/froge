import { MemoryRecord } from './types';
import {
  frogeMemoryEngine,
  FrogeModularMemoryEngine,
  conversationMemory,
  personalizationMemory,
  appDataMemory,
  runFrogeMemoryTestSuite,
} from './memory/index';
import { inspectMemorySafety } from './curriculum/twelveAreaCognitiveCore';

export * from './memory/index';

/**
 * FROGÉ Brain - Backward-Compatible Memory Adapter
 * Delegates to the modular 3-tier memory architecture (Conversation, Personalization, App/Data).
 */
class BrainMemoryManager {
  private engine: FrogeModularMemoryEngine;

  constructor() {
    this.engine = frogeMemoryEngine;
  }

  public queryMemory(queryText: string, userId = 'default_user'): MemoryRecord[] {
    const unified = this.engine.queryAll({
      userId,
      queryText,
    });

    const records: MemoryRecord[] = [];

    // Map personalization records
    unified.personalizationRecords.forEach((p) => {
      records.push({
        id: p.id,
        timestamp: p.updatedAt,
        key: p.key,
        content: p.value,
        category: p.category === 'preference' ? 'preference' : 'instruction',
        relevanceScore: p.confidence,
      });
    });

    // Map app data records
    unified.appDataRecords.forEach((a) => {
      const contentStr = typeof a.data === 'string' ? a.data : JSON.stringify(a.data);
      records.push({
        id: a.id,
        timestamp: a.updatedAt,
        key: a.key,
        content: contentStr,
        category: 'fact',
        relevanceScore: 0.9,
      });
    });

    // Map conversation turns
    unified.conversationContext.forEach((c) => {
      records.push({
        id: c.id,
        timestamp: c.timestamp,
        key: `turn_${c.role}`,
        content: c.content,
        category: 'fact',
        relevanceScore: 0.8,
      });
    });

    return records;
  }

  public queryMemories(queryText: string, userId = 'default_user'): MemoryRecord[] {
    return this.queryMemory(queryText, userId);
  }

  public storeMemory(
    key: string,
    content: string,
    category: MemoryRecord['category'] = 'fact',
    userId = 'default_user'
  ): MemoryRecord {
    // Area 10 Memory Safety Gate: Never persist passwords, API keys, tokens, card numbers, or government IDs
    const safety = inspectMemorySafety(`${key} ${content}`);
    if (!safety.allowed) {
      return {
        id: `mem_blocked_${Date.now()}`,
        timestamp: Date.now(),
        key: 'blocked_sensitive_secret',
        content: safety.reason || 'Sensitive credential blocked from memory persistence.',
        category,
        relevanceScore: 0,
      };
    }

    if (category === 'preference' || category === 'instruction') {
      const p = this.engine.rememberPreference(
        userId,
        key,
        content,
        category === 'preference' ? 'preference' : 'custom_instruction'
      );
      return {
        id: p?.id || `mem_${Date.now()}`,
        timestamp: p?.updatedAt || Date.now(),
        key,
        content,
        category,
        relevanceScore: p?.confidence || 0.9,
      };
    } else {
      const a = this.engine.rememberAppData(
        userId,
        'knowledge_base',
        key,
        content,
        'verified_fact'
      );
      return {
        id: a?.id || `mem_${Date.now()}`,
        timestamp: a?.updatedAt || Date.now(),
        key,
        content,
        category: 'fact',
        relevanceScore: 0.9,
      };
    }
  }

  public getAll(userId = 'default_user'): MemoryRecord[] {
    return this.queryMemory('', userId);
  }

  public getAllMemories(userId = 'default_user'): MemoryRecord[] {
    return this.getAll(userId);
  }

  public getModularEngine(): FrogeModularMemoryEngine {
    return this.engine;
  }
}

export const brainMemory = new BrainMemoryManager();
