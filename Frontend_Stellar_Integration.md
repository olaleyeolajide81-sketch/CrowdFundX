# CrowdFundX Frontend Stellar Integration Guide

## 🌟 Overview

This guide provides comprehensive documentation for integrating the CrowdFundX frontend with the Stellar blockchain, including wallet connections, smart contract interactions, and transaction handling.

---

## 🏗️ Architecture Overview

### Frontend-Blockchain Integration Flow
```
Frontend App
    ↓
Stellar Service Layer
    ↓
Stellar SDK / Soroban Client
    ↓
Stellar Network (Testnet/Mainnet)
    ↓
Smart Contracts
```

### Key Components
- **Wallet Integration**: Freighter wallet connection
- **Stellar SDK**: API interactions with Stellar network
- **Soroban Client**: Smart contract interactions
- **Transaction Builder**: Create and sign transactions
- **Event Listener**: Real-time blockchain events

---

## 🔐 Wallet Integration

### Freighter Wallet Setup

#### 1. Install Dependencies
```bash
npm install @stellar/freighter-api stellar-sdk soroban-client
```

#### 2. Wallet Service Implementation
```typescript
// src/services/walletService.ts
import { FreighterApi } from '@stellar/freighter-api';
import { Server, Networks, TransactionBuilder, Account } from 'stellar-sdk';
import { SorobanClient } from 'soroban-client';

export class WalletService {
  private freighterApi: FreighterApi;
  private server: Server;
  private sorobanClient: SorobanClient;
  private networkPassphrase: string;

  constructor() {
    this.freighterApi = new FreighterApi();
    this.server = new Server(process.env.VITE_STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org');
    this.sorobanClient = new SorobanClient(process.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org');
    this.networkPassphrase = process.env.VITE_STELLAR_NETWORK === 'mainnet' 
      ? Networks.PUBLIC 
      : Networks.TESTNET;
  }

  /**
   * Connect to Freighter wallet
   */
  async connectWallet(): Promise<{ publicKey: string; network: string }> {
    try {
      // Check if Freighter is installed
      const isInstalled = await this.freighterApi.isInstalled();
      if (!isInstalled) {
        throw new Error('Freighter wallet is not installed');
      }

      // Get user's public key
      const { publicKey } = await this.freighterApi.getPublicKey();
      
      // Get network information
      const { network } = await this.freighterApi.getNetwork();

      return { publicKey, network };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    // Freighter doesn't have a disconnect method, but we can clear local state
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('public_key');
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<string> {
    try {
      const account = await this.server.loadAccount(publicKey);
      const balance = account.balances.find(b => b.asset_type === 'native');
      return balance ? (balance as any).balance : '0';
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Sign and submit transaction
   */
  async signAndSubmitTransaction(xdr: string): Promise<{ hash: string; status: string }> {
    try {
      // Sign transaction with Freighter
      const signedXdr = await this.freighterApi.signXDR(xdr, {
        network: this.networkPassphrase,
        networkPassphrase: this.networkPassphrase,
      });

      // Submit transaction to Stellar
      const transaction = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);
      const result = await this.server.submitTransaction(transaction);

      return {
        hash: result.hash,
        status: result.status === 'SUCCESS' ? 'success' : 'failed'
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<{ network: string; passphrase: string }> {
    const network = process.env.VITE_STELLAR_NETWORK || 'testnet';
    const passphrase = this.networkPassphrase;

    return { network, passphrase };
  }
}
```

#### 3. Wallet Context Provider
```typescript
// src/contexts/WalletContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { WalletService } from '../services/walletService';
import { WalletState } from '../types';

interface WalletContextType {
  state: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

type WalletAction = 
  | { type: 'CONNECT_WALLET'; payload: { publicKey: string; network: string } }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'UPDATE_BALANCE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'CONNECT_WALLET':
      return {
        ...state,
        isConnected: true,
        publicKey: action.payload.publicKey,
        network: action.payload.network,
        loading: false,
        error: null,
      };
    case 'DISCONNECT_WALLET':
      return {
        ...state,
        isConnected: false,
        publicKey: undefined,
        balance: undefined,
        error: null,
      };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        balance: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

const initialState: WalletState = {
  isConnected: false,
  network: 'testnet',
  loading: false,
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const walletService = new WalletService();

  const connectWallet = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { publicKey, network } = await walletService.connectWallet();
      dispatch({ type: 'CONNECT_WALLET', payload: { publicKey, network } });
      
      // Store in localStorage
      localStorage.setItem('wallet_connected', 'true');
      localStorage.setItem('public_key', publicKey);
      
      // Get initial balance
      await updateBalance();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to connect wallet' });
    }
  };

  const disconnectWallet = async () => {
    try {
      await walletService.disconnectWallet();
      dispatch({ type: 'DISCONNECT_WALLET' });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const updateBalance = async () => {
    if (!state.publicKey) return;
    
    try {
      const balance = await walletService.getBalance(state.publicKey);
      dispatch({ type: 'UPDATE_BALANCE', payload: balance });
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const isConnected = localStorage.getItem('wallet_connected') === 'true';
    const publicKey = localStorage.getItem('public_key');

    if (isConnected && publicKey) {
      dispatch({ type: 'CONNECT_WALLET', payload: { publicKey, network: 'testnet' } });
      updateBalance();
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        state,
        connectWallet,
        disconnectWallet,
        updateBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
```

---

## 📡 Smart Contract Integration

### Soroban Client Service

#### 1. Contract Service Implementation
```typescript
// src/services/contractService.ts
import { SorobanClient, xdr, Contract } from 'soroban-client';
import { WalletService } from './walletService';

export class ContractService {
  private sorobanClient: SorobanClient;
  private walletService: WalletService;
  private contractAddresses: {
    campaignManager: string;
    fundingPool: string;
    rewardSystem: string;
    governance: string;
  };

  constructor() {
    this.sorobanClient = new SorobanClient(process.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org');
    this.walletService = new WalletService();
    
    // Contract addresses from environment variables
    this.contractAddresses = {
      campaignManager: process.env.VITE_CAMPAIGN_MANAGER_CONTRACT || '',
      fundingPool: process.env.VITE_FUNDING_POOL_CONTRACT || '',
      rewardSystem: process.env.VITE_REWARD_SYSTEM_CONTRACT || '',
      governance: process.env.VITE_GOVERNANCE_CONTRACT || '',
    };
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData: {
    title: string;
    description: string;
    category: string;
    fundingGoal: string;
    deadline: number;
  }): Promise<{ campaignId: number; txHash: string }> {
    try {
      const publicKey = await this.getConnectedPublicKey();
      
      // Create contract instance
      const contract = new Contract(this.contractAddresses.campaignManager);
      
      // Build transaction
      const transaction = await this.sorobanClient.invokeContract({
        contract: contract,
        method: 'create_campaign',
        args: [
          xdr.ScVal.scvString(campaignData.title),
          xdr.ScVal.scvString(campaignData.description),
          xdr.ScVal.scvString(campaignData.category),
          xdr.ScVal.scvU128(BigInt(campaignData.fundingGoal)),
          xdr.ScVal.scvU64(campaignData.deadline),
        ],
        source: publicKey,
      });

      // Sign and submit transaction
      const result = await this.walletService.signAndSubmitTransaction(transaction.toXDR());
      
      // Parse result to get campaign ID
      const campaignId = this.parseCampaignId(result);
      
      return {
        campaignId,
        txHash: result.hash,
      };
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  }

  /**
   * Contribute to a campaign
   */
  async contributeToCampaign(contributionData: {
    campaignId: number;
    amount: string;
    asset: string;
  }): Promise<{ txHash: string }> {
    try {
      const publicKey = await this.getConnectedPublicKey();
      
      // Create contract instance
      const contract = new Contract(this.contractAddresses.fundingPool);
      
      // Build transaction
      const transaction = await this.sorobanClient.invokeContract({
        contract: contract,
        method: 'contribute',
        args: [
          xdr.ScVal.scvU64(contributionData.campaignId),
          xdr.ScVal.scvU128(BigInt(contributionData.amount)),
          xdr.ScVal.scvString(contributionData.asset),
          xdr.ScVal.scvString(''), // Transaction hash to be filled
        ],
        source: publicKey,
      });

      // Sign and submit transaction
      const result = await this.walletService.signAndSubmitTransaction(transaction.toXDR());
      
      return {
        txHash: result.hash,
      };
    } catch (error) {
      console.error('Failed to contribute to campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaign details
   */
  async getCampaign(campaignId: number): Promise<any> {
    try {
      const contract = new Contract(this.contractAddresses.campaignManager);
      
      const result = await this.sorobanClient.invokeContract({
        contract: contract,
        method: 'get_campaign',
        args: [xdr.ScVal.scvU64(campaignId)],
      });

      return this.parseCampaign(result);
    } catch (error) {
      console.error('Failed to get campaign:', error);
      throw error;
    }
  }

  /**
   * List all campaigns
   */
  async listCampaigns(): Promise<any[]> {
    try {
      const contract = new Contract(this.contractAddresses.campaignManager);
      
      const result = await this.sorobanClient.invokeContract({
        contract: contract,
        method: 'list_campaigns',
        args: [],
      });

      return this.parseCampaignList(result);
    } catch (error) {
      console.error('Failed to list campaigns:', error);
      throw error;
    }
  }

  /**
   * Claim reward
   */
  async claimReward(rewardData: {
    campaignId: number;
    tierId: number;
  }): Promise<{ txHash: string }> {
    try {
      const publicKey = await this.getConnectedPublicKey();
      
      const contract = new Contract(this.contractAddresses.rewardSystem);
      
      const transaction = await this.sorobanClient.invokeContract({
        contract: contract,
        method: 'claim_reward',
        args: [
          xdr.ScVal.scvU64(rewardData.campaignId),
          xdr.ScVal.scvU64(rewardData.tierId),
        ],
        source: publicKey,
      });

      const result = await this.walletService.signAndSubmitTransaction(transaction.toXDR());
      
      return {
        txHash: result.hash,
      };
    } catch (error) {
      console.error('Failed to claim reward:', error);
      throw error;
    }
  }

  /**
   * Helper method to get connected public key
   */
  private async getConnectedPublicKey(): Promise<string> {
    const { publicKey } = await this.walletService.connectWallet();
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }
    return publicKey;
  }

  /**
   * Parse campaign result from contract
   */
  private parseCampaign(result: any): any {
    // Implementation to parse Soroban result to Campaign object
    // This depends on the contract's return format
    return {};
  }

  /**
   * Parse campaign list result
   */
  private parseCampaignList(result: any): any[] {
    // Implementation to parse Soroban result to Campaign array
    return [];
  }

  /**
   * Parse campaign ID from transaction result
   */
  private parseCampaignId(result: any): number {
    // Implementation to extract campaign ID from result
    return 0;
  }
}
```

#### 2. React Hook for Contract Interactions
```typescript
// src/hooks/useContract.ts
import { useState, useCallback } from 'react';
import { ContractService } from '../services/contractService';
import { Campaign, CreateCampaignData, ContributionData } from '../types';

export const useContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contractService = new ContractService();

  const createCampaign = useCallback(async (data: CreateCampaignData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await contractService.createCampaign({
        title: data.title,
        description: data.description,
        category: data.category,
        fundingGoal: data.funding_goal,
        deadline: data.deadline,
      });
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const contributeToCampaign = useCallback(async (data: ContributionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await contractService.contributeToCampaign({
        campaignId: data.campaign_id,
        amount: data.amount,
        asset: data.asset,
      });
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to contribute');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCampaign = useCallback(async (campaignId: number): Promise<Campaign> => {
    setLoading(true);
    setError(null);
    
    try {
      const campaign = await contractService.getCampaign(campaignId);
      return campaign;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get campaign');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listCampaigns = useCallback(async (): Promise<Campaign[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const campaigns = await contractService.listCampaigns();
      return campaigns;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list campaigns');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const claimReward = useCallback(async (campaignId: number, tierId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await contractService.claimReward({
        campaignId,
        tierId,
      });
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim reward');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCampaign,
    contributeToCampaign,
    getCampaign,
    listCampaigns,
    claimReward,
  };
};
```

---

## 🔄 Transaction Management

### Transaction Builder Service

#### 1. Transaction Builder
```typescript
// src/services/transactionService.ts
import { 
  TransactionBuilder, 
  Account, 
  Networks, 
  Asset, 
  Operation,
  BASE_FEE
} from 'stellar-sdk';
import { WalletService } from './walletService';

export class TransactionService {
  private walletService: WalletService;
  private server: any;
  private networkPassphrase: string;

  constructor() {
    this.walletService = new WalletService();
    this.server = new Server(process.env.VITE_STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org');
    this.networkPassphrase = process.env.VITE_STELLAR_NETWORK === 'mainnet' 
      ? Networks.PUBLIC 
      : Networks.TESTNET;
  }

  /**
   * Build payment transaction
   */
  async buildPaymentTransaction(params: {
    from: string;
    to: string;
    amount: string;
    asset: string;
    memo?: string;
  }): Promise<string> {
    try {
      // Load source account
      const sourceAccount = await this.server.loadAccount(params.from);
      
      // Create asset
      const asset = params.asset === 'XLM' 
        ? Asset.native() 
        : new Asset(params.asset, this.getAssetIssuer(params.asset));

      // Build transaction
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.payment({
          destination: params.to,
          asset,
          amount: params.amount,
        }))
        .setTimeout(30)
        .build();

      if (params.memo) {
        transaction.addMemo(Memo.text(params.memo));
      }

      return transaction.toXDR();
    } catch (error) {
      console.error('Failed to build payment transaction:', error);
      throw error;
    }
  }

  /**
   * Build contract interaction transaction
   */
  async buildContractTransaction(params: {
    contractId: string;
    method: string;
    args: any[];
    from: string;
  }): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(params.from);
      
      // This is a simplified version - actual implementation would use Soroban SDK
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.invokeContract({
          contract: params.contractId,
          function: params.method,
          args: params.args,
        }))
        .setTimeout(30)
        .build();

      return transaction.toXDR();
    } catch (error) {
      console.error('Failed to build contract transaction:', error);
      throw error;
    }
  }

  /**
   * Submit transaction
   */
  async submitTransaction(xdr: string): Promise<{ hash: string; status: string }> {
    try {
      const result = await this.walletService.signAndSubmitTransaction(xdr);
      return result;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(hash: string): Promise<{
    status: string;
    ledger: number;
    timestamp: number;
  }> {
    try {
      const transaction = await this.server.transactions()
        .transaction(hash)
        .call();

      return {
        status: transaction.status,
        ledger: transaction.ledger,
        timestamp: transaction.created_at,
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  }

  /**
   * Get asset issuer (simplified)
   */
  private getAssetIssuer(assetCode: string): string {
    // In a real implementation, this would look up the issuer from a registry
    // or configuration
    return process.env.VITE_ASSET_ISSUER || '';
  }
}
```

---

## 📊 Event Listening

### Stellar Event Stream Service

#### 1. Event Listener Service
```typescript
// src/services/eventService.ts
import { Server, TransactionBuilder } from 'stellar-sdk';
import { ContractService } from './contractService';

export class EventService {
  private server: Server;
  private contractService: ContractService;
  private eventHandlers: Map<string, Function[]>;

  constructor() {
    this.server = new Server(process.env.VITE_STELLAR_RPC_URL || 'https://horizon-testnet.stellar.org');
    this.contractService = new ContractService();
    this.eventHandlers = new Map();
  }

  /**
   * Subscribe to contract events
   */
  async subscribeToContractEvents(contractId: string, events: string[]) {
    try {
      // Create event stream
      const eventStream = this.server.transactions()
        .forAccount(contractId)
        .stream({
          onmessage: (transaction) => {
            this.handleTransaction(transaction);
          },
          onerror: (error) => {
            console.error('Event stream error:', error);
          },
        });

      return eventStream;
    } catch (error) {
      console.error('Failed to subscribe to events:', error);
      throw error;
    }
  }

  /**
   * Handle incoming transaction
   */
  private handleTransaction(transaction: any) {
    try {
      // Parse transaction operations
      transaction.operations.forEach((operation: any) => {
        if (operation.type === 'invoke_contract') {
          this.handleContractEvent(operation);
        }
      });
    } catch (error) {
      console.error('Failed to handle transaction:', error);
    }
  }

  /**
   * Handle contract event
   */
  private handleContractEvent(operation: any) {
    const contractId = operation.contract;
    const eventName = operation.function;
    const args = operation.args;

    // Call registered event handlers
    const handlers = this.eventHandlers.get(`${contractId}:${eventName}`) || [];
    handlers.forEach(handler => {
      try {
        handler(args);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    });
  }

  /**
   * Register event handler
   */
  on(contractId: string, eventName: string, handler: Function) {
    const key = `${contractId}:${eventName}`;
    const handlers = this.eventHandlers.get(key) || [];
    handlers.push(handler);
    this.eventHandlers.set(key, handlers);
  }

  /**
   * Remove event handler
   */
  off(contractId: string, eventName: string, handler: Function) {
    const key = `${contractId}:${eventName}`;
    const handlers = this.eventHandlers.get(key) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(key, handlers);
    }
  }
}
```

---

## 🎯 React Components

### 1. Wallet Connection Component
```typescript
// src/components/WalletConnect.tsx
import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/Button';
import { Wallet, LogOut } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const { state, connectWallet, disconnectWallet } = useWallet();

  if (state.isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <span className="font-medium">Connected:</span>
          <span className="ml-2 font-mono text-xs">
            {state.publicKey?.slice(0, 8)}...{state.publicKey?.slice(-8)}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium">Balance:</span>
          <span className="ml-2">{state.balance} XLM</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          icon={<LogOut className="w-4 h-4" />}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      loading={state.loading}
      icon={<Wallet className="w-4 h-4" />}
    >
      Connect Wallet
    </Button>
  );
};
```

### 2. Campaign Creation Form
```typescript
// src/components/CreateCampaignForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useContract } from '../hooks/useContract';
import { CreateCampaignData } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';

export const CreateCampaignForm: React.FC = () => {
  const { createCampaign, loading, error } = useContract();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCampaignData>();

  const onSubmit = async (data: CreateCampaignData) => {
    try {
      await createCampaign(data);
      // Handle success (redirect, show message, etc.)
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          label="Campaign Title"
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
        />
      </div>

      <div>
        <Textarea
          label="Description"
          rows={4}
          {...register('description', { required: 'Description is required' })}
          error={errors.description?.message}
        />
      </div>

      <div>
        <Select
          label="Category"
          {...register('category', { required: 'Category is required' })}
          error={errors.category?.message}
        >
          <option value="">Select a category</option>
          <option value="technology">Technology</option>
          <option value="art">Art</option>
          <option value="music">Music</option>
          <option value="film">Film</option>
          <option value="games">Games</option>
          <option value="publishing">Publishing</option>
        </Select>
      </div>

      <div>
        <Input
          label="Funding Goal (XLM)"
          type="number"
          step="0.0000001"
          {...register('funding_goal', { 
            required: 'Funding goal is required',
            min: { value: 1, message: 'Minimum funding goal is 1 XLM' }
          })}
          error={errors.funding_goal?.message}
        />
      </div>

      <div>
        <Input
          label="Campaign Duration (days)"
          type="number"
          {...register('duration_days', { 
            required: 'Duration is required',
            min: { value: 1, message: 'Minimum duration is 1 day' },
            max: { value: 90, message: 'Maximum duration is 90 days' }
          })}
          error={errors.duration_days?.message}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        className="w-full"
      >
        Create Campaign
      </Button>
    </form>
  );
};
```

### 3. Contribution Component
```typescript
// src/components/ContributionForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useContract } from '../hooks/useContract';
import { ContributionData } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ContributionFormProps {
  campaignId: number;
  onContributionSuccess?: () => void;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({
  campaignId,
  onContributionSuccess,
}) => {
  const { contributeToCampaign, loading, error } = useContract();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ContributionData>();
  const amount = watch('amount');

  const onSubmit = async (data: ContributionData) => {
    try {
      await contributeToCampaign({
        ...data,
        campaign_id: campaignId,
      });
      onContributionSuccess?.();
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          label="Contribution Amount (XLM)"
          type="number"
          step="0.0000001"
          {...register('amount', { 
            required: 'Amount is required',
            min: { value: 0.0000001, message: 'Minimum contribution is 0.0000001 XLM' }
          })}
          error={errors.amount?.message}
        />
      </div>

      <div>
        <Select
          label="Asset"
          {...register('asset', { required: 'Asset is required' })}
          error={errors.asset?.message}
        >
          <option value="XLM">XLM (Stellar Lumens)</option>
          {/* Add more supported assets */}
        </Select>
      </div>

      {amount && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <p className="text-sm">
            You will contribute <strong>{amount} XLM</strong> to this campaign.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        className="w-full"
      >
        Contribute
      </Button>
    </form>
  );
};
```

---

## 🔧 Configuration

### Environment Variables
```bash
# .env
VITE_STELLAR_RPC_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK=testnet
VITE_CAMPAIGN_MANAGER_CONTRACT=YOUR_CONTRACT_ID
VITE_FUNDING_POOL_CONTRACT=YOUR_CONTRACT_ID
VITE_REWARD_SYSTEM_CONTRACT=YOUR_CONTRACT_ID
VITE_GOVERNANCE_CONTRACT=YOUR_CONTRACT_ID
VITE_ASSET_ISSUER=YOUR_ASSET_ISSUER
```

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['stellar-sdk', 'soroban-client'],
  },
});
```

---

## 🧪 Testing

### Unit Tests
```typescript
// src/services/__tests__/walletService.test.ts
import { WalletService } from '../walletService';

describe('WalletService', () => {
  let walletService: WalletService;

  beforeEach(() => {
    walletService = new WalletService();
  });

  describe('connectWallet', () => {
    it('should connect to wallet successfully', async () => {
      // Mock Freighter API
      const mockFreighterApi = {
        isInstalled: jest.fn().mockResolvedValue(true),
        getPublicKey: jest.fn().mockResolvedValue({ publicKey: 'test-public-key' }),
        getNetwork: jest.fn().mockResolvedValue({ network: 'testnet' }),
      };

      walletService.freighterApi = mockFreighterApi;

      const result = await walletService.connectWallet();

      expect(result).toEqual({
        publicKey: 'test-public-key',
        network: 'testnet',
      });
    });

    it('should throw error if Freighter is not installed', async () => {
      const mockFreighterApi = {
        isInstalled: jest.fn().mockResolvedValue(false),
      };

      walletService.freighterApi = mockFreighterApi;

      await expect(walletService.connectWallet()).rejects.toThrow(
        'Freighter wallet is not installed'
      );
    });
  });
});
```

### Integration Tests
```typescript
// src/integration/contractIntegration.test.ts
import { ContractService } from '../services/contractService';
import { WalletService } from '../services/walletService';

describe('Contract Integration', () => {
  let contractService: ContractService;
  let walletService: WalletService;

  beforeEach(() => {
    contractService = new ContractService();
    walletService = new WalletService();
  });

  it('should create campaign through smart contract', async () => {
    const campaignData = {
      title: 'Test Campaign',
      description: 'A test campaign',
      category: 'technology',
      fundingGoal: '1000',
      deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    // Mock wallet connection
    jest.spyOn(walletService, 'connectWallet').mockResolvedValue({
      publicKey: 'test-public-key',
      network: 'testnet',
    });

    // Mock transaction signing
    jest.spyOn(walletService, 'signAndSubmitTransaction').mockResolvedValue({
      hash: 'test-tx-hash',
      status: 'success',
    });

    const result = await contractService.createCampaign(campaignData);

    expect(result).toHaveProperty('campaignId');
    expect(result).toHaveProperty('txHash');
  });
});
```

---

## 📈 Performance Optimization

### 1. Caching Strategy
```typescript
// src/services/cacheService.ts
export class CacheService {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}
```

### 2. Debounced Search
```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

---

## 🚀 Deployment

### 1. Build Configuration
```typescript
// package.json scripts
{
  "scripts": {
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    "preview": "vite preview"
  }
}
```

### 2. Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📝 Best Practices

### 1. Error Handling
- Always wrap blockchain interactions in try-catch blocks
- Provide user-friendly error messages
- Implement retry mechanisms for network failures
- Log errors for debugging

### 2. Security
- Validate all user inputs
- Never store private keys in the frontend
- Use HTTPS for all API calls
- Implement proper authentication and authorization

### 3. User Experience
- Show loading states for blockchain operations
- Provide transaction status updates
- Handle network latency gracefully
- Offer clear feedback for all actions

### 4. Performance
- Cache frequently accessed data
- Use lazy loading for large datasets
- Optimize bundle size with code splitting
- Implement proper state management

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Wallet Connection Failed
- Check if Freighter is installed
- Verify network configuration
- Ensure proper permissions

#### 2. Transaction Failed
- Check account balance
- Verify transaction fees
- Ensure correct network passphrase

#### 3. Contract Interaction Failed
- Verify contract addresses
- Check method signatures
- Ensure proper argument formatting

#### 4. Performance Issues
- Check API response times
- Optimize React re-renders
- Implement proper caching

---

## 📚 Additional Resources

- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Freighter Wallet Documentation](https://www.freighter.app/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

*Last Updated: March 2024*
*Version: 1.0*
*Network: Stellar*
