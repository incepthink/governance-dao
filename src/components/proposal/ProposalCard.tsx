import { Proposal } from "@/types";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { VotingBar } from "./VotingBar";
import { Clock, Coins } from "lucide-react";
import { formatDistanceToNow, format, isAfter } from "date-fns";

interface ProposalCardProps {
  proposal: Proposal;
  tokenSymbol: string;
}

export function ProposalCard({ proposal, tokenSymbol }: ProposalCardProps) {
  const navigate = useNavigate();
  const endDate = new Date(proposal.endDate);
  const isActive = proposal.status === "active" && isAfter(endDate, new Date());

  return (
    <div
      onClick={() => navigate(`/org/${proposal.orgId}/proposal/${proposal.id}`)}
      className="cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-base font-semibold text-foreground line-clamp-1">
          {proposal.title}
        </h3>
        <StatusBadge status={proposal.status} />
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
        {proposal.description}
      </p>

      <div className="mt-4">
        <VotingBar yesVotes={proposal.yesVotes} noVotes={proposal.noVotes} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1">
          <Coins className="h-3 w-3 text-primary" />
          <span className="font-mono text-xs text-primary">
            Min {proposal.minTokenThreshold} {tokenSymbol}
          </span>
        </div>

        {isActive && (
          <div className="flex items-center gap-1.5 rounded-full bg-vote-active/10 px-2.5 py-1">
            <Clock className="h-3 w-3 text-vote-active" />
            <span className="font-mono text-xs text-vote-active">
              Ends {formatDistanceToNow(endDate, { addSuffix: true })}
            </span>
          </div>
        )}

        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {format(new Date(proposal.startDate), "MMM d")} –{" "}
          {format(endDate, "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );
}
