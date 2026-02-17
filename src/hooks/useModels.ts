import { useState, useEffect, useCallback } from 'react';
import type { ModelOption } from '../types';
import { fetchChatModels } from '../utils/openai';
import { getStoredModel, setStoredModel } from '../utils/storage';

const FALLBACK_MODEL = 'gpt-4o';

interface UseModelsReturn {
  models: ModelOption[];
  selectedModel: string;
  isLoading: boolean;
  error: string | null;
  setSelectedModel: (model: string) => void;
  refetch: () => void;
}

export function useModels(apiKey: string | null): UseModelsReturn {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModelState] = useState<string>(getStoredModel);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchChatModels(apiKey)
      .then((fetched) => {
        if (cancelled) return;
        setModels(fetched);
        // Validate stored model still exists
        const storedModel = getStoredModel();
        const exists = fetched.some((m) => m.id === storedModel);
        if (!exists && fetched.length > 0) {
          const fallback = fetched.find((m) => m.id === FALLBACK_MODEL) ?? fetched[0];
          setSelectedModelState(fallback.id);
          setStoredModel(fallback.id);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load models.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, fetchTrigger]);

  const setSelectedModel = useCallback((model: string) => {
    setSelectedModelState(model);
    setStoredModel(model);
  }, []);

  const refetch = useCallback(() => {
    setFetchTrigger((n) => n + 1);
  }, []);

  return { models, selectedModel, isLoading, error, setSelectedModel, refetch };
}
