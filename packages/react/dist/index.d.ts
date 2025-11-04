import { UseMutationResult } from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query';
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
 * React Query mutation hook for sending transactions
 * Automatically invalidates balance, UTXOs, and transaction cache on success
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query mutation result
 */
export declare const useSendTransaction: (wallet: WalletInterface, options: UseSendTransactionOptions) => UseMutationResult<SendTransactionResult, Error, SendTransactionParams>;

export declare interface UseSendTransactionOptions {
    walletId: string;
    onSuccess?: (data: SendTransactionResult) => void;
    onError?: (error: Error) => void;
}

/**
 * React Query hook for fetching and caching wallet balance
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query result with balance data
 */
export declare const useWalletBalance: (wallet: WalletInterface, options: UseWalletBalanceOptions) => UseQueryResult<Record<string, bigint>, Error>;

export declare interface UseWalletBalanceOptions {
    walletId: string;
    refetchInterval?: number;
    enabled?: boolean;
}

/**
 * React Query hook for fetching and caching wallet UTXOs
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query result with UTXOs array
 */
export declare const useWalletUtxos: (wallet: WalletInterface, options: UseWalletUtxosOptions) => UseQueryResult<any[], Error>;

export declare interface UseWalletUtxosOptions {
    walletId: string;
    refetchInterval?: number;
    enabled?: boolean;
}

export { }
