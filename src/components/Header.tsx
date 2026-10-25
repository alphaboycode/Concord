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
  FileText,
  Activity,
  PlusCircle,
} from "lucide-react";

interface HeaderProps {
  onOpenCreate?: () => void;
  isOwner?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreate, isOwner }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address,
    chainId: botchain.id,
  });

  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-[#070A10]/90 border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_-4px_rgba(0,0,0,0.6)] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo Area */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-200" />
            <div className="relative w-11 h-11 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-center text-white shadow-inner">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white bg-clip-text">
                Concord
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Civic DAO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
              One Address = One Vote &bull; Gas-Optimized
            </p>
          </div>
        </div>

        {/* Center / Navigation Shortcuts */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <a
            href="/Concord_Pitch_Deck.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Pitch Deck</span>
          </a>

          <a
            href={`https://scan.bohr.life/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-500" />
            <span>Explorer</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          {isOwner && onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Proposal</span>
            </button>
          )}
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          {/* Network Badge with Pulsing Ping */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold">{botchain.name}</span>
            <span className="font-mono text-[10px] text-emerald-600/80 dark:text-emerald-400/70 bg-emerald-500/20 px-1.5 py-0.5 rounded">
              968
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all focus-ring"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Wallet Section */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-glow active:scale-[0.98] focus-ring"
            >
              <Wallet className="w-4 h-4 text-slate-950" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Balance Badge */}
              <div className="hidden sm:flex flex-col items-end px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
                  Gas Balance
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formattedBalance}
                </span>
              </div>

              {/* Address Pill & Actions */}
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-1 shadow-sm">
                <button
                  onClick={handleCopy}
                  title="Copy address"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors focus-ring"
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
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus-ring"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => disconnect()}
                  title="Disconnect wallet"
                  className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors focus-ring"
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
