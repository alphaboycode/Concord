export enum VoteType {
  Against = 0,
  For = 1,
  Abstain = 2,
}

export enum ProposalState {
  Pending = 0,
  Active = 1,
  Ended = 2,
  Passed = 3,
  Rejected = 4,
}

export interface ProposalItem {
  id: bigint;
  proposer: `0x${string}`;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorum: number;
  finalized: boolean;
  passed: boolean;
  state: ProposalState;
}

export type FilterStatus = "ALL" | "ACTIVE" | "PASSED" | "REJECTED";
