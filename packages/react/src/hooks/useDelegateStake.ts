import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { WalletInterface } from '@clan/framework-core';

export interface DelegateStakeParams {
  poolId: string;
}

export interface DelegateStakeResult {
  txHash: string;
  poolId: string;
}

export interface UseDelegateStakeOptions {
  onSuccess?: (data: DelegateStakeResult) => void;
  onError?: (error: Error) => void;
}

/**
 * React Query mutation hook for delegating stake to a pool
 * Automatically invalidates balance and delegation info on success
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query mutation result
 */
export const useDelegateStake = (
  wallet: WalletInterface,
  options: UseDelegateStakeOptions = {}
): UseMutationResult<DelegateStakeResult, Error, DelegateStakeParams> => {
  const { onSuccess, onError } = options;
  const walletId = wallet.getName();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ poolId }: DelegateStakeParams) => {
      if (!wallet.createDelegationTransaction) {
        throw new Error('Wallet does not support delegation transactions');
      }

      // Create delegation transaction
      const draft = await wallet.createDelegationTransaction(poolId);

      // Sign transaction
      const signedTx = await wallet.signTransaction(draft);

      // Submit to blockchain
      const txHash = await wallet.submitTransaction(signedTx);

      return { txHash, poolId };
    },

    onSuccess: (data) => {
      // Automatically invalidate related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'delegation'] });
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

