/**
 * Token information utilities
 */

export interface TokenInfo {
  name: string;
  image: string;
  decimals?: number;
  ticker?: string;
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
      setTokenInfo(info || null);
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
export async function getTokenInfo(tokenId: string): Promise<TokenInfo | undefined> {
  // Handle ADA/lovelace
  if (tokenId === 'lovelace' || tokenId === '') {
    return {
      name: 'ADA',
      image: '/assets/ADA.png',
      decimals: 6,
      ticker: 'ADA',
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
  if (tokenInfo)
    setCachedTokenInfo(tokenId, tokenInfo );

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
async function fetchTokenData(tokenId: string): Promise<TokenInfo | undefined> {
  const settings = getSettings();

  try {
    if (settings.metadataProvider === 'None') {
      return undefined;
    }

    // Try Blockfrost first (most reliable)
    if (settings.api?.url && settings.api?.projectId) {
      return await fetchFromBlockfrost(tokenId, settings);
    }

    // Fallback to basic info
    return undefined;
  } catch (error) {
    console.warn('Failed to fetch token info:', error);
    return undefined;
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
    ticker: data.metadata?.ticker || data.onchain_metadata?.ticker,
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

/**
 * Convert hex to ASCII
 */
function hexToAscii(hex: string): string {
  try {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    // Remove trailing null bytes and trim
    str = str.replace(/\x00+$/g, '').trim();
    // Return decoded if it's printable ASCII, otherwise return the original hex
    if (str && /^[\x20-\x7E]+$/.test(str)) {
      return str;
    }
    return hex;
  } catch {
    return hex;
  }
}

/**
 * Decode hex-encoded asset name from token ID
 */
export function decodeAssetName(tokenId: string): string {
  // If it's just "lovelace", return "ADA"
  if (tokenId === 'lovelace') return 'ADA';
  
  // Determine the hex portion to decode
  let hexName: string;
  
  // Check if tokenId has the full format: policyId (56 chars) + hexEncodedName
  if (tokenId.length > 56) {
    hexName = tokenId.slice(56);
  } else {
    // Otherwise, treat the entire tokenId as the hex name
    hexName = tokenId;
  }
  
  if (!hexName) return tokenId;
  
  return hexToAscii(hexName);
}

/**
 * Decode hex string to readable text
 */
export function decodeHexToString(hex: string): string {
  try {
    if (!/^[0-9a-fA-F]+$/.test(hex)) return hex;
    const decoded = hex.match(/.{1,2}/g)
      ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
      .join('') || '';
    return decoded.replace(/\x00+$/g, '').trim() || hex;
  } catch {
    return hex;
  }
}

/**
 * Token display information
 */
export interface TokenDisplayInfo {
  displayName: string;
  displayTicker: string;
  decodedName: string;
  placeholderColor: string;
  placeholderInitials: string;
}

/**
 * Get token display information for UI rendering
 */
export function getTokenDisplayInfo(
  tokenId: string,
  tokenInfo: TokenInfo | null | undefined
): TokenDisplayInfo {
  // Get the base decoded name
  const rawName = tokenInfo?.name || decodeAssetName(tokenId);
  const decodedName = decodeHexToString(rawName);
  
  // For ticker: prefer metadata ticker, otherwise use decoded name
  const displayTicker = tokenInfo?.ticker || decodedName;
  
  // For display name: 
  // - If we have both name and ticker, show the name
  // - If we only have name (no ticker), show fingerprint or shortened ID to differentiate
  // - If we have neither, show fingerprint or shortened ID
  const displayName = (tokenInfo?.name && tokenInfo?.ticker)
    ? decodedName
    : tokenInfo?.fingerprint || `${tokenId.slice(0, 8)}...${tokenId.slice(-8)}`;
  
  // Generate placeholder color and initials
  const placeholderColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const colorIndex = tokenId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % placeholderColors.length;
  const placeholderColor = placeholderColors[colorIndex];
  const placeholderInitials = displayTicker.slice(0, 4).toUpperCase();
  
  return {
    displayName,
    displayTicker,
    decodedName,
    placeholderColor,
    placeholderInitials
  };
}

/**
 * Get NFT display information for UI rendering
 */
export function getNFTDisplayInfo(
  tokenId: string,
  tokenInfo: TokenInfo | null | undefined
): TokenDisplayInfo {
  // Get the base decoded name
  const rawName = !tokenInfo?.name ? decodeAssetName(tokenId) : tokenInfo.name;
  const decodedName = decodeHexToString(rawName);
  
  // For NFTs, use the decoded name as both display name and ticker
  const displayTicker = decodedName;
  const displayName = decodedName;
  
  // Generate placeholder color and initials
  const placeholderColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#a855f7'];
  const colorIndex = tokenId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % placeholderColors.length;
  const placeholderColor = placeholderColors[colorIndex];
  const placeholderInitials = decodedName.slice(0, 3).toUpperCase();
  
  return {
    displayName,
    displayTicker,
    decodedName,
    placeholderColor,
    placeholderInitials
  };
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

