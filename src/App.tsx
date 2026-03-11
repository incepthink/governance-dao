import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
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
  </QueryClientProvider>
);

export default App;
