import React, { useState, useEffect } from "react";
import { ProposalItem, ProposalState } from "../types";
import { addressUrl } from "../config";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Users,
  ChevronRight,
} from "lucide-react";

interface ProposalCardProps {
  proposal: ProposalItem;
  onSelect: (proposal: ProposalItem) => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onSelect,
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  // Live countdown timer calculation
  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);

      if (now < proposal.startTime) {
        const diff = proposal.startTime - now;
        setTimeLeftStr(`Starts in ${formatTimeDiff(diff)}`);
      } else if (now <= proposal.endTime) {
        const diff = proposal.endTime - now;
        setTimeLeftStr(`Ends in ${formatTimeDiff(diff)}`);
      } else {
        const diff = now - proposal.endTime;
        setTimeLeftStr(`Ended ${formatTimeDiff(diff)} ago`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [proposal.startTime, proposal.endTime]);

  const formatTimeDiff = (seconds: number) => {
    if (seconds <= 0) return "0s";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  const totalVotes =
    proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;

  const forPct = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
  const againstPct =
    totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;
  const abstainPct =
    totalVotes > 0 ? (proposal.abstainVotes / totalVotes) * 100 : 0;

  // Render status badge
  const renderBadge = () => {
    switch (proposal.state) {
      case ProposalState.Active:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </span>
        );
      case ProposalState.Passed:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            <span>Passed</span>
          </span>
        );
      case ProposalState.Rejected:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Rejected</span>
          </span>
        );
      case ProposalState.Pending:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending</span>
          </span>
        );
      case ProposalState.Ended:
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Awaiting Finalization</span>
          </span>
        );
    }
  };

  const quorumMet = totalVotes >= proposal.quorum;

  return (
    <article
      onClick={() => onSelect(proposal)}
      className="group relative bg-white dark:bg-civic-darkCard border border-civic-lightBorder dark:border-civic-darkBorder rounded-2xl p-6 transition-all duration-fast hover:border-brand-500/60 dark:hover:border-brand-500/50 hover:shadow-soft dark:hover:shadow-soft-dark cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Card Header: ID, Status, Countdown */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">
              #{proposal.id.toString().padStart(3, "0")}
            </span>
            {renderBadge()}
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeLeftStr}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 mb-2">
          {proposal.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed">
          {proposal.description}
        </p>
      </div>

      <div>
        {/* Mini Vote Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-300">
              Votes: <strong className="font-mono">{totalVotes}</strong>
            </span>
            <div className="flex items-center space-x-3 font-mono text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400">
                {forPct.toFixed(0)}% For
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                {againstPct.toFixed(0)}% Against
              </span>
            </div>
          </div>

          {/* Segmented Progress Track */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            {totalVotes === 0 ? (
              <div className="w-full h-full bg-slate-200 dark:bg-slate-700/60" />
            ) : (
              <>
                <div
                  style={{ width: `${forPct}%` }}
                  className="h-full bg-emerald-500 transition-all duration-300"
                  title={`For: ${proposal.forVotes}`}
                />
                <div
                  style={{ width: `${againstPct}%` }}
                  className="h-full bg-rose-500 transition-all duration-300"
                  title={`Against: ${proposal.againstVotes}`}
                />
                <div
                  style={{ width: `${abstainPct}%` }}
                  className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-300"
                  title={`Abstain: ${proposal.abstainVotes}`}
                />
              </>
            )}
          </div>
        </div>

        {/* Footer Meta: Proposer & Quorum status */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span>by</span>
            <a
              href={addressUrl(proposal.proposer)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-brand-500 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2 flex items-center space-x-0.5"
            >
              <span>
                {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
              </span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-mono ${
                quorumMet
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-slate-400"
              }`}
            >
              Quorum: {totalVotes}/{proposal.quorum} {quorumMet ? "✓" : ""}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </article>
  );
};
