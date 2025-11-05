import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { WalletInterface, Assets } from '@clan/framework-core';

export interface UseWalletBalanceOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

/**
 * React Query hook for fetching and caching wallet balance
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query result with balance data
 */
export const useWalletBalance = (
  wallet: WalletInterface,
  options: UseWalletBalanceOptions = {}
): UseQueryResult<Assets, Error> => {
  const { refetchInterval = 10000, enabled = true } = options;
  const walletId = wallet.getName(); // Derive from wallet

  return useQuery({
    queryKey: ['wallet', walletId, 'balance'],
    queryFn: async () => {
      return await wallet.getBalance();
    },
    refetchInterval,
    enabled,
  });
};

