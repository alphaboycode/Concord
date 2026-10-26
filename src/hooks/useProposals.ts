import { useState, useEffect } from "react";
import { useReadContract, useReadContracts, useWatchContractEvent } from "wagmi";
import { CONTRACT_ADDRESS } from "../config";
import { VotingABI } from "../abi/Voting";
import { ProposalItem, ProposalState } from "../types";

// Demonstration proposals shown when contract address has not yet been deployed
const DEMO_PROPOSALS: ProposalItem[] = [
  {
    id: 1n,
    proposer: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    title: "BIP-01: Activate Gas Oracle Subsidies for Civic Proposers",
    description:
      "This proposal initiates an automated gas subsidy pool on BotChain Mainnet to offset transaction fees for verified governance contributors. Passing this will allocate 50,000 BOT from the community treasury towards micro-grants for civic proposers.",
    startTime: Math.floor(Date.now() / 1000) - 86400,
    endTime: Math.floor(Date.now() / 1000) + 172800, // 2 days left
    forVotes: 48,
    againstVotes: 12,
    abstainVotes: 5,
    quorum: 30,
    finalized: false,
    passed: false,
    state: ProposalState.Active,
  },
  {
    id: 2n,
    proposer: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    title: "BIP-02: Mandate 1-Address-1-Vote Identity Attestation",
    description:
      "Ratify strict protocol standards preventing Sybil attacks by enforcing optional allowlist registry checks prior to vote delegation on sensitive infrastructure ballots.",
    startTime: Math.floor(Date.now() / 1000) - 400000,
    endTime: Math.floor(Date.now() / 1000) - 50000, // Ended
    forVotes: 85,
    againstVotes: 14,
    abstainVotes: 6,
    quorum: 50,
    finalized: true,
    passed: true,
    state: ProposalState.Passed,
  },
  {
    id: 3n,
    proposer: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    title: "BIP-03: Deprecate Legacy EIP-1559 Mempool Relayers",
    description:
      "Proposal to disable legacy transaction relayers that fail to respect native gas price caps on BotChain RPC node cluster.",
    startTime: Math.floor(Date.now() / 1000) - 500000,
    endTime: Math.floor(Date.now() / 1000) - 100000,
    forVotes: 9,
    againstVotes: 32,
    abstainVotes: 4,
    quorum: 25,
    finalized: true,
    passed: false,
    state: ProposalState.Rejected,
  },
  {
    id: 4n,
    proposer: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
    title: "BIP-04: Increase Default Proposal Quorum to 100 Voters",
    description:
      "Calibrate default quorum parameters to reflect expanding validator and delegator participation across Bohr and BotChain ecosystems.",
    startTime: Math.floor(Date.now() / 1000) + 3600, // Starts in 1 hour
    endTime: Math.floor(Date.now() / 1000) + 259200,
    forVotes: 0,
    againstVotes: 0,
    abstainVotes: 0,
    quorum: 100,
    finalized: false,
    passed: false,
    state: ProposalState.Pending,
  },
];

export function useProposals() {
  const isPlaceholderAddress =
    CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";

  // 1. Read proposalCount
  const {
    data: countData,
    isLoading: isCountLoading,
    refetch: refetchCount,
    error: countError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "proposalCount",
    query: {
      enabled: !isPlaceholderAddress,
    },
  });

  const proposalCount = countData ? Number(countData) : 0;

  // 2. Multicall getProposal for all proposals
  const contracts = Array.from({ length: proposalCount }, (_, i) => ({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "getProposal" as const,
    args: [BigInt(i + 1)] as const,
  }));

  const {
    data: proposalsData,
    isLoading: isProposalsLoading,
    refetch: refetchProposals,
    error: proposalsError,
  } = useReadContracts({
    contracts,
    query: {
      enabled: !isPlaceholderAddress && proposalCount > 0,
    },
  });

  // Watch on-chain events for live refresh
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: "ProposalCreated",
    onLogs() {
      refetchCount();
      refetchProposals();
    },
    enabled: !isPlaceholderAddress,
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: "VoteCast",
    onLogs() {
      refetchProposals();
    },
    enabled: !isPlaceholderAddress,
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: "ProposalFinalized",
    onLogs() {
      refetchProposals();
    },
    enabled: !isPlaceholderAddress,
  });

  // Parse items
  let proposals: ProposalItem[] = [];

  if (isPlaceholderAddress) {
    proposals = DEMO_PROPOSALS;
  } else if (proposalsData) {
    proposals = proposalsData
      .map((item, idx) => {
        if (!item.result) return null;
        const res = item.result as any;
        return {
          id: BigInt(idx + 1),
          proposer: res[0],
          title: res[1],
          description: res[2],
          startTime: Number(res[3]),
          endTime: Number(res[4]),
          forVotes: Number(res[5]),
          againstVotes: Number(res[6]),
          abstainVotes: Number(res[7]),
          quorum: Number(res[8]),
          finalized: Boolean(res[9]),
          passed: Boolean(res[10]),
          state: Number(res[11]) as ProposalState,
        };
      })
      .filter((p): p is ProposalItem => p !== null);
  }

  const refetch = () => {
    refetchCount();
    refetchProposals();
  };

  return {
    proposals,
    isLoading: !isPlaceholderAddress && (isCountLoading || isProposalsLoading),
    error: countError || proposalsError,
    refetch,
    isPlaceholderAddress,
  };
}
