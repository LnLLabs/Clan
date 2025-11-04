import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { WalletInterface } from '@clan/framework-core';

export interface UseWalletBalanceOptions {
  walletId: string;
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
  options: UseWalletBalanceOptions
): UseQueryResult<Record<string, bigint>, Error> => {
  const { walletId, refetchInterval = 10000, enabled = true } = options;

  return useQuery({
    queryKey: ['wallet', walletId, 'balance'],
    queryFn: async () => {
      return await wallet.getBalance();
    },
    refetchInterval,
    enabled,
  });
};

