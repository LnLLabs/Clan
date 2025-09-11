import { Address, Hash, Assets, UTxO, Transaction, NetworkConfig, TransactionStatus } from './types';
export interface WalletInterface {
    getName(): string;
    getAddress(): Address;
    getNetwork(): NetworkConfig;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getBalance(): Promise<Assets>;
    getUtxos(): Promise<UTxO[]>;
    createTransaction(outputs: {
        address: Address;
        assets: Assets;
    }[], options?: TransactionOptions): Promise<TransactionDraft>;
    signTransaction(draft: TransactionDraft): Promise<SignedTransaction>;
    submitTransaction(signedTx: SignedTransaction): Promise<Hash>;
    getTransactionStatus(txHash: Hash): Promise<TransactionStatus>;
    getTransaction(txHash: Hash): Promise<Transaction>;
    getCollateral?(): Promise<UTxO[]>;
    getRewardAddress?(): Address;
    getStakingAddress?(): Address;
}
export interface TransactionOptions {
    fee?: bigint;
    ttl?: number;
    metadata?: any;
    collateral?: UTxO[];
    scriptInputs?: UTxO[];
}
export interface TransactionDraft {
    inputs: UTxO[];
    outputs: UTxO[];
    fee: bigint;
    ttl?: number;
    metadata?: any;
    witnesses: any[];
}
export interface SignedTransaction {
    transaction: Transaction;
    witnesses: any[];
}
export interface WalletFactory {
    createWallet(config: WalletConfig): WalletInterface;
    getSupportedNetworks(): NetworkConfig[];
    isAvailable(): boolean;
}
export interface WalletConfig {
    network: NetworkConfig;
    options?: Record<string, any>;
}
export declare enum WalletEventType {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    BALANCE_CHANGED = "balance_changed",
    NETWORK_CHANGED = "network_changed",
    TRANSACTION_SUBMITTED = "transaction_submitted",
    TRANSACTION_CONFIRMED = "transaction_confirmed",
    ERROR = "error"
}
export interface WalletEvent {
    type: WalletEventType;
    payload?: any;
    timestamp: number;
}
//# sourceMappingURL=wallet-interface.d.ts.map