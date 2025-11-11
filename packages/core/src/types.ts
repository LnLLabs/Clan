// Generic blockchain types that can be used across different implementations

export type Address = string;
export type Hash = string;
export type PolicyId = string;
export type AssetName = string;
export type AssetId = string;

export interface Asset {
  policyId: PolicyId;
  assetName: AssetName;
  quantity: bigint;
}

export interface Assets {
  [assetId: string]: bigint;
}

export interface UTxO {
  txHash: Hash;
  outputIndex: number;
  address: Address;
  assets: Assets;
  datum?: string;
  datumHash?: Hash;
}

export interface Transaction {
  hash: Hash;
  inputs: UTxO[];
  outputs: UTxO[];
  fee: bigint;
  metadata?: any;
  timestamp?: number;
}

export interface NetworkConfig {
  name: string;
  networkId: number;
  protocolMagic: number;
  explorerUrl: string;
  apiUrl?: string;
}

export interface WalletConfig {
  name: string;
  version: string;
  network: NetworkConfig;
  options?: Record<string, any>; // Additional wallet-specific options
}

export interface TransactionStatus {
  pending: boolean;
  confirmed: boolean;
  failed: boolean;
  blockHeight?: number;
  timestamp?: number;
}

export interface WalletState {
  isConnected: boolean;
  address?: Address;
  balance?: Assets;
  network?: NetworkConfig;
  isLoading: boolean;
  error?: string;
}

// Generic error types
export class WalletError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'WalletError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TransactionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TransactionError';
  }
}

// Provider types for blockchain connections
export type ProviderType = 'Blockfrost' | 'Kupmios' | 'MWallet' | 'Maestro' | 'Custom';

export interface ProviderConfig {
  url?: string;
  projectId?: string;
  kupoUrl?: string;
  ogmiosUrl?: string;
  apiKey?: string;
  network?: string;
}

// Metadata Provider Types
export interface TokenMetadata {
  policyId: PolicyId;
  assetName: AssetName;
  isNft: boolean;
  name: string;
  ticker: string;
  decimals: number;
  logo: string;
  description?: string;
  url?: string;
  [key: string]: any;
}

export interface TokenSearchResult {
  policyId: PolicyId;
  assetName: AssetName;
  name: string;
  ticker?: string;
  logo?: string;
}

export interface TransactionMetadata {
  txHash: string;
  inputUtxos: UTxO[];
  outputUtxos: UTxO[];
  balanceChanges: Assets;
  blockHeight?: number;
  blockTime?: number;
  metadata?: any;
}


/**
 * MetadataProvider interface for fetching token metadata and other non-critical data
 * Consuming apps should implement this interface for their specific metadata sources
 */
export interface MetadataProvider {
  /**
   * Get metadata for a specific token
   * @param policyId - The policy ID of the token
   * @param assetName - The asset name (hex encoded)
   * @returns Token metadata or undefined if not found
   */
  getTokenMetadata(policyId: string, assetName: string): Promise<TokenMetadata | undefined>;

  /**
   * Search for tokens by name or ticker
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Array of matching tokens
   */
  searchTokens?(query: string, limit?: number): Promise<TokenSearchResult[]>;

  /**
   * Get transaction history metadata (labels, notes, enriched data)
   * @param txHash - Transaction hash
   * @returns Transaction metadata
   */
  getTransactionMetadata?(txHash: string): Promise<Record<string, any> | undefined>;

  getTransactionHistory?( walletAddress: Address, limit?: number , offset?: number,  page?: number): Promise<Transaction[]>;
  /**
   * Batch get metadata for multiple tokens
   * @param tokens - Array of {policyId, assetName} pairs
   * @returns Array of token metadata
   */
  batchGetTokenMetadata?(tokens: Array<{ policyId: string; assetName: string }>): Promise<(TokenMetadata | undefined)[]>;
}

/**
 * NoOpMetadataProvider - Returns undefined for all queries
 * Use when no metadata provider is configured
 */
export class NoOpMetadataProvider implements MetadataProvider {
  async getTokenMetadata(): Promise<undefined> {
    return undefined;
  }

  async searchTokens(): Promise<TokenSearchResult[]> {
    return [];
  }

  async getTransactionMetadata(): Promise<undefined> {
    return undefined;
  }

  async batchGetTokenMetadata(): Promise<undefined[]> {
    return [];
  }
}

