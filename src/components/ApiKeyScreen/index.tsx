import { useState } from 'react';
import { Eye, EyeOff, Key } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

interface ApiKeyScreenProps {
  onKeySaved: () => void;
  saveApiKey: (key: string) => Promise<boolean>;
  isValidating: boolean;
  validationError: string | null;
}

export function ApiKeyScreen({
  onKeySaved,
  saveApiKey,
  isValidating,
  validationError,
}: ApiKeyScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveApiKey(inputValue);
    if (success) onKeySaved();
  };

  return (
    <div className="min-h-screen bg-[#212121] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-800 mb-4">
            <Key size={28} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-100">LLMChat</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Enter your OpenAI API key to start chatting
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="sk-..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationError && (
                <p className="mt-2 text-sm text-red-400">{validationError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isValidating || !inputValue.trim()}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 rounded-lg py-3 text-sm font-medium hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
            >
              {isValidating ? (
                <>
                  <Spinner size="sm" />
                  Validating…
                </>
              ) : (
                'Save & Continue'
              )}
            </button>
          </form>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Your key is stored only in your browser's localStorage and never sent to any server
          other than OpenAI.{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-300 underline"
          >
            Get a key →
          </a>
        </p>
      </div>
    </div>
  );
}
