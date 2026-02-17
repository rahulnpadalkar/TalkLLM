import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { ModelOption } from '../../types';
import { Spinner } from '../ui/Spinner';

interface ModelSelectorProps {
  models: ModelOption[];
  selectedModel: string;
  onSelect: (modelId: string) => void;
  isLoading: boolean;
}

export function ModelSelector({ models, selectedModel, onSelect, isLoading }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const selectedLabel = models.find((m) => m.id === selectedModel)?.name ?? selectedModel;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-gray-300 hover:text-gray-100 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors w-full"
      >
        {isLoading ? (
          <Spinner size="sm" className="text-gray-400" />
        ) : null}
        <span className="flex-1 text-left truncate font-mono text-xs">{selectedLabel}</span>
        <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-gray-800 border border-gray-600 rounded-xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
          {models.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No models found</div>
          ) : (
            models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors text-left"
              >
                <span className="font-mono text-xs">{model.id}</span>
                {model.id === selectedModel && <Check size={14} className="text-green-400" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
