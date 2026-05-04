import { useEffect } from 'react';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { WalletInterface, UTxO } from '@clan/framework-core';

export interface UseWalletUtxosOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

/**
 * React Query hook for fetching and caching wallet UTXOs
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query result with UTXOs array
 */
export const useWalletUtxos = (
  wallet: WalletInterface,
  options: UseWalletUtxosOptions = {}
): UseQueryResult<UTxO[], Error> => {
  const { refetchInterval = 10000, enabled = true } = options;
  const queryClient = useQueryClient();
  const walletId = wallet.getName(); // Derive from wallet

  const result = useQuery({
    queryKey: ['wallet', walletId, 'utxos'],
    queryFn: async () => {
      return await wallet.getUtxos();
    },
    refetchInterval,
    enabled,
  });

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ['wallet', walletId, 'balance'] });
  }, [queryClient, result.dataUpdatedAt, result.isSuccess, walletId]);

  return result;
};

