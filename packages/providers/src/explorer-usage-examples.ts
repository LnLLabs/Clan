/**
 * Blockchain Explorer Usage Examples
 * 
 * This file demonstrates various ways to use the blockchain explorer system
 * in your Cardano application.
 */

import {
  CExplorerExplorer,
  CardanoScanExplorer,
  ADAStatExplorer,
  createBlockchainExplorer,
  getAvailableExplorers
} from './reference-explorers';
import { BlockchainExplorer, ExplorerType } from '@clan/framework-core';

// ============================================================================
// EXAMPLE 1: Basic Usage with CExplorer
// ============================================================================

export function example1_BasicCExplorer() {
  // Create a CExplorer instance for mainnet
  const explorer = new CExplorerExplorer('mainnet');

  // Get link to MIN token
  const minTokenLink = explorer.getTokenLink(
    '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
    '4d494e'
  );
  console.log('MIN Token:', minTokenLink);
  // Output: https://cexplorer.io/asset/29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e

  // Get link to a transaction
  const txLink = explorer.getTransactionLink(
    'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890'
  );
  console.log('Transaction:', txLink);

  // Get link to an address
  const addressLink = explorer.getAddressLink(
    'addr1qxy2kgdygjrsqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqh'
  );
  console.log('Address:', addressLink);
}

// ============================================================================
// EXAMPLE 2: Factory Pattern with Different Networks
// ============================================================================

export function example2_FactoryPattern() {
  // Create explorers for different networks using factory
  const mainnetExplorer = createBlockchainExplorer({
    type: 'CExplorer',
    network: 'mainnet'
  });

  const preprodExplorer = createBlockchainExplorer({
    type: 'CExplorer',
    network: 'preprod'
  });

  const previewExplorer = createBlockchainExplorer({
    type: 'CExplorer',
    network: 'preview'
  });

  console.log('Mainnet base:', mainnetExplorer.baseUrl);
  console.log('Preprod base:', preprodExplorer.baseUrl);
  console.log('Preview base:', previewExplorer.baseUrl);
}

// ============================================================================
// EXAMPLE 3: Multiple Explorer Support
// ============================================================================

export function example3_MultipleExplorers() {
  const policyId = '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6';
  const assetName = '4d494e';

  // Get links from all available explorers
  const explorers = [
    new CExplorerExplorer('mainnet'),
    new CardanoScanExplorer('mainnet'),
    new ADAStatExplorer('mainnet')
  ];

  console.log('Token links across explorers:');
  explorers.forEach(explorer => {
    const link = explorer.getTokenLink(policyId, assetName);
    console.log(`${explorer.name}: ${link}`);
  });
}

// ============================================================================
// EXAMPLE 4: React Component Integration
// ============================================================================

interface TransactionLinkProps {
  txHash: string;
  explorerType?: ExplorerType;
  network?: 'mainnet' | 'preprod' | 'preview';
}

export function TransactionLink({ 
  txHash, 
  explorerType = 'CExplorer',
  network = 'mainnet'
}: TransactionLinkProps) {
  const explorer = createBlockchainExplorer({ type: explorerType, network });
  const url = explorer.getTransactionLink(txHash);

  return {
    url,
    name: explorer.name,
    shortHash: txHash.slice(0, 10) + '...' + txHash.slice(-10)
  };
}

// Usage:
// const link = TransactionLink({ 
//   txHash: 'abc123...', 
//   explorerType: 'CExplorer' 
// });
// <a href={link.url}>{link.shortHash}</a>

// ============================================================================
// EXAMPLE 5: Token Display Component
// ============================================================================

interface TokenDisplayData {
  policyId: string;
  assetName: string;
  displayName: string;
  logo?: string;
}

export function getTokenExplorerData(
  token: TokenDisplayData,
  explorerType: ExplorerType = 'CExplorer'
) {
  const explorer = createBlockchainExplorer({ 
    type: explorerType, 
    network: 'mainnet' 
  });

  return {
    tokenLink: explorer.getTokenLink(token.policyId, token.assetName),
    policyLink: explorer.getPolicyLink?.(token.policyId) || '',
    displayName: token.displayName,
    logo: token.logo,
    explorerName: explorer.name
  };
}

// ============================================================================
// EXAMPLE 6: Explorer Switcher Logic
// ============================================================================

export class ExplorerManager {
  private currentExplorer: BlockchainExplorer;
  private currentType: ExplorerType;
  private network: 'mainnet' | 'preprod' | 'preview';

  constructor(
    initialType: ExplorerType = 'CExplorer',
    network: 'mainnet' | 'preprod' | 'preview' = 'mainnet'
  ) {
    this.currentType = initialType;
    this.network = network;
    this.currentExplorer = createBlockchainExplorer({ 
      type: initialType, 
      network 
    });
  }

  switchExplorer(type: ExplorerType) {
    this.currentType = type;
    this.currentExplorer = createBlockchainExplorer({ 
      type, 
      network: this.network 
    });
  }

  switchNetwork(network: 'mainnet' | 'preprod' | 'preview') {
    this.network = network;
    this.currentExplorer = createBlockchainExplorer({ 
      type: this.currentType, 
      network 
    });
  }

  getExplorer(): BlockchainExplorer {
    return this.currentExplorer;
  }

  getAvailableTypes(): ExplorerType[] {
    return getAvailableExplorers();
  }

  getCurrentType(): ExplorerType {
    return this.currentType;
  }

  getCurrentNetwork(): string {
    return this.network;
  }
}

// Usage:
// const manager = new ExplorerManager('CExplorer', 'mainnet');
// manager.switchExplorer('CardanoScan');
// const link = manager.getExplorer().getTransactionLink(txHash);

// ============================================================================
// EXAMPLE 7: Batch Link Generation
// ============================================================================

interface Asset {
  policyId: string;
  assetName: string;
  name: string;
}

export function generateAssetLinks(
  assets: Asset[],
  explorerType: ExplorerType = 'CExplorer'
) {
  const explorer = createBlockchainExplorer({ 
    type: explorerType, 
    network: 'mainnet' 
  });

  return assets.map(asset => ({
    ...asset,
    explorerLink: explorer.getTokenLink(asset.policyId, asset.assetName),
    policyLink: explorer.getPolicyLink?.(asset.policyId) || ''
  }));
}

// ============================================================================
// EXAMPLE 8: Transaction History with Explorer Links
// ============================================================================

interface Transaction {
  hash: string;
  timestamp: number;
  amount: string;
  type: 'send' | 'receive';
}

export function enrichTransactionsWithLinks(
  transactions: Transaction[],
  explorerType: ExplorerType = 'CExplorer',
  network: 'mainnet' | 'preprod' | 'preview' = 'mainnet'
) {
  const explorer = createBlockchainExplorer({ type: explorerType, network });

  return transactions.map(tx => ({
    ...tx,
    explorerLink: explorer.getTransactionLink(tx.hash),
    explorerName: explorer.name,
    shortHash: `${tx.hash.slice(0, 8)}...${tx.hash.slice(-8)}`
  }));
}

// ============================================================================
// EXAMPLE 9: Stake Pool Link
// ============================================================================

export function getStakePoolInfo(
  poolId: string,
  explorerType: ExplorerType = 'CExplorer'
) {
  const explorer = createBlockchainExplorer({ 
    type: explorerType, 
    network: 'mainnet' 
  });

  return {
    poolId,
    explorerLink: explorer.getPoolLink?.(poolId) || '',
    explorerName: explorer.name
  };
}

// ============================================================================
// EXAMPLE 10: Address Book with Explorer Links
// ============================================================================

interface AddressBookEntry {
  name: string;
  address: string;
  stakeAddress?: string;
}

export function enrichAddressBook(
  entries: AddressBookEntry[],
  explorerType: ExplorerType = 'CExplorer'
) {
  const explorer = createBlockchainExplorer({ 
    type: explorerType, 
    network: 'mainnet' 
  });

  return entries.map(entry => ({
    ...entry,
    addressLink: explorer.getAddressLink?.(entry.address) || '',
    stakeAddressLink: entry.stakeAddress 
      ? (explorer.getStakeAddressLink?.(entry.stakeAddress) || '')
      : undefined,
    explorerName: explorer.name
  }));
}

// ============================================================================
// EXAMPLE 11: Policy Analysis Links
// ============================================================================

export function getPolicyAnalysisLinks(
  policyId: string,
  explorerType: ExplorerType = 'CExplorer'
) {
  const explorer = createBlockchainExplorer({ 
    type: explorerType, 
    network: 'mainnet' 
  });

  return {
    policyId,
    policyLink: explorer.getPolicyLink?.(policyId) || 
                explorer.getTokenLink(policyId),
    explorerName: explorer.name,
    explorerBaseUrl: explorer.baseUrl
  };
}

// ============================================================================
// EXAMPLE 12: Custom Hook Pattern (for React)
// ============================================================================

export function useExplorerLinks(
  explorerType: ExplorerType = 'CExplorer',
  network: 'mainnet' | 'preprod' | 'preview' = 'mainnet'
) {
  const explorer = createBlockchainExplorer({ type: explorerType, network });

  return {
    getTokenLink: (policyId: string, assetName?: string) => 
      explorer.getTokenLink(policyId, assetName),
    
    getTransactionLink: (txHash: string) => 
      explorer.getTransactionLink(txHash),
    
    getAddressLink: (address: string) => 
      explorer.getAddressLink?.(address) || '',
    
    getStakeAddressLink: (stakeAddress: string) => 
      explorer.getStakeAddressLink?.(stakeAddress) || '',
    
    getPoolLink: (poolId: string) => 
      explorer.getPoolLink?.(poolId) || '',
    
    getPolicyLink: (policyId: string) => 
      explorer.getPolicyLink?.(policyId) || '',
    
    explorerName: explorer.name,
    baseUrl: explorer.baseUrl
  };
}

// Usage in a React component:
// const { getTransactionLink, getTokenLink, explorerName } = useExplorerLinks('CExplorer');

