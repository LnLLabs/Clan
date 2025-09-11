"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultNetworkValidator = exports.NetworkUtils = exports.NETWORKS = void 0;
// Predefined network configurations for common blockchains
exports.NETWORKS = {
    // Cardano networks
    cardano_mainnet: {
        name: 'Cardano Mainnet',
        networkId: 1,
        protocolMagic: 764824073,
        explorerUrl: 'https://cardanoscan.io/',
        apiUrl: 'https://cardano-mainnet.blockfrost.io/api/v0'
    },
    cardano_testnet: {
        name: 'Cardano Testnet',
        networkId: 0,
        protocolMagic: 1097911063,
        explorerUrl: 'https://testnet.cardanoscan.io/',
        apiUrl: 'https://cardano-testnet.blockfrost.io/api/v0'
    },
    cardano_preprod: {
        name: 'Cardano Preprod',
        networkId: 0,
        protocolMagic: 1,
        explorerUrl: 'https://preprod.cardanoscan.io/',
        apiUrl: 'https://cardano-preprod.blockfrost.io/api/v0'
    },
    cardano_preview: {
        name: 'Cardano Preview',
        networkId: 0,
        protocolMagic: 2,
        explorerUrl: 'https://preview.cardanoscan.io/',
        apiUrl: 'https://cardano-preview.blockfrost.io/api/v0'
    },
    // Generic network configuration
    ethereum_mainnet: {
        name: 'Ethereum Mainnet',
        networkId: 1,
        protocolMagic: 1,
        explorerUrl: 'https://etherscan.io/',
        apiUrl: 'https://mainnet.infura.io/v3'
    },
    ethereum_goerli: {
        name: 'Ethereum Goerli',
        networkId: 5,
        protocolMagic: 5,
        explorerUrl: 'https://goerli.etherscan.io/',
        apiUrl: 'https://goerli.infura.io/v3'
    }
};
// Network utilities
class NetworkUtils {
    static getNetworkById(networkId, protocolMagic) {
        return Object.values(exports.NETWORKS).find(network => network.networkId === networkId &&
            (!protocolMagic || network.protocolMagic === protocolMagic));
    }
    static getNetworkByName(name) {
        return exports.NETWORKS[name.toLowerCase()];
    }
    static isMainnet(network) {
        return network.networkId === 1;
    }
    static isTestnet(network) {
        return network.networkId === 0 || network.networkId > 1;
    }
    static getExplorerUrl(network, txHash, address) {
        let url = network.explorerUrl;
        if (txHash) {
            url += `transaction/${txHash}`;
        }
        else if (address) {
            url += `address/${address}`;
        }
        return url;
    }
    static getApiUrl(network) {
        return network.apiUrl;
    }
}
exports.NetworkUtils = NetworkUtils;
class DefaultNetworkValidator {
    validate(config) {
        return !!(config.name &&
            typeof config.networkId === 'number' &&
            typeof config.protocolMagic === 'number' &&
            config.explorerUrl);
    }
    getRequiredFields() {
        return ['name', 'networkId', 'protocolMagic', 'explorerUrl'];
    }
}
exports.DefaultNetworkValidator = DefaultNetworkValidator;
//# sourceMappingURL=network-config.js.map