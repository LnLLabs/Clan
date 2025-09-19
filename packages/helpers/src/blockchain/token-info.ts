/**
 * Token information utilities
 */

export interface TokenInfo {
  name: string;
  image: string;
  decimals?: number;
  isNft: boolean;
  provider: string;
  fingerprint: string;
  fetchTime: number;
}

const IPFS_GATEWAY = 'https://ipfs.blockfrost.dev/ipfs/';

/**
 * Hook for getting token information
 */
export function useTokenInfo(tokenId: string): {
  tokenInfo: TokenInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [tokenInfo, setTokenInfo] = React.useState<TokenInfo | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTokenInfo = React.useCallback(async () => {
    if (!tokenId) return;

    setLoading(true);
    setError(null);

    try {
      const info = await getTokenInfo(tokenId);
      setTokenInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token info');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  React.useEffect(() => {
    fetchTokenInfo();
  }, [fetchTokenInfo]);

  return {
    tokenInfo,
    loading,
    error,
    refetch: fetchTokenInfo
  };
}

/**
 * Get token information
 */
export async function getTokenInfo(tokenId: string): Promise<TokenInfo> {
  // Handle ADA/lovelace
  if (tokenId === 'lovelace' || tokenId === '') {
    return {
      name: 'ADA',
      image: '/assets/ADA.png',
      decimals: 6,
      isNft: false,
      provider: 'system',
      fingerprint: '',
      fetchTime: Date.now()
    };
  }

  // Try to get from cache first
  const cached = getCachedTokenInfo(tokenId);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const tokenInfo = await fetchTokenData(tokenId);

  // Cache the result
  setCachedTokenInfo(tokenId, tokenInfo);

  return tokenInfo;
}

/**
 * Get cached token info
 */
function getCachedTokenInfo(tokenId: string): TokenInfo | null {
  try {
    const cached = localStorage.getItem(`tokenInfo_${tokenId}`);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    // Check if cache is still valid (24 hours)
    if (Date.now() - parsed.fetchTime > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`tokenInfo_${tokenId}`);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Cache token info
 */
function setCachedTokenInfo(tokenId: string, tokenInfo: TokenInfo): void {
  try {
    localStorage.setItem(`tokenInfo_${tokenId}`, JSON.stringify(tokenInfo));
  } catch {
    // Ignore cache errors
  }
}

/**
 * Fetch token data from APIs
 */
async function fetchTokenData(tokenId: string): Promise<TokenInfo> {
  const settings = getSettings();

  try {
    if (settings.metadataProvider === 'None') {
      return createBasicTokenInfo(tokenId);
    }

    // Try Blockfrost first (most reliable)
    if (settings.api?.url && settings.api?.projectId) {
      return await fetchFromBlockfrost(tokenId, settings);
    }

    // Fallback to basic info
    return createBasicTokenInfo(tokenId);
  } catch (error) {
    console.warn('Failed to fetch token info:', error);
    return createBasicTokenInfo(tokenId);
  }
}

/**
 * Fetch from Blockfrost API
 */
async function fetchFromBlockfrost(tokenId: string, settings: any): Promise<TokenInfo> {
  const response = await fetch(
    `${settings.api.url}/assets/${tokenId}`,
    {
      headers: {
        'project_id': settings.api.projectId
      }
    }
  );

  if (!response.ok) {
    throw new Error('Blockfrost API error');
  }

  const data = await response.json();

  const tokenInfo: TokenInfo = {
    name: data.asset_name ? hexToAscii(data.asset_name) : tokenId,
    image: '',
    decimals: data.metadata?.decimals || 0,
    isNft: data.quantity === '1',
    provider: 'Blockfrost',
    fingerprint: data.fingerprint || '',
    fetchTime: Date.now()
  };

  // Set image from metadata
  if (data.metadata?.logo) {
    tokenInfo.image = `data:image/jpeg;base64,${data.metadata.logo}`;
  } else if (data.onchain_metadata?.image) {
    tokenInfo.image = processImageUrl(data.onchain_metadata.image);
  }

  return tokenInfo;
}

/**
 * Create basic token info when API is not available
 */
function createBasicTokenInfo(tokenId: string): TokenInfo {
  const parts = tokenId.split('.');
  const assetName = parts.length > 1 ? parts[1] : '';

  return {
    name: assetName ? hexToAscii(assetName) : tokenId.slice(-8),
    image: '',
    decimals: 0,
    isNft: false,
    provider: 'basic',
    fingerprint: '',
    fetchTime: Date.now()
  };
}

/**
 * Convert hex to ASCII
 */
function hexToAscii(hex: string): string {
  try {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  } catch {
    return hex;
  }
}

/**
 * Process image URL (handle IPFS, etc.)
 */
function processImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';

  if (imageUrl.startsWith('ipfs://')) {
    return imageUrl.replace('ipfs://', IPFS_GATEWAY);
  }

  if (Array.isArray(imageUrl)) {
    return imageUrl.join('');
  }

  return imageUrl;
}

/**
 * Get settings from localStorage
 */
function getSettings(): any {
  try {
    return JSON.parse(localStorage.getItem('settings') || '{}');
  } catch {
    return { metadataProvider: 'Blockfrost' };
  }
}

// Import React for the hook
import React from 'react';

