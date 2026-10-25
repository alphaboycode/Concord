import React, { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
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

      {/* Upgraded Civic Footer */}
      <Footer />
    </div>
  );
};
