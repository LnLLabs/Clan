# Implementing a Custom Metadata Provider

## Task: Create GenwealthMetadataProvider Stub

You need to implement a custom metadata provider for the Genwealth wallet application that integrates with your BroClan metadata API.

---

## What You Need to Implement

Create a file: `src/providers/GenwealthMetadataProvider.ts`

### Required Interface

```typescript
import { MetadataProvider, TokenMetadata, TokenSearchResult } from '@clan/framework-core';

export class GenwealthMetadataProvider implements MetadataProvider {
  // Your implementation here
}
```

### Interface Methods

```typescript
interface MetadataProvider {
  // REQUIRED: Fetch metadata for a single token
  getTokenMetadata(
    policyId: string,    // 56-character hex policy ID
    assetName: string    // Hex-encoded asset name
  ): Promise<TokenMetadata | undefined>;

  // OPTIONAL: Search for tokens by name/ticker
  searchTokens?(
    query: string,
    limit?: number
  ): Promise<TokenSearchResult[]>;

  // OPTIONAL: Get enriched transaction data
  getTransactionMetadata?(
    txHash: string
  ): Promise<Record<string, any> | undefined>;

  // OPTIONAL: Batch fetch for efficiency
  batchGetTokenMetadata?(
    tokens: Array<{ policyId: string; assetName: string }>
  ): Promise<(TokenMetadata | undefined)[]>;
}
```

### TokenMetadata Type

```typescript
interface TokenMetadata {
  policyId: string;          // Policy ID of the token
  assetName: string;         // Asset name (hex encoded)
  name?: string;             // Display name
  ticker?: string;           // Ticker symbol (e.g., "HOSKY")
  description?: string;      // Token description
  decimals?: number;         // Number of decimal places
  logo?: string;             // URL to logo image (handle IPFS urls)
  url?: string;              // Project website URL
  [key: string]: any;        // Add any custom fields you need
}
```

---

## Implementation Template

```typescript
import { MetadataProvider, TokenMetadata, TokenSearchResult } from '@clan/framework-core';

export class GenwealthMetadataProvider implements MetadataProvider {
  private apiUrl: string;
  private apiKey?: string;
  private cache: Map<string, TokenMetadata>;

  constructor(apiUrl: string, apiKey?: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.cache = new Map();
  }

  async getTokenMetadata(
    policyId: string,
    assetName: string
  ): Promise<TokenMetadata | undefined> {
    const tokenId = policyId + assetName;
    
    // Check cache first
    if (this.cache.has(tokenId)) {
      return this.cache.get(tokenId);
    }

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(
        `${this.apiUrl}/metadata/token/${tokenId}`,
        {
          headers: this.apiKey ? {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          } : {}
        }
      );

      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Map your API response to TokenMetadata
      const metadata: TokenMetadata = {
        policyId,
        assetName,
        name: data.name,              // Adjust field names to match your API
        ticker: data.ticker,
        description: data.description,
        decimals: data.decimals,
        logo: this.processImageUrl(data.logo),
        url: data.website,
        // Add custom fields if needed
        verified: data.verified,
        projectId: data.project_id
      };

      // Cache the result
      this.cache.set(tokenId, metadata);

      return metadata;
    } catch (error) {
      console.warn(`Failed to fetch metadata for ${tokenId}:`, error);
      return undefined;
    }
  }

  async searchTokens(query: string, limit = 10): Promise<TokenSearchResult[]> {
    try {
      // TODO: Replace with your search endpoint
      const response = await fetch(
        `${this.apiUrl}/metadata/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: this.apiKey ? {
            'Authorization': `Bearer ${this.apiKey}`
          } : {}
        }
      );

      if (!response.ok) return [];

      const data = await response.json();

      // Map to TokenSearchResult
      return data.results.map((item: any) => ({
        policyId: item.policyId,
        assetName: item.assetName,
        name: item.name,
        ticker: item.ticker,
        logo: this.processImageUrl(item.logo)
      }));
    } catch (error) {
      console.warn('Search failed:', error);
      return [];
    }
  }

  async batchGetTokenMetadata(
    tokens: Array<{ policyId: string; assetName: string }>
  ): Promise<(TokenMetadata | undefined)[]> {
    // Option 1: If you have a batch endpoint
    try {
      const response = await fetch(
        `${this.apiUrl}/metadata/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
          },
          body: JSON.stringify({ tokens })
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.results;
      }
    } catch (error) {
      console.warn('Batch fetch failed, falling back to individual:', error);
    }

    // Option 2: Fallback to individual fetches in parallel
    return Promise.all(
      tokens.map(({ policyId, assetName }) =>
        this.getTokenMetadata(policyId, assetName)
      )
    );
  }

  private processImageUrl(url?: string): string | undefined {
    if (!url) return undefined;

    // Handle IPFS URLs
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    // Handle already valid URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return url;
  }
}
```

---

## Integration in Your App

### Step 1: Create the Provider Instance

In your `src/App.tsx` or main entry point:

```typescript
import { GenwealthMetadataProvider } from './providers/GenwealthMetadataProvider';

const metadataProvider = new GenwealthMetadataProvider(
  process.env.REACT_APP_METADATA_API_URL || 'https://metadata.broclan.io',
  process.env.REACT_APP_METADATA_API_KEY
);
```

### Step 2: Wrap Your App

```typescript
import { 
  SettingsProvider, 
  MetadataProviderWrapper 
} from '@clan/framework-providers';

function App() {
  return (
    <SettingsProvider>
      <MetadataProviderWrapper provider={metadataProvider}>
        <YourAppContent />
      </MetadataProviderWrapper>
    </SettingsProvider>
  );
}
```

### Step 3: Use in Components

Components automatically use your provider:

```typescript
import { useTokenInfo } from '@clan/framework-providers';

function TokenDisplay({ tokenId }: { tokenId: string }) {
  const { tokenInfo, loading, error } = useTokenInfo(tokenId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <img src={tokenInfo?.image} alt={tokenInfo?.name} />
      <h3>{tokenInfo?.name} ({tokenInfo?.ticker})</h3>
    </div>
  );
}
```

---

## API Requirements

Your BroClan metadata API should support these endpoints:

### Get Token Metadata
```
GET /metadata/token/{policyId}{assetName}

Response:
{
  "name": "Hosky Token",
  "ticker": "HOSKY",
  "description": "The memecoin of Cardano",
  "decimals": 0,
  "logo": "ipfs://QmX...",
  "website": "https://hosky.io",
  "verified": true,
  "project_id": "hosky"
}
```

### Search Tokens (Optional)
```
GET /metadata/search?q={query}&limit={limit}

Response:
{
  "results": [
    {
      "policyId": "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235",
      "assetName": "484f534b59",
      "name": "Hosky Token",
      "ticker": "HOSKY",
      "logo": "ipfs://..."
    }
  ]
}
```

### Batch Fetch (Optional but Recommended)
```
POST /metadata/batch

Body:
{
  "tokens": [
    { "policyId": "...", "assetName": "..." }
  ]
}

Response:
{
  "results": [
    { /* TokenMetadata */ }
  ]
}
```

---

## Important Notes

1. **Error Handling**: Always return `undefined` instead of throwing errors
2. **Caching**: The framework caches for 24 hours, but add your own cache for better performance
3. **IPFS URLs**: Convert `ipfs://` to `https://ipfs.io/ipfs/`
4. **Rate Limiting**: Consider implementing rate limiting if needed
5. **Fallbacks**: If your API is down, gracefully degrade (return undefined)

---

## Testing Your Implementation

```typescript
// Test file: src/providers/GenwealthMetadataProvider.test.ts

import { GenwealthMetadataProvider } from './GenwealthMetadataProvider';

describe('GenwealthMetadataProvider', () => {
  const provider = new GenwealthMetadataProvider('https://api.test.com');

  it('fetches token metadata', async () => {
    const metadata = await provider.getTokenMetadata(
      'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
      '484f534b59'
    );
    
    expect(metadata).toBeDefined();
    expect(metadata?.name).toBe('Hosky Token');
  });

  it('handles 404 gracefully', async () => {
    const metadata = await provider.getTokenMetadata('invalid', 'invalid');
    expect(metadata).toBeUndefined();
  });
});
```

---

## Environment Variables

Add to your `.env`:

```bash
REACT_APP_METADATA_API_URL=https://metadata.broclan.io
REACT_APP_METADATA_API_KEY=your_api_key_here
```

---

## Complete Example File Structure

```
src/
├── providers/
│   ├── GenwealthMetadataProvider.ts       ← Your implementation
│   └── GenwealthMetadataProvider.test.ts  ← Tests
├── App.tsx                                 ← Wire it up
└── components/
    └── TokenDisplay.tsx                    ← Use it
```

---

## Next Steps

1. Implement `GenwealthMetadataProvider` class
2. Update your API endpoints to match the expected responses
3. Test with real token IDs from your wallet
4. Add error logging/monitoring for production
5. Optimize with caching and batch fetching

---

## Support

- Review the [Metadata Provider Guide](packages/providers/METADATA_PROVIDER_GUIDE.md) for more details
- Check reference implementations in `packages/providers/src/reference-metadata-providers.ts`
- See the interface definition in `packages/core/src/types.ts`

Good luck! 🚀


