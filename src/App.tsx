import React, { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Header } from "./components/Header";
import { NetworkBanner } from "./components/NetworkBanner";
import { LowBalanceWarning } from "./components/LowBalanceWarning";
import { ProposalList } from "./components/ProposalList";
import { ProposalDetail } from "./components/ProposalDetail";
import { CreateProposalModal } from "./components/CreateProposalModal";
import { TransactionToast, ToastData } from "./components/TransactionToast";
import { useProposals } from "./hooks/useProposals";
import { ProposalItem } from "./types";
import { botchain, CONTRACT_ADDRESS, addressUrl } from "./config";
import { VotingABI } from "./abi/Voting";
import { ShieldCheck, ExternalLink } from "lucide-react";

export const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { proposals, isLoading, error, refetch } = useProposals();

  const [selectedProposal, setSelectedProposal] = useState<ProposalItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const isPlaceholderAddress =
    CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";

  // Check if connected address is contract owner
  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "owner",
    query: {
      enabled: !isPlaceholderAddress && Boolean(address),
    },
  });

  const isOwner = isPlaceholderAddress
    ? true // allow previewing proposal creation in demo mode
    : Boolean(
        address &&
          ownerAddress &&
          address.toLowerCase() === (ownerAddress as string).toLowerCase()
      );

  return (
    <div className="min-h-screen flex flex-col bg-civic-lightBg dark:bg-civic-darkBg transition-colors duration-150">
      {/* Network Warning Banner */}
      <NetworkBanner />

      {/* Low Native BOT Gas Warning */}
      <LowBalanceWarning />

      {/* Global Header */}
      <Header
        onOpenCreate={() => setIsCreateOpen(true)}
        isOwner={isOwner}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedProposal ? (
          <ProposalDetail
            proposal={selectedProposal}
            onBack={() => setSelectedProposal(null)}
            onRefreshList={refetch}
            setToast={setToast}
          />
        ) : (
          <ProposalList
            proposals={proposals}
            isLoading={isLoading}
            error={error}
            onRefresh={refetch}
            onSelectProposal={(p) => setSelectedProposal(p)}
            onOpenCreate={() => setIsCreateOpen(true)}
            isOwner={isOwner}
          />
        )}
      </main>

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          refetch();
        }}
        setToast={setToast}
      />

      {/* Real-time Transaction Toast */}
      <TransactionToast toast={toast} onClose={() => setToast(null)} />

      {/* Civic Footer */}
      <footer className="border-t border-civic-lightBorder dark:border-civic-darkBorder py-8 bg-white/40 dark:bg-civic-darkCard/40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>
              Concord Governance &bull; Deployed on{" "}
              <a
                href={botchain.blockExplorers.default.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-slate-700 dark:text-slate-200 hover:text-brand-500 transition-colors inline-flex items-center space-x-0.5"
              >
                <span>{botchain.name}</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>Chain ID: {botchain.id}</span>
            <span>Token: {botchain.nativeCurrency.symbol}</span>
            {CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && (
              <a
                href={addressUrl(CONTRACT_ADDRESS)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-400 underline decoration-slate-400/50"
              >
                Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
