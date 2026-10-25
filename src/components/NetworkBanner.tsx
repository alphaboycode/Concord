import React, { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { botchain } from "../config";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

export const NetworkBanner: React.FC = () => {
  const { isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If not connected, or already on BotChain (or Anvil local 31337 for dev), don't show
  if (!isConnected || chain?.id === botchain.id || chain?.id === 31337) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    setErrorMsg(null);

    try {
      if (switchChainAsync) {
        await switchChainAsync({ chainId: botchain.id });
        setIsSwitching(false);
        return;
      }
    } catch (switchError: any) {
      console.warn("switchChain error, attempting wallet_addEthereumChain:", switchError);
    }

    // Fallback: window.ethereum wallet_addEthereumChain
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${botchain.id.toString(16)}` }],
          });
        } catch (switchErr: any) {
          // Error 4902 means the chain has not been added to MetaMask
          if (switchErr.code === 4902 || switchErr.message?.includes("Unrecognized chain")) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${botchain.id.toString(16)}`,
                  chainName: botchain.name,
                  nativeCurrency: botchain.nativeCurrency,
                  rpcUrls: botchain.rpcUrls.default.http,
                  blockExplorerUrls: [botchain.blockExplorers.default.url],
                },
              ],
            });
          } else {
            throw switchErr;
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to add/switch network:", err);
      setErrorMsg(err?.message || "Failed to switch network in wallet");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center space-x-2.5 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            You are connected to an unsupported network (
            <span className="font-mono font-medium">{chain?.name || `Chain ${chain?.id}`}</span>
            ). Concord is deployed on <strong>{botchain.name}</strong>.
          </span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          {errorMsg && (
            <span className="text-xs text-rose-500 truncate max-w-xs">{errorMsg}</span>
          )}
          <button
            onClick={handleSwitchNetwork}
            disabled={isSwitching}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors duration-fast shadow-sm disabled:opacity-50 focus-ring"
          >
            {isSwitching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Switching...</span>
              </>
            ) : (
              <>
                <span>Switch to {botchain.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
