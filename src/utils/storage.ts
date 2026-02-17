import type { Conversation, Folder } from '../types';

const KEYS = {
  API_KEY: 'llmchat:apiKey',
  SELECTED_MODEL: 'llmchat:selectedModel',
  CONVERSATIONS: 'llmchat:conversations',
  ACTIVE_CONVERSATION: 'llmchat:activeConversationId',
  FOLDERS: 'llmchat:folders',
} as const;

const DEFAULT_FOLDER: Folder = {
  id: 'default',
  name: 'Default',
  isDefault: true,
  createdAt: 0,
  isCollapsed: false,
};

// --- API Key ---
export function getStoredApiKey(): string | null {
  return localStorage.getItem(KEYS.API_KEY);
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(KEYS.API_KEY, key);
}

export function clearStoredApiKey(): void {
  localStorage.removeItem(KEYS.API_KEY);
}

// --- Model ---
export function getStoredModel(): string {
  return localStorage.getItem(KEYS.SELECTED_MODEL) ?? 'gpt-4o';
}

export function setStoredModel(model: string): void {
  localStorage.setItem(KEYS.SELECTED_MODEL, model);
}

// --- Conversations ---
export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(KEYS.CONVERSATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    // Migration: assign folderId to any conversation that's missing it
    return parsed.map((c) => {
      const conv = c as Partial<Conversation> & Omit<Conversation, 'folderId'>;
      return 'folderId' in conv ? (conv as Conversation) : { ...conv, folderId: 'default' };
    });
  } catch {
    return [];
  }
}

export function setStoredConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.warn('Failed to persist conversations to localStorage:', e);
  }
}

// --- Folders ---
export function getStoredFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(KEYS.FOLDERS);
    if (!raw) return [DEFAULT_FOLDER];
    const parsed = JSON.parse(raw) as Folder[];
    // Ensure Default folder always exists
    const hasDefault = parsed.some((f) => f.id === 'default');
    return hasDefault ? parsed : [DEFAULT_FOLDER, ...parsed];
  } catch {
    return [DEFAULT_FOLDER];
  }
}

export function setStoredFolders(folders: Folder[]): void {
  try {
    localStorage.setItem(KEYS.FOLDERS, JSON.stringify(folders));
  } catch (e) {
    console.warn('Failed to persist folders to localStorage:', e);
  }
}

// --- Active Conversation ---
export function getActiveConversationId(): string | null {
  return localStorage.getItem(KEYS.ACTIVE_CONVERSATION);
}

export function setActiveConversationId(id: string | null): void {
  if (id === null) {
    localStorage.removeItem(KEYS.ACTIVE_CONVERSATION);
  } else {
    localStorage.setItem(KEYS.ACTIVE_CONVERSATION, id);
  }
}
