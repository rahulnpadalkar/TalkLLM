export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  isStreaming?: boolean;
  error?: string;
}

export interface Folder {
  id: string;          // 'default' for the Default folder
  name: string;
  isDefault: boolean;
  createdAt: number;
  isCollapsed: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  folderId: string;    // which folder this conversation belongs to
}

export interface ModelOption {
  id: string;
  name: string;
}
