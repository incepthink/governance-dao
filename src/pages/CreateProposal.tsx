import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, Plus, X, Star, Award, Shield, Scroll, Minus } from 'lucide-react';
import { ParticipationRule, RuleType } from '@/types';
import { mockBadges } from '@/data/mockBadges';
import { mockQuests } from '@/data/mockQuests';
import { mockMetadata } from '@/data/mockMetadata';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CreateProposal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgs, walletAddress, addProposal } = useAppStore();

  const [step, setStep] = useState(1);

  // Step 1
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Step 2
  const [minThreshold, setMinThreshold] = useState(0);

  // Step 3
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [rules, setRules] = useState<ParticipationRule[]>([]);

  // Step 4
  const [minParticipants, setMinParticipants] = useState(1);
  const [yesNoRatio, setYesNoRatio] = useState(1.5);

  const org = orgs.find(o => o.id === id);
  const orgBadges = mockBadges.filter(b => b.orgId === id);
  const orgQuests = mockQuests.filter(q => q.orgId === id);
  const orgMeta = mockMetadata.filter(m => m.orgId === id);

  if (!org || walletAddress !== org.ownerWallet) {
    navigate('/');
    return null;
  }

  const addRule = (type: RuleType) => {
    if (rules.length >= 8) return;
    const newRule: ParticipationRule = {
      id: `rule-${Date.now()}`,
      type,
      ...(type === 'loyalty' ? { loyaltyMin: 10 } : {}),
      ...(type === 'badge' ? { badgeIds: [] } : {}),
      ...(type === 'nft' ? { metadataIds: [] } : {}),
      ...(type === 'quest' ? { questIds: [] } : {}),
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (ruleId: string) => setRules(rules.filter(r => r.id !== ruleId));

  const updateRule = (ruleId: string, updates: Partial<ParticipationRule>) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, ...updates } : r));
  };

  const ruleIcon = (type: RuleType) => {
    const icons = { loyalty: Star, badge: Award, nft: Shield, quest: Scroll };
    return icons[type];
  };

  const canNext = () => {
    if (step === 1) return title && description && startDate && endDate && new Date(endDate) > new Date(startDate);
    if (step === 4) return minParticipants >= 1;
    return true;
  };

  const handleCreate = () => {
    addProposal({
      id: `prop-${Date.now()}`,
      orgId: id!,
      title,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: 'active',
      yesVotes: 0,
      noVotes: 0,
      totalVoters: 0,
      minTokenThreshold: minThreshold,
      participationLogic: logic,
      participationRules: rules,
      minParticipants,
      yesNoRatio,
      creatorWallet: walletAddress!,
      createdAt: new Date().toISOString(),
    });
    toast.success('Proposal created!');
    navigate(`/org/${id}`);
  };

  const steps = ['Basic Info', 'Voting Power', 'Rules', 'Acceptance', 'Review'];
  const exampleRequired = Math.ceil(yesNoRatio * 20);

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Step Indicator - Desktop */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20 space-y-2">
              {steps.map((s, i) => (
                <button
                  key={s}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-mono text-sm transition-colors ${
                    i + 1 === step ? 'bg-primary/10 text-primary' : i + 1 < step ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                  onClick={() => i + 1 < step && setStep(i + 1)}
                  disabled={i + 1 > step}
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    i + 1 <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1 < step ? <CheckCircle className="h-3 w-3" /> : i + 1}
                  </div>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile progress */}
          <div className="lg:hidden flex items-center gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            <h1 className="font-mono text-2xl font-bold mb-6">{steps[step - 1]}</h1>

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label className="font-mono text-sm">Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value.slice(0, 100))} placeholder="Proposal title" className="mt-1 bg-card border-border" />
                  <p className="mt-1 text-xs text-muted-foreground font-mono">{title.length}/100</p>
                </div>
                <div>
                  <Label className="font-mono text-sm">Description * (Markdown supported)</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your proposal..." rows={8} className="mt-1 bg-card border-border font-mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-mono text-sm">Start Date *</Label>
                    <Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 bg-card border-border font-mono text-sm" />
                  </div>
                  <div>
                    <Label className="font-mono text-sm">End Date *</Label>
                    <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 bg-card border-border font-mono text-sm" />
                    {endDate && startDate && new Date(endDate) <= new Date(startDate) && (
                      <p className="mt-1 text-xs text-destructive font-mono">End must be after start</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <Label className="font-mono text-sm">Minimum {org.tokenSymbol} to vote</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value={minThreshold}
                      onChange={e => setMinThreshold(Number(e.target.value))}
                      min={0}
                      className="bg-card border-border font-mono"
                    />
                    <span className="font-mono text-sm text-primary">{org.tokenSymbol}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Users holding fewer than this amount cannot vote. Set to 0 to allow all token holders.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono text-foreground">Voting weight</span> = token balance held at vote time
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Participants must meet</span>
                  <Select value={logic} onValueChange={(v) => setLogic(v as 'AND' | 'OR')}>
                    <SelectTrigger className="w-32 bg-card border-border font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">ALL rules</SelectItem>
                      <SelectItem value="OR">ANY rule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <AnimatePresence>
                  {rules.map(rule => {
                    const Icon = ruleIcon(rule.type);
                    return (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative rounded-xl border border-border bg-card p-4"
                      >
                        <button onClick={() => removeRule(rule.id)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="font-mono text-sm font-medium capitalize">{rule.type}</span>
                        </div>

                        {rule.type === 'loyalty' && (
                          <div>
                            <Label className="font-mono text-xs">Minimum loyalty points</Label>
                            <Input
                              type="number"
                              value={rule.loyaltyMin || 0}
                              onChange={e => updateRule(rule.id, { loyaltyMin: Number(e.target.value) })}
                              className="mt-1 bg-background border-border font-mono text-sm w-40"
                            />
                          </div>
                        )}

                        {rule.type === 'badge' && (
                          <div className="flex flex-wrap gap-2">
                            {orgBadges.map(badge => (
                              <button
                                key={badge.id}
                                onClick={() => {
                                  const ids = rule.badgeIds || [];
                                  updateRule(rule.id, {
                                    badgeIds: ids.includes(badge.id) ? ids.filter(i => i !== badge.id) : [...ids, badge.id],
                                  });
                                }}
                                className={`rounded-full px-3 py-1 font-mono text-xs border transition-colors ${
                                  rule.badgeIds?.includes(badge.id) ? 'bg-primary/15 text-primary border-primary/30' : 'bg-background border-border text-muted-foreground'
                                }`}
                              >
                                {badge.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {rule.type === 'nft' && (
                          <div className="flex flex-wrap gap-2">
                            {orgMeta.map(meta => (
                              <button
                                key={meta.id}
                                onClick={() => {
                                  const ids = rule.metadataIds || [];
                                  updateRule(rule.id, {
                                    metadataIds: ids.includes(meta.id) ? ids.filter(i => i !== meta.id) : [...ids, meta.id],
                                  });
                                }}
                                className={`rounded-full px-3 py-1 font-mono text-xs border transition-colors ${
                                  rule.metadataIds?.includes(meta.id) ? 'bg-primary/15 text-primary border-primary/30' : 'bg-background border-border text-muted-foreground'
                                }`}
                              >
                                {meta.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {rule.type === 'quest' && (
                          <div className="space-y-2">
                            {orgQuests.map(quest => (
                              <button
                                key={quest.id}
                                onClick={() => {
                                  const ids = rule.questIds || [];
                                  updateRule(rule.id, {
                                    questIds: ids.includes(quest.id) ? ids.filter(i => i !== quest.id) : [...ids, quest.id],
                                  });
                                }}
                                className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${
                                  rule.questIds?.includes(quest.id) ? 'bg-primary/15 border-primary/30' : 'bg-background border-border'
                                }`}
                              >
                                <span className="font-mono text-xs font-medium">{quest.title}</span>
                                <p className="text-xs text-muted-foreground line-clamp-1">{quest.description}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {rules.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                    <p className="font-mono text-sm text-muted-foreground">No rules added — all token holders can vote</p>
                  </div>
                )}

                {rules.length < 8 && (
                  <div className="flex flex-wrap gap-2">
                    {(['loyalty', 'badge', 'nft', 'quest'] as RuleType[]).map(type => {
                      const Icon = ruleIcon(type);
                      return (
                        <Button key={type} variant="outline" size="sm" onClick={() => addRule(type)} className="font-mono text-xs">
                          <Plus className="mr-1 h-3 w-3" />
                          <Icon className="mr-1 h-3 w-3" />
                          {type}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <Label className="font-mono text-sm">Minimum participants</Label>
                  <Input
                    type="number"
                    value={minParticipants}
                    onChange={e => setMinParticipants(Math.max(1, Number(e.target.value)))}
                    min={1}
                    className="mt-1 bg-card border-border font-mono w-40"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Minimum number of wallets that must vote</p>
                </div>

                <div>
                  <Label className="font-mono text-sm">Yes/No Ratio Multiplier</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Button
                      variant="outline" size="icon"
                      onClick={() => setYesNoRatio(Math.max(1.0, Math.round((yesNoRatio - 0.1) * 10) / 10))}
                      className="h-10 w-10 border-border"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex h-10 w-20 items-center justify-center rounded-lg border border-border bg-card">
                      <span className="font-mono text-lg font-bold">{yesNoRatio}×</span>
                    </div>
                    <Button
                      variant="outline" size="icon"
                      onClick={() => setYesNoRatio(Math.min(10.0, Math.round((yesNoRatio + 0.1) * 10) / 10))}
                      className="h-10 w-10 border-border"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Yes votes must be ≥ {yesNoRatio}× No votes. With 20 No votes, you need at least {exampleRequired} Yes votes.
                  </p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span className="font-mono max-w-xs text-right">{title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Timeline</span><span className="font-mono text-xs">{startDate} → {endDate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Min Tokens</span><span className="font-mono">{minThreshold} {org.tokenSymbol}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Logic</span><span className="font-mono">{logic}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rules</span><span className="font-mono">{rules.length} rules</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Min Participants</span><span className="font-mono">{minParticipants}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ratio</span><span className="font-mono">{yesNoRatio}×</span></div>
                </div>
              </div>
            )}

            {/* Nav */}
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="font-mono">Back</Button>
              {step < 5 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="font-mono">Continue</Button>
              ) : (
                <Button onClick={handleCreate} className="font-mono">Create Proposal</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
