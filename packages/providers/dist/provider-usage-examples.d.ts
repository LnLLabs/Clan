/**
 * Usage examples for the enhanced SettingsProvider with flexible provider configurations
 */
import { ProviderConfig, ProviderType } from './SettingsProvider';
import { NetworkConfig } from '@clan/framework-core';
export declare const ExampleProviderUsage: () => {
    currentProvider: ProviderConfig;
    currentMetadataProvider: ProviderConfig;
    availableProviders: ProviderType[];
    availableMetadataProviders: ProviderType[];
    switchToBlockfrost: () => Promise<void>;
    switchToKupmios: () => Promise<void>;
    switchToMaestro: () => Promise<void>;
    setMaestroAsMetadataProvider: () => Promise<void>;
};
export declare const validateProviderExamples: () => {
    validBlockfrost: {
        type: "Blockfrost";
        config: import("./SettingsProvider").BlockfrostConfig;
    };
    invalidBlockfrost: {
        type: "Blockfrost";
        config: import("./SettingsProvider").BlockfrostConfig;
    };
    validKupmios: {
        type: "Kupmios";
        config: import("./SettingsProvider").KupmiosConfig;
    };
    invalidKupmios: {
        type: "Kupmios";
        config: import("./SettingsProvider").KupmiosConfig;
    };
};
export declare const networkSwitchingExample: () => {
    switchToMainnet: () => Promise<void>;
    switchToTestnet: () => Promise<void>;
};
export declare const providerCapabilitiesExample: () => {
    canBeProvider: (type: ProviderType) => boolean;
    canBeMetadataProvider: (type: ProviderType) => boolean;
    getRequiredFields: (type: ProviderType) => string[];
};
export declare const defaultConfigExamples: () => {
    mainnetBlockfrost: ProviderConfig;
    testnetBlockfrost: ProviderConfig;
    mainnetKupmios: ProviderConfig;
    testnetKupmios: ProviderConfig;
};
export declare const ProviderSetupComponent: () => {
    currentSettings: import("./SettingsProvider").AppSettings;
    availableProviders: ProviderType[];
    availableMetadataProviders: ProviderType[];
    handleProviderChange: (type: ProviderType, config: any) => Promise<void>;
    handleMetadataProviderChange: (type: ProviderType, config: any) => Promise<void>;
    switchNetwork: (network: NetworkConfig) => Promise<void>;
};
//# sourceMappingURL=provider-usage-examples.d.ts.map