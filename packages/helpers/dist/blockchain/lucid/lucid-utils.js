"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLucidInstance = createLucidInstance;
exports.changeProvider = changeProvider;
exports.createProvider = createProvider;
exports.getDefaultProviderConfig = getDefaultProviderConfig;
exports.validateProviderConfig = validateProviderConfig;
/**
 * Create a new Lucid instance with the specified settings
 * Based on getNewLucidInstance from original newLucidEvolution.ts
 */
async function createLucidInstance(settings) {
    return new Promise(async (resolve, reject) => {
        try {
            const provider = createProvider(settings);
            // This would use actual LucidEvolution in production
            // For now, return a mock implementation
            const lucid = {
                provider,
                network: settings.network,
                switchProvider: async (newProvider) => {
                    // Implementation for switching providers
                }
            };
            resolve(lucid);
        }
        catch (error) {
            reject(error);
        }
    });
}
/**
 * Change provider on an existing Lucid instance
 * Based on changeProvider from original newLucidEvolution.ts
 */
async function changeProvider(lucid, settings) {
    return new Promise(async (resolve, reject) => {
        try {
            const provider = createProvider(settings);
            await lucid.switchProvider(provider);
            resolve(lucid);
        }
        catch (error) {
            reject(error);
        }
    });
}
/**
 * Create a provider instance based on settings
 * Based on getProvider from original newLucidEvolution.ts
 */
function createProvider(settings) {
    switch (settings.provider) {
        case 'Blockfrost':
            return createBlockfrostProvider(settings.api);
        case 'Kupmios':
            return createKupmiosProvider(settings.api);
        case 'MWallet':
            return createMWalletProvider(settings.api);
        case 'Maestro':
            return createMaestroProvider(settings.api);
        default:
            throw new Error(`Invalid provider: ${settings.provider}`);
    }
}
/**
 * Create Blockfrost provider
 */
function createBlockfrostProvider(config) {
    // This would use actual Blockfrost provider in production
    return {
        name: 'Blockfrost',
        url: config.url,
        projectId: config.projectId,
        getProtocolParameters: async () => ({}),
        getUtxos: async () => [],
        getUtxosByOutRef: async () => [],
        getDatum: async () => null
    };
}
/**
 * Create Kupmios provider
 */
function createKupmiosProvider(config) {
    // This would use actual Kupmios provider in production
    return {
        name: 'Kupmios',
        kupoUrl: config.kupoUrl,
        ogmiosUrl: config.ogmiosUrl,
        getProtocolParameters: async () => ({}),
        getUtxos: async () => [],
        getUtxosByOutRef: async () => [],
        getDatum: async () => null
    };
}
/**
 * Create MWalet provider
 */
function createMWalletProvider(config) {
    // MWalet uses Blockfrost under the hood
    return createBlockfrostProvider(config);
}
/**
 * Create Maestro provider
 */
function createMaestroProvider(config) {
    // This would use actual Maestro provider in production
    return {
        name: 'Maestro',
        apiKey: config.apiKey,
        network: config.network,
        getProtocolParameters: async () => ({}),
        getUtxos: async () => [],
        getUtxosByOutRef: async () => [],
        getDatum: async () => null
    };
}
/**
 * Get default provider configuration for a network
 */
function getDefaultProviderConfig(provider, network) {
    switch (provider) {
        case 'Blockfrost':
            return getDefaultBlockfrostConfig(network);
        case 'Kupmios':
            return getDefaultKupmiosConfig(network);
        case 'MWallet':
            return getDefaultMWalletConfig(network);
        case 'Maestro':
            return getDefaultMaestroConfig(network);
        default:
            return {};
    }
}
/**
 * Get default Blockfrost configuration
 */
function getDefaultBlockfrostConfig(network) {
    const baseUrl = network.name === 'Mainnet'
        ? 'https://cardano-mainnet.blockfrost.io/api/v0'
        : network.name === 'Preprod'
            ? 'https://cardano-preprod.blockfrost.io/api/v0'
            : 'https://cardano-preview.blockfrost.io/api/v0';
    return {
        url: baseUrl,
        projectId: '' // User needs to provide their own project ID
    };
}
/**
 * Get default Kupmios configuration
 */
function getDefaultKupmiosConfig(network) {
    if (network.name === 'Mainnet') {
        return {
            kupoUrl: 'https://kupo-mainnet-wmalletmainnet-c8be04.us1.demeter.run',
            ogmiosUrl: 'wss://ogmios-wmalletmainnet-c8be04.us1.demeter.run'
        };
    }
    else if (network.name === 'Preprod') {
        return {
            kupoUrl: 'https://kupo-preprod-mwallet-e048ec.us1.demeter.run',
            ogmiosUrl: 'wss://ogmios-mwallet-e048ec.us1.demeter.run'
        };
    }
    return {
        kupoUrl: '',
        ogmiosUrl: ''
    };
}
/**
 * Get default MWalet configuration
 */
function getDefaultMWalletConfig(network) {
    return {
        url: 'https://passthrough.broclan.io',
        projectId: network.name === 'Mainnet' ? 'mainnet' :
            network.name === 'Preprod' ? 'preprod' : 'preview'
    };
}
/**
 * Get default Maestro configuration
 */
function getDefaultMaestroConfig(network) {
    const networkName = network.name.toLowerCase();
    return {
        network: networkName,
        apiKey: '' // User needs to provide their own API key
    };
}
/**
 * Validate provider configuration
 */
function validateProviderConfig(provider, config) {
    const errors = [];
    switch (provider) {
        case 'Blockfrost':
            if (!config.url)
                errors.push('Blockfrost URL is required');
            if (!config.projectId)
                errors.push('Blockfrost project ID is required');
            break;
        case 'Kupmios':
            if (!config.kupoUrl)
                errors.push('Kupo URL is required');
            if (!config.ogmiosUrl)
                errors.push('Ogmios URL is required');
            break;
        case 'Maestro':
            if (!config.apiKey)
                errors.push('Maestro API key is required');
            break;
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
//# sourceMappingURL=lucid-utils.js.map