import { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import type { Message } from '../../types';
import { MarkdownRenderer } from '../Markdown';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[75%] bg-gray-700 rounded-2xl rounded-tr-sm px-4 py-3 text-gray-100 text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="group flex items-start gap-3 px-4 py-4">
      <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
        AI
      </div>
      <div className="flex-1 min-w-0">
        {message.error ? (
          <div className="flex items-start gap-2 text-red-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{message.error}</span>
          </div>
        ) : (
          <>
            <MarkdownRenderer
              content={message.content}
              isStreaming={message.isStreaming}
            />
            {!message.isStreaming && message.content && (
              <button
                onClick={handleCopy}
                className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
