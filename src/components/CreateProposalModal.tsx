import React, { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACT_ADDRESS, botchain } from "../config";
import { VotingABI } from "../abi/Voting";
import { ToastData } from "./TransactionToast";
import {
  X,
  PlusCircle,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  Loader2,
  Calendar,
  Check,
} from "lucide-react";

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  setToast: (toast: ToastData | null) => void;
  defaultQuorum?: number;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  setToast,
  defaultQuorum = 1,
}) => {
  const { address, isConnected, chain } = useAccount();
  const isCorrectNetwork = chain?.id === botchain.id || chain?.id === 31337;
  const isPlaceholderAddress =
    CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quorum, setQuorum] = useState<number>(defaultQuorum);

  // Default start: now + 5 minutes
  // Default end: now + 3 days
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const [startTimeStr, setStartTimeStr] = useState<string>(defaultStart);
  const [endTimeStr, setEndTimeStr] = useState<string>(defaultEnd);

  // Preview Mode Toggle
  const [isPreview, setIsPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Contract write hook
  const {
    data: writeTxHash,
    isPending: isWritePending,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading: isTxConfirming } = useWaitForTransactionReceipt({
    hash: writeTxHash,
  });

  if (!isOpen) return null;

  const validate = () => {
    if (!title.trim()) {
      setValidationError("Proposal title cannot be blank.");
      return false;
    }
    if (title.trim().length < 5) {
      setValidationError("Title should be at least 5 characters long.");
      return false;
    }
    if (!description.trim()) {
      setValidationError("Proposal description is required.");
      return false;
    }

    const startTs = Math.floor(new Date(startTimeStr).getTime() / 1000);
    const endTs = Math.floor(new Date(endTimeStr).getTime() / 1000);
    const currentTs = Math.floor(Date.now() / 1000);

    if (isNaN(startTs) || isNaN(endTs)) {
      setValidationError("Please select valid start and end dates.");
      return false;
    }
    if (startTs < currentTs - 60) {
      setValidationError("Start time cannot be in the past.");
      return false;
    }
    if (endTs <= startTs) {
      setValidationError("End time must be strictly after the start time.");
      return false;
    }
    if (quorum < 0) {
      setValidationError("Quorum votes must be 0 or higher.");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleNextOrSubmit = async () => {
    if (!validate()) return;

    if (!isPreview) {
      setIsPreview(true);
      return;
    }

    // Submit proposal
    const startTs = Math.floor(new Date(startTimeStr).getTime() / 1000);
    const endTs = Math.floor(new Date(endTimeStr).getTime() / 1000);

    if (isPlaceholderAddress) {
      setToast({
        id: "demo-create",
        type: "success",
        title: "Proposal Created (Demo Mode)",
        message: "Your proposal is visible locally. Deploy to record on BotChain.",
      });
      onSuccess();
      onClose();
      return;
    }

    try {
      setToast({
        id: "prompt-create",
        type: "prompt",
        title: "Confirm Proposal Creation",
        message: "Confirm transaction in your wallet...",
      });

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "createProposal",
        args: [title, description, startTs, endTs, quorum],
      });

      setToast({
        id: "pending-create",
        type: "pending",
        title: "Creating Proposal on BotChain...",
        message: "Waiting for block inclusion.",
        txHash: hash,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setToast({
        id: "error-create",
        type: "error",
        title: "Proposal Creation Failed",
        message: err?.shortMessage || err?.message || "Transaction was rejected.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-civic-darkCard border border-civic-lightBorder dark:border-civic-darkBorder rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-fast">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-civic-lightBorder dark:border-civic-darkBorder">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isPreview ? "Review Proposal Preview" : "Create New Civic Proposal"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isPreview
                  ? "Verify all details before signing transaction."
                  : "Draft on-chain governance ballot for BotChain."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center space-x-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="py-5 space-y-4">
          {!isPreview ? (
            /* Step 1: Form */
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BIP-05: Allocate Gas Grant Pool to Core Validators"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-civic-lightBorder dark:border-civic-darkBorder text-slate-900 dark:text-white placeholder-slate-400 text-xs focus-ring"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Description & Rationale *
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide comprehensive details, execution rationale, and governance specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-civic-lightBorder dark:border-civic-darkBorder text-slate-900 dark:text-white placeholder-slate-400 text-xs focus-ring resize-none"
                />
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    <span>Voting Start Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-civic-lightBorder dark:border-civic-darkBorder text-slate-900 dark:text-white text-xs font-mono focus-ring"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    <span>Voting End Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-civic-lightBorder dark:border-civic-darkBorder text-slate-900 dark:text-white text-xs font-mono focus-ring"
                  />
                </div>
              </div>

              {/* Quorum Setting */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Quorum Minimum Total Votes (0 = Simple Majority Only)
                </label>
                <input
                  type="number"
                  min="0"
                  value={quorum}
                  onChange={(e) => setQuorum(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-civic-lightBorder dark:border-civic-darkBorder text-slate-900 dark:text-white text-xs font-mono focus-ring"
                />
              </div>
            </div>
          ) : (
            /* Step 2: Ballot Preview */
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-civic-lightBorder dark:border-civic-darkBorder space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-500/15 text-brand-600 dark:text-brand-400">
                    Ballot Preview
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Quorum: {quorum} votes
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {description}
                </p>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500">
                  <div>Start: {new Date(startTimeStr).toLocaleString()}</div>
                  <div>End: {new Date(endTimeStr).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-civic-lightBorder dark:border-civic-darkBorder">
          {isPreview ? (
            <button
              onClick={() => setIsPreview(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Edit Details
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleNextOrSubmit}
            disabled={isWritePending || isTxConfirming}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs transition-colors shadow-glow disabled:opacity-50"
          >
            {isWritePending || isTxConfirming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Broadcasting...</span>
              </>
            ) : isPreview ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Broadcast to BotChain</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Ballot</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
