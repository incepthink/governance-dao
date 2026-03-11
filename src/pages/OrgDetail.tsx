import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useState, useMemo } from 'react';
import { ProposalCard } from '@/components/proposal/ProposalCard';
import { StatusBadge } from '@/components/proposal/StatusBadge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, FileText, Users, Vote, Plus } from 'lucide-react';
import { truncateAddress, formatNumber } from '@/lib/format';
import { ProposalStatus } from '@/types';
import { mockMembers } from '@/data/mockMembers';
import { toast } from 'sonner';

type Tab = 'proposals' | 'members';
type ProposalFilter = 'all' | ProposalStatus;

export default function OrgDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgs, proposals, walletAddress } = useAppStore();
  const [tab, setTab] = useState<Tab>('proposals');
  const [proposalFilter, setProposalFilter] = useState<ProposalFilter>('all');
  const [memberPage, setMemberPage] = useState(1);

  const org = orgs.find(o => o.id === id);
  if (!org) return <div className="min-h-screen pt-16 flex items-center justify-center"><p className="font-mono text-muted-foreground">Organisation not found</p></div>;

  const orgProposals = proposals.filter(p => p.orgId === id);
  const filteredProposals = proposalFilter === 'all'
    ? orgProposals
    : orgProposals.filter(p => p.status === proposalFilter);

  const orgMembers = mockMembers.filter(m => m.orgId === id);
  const isOwner = walletAddress === org.ownerWallet;

  const filters: { label: string; value: ProposalFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Closed', value: 'closed' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(org.tokenContractAddress);
    toast.success('Address copied');
  };

  const MEMBERS_PER_PAGE = 5;
  const totalMemberPages = Math.ceil(orgMembers.length / MEMBERS_PER_PAGE);
  const paginatedMembers = orgMembers.slice((memberPage - 1) * MEMBERS_PER_PAGE, memberPage * MEMBERS_PER_PAGE);

  return (
    <div className="min-h-screen pt-16">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-primary/30 via-primary/10 to-accent" />

      <div className="container -mt-12">
        {/* Org Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-background bg-card">
              <span className="font-mono text-2xl font-bold text-primary">{org.name[0]}</span>
            </div>
            <h1 className="mt-3 font-mono text-3xl font-bold">{org.name}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground leading-relaxed">{org.description}</p>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="font-mono text-xs">Manage Org</Button>
              <Button size="sm" className="font-mono text-xs" onClick={() => navigate(`/org/${id}/create-proposal`)}>
                <Plus className="mr-1 h-3 w-3" /> Create Proposal
              </Button>
            </div>
          )}
        </div>

        {/* Token Info */}
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Contract:</span>
            <code className="font-mono text-xs text-foreground">{truncateAddress(org.tokenContractAddress)}</code>
            <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>
          </div>
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
            <span className="font-mono text-xs font-medium text-primary">{org.tokenSymbol}</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">Base Sepolia</span>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Proposals', value: org.totalProposals, icon: FileText },
            { label: 'Active', value: org.activeProposals, icon: FileText },
            { label: 'Members', value: org.memberCount, icon: Users },
            { label: 'Votes', value: formatNumber(org.totalVotes), icon: Vote },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-3">
              <p className="font-mono text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 border-b border-border">
          {(['proposals', 'members'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-mono text-sm capitalize transition-colors ${
                tab === t ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6 pb-20">
          {tab === 'proposals' && (
            <>
              <div className="mb-4 flex gap-1 flex-wrap">
                {filters.map(f => (
                  <Button
                    key={f.value}
                    variant={proposalFilter === f.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setProposalFilter(f.value)}
                    className="font-mono text-xs"
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
              <div className="space-y-4">
                {filteredProposals.map(p => (
                  <ProposalCard key={p.id} proposal={p} tokenSymbol={org.tokenSymbol} />
                ))}
                {filteredProposals.length === 0 && (
                  <p className="py-10 text-center font-mono text-muted-foreground">No proposals found</p>
                )}
              </div>
            </>
          )}

          {tab === 'members' && (
            <>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-card">
                    <tr>
                      <th className="px-4 py-3 text-left font-mono text-xs text-muted-foreground font-medium">Wallet</th>
                      <th className="px-4 py-3 text-right font-mono text-xs text-muted-foreground font-medium">Balance</th>
                      <th className="px-4 py-3 text-right font-mono text-xs text-muted-foreground font-medium">Voting Power</th>
                      <th className="px-4 py-3 text-right font-mono text-xs text-muted-foreground font-medium">Proposals Voted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map(m => (
                      <tr key={m.walletAddress} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-mono text-xs">{truncateAddress(m.walletAddress)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatNumber(m.tokenBalance)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatNumber(m.votingPower)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{m.proposalsVoted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalMemberPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {Array.from({ length: totalMemberPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={memberPage === i + 1 ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setMemberPage(i + 1)}
                      className="font-mono text-xs h-8 w-8 p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
