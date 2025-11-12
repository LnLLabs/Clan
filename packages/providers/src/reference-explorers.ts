import { BlockchainExplorer, ExplorerType, NoOpExplorer } from '@clan/framework-core';

/**
 * CExplorer (cexplorer.io) - Popular Cardano blockchain explorer
 * Supports mainnet, preprod, and preview networks
 */
export class CExplorerExplorer implements BlockchainExplorer {
  readonly name = 'CExplorer';
  readonly baseUrl: string;
  private network: 'mainnet' | 'preprod' | 'preview';

  constructor(network: 'mainnet' | 'preprod' | 'preview' = 'mainnet') {
    this.network = network;
    
    // CExplorer uses different subdomains for different networks
    switch (network) {
      case 'mainnet':
        this.baseUrl = 'https://cexplorer.io';
        break;
      case 'preprod':
        this.baseUrl = 'https://preprod.cexplorer.io';
        break;
      case 'preview':
        this.baseUrl = 'https://preview.cexplorer.io';
        break;
      default:
        this.baseUrl = 'https://cexplorer.io';
    }
  }

  getTokenLink(policyId: string, assetName?: string): string {
    if (assetName && assetName !== '') {
      // Full asset link: policy.assetName
      return `${this.baseUrl}/asset/${policyId}${assetName}`;
    }
    // Policy-level link
    return `${this.baseUrl}/policy/${policyId}`;
  }

  getTransactionLink(txHash: string): string {
    return `${this.baseUrl}/tx/${txHash}`;
  }

  getAddressLink(address: string): string {
    return `${this.baseUrl}/address/${address}`;
  }

  getStakeAddressLink(stakeAddress: string): string {
    return `${this.baseUrl}/stake/${stakeAddress}`;
  }

  getPoolLink(poolId: string): string {
    return `${this.baseUrl}/pool/${poolId}`;
  }

  getBlockLink(blockHash: string | number): string {
    return `${this.baseUrl}/block/${blockHash}`;
  }

  getPolicyLink(policyId: string): string {
    return `${this.baseUrl}/policy/${policyId}`;
  }
}

/**
 * CardanoScan (cardanoscan.io) - Another popular Cardano blockchain explorer
 */
export class CardanoScanExplorer implements BlockchainExplorer {
  readonly name = 'CardanoScan';
  readonly baseUrl: string;
  private network: 'mainnet' | 'preprod' | 'preview';

  constructor(network: 'mainnet' | 'preprod' | 'preview' = 'mainnet') {
    this.network = network;
    
    // CardanoScan uses different subdomains for different networks
    switch (network) {
      case 'mainnet':
        this.baseUrl = 'https://cardanoscan.io';
        break;
      case 'preprod':
        this.baseUrl = 'https://preprod.cardanoscan.io';
        break;
      case 'preview':
        this.baseUrl = 'https://preview.cardanoscan.io';
        break;
      default:
        this.baseUrl = 'https://cardanoscan.io';
    }
  }

  getTokenLink(policyId: string, assetName?: string): string {
    if (assetName && assetName !== '') {
      // Full asset link
      return `${this.baseUrl}/token/${policyId}${assetName}`;
    }
    // Policy-level link
    return `${this.baseUrl}/tokenPolicy/${policyId}`;
  }

  getTransactionLink(txHash: string): string {
    return `${this.baseUrl}/transaction/${txHash}`;
  }

  getAddressLink(address: string): string {
    return `${this.baseUrl}/address/${address}`;
  }

  getStakeAddressLink(stakeAddress: string): string {
    return `${this.baseUrl}/stakekey/${stakeAddress}`;
  }

  getPoolLink(poolId: string): string {
    return `${this.baseUrl}/pool/${poolId}`;
  }

  getBlockLink(blockHash: string | number): string {
    return `${this.baseUrl}/block/${blockHash}`;
  }

  getPolicyLink(policyId: string): string {
    return `${this.baseUrl}/tokenPolicy/${policyId}`;
  }
}

/**
 * ADAStat (adastat.net) - Cardano blockchain explorer with analytics
 */
export class ADAStatExplorer implements BlockchainExplorer {
  readonly name = 'ADAStat';
  readonly baseUrl: string;
  private network: 'mainnet' | 'preprod' | 'preview';

  constructor(network: 'mainnet' | 'preprod' | 'preview' = 'mainnet') {
    this.network = network;
    
    // ADAStat primarily supports mainnet
    switch (network) {
      case 'mainnet':
        this.baseUrl = 'https://adastat.net';
        break;
      case 'preprod':
        this.baseUrl = 'https://preprod.adastat.net';
        break;
      case 'preview':
        this.baseUrl = 'https://preview.adastat.net';
        break;
      default:
        this.baseUrl = 'https://adastat.net';
    }
  }

  getTokenLink(policyId: string, assetName?: string): string {
    if (assetName && assetName !== '') {
      // Full asset link
      return `${this.baseUrl}/tokens/${policyId}${assetName}`;
    }
    // Policy-level link
    return `${this.baseUrl}/policies/${policyId}`;
  }

  getTransactionLink(txHash: string): string {
    return `${this.baseUrl}/transactions/${txHash}`;
  }

  getAddressLink(address: string): string {
    return `${this.baseUrl}/addresses/${address}`;
  }

  getStakeAddressLink(stakeAddress: string): string {
    return `${this.baseUrl}/stakes/${stakeAddress}`;
  }

  getPoolLink(poolId: string): string {
    return `${this.baseUrl}/pools/${poolId}`;
  }

  getBlockLink(blockHash: string | number): string {
    return `${this.baseUrl}/blocks/${blockHash}`;
  }

  getPolicyLink(policyId: string): string {
    return `${this.baseUrl}/policies/${policyId}`;
  }
}

/**
 * Factory function to create blockchain explorer based on settings
 * This is a convenience function for apps that want to use standard explorers
 */
export function createBlockchainExplorer(config: {
  type: ExplorerType;
  network?: 'mainnet' | 'preprod' | 'preview';
}): BlockchainExplorer {
  const network = config.network || 'mainnet';

  switch (config.type) {
    case 'CExplorer':
      return new CExplorerExplorer(network);
    
    case 'CardanoScan':
      return new CardanoScanExplorer(network);
    
    case 'ADAStat':
      return new ADAStatExplorer(network);
    
    case 'Custom':
    default:
      return new NoOpExplorer();
  }
}

/**
 * Get all available explorer types for a network
 */
export function getAvailableExplorers(): ExplorerType[] {
  return ['CExplorer', 'CardanoScan', 'ADAStat'];
}


