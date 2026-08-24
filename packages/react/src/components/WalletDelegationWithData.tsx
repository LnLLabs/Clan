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
 */
export const WalletDelegationWithData: React.FC<WalletDelegationWithDataProps> = ({
  wallet,
  onSuccess,
  onError,
  className
}) => {
  const { data: delegationInfo, isLoading: delegationLoading } = useWalletDelegation(wallet, {
    refetchInterval: 30000,
    enabled: true
  });

  const { mutateAsync: delegateStake, isPending: isDelegating } = useDelegateStake(wallet, {
    onSuccess: (data: any) => {
      onSuccess?.('delegate', data);
    },
    onError: (error: Error) => {
      onError?.(error);
    }
  });

  const { mutateAsync: withdrawRewards, isPending: isWithdrawing } = useWithdrawRewards(wallet, {
    onSuccess: (data: any) => {
      onSuccess?.('withdraw', data);
    },
    onError: (error: Error) => {
      onError?.(error);
    }
  });

  const { mutateAsync: unregisterStake, isPending: isDeregistering } = useUnregisterStake(wallet, {
    onSuccess: (data) => onSuccess?.('undelegate', data),
    onError,
  });

  const componentDelegationInfo: ComponentDelegationInfo | undefined = delegationInfo
    ? {
        stakeAddress: delegationInfo.stakeAddress,
        delegatedPool: delegationInfo.delegatedPool,
        delegatedDRep: delegationInfo.delegatedDRep,
        rewards: delegationInfo.rewards,
        nextRewardEpoch: delegationInfo.nextRewardEpoch,
      }
    : undefined;

  const handleDelegate = async (poolId: string | null, drepId: string | null) => {
    if (!poolId && !drepId) {
      throw new Error('Select a stake pool and/or dRep to delegate.');
    }
    await delegateStake({
      poolId: poolId ?? undefined,
      drepId: drepId ?? undefined,
    });
  };

  const handleDeregisterStake = async () => {
    await unregisterStake();
  };

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
      onDeregisterStake={handleDeregisterStake}
      onWithdrawRewards={handleWithdrawRewards}
      isDelegating={isDelegating}
      isDeregistering={isDeregistering}
      isWithdrawing={isWithdrawing}
      className={className}
    />
  );
};

export default WalletDelegationWithData;
