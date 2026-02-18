import { useState } from "react";
import { Eye, EyeOff, Key, Lock, Github } from "lucide-react";
import { Spinner } from "../ui/Spinner";

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
  const [inputValue, setInputValue] = useState("");
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
          <h1 className="text-2xl font-semibold text-gray-100">TalkLLM</h1>
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
                  type={showKey ? "text" : "password"}
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
                "Save & Continue"
              )}
            </button>
          </form>
        </div>

        {/* Trust callouts */}
        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2.5 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3">
            <Lock size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Your key is stored only in your browser's localStorage and sent
              exclusively to{" "}
              <span className="text-gray-300">api.openai.com</span>. No backend,
              no tracking.{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white underline underline-offset-2"
              >
                Get a key →
              </a>
            </p>
          </div>

          <div className="flex items-start gap-2.5 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3">
            <Github size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              TalkLLM is{" "}
              <a
                href="https://github.com/rahulnpadalkar/TalkLLM"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white underline underline-offset-2"
              >
                open source
              </a>
              . Anyone can read the code and verify exactly what it does with
              your key. The codebase has also been{" "}
              <a
                href="https://claude.ai/share/e9c5f811-6c24-47cf-a4b4-47dccbcc80ef"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white underline underline-offset-2"
              >
                audited by Claude
              </a>{" "}
              — you can read through the full session to see exactly how it was
              built and reviewed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
