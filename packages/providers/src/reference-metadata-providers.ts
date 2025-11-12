import { 
  MetadataProvider, 
  TokenMetadata, 
  TokenSearchResult,
  NoOpMetadataProvider 
} from '@clan/framework-core';

/**
 * Reference implementation: Blockfrost Metadata Provider
 * Fetches token metadata from Blockfrost API
 */
export class BlockfrostMetadataProvider implements MetadataProvider {
  private baseUrl: string;
  private projectId: string;
  private cache: Map<string, TokenMetadata> = new Map();

  constructor(baseUrl: string, projectId: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.projectId = projectId;
  }

  async getTokenMetadata(policyId: string, assetName: string): Promise<TokenMetadata | undefined> {
    const assetId = policyId + assetName;
    
    // Check cache first
    if (this.cache.has(assetId)) {
      return this.cache.get(assetId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/assets/${assetId}`, {
        headers: {
          'project_id': this.projectId
        }
      });

      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error(`Blockfrost API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const metadata: TokenMetadata = {
        policyId,
        assetName,
        name: data.onchain_metadata?.name || data.asset_name,
        ticker: data.onchain_metadata?.ticker,
        description: data.onchain_metadata?.description,
        decimals: data.onchain_metadata?.decimals,
        logo: this.processImageUrl(data.onchain_metadata?.logo || data.onchain_metadata?.image),
        url: data.onchain_metadata?.url,
        // Include raw metadata
        raw: data.onchain_metadata
      };

      // Cache the result
      this.cache.set(assetId, metadata);
      
      return metadata;
    } catch (error) {
      console.warn(`Failed to fetch metadata for ${assetId}:`, error);
      return undefined;
    }
  }

  async searchTokens(query: string, limit: number = 10): Promise<TokenSearchResult[]> {
    // Blockfrost doesn't have a direct search endpoint
    // This would require a custom indexer or database
    return [];
  }

  async batchGetTokenMetadata(
    tokens: Array<{ policyId: string; assetName: string }>
  ): Promise<(TokenMetadata | undefined)[]> {
    // Fetch in parallel with rate limiting
    const results = await Promise.all(
      tokens.map(({ policyId, assetName }) => 
        this.getTokenMetadata(policyId, assetName)
      )
    );
    return results;
  }

  private processImageUrl(imageUrl?: string): string | undefined {
    if (!imageUrl) return undefined;
    
    // Handle IPFS URLs
    if (imageUrl.startsWith('ipfs://')) {
      return imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    // Handle already processed URLs
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    return imageUrl;
  }
}

/**
 * Reference implementation: Maestro Metadata Provider
 * Fetches token metadata from Maestro API
 */
export class MaestroMetadataProvider implements MetadataProvider {
  private apiKey: string;
  private network: string;
  private cache: Map<string, TokenMetadata> = new Map();

  constructor(apiKey: string, network: string = 'mainnet') {
    this.apiKey = apiKey;
    this.network = network;
  }

  async getTokenMetadata(policyId: string, assetName: string): Promise<TokenMetadata | undefined> {
    const assetId = policyId + assetName;
    
    // Check cache first
    if (this.cache.has(assetId)) {
      return this.cache.get(assetId);
    }

    try {
      const response = await fetch(
        `https://${this.network}.gomaestro-api.org/v1/assets/${assetId}`,
        {
          headers: {
            'api-key': this.apiKey
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error(`Maestro API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const metadata: TokenMetadata = {
        policyId,
        assetName,
        name: data.asset_name || data.token_registry_metadata?.name,
        ticker: data.token_registry_metadata?.ticker,
        description: data.token_registry_metadata?.description,
        decimals: data.token_registry_metadata?.decimals,
        logo: data.token_registry_metadata?.logo,
        url: data.token_registry_metadata?.url,
        // Include raw metadata
        raw: data
      };

      // Cache the result
      this.cache.set(assetId, metadata);
      
      return metadata;
    } catch (error) {
      console.warn(`Failed to fetch metadata for ${assetId}:`, error);
      return undefined;
    }
  }

  async searchTokens(query: string, limit: number = 10): Promise<TokenSearchResult[]> {
    // Maestro may have search capabilities - implement if available
    return [];
  }

  async batchGetTokenMetadata(
    tokens: Array<{ policyId: string; assetName: string }>
  ): Promise<(TokenMetadata | undefined)[]> {
    const results = await Promise.all(
      tokens.map(({ policyId, assetName }) => 
        this.getTokenMetadata(policyId, assetName)
      )
    );
    return results;
  }
}

/**
 * Factory function to create metadata provider based on settings
 * This is a convenience function for apps that want to use standard providers
 */
export function createMetadataProvider(config: {
  type: 'Blockfrost' | 'Maestro' | 'None';
  blockfrostUrl?: string;
  blockfrostProjectId?: string;
  maestroApiKey?: string;
  maestroNetwork?: string;
}): MetadataProvider {
  switch (config.type) {
    case 'Blockfrost':
      if (!config.blockfrostUrl || !config.blockfrostProjectId) {
        throw new Error('Blockfrost requires url and projectId');
      }
      return new BlockfrostMetadataProvider(config.blockfrostUrl, config.blockfrostProjectId);
    
    case 'Maestro':
      if (!config.maestroApiKey) {
        throw new Error('Maestro requires apiKey');
      }
      return new MaestroMetadataProvider(config.maestroApiKey, config.maestroNetwork);
    
    case 'None':
    default:
      return new NoOpMetadataProvider();
  }
}


