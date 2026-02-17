import { useState, useCallback } from 'react';
import type { Folder } from '../types';
import { getStoredFolders, setStoredFolders } from '../utils/storage';

interface UseFoldersReturn {
  folders: Folder[];
  createFolder: (name: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string, onMoveConversations: (fromId: string, toId: string) => void) => void;
  toggleCollapsed: (id: string) => void;
}

export function useFolders(): UseFoldersReturn {
  const [folders, setFolders] = useState<Folder[]>(getStoredFolders);

  const persist = useCallback((updated: Folder[]) => {
    setStoredFolders(updated);
  }, []);

  const createFolder = useCallback((name: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: name.trim() || 'New Folder',
      isDefault: false,
      createdAt: Date.now(),
      isCollapsed: false,
    };
    setFolders((prev) => {
      const updated = [...prev, newFolder];
      persist(updated);
      return updated;
    });
  }, [persist]);

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders((prev) => {
      const updated = prev.map((f) =>
        f.id === id && !f.isDefault ? { ...f, name: name.trim() || f.name } : f
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  const deleteFolder = useCallback((
    id: string,
    onMoveConversations: (fromId: string, toId: string) => void
  ) => {
    setFolders((prev) => {
      const folder = prev.find((f) => f.id === id);
      if (!folder || folder.isDefault) return prev; // can't delete Default
      // Move conversations to Default before removing folder
      onMoveConversations(id, 'default');
      const updated = prev.filter((f) => f.id !== id);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const toggleCollapsed = useCallback((id: string) => {
    setFolders((prev) => {
      const updated = prev.map((f) =>
        f.id === id ? { ...f, isCollapsed: !f.isCollapsed } : f
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  return { folders, createFolder, renameFolder, deleteFolder, toggleCollapsed };
}
