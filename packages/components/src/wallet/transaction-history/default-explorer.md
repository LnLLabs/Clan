# Default Explorer Module

Provides automatic explorer creation with network detection for components that need blockchain explorer links.

## Purpose

This module extracts the explorer creation logic from components into a reusable utility. It prevents components from being cluttered with inline explorer implementations and provides a consistent way to handle explorer defaults across the application.

## Functions

### `createDefaultExplorer(network: NetworkConfig): BlockchainExplorer`

Creates a CExplorer instance with automatic network detection.

**Parameters:**
- `network` - NetworkConfig from the wallet containing network information

**Returns:**
- `BlockchainExplorer` - A fully functional CExplorer implementation

**Network Detection:**
- Automatically detects mainnet, preprod, or preview from the network name
- Falls back to mainnet if network cannot be determined
- Returns NoOpExplorer if creation fails

**Example URLs Generated:**
- Mainnet: `https://cexplorer.io/tx/{hash}`
- Preprod: `https://preprod.cexplorer.io/tx/{hash}`
- Preview: `https://preview.cexplorer.io/tx/{hash}`

**Usage:**
```typescript
import { createDefaultExplorer } from '@clan/framework-components';

function MyComponent({ wallet }) {
  const explorer = createDefaultExplorer(wallet.getNetwork());
  const txLink = explorer.getTransactionLink('abc123...');
  // Result: https://cexplorer.io/tx/abc123...
}
```

### `detectNetworkType(network: NetworkConfig): 'mainnet' | 'preprod' | 'preview'`

Detects and returns the network type from a NetworkConfig.

**Parameters:**
- `network` - NetworkConfig from the wallet

**Returns:**
- Network type: `'mainnet'` | `'preprod'` | `'preview'`

**Detection Logic:**
- Checks `network.name` (case-insensitive)
- Contains "preprod" → returns `'preprod'`
- Contains "preview" → returns `'preview'`
- Default → returns `'mainnet'`

**Usage:**
```typescript
import { detectNetworkType } from '@clan/framework-components';

function MyComponent({ wallet }) {
  const networkType = detectNetworkType(wallet.getNetwork());
  console.log(networkType); // 'mainnet', 'preprod', or 'preview'
}
```

## Why This Module Exists

### Before (Inline Logic in Component)
```typescript
const effectiveExplorer = useMemo(() => {
  if (explorer) return explorer;
  
  const network = wallet.getNetwork();
  const networkName = network.name?.toLowerCase() || 'mainnet';
  
  let networkType: 'mainnet' | 'preprod' | 'preview' = 'mainnet';
  if (networkName.includes('preprod')) {
    networkType = 'preprod';
  } else if (networkName.includes('preview')) {
    networkType = 'preview';
  }
  
  // ... 40+ more lines of inline implementation
}, [explorer, wallet]);
```

### After (Clean Component with Module)
```typescript
const effectiveExplorer = useMemo(() => {
  if (explorer) return explorer;
  return createDefaultExplorer(wallet.getNetwork());
}, [explorer, wallet]);
```

## Benefits

✅ **Cleaner Components** - Removes 50+ lines of boilerplate from components  
✅ **Reusable** - Can be used by any component that needs explorer links  
✅ **Testable** - Easy to unit test in isolation  
✅ **Maintainable** - Changes to explorer logic happen in one place  
✅ **Consistent** - All components use the same explorer defaults  
✅ **Type Safe** - Full TypeScript support with proper types

## Implementation Details

### Inline Implementation
The module uses an inline CExplorer implementation rather than importing from `@clan/framework-providers` to avoid circular dependencies. This is intentional and provides:

- No circular dependency issues
- Smaller bundle size (only includes what's needed)
- Faster initialization (no additional imports)

### Error Handling
If explorer creation fails for any reason, the function returns a `NoOpExplorer` which returns empty strings for all links. This prevents the application from crashing.

### Memoization
When used with React's `useMemo`, the explorer instance is only created once per network, preventing unnecessary recreations on re-renders.

## Components Using This Module

- `TransactionHistory` - Uses for automatic transaction link generation

## Future Enhancements

Possible future additions:
- Support for more network types (testnet, custom networks)
- Configurable default explorer type (CardanoScan, ADAStat, etc.)
- Caching of explorer instances
- Support for custom URL patterns

## Related Files

- `TransactionHistory.tsx` - Primary consumer of this module
- `packages/providers/src/reference-explorers.ts` - Full explorer implementations
- `packages/core/src/types.ts` - BlockchainExplorer interface definition

## Testing

```typescript
import { createDefaultExplorer, detectNetworkType } from './default-explorer';

// Test network detection
const mainnetConfig = { name: 'Mainnet', networkId: 1, protocolMagic: 764824073, explorerUrl: '' };
const preprodConfig = { name: 'Preprod', networkId: 0, protocolMagic: 1, explorerUrl: '' };

console.log(detectNetworkType(mainnetConfig)); // 'mainnet'
console.log(detectNetworkType(preprodConfig)); // 'preprod'

// Test explorer creation
const explorer = createDefaultExplorer(mainnetConfig);
console.log(explorer.name); // 'CExplorer'
console.log(explorer.baseUrl); // 'https://cexplorer.io'
console.log(explorer.getTransactionLink('abc123')); // 'https://cexplorer.io/tx/abc123'
```

