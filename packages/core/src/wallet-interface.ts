import {
  Address,
  Hash,
  Assets,
  UTxO,
  Transaction,
  NetworkConfig,
  TransactionStatus
} from './types';

// Generic wallet interface that can be implemented by different wallet types
export interface WalletInterface {
  // Basic wallet info
  getName(): string;
  getAddress(): Address;
  getNetwork(): NetworkConfig;

  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Balance and assets
  getBalance(): Promise<Assets>;
  getUtxos(): Promise<UTxO[]>;

  // Transaction management
  createTransaction(
    outputs: { address: Address; assets: Assets }[],
    options?: TransactionOptions
  ): Promise<TransactionDraft>;

  signTransaction(draft: TransactionDraft): Promise<SignedTransaction>;
  submitTransaction(signedTx: SignedTransaction): Promise<Hash>;

  // Transaction status
  getTransactionStatus(txHash: Hash): Promise<TransactionStatus>;
  getTransaction(txHash: Hash): Promise<Transaction>;

  // Utility methods
  getCollateral?(): Promise<UTxO[]>;
  getRewardAddress?(): Address;
  getStakingAddress?(): Address;
}

// Transaction creation options
export interface TransactionOptions {
  fee?: bigint;
  ttl?: number;
  metadata?: any;
  collateral?: UTxO[];
  scriptInputs?: UTxO[];
}

// Draft transaction before signing
export interface TransactionDraft {
  inputs: UTxO[];
  outputs: UTxO[];
  fee: bigint;
  ttl?: number;
  metadata?: any;
  witnesses: any[]; // Implementation specific
}

// Signed transaction ready for submission
export interface SignedTransaction {
  transaction: Transaction;
  witnesses: any[]; // Implementation specific
}

// Wallet factory interface
export interface WalletFactory {
  createWallet(config: WalletConfig): WalletInterface;
  getSupportedNetworks(): NetworkConfig[];
  isAvailable(): boolean;
}

// Wallet configuration
export interface WalletConfig {
  network: NetworkConfig;
  options?: Record<string, any>;
}

// Event types for wallet state changes
export enum WalletEventType {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  BALANCE_CHANGED = 'balance_changed',
  NETWORK_CHANGED = 'network_changed',
  TRANSACTION_SUBMITTED = 'transaction_submitted',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  ERROR = 'error'
}

export interface WalletEvent {
  type: WalletEventType;
  payload?: any;
  timestamp: number;
}
