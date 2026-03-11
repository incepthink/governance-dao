import { Quest } from '@/types';

export const mockQuests: Quest[] = [
  { id: 'quest-1', orgId: 'org-1', title: 'Bridge Explorer', description: 'Complete 5 cross-chain transfers using Meridian Bridge', rewardPoints: 100 },
  { id: 'quest-2', orgId: 'org-1', title: 'Governance Initiate', description: 'Vote on your first proposal in Meridian Protocol', rewardPoints: 50 },
  { id: 'quest-3', orgId: 'org-2', title: 'ZK Learner', description: 'Complete the zero-knowledge proof tutorial series', rewardPoints: 150 },
  { id: 'quest-4', orgId: 'org-2', title: 'Privacy Advocate', description: 'Share a thread about on-chain privacy best practices', rewardPoints: 75 },
  { id: 'quest-5', orgId: 'org-3', title: 'Paper Trail', description: 'Submit a research paper to the Axiom review board', rewardPoints: 200 },
  { id: 'quest-6', orgId: 'org-3', title: 'Data Donor', description: 'Contribute an open dataset to the Axiom repository', rewardPoints: 120 },
  { id: 'quest-7', orgId: 'org-4', title: 'Tournament Victor', description: 'Win a match in a Vertex-sponsored tournament', rewardPoints: 300 },
  { id: 'quest-8', orgId: 'org-4', title: 'Guild Recruiter', description: 'Invite 3 new members to join the Vertex Guild', rewardPoints: 80 },
  { id: 'quest-9', orgId: 'org-5', title: 'Safety Net', description: 'Stake tokens in the Solace insurance pool for 30 days', rewardPoints: 100 },
  { id: 'quest-10', orgId: 'org-6', title: 'Pulse Check', description: 'Submit sentiment reports for 5 consecutive proposals', rewardPoints: 90 },
];
