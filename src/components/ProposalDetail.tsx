import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { CONTRACT_ADDRESS, botchain, addressUrl, txUrl } from "../config";
import { VotingABI } from "../abi/Voting";
import { ProposalItem, ProposalState, VoteType } from "../types";
import { ToastData } from "./TransactionToast";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Lock,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ProposalDetailProps {
  proposal: ProposalItem;
  onBack: () => void;
  onRefreshList: () => void;
  setToast: (toast: ToastData | null) => void;
}

export const ProposalDetail: React.FC<ProposalDetailProps> = ({
  proposal,
  onBack,
  onRefreshList,
  setToast,
}) => {
  const { address, isConnected, chain } = useAccount();
  const isCorrectNetwork = chain?.id === botchain.id || chain?.id === 31337;
  const isPlaceholderAddress =
    CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";

  // 1. Check if user has voted and their choice
  const { data: receiptData, refetch: refetchReceipt } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "getReceipt",
    args: [proposal.id, address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !isPlaceholderAddress && Boolean(address),
    },
  });

  const hasVotedOnChain = receiptData ? Boolean(receiptData[0]) : false;
  const userVoteChoiceOnChain = receiptData
    ? (Number(receiptData[1]) as VoteType)
    : null;

  // Local state for demo mode voting simulation
  const [demoHasVoted, setDemoHasVoted] = useState(false);
  const [demoVoteChoice, setDemoVoteChoice] = useState<VoteType | null>(null);

  const hasVoted = isPlaceholderAddress ? demoHasVoted : hasVotedOnChain;
  const userVoteChoice = isPlaceholderAddress
    ? demoVoteChoice
    : userVoteChoiceOnChain;

  // 2. Check allowlist status
  const { data: isAllowlistEnabled } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "allowlistEnabled",
    query: { enabled: !isPlaceholderAddress },
  });

  const { data: isUserAllowlisted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "allowlist",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: { enabled: !isPlaceholderAddress && Boolean(address) },
  });

  const isRestrictedByAllowlist =
    Boolean(isAllowlistEnabled) && !Boolean(isUserAllowlisted);

  // 3. Contract write operations
  const {
    data: writeTxHash,
    isPending: isWritePending,
    writeContractAsync,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: writeTxHash,
    });

  // Watch for receipt completion
  useEffect(() => {
    if (isTxSuccess && writeTxHash) {
      setToast({
        id: "tx-success",
        type: "success",
        title: "Transaction Confirmed!",
        message: "Your ballot has been verified on BotChain.",
        txHash: writeTxHash,
      });
      refetchReceipt();
      onRefreshList();
    }
  }, [isTxSuccess, writeTxHash]);

  // Live countdown ticker
  const [countdownStr, setCountdownStr] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      if (now < proposal.startTime) {
        setCountdownStr(`Voting starts in ${formatDiff(proposal.startTime - now)}`);
      } else if (now <= proposal.endTime) {
        setCountdownStr(`Voting ends in ${formatDiff(proposal.endTime - now)}`);
      } else {
        setCountdownStr(`Voting concluded ${formatDiff(now - proposal.endTime)} ago`);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [proposal.startTime, proposal.endTime]);

  const formatDiff = (seconds: number) => {
    if (seconds <= 0) return "0s";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  // Vote percentages calculation
  const totalVotes =
    proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
  const forPct = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
  const againstPct =
    totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;
  const abstainPct =
    totalVotes > 0 ? (proposal.abstainVotes / totalVotes) * 100 : 0;
  const quorumMet = totalVotes >= proposal.quorum;

  // Handle Vote Casting
  const handleVote = async (support: VoteType) => {
    if (isPlaceholderAddress) {
      // Interactive simulated vote in demo mode
      setDemoHasVoted(true);
      setDemoVoteChoice(support);
      if (support === VoteType.For) proposal.forVotes += 1;
      if (support === VoteType.Against) proposal.againstVotes += 1;
      if (support === VoteType.Abstain) proposal.abstainVotes += 1;
      setToast({
        id: "demo-vote",
        type: "success",
        title: "Demo Ballot Recorded",
        message: "Vote simulated locally! Deploy contract to record permanently on BotChain.",
      });
      return;
    }

    try {
      setToast({
        id: "prompt-vote",
        type: "prompt",
        title: "Confirm Vote in MetaMask",
        message: "Submitting 1-address-1-vote transaction...",
      });

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "castVote",
        args: [proposal.id, support],
      });

      setToast({
        id: "pending-vote",
        type: "pending",
        title: "Broadcasting Ballot...",
        message: `Waiting for ${botchain.name} block confirmation.`,
        txHash: hash,
      });
    } catch (err: any) {
      setToast({
        id: "error-vote",
        type: "error",
        title: "Failed to Cast Vote",
        message: err?.shortMessage || err?.message || "Transaction rejected.",
      });
    }
  };

  // Handle Finalize
  const handleFinalize = async () => {
    if (isPlaceholderAddress) {
      proposal.finalized = true;
      proposal.passed = quorumMet && proposal.forVotes > proposal.againstVotes;
      proposal.state = proposal.passed
        ? ProposalState.Passed
        : ProposalState.Rejected;
      setToast({
        id: "demo-fin",
        type: "success",
        title: "Demo Proposal Finalized",
        message: `Outcome settled as ${proposal.passed ? "Passed" : "Rejected"}!`,
      });
      return;
    }

    try {
      setToast({
        id: "prompt-fin",
        type: "prompt",
        title: "Confirm Finalization",
        message: "Submitting finalizeProposal call to BotChain...",
      });

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "finalizeProposal",
        args: [proposal.id],
      });

      setToast({
        id: "pending-fin",
        type: "pending",
        title: "Finalizing Ballot...",
        message: "Settling official outcome on BotChain.",
        txHash: hash,
      });
    } catch (err: any) {
      setToast({
        id: "error-fin",
        type: "error",
        title: "Finalization Failed",
        message: err?.shortMessage || err?.message || "Transaction reverted.",
      });
    }
  };

  // Determine Vote Disable Reason
  let disableVoteReason: string | null = null;
  if (!isConnected) {
    disableVoteReason = "Connect your wallet above to cast your ballot.";
  } else if (!isCorrectNetwork) {
    disableVoteReason = `Switch network to ${botchain.name} (ID ${botchain.id}) to participate.`;
  } else if (hasVoted) {
    disableVoteReason = "You have already cast your single vote for this proposal.";
  } else if (proposal.state !== ProposalState.Active) {
    disableVoteReason =
      proposal.state === ProposalState.Pending
        ? "Voting has not started yet."
        : "Voting period has ended for this ballot.";
  } else if (isRestrictedByAllowlist) {
    disableVoteReason = "Your wallet address is not on the owner-managed allowlist.";
  }

  const isVotingDisabled = disableVoteReason !== null || isWritePending || isTxConfirming;

  const now = Math.floor(Date.now() / 1000);
  const canFinalize =
    now > proposal.endTime &&
    !proposal.finalized &&
    isConnected &&
    isCorrectNetwork;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-150">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs font-mono font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors focus-ring"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Proposals</span>
      </button>

      {/* Main Ballot Card */}
      <div className="bg-white dark:bg-civic-darkCard border border-civic-lightBorder dark:border-civic-darkBorder rounded-3xl p-6 sm:p-10 shadow-soft dark:shadow-soft-dark space-y-8">
        {/* Header: ID, Status, Countdown */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-civic-lightBorder dark:border-civic-darkBorder">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold text-slate-400 dark:text-slate-500">
              #{proposal.id.toString().padStart(3, "0")}
            </span>

            {proposal.state === ProposalState.Active && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Ballot</span>
              </span>
            )}
            {proposal.state === ProposalState.Passed && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Passed & Finalized</span>
              </span>
            )}
            {proposal.state === ProposalState.Rejected && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Rejected</span>
              </span>
            )}
            {proposal.state === ProposalState.Pending && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Pending Start</span>
              </span>
            )}
            {proposal.state === ProposalState.Ended && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span>Awaiting Finalization</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{countdownStr}</span>
          </div>
        </div>

        {/* Title & Metadata */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            {proposal.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div>
              <span>Proposer: </span>
              <a
                href={addressUrl(proposal.proposer)}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:underline font-semibold inline-flex items-center space-x-1"
              >
                <span>{proposal.proposer}</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
            <div>
              <span>Quorum Required: </span>
              <strong className="text-slate-700 dark:text-slate-300">
                {proposal.quorum} votes
              </strong>
            </div>
          </div>
        </div>

        {/* Description Body */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-civic-lightBorder dark:border-civic-darkBorder">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-3">
            Ballot Specification
          </h3>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {proposal.description}
          </p>
        </div>

        {/* Tally & Progress Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Current Vote Standings</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {totalVotes} Total
              </span>
            </h3>

            <div className="text-xs font-mono">
              <span
                className={
                  quorumMet
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-slate-400"
                }
              >
                {quorumMet
                  ? `Quorum Reached (${totalVotes}/${proposal.quorum})`
                  : `Quorum Missing: ${proposal.quorum - totalVotes} more needed`}
              </span>
            </div>
          </div>

          {/* Detailed Progress Bars */}
          <div className="space-y-3">
            {/* For Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>FOR</span>
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {proposal.forVotes} votes ({forPct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${forPct}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                />
              </div>
            </div>

            {/* Against Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center space-x-1">
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>AGAINST</span>
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {proposal.againstVotes} votes ({againstPct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${againstPct}%` }}
                  className="h-full bg-rose-500 rounded-full transition-all duration-300"
                />
              </div>
            </div>

            {/* Abstain Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center space-x-1">
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>ABSTAIN</span>
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {proposal.abstainVotes} votes ({abstainPct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${abstainPct}%` }}
                  className="h-full bg-slate-400 dark:bg-slate-600 rounded-full transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Vote Confirmation State */}
        {hasVoted && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Ballot Cast: You Voted{" "}
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {userVoteChoice === VoteType.For
                    ? "FOR"
                    : userVoteChoice === VoteType.Against
                    ? "AGAINST"
                    : "ABSTAIN"}
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Your 1-address-1-vote allocation has been securely recorded on BotChain.
              </p>
            </div>
          </div>
        )}

        {/* Voting Action Section */}
        {!hasVoted && (
          <div className="space-y-4 pt-4 border-t border-civic-lightBorder dark:border-civic-darkBorder">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Cast Your Ballot
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every connected wallet receives exactly 1 vote. Votes cannot be modified once broadcast.
              </p>
            </div>

            {/* Voting Reason Callout if Disabled */}
            {disableVoteReason && (
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center space-x-2.5 text-xs text-slate-600 dark:text-slate-300">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{disableVoteReason}</span>
              </div>
            )}

            {/* Three Large Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleVote(VoteType.For)}
                disabled={isVotingDisabled}
                className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-fast disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] focus-ring"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Vote For</span>
              </button>

              <button
                onClick={() => handleVote(VoteType.Against)}
                disabled={isVotingDisabled}
                className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-semibold text-sm bg-rose-600 hover:bg-rose-700 text-white transition-all duration-fast disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] focus-ring"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Vote Against</span>
              </button>

              <button
                onClick={() => handleVote(VoteType.Abstain)}
                disabled={isVotingDisabled}
                className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-semibold text-sm bg-slate-600 hover:bg-slate-700 text-white transition-all duration-fast disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] focus-ring"
              >
                <MinusCircle className="w-4 h-4" />
                <span>Vote Abstain</span>
              </button>
            </div>
          </div>
        )}

        {/* Finalization Button if Proposal is Ended */}
        {canFinalize && (
          <div className="p-6 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Voting Period Closed
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Anyone can finalize this proposal to settle the official outcome (Passed or Rejected).
              </p>
            </div>
            <button
              onClick={handleFinalize}
              disabled={isWritePending || isTxConfirming}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs transition-colors shadow-glow flex items-center space-x-2"
            >
              {isWritePending || isTxConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizing...</span>
                </>
              ) : (
                <span>Finalize Proposal</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
