# Explorer Logic Refactoring

## Overview
Extracted the inline explorer creation logic from `TransactionHistory.tsx` into a dedicated `default-explorer.ts` module.

## Changes Made

### New Files Created
1. **`default-explorer.ts`** - Core module with explorer utilities
2. **`default-explorer.md`** - Comprehensive documentation
3. **`REFACTORING_NOTES.md`** - This file

### Modified Files
1. **`TransactionHistory.tsx`** - Now uses the clean module
2. **`index.ts`** - Exports the new utilities

## Code Comparison

### Before: Inline Logic (Cluttered Component)

```typescript
// TransactionHistory.tsx - Lines 44-93 (50 lines!)
const effectiveExplorer = useMemo(() => {
  if (explorer) return explorer;
  
  // Try to create a sensible default based on network
  const network = wallet.getNetwork();
  const networkName = network.name?.toLowerCase() || 'mainnet';
  
  // Determine network type
  let networkType: 'mainnet' | 'preprod' | 'preview' = 'mainnet';
  if (networkName.includes('preprod')) {
    networkType = 'preprod';
  } else if (networkName.includes('preview')) {
    networkType = 'preview';
  }
  
  // Lazy load CExplorer to avoid circular dependencies
  try {
    // Use a simple inline implementation to avoid import issues
    return {
      name: 'CExplorer',
      baseUrl: networkType === 'mainnet' 
        ? 'https://cexplorer.io'
        : networkType === 'preprod'
        ? 'https://preprod.cexplorer.io'
        : 'https://preview.cexplorer.io',
      getTransactionLink: (txHash: string) => {
        const base = networkType === 'mainnet' 
          ? 'https://cexplorer.io'
          : networkType === 'preprod'
          ? 'https://preprod.cexplorer.io'
          : 'https://preview.cexplorer.io';
        return `${base}/tx/${txHash}`;
      },
      getTokenLink: (policyId: string, assetName?: string) => {
        const base = networkType === 'mainnet' 
          ? 'https://cexplorer.io'
          : networkType === 'preprod'
          ? 'https://preprod.cexplorer.io'
          : 'https://preview.cexplorer.io';
        if (assetName && assetName !== '') {
          return `${base}/asset/${policyId}${assetName}`;
        }
        return `${base}/policy/${policyId}`;
      }
    } as BlockchainExplorer;
  } catch (e) {
    console.warn('Failed to create default explorer, using NoOpExplorer');
    return new NoOpExplorer();
  }
}, [explorer, wallet]);
```

**Issues:**
- 50 lines of inline logic
- Difficult to read
- Hard to test
- Not reusable
- Clutters the component

### After: Clean Module Import (3 lines!)

```typescript
// TransactionHistory.tsx - Lines 44-48 (3 lines!)
const effectiveExplorer = useMemo(() => {
  if (explorer) return explorer;
  return createDefaultExplorer(wallet.getNetwork());
}, [explorer, wallet]);
```

**Benefits:**
- 3 lines instead of 50
- Clear and readable
- Easy to test
- Reusable by other components
- Clean component code

## Module Structure

### `default-explorer.ts`

```
default-explorer.ts (93 lines)
├── createDefaultExplorer()     - Main utility function
│   ├── Network detection
│   ├── URL configuration
│   ├── Full BlockchainExplorer implementation
│   └── Error handling
└── detectNetworkType()         - Helper for network detection
```

**Exports:**
- `createDefaultExplorer(network: NetworkConfig): BlockchainExplorer`
- `detectNetworkType(network: NetworkConfig): 'mainnet' | 'preprod' | 'preview'`

## Impact Analysis

### Lines of Code
- **Before:** 367 lines in TransactionHistory.tsx
- **After:** 
  - 320 lines in TransactionHistory.tsx (-47 lines)
  - 93 lines in default-explorer.ts (new)
  - **Net:** +46 lines total but much better organized

### Component Complexity
- **Before:** High (explorer logic mixed with UI logic)
- **After:** Low (clean separation of concerns)

### Testability
- **Before:** Hard (need to test component to test explorer)
- **After:** Easy (can test explorer module independently)

### Reusability
- **Before:** None (logic locked in component)
- **After:** High (any component can use it)

## Usage in Other Components

Other components can now easily use the default explorer:

```typescript
import { createDefaultExplorer } from '@clan/framework-components';

function MyComponent({ wallet }) {
  const explorer = createDefaultExplorer(wallet.getNetwork());
  
  // Use explorer anywhere
  const txLink = explorer.getTransactionLink(txHash);
  const tokenLink = explorer.getTokenLink(policyId, assetName);
  const addressLink = explorer.getAddressLink(address);
}
```

## Testing Strategy

### Unit Tests for `default-explorer.ts`
```typescript
describe('createDefaultExplorer', () => {
  it('creates mainnet explorer for mainnet network', () => {
    const network = { name: 'Mainnet', networkId: 1, protocolMagic: 764824073, explorerUrl: '' };
    const explorer = createDefaultExplorer(network);
    expect(explorer.baseUrl).toBe('https://cexplorer.io');
  });
  
  it('creates preprod explorer for preprod network', () => {
    const network = { name: 'Preprod', networkId: 0, protocolMagic: 1, explorerUrl: '' };
    const explorer = createDefaultExplorer(network);
    expect(explorer.baseUrl).toBe('https://preprod.cexplorer.io');
  });
});

describe('detectNetworkType', () => {
  it('detects mainnet', () => {
    expect(detectNetworkType({ name: 'Mainnet', ... })).toBe('mainnet');
  });
  
  it('detects preprod', () => {
    expect(detectNetworkType({ name: 'Preprod', ... })).toBe('preprod');
  });
});
```

### Integration Tests for `TransactionHistory`
```typescript
describe('TransactionHistory', () => {
  it('uses default explorer when none provided', () => {
    render(<TransactionHistory wallet={mockWallet} />);
    // Verify transaction links use cexplorer.io
  });
  
  it('uses custom explorer when provided', () => {
    const customExplorer = new CardanoScanExplorer('mainnet');
    render(<TransactionHistory wallet={mockWallet} explorer={customExplorer} />);
    // Verify transaction links use cardanoscan.io
  });
});
```

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Lines in Component** | 367 | 320 |
| **Complexity** | High | Low |
| **Testability** | Difficult | Easy |
| **Reusability** | None | High |
| **Maintainability** | Hard | Easy |
| **Separation of Concerns** | Poor | Excellent |
| **Code Duplication Risk** | High | Low |

## Future Enhancements

The module structure now makes it easy to add:

1. **Configurable Defaults**
   ```typescript
   createDefaultExplorer(network, { preferredExplorer: 'CardanoScan' })
   ```

2. **Explorer Caching**
   ```typescript
   const explorerCache = new Map();
   ```

3. **Custom Network Support**
   ```typescript
   detectNetworkType(network, customNetworkPatterns)
   ```

4. **Explorer Selection Logic**
   ```typescript
   selectBestExplorer(network, availableExplorers)
   ```

## Migration Guide

No changes needed for existing code! The component API remains the same:

```typescript
// Still works exactly the same
<TransactionHistory wallet={wallet} />

// Optional custom explorer still works
<TransactionHistory wallet={wallet} explorer={customExplorer} />
```

## Conclusion

This refactoring significantly improves code quality by:
- Extracting 50 lines of complex logic into a dedicated module
- Making the component easier to read and understand
- Enabling reuse across multiple components
- Improving testability
- Following single responsibility principle
- Maintaining 100% backward compatibility

**Result:** Cleaner, more maintainable, and more testable code! ✅




