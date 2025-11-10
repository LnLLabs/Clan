import { Assets } from '@clan/framework-core';
import { default as default_2 } from 'react';
import { DelegationInfo } from '@clan/framework-core';
import { TransactionBuildOptions } from '@clan/framework-core';
import { UIAsset } from '@clan/framework-components';
import { UseMutationResult } from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query';
import { UTxO } from '@clan/framework-core';
import { WalletInterface } from '@clan/framework-core';

export declare interface DelegateStakeParams {
    poolId: string;
}

export declare interface DelegateStakeResult {
    txHash: string;
    poolId: string;
}

export declare interface SendTransactionParams {
    recipientAddress: string;
    assets: Record<string, bigint>;
    options?: any;
}

export declare interface SendTransactionResult {
    txHash: string;
    draft: any;
    signedTx: any;
}

/**
 * Token metadata provider interface for enriching assets with metadata
 * Compatible with future BroClan metadata provider integration
 */
export declare interface TokenMetadataProvider {
    getMetadata(assetId: string): Promise<Partial<Omit<UIAsset, 'id' | 'balance'>>>;
}

/**
 * Smart wrapper around TransactionCreator that automatically fetches wallet data
 *
 * @example
 * // Simple usage (no metadata)
 * <TransactionCreatorWithData
 *   wallet={wallet}
 *   onTransactionCreated={(tx) => console.log('Created!', tx)}
 * />
 *
 * @example
 * // With metadata provider (BroClan integration)
 * <TransactionCreatorWithData
 *   wallet={wallet}
 *   metadataProvider={broClanMetadataProvider}
 *   onTransactionCreated={(tx) => console.log('Created!', tx)}
 * />
 */
export declare const TransactionCreatorWithData: default_2.FC<TransactionCreatorWithDataProps>;

export declare interface TransactionCreatorWithDataProps {
    wallet: WalletInterface;
    metadataProvider?: TokenMetadataProvider;
    onTransactionCreated?: (options: TransactionBuildOptions) => void;
    onCancel?: () => void;
    className?: string;
    refetchInterval?: number;
}

/**
 * React Query mutation hook for delegating stake to a pool
 * Automatically invalidates balance and delegation info on success
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query mutation result
 */
export declare const useDelegateStake: (wallet: WalletInterface, options?: UseDelegateStakeOptions) => UseMutationResult<DelegateStakeResult, Error, DelegateStakeParams>;

export declare interface UseDelegateStakeOptions {
    onSuccess?: (data: DelegateStakeResult) => void;
    onError?: (error: Error) => void;
}

/**
 * React Query mutation hook for sending transactions
 * Automatically invalidates balance, UTXOs, and transaction cache on success
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query mutation result
 */
export declare const useSendTransaction: (wallet: WalletInterface, options?: UseSendTransactionOptions) => UseMutationResult<SendTransactionResult, Error, SendTransactionParams>;

export declare interface UseSendTransactionOptions {
    onSuccess?: (data: SendTransactionResult) => void;
    onError?: (error: Error) => void;
}

/**
 * React Query hook for fetching and caching wallet balance
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query result with balance data
 */
export declare const useWalletBalance: (wallet: WalletInterface, options?: UseWalletBalanceOptions) => UseQueryResult<Assets, Error>;

export declare interface UseWalletBalanceOptions {
    refetchInterval?: number;
    enabled?: boolean;
}

/**
 * React Query hook for fetching and caching wallet delegation info
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query result with delegation info
 */
export declare const useWalletDelegation: (wallet: WalletInterface, options?: UseWalletDelegationOptions) => UseQueryResult<DelegationInfo | undefined, Error>;

export declare interface UseWalletDelegationOptions {
    refetchInterval?: number;
    enabled?: boolean;
}

/**
 * React Query hook for fetching and caching wallet UTXOs
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query result with UTXOs array
 */
export declare const useWalletUtxos: (wallet: WalletInterface, options?: UseWalletUtxosOptions) => UseQueryResult<UTxO[], Error>;

export declare interface UseWalletUtxosOptions {
    refetchInterval?: number;
    enabled?: boolean;
}

/**
 * React Query mutation hook for withdrawing staking rewards
 * Automatically invalidates balance and delegation info on success
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query mutation result
 */
export declare const useWithdrawRewards: (wallet: WalletInterface, options?: UseWithdrawRewardsOptions) => UseMutationResult<WithdrawRewardsResult, Error, void>;

export declare interface UseWithdrawRewardsOptions {
    onSuccess?: (data: WithdrawRewardsResult) => void;
    onError?: (error: Error) => void;
}

/**
 * Smart wrapper around WalletDelegation that automatically manages delegation state
 * Uses React Query hooks for data fetching and mutations
 *
 * @example
 * ```tsx
 * <WalletDelegationWithData
 *   wallet={wallet}
 *   onSuccess={(action, data) => {
 *     console.log(`${action} successful:`, data);
 *   }}
 *   onError={(error) => {
 *     console.error('Delegation error:', error);
 *   }}
 * />
 * ```
 */
export declare const WalletDelegationWithData: default_2.FC<WalletDelegationWithDataProps>;

export declare interface WalletDelegationWithDataProps {
    wallet: WalletInterface;
    onSuccess?: (action: 'delegate' | 'undelegate' | 'withdraw', data: any) => void;
    onError?: (error: Error) => void;
    className?: string;
}

export declare interface WithdrawRewardsResult {
    txHash: string;
    amount: bigint;
}

export { }
