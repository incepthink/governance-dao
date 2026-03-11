import { create } from "zustand";
import { Org, Proposal, Vote, OwnerAccount } from "@/types";
import { mockOrgs } from "@/data/mockOrgs";
import { mockProposals } from "@/data/mockProposals";
import { mockVotes } from "@/data/mockVotes";

interface AppState {
  // Wallet
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;

  // Owner
  ownerAccount: OwnerAccount | null;
  loginOwner: (email: string, password: string) => boolean;
  signupOwner: (email: string, password: string) => void;
  logoutOwner: () => void;

  // Orgs
  orgs: Org[];
  addOrg: (org: Org) => void;

  // Proposals
  proposals: Proposal[];
  addProposal: (proposal: Proposal) => void;

  // Votes
  votes: Vote[];
  castVote: (vote: Vote) => void;
  getUserVote: (proposalId: string) => Vote | undefined;
}

const MOCK_WALLET = "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18";

export const useAppStore = create<AppState>((set, get) => ({
  walletAddress: null,
  connectWallet: () => set({ walletAddress: MOCK_WALLET }),
  disconnectWallet: () => set({ walletAddress: null, ownerAccount: null }),

  ownerAccount: null,
  loginOwner: (email: string, _password: string) => {
    const wallet = get().walletAddress;
    if (!wallet) return false;
    // Simulate: check if email matches any org owner
    const org = get().orgs.find((o) => o.ownerEmail === email);
    set({
      ownerAccount: {
        email,
        walletAddress: wallet,
        orgId: org?.id,
      },
    });
    return true;
  },
  signupOwner: (email: string, _password: string) => {
    const wallet = get().walletAddress;
    if (!wallet) return;
    set({
      ownerAccount: {
        email,
        walletAddress: wallet,
      },
    });
  },
  logoutOwner: () => set({ ownerAccount: null }),

  orgs: [...mockOrgs],
  addOrg: (org) =>
    set((s) => ({
      orgs: [...s.orgs, org],
      ownerAccount: s.ownerAccount
        ? { ...s.ownerAccount, orgId: org.id }
        : null,
    })),

  proposals: [...mockProposals],
  addProposal: (proposal) =>
    set((s) => ({ proposals: [...s.proposals, proposal] })),

  votes: [...mockVotes],
  castVote: (vote) =>
    set((s) => {
      const newVotes = [...s.votes, vote];
      const proposals = s.proposals.map((p) => {
        if (p.id === vote.proposalId) {
          return {
            ...p,
            yesVotes:
              vote.vote === "yes" ? p.yesVotes + vote.votingPower : p.yesVotes,
            noVotes:
              vote.vote === "no" ? p.noVotes + vote.votingPower : p.noVotes,
            totalVoters: p.totalVoters + 1,
          };
        }
        return p;
      });
      return { votes: newVotes, proposals };
    }),
  getUserVote: (proposalId) => {
    const state = get();
    if (!state.walletAddress) return undefined;
    return state.votes.find(
      (v) =>
        v.proposalId === proposalId &&
        v.voterWalletAddress === state.walletAddress,
    );
  },
}));
