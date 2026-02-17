import { useState, useRef, useCallback } from 'react';
import type { Conversation, Message } from '../types';
import { getOpenAIClient, parseOpenAIError } from '../utils/openai';

interface UseChatReturn {
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  clearError: () => void;
}

export function useChat(
  apiKey: string,
  selectedModel: string,
  activeConversation: Conversation | undefined,
  updateConversation: (id: string, updates: Partial<Omit<Conversation, 'id' | 'createdAt'>>) => void,
  createConversation: (model: string) => Conversation
): UseChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Ref to always have the latest messages without stale closures during streaming
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = activeConversation?.messages ?? [];

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading || isStreaming) return;

      setError(null);
      setIsLoading(true);

      // Get or create conversation
      let conversation = activeConversation;
      if (!conversation) {
        conversation = createConversation(selectedModel);
      }
      const conversationId = conversation.id;

      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
      };

      const isFirstMessage = messagesRef.current.length === 0;
      const updatedMessages = [...messagesRef.current, userMessage];
      messagesRef.current = updatedMessages;

      updateConversation(conversationId, {
        messages: updatedMessages,
        title: isFirstMessage ? trimmed.slice(0, 50) : conversation.title,
      });

      // Add assistant placeholder
      const assistantId = crypto.randomUUID();
      const assistantPlaceholder: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        isStreaming: true,
      };

      const withPlaceholder = [...updatedMessages, assistantPlaceholder];
      messagesRef.current = withPlaceholder;
      updateConversation(conversationId, { messages: withPlaceholder });

      // Build messages payload for API (exclude isStreaming/error fields)
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const client = getOpenAIClient(apiKey);
        const stream = await client.chat.completions.create(
          {
            model: selectedModel,
            messages: apiMessages,
            stream: true,
          },
          { signal: abortController.signal }
        );

        setIsLoading(false);
        setIsStreaming(true);

        let accumulated = '';

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            accumulated += delta;
            // Always use messagesRef.current to avoid stale closure
            const current = messagesRef.current.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            );
            messagesRef.current = current;
            updateConversation(conversationId, { messages: current });
          }
        }

        // Mark streaming done
        const final = messagesRef.current.map((m) =>
          m.id === assistantId ? { ...m, content: accumulated, isStreaming: false } : m
        );
        messagesRef.current = final;
        updateConversation(conversationId, { messages: final });
      } catch (err) {
        const errorMsg = parseOpenAIError(err);
        if (errorMsg) {
          // Mark assistant placeholder as error
          const errMessages = messagesRef.current.map((m) =>
            m.id === assistantId
              ? { ...m, content: '', isStreaming: false, error: errorMsg }
              : m
          );
          messagesRef.current = errMessages;
          updateConversation(conversationId, { messages: errMessages });
          setError(errorMsg);
        } else {
          // Aborted by user — keep partial content
          const aborted = messagesRef.current.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          );
          messagesRef.current = aborted;
          updateConversation(conversationId, { messages: aborted });
        }
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [apiKey, selectedModel, activeConversation, isLoading, isStreaming, updateConversation, createConversation]
  );

  return {
    sendMessage,
    stopStreaming,
    isLoading,
    isStreaming,
    error,
    clearError: () => setError(null),
  };
}
