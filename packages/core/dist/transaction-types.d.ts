import { Address, Assets, UTxO, Hash } from './types';
export interface TransactionInput {
    txHash: Hash;
    outputIndex: number;
    address: Address;
    assets: Assets;
}
export interface TransactionOutput {
    address: Address;
    assets: Assets;
    datum?: string;
    datumHash?: Hash;
}
export interface TransactionMetadata {
    [key: number]: any;
}
export interface TransactionBody {
    inputs: TransactionInput[];
    outputs: TransactionOutput[];
    fee: bigint;
    ttl?: number;
    validityStartInterval?: number;
    metadata?: TransactionMetadata;
    collateral?: TransactionInput[];
    collateralReturn?: TransactionOutput;
    totalCollateral?: bigint;
    referenceInputs?: TransactionInput[];
    mint?: Assets;
    scriptDataHash?: Hash;
    networkId?: number;
}
export interface TransactionWitnessSet {
    vkeyWitnesses?: VKeyWitness[];
    nativeScripts?: any[];
    bootstrapWitnesses?: any[];
    plutusScripts?: any[];
    plutusData?: any[];
    redeemers?: any[];
}
export interface VKeyWitness {
    vkey: string;
    signature: string;
}
export interface SignedTransaction {
    transaction: {
        body: TransactionBody;
        hash: Hash;
    };
    witnesses: TransactionWitnessSet;
}
export interface TransactionBuildOptions {
    inputs?: TransactionInput[];
    outputs?: TransactionOutput[];
    changeAddress?: Address;
    fee?: bigint;
    ttl?: number;
    metadata?: TransactionMetadata;
    collateral?: UTxO[];
    mint?: Assets;
    scriptUtxos?: UTxO[];
    requiredSigners?: string[];
}
export interface TransactionSubmission {
    hash: Hash;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    blockHeight?: number;
}
export interface TransactionHistoryEntry {
    hash: Hash;
    timestamp: number;
    blockHeight?: number;
    direction: 'incoming' | 'outgoing' | 'internal';
    amount: Assets;
    fee?: bigint;
    status: 'pending' | 'confirmed' | 'failed';
    metadata?: TransactionMetadata;
}
export interface UtxoSelectionStrategy {
    select(utxos: UTxO[], required: Assets, fee: bigint): Promise<{
        selected: UTxO[];
        change: Assets;
    }>;
}
export interface FeeEstimator {
    estimateFee(inputs: TransactionInput[], outputs: TransactionOutput[], options?: TransactionBuildOptions): Promise<bigint>;
}
//# sourceMappingURL=transaction-types.d.ts.map