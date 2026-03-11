interface VotingBarProps {
  yesVotes: number;
  noVotes: number;
}

export function VotingBar({ yesVotes, noVotes }: VotingBarProps) {
  const total = yesVotes + noVotes;
  const yesPercent = total > 0 ? (yesVotes / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-vote-yes transition-all duration-500"
          style={{ width: `${yesPercent}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full rounded-full bg-vote-no transition-all duration-500"
          style={{ width: `${100 - yesPercent}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-xs">
        <span className="text-vote-yes">{yesVotes} Yes</span>
        <span className="text-vote-no">{noVotes} No</span>
      </div>
    </div>
  );
}
