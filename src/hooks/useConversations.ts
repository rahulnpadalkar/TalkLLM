import { useState, useCallback } from 'react';
import type { Conversation, Message } from '../types';
import {
  getStoredConversations,
  setStoredConversations,
  getActiveConversationId,
  setActiveConversationId,
} from '../utils/storage';

export interface ImportedMessage {
  role: 'human' | 'assistant';
  content: string;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | undefined;
  createConversation: (model: string, folderId?: string) => Conversation;
  importConversation: (messages: ImportedMessage[], model: string, folderId?: string) => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  updateConversation: (id: string, updates: Partial<Omit<Conversation, 'id' | 'createdAt'>>) => void;
  moveConversation: (conversationId: string, targetFolderId: string) => void;
  moveConversationsToFolder: (fromFolderId: string, toFolderId: string) => void;
  clearAllConversations: () => void;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>(getStoredConversations);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(
    getActiveConversationId
  );

  const persist = useCallback((convs: Conversation[]) => {
    setStoredConversations(convs);
  }, []);

  const createConversation = useCallback((model: string, folderId = 'default'): Conversation => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      model,
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => {
      const updated = [newConv, ...prev];
      persist(updated);
      return updated;
    });
    setActiveConversationIdState(newConv.id);
    setActiveConversationId(newConv.id);
    return newConv;
  }, [persist]);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationIdState(id);
    setActiveConversationId(id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      persist(updated);
      return updated;
    });
    setActiveConversationIdState((current) => {
      if (current !== id) return current;
      // Select most recent remaining conversation
      const remaining = conversations.filter((c) => c.id !== id);
      const next = remaining[0]?.id ?? null;
      setActiveConversationId(next);
      return next;
    });
  }, [conversations, persist]);

  const updateConversation = useCallback(
    (id: string, updates: Partial<Omit<Conversation, 'id' | 'createdAt'>>) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
        );
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const importConversation = useCallback((
    importedMessages: ImportedMessage[],
    model: string,
    folderId = 'default'
  ) => {
    const now = Date.now();
    const messages: Message[] = importedMessages.map((m, i) => ({
      id: crypto.randomUUID(),
      role: m.role === 'human' ? 'user' : 'assistant',
      content: m.content,
      createdAt: now + i,
    }));
    const firstUserMsg = importedMessages.find((m) => m.role === 'human')?.content ?? 'Imported Chat';
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: firstUserMsg.slice(0, 50).replace(/\n/g, ' '),
      messages,
      model,
      folderId,
      createdAt: now,
      updatedAt: now,
    };
    setConversations((prev) => {
      const updated = [newConv, ...prev];
      persist(updated);
      return updated;
    });
    setActiveConversationIdState(newConv.id);
    setActiveConversationId(newConv.id);
  }, [persist]);

  const moveConversation = useCallback((conversationId: string, targetFolderId: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === conversationId ? { ...c, folderId: targetFolderId } : c
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  const moveConversationsToFolder = useCallback((fromFolderId: string, toFolderId: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.folderId === fromFolderId ? { ...c, folderId: toFolderId } : c
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearAllConversations = useCallback(() => {
    setConversations([]);
    persist([]);
    setActiveConversationIdState(null);
    setActiveConversationId(null);
  }, [persist]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return {
    conversations,
    activeConversationId,
    activeConversation,
    createConversation,
    importConversation,
    selectConversation,
    deleteConversation,
    updateConversation,
    moveConversation,
    moveConversationsToFolder,
    clearAllConversations,
  };
}

// Re-export Message type for consumers
export type { Message };
