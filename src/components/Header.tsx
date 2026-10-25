import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { botchain, CONTRACT_ADDRESS, addressUrl } from "../config";
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  ExternalLink,
  Sun,
  Moon,
  Shield,
  Layers,
} from "lucide-react";

interface HeaderProps {
  onOpenCreate?: () => void;
  isOwner?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreate, isOwner }) => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address,
    chainId: botchain.id,
  });

  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme preference
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formattedBalance = balanceData
    ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
    : "0.0000 BOT";

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(
      (c) => c.name.toLowerCase().includes("metamask") || c.id === "injected"
    );
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-civic-darkBg/80 border-b border-civic-lightBorder dark:border-civic-darkBorder transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-glow">
            <Shield className="w-5 h-5 text-slate-950 fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xl tracking-tight text-slate-900 dark:text-white">
                Concord
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Civic Governance
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
              One Address = One Vote
            </p>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          {/* Network Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{botchain.name}</span>
            <span className="font-mono text-[10px] text-emerald-600/70 dark:text-emerald-400/60">
              (ID 968)
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors duration-fast focus-ring"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Wallet Section */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-sm transition-all duration-fast shadow-glow active:scale-[0.98] focus-ring"
            >
              <Wallet className="w-4 h-4 text-slate-950" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Balance Badge */}
              <div className="hidden lg:flex flex-col items-end px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  Balance
                </span>
                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {formattedBalance}
                </span>
              </div>

              {/* Address Pill & Actions */}
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                <button
                  onClick={handleCopy}
                  title="Copy address"
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus-ring"
                >
                  <span>{address ? shortenAddress(address) : ""}</span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {address && (
                  <a
                    href={addressUrl(address)}
                    target="_blank"
                    rel="noreferrer"
                    title="View address on BotChain Scan"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus-ring"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => disconnect()}
                  title="Disconnect wallet"
                  className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors focus-ring"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
