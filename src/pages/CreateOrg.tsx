import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export default function CreateOrg() {
  const navigate = useNavigate();
  const { walletAddress, addOrg, ownerAccount } = useAppStore();
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(ownerAccount?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [detectedToken, setDetectedToken] = useState<{ name: string; symbol: string } | null>(null);
  const [tokenError, setTokenError] = useState('');

  if (!walletAddress) {
    toast.error('Connect your wallet first');
    navigate('/');
    return null;
  }

  const handleTokenInput = (value: string) => {
    setTokenAddress(value);
    setTokenError('');
    setDetectedToken(null);
    if (value.length === 42 && value.startsWith('0x')) {
      // Simulate token detection
      setTimeout(() => {
        setDetectedToken({ name: 'Community Token', symbol: 'CMT' });
      }, 500);
    } else if (value.length > 0) {
      setTokenError('Invalid contract address');
    }
  };

  const canNext = () => {
    if (step === 1) return name && description && email && password && password === confirmPassword;
    if (step === 2) return detectedToken !== null;
    return true;
  };

  const handleCreate = () => {
    if (!detectedToken) return;
    addOrg({
      id: `org-${Date.now()}`,
      name,
      description,
      imageUrl: '',
      bannerUrl: '',
      tokenSymbol: detectedToken.symbol,
      tokenName: detectedToken.name,
      tokenContractAddress: tokenAddress,
      totalProposals: 0,
      activeProposals: 0,
      memberCount: 1,
      totalVotes: 0,
      ownerWallet: walletAddress,
      ownerEmail: email,
    });
    toast.success('Organisation created!');
    navigate('/owner/dashboard');
  };

  const steps = ['Basic Info', 'Token Setup', 'Review'];

  return (
    <div className="min-h-screen pt-16">
      <div className="container max-w-2xl py-12">
        <h1 className="font-mono text-3xl font-bold mb-8">Create Organisation</h1>

        {/* Progress */}
        <div className="mb-10 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold ${
                i + 1 <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1 < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`font-mono text-xs hidden sm:block ${i + 1 <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${i + 1 < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label className="font-mono text-sm">Organisation Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="My DAO" className="mt-1 bg-card border-border" />
            </div>
            <div>
              <Label className="font-mono text-sm">Description *</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is your organisation about?" rows={4} className="mt-1 bg-card border-border" />
            </div>
            <div>
              <Label className="font-mono text-sm">Email *</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@dao.xyz" className="mt-1 bg-card border-border" />
            </div>
            <div>
              <Label className="font-mono text-sm">Password *</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 bg-card border-border" />
            </div>
            <div>
              <Label className="font-mono text-sm">Confirm Password *</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 bg-card border-border" />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-destructive font-mono">Passwords do not match</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Your wallet ({walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}) will be linked automatically.
            </p>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <Label className="font-mono text-sm">ERC20 Contract Address *</Label>
              <Input
                value={tokenAddress}
                onChange={e => handleTokenInput(e.target.value)}
                placeholder="0x..."
                className="mt-1 bg-card border-border font-mono"
              />
              {tokenError && <p className="mt-1 text-xs text-destructive font-mono">{tokenError}</p>}
              {detectedToken && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-vote-yes/10 px-3 py-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-vote-yes" />
                  <span className="font-mono text-xs text-vote-yes">Detected: {detectedToken.symbol} — {detectedToken.name}</span>
                </div>
              )}
            </div>
            <div>
              <Label className="font-mono text-sm">Chain</Label>
              <Input value="Base Sepolia" readOnly className="mt-1 bg-card border-border font-mono text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-mono text-lg font-semibold">Review</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-mono">{name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Description</span><span className="font-mono text-right max-w-xs truncate">{description}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-mono">{email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Token</span><span className="font-mono">{detectedToken?.symbol} — {detectedToken?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Chain</span><span className="font-mono">Base Sepolia</span></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="font-mono"
          >
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="font-mono">
              Continue
            </Button>
          ) : (
            <Button onClick={handleCreate} className="font-mono">
              Create Organisation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
