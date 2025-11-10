/**
 * Token information utilities
 * 
 * This module provides helpers for fetching and managing token metadata.
 * It uses the MetadataProvider interface for dependency injection.
 */

import { MetadataProvider, TokenMetadata } from '@clan/framework-core';

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
 * Get token information with a provided MetadataProvider
 * This is the core function that accepts a provider as dependency injection
 */
export async function getTokenInfo(
  tokenId: string,
  metadataProvider?: MetadataProvider
): Promise<TokenInfo | undefined> {
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

  // If no provider, return basic info
  if (!metadataProvider) {
    return createBasicTokenInfo(tokenId);
  }

  // Fetch from metadata provider
  const tokenInfo = await fetchTokenDataWithProvider(tokenId, metadataProvider);

  // Cache the result
  if (tokenInfo) {
    setCachedTokenInfo(tokenId, tokenInfo);
  }

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
 * Fetch token data using the injected MetadataProvider
 */
async function fetchTokenDataWithProvider(
  tokenId: string,
  metadataProvider: MetadataProvider
): Promise<TokenInfo | undefined> {
  try {
    // Parse token ID into policyId and assetName
    const { policyId, assetName } = parseTokenId(tokenId);
    
    // Fetch metadata from provider
    const metadata = await metadataProvider.getTokenMetadata(policyId, assetName);
    
    if (!metadata) {
      return createBasicTokenInfo(tokenId);
    }

    // Convert TokenMetadata to TokenInfo
    return convertMetadataToTokenInfo(tokenId, metadata);
  } catch (error) {
    console.warn('Failed to fetch token info:', error);
    return createBasicTokenInfo(tokenId);
  }
}

/**
 * Parse tokenId into policyId and assetName
 */
function parseTokenId(tokenId: string): { policyId: string; assetName: string } {
  if (tokenId.length <= 56) {
    // Assume entire string is policy ID with no asset name
    return { policyId: tokenId, assetName: '' };
  }
  
  return {
    policyId: tokenId.slice(0, 56),
    assetName: tokenId.slice(56)
  };
}

/**
 * Convert TokenMetadata to TokenInfo
 */
function convertMetadataToTokenInfo(tokenId: string, metadata: TokenMetadata): TokenInfo {
  return {
    name: metadata.name || decodeAssetName(tokenId),
    image: processImageUrl(metadata.logo || ''),
    decimals: metadata.decimals,
    ticker: metadata.ticker,
    isNft: false, // This would need quantity info to determine
    provider: 'metadata-provider',
    fingerprint: '', // Not provided by metadata
    fetchTime: Date.now()
  };
}

/**
 * Create basic token info when metadata is not available
 */
function createBasicTokenInfo(tokenId: string): TokenInfo {
  return {
    name: decodeAssetName(tokenId),
    image: '',
    decimals: 0,
    ticker: decodeAssetName(tokenId).slice(0, 6).toUpperCase(),
    isNft: false,
    provider: 'basic',
    fingerprint: tokenId.slice(0, 8),
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
