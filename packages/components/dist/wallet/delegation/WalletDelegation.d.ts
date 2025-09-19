import React from 'react';
export interface DelegationInfo {
    stakeAddress: string;
    delegatedPool?: string;
    rewards: bigint;
    activeEpoch: number;
    nextRewardEpoch?: number;
}
export interface WalletDelegationProps {
    wallet: any;
    delegationInfo: DelegationInfo;
    onDelegationChange?: (poolId: string) => Promise<void>;
    onRewardsWithdraw?: () => Promise<void>;
    className?: string;
}
export interface PoolOption {
    id: string;
    name: string;
    ticker: string;
    saturation: number;
    isRetiring: boolean;
    retiringEpoch?: number;
}
export declare const WalletDelegation: React.FC<WalletDelegationProps>;
export default WalletDelegation;
//# sourceMappingURL=WalletDelegation.d.ts.map