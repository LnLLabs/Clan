import React from 'react';
import { WalletDelegation, DelegationInfo as ComponentDelegationInfo } from '@clan/framework-components';
import { WalletInterface } from '@clan/framework-core';
import { useDelegateStake } from '../hooks/useDelegateStake';
import { useWalletDelegation } from '../hooks/useWalletDelegation';
import { useWithdrawRewards } from '../hooks/useWithdrawRewards';

export interface WalletDelegationWithDataProps {
  wallet: WalletInterface;
  onSuccess?: (action: 'delegate' | 'undelegate' | 'withdraw', data: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Smart wrapper around WalletDelegation that automatically manages delegation state
 * Uses React Query hooks for data fetching and mutations
 * 
 * @example
 * ```tsx
 * <WalletDelegationWithData 
 *   wallet={wallet}
 *   onSuccess={(action, data) => {
 *     console.log(`${action} successful:`, data);
 *   }}
 *   onError={(error) => {
 *     console.error('Delegation error:', error);
 *   }}
 * />
 * ```
 */
export const WalletDelegationWithData: React.FC<WalletDelegationWithDataProps> = ({
  wallet,
  onSuccess,
  onError,
  className
}) => {
  // Fetch delegation info
  const { data: delegationInfo, isLoading: delegationLoading } = useWalletDelegation(wallet, {
    refetchInterval: 30000,
    enabled: true
  });

  // Delegation mutation
  const { mutateAsync: delegateStake, isPending: isDelegating } = useDelegateStake(wallet, {
    onSuccess: (data: any) => {
      console.log('Delegation successful:', data);
      onSuccess?.('delegate', data);
    },
    onError: (error: Error) => {
      console.error('Delegation failed:', error);
      onError?.(error);
    }
  });

  // Withdraw rewards mutation
  const { mutateAsync: withdrawRewards, isPending: isWithdrawing } = useWithdrawRewards(wallet, {
    onSuccess: (data: any) => {
      console.log('Withdrawal successful:', data);
      onSuccess?.('withdraw', data);
    },
    onError: (error: Error) => {
      console.error('Withdrawal failed:', error);
      onError?.(error);
    }
  });

  // Convert DelegationInfo from core to component format
  const componentDelegationInfo: ComponentDelegationInfo | undefined = delegationInfo ? {
    stakeAddress: delegationInfo.stakeAddress,
    delegatedPool: delegationInfo.delegatedPool,
    delegatedDRep: (delegationInfo as any).delegatedDRep, // May not exist in older core types
    rewards: delegationInfo.rewards,
    nextRewardEpoch: delegationInfo.nextRewardEpoch
  } : undefined;

  // Handle delegation - now accepts both pool and dRep
  const handleDelegate = async (poolId: string | null, drepId: string | null) => {
    // Delegate to pool if provided
    if (poolId) {
      await delegateStake({ poolId });
    }
    // TODO: Add dRep delegation when supported by the hooks
    // if (drepId) {
    //   await delegateDRep({ drepId });
    // }
    console.log('Delegation requested - Pool:', poolId, 'dRep:', drepId);
  };

  // Handle undelegation (delegate to null pool or use specific undelegate method if available)
  const handleUndelegate = async () => {
    // Note: Implement based on your blockchain's undelegation mechanism
    // For Cardano, you might need a specific undelegate transaction
    console.log('Undelegate not yet implemented');
    onError?.(new Error('Undelegate functionality not yet implemented'));
  };

  // Handle reward withdrawal
  const handleWithdrawRewards = async () => {
    await withdrawRewards();
  };

  if (delegationLoading) {
    return <div className="delegation-loading">Loading delegation info...</div>;
  }

  return (
    <WalletDelegation
      wallet={wallet}
      delegationInfo={componentDelegationInfo}
      onDelegate={handleDelegate}
      onUndelegate={handleUndelegate}
      onWithdrawRewards={handleWithdrawRewards}
      isDelegating={isDelegating}
      isWithdrawing={isWithdrawing}
      className={className}
    />
  );
};

export default WalletDelegationWithData;

