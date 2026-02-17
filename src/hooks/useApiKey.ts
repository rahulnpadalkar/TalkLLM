import { useState, useCallback } from 'react';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../utils/storage';
import { validateApiKey } from '../utils/openai';

interface UseApiKeyReturn {
  apiKey: string | null;
  isValidating: boolean;
  validationError: string | null;
  saveApiKey: (key: string) => Promise<boolean>;
  clearApiKey: () => void;
  isKeySet: boolean;
}

export function useApiKey(): UseApiKeyReturn {
  const [apiKey, setApiKey] = useState<string | null>(getStoredApiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const saveApiKey = useCallback(async (key: string): Promise<boolean> => {
    const trimmed = key.trim();
    if (!trimmed) {
      setValidationError('Please enter an API key.');
      return false;
    }
    setIsValidating(true);
    setValidationError(null);
    try {
      const valid = await validateApiKey(trimmed);
      if (valid) {
        setStoredApiKey(trimmed);
        setApiKey(trimmed);
        return true;
      } else {
        setValidationError('Invalid API key. Please check and try again.');
        return false;
      }
    } catch {
      setValidationError('Could not reach OpenAI. Check your internet connection.');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearApiKey = useCallback(() => {
    clearStoredApiKey();
    setApiKey(null);
    setValidationError(null);
  }, []);

  return {
    apiKey,
    isValidating,
    validationError,
    saveApiKey,
    clearApiKey,
    isKeySet: apiKey !== null,
  };
}
