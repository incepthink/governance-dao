import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { truncateAddress } from "@/lib/format";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function Owner() {
  const navigate = useNavigate();
  const { address: walletAddress } = useAccount();
  const { owner, loginOwner, signupOwner } = useAppStore();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (owner) {
      navigate("/owner/dashboard");
    }
  }, [owner, navigate]);

  if (!walletAddress) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="rounded-xl border border-border bg-card p-8 text-center max-w-md flex flex-col items-center">
          <Wallet className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="font-mono text-xl font-bold mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Connect your wallet to continue as an Owner
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await loginOwner(email, password);
      toast.success("Logged in!");
      navigate("/owner/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await signupOwner(name, email, password);
      toast.success("Account created!");
      navigate("/create-org");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isLoginDisabled = !email || !password || isLoading;
  const isSignupDisabled =
    !name || !email || !password || password !== confirmPassword || isLoading;

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="rounded-xl border border-border bg-card p-8 max-w-md w-full">
        <h2 className="font-mono text-xl font-bold mb-6 text-center">
          Owner Gateway
        </h2>

        <div className="flex gap-1 mb-6 border-b border-border">
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-mono text-sm capitalize ${
                tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tab === "signup" && (
            <div>
              <Label className="font-mono text-sm">Name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 bg-background border-border"
              />
            </div>
          )}
          <div>
            <Label className="font-mono text-sm">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dao.xyz"
              className="mt-1 bg-background border-border"
            />
          </div>
          <div>
            <Label className="font-mono text-sm">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-background border-border"
            />
          </div>
          {tab === "signup" && (
            <div>
              <Label className="font-mono text-sm">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-background border-border"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Wallet: {truncateAddress(walletAddress)} (linked automatically)
          </p>
          <Button
            onClick={tab === "login" ? handleLogin : handleSignup}
            className="w-full font-mono"
            disabled={tab === "login" ? isLoginDisabled : isSignupDisabled}
          >
            {isLoading
              ? "Please wait..."
              : tab === "login"
                ? "Log In"
                : "Create Owner Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
