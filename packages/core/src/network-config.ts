import { NetworkConfig } from './types';

// Predefined network configurations for common blockchains
export const NETWORKS: Record<string, NetworkConfig> = {
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
export class NetworkUtils {
  static getNetworkById(networkId: number, protocolMagic?: number): NetworkConfig | undefined {
    return Object.values(NETWORKS).find(
      network =>
        network.networkId === networkId &&
        (!protocolMagic || network.protocolMagic === protocolMagic)
    );
  }

  static getNetworkByName(name: string): NetworkConfig | undefined {
    return NETWORKS[name.toLowerCase()];
  }

  static isMainnet(network: NetworkConfig): boolean {
    return network.networkId === 1;
  }

  static isTestnet(network: NetworkConfig): boolean {
    return network.networkId === 0 || network.networkId > 1;
  }

  static getExplorerUrl(network: NetworkConfig, txHash?: string, address?: string): string {
    let url = network.explorerUrl;

    if (txHash) {
      url += `transaction/${txHash}`;
    } else if (address) {
      url += `address/${address}`;
    }

    return url;
  }

  static getApiUrl(network: NetworkConfig): string | undefined {
    return network.apiUrl;
  }
}

// Network configuration validator
export interface NetworkConfigValidator {
  validate(config: NetworkConfig): boolean;
  getRequiredFields(): string[];
}

export class DefaultNetworkValidator implements NetworkConfigValidator {
  validate(config: NetworkConfig): boolean {
    return !!(
      config.name &&
      typeof config.networkId === 'number' &&
      typeof config.protocolMagic === 'number' &&
      config.explorerUrl
    );
  }

  getRequiredFields(): string[] {
    return ['name', 'networkId', 'protocolMagic', 'explorerUrl'];
  }
}

