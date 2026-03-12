import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisconnect } from "wagmi";
import { useAppStore } from "@/store/useAppStore";
import { OrgCard } from "@/components/org/OrgCard";
import { ProposalCard } from "@/components/proposal/ProposalCard";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, Vote, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { createPublicClient, http, isAddress } from "viem";
import { baseSepolia } from "viem/chains";
import { getOwnerOrganisation } from "@/lib/orgApi";
import { Org } from "@/types";

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { walletAddress, owner, proposals, setWalletAddress } = useAppStore();
  const { disconnect } = useDisconnect();
  const [myOrg, setMyOrg] = useState<Org | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress || !owner) {
      navigate("/owner");
    }
  }, [walletAddress, owner, navigate]);

  useEffect(() => {
    if (!walletAddress || !owner) return;

    async function load() {
      setIsLoading(true);
      try {
        const apiOrg = await getOwnerOrganisation();
        if (!apiOrg) {
          setMyOrg(null);
          return;
        }

        let tokenName = "";
        let tokenSymbol = "";
        const addr = apiOrg.contract?.contract_address;

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
            tokenName = n as string;
            tokenSymbol = s as string;
          } catch {
            /* still show org without token details */
          }
        }

        setMyOrg({
          id: Number(apiOrg.id) ?? 1,
          name: apiOrg.name,
          description: apiOrg.description,
          imageUrl: apiOrg.image_uri ?? "",
          bannerUrl: apiOrg.banner_image ?? "",
          tokenName,
          tokenSymbol,
          tokenContractAddress: addr ?? "",
          totalProposals: 0,
          activeProposals: 0,
          memberCount: 0,
          totalVotes: 0,
          ownerWallet: walletAddress,
          ownerEmail: owner.email,
        });
      } catch {
        setMyOrg(null);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [walletAddress, owner]);

  if (!walletAddress || !owner) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // const orgProposals = myOrg
  //   ? proposals.filter((p) => p.orgId === myOrg.id)
  //   : [];

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-8">
        <div className="flex justify-between items-center">
          <h1 className="font-mono text-3xl font-bold mb-8">My Organisation</h1>
          <Button
            className="font-mono"
            onClick={() => {
              disconnect();
              setWalletAddress(null);
              navigate("/owner");
            }}
          >
            Logout
          </Button>
        </div>

        {!myOrg ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="font-mono text-muted-foreground mb-4">
              You haven't created an organisation yet
            </p>
            <Button
              onClick={() => navigate("/create-org")}
              className="font-mono"
            >
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
                {
                  label: "Active Proposals",
                  value: myOrg.activeProposals,
                  icon: FileText,
                },
                { label: "Members", value: myOrg.memberCount, icon: Users },
                {
                  label: "Total Votes",
                  value: formatNumber(myOrg.totalVotes),
                  icon: Vote,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <p className="font-mono text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-xl font-semibold">Proposals</h2>
              <Button
                size="sm"
                onClick={() => navigate(`/org/${myOrg.id}/create-proposal`)}
                className="font-mono text-xs"
              >
                <Plus className="mr-1 h-3 w-3" /> Create Proposal
              </Button>
            </div>

            {/* <div className="space-y-4">
              {orgProposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  tokenSymbol={myOrg.tokenSymbol}
                />
              ))}
              {orgProposals.length === 0 && (
                <p className="py-10 text-center font-mono text-muted-foreground">
                  No proposals yet
                </p>
              )}
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}
