"use strict";
/**
 * Usage examples for the enhanced SettingsProvider with flexible provider configurations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderSetupComponent = exports.defaultConfigExamples = exports.providerCapabilitiesExample = exports.networkSwitchingExample = exports.validateProviderExamples = exports.ExampleProviderUsage = void 0;
const SettingsProvider_1 = require("./SettingsProvider");
const framework_core_1 = require("@clan/framework-core");
// Example 1: Basic usage with different providers
const ExampleProviderUsage = () => {
    const { settings, updateProvider, updateMetadataProvider, validateProvider, getAvailableProviders, createProviderConfig } = (0, SettingsProvider_1.useSettings)();
    // Get available providers for different use cases
    const availableProviders = getAvailableProviders(false); // For blockchain provider
    const availableMetadataProviders = getAvailableProviders(true); // For metadata provider
    // Example: Switch to Blockfrost provider
    const switchToBlockfrost = async () => {
        const blockfrostConfig = {
            type: 'Blockfrost',
            config: {
                url: 'https://cardano-mainnet.blockfrost.io/api/v0',
                projectId: 'your-project-id-here'
            }
        };
        // Validate before updating
        const validation = validateProvider(blockfrostConfig);
        if (validation.isValid) {
            await updateProvider(blockfrostConfig);
        }
        else {
            console.error('Invalid Blockfrost configuration:', validation.errors);
        }
    };
    // Example: Switch to Kupmios provider
    const switchToKupmios = async () => {
        const kupmiosConfig = {
            type: 'Kupmios',
            config: {
                kupoUrl: 'https://kupo-mainnet.blockfrost.io',
                ogmiosUrl: 'wss://ogmios-mainnet.blockfrost.io'
            }
        };
        await updateProvider(kupmiosConfig);
    };
    // Example: Switch to Maestro provider
    const switchToMaestro = async () => {
        const maestroConfig = {
            type: 'Maestro',
            config: {
                apiKey: 'your-maestro-api-key-here'
            }
        };
        await updateProvider(maestroConfig);
    };
    // Example: Set Maestro as metadata provider
    const setMaestroAsMetadataProvider = async () => {
        const maestroMetadataConfig = {
            type: 'Maestro',
            config: {
                apiKey: 'your-maestro-api-key-here'
            }
        };
        await updateMetadataProvider(maestroMetadataConfig);
    };
    return {
        currentProvider: settings.provider,
        currentMetadataProvider: settings.metadataProvider,
        availableProviders,
        availableMetadataProviders,
        switchToBlockfrost,
        switchToKupmios,
        switchToMaestro,
        setMaestroAsMetadataProvider
    };
};
exports.ExampleProviderUsage = ExampleProviderUsage;
// Example 2: Provider configuration validation
const validateProviderExamples = () => {
    // Valid Blockfrost configuration
    const validBlockfrost = {
        type: 'Blockfrost',
        config: {
            url: 'https://cardano-mainnet.blockfrost.io/api/v0',
            projectId: 'project123'
        }
    };
    // Invalid Blockfrost configuration (missing projectId)
    const invalidBlockfrost = {
        type: 'Blockfrost',
        config: {
            url: 'https://cardano-mainnet.blockfrost.io/api/v0',
            projectId: '' // Empty projectId
        }
    };
    // Valid Kupmios configuration
    const validKupmios = {
        type: 'Kupmios',
        config: {
            kupoUrl: 'https://kupo-mainnet.blockfrost.io',
            ogmiosUrl: 'wss://ogmios-mainnet.blockfrost.io'
        }
    };
    // Invalid Kupmios configuration (missing ogmiosUrl)
    const invalidKupmios = {
        type: 'Kupmios',
        config: {
            kupoUrl: 'https://kupo-mainnet.blockfrost.io'
            // Missing ogmiosUrl
        }
    };
    // Test validations
    console.log('Valid Blockfrost:', (0, SettingsProvider_1.validateProviderConfig)(validBlockfrost));
    console.log('Invalid Blockfrost:', (0, SettingsProvider_1.validateProviderConfig)(invalidBlockfrost));
    console.log('Valid Kupmios:', (0, SettingsProvider_1.validateProviderConfig)(validKupmios));
    console.log('Invalid Kupmios:', (0, SettingsProvider_1.validateProviderConfig)(invalidKupmios));
    return {
        validBlockfrost,
        invalidBlockfrost,
        validKupmios,
        invalidKupmios
    };
};
exports.validateProviderExamples = validateProviderExamples;
// Example 3: Network switching with provider updates
const networkSwitchingExample = () => {
    const { switchNetwork } = (0, SettingsProvider_1.useSettings)();
    const switchToMainnet = async () => {
        await switchNetwork(framework_core_1.NETWORKS.cardano_mainnet);
        // Provider configurations will be automatically updated for mainnet
    };
    const switchToTestnet = async () => {
        await switchNetwork(framework_core_1.NETWORKS.cardano_testnet);
        // Provider configurations will be automatically updated for testnet
    };
    return {
        switchToMainnet,
        switchToTestnet
    };
};
exports.networkSwitchingExample = networkSwitchingExample;
// Example 4: Provider capabilities checking
const providerCapabilitiesExample = () => {
    // Check if a provider can be used as a blockchain provider
    const canBeProvider = (type) => {
        return SettingsProvider_1.PROVIDER_DEFINITIONS[type].canBeProvider;
    };
    // Check if a provider can be used as a metadata provider
    const canBeMetadataProvider = (type) => {
        return SettingsProvider_1.PROVIDER_DEFINITIONS[type].canBeMetadataProvider;
    };
    // Get required fields for a provider
    const getRequiredFields = (type) => {
        return SettingsProvider_1.PROVIDER_DEFINITIONS[type].requiredFields;
    };
    // Examples
    console.log('Blockfrost can be provider:', canBeProvider('Blockfrost')); // true
    console.log('Blockfrost can be metadata provider:', canBeMetadataProvider('Blockfrost')); // true
    console.log('Kupmios can be provider:', canBeProvider('Kupmios')); // true
    console.log('Kupmios can be metadata provider:', canBeMetadataProvider('Kupmios')); // false
    console.log('None can be provider:', canBeProvider('None')); // false
    console.log('None can be metadata provider:', canBeMetadataProvider('None')); // true
    console.log('Blockfrost required fields:', getRequiredFields('Blockfrost')); // ['url', 'projectId']
    console.log('Kupmios required fields:', getRequiredFields('Kupmios')); // ['kupoUrl', 'ogmiosUrl']
    console.log('Maestro required fields:', getRequiredFields('Maestro')); // ['apiKey']
    return {
        canBeProvider,
        canBeMetadataProvider,
        getRequiredFields
    };
};
exports.providerCapabilitiesExample = providerCapabilitiesExample;
// Example 5: Creating default configurations for different networks
const defaultConfigExamples = () => {
    const mainnetBlockfrost = (0, SettingsProvider_1.createDefaultProviderConfig)('Blockfrost', framework_core_1.NETWORKS.cardano_mainnet);
    const testnetBlockfrost = (0, SettingsProvider_1.createDefaultProviderConfig)('Blockfrost', framework_core_1.NETWORKS.cardano_testnet);
    const mainnetKupmios = (0, SettingsProvider_1.createDefaultProviderConfig)('Kupmios', framework_core_1.NETWORKS.cardano_mainnet);
    const testnetKupmios = (0, SettingsProvider_1.createDefaultProviderConfig)('Kupmios', framework_core_1.NETWORKS.cardano_testnet);
    console.log('Mainnet Blockfrost default:', mainnetBlockfrost);
    console.log('Testnet Blockfrost default:', testnetBlockfrost);
    console.log('Mainnet Kupmios default:', mainnetKupmios);
    console.log('Testnet Kupmios default:', testnetKupmios);
    return {
        mainnetBlockfrost,
        testnetBlockfrost,
        mainnetKupmios,
        testnetKupmios
    };
};
exports.defaultConfigExamples = defaultConfigExamples;
// Example 6: Complete provider setup component
const ProviderSetupComponent = () => {
    const { settings, updateProvider, updateMetadataProvider, validateProvider, getAvailableProviders, createProviderConfig, switchNetwork } = (0, SettingsProvider_1.useSettings)();
    const handleProviderChange = async (type, config) => {
        const providerConfig = {
            type,
            config
        };
        const validation = validateProvider(providerConfig);
        if (validation.isValid) {
            await updateProvider(providerConfig);
        }
        else {
            alert(`Invalid configuration: ${validation.errors.join(', ')}`);
        }
    };
    const handleMetadataProviderChange = async (type, config) => {
        const providerConfig = {
            type,
            config
        };
        const validation = validateProvider(providerConfig);
        if (validation.isValid) {
            await updateMetadataProvider(providerConfig);
        }
        else {
            alert(`Invalid configuration: ${validation.errors.join(', ')}`);
        }
    };
    return {
        currentSettings: settings,
        availableProviders: getAvailableProviders(false),
        availableMetadataProviders: getAvailableProviders(true),
        handleProviderChange,
        handleMetadataProviderChange,
        switchNetwork
    };
};
exports.ProviderSetupComponent = ProviderSetupComponent;
//# sourceMappingURL=provider-usage-examples.js.map