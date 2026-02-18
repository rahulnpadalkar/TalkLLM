import { useState, useRef, useEffect } from 'react';
import {
  SquarePen, Trash2, Key, ChevronRight, FolderPlus,
  MoreHorizontal, FolderInput, Check, X, Upload,
} from 'lucide-react';
import type { Conversation, Folder, ModelOption } from '../../types';
import type { useUsageMetrics } from '../../hooks/useUsageMetrics';
import type { ImportedMessage } from '../../hooks/useConversations';
import { ModelSelector } from '../ModelSelector';
import { UsagePanel } from '../UsagePanel';

type UsageMetrics = ReturnType<typeof useUsageMetrics>;

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewChat: (folderId?: string) => void;
  onDelete: (id: string) => void;
  onClearKey: () => void;
  models: ModelOption[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  modelsLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  usageMetrics: UsageMetrics;
  folders: Folder[];
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onMoveConversation: (conversationId: string, targetFolderId: string) => void;
  onImportConversation: (messages: ImportedMessage[], folderId?: string) => void;
}

// ─── Move-to-folder dropdown ──────────────────────────────────────────────────
interface MoveMenuProps {
  folders: Folder[];
  currentFolderId: string;
  onMove: (folderId: string) => void;
  onClose: () => void;
}

function MoveMenu({ folders, currentFolderId, onMove, onClose }: MoveMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl py-1 min-w-[140px]"
    >
      <p className="px-3 py-1 text-xs text-gray-500 font-medium">Move to folder</p>
      {folders
        .filter((f) => f.id !== currentFolderId)
        .map((f) => (
          <button
            key={f.id}
            onClick={() => { onMove(f.id); onClose(); }}
            className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
          >
            {f.name}
          </button>
        ))}
    </div>
  );
}

// ─── Folder actions dropdown ──────────────────────────────────────────────────
interface FolderMenuProps {
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function FolderMenu({ onRename, onDelete, onClose }: FolderMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl py-1 min-w-[120px]"
    >
      <button
        onClick={() => { onRename(); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
      >
        Rename
      </button>
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700 transition-colors"
      >
        Delete
      </button>
    </div>
  );
}

// ─── Conversation row ─────────────────────────────────────────────────────────
interface ConvRowProps {
  conv: Conversation;
  isActive: boolean;
  folders: Folder[];
  onSelect: () => void;
  onDelete: () => void;
  onMove: (folderId: string) => void;
  onClose: () => void;
}

function ConvRow({ conv, isActive, folders, onSelect, onDelete, onMove, onClose }: ConvRowProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <div className={`group relative flex items-center mx-2 mb-0.5 rounded-lg cursor-pointer transition-colors ${
      isActive ? 'bg-gray-700 text-gray-100' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
    }`}>
      <button
        onClick={() => { onSelect(); onClose(); }}
        className="flex-1 text-left px-3 py-2 text-sm truncate"
      >
        {conv.title}
      </button>

      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 mr-1 flex-shrink-0">
        {/* Move to folder */}
        {folders.length > 1 && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMoveMenu((v) => !v); }}
              className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-all"
              title="Move to folder"
            >
              <FolderInput size={13} />
            </button>
            {showMoveMenu && (
              <MoveMenu
                folders={folders}
                currentFolderId={conv.folderId}
                onMove={onMove}
                onClose={() => setShowMoveMenu(false)}
              />
            )}
          </div>
        )}
        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-all"
          title="Delete conversation"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Folder section ────────────────────────────────────────────────────────────
interface FolderSectionProps {
  folder: Folder;
  conversations: Conversation[];
  activeConversationId: string | null;
  allFolders: Folder[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (conversationId: string, folderId: string) => void;
  onNewChat: (folderId: string) => void;
  onRename: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggle: (id: string) => void;
  onClose: () => void;
}

function FolderSection({
  folder, conversations, activeConversationId, allFolders,
  onSelect, onDelete, onMove, onNewChat, onRename, onDeleteFolder, onToggle, onClose,
}: FolderSectionProps) {
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.select();
  }, [isRenaming]);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== folder.name) onRename(folder.id, trimmed);
    setIsRenaming(false);
  };

  const count = conversations.length;

  return (
    <div className="mb-1">
      {/* Folder header */}
      <div className="group flex items-center gap-1 mx-2 rounded-lg hover:bg-gray-800/50 transition-colors">
        {/* Collapse toggle */}
        <button
          onClick={() => onToggle(folder.id)}
          className="flex items-center gap-1.5 flex-1 px-2 py-1.5 text-left min-w-0"
        >
          <ChevronRight
            size={13}
            className={`flex-shrink-0 text-gray-500 transition-transform ${folder.isCollapsed ? '' : 'rotate-90'}`}
          />
          {isRenaming ? (
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setRenameValue(folder.name); setIsRenaming(false); }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-gray-700 text-gray-100 text-xs rounded px-1.5 py-0.5 outline-none border border-gray-500 min-w-0"
            />
          ) : (
            <span className="text-xs font-medium text-gray-400 truncate">
              {folder.name}
              {folder.isCollapsed && count > 0 && (
                <span className="ml-1 text-gray-600">({count})</span>
              )}
            </span>
          )}
        </button>

        {/* Folder actions (shown on hover) */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 pr-1 flex-shrink-0">
          {/* Add chat to this folder */}
          <button
            onClick={(e) => { e.stopPropagation(); onNewChat(folder.id); onClose(); }}
            className="p-1 rounded text-gray-600 hover:text-gray-300 hover:bg-gray-700 transition-all"
            title={`New chat in ${folder.name}`}
          >
            <SquarePen size={12} />
          </button>

          {/* Folder menu (non-default only) */}
          {!folder.isDefault && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowFolderMenu((v) => !v); }}
                className="p-1 rounded text-gray-600 hover:text-gray-300 hover:bg-gray-700 transition-all"
                title="Folder options"
              >
                <MoreHorizontal size={12} />
              </button>
              {showFolderMenu && (
                <FolderMenu
                  onRename={() => { setIsRenaming(true); setRenameValue(folder.name); }}
                  onDelete={() => onDeleteFolder(folder.id)}
                  onClose={() => setShowFolderMenu(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conversations in this folder */}
      {!folder.isCollapsed && (
        <div className="pl-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-700 px-4 py-1">No chats</p>
          ) : (
            conversations.map((conv) => (
              <ConvRow
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConversationId}
                folders={allFolders}
                onSelect={() => onSelect(conv.id)}
                onDelete={() => onDelete(conv.id)}
                onMove={(folderId) => onMove(conv.id, folderId)}
                onClose={onClose}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewChat,
  onDelete,
  onClearKey,
  models,
  selectedModel,
  onSelectModel,
  modelsLoading,
  isOpen,
  onClose,
  usageMetrics,
  folders,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onToggleFolder,
  onMoveConversation,
  onImportConversation,
}: SidebarProps) {
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingFolder) newFolderInputRef.current?.focus();
  }, [isAddingFolder]);

  const commitNewFolder = () => {
    const name = newFolderName.trim();
    if (name) onCreateFolder(name);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-imported if needed
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error('Expected a JSON array.');
        if (parsed.length === 0) throw new Error('The array is empty.');

        const messages: ImportedMessage[] = parsed.map((item: unknown, i: number) => {
          if (typeof item !== 'object' || item === null)
            throw new Error(`Item ${i} is not an object.`);
          const obj = item as Record<string, unknown>;
          if (!['human', 'assistant'].includes(obj.role as string))
            throw new Error(`Item ${i}: "role" must be "human" or "assistant".`);
          if (typeof obj.content !== 'string')
            throw new Error(`Item ${i}: "content" must be a string.`);
          return { role: obj.role as 'human' | 'assistant', content: obj.content };
        });

        setImportError(null);
        onImportConversation(messages);
        onClose();
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Invalid file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 bg-[#171717] flex flex-col border-r border-gray-800 transition-transform duration-200
        lg:relative lg:translate-x-0 lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* New Chat + Import buttons */}
        <div className="p-3 border-b border-gray-800 space-y-1">
          <button
            onClick={() => { onNewChat('default'); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors text-sm"
          >
            <SquarePen size={16} />
            New Chat
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => { setImportError(null); fileInputRef.current?.click(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors text-sm"
          >
            <Upload size={16} />
            Import Conversation
          </button>

          {/* Inline error */}
          {importError && (
            <div className="flex items-start gap-2 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
              <p className="text-xs text-red-400 flex-1">{importError}</p>
              <button onClick={() => setImportError(null)} className="text-red-500 hover:text-red-300 flex-shrink-0">
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Folder list */}
        <div className="flex-1 overflow-y-auto py-2">
          {folders.map((folder) => (
            <FolderSection
              key={folder.id}
              folder={folder}
              conversations={conversations.filter((c) => c.folderId === folder.id)}
              activeConversationId={activeConversationId}
              allFolders={folders}
              onSelect={onSelect}
              onDelete={onDelete}
              onMove={onMoveConversation}
              onNewChat={onNewChat}
              onRename={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              onToggle={onToggleFolder}
              onClose={onClose}
            />
          ))}

          {/* New folder row */}
          <div className="mx-2 mt-1">
            {isAddingFolder ? (
              <div className="flex items-center gap-1 px-2 py-1.5">
                <input
                  ref={newFolderInputRef}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitNewFolder();
                    if (e.key === 'Escape') { setNewFolderName(''); setIsAddingFolder(false); }
                  }}
                  placeholder="Folder name"
                  className="flex-1 bg-gray-700 text-gray-100 text-xs rounded px-2 py-1 outline-none border border-gray-500 placeholder-gray-500"
                />
                <button onClick={commitNewFolder} className="text-green-400 hover:text-green-300 p-0.5">
                  <Check size={13} />
                </button>
                <button
                  onClick={() => { setNewFolderName(''); setIsAddingFolder(false); }}
                  className="text-gray-500 hover:text-gray-300 p-0.5"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingFolder(true)}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors w-full"
              >
                <FolderPlus size={13} />
                New Folder
              </button>
            )}
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800">
          <UsagePanel
            balance={usageMetrics.balance}
            balanceUnavailable={usageMetrics.balanceUnavailable}
            pricing={usageMetrics.pricing}
            isLoadingBalance={usageMetrics.isLoadingBalance}
            balanceError={usageMetrics.balanceError}
            onRefresh={usageMetrics.refreshBalance}
            selectedModel={selectedModel}
          />
          <div className="px-3 pb-3 space-y-2">
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelect={onSelectModel}
              isLoading={modelsLoading}
            />
            <button
              onClick={onClearKey}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors text-xs"
            >
              <Key size={14} />
              Change API Key
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
