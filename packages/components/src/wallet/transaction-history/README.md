# TransactionHistory Component

A React component for displaying transaction history with blockchain explorer integration.

## Features

- ✅ Automatic transaction fetching from wallet
- ✅ Support for sent, received, and withdrawal transactions
- ✅ Token metadata display with MetadataProvider
- ✅ **Blockchain explorer links** (CExplorer, CardanoScan, ADAStat)
- ✅ Pagination with "See More" functionality
- ✅ Loading and error states
- ✅ Responsive design

## New: Explorer Integration

The component now supports blockchain explorer integration through the `explorer` prop. **If no explorer is provided, it automatically defaults to CExplorer with automatic network detection** (mainnet, preprod, or preview based on the wallet's network).

## Usage

### Basic Usage (Auto-Defaults to CExplorer)

```tsx
import { TransactionHistory } from '@clan/framework-components';

function MyWallet({ wallet }) {
  // No explorer prop needed! Automatically uses CExplorer with network detection
  return (
    <TransactionHistory 
      wallet={wallet}
    />
  );
}
```

### Explicit CExplorer (Optional)

```tsx
import { TransactionHistory } from '@clan/framework-components';
import { CExplorerExplorer } from '@clan/framework-providers';

function MyWallet({ wallet }) {
  const explorer = new CExplorerExplorer('mainnet');
  
  return (
    <TransactionHistory 
      wallet={wallet}
      explorer={explorer}
    />
  );
}
```

### With CardanoScan Explorer

```tsx
import { TransactionHistory } from '@clan/framework-components';
import { CardanoScanExplorer } from '@clan/framework-providers';

function MyWallet({ wallet }) {
  const explorer = new CardanoScanExplorer('mainnet');
  
  return (
    <TransactionHistory 
      wallet={wallet}
      explorer={explorer}
    />
  );
}
```

### With Metadata Provider and Explorer

```tsx
import { TransactionHistory } from '@clan/framework-components';
import { 
  CExplorerExplorer, 
  BlockfrostMetadataProvider 
} from '@clan/framework-providers';

function MyWallet({ wallet }) {
  const explorer = new CExplorerExplorer('mainnet');
  const metadataProvider = new BlockfrostMetadataProvider(
    'https://cardano-mainnet.blockfrost.io/api/v0',
    'your-project-id'
  );
  
  return (
    <TransactionHistory 
      wallet={wallet}
      explorer={explorer}
      metadataProvider={metadataProvider}
      maxVisibleTransactions={10}
      showSeeMore={true}
    />
  );
}
```

### Dynamic Explorer Selection

```tsx
import { useState } from 'react';
import { TransactionHistory } from '@clan/framework-components';
import { createBlockchainExplorer } from '@clan/framework-providers';
import type { ExplorerType } from '@clan/framework-core';

function MyWallet({ wallet }) {
  const [explorerType, setExplorerType] = useState<ExplorerType>('CExplorer');
  
  const explorer = createBlockchainExplorer({
    type: explorerType,
    network: 'mainnet'
  });
  
  return (
    <>
      <select 
        value={explorerType}
        onChange={(e) => setExplorerType(e.target.value as ExplorerType)}
      >
        <option value="CExplorer">CExplorer</option>
        <option value="CardanoScan">CardanoScan</option>
        <option value="ADAStat">ADAStat</option>
      </select>
      
      <TransactionHistory 
        wallet={wallet}
        explorer={explorer}
      />
    </>
  );
}
```

### For Testnet/Preprod

```tsx
import { TransactionHistory } from '@clan/framework-components';
import { CExplorerExplorer } from '@clan/framework-providers';

function MyTestWallet({ wallet }) {
  const explorer = new CExplorerExplorer('preprod');
  
  return (
    <TransactionHistory 
      wallet={wallet}
      explorer={explorer}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `wallet` | `WalletInterface` | Yes | - | Wallet instance to fetch transactions from |
| `explorer` | `BlockchainExplorer` | No | - | Explorer instance for generating transaction links |
| `metadataProvider` | `MetadataProvider` | No | - | Provider for fetching token metadata |
| `onSeeMore` | `() => void` | No | - | Callback when "See More" is clicked |
| `onTransactionLinkClick` | `(tx) => void` | No | - | Callback when transaction link is clicked |
| `className` | `string` | No | `''` | Additional CSS classes |
| `maxVisibleTransactions` | `number` | No | - | Max transactions to display initially |
| `showSeeMore` | `boolean` | No | `true` | Whether to show "See More" button |
| `limit` | `number` | No | `50` | Max transactions to fetch from API |

## Explorer Behavior

### With Explorer Prop
When an `explorer` prop is provided:
- Transaction links are generated using `explorer.getTransactionLink(txHash)`
- Links open in a new tab with proper security attributes
- Supports all explorer types (CExplorer, CardanoScan, ADAStat, Custom)

### Without Explorer Prop (Smart Default) ⭐ NEW
When no `explorer` is provided:
- **Automatically creates a CExplorer instance** with network auto-detection
- Detects network type from wallet (mainnet, preprod, or preview)
- Uses proper CExplorer URLs:
  - Mainnet: `https://cexplorer.io`
  - Preprod: `https://preprod.cexplorer.io`
  - Preview: `https://preview.cexplorer.io`
- **No more localhost/malformed URLs!**
- Fully backward compatible

## Transaction Link Display

The transaction link column now displays:
- **Clickable hash**: First 8 and last 8 characters of transaction hash
- **Opens in new tab**: Secure external link (`target="_blank" rel="noopener noreferrer"`)
- **Action button**: Plus icon for additional actions via `onTransactionLinkClick`

Example display: `a1b2c3d4...89012345` → Opens explorer page for that transaction

## Supported Explorers

### CExplorer (cexplorer.io)
```tsx
import { CExplorerExplorer } from '@clan/framework-providers';

const explorer = new CExplorerExplorer('mainnet'); // or 'preprod', 'preview'
```

### CardanoScan (cardanoscan.io)
```tsx
import { CardanoScanExplorer } from '@clan/framework-providers';

const explorer = new CardanoScanExplorer('mainnet'); // or 'preprod', 'preview'
```

### ADAStat (adastat.net)
```tsx
import { ADAStatExplorer } from '@clan/framework-providers';

const explorer = new ADAStatExplorer('mainnet'); // or 'preprod', 'preview'
```

### Factory Pattern
```tsx
import { createBlockchainExplorer } from '@clan/framework-providers';

const explorer = createBlockchainExplorer({
  type: 'CExplorer', // or 'CardanoScan', 'ADAStat'
  network: 'mainnet' // or 'preprod', 'preview'
});
```

## Migration Guide

If you're upgrading from a previous version:

### Before (May have had localhost/malformed links)
```tsx
<TransactionHistory 
  wallet={wallet}
  metadataProvider={metadataProvider}
/>
```

### After (No Changes Needed! ✅)
```tsx
<TransactionHistory 
  wallet={wallet}
  metadataProvider={metadataProvider}
/>
// Now automatically uses CExplorer with network detection
// Links work properly without any code changes!
```

### Optional: Explicit Explorer
```tsx
import { CardanoScanExplorer } from '@clan/framework-providers';

const explorer = new CardanoScanExplorer('mainnet');

<TransactionHistory 
  wallet={wallet}
  metadataProvider={metadataProvider}
  explorer={explorer}  // Optional prop to use a different explorer
/>
```

**Note**: The component is fully backward compatible. Existing code works without changes and now generates proper explorer links automatically!

## Advanced Usage

### Custom Explorer Implementation

You can create custom explorer implementations:

```tsx
import { BlockchainExplorer } from '@clan/framework-core';

class MyCustomExplorer implements BlockchainExplorer {
  readonly name = 'My Explorer';
  readonly baseUrl = 'https://my-explorer.com';
  
  getTransactionLink(txHash: string): string {
    return `${this.baseUrl}/transactions/${txHash}`;
  }
  
  getTokenLink(policyId: string, assetName?: string): string {
    return `${this.baseUrl}/tokens/${policyId}${assetName || ''}`;
  }
}

// Use it
const explorer = new MyCustomExplorer();
<TransactionHistory wallet={wallet} explorer={explorer} />
```

### With Custom Click Handler

```tsx
function MyWallet({ wallet }) {
  const explorer = new CExplorerExplorer('mainnet');
  
  const handleTransactionClick = (transaction) => {
    console.log('Transaction clicked:', transaction);
    // Custom analytics, modal, etc.
  };
  
  return (
    <TransactionHistory 
      wallet={wallet}
      explorer={explorer}
      onTransactionLinkClick={handleTransactionClick}
    />
  );
}
```

## Styling

The component maintains all existing CSS classes. Transaction links now use:
- `.link-text` - Anchor tag for the transaction hash
- `.link-action-button` - Additional action button
- `.transaction-link-content` - Container for both elements

## Requirements

- `@clan/framework-core` - Core types and interfaces
- `@clan/framework-providers` - Explorer implementations
- `@clan/framework-components` - This component

## Related Documentation

- [Explorer Guide](../../../providers/EXPLORER_GUIDE.md) - Complete explorer documentation
- [Explorer Examples](../../../providers/src/explorer-usage-examples.ts) - More usage examples
- [Component README](../../README.md) - Main components documentation

## Examples

See [TransactionHistory.example.tsx](./TransactionHistory.example.tsx) for complete working examples including:
- Basic usage with CExplorer
- CardanoScan integration
- Preprod network usage
- Custom explorer selection
