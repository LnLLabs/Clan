import {
  MetadataProvider,
  NoOpMetadataProvider,
  TokenMetadata,
  MeshAssetMetadataFetcher,
  hasAssetMetadataFetcher,
  toAssetId
} from '@clan/framework-core';

export interface MeshMetadataProviderOptions {
  cacheTtlMs?: number;
  ipfsGatewayUrl?: string;
  includeRaw?: boolean;
}

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

type CacheEntry = {
  value: TokenMetadata | undefined;
  timestamp: number;
};

export class MeshMetadataProvider implements MetadataProvider {
  private readonly fetcher: MeshAssetMetadataFetcher;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly cacheTtlMs: number;
  private readonly ipfsGatewayUrl: string;
  private readonly includeRaw: boolean;

  constructor(fetcher: MeshAssetMetadataFetcher, options: MeshMetadataProviderOptions = {}) {
    this.fetcher = fetcher;
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    this.ipfsGatewayUrl = options.ipfsGatewayUrl ?? DEFAULT_IPFS_GATEWAY;
    this.includeRaw = options.includeRaw ?? true;
  }

  async getTokenMetadata(policyId: string, assetName: string): Promise<TokenMetadata | undefined> {
    const assetId = toAssetId(policyId, assetName);

    const cached = this.getCached(assetId);
    if (cached !== null) {
      return cached;
    }

    try {
      const raw = await this.fetcher.fetchAssetMetadata(assetId);
      const normalized = normalizeMeshMetadata(policyId, assetName, raw, {
        ipfsGatewayUrl: this.ipfsGatewayUrl,
        includeRaw: this.includeRaw
      });
      this.cache.set(assetId, { value: normalized, timestamp: Date.now() });
      return normalized;
    } catch (error) {
      console.warn(`Failed to fetch metadata for ${assetId}:`, error);
      this.cache.set(assetId, { value: undefined, timestamp: Date.now() });
      return undefined;
    }
  }

  async batchGetTokenMetadata(
    tokens: Array<{ policyId: string; assetName: string }>
  ): Promise<(TokenMetadata | undefined)[]> {
    return Promise.all(
      tokens.map(({ policyId, assetName }) => this.getTokenMetadata(policyId, assetName))
    );
  }

  private getCached(assetId: string): TokenMetadata | undefined | null {
    const cached = this.cache.get(assetId);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTtlMs) {
      this.cache.delete(assetId);
      return null;
    }

    return cached.value;
  }
}

export function createMeshMetadataProvider(
  fetcher: unknown,
  options?: MeshMetadataProviderOptions
): MetadataProvider {
  if (!hasAssetMetadataFetcher(fetcher)) {
    return new NoOpMetadataProvider();
  }

  return new MeshMetadataProvider(fetcher, options);
}

function normalizeMeshMetadata(
  policyId: string,
  assetName: string,
  rawMetadata: unknown,
  options: { ipfsGatewayUrl: string; includeRaw: boolean }
): TokenMetadata | undefined {
  if (!rawMetadata || typeof rawMetadata !== 'object') {
    return undefined;
  }

  const raw = rawMetadata as Record<string, any>;
  const onchain = asRecord(raw.onchain_metadata) ?? asRecord(raw.onchainMetadata);
  const registry = asRecord(raw.token_registry_metadata) ?? asRecord(raw.tokenRegistryMetadata);

  const name = firstString(
    raw.name,
    raw.asset_name,
    raw.assetName,
    onchain?.name,
    registry?.name
  );
  const ticker = firstString(raw.ticker, onchain?.ticker, registry?.ticker);
  const description = firstString(raw.description, onchain?.description, registry?.description);
  const url = firstString(raw.url, onchain?.url, registry?.url, onchain?.website, registry?.website);
  const image = normalizeImageUrl(
    firstString(raw.logo, raw.image, onchain?.logo, onchain?.image, registry?.logo, registry?.image),
    options.ipfsGatewayUrl
  );
  const decimals = firstNumber(raw.decimals, onchain?.decimals, registry?.decimals) ?? 0;

  const metadata: TokenMetadata = {
    policyId,
    assetName,
    name: name ?? '',
    ticker: ticker ?? '',
    description,
    decimals,
    logo: image ?? '',
    url,
    isNft: detectIsNft(raw, decimals, ticker)
  };

  if (options.includeRaw) {
    metadata.raw = rawMetadata;
  }

  return metadata;
}

function normalizeImageUrl(image: string | undefined, ipfsGatewayUrl: string): string | undefined {
  if (!image) return undefined;

  if (image.startsWith('ipfs://')) {
    const path = image.replace(/^ipfs:\/\//i, '').replace(/^ipfs\//i, '').replace(/^\/+/, '');
    return `${ipfsGatewayUrl}${path}`;
  }

  return image;
}

function detectIsNft(raw: Record<string, any>, decimals: number, ticker?: string): boolean {
  if (typeof raw.isNft === 'boolean') {
    return raw.isNft;
  }

  if (typeof raw.assetType === 'string' && raw.assetType.toLowerCase().includes('nft')) {
    return true;
  }

  if (Array.isArray(raw.tags)) {
    const hasNftTag = raw.tags.some((tag: unknown) =>
      String(tag).toLowerCase().includes('nft')
    );
    if (hasNftTag) return true;
  }

  return decimals === 0 && !ticker;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, any> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, any>;
}
