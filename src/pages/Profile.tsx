import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { truncateAddress, formatNumber } from '@/lib/format';
import { mockVotes } from '@/data/mockVotes';
import { mockBadges } from '@/data/mockBadges';
import { Copy, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Tab = 'history' | 'badges' | 'loyalty';

export default function Profile() {
  const { walletAddress, connectWallet, orgs, proposals } = useAppStore();
  const [tab, setTab] = useState<Tab>('history');
  const [page, setPage] = useState(1);

  if (!walletAddress) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="rounded-xl border border-border bg-card p-8 text-center max-w-md">
          <Wallet className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="font-mono text-xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-sm text-muted-foreground mb-6">View your governance activity</p>
          <Button onClick={connectWallet} className="font-mono">Connect Wallet</Button>
        </div>
      </div>
    );
  }

  // Mock: show all votes as if they're the user's
  const userVotes = mockVotes.slice(0, 20);
  const PER_PAGE = 10;
  const totalPages = Math.ceil(userVotes.length / PER_PAGE);
  const pagedVotes = userVotes.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const userBadges = mockBadges.slice(0, 5);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Address copied');
  };

  const loyaltyData = [
    { orgName: 'Meridian Protocol', points: 250 },
    { orgName: 'Axiom Collective', points: 120 },
    { orgName: 'Vertex Gaming', points: 80 },
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <span className="font-mono text-2xl font-bold text-primary">
              {walletAddress.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <code className="font-mono text-lg font-bold">{truncateAddress(walletAddress)}</code>
              <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="font-mono text-sm text-muted-foreground">Base Sepolia</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {([
            { label: 'Voting History', value: 'history' as Tab },
            { label: 'Badges', value: 'badges' as Tab },
            { label: 'Loyalty Points', value: 'loyalty' as Tab },
          ]).map(t => (
            <button
              key={t.value}
              onClick={() => { setTab(t.value); setPage(1); }}
              className={`px-4 py-2 font-mono text-sm ${
                tab === t.value ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'history' && (
          <>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-card">
                  <tr>
                    <th className="px-4 py-3 text-left font-mono text-xs text-muted-foreground font-medium">Proposal</th>
                    <th className="px-4 py-3 text-left font-mono text-xs text-muted-foreground font-medium">Org</th>
                    <th className="px-4 py-3 text-center font-mono text-xs text-muted-foreground font-medium">Vote</th>
                    <th className="px-4 py-3 text-right font-mono text-xs text-muted-foreground font-medium">Power</th>
                    <th className="px-4 py-3 text-right font-mono text-xs text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedVotes.map(v => {
                    const proposal = proposals.find(p => p.id === v.proposalId);
                    const org = proposal ? orgs.find(o => o.id === proposal.orgId) : null;
                    return (
                      <tr key={v.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-mono text-xs max-w-[200px] truncate">{proposal?.title || v.proposalId}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{org?.name || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full px-2 py-0.5 font-mono text-xs ${
                            v.vote === 'yes' ? 'bg-vote-yes/15 text-vote-yes' : 'bg-vote-no/15 text-vote-no'
                          }`}>
                            {v.vote.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatNumber(v.votingPower)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{format(new Date(v.createdAt), 'MMM d')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} variant={page === i + 1 ? 'default' : 'ghost'} size="sm" onClick={() => setPage(i + 1)} className="font-mono text-xs h-8 w-8 p-0">
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'badges' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userBadges.map(badge => {
              const org = orgs.find(o => o.id === badge.orgId);
              return (
                <div key={badge.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-3">
                    <span className="font-mono text-lg text-primary">{badge.name[0]}</span>
                  </div>
                  <h3 className="font-mono text-sm font-semibold">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{org?.name}</p>
                </div>
              );
            })}
            {userBadges.length === 0 && (
              <p className="col-span-3 py-10 text-center font-mono text-muted-foreground">No badges earned yet</p>
            )}
          </div>
        )}

        {tab === 'loyalty' && (
          <div className="space-y-4">
            {loyaltyData.map(item => (
              <div key={item.orgName} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <span className="font-mono text-sm">{item.orgName}</span>
                <span className="font-mono text-lg font-bold text-primary">{item.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
