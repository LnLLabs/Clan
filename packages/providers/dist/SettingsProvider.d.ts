import React, { ReactNode } from 'react';
import { NetworkConfig } from '@clan/framework-core';
export type ProviderType = 'Blockfrost' | 'Kupmios' | 'MWallet' | 'Maestro' | 'None';
export interface BlockfrostConfig {
    url: string;
    projectId: string;
}
export interface KupmiosConfig {
    kupoUrl: string;
    ogmiosUrl: string;
}
export interface MWalletConfig {
    url: string;
    projectId: string;
}
export interface MaestroConfig {
    apiKey: string;
}
export interface NoneConfig {
}
export type ProviderConfig = {
    type: 'Blockfrost';
    config: BlockfrostConfig;
} | {
    type: 'Kupmios';
    config: KupmiosConfig;
} | {
    type: 'MWallet';
    config: MWalletConfig;
} | {
    type: 'Maestro';
    config: MaestroConfig;
} | {
    type: 'None';
    config: NoneConfig;
};
export interface ProviderCapabilities {
    canBeProvider: boolean;
    canBeMetadataProvider: boolean;
    requiredFields: string[];
    optionalFields?: string[];
}
export declare const PROVIDER_DEFINITIONS: Record<ProviderType, ProviderCapabilities>;
export interface AppSettings {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    network: NetworkConfig;
    explorer: string;
    enableNotifications: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
    customSettings: Record<string, any>;
    sendAll: boolean;
    disableSync: boolean;
    provider: ProviderConfig;
    metadataProvider: ProviderConfig;
}
export declare const validateProviderConfig: (providerConfig: ProviderConfig) => {
    isValid: boolean;
    errors: string[];
};
export declare const getAvailableProviders: (forMetadataProvider?: boolean) => ProviderType[];
export declare const createDefaultProviderConfig: (type: ProviderType, network: NetworkConfig) => ProviderConfig;
interface SettingsState {
    settings: AppSettings;
    isLoading: boolean;
    error: string | null;
}
interface SettingsContextValue extends SettingsState {
    updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
    resetToDefaults: () => Promise<void>;
    getSetting: <T>(key: keyof AppSettings) => T;
    setSetting: <T>(key: keyof AppSettings, value: T) => Promise<void>;
    updateProvider: (provider: ProviderConfig) => Promise<void>;
    updateMetadataProvider: (provider: ProviderConfig) => Promise<void>;
    switchNetwork: (network: NetworkConfig) => Promise<void>;
    validateProvider: (provider: ProviderConfig) => {
        isValid: boolean;
        errors: string[];
    };
    getAvailableProviders: (forMetadataProvider?: boolean) => ProviderType[];
    createProviderConfig: (type: ProviderType) => ProviderConfig;
}
interface SettingsProviderProps {
    children: ReactNode;
    defaultSettings?: Partial<AppSettings>;
    storageKey?: string;
    onSettingsChange?: (settings: AppSettings) => void;
    onError?: (error: string) => void;
}
export declare const SettingsProvider: React.FC<SettingsProviderProps>;
export declare const useSettings: () => SettingsContextValue;
export default SettingsProvider;
//# sourceMappingURL=SettingsProvider.d.ts.map