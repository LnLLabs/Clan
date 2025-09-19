import React from 'react';
import { Assets, UTxO, Transaction, TransactionBuildOptions } from '@clan/framework-core';
export interface TransactionRecipient {
    address: string;
    assets: Assets;
    datum?: string;
    datumHash?: string;
}
export interface TransactionCreatorProps {
    wallet: any;
    availableUtxos: UTxO[];
    onTransactionCreated?: (transaction: Transaction, options: TransactionBuildOptions) => void;
    onCancel?: () => void;
    className?: string;
}
export declare const TransactionCreator: React.FC<TransactionCreatorProps>;
export default TransactionCreator;
//# sourceMappingURL=TransactionCreator.d.ts.map