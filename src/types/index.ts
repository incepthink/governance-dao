export interface Org {
  id: number | string;
  name: string;
  description: string;
  imageUrl: string;
  bannerUrl: string;
  tokenSymbol: string;
  tokenName: string;
  tokenContractAddress: string;
  totalProposals: number;
  activeProposals: number;
  memberCount: number;
  totalVotes: number;
  ownerWallet: string;
  ownerEmail: string;
}

export type ProposalStatus = "active" | "accepted" | "rejected" | "closed";

export type RuleType = "loyalty" | "badge" | "nft" | "quest";

export interface ParticipationRule {
  id: string;
  type: RuleType;
  loyaltyMin?: number;
  badgeIds?: string[];
  metadataIds?: string[];
  questIds?: string[];
}

export interface Proposal {
  id: string;
  orgId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProposalStatus;
  yesVotes: number;
  noVotes: number;
  totalVoters: number;
  minTokenThreshold: number;
  participationLogic: "AND" | "OR";
  participationRules: ParticipationRule[];
  minParticipants: number;
  yesNoRatio: number;
  creatorWallet: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  voterWalletAddress: string;
  vote: "yes" | "no";
  votingPower: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  orgId: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface Quest {
  id: string;
  orgId: string;
  title: string;
  description: string;
  rewardPoints: number;
}

export interface NftMetadata {
  id: string;
  orgId: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface Member {
  walletAddress: string;
  orgId: string;
  tokenBalance: number;
  votingPower: number;
  proposalsVoted: number;
}

export interface OwnerAccount {
  email: string;
  walletAddress: string;
  orgId?: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manufacturer";
  company?: string;
  walletAddress?: string;
}
