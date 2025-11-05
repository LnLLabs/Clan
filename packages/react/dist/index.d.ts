import { Assets } from '@clan/framework-core';
import { default as default_2 } from 'react';
import { TransactionBuildOptions } from '@clan/framework-core';
import { UIAsset } from '@clan/framework-components';
import { UseMutationResult } from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query';
import { UTxO } from '@clan/framework-core';
import { WalletInterface } from '@clan/framework-core';

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

export { }
