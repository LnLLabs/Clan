import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { WalletInterface } from '@clan/framework-core';

export interface WithdrawRewardsResult {
  txHash: string;
  amount: bigint;
}

export interface UseWithdrawRewardsOptions {
  onSuccess?: (data: WithdrawRewardsResult) => void;
  onError?: (error: Error) => void;
}

/**
 * React Query mutation hook for withdrawing staking rewards
 * Automatically invalidates balance and delegation info on success
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query mutation result
 */
export const useWithdrawRewards = (
  wallet: WalletInterface,
  options: UseWithdrawRewardsOptions = {}
): UseMutationResult<WithdrawRewardsResult, Error, void> => {
  const { onSuccess, onError } = options;
  const walletId = wallet.getName();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!wallet.withdrawRewards) {
        throw new Error('Wallet does not support reward withdrawal');
      }

      // Get current delegation info to get reward amount
      const delegationInfo = wallet.getDelegationInfo ? await wallet.getDelegationInfo() : undefined;
      const amount = delegationInfo?.rewards || 0n;

      // Create withdrawal transaction
      const draft = await wallet.withdrawRewards();

      // Sign transaction
      const signedTx = await wallet.signTransaction(draft);

      // Submit to blockchain
      const txHash = await wallet.submitTransaction(signedTx);

      return { txHash, amount };
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

