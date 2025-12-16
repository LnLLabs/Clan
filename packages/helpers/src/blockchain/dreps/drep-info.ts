/**
 * DRep (Delegated Representative) information utilities
 * Uses Koios API for dRep data
 */

// Import Koios config from pools module to avoid duplicate exports
import { 
  getKoiosApiUrl, 
  type KoiosApiConfig,
} from '../pools/pool-info';

/**
 * Normalize network name (remove "cardano" prefix, etc.)
 */
function normalizeNetwork(network: string): string {
  return network.toLowerCase().replace(/cardano[-_\s]*/gi, '').trim() || 'mainnet';
}

/**
 * Make authenticated Koios API request
 */
async function koiosFetch(
  endpoint: string,
  network: string = 'mainnet',
  config?: KoiosApiConfig,
  options?: RequestInit
): Promise<Response> {
  const baseUrl = getKoiosApiUrl(network, config);
  // Prefer config.network over the network parameter
  const networkToUse = config?.network || network;
  const normalizedNetwork = normalizeNetwork(networkToUse);
  const networkParam = normalizedNetwork || 'mainnet';
  
  // Construct URL: baseUrl + endpoint + query parameter
  const fullUrl = `${baseUrl}${endpoint}?network=${networkParam}`;
  
  const headers: HeadersInit = {
    'accept': 'application/json',
    ...(options?.headers || {}),
  };

  if (config?.apiKey) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${config.apiKey}`;
  }

  return fetch(fullUrl, {
    ...options,
    headers,
  });
}

/**
 * DRep anchor information (metadata)
 */
export interface DRepAnchor {
  url?: string;
  hash?: string;
}

/**
 * DRep metadata from anchor URL
 */
export interface DRepMetadata {
  name?: string;
  bio?: string;
  email?: string;
  website?: string;
  image?: string;
  objectives?: string;
  qualifications?: string;
  motivations?: string;
  references?: Array<{
    type: string;
    label: string;
    uri: string;
  }>;
}

/**
 * DRep information from Koios
 */
export interface DRepInfo {
  drep_id: string;
  hex: string;
  has_script: boolean;
  registered: boolean;
  deposit?: string;
  active: boolean;
  expires_epoch_no?: number;
  amount?: string; // Voting power in lovelace
  anchor?: DRepAnchor;
  // Extended metadata (fetched from anchor URL if available)
  metadata?: DRepMetadata;
  // Logo URL (from metadata if available)
  logo?: string;
}

/**
 * DRep list item (from pool_list-like endpoint)
 */
export interface DRepListItem {
  drep_id: string;
  hex: string;
  has_script: boolean;
  registered: boolean;
  anchor_url?: string;
  anchor_hash?: string;
}

/**
 * Account dRep delegation info
 */
export interface AccountDRepDelegation {
  stake_address: string;
  drep_id?: string;
  drep_hash?: string;
}

// Metadata cache to avoid repeated fetches
const metadataCache = new Map<string, DRepMetadata | null>();

/**
 * Fetch dRep metadata from anchor URL
 * Note: May fail due to CORS in browser - consuming app should proxy these requests
 */
export async function getDRepMetadata(
  anchorUrl?: string
): Promise<DRepMetadata | null> {
  if (!anchorUrl) return null;
  
  if (metadataCache.has(anchorUrl)) {
    return metadataCache.get(anchorUrl) || null;
  }

  try {
    const response = await fetch(anchorUrl, {
      headers: { 'accept': 'application/json' },
    });

    if (!response.ok) {
      metadataCache.set(anchorUrl, null);
      return null;
    }

    const data = await response.json();
    
    // CIP-119 compliant metadata structure - data may be nested in 'body' object
    const body = data.body || data;
    const metadata: DRepMetadata = {
      name: body.givenName || body.name || data.givenName || data.name,
      bio: body.bio || data.bio,
      email: body.email || data.email,
      website: body.website || body.paymentAddress || data.website || data.paymentAddress,
      image: body.image?.contentUrl || body.image || data.image?.contentUrl || data.image,
      objectives: body.objectives || data.objectives,
      qualifications: body.qualifications || data.qualifications,
      motivations: body.motivations || data.motivations,
      references: body.references || data.references,
    };

    metadataCache.set(anchorUrl, metadata);
    return metadata;
  } catch (error) {
    console.warn(`Failed to fetch dRep metadata from ${anchorUrl}:`, error);
    metadataCache.set(anchorUrl, null);
    return null;
  }
}

/**
 * Get dRep logo from metadata
 * Note: No centralized dRep logo repository exists (unlike SMASH for pools)
 */
export function getDRepLogo(metadata?: DRepMetadata): string | null {
  if (!metadata?.image) return null;
  return metadata.image;
}

/**
 * Get information about a specific dRep from Koios
 */
export async function getDRepInfo(
  drepId: string,
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig,
  fetchMetadata: boolean = true
): Promise<DRepInfo | null> {
  try {
    const response = await koiosFetch(
      `/drep_info`,
      network,
      koiosConfig,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _drep_ids: [drepId] }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const drepData = data[0];
    
    // Koios returns meta_url and meta_hash for the anchor
    const anchorUrl = drepData.meta_url || drepData.url;
    const anchorHash = drepData.meta_hash || drepData.hash;
    
    // Optionally fetch metadata from anchor URL
    let metadata: DRepMetadata | undefined = undefined;
    if (fetchMetadata && anchorUrl) {
      metadata = (await getDRepMetadata(anchorUrl)) || undefined;
    }

    return {
      drep_id: drepData.drep_id,
      hex: drepData.hex,
      has_script: drepData.has_script,
      registered: drepData.registered,
      deposit: drepData.deposit,
      active: drepData.active,
      expires_epoch_no: drepData.expires_epoch_no,
      amount: drepData.amount,
      anchor: anchorUrl || anchorHash ? {
        url: anchorUrl,
        hash: anchorHash,
      } : undefined,
      metadata,
      logo: metadata?.image,
    };
  } catch (error) {
    console.warn(`Failed to fetch dRep info for ${drepId}:`, error);
    return null;
  }
}

/**
 * Get multiple dReps information from Koios
 */
export async function getDRepsInfo(
  drepIds: string[],
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig,
  fetchMetadata: boolean = false
): Promise<Record<string, DRepInfo | null>> {
  const results: Record<string, DRepInfo | null> = {};

  if (drepIds.length === 0) return results;

  try {
    const response = await koiosFetch(
      `/drep_info`,
      network,
      koiosConfig,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _drep_ids: drepIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Initialize all as null
    drepIds.forEach(id => results[id] = null);

    if (!data || !Array.isArray(data)) {
      return results;
    }

    // Process results
    for (const drepData of data) {
      if (drepData?.drep_id) {
        // Koios returns meta_url and meta_hash for the anchor
        const anchorUrl = drepData.meta_url || drepData.url;
        const anchorHash = drepData.meta_hash || drepData.hash;
        
        let metadata: DRepMetadata | undefined = undefined;
        if (fetchMetadata && anchorUrl) {
          metadata = (await getDRepMetadata(anchorUrl)) || undefined;
        }

        results[drepData.drep_id] = {
          drep_id: drepData.drep_id,
          hex: drepData.hex,
          has_script: drepData.has_script,
          registered: drepData.registered,
          deposit: drepData.deposit,
          active: drepData.active,
          expires_epoch_no: drepData.expires_epoch_no,
          amount: drepData.amount,
          anchor: anchorUrl || anchorHash ? {
            url: anchorUrl,
            hash: anchorHash,
          } : undefined,
          metadata,
          logo: metadata?.image,
        };
      }
    }

    return results;
  } catch (error) {
    console.warn('Error fetching batch of dRep info:', error);
    drepIds.forEach(id => results[id] = null);
    return results;
  }
}

/**
 * Search for dReps by ID or name
 */
export async function searchDReps(
  query: string,
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig,
  limit: number = 20
): Promise<DRepListItem[]> {
  try {
    const baseUrl = getKoiosApiUrl(network, koiosConfig);
    const networkToUse = koiosConfig?.network || network;
    const normalizedNetwork = normalizeNetwork(networkToUse);
    const networkParam = normalizedNetwork || 'mainnet';
    
    const headers: HeadersInit = {
      'accept': 'application/json',
    };

    if (koiosConfig?.apiKey) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${koiosConfig.apiKey}`;
    }

    // Search by dRep ID (partial match)
    const response = await fetch(
      `${baseUrl}/drep_list?drep_id=ilike.*${query}*&limit=${limit}&network=${networkParam}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((drep: any) => ({
      drep_id: drep.drep_id,
      hex: drep.hex,
      has_script: drep.has_script,
      registered: drep.registered,
      anchor_url: drep.meta_url || drep.url,
      anchor_hash: drep.meta_hash || drep.hash,
    }));
  } catch (error) {
    console.warn('Failed to search dReps:', error);
    return [];
  }
}

/**
 * Get list of dReps (with pagination support)
 */
export async function getDRepList(
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig,
  limit: number = 50,
  offset: number = 0
): Promise<DRepListItem[]> {
  try {
    const response = await koiosFetch(
      `/drep_list?limit=${limit}&offset=${offset}`,
      network,
      koiosConfig
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((drep: any) => ({
      drep_id: drep.drep_id,
      hex: drep.hex,
      has_script: drep.has_script,
      registered: drep.registered,
      anchor_url: drep.meta_url || drep.url,
      anchor_hash: drep.meta_hash || drep.hash,
    }));
  } catch (error) {
    console.warn('Failed to fetch dRep list:', error);
    return [];
  }
}

/**
 * Get the delegated dRep for a stake address
 */
export async function getDelegatedDRep(
  stakeAddress: string,
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig
): Promise<AccountDRepDelegation | null> {
  try {
    const response = await koiosFetch(
      `/account_info`,
      network,
      koiosConfig,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _stake_addresses: [stakeAddress] }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const accountData = data[0];
    
    return {
      stake_address: stakeAddress,
      drep_id: accountData.delegated_drep,
      drep_hash: accountData.delegated_drep_hash,
    };
  } catch (error) {
    console.warn(`Failed to fetch delegated dRep for ${stakeAddress}:`, error);
    return null;
  }
}

/**
 * Validate if a string is a valid dRep ID
 * dRep IDs can be:
 * - Bech32 format: drep1...
 * - Special values: drep_always_abstain, drep_always_no_confidence
 */
export function isValidDRepId(drepId: string): boolean {
  if (!drepId) return false;
  
  // Special dRep values
  if (drepId === 'drep_always_abstain' || drepId === 'drep_always_no_confidence') {
    return true;
  }
  
  // Bech32 dRep ID format
  if (drepId.startsWith('drep1') && drepId.length >= 50 && drepId.length <= 64) {
    return /^drep1[a-z0-9]+$/.test(drepId);
  }
  
  // Hex format (56 characters)
  if (drepId.length === 56 && /^[a-f0-9]+$/i.test(drepId)) {
    return true;
  }
  
  return false;
}

/**
 * Format dRep information for display
 */
export function formatDRepInfo(drepInfo: DRepInfo): {
  id: string;
  name: string;
  description: string;
  votingPower: string;
  isActive: boolean;
  logo?: string;
} {
  const votingPowerAda = drepInfo.amount 
    ? (parseInt(drepInfo.amount) / 1_000_000).toLocaleString()
    : '0';

  return {
    id: drepInfo.drep_id,
    name: drepInfo.metadata?.name || drepInfo.drep_id.slice(0, 12) + '...',
    description: drepInfo.metadata?.bio || drepInfo.metadata?.objectives || 'No description available',
    votingPower: `${votingPowerAda} ADA`,
    isActive: drepInfo.active && drepInfo.registered,
    logo: drepInfo.logo || undefined,
  };
}

/**
 * Special dRep options for abstain/no confidence
 */
export const SPECIAL_DREPS = {
  ALWAYS_ABSTAIN: 'drep_always_abstain',
  ALWAYS_NO_CONFIDENCE: 'drep_always_no_confidence',
} as const;

/**
 * Get special dRep display info
 */
export function getSpecialDRepInfo(drepId: string): DRepInfo | null {
  if (drepId === SPECIAL_DREPS.ALWAYS_ABSTAIN) {
    return {
      drep_id: SPECIAL_DREPS.ALWAYS_ABSTAIN,
      hex: '',
      has_script: false,
      registered: true,
      active: true,
      metadata: {
        name: 'Always Abstain',
        bio: 'Automatically abstain from all governance votes',
      },
    };
  }
  
  if (drepId === SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE) {
    return {
      drep_id: SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE,
      hex: '',
      has_script: false,
      registered: true,
      active: true,
      metadata: {
        name: 'Always No Confidence',
        bio: 'Automatically vote no confidence on all governance proposals',
      },
    };
  }
  
  return null;
}

/**
 * Clear the metadata cache
 */
export function clearMetadataCache(): void {
  metadataCache.clear();
}

