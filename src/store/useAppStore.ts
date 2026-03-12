import { create } from "zustand";
import Cookies from "js-cookie";
import { Org, Proposal, Vote, Owner } from "@/types";
import { loginOwner as apiLoginOwner, signupOwner as apiSignupOwner } from "@/lib/authApi";
import { mockOrgs } from "@/data/mockOrgs";
import { mockProposals } from "@/data/mockProposals";
import { mockVotes } from "@/data/mockVotes";

const COOKIE_EXPIRES = 10 / 24; // 10 hours

interface AppState {
  // Wallet
  walletAddress: string | null;
  setWalletAddress: (addr: string | null) => void;
  walletUser: any | null;
  setWalletUser: (user: any | null) => void;

  // Owner auth
  owner: Owner | null;
  token: string | null;
  loginOwner: (email: string, password: string) => Promise<void>;
  signupOwner: (name: string, email: string, password: string) => Promise<void>;
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

const savedToken = Cookies.get("hashvote_token");
const savedOwnerRaw = Cookies.get("hashvote_owner");
const savedOwner: Owner | null =
  savedToken && savedOwnerRaw ? JSON.parse(savedOwnerRaw) : null;

const savedWalletUserRaw = Cookies.get("hashvote_user_instance");
const savedWalletUser = savedWalletUserRaw ? JSON.parse(savedWalletUserRaw) : null;

export const useAppStore = create<AppState>((set, get) => ({
  walletAddress: null,
  setWalletAddress: (addr) => {
    if (addr === null) {
      Cookies.remove("hashvote_user_instance");
    }
    set({
      walletAddress: addr,
      ...(addr === null ? { owner: null, token: null, walletUser: null } : {}),
    });
  },

  walletUser: savedWalletUser,
  setWalletUser: (user) => {
    if (user) {
      Cookies.set("hashvote_user_instance", JSON.stringify(user), { expires: COOKIE_EXPIRES });
    } else {
      Cookies.remove("hashvote_user_instance");
    }
    set({ walletUser: user });
  },

  owner: savedOwner,
  token: savedToken ?? null,

  loginOwner: async (email, password) => {
    const { token, owner } = await apiLoginOwner(email, password);
    Cookies.set("hashvote_token", token, { expires: COOKIE_EXPIRES });
    Cookies.set("hashvote_owner", JSON.stringify(owner), { expires: COOKIE_EXPIRES });
    set({ owner, token });
  },

  signupOwner: async (name, email, password) => {
    const { token, owner } = await apiSignupOwner(name, email, password);
    Cookies.set("hashvote_token", token, { expires: COOKIE_EXPIRES });
    Cookies.set("hashvote_owner", JSON.stringify(owner), { expires: COOKIE_EXPIRES });
    set({ owner, token });
  },

  logoutOwner: () => {
    Cookies.remove("hashvote_token");
    Cookies.remove("hashvote_owner");
    set({ owner: null, token: null });
  },

  orgs: [...mockOrgs],
  addOrg: (org) =>
    set((s) => ({ orgs: [...s.orgs, org] })),

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
            yesVotes: vote.vote === "yes" ? p.yesVotes + vote.votingPower : p.yesVotes,
            noVotes: vote.vote === "no" ? p.noVotes + vote.votingPower : p.noVotes,
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
        v.voterWalletAddress === state.walletAddress
    );
  },
}));
