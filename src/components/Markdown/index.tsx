import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import type { Components } from 'react-markdown';

interface CodeCopyButtonProps {
  text: string;
}

function CodeCopyButton({ text }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
      title="Copy code"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

const components: Components = {
  code(props) {
    const { children, className } = props;
    const match = /language-(\w+)/.exec(className ?? '');
    const language = match?.[1] ?? '';
    const codeText = String(children).replace(/\n$/, '');

    // Inline code detection: no className means inline
    if (!className) {
      return (
        <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    }

    return (
      <div className="rounded-lg overflow-hidden border border-gray-700 my-3">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-xs text-gray-400 font-mono">{language || 'code'}</span>
          <CodeCopyButton text={codeText} />
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: 'transparent',
            padding: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {codeText}
        </SyntaxHighlighter>
      </div>
    );
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
        {children}
      </a>
    );
  },
};

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  isStreaming,
}: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none chat-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
      {isStreaming && content === '' && null}
      {isStreaming && <span className="streaming-cursor" />}
    </div>
  );
});
