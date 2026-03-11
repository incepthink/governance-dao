import { useState, useMemo } from 'react';
import { Search, TrendingUp, FileText, Vote } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OrgCard } from '@/components/org/OrgCard';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '@/lib/format';

type Filter = 'all' | 'active' | 'mine';

export default function Landing() {
  const { orgs, proposals, votes, walletAddress } = useAppStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const navigate = useNavigate();

  const totalActiveProposals = proposals.filter(p => p.status === 'active').length;
  const totalVotesCast = votes.length;

  const filteredOrgs = useMemo(() => {
    let result = orgs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
    }
    if (filter === 'active') result = result.filter(o => o.activeProposals > 0);
    if (filter === 'mine') result = result.filter(o => o.ownerWallet === walletAddress);
    return result;
  }, [orgs, search, filter, walletAddress]);

  const stats = [
    { label: 'Total Orgs', value: orgs.length, icon: TrendingUp },
    { label: 'Active Proposals', value: totalActiveProposals, icon: FileText },
    { label: 'Total Votes Cast', value: formatNumber(totalVotesCast), icon: Vote },
  ];

  const filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active Proposals', value: 'active' },
    { label: 'My Orgs', value: 'mine' },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-blob gradient-blob-animated pointer-events-none" />
        <div className="container relative">
          <h1 className="font-mono text-4xl font-bold leading-tight text-foreground md:text-6xl max-w-3xl">
            Decentralised Governance, Powered by Your Community
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Create organisations, launch proposals, and let your community vote on-chain. 
            Transparent, trustless governance on Base Sepolia.
          </p>
          <Button
            size="lg"
            onClick={() => {
              document.getElementById('orgs')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-8 font-mono"
          >
            Explore Organisations
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="container -mt-8 mb-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Orgs */}
      <section id="orgs" className="container pb-20">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search organisations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border font-mono text-sm"
            />
          </div>
          <div className="flex gap-1">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f.value)}
                className="font-mono text-xs"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>

        {filteredOrgs.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-mono text-muted-foreground">No organisations found</p>
          </div>
        )}
      </section>
    </div>
  );
}
