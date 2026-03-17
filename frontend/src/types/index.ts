// Core types for CrowdFundX frontend

export interface Campaign {
  id: number;
  creator: string;
  title: string;
  description: string;
  category: string;
  funding_goal: string;
  current_funding: string;
  deadline: number;
  status: 'draft' | 'active' | 'completed' | 'expired' | 'cancelled';
  created_at: number;
  updated_at: number;
  metadata?: Record<string, string>;
  image_url?: string;
  video_url?: string;
  tags?: string[];
  rewards?: RewardTier[];
}

export interface RewardTier {
  id: number;
  campaign_id: number;
  amount: string;
  title: string;
  description: string;
  benefits: string[];
  max_backers?: number;
  current_backers: number;
  is_nft: boolean;
  nft_metadata?: Record<string, string>;
  claimed_at?: number;
}

export interface Contribution {
  contributor: string;
  amount: string;
  asset: string;
  timestamp: number;
  transaction_hash: string;
  is_refunded: boolean;
}

export interface User {
  id: string;
  public_key: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  created_at: number;
  is_verified: boolean;
  reputation_score: number;
}

export interface WalletState {
  isConnected: boolean;
  publicKey?: string;
  network: 'testnet' | 'mainnet' | 'futurenet';
  balance?: string;
}

export interface StellarTransaction {
  hash: string;
  ledger: number;
  timestamp: number;
  operations: StellarOperation[];
  fee_paid: string;
}

export interface StellarOperation {
  type: string;
  source_account?: string;
  amount?: string;
  asset?: string;
  destination?: string;
}

export interface NFTInfo {
  token_id: string;
  name: string;
  description: string;
  image_url: string;
  attributes: Record<string, string>;
  owner: string;
  created_at: number;
}

export interface Proposal {
  id: number;
  proposer: string;
  title: string;
  description: string;
  proposal_type: 'treasury_withdrawal' | 'contract_upgrade' | 'parameter_change' | 'add_supported_asset';
  voting_start: number;
  voting_end: number;
  votes_for: string;
  votes_against: string;
  executed: boolean;
  created_at: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface FilterOptions {
  category?: string;
  status?: Campaign['status'];
  min_goal?: string;
  max_goal?: string;
  sort_by?: 'created_at' | 'funding_goal' | 'current_funding' | 'deadline';
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export interface CreateCampaignData {
  title: string;
  description: string;
  category: string;
  funding_goal: string;
  deadline: number;
  image_url?: string;
  video_url?: string;
  tags?: string[];
  rewards?: Omit<RewardTier, 'id' | 'campaign_id' | 'current_backers'>[];
}

export interface ContributionData {
  campaign_id: number;
  amount: string;
  asset: string;
}

export interface VoteData {
  proposal_id: number;
  vote_choice: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Toast notification types
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

// Analytics types
export interface CampaignAnalytics {
  total_campaigns: number;
  active_campaigns: number;
  completed_campaigns: number;
  total_funding: string;
  average_funding: string;
  success_rate: number;
  category_distribution: Record<string, number>;
  monthly_trends: ChartData;
}

export interface UserAnalytics {
  total_contributions: number;
  total_amount_contributed: string;
  campaigns_supported: number;
  rewards_claimed: number;
  contribution_history: Contribution[];
  favorite_categories: string[];
}
