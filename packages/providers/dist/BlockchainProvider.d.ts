import React, { ReactNode } from 'react';
import { NetworkConfig } from '@clan/framework-core';
export type ProviderType = 'Blockfrost' | 'Kupmios' | 'MWallet' | 'Maestro';
export interface ProviderConfig {
    url?: string;
    projectId?: string;
    kupoUrl?: string;
    ogmiosUrl?: string;
    apiKey?: string;
}
export interface BlockchainProvider {
    name: string;
    url?: string;
    projectId?: string;
    kupoUrl?: string;
    ogmiosUrl?: string;
    apiKey?: string;
}
interface BlockchainState {
    isConnected: boolean;
    network: NetworkConfig;
    providerType: ProviderType;
    providerConfig: ProviderConfig;
    lucidInstance: any | null;
    blockHeight: number | null;
    slot: number | null;
    epoch: number | null;
    protocolParameters: any | null;
    isLoading: boolean;
    error: string | null;
    lastUpdate: Date | null;
}
interface BlockchainContextValue extends BlockchainState {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    refreshData: () => Promise<void>;
    switchNetwork: (network: NetworkConfig) => Promise<void>;
    switchProvider: (type: ProviderType, config: ProviderConfig) => Promise<void>;
    getLucidInstance: () => any;
    getBlockData: () => Promise<void>;
    getProtocolParameters: () => Promise<void>;
}
interface BlockchainProviderProps {
    children: ReactNode;
    network?: NetworkConfig;
    providerType?: ProviderType;
    providerConfig?: ProviderConfig;
    autoConnect?: boolean;
    refreshInterval?: number;
    onNetworkChange?: (network: NetworkConfig) => void;
    onProviderChange?: (type: ProviderType, config: ProviderConfig) => void;
    onConnectionChange?: (connected: boolean) => void;
    onError?: (error: string) => void;
}
export declare const BlockchainProvider: React.FC<BlockchainProviderProps>;
export declare const useBlockchain: () => BlockchainContextValue;
export default BlockchainProvider;
//# sourceMappingURL=BlockchainProvider.d.ts.map