# Blockchain Explorer Guide

## Overview

The Clan Framework includes a **Blockchain Explorer** system for generating links to blockchain explorers like CExplorer, CardanoScan, and ADAStat. This allows your application to provide users with direct links to view tokens, transactions, addresses, and other blockchain entities on their preferred explorer.

## Architecture

```
┌─────────────────────────────────────┐
│      Your Application               │
│  (creates BlockchainExplorer)       │
└─────────────────────────────────────┘
                    │
                    │ uses
                    ↓
┌─────────────────────────────────────┐
│      BlockchainExplorer             │
│  (CExplorer, CardanoScan, etc.)     │
└─────────────────────────────────────┘
                    │
                    │ generates
                    ↓
           Explorer URLs
```

## Core Interface

```typescript
interface BlockchainExplorer {
  readonly name: string;
  readonly baseUrl: string;
  
  // Required methods
  getTokenLink(policyId: string, assetName?: string): string;
  getTransactionLink(txHash: string): string;
  
  // Optional methods
  getAddressLink?(address: string): string;
  getStakeAddressLink?(stakeAddress: string): string;
  getPoolLink?(poolId: string): string;
  getBlockLink?(blockHash: string | number): string;
  getPolicyLink?(policyId: string): string;
}
```

## Quick Start

### 1. Import the Explorer

```typescript
import { 
  CExplorerExplorer, 
  createBlockchainExplorer 
} from '@clan/framework-providers';
```

### 2. Create an Explorer Instance

**Option A: Direct instantiation**
```typescript
// Create a CExplorer instance for mainnet
const explorer = new CExplorerExplorer('mainnet');

// For testnet
const testnetExplorer = new CExplorerExplorer('preprod');
```

**Option B: Using the factory function**
```typescript
const explorer = createBlockchainExplorer({
  type: 'CExplorer',
  network: 'mainnet'
});
```

### 3. Generate Links

```typescript
// Token link (with asset name)
const tokenUrl = explorer.getTokenLink(
  '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
  '4d494e' // MIN token
);
// Result: https://cexplorer.io/asset/29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e

// Transaction link
const txUrl = explorer.getTransactionLink(
  'a1b2c3d4e5f6...'
);
// Result: https://cexplorer.io/tx/a1b2c3d4e5f6...

// Address link
const addressUrl = explorer.getAddressLink(
  'addr1qxy...'
);
// Result: https://cexplorer.io/address/addr1qxy...

// Policy link (without asset name)
const policyUrl = explorer.getTokenLink(
  '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6'
);
// Result: https://cexplorer.io/policy/29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6
```

## Available Explorers

### CExplorer (cexplorer.io)
Most popular Cardano blockchain explorer with comprehensive analytics.

```typescript
import { CExplorerExplorer } from '@clan/framework-providers';

const explorer = new CExplorerExplorer('mainnet'); // or 'preprod', 'preview'
```

**Networks supported:**
- `mainnet` → https://cexplorer.io
- `preprod` → https://preprod.cexplorer.io
- `preview` → https://preview.cexplorer.io

### CardanoScan (cardanoscan.io)
Feature-rich Cardano blockchain explorer.

```typescript
import { CardanoScanExplorer } from '@clan/framework-providers';

const explorer = new CardanoScanExplorer('mainnet');
```

**Networks supported:**
- `mainnet` → https://cardanoscan.io
- `preprod` → https://preprod.cardanoscan.io
- `preview` → https://preview.cardanoscan.io

### ADAStat (adastat.net)
Cardano blockchain explorer with analytics focus.

```typescript
import { ADAStatExplorer } from '@clan/framework-providers';

const explorer = new ADAStatExplorer('mainnet');
```

**Networks supported:**
- `mainnet` → https://adastat.net
- `preprod` → https://preprod.adastat.net
- `preview` → https://preview.adastat.net

## Usage in React Components

### Example: Transaction History with Explorer Links

```typescript
import React from 'react';
import { CExplorerExplorer } from '@clan/framework-providers';

function TransactionHistory() {
  const explorer = new CExplorerExplorer('mainnet');
  const transactions = useTransactions(); // Your transaction hook
  
  return (
    <div>
      {transactions.map(tx => (
        <div key={tx.hash}>
          <span>{tx.hash.slice(0, 10)}...</span>
          <a 
            href={explorer.getTransactionLink(tx.hash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on CExplorer
          </a>
        </div>
      ))}
    </div>
  );
}
```

### Example: Token Display with Explorer Link

```typescript
import React from 'react';
import { createBlockchainExplorer } from '@clan/framework-providers';

interface TokenDisplayProps {
  policyId: string;
  assetName: string;
  name: string;
  explorerType?: 'CExplorer' | 'CardanoScan' | 'ADAStat';
}

function TokenDisplay({ 
  policyId, 
  assetName, 
  name,
  explorerType = 'CExplorer' 
}: TokenDisplayProps) {
  const explorer = createBlockchainExplorer({
    type: explorerType,
    network: 'mainnet'
  });
  
  const tokenLink = explorer.getTokenLink(policyId, assetName);
  
  return (
    <div>
      <h3>{name}</h3>
      <a href={tokenLink} target="_blank" rel="noopener noreferrer">
        View on {explorer.name}
      </a>
    </div>
  );
}
```

### Example: Explorer Selector

```typescript
import React, { useState } from 'react';
import { 
  createBlockchainExplorer, 
  getAvailableExplorers,
  type ExplorerType 
} from '@clan/framework-providers';

function ExplorerSelector() {
  const [selectedExplorer, setSelectedExplorer] = useState<ExplorerType>('CExplorer');
  const explorer = createBlockchainExplorer({
    type: selectedExplorer,
    network: 'mainnet'
  });
  
  const availableExplorers = getAvailableExplorers();
  
  return (
    <div>
      <select 
        value={selectedExplorer}
        onChange={(e) => setSelectedExplorer(e.target.value as ExplorerType)}
      >
        {availableExplorers.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      
      <p>Explorer: {explorer.name}</p>
      <p>Base URL: {explorer.baseUrl}</p>
    </div>
  );
}
```

## Creating Custom Explorers

You can create custom explorer implementations for other blockchain explorers or internal tools:

```typescript
import { BlockchainExplorer } from '@clan/framework-core';

export class CustomExplorer implements BlockchainExplorer {
  readonly name = 'My Custom Explorer';
  readonly baseUrl = 'https://my-explorer.com';
  
  constructor(private network: string) {}
  
  getTokenLink(policyId: string, assetName?: string): string {
    if (assetName) {
      return `${this.baseUrl}/token/${policyId}.${assetName}`;
    }
    return `${this.baseUrl}/policy/${policyId}`;
  }
  
  getTransactionLink(txHash: string): string {
    return `${this.baseUrl}/tx/${txHash}`;
  }
  
  getAddressLink(address: string): string {
    return `${this.baseUrl}/addr/${address}`;
  }
  
  // Implement other optional methods as needed...
}

// Usage
const myExplorer = new CustomExplorer('mainnet');
```

## Best Practices

1. **User Preferences**: Allow users to select their preferred explorer
2. **Network Awareness**: Always use the correct network for the explorer
3. **External Links**: Use `target="_blank"` and `rel="noopener noreferrer"` for security
4. **Fallback**: Use `NoOpExplorer` when no explorer is configured
5. **Caching**: Cache explorer instances rather than creating new ones repeatedly

## API Reference

### CExplorerExplorer

```typescript
class CExplorerExplorer implements BlockchainExplorer {
  constructor(network: 'mainnet' | 'preprod' | 'preview' = 'mainnet')
  
  readonly name: string
  readonly baseUrl: string
  
  getTokenLink(policyId: string, assetName?: string): string
  getTransactionLink(txHash: string): string
  getAddressLink(address: string): string
  getStakeAddressLink(stakeAddress: string): string
  getPoolLink(poolId: string): string
  getBlockLink(blockHash: string | number): string
  getPolicyLink(policyId: string): string
}
```

### createBlockchainExplorer()

```typescript
function createBlockchainExplorer(config: {
  type: ExplorerType;
  network?: 'mainnet' | 'preprod' | 'preview';
}): BlockchainExplorer
```

### getAvailableExplorers()

```typescript
function getAvailableExplorers(): ExplorerType[]
// Returns: ['CExplorer', 'CardanoScan', 'ADAStat']
```

## Network-Specific URLs

### CExplorer
- Mainnet: `https://cexplorer.io`
- Preprod: `https://preprod.cexplorer.io`
- Preview: `https://preview.cexplorer.io`

### CardanoScan
- Mainnet: `https://cardanoscan.io`
- Preprod: `https://preprod.cardanoscan.io`
- Preview: `https://preview.cardanoscan.io`

### ADAStat
- Mainnet: `https://adastat.net`
- Preprod: `https://preprod.adastat.net`
- Preview: `https://preview.adastat.net`

## Support

For issues or questions about the explorer system, please refer to the main [Clan Framework documentation](../README.md).




