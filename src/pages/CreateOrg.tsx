import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { uploadImage, createOrganisation } from "@/lib/orgApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, ImageIcon, Loader2, X } from "lucide-react";
import { createPublicClient, http, isAddress } from "viem";
import { baseSepolia } from "viem/chains";

const erc20NameSymbolAbi = [
  { name: "name", type: "function", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { name: "symbol", type: "function", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
] as const;

const tokenClient = createPublicClient({
  chain: baseSepolia,
  transport: http(import.meta.env.VITE_BASE_TESTNET_RPC),
});

export default function CreateOrg() {
  const navigate = useNavigate();
  const { walletAddress } = useAppStore();
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cardImage, setCardImage] = useState<File | null>(null);
  const [cardImagePreview, setCardImagePreview] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [detectedToken, setDetectedToken] = useState<{
    name: string;
    symbol: string;
  } | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!walletAddress) {
    toast.error("Connect your wallet first");
    navigate("/");
    return null;
  }

  const handleCardImage = (file: File) => {
    setCardImage(file);
    setCardImagePreview(URL.createObjectURL(file));
  };

  const handleBannerImage = (file: File) => {
    setBannerImage(file);
    setBannerImagePreview(URL.createObjectURL(file));
  };

  const removeCardImage = () => {
    setCardImage(null);
    setCardImagePreview("");
    if (cardInputRef.current) cardInputRef.current.value = "";
  };

  const removeBannerImage = () => {
    setBannerImage(null);
    setBannerImagePreview("");
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleTokenInput = async (value: string) => {
    setTokenAddress(value);
    setTokenError("");
    setDetectedToken(null);

    if (!isAddress(value)) {
      if (value.length > 0) setTokenError("Invalid contract address");
      return;
    }

    setIsLoadingToken(true);
    try {
      const [name, symbol] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tokenClient.readContract({ address: value, abi: erc20NameSymbolAbi, functionName: "name" } as any),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tokenClient.readContract({ address: value, abi: erc20NameSymbolAbi, functionName: "symbol" } as any),
      ]);
      setDetectedToken({ name: name as string, symbol: symbol as string });
    } catch {
      setTokenError("Could not fetch token details. Is this a valid ERC20?");
    } finally {
      setIsLoadingToken(false);
    }
  };

  const canNext = () => {
    if (step === 1) return name && description;
    if (step === 2) return detectedToken !== null;
    return true;
  };

  const handleCreate = async () => {
    if (!detectedToken) return;
    setIsSubmitting(true);
    try {
      const [imageUri, bannerUri] = await Promise.all([
        cardImage ? uploadImage(cardImage) : Promise.resolve(undefined),
        bannerImage ? uploadImage(bannerImage) : Promise.resolve(undefined),
      ]);

      await createOrganisation({
        collection: {
          name,
          description,
          image_uri: imageUri,
          banner_image: bannerUri,
        },
        contract: { address: tokenAddress },
      });

      toast.success("Organisation created!");
      navigate("/owner/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create organisation";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ["Basic Info", "Token Setup", "Review"];

  return (
    <div className="min-h-screen pt-16">
      <div className="container max-w-2xl py-12">
        <h1 className="font-mono text-3xl font-bold mb-8">
          Create Organisation
        </h1>

        {/* Progress */}
        <div className="mb-10 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold ${
                  i + 1 <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1 < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`font-mono text-xs hidden sm:block ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px ${i + 1 < step ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label className="font-mono text-sm">Organisation Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My DAO"
                className="mt-1 bg-card border-border"
              />
            </div>
            <div>
              <Label className="font-mono text-sm">Description *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is your organisation about?"
                rows={4}
                className="mt-1 bg-card border-border"
              />
            </div>

            {/* Card Image */}
            <div>
              <Label className="font-mono text-sm">Card Image</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Square thumbnail shown on org cards (recommended 400×200)
              </p>
              {cardImagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={cardImagePreview}
                    alt="Card preview"
                    className="h-[200px] w-[400px] rounded-xl object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={removeCardImage}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => cardInputRef.current?.click()}
                  className="flex h-[200px] w-[400px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImageIcon className="h-6 w-6" />
                  <span className="font-mono text-xs text-center leading-tight">
                    Click to upload
                  </span>
                </button>
              )}
              <input
                ref={cardInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleCardImage(e.target.files[0])
                }
              />
            </div>

            {/* Banner Image */}
            <div>
              <Label className="font-mono text-sm">Banner Image</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Wide cover image displayed on the org profile (recommended
                1200×300)
              </p>
              {bannerImagePreview ? (
                <div className="relative">
                  <img
                    src={bannerImagePreview}
                    alt="Banner preview"
                    className="h-28 w-full rounded-xl object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={removeBannerImage}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImageIcon className="h-6 w-6" />
                  <span className="font-mono text-xs">
                    Click to upload banner image
                  </span>
                </button>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleBannerImage(e.target.files[0])
                }
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Your wallet ({walletAddress.slice(0, 6)}...
              {walletAddress.slice(-4)}) will be linked automatically.
            </p>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <Label className="font-mono text-sm">
                ERC20 Contract Address *
              </Label>
              <Input
                value={tokenAddress}
                onChange={(e) => handleTokenInput(e.target.value)}
                placeholder="0x..."
                className="mt-1 bg-card border-border font-mono"
              />
              {isLoadingToken && (
                <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Fetching token details…
                </div>
              )}
              {tokenError && (
                <p className="mt-1 text-xs text-destructive font-mono">
                  {tokenError}
                </p>
              )}
              {detectedToken && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-vote-yes/10 px-3 py-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-vote-yes" />
                  <span className="font-mono text-xs text-vote-yes">
                    Detected: {detectedToken.symbol} — {detectedToken.name}
                  </span>
                </div>
              )}
            </div>
            <div>
              <Label className="font-mono text-sm">Chain</Label>
              <Input
                value="Base Sepolia"
                readOnly
                className="mt-1 bg-card border-border font-mono text-muted-foreground"
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-mono text-lg font-semibold">Review</h2>

            {/* Image previews */}
            {(cardImagePreview || bannerImagePreview) && (
              <div className="space-y-3">
                {bannerImagePreview && (
                  <img
                    src={bannerImagePreview}
                    alt="Banner"
                    className="h-24 w-full rounded-lg object-cover border border-border"
                  />
                )}
                {cardImagePreview && (
                  <img
                    src={cardImagePreview}
                    alt="Card"
                    className="h-16 w-16 rounded-lg object-cover border border-border"
                  />
                )}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-mono">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description</span>
                <span className="font-mono text-right max-w-xs truncate">
                  {description}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Card Image</span>
                <span className="font-mono">
                  {cardImage ? cardImage.name : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Banner Image</span>
                <span className="font-mono">
                  {bannerImage ? bannerImage.name : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token</span>
                <span className="font-mono">
                  {detectedToken?.symbol} — {detectedToken?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain</span>
                <span className="font-mono">Base Sepolia</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
            className="font-mono"
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="font-mono"
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isSubmitting} className="font-mono">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</>
              ) : (
                "Create Organisation"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
