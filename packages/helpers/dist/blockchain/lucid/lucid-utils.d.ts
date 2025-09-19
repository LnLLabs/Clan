import { ProviderType, ProviderConfig, NetworkConfig } from '@clan/framework-core';
/**
 * Lucid blockchain utilities based on original BroClanWallet implementation
 * These functions provide the same interface as newLucidEvolution.ts
 */
export interface BlockchainSettings {
    network: string;
    provider: ProviderType;
    api: ProviderConfig;
    metadataProvider?: string;
}
/**
 * Create a new Lucid instance with the specified settings
 * Based on getNewLucidInstance from original newLucidEvolution.ts
 */
export declare function createLucidInstance(settings: BlockchainSettings): Promise<any>;
/**
 * Change provider on an existing Lucid instance
 * Based on changeProvider from original newLucidEvolution.ts
 */
export declare function changeProvider(lucid: any, settings: BlockchainSettings): Promise<any>;
/**
 * Create a provider instance based on settings
 * Based on getProvider from original newLucidEvolution.ts
 */
export declare function createProvider(settings: BlockchainSettings): any;
/**
 * Get default provider configuration for a network
 */
export declare function getDefaultProviderConfig(provider: ProviderType, network: NetworkConfig): ProviderConfig;
/**
 * Validate provider configuration
 */
export declare function validateProviderConfig(provider: ProviderType, config: ProviderConfig): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=lucid-utils.d.ts.map