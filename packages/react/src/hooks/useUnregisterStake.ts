import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { WalletInterface } from '@clan/framework-core';

export interface UnregisterStakeResult {
  txHash: string;
}

export interface UseUnregisterStakeOptions {
  onSuccess?: (data: UnregisterStakeResult) => void;
  onError?: (error: Error) => void;
}

type WalletWithUnregister = WalletInterface & {
  createUnregisterStakeTransaction?: () => Promise<import('@clan/framework-core').TransactionDraft>;
};

/**
 * React Query mutation hook for deregistering the vault script stake credential.
 */
export const useUnregisterStake = (
  wallet: WalletWithUnregister,
  options: UseUnregisterStakeOptions = {}
): UseMutationResult<UnregisterStakeResult, Error, void> => {
  const { onSuccess, onError } = options;
  const walletId = wallet.getName();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (typeof wallet.createUnregisterStakeTransaction !== 'function') {
        throw new Error('Unregister stake is not available for this wallet.');
      }
      const draft = await wallet.createUnregisterStakeTransaction();
      const signedTx = await wallet.signTransaction(draft);
      const txHash = await wallet.submitTransaction(signedTx);
      return { txHash };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'delegation'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'transactions'] });
      onSuccess?.(data);
    },

    onError: (error: Error) => {
      onError?.(error);
    },
  });
};
