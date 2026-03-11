import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { OrgCard } from '@/components/org/OrgCard';
import { ProposalCard } from '@/components/proposal/ProposalCard';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, Vote } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { useEffect } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { walletAddress, ownerAccount, orgs, proposals } = useAppStore();

  useEffect(() => {
    if (!walletAddress || !ownerAccount) {
      navigate('/owner');
    }
  }, [walletAddress, ownerAccount, navigate]);

  if (!walletAddress || !ownerAccount) return null;

  const myOrg = orgs.find(o => o.ownerWallet === walletAddress || o.id === ownerAccount.orgId);
  const orgProposals = myOrg ? proposals.filter(p => p.orgId === myOrg.id) : [];

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-8">
        <h1 className="font-mono text-3xl font-bold mb-8">My Organisation</h1>

        {!myOrg ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="font-mono text-muted-foreground mb-4">You haven't created an organisation yet</p>
            <Button onClick={() => navigate('/create-org')} className="font-mono">
              <Plus className="mr-2 h-4 w-4" /> Create Organisation
            </Button>
          </div>
        ) : (
          <>
            <div className="max-w-lg mb-8">
              <OrgCard org={myOrg} />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Active Proposals', value: myOrg.activeProposals, icon: FileText },
                { label: 'Members', value: myOrg.memberCount, icon: Users },
                { label: 'Total Votes', value: formatNumber(myOrg.totalVotes), icon: Vote },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-border bg-card p-4">
                  <p className="font-mono text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-xl font-semibold">Proposals</h2>
              <Button size="sm" onClick={() => navigate(`/org/${myOrg.id}/create-proposal`)} className="font-mono text-xs">
                <Plus className="mr-1 h-3 w-3" /> Create Proposal
              </Button>
            </div>

            <div className="space-y-4">
              {orgProposals.map(p => (
                <ProposalCard key={p.id} proposal={p} tokenSymbol={myOrg.tokenSymbol} />
              ))}
              {orgProposals.length === 0 && (
                <p className="py-10 text-center font-mono text-muted-foreground">No proposals yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
