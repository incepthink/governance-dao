import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { createPublicClient, http, isAddress } from "viem";
import { baseSepolia } from "viem/chains";
import { StatusBadge } from "@/components/proposal/StatusBadge";
import { VotingBar } from "@/components/proposal/VotingBar";
import { Button } from "@/components/ui/button";
import { truncateAddress, formatNumber } from "@/lib/format";
import { mockBadges } from "@/data/mockBadges";
import { mockQuests } from "@/data/mockQuests";
import { mockMetadata } from "@/data/mockMetadata";
import { format, formatDistanceToNow, isAfter } from "date-fns";
import {
  Clock,
  Coins,
  Shield,
  Star,
  Award,
  Scroll,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/utils";
import Cookies from "js-cookie";

const erc20ABI = [
  {
    name: "name",
    type: "function",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
] as const;

const tokenClient = createPublicClient({
  chain: baseSepolia,
  transport: http(import.meta.env.VITE_BASE_TESTNET_RPC),
});

type ApiProposal = {
  title: string;
  description: string;
  owner: string;
  start_date: string;
  end_date: string;
  status: string;
  yes_votes: number;
  no_votes: number;
  total_voters: number;
  min_token_threshold: number;
  participation_logic: "AND" | "OR";
  min_participants: number;
  yes_no_ratio: number;
  token: {
    contract_address: string;
  };
  participation_rules: {
    type: string;
    loyalty_min?: number;
    badge_ids?: string[];
    metadata_ids?: string[];
    quest_ids?: string[];
  }[];
};

type ApiVote = { wallet_address: string; vote: string };

export default function ProposalDetail() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { walletAddress } = useAppStore();
  const [voteModal, setVoteModal] = useState<"yes" | "no" | null>(null);
  const [apiProposal, setApiProposal] = useState<ApiProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [recentVotes, setRecentVotes] = useState<ApiVote[]>([]);
  const [votesLoading, setVotesLoading] = useState(false);
  const [hasUserVoted, setHasUserVoted] = useState(false);

  const fetchVotes = async () => {
    const raw = Cookies.get("hashvote_user_instance");
    if (!raw || !walletAddress) return;
    const userId: number = JSON.parse(raw).userInstance.id;
    setVotesLoading(true);
    try {
      const res = await axiosInstance.get(
        `/platform/dao/vote/proposal/${proposalId}?user_id=${userId}`
      );
      setRecentVotes(res.data.votes ?? []);
      setHasUserVoted(res.data.has_user_voted ?? false);
    } catch {
      // silently fail
    } finally {
      setVotesLoading(false);
    }
  };

  useEffect(() => {
    setHasUserVoted(false);
    setRecentVotes([]);
    fetchVotes();
  }, [proposalId, walletAddress]);

  const fetchProposal = async () => {
    try {
      const res = await axiosInstance.get("/platform/dao/proposal/" + proposalId);
      const proposal: ApiProposal = res.data.proposal;
      setApiProposal(proposal);

      const addr = proposal.token?.contract_address;
      if (addr && isAddress(addr)) {
        try {
          const [n, s] = await Promise.all([
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tokenClient.readContract({
              address: addr,
              abi: erc20ABI,
              functionName: "name",
            } as any),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tokenClient.readContract({
              address: addr,
              abi: erc20ABI,
              functionName: "symbol",
            } as any),
          ]);
          setTokenName(n as string);
          setTokenSymbol(s as string);
        } catch {
          /* show page without token details */
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposal();
  }, [proposalId]);

  if (loading)
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="font-mono text-muted-foreground">Loading...</p>
      </div>
    );

  if (!apiProposal)
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="font-mono text-muted-foreground">Proposal not found</p>
      </div>
    );

  const endDate = new Date(apiProposal.end_date);
  const isActive =
    apiProposal.status === "active" && isAfter(endDate, new Date());

  const userVotingPower = 2500; // Mock token balance

  const totalVoteWeight = apiProposal.yes_votes + apiProposal.no_votes;
  const yesPercent =
    totalVoteWeight > 0
      ? Math.round((apiProposal.yes_votes / totalVoteWeight) * 100)
      : 0;
  const participationMet =
    apiProposal.total_voters >= apiProposal.min_participants;
  const willPass =
    apiProposal.yes_votes >= apiProposal.no_votes * apiProposal.yes_no_ratio &&
    participationMet;

  const getRuleIcon = (type: string) => {
    switch (type) {
      case "loyalty":
        return Star;
      case "badge":
        return Award;
      case "nft":
        return Shield;
      case "quest":
        return Scroll;
      default:
        return Shield;
    }
  };

  const getRuleDescription = (rule: ApiProposal["participation_rules"][0]) => {
    switch (rule.type) {
      case "loyalty":
        return `Minimum ${rule.loyalty_min} loyalty points`;
      case "badge":
        return `Must hold: ${rule.badge_ids?.map((bid) => mockBadges.find((b) => b.id === bid)?.name || bid).join(", ")}`;
      case "nft":
        return `Must hold metadata: ${rule.metadata_ids?.map((mid) => mockMetadata.find((m) => m.id === mid)?.name || mid).join(", ")}`;
      case "quest":
        return `Must complete: ${rule.quest_ids?.map((qid) => mockQuests.find((q) => q.id === qid)?.title || qid).join(", ")}`;
      default:
        return "";
    }
  };

  const handleVote = async (type: "yes" | "no") => {
    if (!walletAddress) return;

    const raw = Cookies.get("hashvote_user_instance");
    if (!raw) {
      toast.error("User session not found. Please sign in again.");
      return;
    }

    const userId: number = JSON.parse(raw).userInstance.id;

    try {
      await axiosInstance.post("/user/dao/vote", {
        proposal_id: Number(proposalId),
        user_id: userId,
        vote: type.toUpperCase(),
      });
      setVoteModal(null);
      toast.success(`Vote cast successfully — ${type.toUpperCase()}`);
      fetchVotes();
      fetchProposal();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to cast vote";
      toast.error(message);
      setVoteModal(null);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <StatusBadge status={apiProposal.status as any} />
                {isActive && (
                  <div className="flex items-center gap-1.5 rounded-full bg-vote-active/10 px-2.5 py-1">
                    <Clock className="h-3 w-3 text-vote-active" />
                    <span className="font-mono text-xs text-vote-active">
                      Ends {formatDistanceToNow(endDate, { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
              <h1 className="font-mono text-3xl font-bold">
                {apiProposal.title}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>Created by {apiProposal.owner}</span>
                <span>·</span>
                <span>
                  {format(new Date(apiProposal.start_date), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {apiProposal.description}
              </div>
            </div>

            {/* Participation Rules */}
            {apiProposal.participation_rules.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-mono text-lg font-semibold mb-4">
                  Eligibility to Vote
                </h2>
                <div className="mb-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
                  <span className="font-mono text-xs text-primary">
                    Must meet{" "}
                    {apiProposal.participation_logic === "AND" ? "ALL" : "ANY"}{" "}
                    rules
                  </span>
                </div>
                <div className="space-y-3">
                  {apiProposal.participation_rules.map((rule, idx) => {
                    const Icon = getRuleIcon(rule.type);
                    const meetsRule = true; // Mock: user meets all rules
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                      >
                        <Icon className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm text-muted-foreground flex-1">
                          {getRuleDescription(rule)}
                        </span>
                        {walletAddress &&
                          (meetsRule ? (
                            <CheckCircle className="h-4 w-4 text-vote-yes shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-vote-no shrink-0" />
                          ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Voting Results */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-mono text-lg font-semibold mb-4">
                Voting Results
              </h2>

              {/* Donut Chart */}
              <div className="flex items-center justify-center py-6">
                <div className="relative h-40 w-40">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--vote-yes))"
                      strokeWidth="8"
                      strokeDasharray={`${yesPercent * 2.51} ${251 - yesPercent * 2.51}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-2xl font-bold text-foreground">
                      {yesPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <VotingBar
                yesVotes={apiProposal.yes_votes}
                noVotes={apiProposal.no_votes}
              />

              {/* Acceptance Rules */}
              <div className="mt-6 space-y-3 border-t border-border pt-6">
                <h3 className="font-mono text-sm font-semibold text-muted-foreground">
                  Acceptance Rules
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Minimum participants:{" "}
                    <span className="font-mono text-foreground">
                      {apiProposal.min_participants}
                    </span>
                  </p>
                  <p>
                    Yes votes must be ≥{" "}
                    <span className="font-mono text-foreground">
                      {apiProposal.yes_no_ratio}×
                    </span>{" "}
                    No votes
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>
                        {apiProposal.total_voters} of{" "}
                        {apiProposal.min_participants} participants
                      </span>
                      <span>{participationMet ? "✓ Met" : "Not yet met"}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${participationMet ? "bg-vote-yes" : "bg-vote-active"}`}
                        style={{
                          width: `${Math.min(100, (apiProposal.total_voters / apiProposal.min_participants) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 font-mono text-xs">
                    Outcome:{" "}
                    <span
                      className={
                        willPass ? "text-vote-yes" : "text-vote-active"
                      }
                    >
                      {apiProposal.status === "active"
                        ? willPass
                          ? "Will Pass"
                          : "Pending"
                        : apiProposal.status === "accepted"
                          ? "Passed"
                          : apiProposal.status === "rejected"
                            ? "Failed"
                            : "Closed"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Voting Sidebar */}
          <div className="w-full lg:w-96">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div
                className="rounded-xl border border-border bg-surface-dark p-6"
                style={{ borderLeft: "1px solid hsl(var(--border))" }}
              >
                <h3 className="font-mono text-lg font-semibold mb-4">
                  Cast Your Vote
                </h3>

                {!walletAddress ? (
                  <p className="text-sm text-muted-foreground font-mono">
                    Connect your wallet to vote
                  </p>
                ) : hasUserVoted ? (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-vote-yes" />
                      <span className="font-mono text-sm">
                        You have already voted
                      </span>
                    </div>
                  </div>
                ) : !isActive ? (
                  <p className="text-sm text-muted-foreground font-mono">
                    Voting has ended
                  </p>
                ) : votesLoading ? (
                  <div className="flex justify-center py-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <>
                    {/* <div className="mb-4 rounded-lg border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">
                        Your voting power
                      </p>
                      <p className="font-mono text-lg font-bold text-foreground">
                        {formatNumber(userVotingPower)} votes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Holding {formatNumber(userVotingPower)}{" "}
                        {tokenSymbol}
                      </p>
                    </div> */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 font-mono bg-vote-yes/15 text-vote-yes hover:bg-vote-yes/25 border border-vote-yes/20"
                        variant="outline"
                        onClick={() => setVoteModal("yes")}
                      >
                        Vote Yes
                      </Button>
                      <Button
                        className="flex-1 font-mono bg-vote-no/15 text-vote-no hover:bg-vote-no/25 border border-vote-no/20"
                        variant="outline"
                        onClick={() => setVoteModal("no")}
                      >
                        Vote No
                      </Button>
                    </div>
                  </>
                )}

                {/* Recent Votes */}
                <div className="mt-6 border-t border-border pt-4">
                  <h4 className="font-mono text-sm font-semibold text-muted-foreground mb-3">
                    Recent Votes
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {votesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : recentVotes.length === 0 ? (
                      <p className="text-xs text-muted-foreground font-mono">
                        No votes yet
                      </p>
                    ) : (
                      recentVotes.map((v, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-mono text-muted-foreground">
                            {truncateAddress(v.wallet_address)}
                          </span>
                          <span
                            className={`font-mono font-medium ${v.vote === "YES" ? "text-vote-yes" : "text-vote-no"}`}
                          >
                            {v.vote}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vote Confirmation Modal */}
      <Dialog open={voteModal !== null} onOpenChange={() => setVoteModal(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-center">
              Confirm Your Vote
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-8">
            {/* Signature Moment — Pulsing Circle */}
            <div
              className={`vote-pulse h-32 w-32 rounded-full border-4 ${
                voteModal === "yes" ? "border-vote-yes" : "border-vote-no"
              }`}
            />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              You are casting{" "}
              <span className="font-mono font-bold text-foreground">
                {formatNumber(userVotingPower)}
              </span>{" "}
              votes as{" "}
              <span
                className={`font-mono font-bold ${voteModal === "yes" ? "text-vote-yes" : "text-vote-no"}`}
              >
                {voteModal?.toUpperCase()}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This cannot be undone.
            </p>
            <Button
              className={`mt-6 w-full font-mono ${
                voteModal === "yes"
                  ? "bg-vote-yes/15 text-vote-yes hover:bg-vote-yes/25 border border-vote-yes/30"
                  : "bg-vote-no/15 text-vote-no hover:bg-vote-no/25 border border-vote-no/30"
              }`}
              variant="outline"
              onClick={() => voteModal && handleVote(voteModal)}
            >
              Cast {formatNumber(userVotingPower)} {voteModal?.toUpperCase()}{" "}
              Votes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
