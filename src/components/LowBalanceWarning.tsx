import React, { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { botchain } from "../config";
import { Coins, X, ExternalLink } from "lucide-react";

export const LowBalanceWarning: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { data: balanceData } = useBalance({
    address,
    chainId: botchain.id,
  });

  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !isConnected || (chain?.id !== botchain.id && chain?.id !== 31337)) {
    return null;
  }

  // Show if balance is 0 or less than 0.001 BOT
  const isLowBalance =
    balanceData && parseFloat(balanceData.formatted) < 0.001;

  if (!isLowBalance) {
    return null;
  }

  return (
    <div className="bg-sky-500/10 dark:bg-sky-500/15 border-b border-sky-500/20 px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-sky-800 dark:text-sky-300">
          <Coins className="w-4 h-4 flex-shrink-0 text-sky-600 dark:text-sky-400" />
          <span>
            <strong>Low BOT Balance:</strong> You need native <strong>BOT</strong> tokens to cover gas fees for voting and proposing on {botchain.name}.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={botchain.blockExplorers.default.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 font-medium text-sky-700 dark:text-sky-400 hover:underline"
          >
            <span>Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss warning"
            className="p-1 text-sky-600 dark:text-sky-400 hover:text-slate-800 dark:hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
