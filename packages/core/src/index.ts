// Core types and interfaces
export * from './types';
export * from './wallet-interface';
export * from './transaction-types';
export * from './network-config';
export * from './coin-select';

// Re-export commonly used types
export type {
  Address,
  Hash,
  Asset,
  Assets,
  UTxO,
  Transaction,
  NetworkConfig,
  ProviderType,
  ProviderConfig
} from './types';

export type {
  WalletInterface,
  WalletFactory,
  TransactionDraft,
  TransactionOptions,
  TransactionBuildOptions,
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
