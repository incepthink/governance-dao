import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { WagmiProvider, useAccount, useSignMessage } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { walletAuthenticate } from "@/lib/walletAuth";
import { toast } from "sonner";
import Landing from "./pages/Landing";
import OrgDetail from "./pages/OrgDetail";
import ProposalDetail from "./pages/ProposalDetail";
import CreateOrg from "./pages/CreateOrg";
import CreateProposal from "./pages/CreateProposal";
import Owner from "./pages/Owner";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function WalletSync() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const setWalletAddress = useAppStore((s) => s.setWalletAddress);
  const setWalletUser = useAppStore((s) => s.setWalletUser);
  const prevAddress = useRef<string | undefined>(undefined);

  useEffect(() => {
    setWalletAddress(address ?? null);

    if (address && prevAddress.current !== address) {
      walletAuthenticate(address, signMessageAsync)
        .then((user_instance) => {
          setWalletUser(user_instance);
          toast.success("Wallet authenticated");
        })
        .catch(() => {
          toast.error("Wallet authentication failed");
        });
    }

    prevAddress.current = address;
  }, [address, setWalletAddress, setWalletUser, signMessageAsync]);

  return null;
}

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter basename="/examples/governance-dao">
            <WalletSync />
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/org/:id" element={<OrgDetail />} />
              <Route
                path="/org/:id/proposal/:proposalId"
                element={<ProposalDetail />}
              />
              <Route path="/create-org" element={<CreateOrg />} />
              <Route path="/org/:id/create-proposal" element={<CreateProposal />} />
              <Route path="/owner" element={<Owner />} />
              <Route path="/owner/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
