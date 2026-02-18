import { useState } from 'react';
import { Menu } from 'lucide-react';
import type { Conversation, ModelOption } from '../../types';
import type { ImportedMessage } from '../../hooks/useConversations';
import { useUsageMetrics } from '../../hooks/useUsageMetrics';
import { useFolders } from '../../hooks/useFolders';
import { Sidebar } from './Sidebar';
import { Chat } from '../Chat';

interface LayoutProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | undefined;
  onSelectConversation: (id: string) => void;
  onNewChat: (folderId?: string) => void;
  onDeleteConversation: (id: string) => void;
  onClearKey: () => void;
  models: ModelOption[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  modelsLoading: boolean;
  apiKey: string;
  updateConversation: (id: string, updates: Partial<Omit<Conversation, 'id' | 'createdAt'>>) => void;
  createConversation: (model: string, folderId?: string) => Conversation;
  moveConversation: (conversationId: string, targetFolderId: string) => void;
  moveConversationsToFolder: (fromFolderId: string, toFolderId: string) => void;
  onImportConversation: (messages: ImportedMessage[], folderId?: string) => void;
}

export function Layout({
  conversations,
  activeConversationId,
  activeConversation,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearKey,
  models,
  selectedModel,
  onSelectModel,
  modelsLoading,
  apiKey,
  updateConversation,
  createConversation,
  moveConversation,
  moveConversationsToFolder,
  onImportConversation,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const usageMetrics = useUsageMetrics(apiKey, selectedModel);
  const { folders, createFolder, renameFolder, deleteFolder, toggleCollapsed } = useFolders();

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id, moveConversationsToFolder);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#212121]">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={onSelectConversation}
        onNewChat={onNewChat}
        onDelete={onDeleteConversation}
        onClearKey={onClearKey}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
        modelsLoading={modelsLoading}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        usageMetrics={usageMetrics}
        folders={folders}
        onCreateFolder={createFolder}
        onRenameFolder={renameFolder}
        onDeleteFolder={handleDeleteFolder}
        onToggleFolder={toggleCollapsed}
        onMoveConversation={moveConversation}
        onImportConversation={onImportConversation}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium text-gray-300">
            {activeConversation?.title ?? 'TalkLLM'}
          </span>
        </header>

        <Chat
          apiKey={apiKey}
          selectedModel={selectedModel}
          activeConversation={activeConversation}
          updateConversation={updateConversation}
          createConversation={createConversation}
        />
      </div>
    </div>
  );
}
