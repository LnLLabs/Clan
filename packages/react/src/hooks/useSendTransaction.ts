import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { WalletInterface } from '@clan/framework-core';

export interface SendTransactionParams {
  recipientAddress: string;
  assets: Record<string, bigint>;
  options?: any;
}

export interface SendTransactionResult {
  txHash: string;
  draft: any;
  signedTx: any;
}

export interface UseSendTransactionOptions {
  walletId: string;
  onSuccess?: (data: SendTransactionResult) => void;
  onError?: (error: Error) => void;
}

/**
 * React Query mutation hook for sending transactions
 * Automatically invalidates balance, UTXOs, and transaction cache on success
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query mutation result
 */
export const useSendTransaction = (
  wallet: WalletInterface,
  options: UseSendTransactionOptions
): UseMutationResult<SendTransactionResult, Error, SendTransactionParams> => {
  const { walletId, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipientAddress, assets, options: txOptions }: SendTransactionParams) => {
      // Create transaction draft
      const draft = await wallet.createTransaction(
        [{ address: recipientAddress, assets }],
        txOptions
      );

      // Sign transaction
      const signedTx = await wallet.signTransaction(draft);

      // Submit to blockchain
      const txHash = await wallet.submitTransaction(signedTx);

      return { txHash, draft, signedTx };
    },

    onSuccess: (data) => {
      // Automatically invalidate related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'utxos'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'transactions'] });

      // Call custom success handler
      onSuccess?.(data);
    },

    onError: (error: Error) => {
      // Call custom error handler
      onError?.(error);
    },
  });
};

