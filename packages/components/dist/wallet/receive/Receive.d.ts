import React from 'react';
import { WalletInterface } from '@clan/framework-core';
export interface ReceiveProps {
    wallet: WalletInterface;
    donationAddress?: string;
    onAddressCopy?: (address: string) => void;
    className?: string;
}
export declare const Receive: React.FC<ReceiveProps>;
export default Receive;
//# sourceMappingURL=Receive.d.ts.map