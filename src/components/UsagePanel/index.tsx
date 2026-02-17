import { RefreshCw, Wallet, Zap } from 'lucide-react';
import type { CreditBalance, } from '../../utils/billing';
import type { ModelPricing } from '../../utils/pricing';
import { formatPrice } from '../../utils/pricing';
import { Spinner } from '../ui/Spinner';

interface UsagePanelProps {
  balance: CreditBalance | null;
  balanceUnavailable: boolean;
  pricing: ModelPricing | null;
  isLoadingBalance: boolean;
  balanceError: string | null;
  onRefresh: () => void;
  selectedModel: string;
}

export function UsagePanel({
  balance,
  balanceUnavailable,
  pricing,
  isLoadingBalance,
  balanceError,
  onRefresh,
  selectedModel,
}: UsagePanelProps) {
  const usedPct =
    balance && balance.totalGranted > 0
      ? (balance.totalUsed / balance.totalGranted) * 100
      : 0;

  return (
    <div className="border-t border-gray-800 px-3 py-3 space-y-3">
      {/* Balance section */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <Wallet size={12} />
            Credit Balance
          </span>
          <button
            onClick={onRefresh}
            disabled={isLoadingBalance}
            title="Refresh balance"
            className="text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-40"
          >
            {isLoadingBalance
              ? <Spinner size="sm" className="w-3 h-3" />
              : <RefreshCw size={12} />
            }
          </button>
        </div>

        {balanceError && (
          <p className="text-xs text-red-400">{balanceError}</p>
        )}

        {balanceUnavailable && !balanceError && (
          <p className="text-xs text-gray-600 italic">Not available for this account</p>
        )}

        {balance && !balanceUnavailable && (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-gray-200">
                ${balance.totalAvailable.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">
                of ${balance.totalGranted.toFixed(2)}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usedPct > 80 ? 'bg-red-500' : usedPct > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usedPct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              ${balance.totalUsed.toFixed(2)} used
            </p>
          </>
        )}

        {!balance && !balanceUnavailable && !balanceError && !isLoadingBalance && (
          <p className="text-xs text-gray-600">—</p>
        )}
      </div>

      {/* Pricing section */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Zap size={12} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-400 truncate" title={selectedModel}>
            {selectedModel}
          </span>
        </div>

        {pricing ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Input</span>
              <span className="text-gray-300 font-mono">{formatPrice(pricing.input)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Output</span>
              <span className="text-gray-300 font-mono">{formatPrice(pricing.output)}</span>
            </div>
            {pricing.cachedInput !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Cached</span>
                <span className="text-gray-300 font-mono">{formatPrice(pricing.cachedInput)}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-600 italic">Pricing not available</p>
        )}
      </div>
    </div>
  );
}
