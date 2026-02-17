import { MessageSquarePlus } from 'lucide-react';
import type { Conversation } from '../../types';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface ChatProps {
  apiKey: string;
  selectedModel: string;
  activeConversation: Conversation | undefined;
  updateConversation: (id: string, updates: Partial<Omit<Conversation, 'id' | 'createdAt'>>) => void;
  createConversation: (model: string) => Conversation;
}

export function Chat({
  apiKey,
  selectedModel,
  activeConversation,
  updateConversation,
  createConversation,
}: ChatProps) {
  const { sendMessage, stopStreaming, isLoading, isStreaming, error } = useChat(
    apiKey,
    selectedModel,
    activeConversation,
    updateConversation,
    createConversation
  );

  const messages = activeConversation?.messages ?? [];
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Error banner */}
      {error && (
        <div className="bg-red-900/40 border-b border-red-700 px-4 py-2 text-sm text-red-300 text-center">
          {error}
        </div>
      )}

      {/* Messages or welcome screen */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4 px-4">
          <MessageSquarePlus size={48} strokeWidth={1} />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-400">How can I help you today?</p>
            <p className="text-sm mt-1">Using <span className="text-gray-300 font-mono">{selectedModel}</span></p>
          </div>
        </div>
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
        isLoading={isLoading}
      />
    </div>
  );
}
