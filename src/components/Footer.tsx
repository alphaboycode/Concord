import React, { useState } from "react";
import { botchain, CONTRACT_ADDRESS, addressUrl } from "../config";
import {
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Activity,
  Globe,
  Search,
} from "lucide-react";

export const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyContract = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDeployed =
    CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-civic-darkBorder bg-white/70 dark:bg-civic-darkBg/95 backdrop-blur-xl transition-all duration-200 mt-auto">
      {/* Upper Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Description */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30 shadow-sm flex items-center justify-center bg-slate-900">
                <img
                  src="/concord.jpeg"
                  alt="Concord Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Concord Governance
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Egalitarian, gas-optimized governance protocol purpose-built for the BotChain ecosystem.
              Enforcing one vote per address, zero whale plutocracy, and 100% on-chain verifiable consensus.
            </p>

            <div className="flex items-center space-x-3 pt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="inline-flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">BotChain RPC Active</span>
              </span>
              <span>&bull;</span>
              <span>Chain ID: {botchain.id}</span>
              <span>&bull;</span>
              <span>Gas Token: {botchain.nativeCurrency.symbol}</span>
            </div>
          </div>

          {/* Col 2: Proof on bot mainnet */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
                Proof on bot mainnet
              </h4>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Chain id:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">677</span>
              </div>

              {isDeployed ? (
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-mono">Contract:</div>
                  <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 font-mono">
                    <span className="text-slate-700 dark:text-slate-200 text-[11px] truncate" title={CONTRACT_ADDRESS}>
                      {CONTRACT_ADDRESS}
                    </span>
                    <button
                      onClick={handleCopyContract}
                      title="Copy Contract Address"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-auto flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={addressUrl(CONTRACT_ADDRESS)}
                      target="_blank"
                      rel="noreferrer"
                      title="View on BOTScan explorer"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Contract: {CONTRACT_ADDRESS}</p>
              )}
            </div>
          </div>

          {/* Col 3: Links & Resources */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
              Protocol Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/Concord_Pitch_Deck.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pitch Deck (PDF)</span>
                </a>
              </li>
              <li>
                <a
                  href={addressUrl(CONTRACT_ADDRESS)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>BOTScan Explorer</span>
                </a>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                  RPC: https://rpc.botchain.ai
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="border-t border-slate-200/80 dark:border-civic-darkBorder my-8" />

        {/* PART OF THE ECOSYSTEM Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto pt-2 pb-6">
          <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs tracking-[0.25em] uppercase font-mono">
            PART OF THE ECOSYSTEM
          </div>

          {/* Circular Logo Badge */}
          <div className="relative flex items-center justify-center p-2">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-civic-darkCard border border-emerald-500/30 dark:border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.18)] ring-4 ring-emerald-500/10 transition-transform duration-300 hover:scale-105">
              <img
                src="/botchainlogo.svg"
                alt="BOT Chain Logo"
                className="w-12 h-12 object-contain select-none"
              />
            </div>
          </div>

          {/* BOT Chain Name */}
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-emerald-500 dark:text-emerald-400">BOT</span>{" "}
            <span className="text-slate-900 dark:text-white">Chain</span>
          </div>

          {/* Slogan */}
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm tracking-wide">
            Tipped, thanked, on chain
          </p>

          {/* Diamond Separator */}
          <div className="flex items-center justify-center gap-3 w-40 mx-auto py-1">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-emerald-500/50" />
            <div className="w-1.5 h-1.5 rotate-45 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-emerald-500/50" />
          </div>

          {/* Links: botchain.ai & Explorer (no GitHub) */}
          <div className="flex items-center justify-center gap-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <a
              href="https://www.botchain.ai/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition group font-medium"
            >
              <Globe className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition" />
              <span>botchain.ai</span>
            </a>
            <a
              href={addressUrl(CONTRACT_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition group font-medium"
              title={`View Concord Contract (${CONTRACT_ADDRESS}) on BOTScan`}
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition" />
              <span>Explorer</span>
            </a>
          </div>

          {/* Footer Copyright Line */}
          <div className="pt-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide">
            &copy; 2026 <strong className="text-slate-800 dark:text-white font-semibold">BOT Chain</strong> &bull; Mainnet &bull; Chain ID <strong className="text-slate-800 dark:text-white font-semibold">677</strong>
          </div>
        </div>
      </div>

    </footer>
  );
};
