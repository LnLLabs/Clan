// Core types and interfaces
export * from './types';
export {
  meshAmountArrayToAssets,
  meshUtxoToAssets,
  meshUtxoLovelace,
  meshUtxoOutRefKey,
  meshUtxosEqual,
  assetsMapToMeshAssets
} from './mesh-utxo';
export {
  paymentScriptHashFromAddress,
  utxoMatchesPaymentScriptHash,
  resolvePaymentScriptHashFromAddresses,
} from './historyPaymentScript';
export * from './wallet-interface';
export * from './transaction-types';
export * from './network-config';
export * from './coin-select';
export * from './metadata';

// Re-export commonly used types
export type {
  Address,
  Hash,
  Asset,
  MeshAsset,
  Assets,
  UTxO,
  Transaction,
  NetworkConfig,
  ProviderType,
  ProviderConfig,
  MetadataProvider,
  TokenMetadata,
  TokenSearchResult,
  ExplorerType,
  BlockchainExplorer
} from './types';

export {
  NoOpMetadataProvider,
  NoOpExplorer
} from './types';

export type {
  WalletInterface,
  WalletFactory,
  TransactionDraft,
  TransactionOptions,
  TransactionBuildOptions,
  CreateDelegationOptions,
  DelegationInfo,
  WalletEvent,
  WalletEventType
} from './wallet-interface';

export type {
  TransactionBody,
  TransactionInput,
  TransactionOutput,
  SignedTransaction,
  TransactionMetadata,
  TransactionWitnessSet,
  VKeyWitness,
  TransactionSubmission,
  TransactionHistoryEntry,
  UtxoSelectionStrategy
} from './transaction-types';

export {
  NETWORKS,
  NetworkUtils,
  DefaultNetworkValidator
} from './network-config';

export {
  WalletError,
  NetworkError,
  TransactionError
} from './types';
