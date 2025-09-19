import React from 'react';
import { PendingTransactionData } from './PendingTransaction';
export interface PendingTransactionsListProps {
    transactions: PendingTransactionData[];
    wallet: any;
    onSignTransaction?: (transactionId: string, signature: string) => void;
    onRemoveTransaction?: (transactionId: string) => void;
    onSubmitTransaction?: (transactionId: string) => void;
    className?: string;
    emptyMessage?: string;
}
export declare const PendingTransactionsList: React.FC<PendingTransactionsListProps>;
export default PendingTransactionsList;
//# sourceMappingURL=PendingTransactionsList.d.ts.map