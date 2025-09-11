import { NetworkConfig } from './types';
export declare const NETWORKS: Record<string, NetworkConfig>;
export declare class NetworkUtils {
    static getNetworkById(networkId: number, protocolMagic?: number): NetworkConfig | undefined;
    static getNetworkByName(name: string): NetworkConfig | undefined;
    static isMainnet(network: NetworkConfig): boolean;
    static isTestnet(network: NetworkConfig): boolean;
    static getExplorerUrl(network: NetworkConfig, txHash?: string, address?: string): string;
    static getApiUrl(network: NetworkConfig): string | undefined;
}
export interface NetworkConfigValidator {
    validate(config: NetworkConfig): boolean;
    getRequiredFields(): string[];
}
export declare class DefaultNetworkValidator implements NetworkConfigValidator {
    validate(config: NetworkConfig): boolean;
    getRequiredFields(): string[];
}
//# sourceMappingURL=network-config.d.ts.map