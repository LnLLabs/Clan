import React from 'react';
import { Assets, Asset } from '@clan/framework-core';
export interface BalanceDisplayProps {
    balance: Assets;
    loading?: boolean;
    showZeroBalances?: boolean;
    formatAssetName?: (asset: Asset) => string;
    formatAssetValue?: (asset: Asset) => string;
    className?: string;
}
export declare const BalanceDisplay: React.FC<BalanceDisplayProps>;
export default BalanceDisplay;
//# sourceMappingURL=BalanceDisplay.d.ts.map