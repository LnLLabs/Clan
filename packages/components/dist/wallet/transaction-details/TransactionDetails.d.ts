import React from 'react';
import { Transaction } from '@clan/framework-core';
export interface TransactionDetailsProps {
    transaction: Transaction;
    walletAddress?: string;
    onClose?: () => void;
    className?: string;
}
export declare const TransactionDetails: React.FC<TransactionDetailsProps>;
export default TransactionDetails;
//# sourceMappingURL=TransactionDetails.d.ts.map