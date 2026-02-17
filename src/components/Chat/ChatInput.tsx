import { useRef, useState, useCallback } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading || isStreaming) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isLoading, isStreaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const isBusy = isLoading || isStreaming;
  const canSend = value.trim().length > 0 && !isBusy && !disabled;

  return (
    <div className="border-t border-gray-700 bg-[#212121] px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-gray-800 rounded-2xl border border-gray-600 px-4 py-3 focus-within:border-gray-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            rows={1}
            disabled={disabled || isLoading}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none text-sm leading-6 max-h-[200px] overflow-y-auto"
          />
          {isBusy ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200 transition-colors"
              title="Stop generating"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!canSend}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-900 hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
              title="Send message"
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
