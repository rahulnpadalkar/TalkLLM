import { useState, useEffect, useCallback } from 'react';
import { fetchCreditBalance, type CreditBalance } from '../utils/billing';
import { getModelPricing, type ModelPricing } from '../utils/pricing';

interface UseUsageMetricsReturn {
  balance: CreditBalance | null;
  balanceUnavailable: boolean; // true when endpoint returned 404/403
  pricing: ModelPricing | null;
  isLoadingBalance: boolean;
  balanceError: string | null;
  refreshBalance: () => void;
}

export function useUsageMetrics(apiKey: string | null, selectedModel: string): UseUsageMetricsReturn {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [balanceUnavailable, setBalanceUnavailable] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    if (!apiKey || balanceUnavailable) return;
    let cancelled = false;
    setIsLoadingBalance(true);
    setBalanceError(null);
    fetchCreditBalance(apiKey)
      .then((result) => {
        if (cancelled) return;
        if (result === null) {
          setBalanceUnavailable(true);
        } else {
          setBalance(result);
        }
      })
      .catch(() => {
        if (!cancelled) setBalanceError('Could not load balance');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBalance(false);
      });
    return () => { cancelled = true; };
  }, [apiKey, fetchTrigger, balanceUnavailable]);

  const refreshBalance = useCallback(() => {
    setBalanceUnavailable(false);
    setFetchTrigger((n) => n + 1);
  }, []);

  const pricing = getModelPricing(selectedModel);

  return {
    balance,
    balanceUnavailable,
    pricing,
    isLoadingBalance,
    balanceError,
    refreshBalance,
  };
}
