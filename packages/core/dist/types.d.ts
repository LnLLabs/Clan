export type Address = string;
export type Hash = string;
export type PolicyId = string;
export type AssetName = string;
export type AssetId = string;
export interface Asset {
    policyId: PolicyId;
    assetName: AssetName;
    quantity: bigint;
}
export interface Assets {
    [assetId: string]: bigint;
}
export interface UTxO {
    txHash: Hash;
    outputIndex: number;
    address: Address;
    assets: Assets;
    datum?: string;
    datumHash?: Hash;
}
export interface Transaction {
    hash: Hash;
    inputs: UTxO[];
    outputs: UTxO[];
    fee: bigint;
    metadata?: any;
    timestamp?: number;
}
export interface NetworkConfig {
    name: string;
    networkId: number;
    protocolMagic: number;
    explorerUrl: string;
    apiUrl?: string;
}
export interface WalletConfig {
    name: string;
    version: string;
    network: NetworkConfig;
}
export interface TransactionStatus {
    pending: boolean;
    confirmed: boolean;
    failed: boolean;
    blockHeight?: number;
    timestamp?: number;
}
export interface WalletState {
    isConnected: boolean;
    address?: Address;
    balance?: Assets;
    network?: NetworkConfig;
    isLoading: boolean;
    error?: string;
}
export declare class WalletError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
export declare class NetworkError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
export declare class TransactionError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
//# sourceMappingURL=types.d.ts.map