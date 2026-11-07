import { Conversation, FrogeModeId } from '../types';

const STORAGE_KEY = 'froge_app1_conversations';
const ACTIVE_CHAT_KEY = 'froge_app1_active_chat';
const ACTIVE_MODE_KEY = 'froge_app1_active_mode';
const ACTIVE_MODEL_KEY = 'froge_app1_active_model';

export const getStoredActiveModel = (): string => {
  try {
    const model = localStorage.getItem(ACTIVE_MODEL_KEY);
    if (model && !model.includes('claude') && !model.includes('openai')) {
      return model;
    }
  } catch {}
  return 'fog-neural-core-v3';
};

export const setStoredActiveModel = (modelId: string): void => {
  try {
    localStorage.setItem(ACTIVE_MODEL_KEY, modelId);
  } catch {}
};

export const getStoredConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c) => c && typeof c === 'object')
      .map((c: any) => ({
        ...c,
        messages: Array.isArray(c.messages) ? c.messages.filter(Boolean) : [],
      }));
  } catch (error) {
    console.error('Failed to load conversations from localStorage', error);
    return [];
  }
};

export const saveConversations = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversations to localStorage', error);
  }
};

export const getStoredActiveChatId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_CHAT_KEY);
  } catch {
    return null;
  }
};

export const setStoredActiveChatId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CHAT_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  } catch {}
};

export const getStoredMode = (): FrogeModeId => {
  try {
    const mode = localStorage.getItem(ACTIVE_MODE_KEY) as FrogeModeId;
    if (mode && [
      'simple-chat',
      'deep-thinking',
      'froge-code',
      'max',
      'student-mode',
    ].includes(mode)) {
      return mode;
    }
  } catch {}
  return 'simple-chat';
};

export const setStoredMode = (mode: FrogeModeId): void => {
  try {
    localStorage.setItem(ACTIVE_MODE_KEY, mode);
  } catch {}
};

export const createNewConversation = (
  mode: FrogeModeId = 'simple-chat',
  title = 'New Conversation'
): Conversation => {
  const timestamp = Date.now();
  return {
    id: `chat_${timestamp}_${Math.random().toString(36).substring(2, 9)}`,
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    mode,
    messages: [],
  };
};

export const groupConversationsByDate = (conversations: Conversation[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const last7Days = today - 86400000 * 7;
  const last30Days = today - 86400000 * 30;

  const groups: {
    pinned: Conversation[];
    today: Conversation[];
    yesterday: Conversation[];
    previous7Days: Conversation[];
    previous30Days: Conversation[];
    older: Conversation[];
  } = {
    pinned: [],
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: [],
  };

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  for (const chat of sorted) {
    if (chat.isPinned) {
      groups.pinned.push(chat);
      continue;
    }

    const t = chat.updatedAt;
    if (t >= today) {
      groups.today.push(chat);
    } else if (t >= yesterday) {
      groups.yesterday.push(chat);
    } else if (t >= last7Days) {
      groups.previous7Days.push(chat);
    } else if (t >= last30Days) {
      groups.previous30Days.push(chat);
    } else {
      groups.older.push(chat);
    }
  }

  return groups;
};
