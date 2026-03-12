import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'HashVote',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [baseSepolia],
  ssr: false,
});
