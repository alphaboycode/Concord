import React, { useState, useMemo } from "react";
import { ProposalItem, ProposalState, FilterStatus } from "../types";
import { ProposalCard } from "./ProposalCard";
import { CONTRACT_ADDRESS } from "../config";
import {
  Search,
  Filter,
  Inbox,
  AlertCircle,
  PlusCircle,
  Sparkles,
  RefreshCw,
  Code2,
} from "lucide-react";

interface ProposalListProps {
  proposals: ProposalItem[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onSelectProposal: (proposal: ProposalItem) => void;
  onOpenCreate?: () => void;
  isOwner?: boolean;
}

export const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  isLoading,
  error,
  onRefresh,
  onSelectProposal,
  onOpenCreate,
  isOwner,
}) => {
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"NEWEST" | "ENDING" | "VOTES">("NEWEST");

  const isPlaceholderAddress =
    CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";

  // Filter & Search & Sort logic
  const filteredProposals = useMemo(() => {
    return proposals
      .filter((p) => {
        // Status filter
        if (filter === "ACTIVE" && p.state !== ProposalState.Active) return false;
        if (filter === "PASSED" && p.state !== ProposalState.Passed) return false;
        if (filter === "REJECTED" && p.state !== ProposalState.Rejected) return false;

        // Search query filter
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return Number(b.id - a.id);
        }
        if (sortBy === "ENDING") {
          return a.endTime - b.endTime;
        }
        if (sortBy === "VOTES") {
          const totalA = a.forVotes + a.againstVotes + a.abstainVotes;
          const totalB = b.forVotes + b.againstVotes + b.abstainVotes;
          return totalB - totalA;
        }
        return 0;
      });
  }, [proposals, filter, searchQuery, sortBy]);

  // Tab counts
  const counts = useMemo(() => {
    const active = proposals.filter((p) => p.state === ProposalState.Active).length;
    const passed = proposals.filter((p) => p.state === ProposalState.Passed).length;
    const rejected = proposals.filter((p) => p.state === ProposalState.Rejected).length;
    return {
      all: proposals.length,
      active,
      passed,
      rejected,
    };
  }, [proposals]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Informational Banner if Contract is in Demo Mode */}
      {isPlaceholderAddress && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-brand-500/10 dark:bg-brand-500/10 border border-brand-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Demo Mode Active: Interactive Proposals Preview</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-700 dark:text-brand-300">
                  Ready to Deploy
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Showing sample proposals. To connect live on-chain, deploy the contract with Foundry and replace{" "}
                <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px] text-brand-600 dark:text-brand-400">
                  CONTRACT_ADDRESS
                </code>{" "}
                at line 49 in{" "}
                <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">
                  src/config.ts
                </code>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
              <Code2 className="w-3.5 h-3.5 text-brand-500" />
              <span>forge script script/Deploy.s.sol ...</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero / Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xs uppercase tracking-widest font-mono text-brand-600 dark:text-brand-400 font-semibold">
              Democracy in Action
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Civic Proposals
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Vote on community ballots, shape protocol parameters, and steer the future of BotChain with verifiable on-chain governance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            title="Refresh proposal list"
            className="p-2.5 rounded-xl border border-civic-lightBorder dark:border-civic-darkBorder bg-white dark:bg-civic-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors focus-ring"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-sm transition-all duration-fast shadow-glow active:scale-[0.98] focus-ring"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Proposal</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar: Filters, Search, Sort */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-civic-lightBorder dark:border-civic-darkBorder">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-fast flex items-center space-x-1.5 ${
              filter === "ALL"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>All</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filter === "ALL"
                  ? "bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-950"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-fast flex items-center space-x-1.5 ${
              filter === "ACTIVE"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>Active</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filter === "ACTIVE"
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {counts.active}
            </span>
          </button>

          <button
            onClick={() => setFilter("PASSED")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-fast flex items-center space-x-1.5 ${
              filter === "PASSED"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>Passed</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filter === "PASSED"
                  ? "bg-teal-700 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {counts.passed}
            </span>
          </button>

          <button
            onClick={() => setFilter("REJECTED")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-fast flex items-center space-x-1.5 ${
              filter === "REJECTED"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>Rejected</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filter === "REJECTED"
                  ? "bg-rose-700 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {counts.rejected}
            </span>
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-civic-darkCard border border-civic-lightBorder dark:border-civic-darkBorder text-slate-900 dark:text-white placeholder-slate-400 focus-ring"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs rounded-lg bg-white dark:bg-civic-darkCard border border-civic-lightBorder dark:border-civic-darkBorder px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus-ring cursor-pointer"
          >
            <option value="NEWEST">Newest</option>
            <option value="ENDING">Ending Soonest</option>
            <option value="VOTES">Most Votes</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl p-6 bg-white dark:bg-civic-darkCard border border-civic-lightBorder dark:border-civic-darkBorder animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-4/5 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Failed to Load Proposals
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-4">
            {error.message || "Unable to reach BotChain RPC endpoint."}
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredProposals.length === 0 && (
        <div className="py-16 px-4 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No Proposals Found
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-6 leading-relaxed">
            {searchQuery
              ? `No proposals matching "${searchQuery}". Try modifying your query or filter.`
              : "There are currently no proposals in this status. Be the first to initiate governance!"}
          </p>
          {onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-semibold transition-colors shadow-glow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Proposal</span>
            </button>
          )}
        </div>
      )}

      {/* Grid of Proposal Cards */}
      {!isLoading && !error && filteredProposals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id.toString()}
              proposal={proposal}
              onSelect={onSelectProposal}
            />
          ))}
        </div>
      )}
    </section>
  );
};
