import { ProposalStatus } from "@/types";

interface StatusBadgeProps {
  status: ProposalStatus;
  className?: string;
}

const statusConfig: Record<
  ProposalStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-vote-active/15 text-vote-active",
  },
  accepted: {
    label: "Accepted",
    className: "bg-vote-yes/15 text-vote-yes",
  },
  rejected: {
    label: "Rejected",
    className: "bg-vote-no/15 text-vote-no",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
