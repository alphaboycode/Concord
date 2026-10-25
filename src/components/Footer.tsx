import React, { useState } from "react";
import { botchain, CONTRACT_ADDRESS, addressUrl } from "../config";
import {
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Activity,
  Layers,
  Heart,
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
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#070A10]/85 backdrop-blur-xl transition-all duration-200 mt-auto">
      {/* Upper Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Description */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Concord Governance
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
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

          {/* Col 2: On-Chain Deployment */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
              Smart Contract
            </h4>
            {isDeployed ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-300">
                    {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                  </span>
                  <button
                    onClick={handleCopyContract}
                    title="Copy Contract Address"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-auto"
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
                    title="View on BotChain Scan"
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Solidity ^0.8.24 &bull; Packed Slots &bull; OpenZeppelin 5.0
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Deploy contract to view address</p>
            )}
          </div>

          {/* Col 3: Resources & Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
              Resources
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="/Concord_Pitch_Deck.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pitch Deck (PDF)</span>
                </a>
              </li>
              <li>
                <a
                  href={botchain.blockExplorers.default.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-500" />
                  <span>BotChain Explorer</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                  RPC: https://rpc.bohr.life
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Bar */}
      <div className="border-t border-slate-200/60 dark:border-slate-800/60 py-4 bg-slate-50/50 dark:bg-[#05070B]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Concord Protocol &bull; MIT Open Source License
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <span>Engineered with precision for</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">BotChain</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
