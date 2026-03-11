import { Org } from "@/types";
import { useNavigate } from "react-router-dom";
import { FileText, Users } from "lucide-react";

interface OrgCardProps {
  org: Org;
}

export function OrgCard({ org }: OrgCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/org/${org.id}`)}
      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Banner */}
      <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-accent" />

      <div className="p-4">
        {/* Name */}
        <h3 className="font-mono text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {org.name}
        </h3>

        {/* Description */}
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          {org.description}
        </p>

        {/* Token Badge */}
        <div className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
          <span className="font-mono text-xs font-medium text-primary">
            {org.tokenSymbol}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="font-mono">{org.totalProposals} Proposals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="font-mono">{org.memberCount} Members</span>
          </div>
        </div>

        {/* Active indicator */}
        {org.activeProposals > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-vote-yes animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {org.activeProposals} active proposal
              {org.activeProposals > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
