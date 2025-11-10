# Metadata Provider Guide

## Overview

The Clan Framework uses a **Metadata Provider** system for fetching non-critical data like token metadata, transaction history enrichment, and token search functionality. This allows consuming applications to plug in their own metadata sources.

## Architecture

```
┌─────────────────────────────────────┐
│      Consuming Application          │
│  (implements MetadataProvider)      │
└─────────────────────────────────────┘
                    │
                    │ injects via context
                    ↓
┌─────────────────────────────────────┐
│      MetadataProviderWrapper        │
│         (React Context)             │
└─────────────────────────────────────┘
                    │
                    │ provides to
                    ↓
┌─────────────────────────────────────┐
│    Clan Components & Hooks          │
│  (useTokenInfo, getTokenInfo)       │
└─────────────────────────────────────┘
```

## Core Interface

```typescript
interface MetadataProvider {
  // Required: Get metadata for a specific token
  getTokenMetadata(
    policyId: string, 
    assetName: string
  ): Promise<TokenMetadata | undefined>;

  // Optional: Search for tokens
  searchTokens?(
    query: string, 
    limit?: number
  ): Promise<TokenSearchResult[]>;

  // Optional: Get transaction metadata
  getTransactionMetadata?(
    txHash: string
  ): Promise<Record<string, any> | undefined>;

  // Optional: Batch fetch tokens
  batchGetTokenMetadata?(
    tokens: Array<{ policyId: string; assetName: string }>
  ): Promise<(TokenMetadata | undefined)[]>;
}

interface TokenMetadata {
  policyId: string;
  assetName: string;
  name?: string;
  ticker?: string;
  description?: string;
  decimals?: number;
  logo?: string;
  url?: string;
  [key: string]: any; // Additional custom fields
}
```

## Usage in Consuming App

### 1. Implement MetadataProvider

Create your custom metadata provider:

```typescript
// src/providers/MyMetadataProvider.ts
import { MetadataProvider, TokenMetadata } from '@clan/framework-core';

export class MyCustomMetadataProvider implements MetadataProvider {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getTokenMetadata(
    policyId: string, 
    assetName: string
  ): Promise<TokenMetadata | undefined> {
    try {
      const response = await fetch(
        `${this.apiUrl}/tokens/${policyId}${assetName}`
      );
      
      if (!response.ok) return undefined;
      
      const data = await response.json();
      
      return {
        policyId,
        assetName,
        name: data.name,
        ticker: data.ticker,
        description: data.description,
        decimals: data.decimals,
        logo: data.logo,
        url: data.website,
        // Add any custom fields your app needs
        customData: data.extra
      };
    } catch (error) {
      console.warn('Failed to fetch metadata:', error);
      return undefined;
    }
  }

  async searchTokens(query: string, limit = 10): Promise<TokenSearchResult[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      
      if (!response.ok) return [];
      
      return await response.json();
    } catch (error) {
      console.warn('Failed to search tokens:', error);
      return [];
    }
  }
}
```

### 2. Inject Provider in Your App

Wrap your app with the `MetadataProviderWrapper`:

```typescript
// src/App.tsx
import React from 'react';
import { 
  SettingsProvider, 
  MetadataProviderWrapper 
} from '@clan/framework-providers';
import { MyCustomMetadataProvider } from './providers/MyMetadataProvider';

const metadataProvider = new MyCustomMetadataProvider(
  'https://api.myapp.com/metadata'
);

function App() {
  return (
    <SettingsProvider>
      <MetadataProviderWrapper provider={metadataProvider}>
        <YourApp />
      </MetadataProviderWrapper>
    </SettingsProvider>
  );
}
```

### 3. Use in Components

Components automatically use the injected provider:

```typescript
// src/components/TokenDisplay.tsx
import React from 'react';
import { useTokenInfo } from '@clan/framework-providers';

function TokenDisplay({ tokenId }: { tokenId: string }) {
  const { tokenInfo, loading, error } = useTokenInfo(tokenId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tokenInfo) return <div>No metadata found</div>;

  return (
    <div>
      <img src={tokenInfo.image} alt={tokenInfo.name} />
      <h3>{tokenInfo.name}</h3>
      <p>{tokenInfo.ticker}</p>
    </div>
  );
}
```

## Reference Implementations

Clan provides reference implementations for common providers:

### Blockfrost

```typescript
import { BlockfrostMetadataProvider } from '@clan/framework-providers';

const provider = new BlockfrostMetadataProvider(
  'https://cardano-mainnet.blockfrost.io/api/v0',
  'your-project-id'
);
```

### Maestro

```typescript
import { MaestroMetadataProvider } from '@clan/framework-providers';

const provider = new MaestroMetadataProvider(
  'your-api-key',
  'mainnet'
);
```

### Factory Helper

```typescript
import { createMetadataProvider } from '@clan/framework-providers';

const provider = createMetadataProvider({
  type: 'Blockfrost',
  blockfrostUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
  blockfrostProjectId: 'your-project-id'
});
```

### No-Op (No Metadata)

```typescript
import { NoOpMetadataProvider } from '@clan/framework-core';

const provider = new NoOpMetadataProvider();
// Returns undefined for all queries
```

## Advanced Features

### Caching

The framework automatically caches token metadata for 24 hours:

```typescript
// Cached automatically - no code needed
const info = await getTokenInfo(tokenId, metadataProvider);
```

### Batch Fetching

Implement `batchGetTokenMetadata` for efficient bulk loading:

```typescript
async batchGetTokenMetadata(
  tokens: Array<{ policyId: string; assetName: string }>
): Promise<(TokenMetadata | undefined)[]> {
  // Fetch all tokens in parallel or in a single API call
  return Promise.all(
    tokens.map(({ policyId, assetName }) => 
      this.getTokenMetadata(policyId, assetName)
    )
  );
}
```

### Transaction Metadata

Add transaction enrichment:

```typescript
async getTransactionMetadata(
  txHash: string
): Promise<Record<string, any> | undefined> {
  const response = await fetch(`${this.apiUrl}/tx/${txHash}/metadata`);
  return response.json();
}
```

## Integration with Settings

You can combine with the settings system:

```typescript
import { useSettings, MetadataProviderWrapper } from '@clan/framework-providers';

function AppWithDynamicProvider() {
  const { settings } = useSettings();
  
  // Create provider based on settings
  const provider = React.useMemo(() => {
    if (settings.metadataProvider.type === 'Blockfrost') {
      return new BlockfrostMetadataProvider(
        settings.metadataProvider.config.url,
        settings.metadataProvider.config.projectId
      );
    }
    // ... other providers
    return new NoOpMetadataProvider();
  }, [settings.metadataProvider]);

  return (
    <MetadataProviderWrapper provider={provider}>
      <YourApp />
    </MetadataProviderWrapper>
  );
}
```

## Benefits

1. **Decoupling**: Framework doesn't depend on specific APIs
2. **Flexibility**: Apps can use any metadata source
3. **Testability**: Easy to mock for testing
4. **Performance**: Apps control caching and batching strategies
5. **Customization**: Add custom fields specific to your app

## Migration from Legacy

Old code that directly accessed settings:

```typescript
// ❌ Old way - hardcoded
const settings = JSON.parse(localStorage.getItem('settings'));
const response = await fetch(`${settings.api.url}/assets/${tokenId}`);
```

New code with dependency injection:

```typescript
// ✅ New way - injected
const { tokenInfo } = useTokenInfo(tokenId);
// Provider is injected via context
```

## Best Practices

1. **Handle failures gracefully**: Return `undefined` instead of throwing
2. **Implement caching**: Reduce API calls and improve performance
3. **Log warnings**: Help with debugging but don't break the app
4. **Use batch methods**: More efficient for loading multiple tokens
5. **Add custom fields**: Extend TokenMetadata with app-specific data
6. **Version your API**: Include version in metadata for compatibility

## Example: Complete Provider

```typescript
export class ProductionMetadataProvider implements MetadataProvider {
  private cache = new Map<string, TokenMetadata>();
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getTokenMetadata(
    policyId: string,
    assetName: string
  ): Promise<TokenMetadata | undefined> {
    const key = `${policyId}${assetName}`;
    
    // Check cache
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const response = await fetch(`${this.apiUrl}/token/${key}`);
      if (!response.ok) return undefined;
      
      const metadata = await response.json();
      
      // Cache result
      this.cache.set(key, metadata);
      
      return metadata;
    } catch (error) {
      console.warn(`Failed to fetch ${key}:`, error);
      return undefined;
    }
  }

  async searchTokens(query: string, limit = 10) {
    try {
      const response = await fetch(
        `${this.apiUrl}/search?q=${query}&limit=${limit}`
      );
      return response.ok ? await response.json() : [];
    } catch {
      return [];
    }
  }

  async batchGetTokenMetadata(tokens) {
    // Efficient batch endpoint
    try {
      const response = await fetch(`${this.apiUrl}/tokens/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens })
      });
      return response.ok ? await response.json() : [];
    } catch {
      // Fallback to individual fetches
      return Promise.all(
        tokens.map(t => this.getTokenMetadata(t.policyId, t.assetName))
      );
    }
  }
}
```

---

For questions or issues, refer to the [main documentation](./PROVIDER_GUIDE.md) or open an issue.

