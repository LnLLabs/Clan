import React from 'react';
import { WalletDelegation, DelegationInfo as ComponentDelegationInfo } from '@clan/framework-components';
import { WalletInterface } from '@clan/framework-core';
import { useDelegateStake } from '../hooks/useDelegateStake';
import { useUnregisterStake } from '../hooks/useUnregisterStake';
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
  const componentDelegationInfo: ComponentDelegationInfo | undefined = delegationInfo
    ? {
        stakeAddress: delegationInfo.stakeAddress,
        delegatedPool: delegationInfo.delegatedPool,
        delegatedDRep: delegationInfo.delegatedDRep,
        rewards: delegationInfo.rewards,
        nextRewardEpoch: delegationInfo.nextRewardEpoch,
      }
    : undefined;

  const { mutateAsync: unregisterStake, isPending: isUndelegating } = useUnregisterStake(wallet, {
    onSuccess: (data) => onSuccess?.('undelegate', data),
    onError,
  });

  const handleDelegate = async (poolId: string | null, drepId: string | null) => {
    if (!poolId && !drepId) {
      throw new Error('Select a stake pool and/or dRep to delegate.');
    }
    await delegateStake({
      poolId: poolId ?? undefined,
      drepId: drepId ?? undefined,
    });
  };

  const handleUndelegate = async () => {
    await unregisterStake();
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
      isUndelegating={isUndelegating}
      isWithdrawing={isWithdrawing}
      className={className}
    />
  );
};

export default WalletDelegationWithData;

