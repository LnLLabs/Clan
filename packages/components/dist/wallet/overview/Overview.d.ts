import React from 'react';
import { WalletInterface } from '@clan/framework-core';
export interface OverviewProps {
    wallet: WalletInterface;
    selectedAddress?: string;
    onAddressChange?: (address: string) => void;
    onTokenClick?: (tokenId: string) => void;
    onSetDefaultAddress?: (address: string) => void;
    onChangeAddressName?: (address: string, name: string) => void;
    className?: string;
}
export declare const Overview: React.FC<OverviewProps>;
export default Overview;
//# sourceMappingURL=Overview.d.ts.map