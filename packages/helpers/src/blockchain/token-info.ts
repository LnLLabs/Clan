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

const IPFS_GATEWAYS = [
  'https://ipfs.blockfrost.dev/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/'
];

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

  // If no provider, return basic info
  if (!metadataProvider) {
    return createBasicTokenInfo(tokenId);
  }

  // Fetch from metadata provider
  const tokenInfo = await fetchTokenDataWithProvider(tokenId, metadataProvider);

  return tokenInfo;
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
  const decodedName = metadata.name || decodeAssetName(tokenId);
  const image = extractMetadataImage(metadata);
  const decimals = typeof metadata.decimals === 'number' ? metadata.decimals : 0;
  const ticker = normalizeTicker(metadata.ticker, decodedName);
  const isNft = detectPotentialNft(metadata);

  return {
    name: decodedName,
    image,
    decimals,
    ticker,
    isNft,
    provider: 'metadata-provider',
    fingerprint: '',
    fetchTime: Date.now()
  };
}

/**
 * Create basic token info when metadata is not available
 */
function createBasicTokenInfo(tokenId: string): TokenInfo {
  const decodedName = decodeAssetName(tokenId);
  return {
    name: decodedName,
    image: '',
    decimals: 0,
    ticker: normalizeTicker(undefined, decodedName),
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

function extractMetadataImage(metadata: TokenMetadata): string {
  const candidates: any[] = [];
  const extendedMetadata = metadata as Record<string, any>;

  const enqueue = (value: any) => {
    if (value !== undefined && value !== null) {
      candidates.push(value);
    }
  };

  enqueue(metadata.logo);
  enqueue(extendedMetadata?.image);
  enqueue(extendedMetadata?.images);
  enqueue(extendedMetadata?.icon);
  enqueue(extendedMetadata?.iconUrl);
  enqueue(extendedMetadata?.thumbnail);
  enqueue(extendedMetadata?.previewImage);
  enqueue(extendedMetadata?.media);
  enqueue(extendedMetadata?.files);

  const resolved = resolveImageCandidateFromList(candidates);
  return resolved || '';
}

function normalizeTicker(ticker: string | undefined, fallbackName?: string): string {
  if (ticker && ticker.trim()) {
    return ticker.trim();
  }

  if (fallbackName) {
    const sanitized = fallbackName.replace(/[^A-Za-z0-9]/g, '');
    if (sanitized) {
      return sanitized.slice(0, 10).toUpperCase();
    }
    return fallbackName.slice(0, 10).toUpperCase();
  }

  return '';
}

function detectPotentialNft(metadata: TokenMetadata): boolean {
  const extendedMetadata = metadata as Record<string, any>;

  if (typeof metadata.decimals === 'number' && metadata.decimals === 0 && !metadata.ticker) {
    return true;
  }

  if (typeof extendedMetadata?.isNft === 'boolean') {
    return extendedMetadata.isNft;
  }

  if (typeof extendedMetadata?.assetType === 'string') {
    return extendedMetadata.assetType.toLowerCase().includes('nft');
  }

  if (Array.isArray(extendedMetadata?.tags)) {
    return extendedMetadata.tags.some(tag => {
      const value = typeof tag === 'string' ? tag : String(tag);
      return value.toLowerCase().includes('nft');
    });
  }

  return false;
}

/**
 * Process image URL (handle IPFS, etc.)
 */
function processImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';

  const trimmed = imageUrl.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('ipfs://')) {
    return resolveIpfsUrl(trimmed);
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  const base64Candidate = trimmed.replace(/\s+/g, '');
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  if (base64Candidate.length >= 60 && base64Pattern.test(base64Candidate)) {
    const mimeType = inferMimeTypeFromBase64(base64Candidate);
    return `data:${mimeType};base64,${base64Candidate}`;
  }

  return trimmed;
}

function inferMimeTypeFromBase64(base64Data: string): string {
  const signatureMap: Array<{ prefix: string; mime: string }> = [
    { prefix: 'iVBORw0KGgo', mime: 'image/png' },
    { prefix: '/9j/', mime: 'image/jpeg' },
    { prefix: 'R0lGOD', mime: 'image/gif' },
    { prefix: 'PHN2Zy', mime: 'image/svg+xml' },
    { prefix: 'Qk0', mime: 'image/bmp' },
    { prefix: 'UklGR', mime: 'image/webp' }
  ];

  const match = signatureMap.find(entry => base64Data.startsWith(entry.prefix));
  return match?.mime || 'image/png';
}

function resolveIpfsUrl(ipfsUrl: string): string {
  // Remove protocol and redundant prefixes
  let path = ipfsUrl.replace(/^ipfs:\/\//i, '');
  path = path.replace(/^ipfs\//i, '');
  path = path.replace(/^ipfs:/i, '');
  path = path.replace(/^\/+/, '');

  if (!path) {
    return ipfsUrl;
  }

  // Prefer first gateway; others kept for potential future rotation/fallback
  return `${IPFS_GATEWAYS[0]}${path}`;
}

function resolveImageCandidateFromList(candidates: any[]): string | undefined {
  for (const candidate of candidates) {
    const resolved = resolveImageCandidate(candidate);
    if (resolved) {
      return resolved;
    }
  }
  return undefined;
}

function resolveImageCandidate(value: any): string | undefined {
  if (!value) return undefined;

  if (typeof value === 'string') {
    return processImageUrl(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = resolveImageCandidate(item);
      if (resolved) return resolved;
    }
    return undefined;
  }

  if (typeof value === 'object') {
    const preferredKeys = [
      'url',
      'src',
      'href',
      'image',
      'logo',
      'thumbnail',
      'previewImage',
      'default',
      'large',
      'medium',
      'small'
    ];

    for (const key of preferredKeys) {
      if (key in value) {
        const resolved = resolveImageCandidate((value as Record<string, any>)[key]);
        if (resolved) return resolved;
      }
    }
  }

  return undefined;
}
