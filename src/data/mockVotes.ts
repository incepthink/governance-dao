import { Vote } from '@/types';

const wallets = [
  '0xa1b2c3d4e5f67890123456789abcdef012345678',
  '0xb2c3d4e5f67890123456789abcdef0123456789a',
  '0xc3d4e5f67890123456789abcdef0123456789ab0',
  '0xd4e5f67890123456789abcdef0123456789ab01c',
  '0xe5f67890123456789abcdef0123456789ab01cd2',
  '0xf67890123456789abcdef0123456789ab01cd2e3',
  '0x7890123456789abcdef0123456789ab01cd2e3f4',
  '0x890123456789abcdef0123456789ab01cd2e3f45',
  '0x90123456789abcdef0123456789ab01cd2e3f456',
  '0x0123456789abcdef0123456789ab01cd2e3f4567',
  '0x123456789abcdef0123456789ab01cd2e3f45678',
  '0x23456789abcdef0123456789ab01cd2e3f456789',
  '0x3456789abcdef0123456789ab01cd2e3f4567890',
  '0x456789abcdef0123456789ab01cd2e3f45678901',
  '0x56789abcdef0123456789ab01cd2e3f456789012',
];

function generateVotes(proposalId: string, count: number): Vote[] {
  return wallets.slice(0, count).map((wallet, i) => ({
    id: `vote-${proposalId}-${i}`,
    proposalId,
    voterWalletAddress: wallet,
    vote: Math.random() > 0.35 ? 'yes' as const : 'no' as const,
    votingPower: Math.floor(Math.random() * 5000) + 100,
    createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
  }));
}

export const mockVotes: Vote[] = [
  ...generateVotes('prop-1', 12),
  ...generateVotes('prop-2', 10),
  ...generateVotes('prop-5', 15),
  ...generateVotes('prop-8', 14),
  ...generateVotes('prop-11', 15),
  ...generateVotes('prop-12', 8),
  ...generateVotes('prop-13', 12),
];
