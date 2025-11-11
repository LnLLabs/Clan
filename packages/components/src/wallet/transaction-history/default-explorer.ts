import { BlockchainExplorer, NoOpExplorer, NetworkConfig } from '@clan/framework-core';

/**
 * Creates a default CExplorer instance with automatic network detection
 * Used when no explicit explorer is provided to components
 */
export function createDefaultExplorer(network: NetworkConfig): BlockchainExplorer {
  try {
    const networkName = network.name?.toLowerCase() || 'mainnet';
    
    // Determine network type
    let networkType: 'mainnet' | 'preprod' | 'preview' = 'mainnet';
    if (networkName.includes('preprod')) {
      networkType = 'preprod';
    } else if (networkName.includes('preview')) {
      networkType = 'preview';
    }
    
    // Return inline CExplorer implementation to avoid circular dependencies
    const baseUrl = networkType === 'mainnet' 
      ? 'https://cexplorer.io'
      : networkType === 'preprod'
      ? 'https://preprod.cexplorer.io'
      : 'https://preview.cexplorer.io';

    return {
      name: 'CExplorer',
      baseUrl,
      
      getTransactionLink: (txHash: string) => {
        return `${baseUrl}/tx/${txHash}`;
      },
      
      getTokenLink: (policyId: string, assetName?: string) => {
        if (assetName && assetName !== '') {
          return `${baseUrl}/asset/${policyId}${assetName}`;
        }
        return `${baseUrl}/policy/${policyId}`;
      },
      
      getAddressLink: (address: string) => {
        return `${baseUrl}/address/${address}`;
      },
      
      getStakeAddressLink: (stakeAddress: string) => {
        return `${baseUrl}/stake/${stakeAddress}`;
      },
      
      getPoolLink: (poolId: string) => {
        return `${baseUrl}/pool/${poolId}`;
      },
      
      getBlockLink: (blockHash: string | number) => {
        return `${baseUrl}/block/${blockHash}`;
      },
      
      getPolicyLink: (policyId: string) => {
        return `${baseUrl}/policy/${policyId}`;
      }
    };
  } catch (e) {
    console.warn('Failed to create default explorer, using NoOpExplorer', e);
    return new NoOpExplorer();
  }
}

/**
 * Detects the network type from a NetworkConfig
 * Returns 'mainnet', 'preprod', or 'preview'
 */
export function detectNetworkType(network: NetworkConfig): 'mainnet' | 'preprod' | 'preview' {
  const networkName = network.name?.toLowerCase() || 'mainnet';
  
  if (networkName.includes('preprod')) {
    return 'preprod';
  } else if (networkName.includes('preview')) {
    return 'preview';
  }
  
  return 'mainnet';
}

