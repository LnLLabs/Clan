import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { WalletInterface, DelegationInfo } from '@clan/framework-core';

export interface UseWalletDelegationOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

/**
 * React Query hook for fetching and caching wallet delegation info
 * @param wallet - Wallet instance implementing WalletInterface
 * @param options - Configuration options
 * @returns React Query result with delegation info
 */
export const useWalletDelegation = (
  wallet: WalletInterface,
  options: UseWalletDelegationOptions = {}
): UseQueryResult<DelegationInfo | undefined, Error> => {
  const { refetchInterval = 30000, enabled = true } = options;
  const walletId = wallet.getName();

  return useQuery({
    queryKey: ['wallet', walletId, 'delegation'],
    queryFn: async () => {
      if (!wallet.getDelegationInfo) {
        return undefined;
      }
      return await wallet.getDelegationInfo();
    },
    refetchInterval,
    enabled,
  });
};

