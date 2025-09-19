import React from 'react';
import { Transaction } from '@clan/framework-core';
export interface PendingTransactionData {
    id: string;
    transaction: Transaction;
    signatures: Record<string, string>;
    requiredSigners: string[];
    createdAt: Date;
    expiresAt?: Date;
}
export interface PendingTransactionProps {
    transaction: PendingTransactionData;
    wallet: any;
    onSign?: (signature: string) => void;
    onRemove?: () => void;
    onSubmit?: () => void;
    className?: string;
}
export declare const PendingTransaction: React.FC<PendingTransactionProps>;
export default PendingTransaction;
//# sourceMappingURL=PendingTransaction.d.ts.map