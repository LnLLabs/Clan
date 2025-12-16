/**
 * Staking pool information utilities
 * Uses Koios API for pool data and extended metadata for logos
 */

/**
 * Koios configuration for API calls
 */
export interface KoiosApiConfig {
  url?: string;
  apiKey?: string;
  network?: string;
}

/**
 * Base Koios passthrough URL
 */
export const KOIOS_PASSTHROUGH_BASE_URL = 'https://koios.keypact.io';

/**
 * Normalize network name (remove "cardano" prefix, etc.)
 */
function normalizeNetwork(network: string): string {
  return network.toLowerCase().replace(/cardano[-_\s]*/gi, '').trim() || 'mainnet';
}

/**
 * Get Koios base URL for a network
 * Returns base URL without query parameters (network is added in koiosFetch)
 */
export function getKoiosApiUrl(network: string, config?: KoiosApiConfig): string {
  // If custom URL is provided, use that
  if (config?.url) return config.url;
  // Return base URL - network parameter will be added when constructing the full URL
  return KOIOS_PASSTHROUGH_BASE_URL;
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
    console.log('[Koios] Using API key:', config.apiKey.substring(0, 20) + '...');
  } else {
    console.log('[Koios] No API key provided');
  }

  console.log('[Koios] Using network:', normalizedNetwork, 'Fetching:', fullUrl);
  return fetch(fullUrl, {
    ...options,
    headers,
  });
}

export interface PoolInfo {
  pool_id_bech32: string;
  pool_id_hex: string;
  active_epoch_no: number;
  vrf_key_hash: string;
  margin: number;
  fixed_cost: string;
  pledge: string;
  reward_addr: string;
  owners: string[];
  relays: any[];
  meta_url?: string;
  meta_hash?: string;
  meta_json?: {
    name: string;
    description: string;
    ticker: string;
    homepage: string;
    extended?: string;
    icon?: string; // Base64 encoded PNG per CIP-0006
  };
  retiring_epoch?: number;
}

/**
 * Extended pool information with performance metrics and logo
 */
export interface PoolInfoExtended extends PoolInfo {
  live_stake?: string;
  active_stake?: string;
  live_saturation?: number;
  live_delegators?: number;
  block_count?: number;
  roa?: number; // Return on ADA (lifetime ROI)
  logo?: string; // Pool logo URL from extended metadata
}

// Logo cache to avoid repeated requests
const logoCache = new Map<string, string | null>();

/**
 * Sanitize and validate a logo URL for safe use in <img> tags
 * Returns null if the URL is invalid or potentially dangerous
 */
export function sanitizeLogoUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Allow data URIs (base64 images)
  if (url.startsWith('data:image/')) {
    return url;
  }
  
  try {
    const parsed = new URL(url);
    
    // Only allow HTTPS URLs for security
    if (parsed.protocol !== 'https:') {
      return null;
    }
    
    // Basic validation - URL looks reasonable
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return null;
    }
    
    return url;
  } catch {
    // Invalid URL
    return null;
  }
}

/**
 * Silently fetch JSON - returns null on any error (including CORS)
 * Used for fetching external metadata where CORS failures are expected
 */
async function silentFetchJson(url: string): Promise<any | null> {
  try {
    const response = await fetch(url, {
      headers: { 'accept': 'application/json' },
      // Short timeout to not block UI
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    // Silently ignore CORS errors and other failures
    return null;
  }
}

/**
 * Extract logo URL from extended metadata object
 * Handles various common formats used by pool operators
 */
function extractLogoFromExtendedMetadata(data: any): string | null {
  if (!data) return null;
  
  // Common locations for logo URL in extended metadata
  const logoUrl = 
    data?.info?.url_png_icon_64x64 ||
    data?.info?.url_png_logo ||
    data?.info?.logo ||
    data?.logo ||
    data?.image ||
    data?.icon;
  
  return sanitizeLogoUrl(logoUrl);
}

/**
 * Get pool logo URL for use in <img> tags
 * 
 * Tries multiple sources in order:
 * 1. meta_json.icon (base64 from Koios - always works)
 * 2. meta_url -> extended -> logo URL (may fail due to CORS on some servers)
 * 
 * Returns a sanitized URL safe for use in <img src="...">
 * The <img> tag itself is not subject to CORS, only fetch() is.
 */
export async function getPoolLogo(
  poolId: string,
  poolInfo?: PoolInfo | null,
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig
): Promise<string | null> {
  if (!poolId) return null;
  
  const cacheKey = `${poolId}`;
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) || null;
  }

  try {
    let info = poolInfo;
    
    // If no pool info provided, fetch from Koios
    if (!info) {
      info = await getPoolInfo(poolId, network, koiosConfig);
    }
    
    if (!info) {
      logoCache.set(cacheKey, null);
      return null;
    }

    // 1. Check if meta_json has icon (base64 per CIP-0006)
    // This always works - no CORS issues
    if (info.meta_json?.icon) {
      const icon = info.meta_json.icon;
      const logoUrl = icon.startsWith('data:') 
        ? icon 
        : `data:image/png;base64,${icon}`;
      logoCache.set(cacheKey, logoUrl);
      return logoUrl;
    }

    // 2. Try fetching meta_url to get extended metadata URL
    // This may fail due to CORS on some servers - that's expected
    if (info.meta_url) {
      const metaData = await silentFetchJson(info.meta_url);
      
      if (metaData) {
        // Check for icon directly in metadata
        if (metaData.icon) {
          const logoUrl = metaData.icon.startsWith('data:') || metaData.icon.startsWith('http')
            ? sanitizeLogoUrl(metaData.icon)
            : `data:image/png;base64,${metaData.icon}`;
          if (logoUrl) {
            logoCache.set(cacheKey, logoUrl);
            return logoUrl;
          }
        }
        
        // 3. Try fetching extended metadata for logo URL
        if (metaData.extended) {
          const extData = await silentFetchJson(metaData.extended);
          const logoUrl = extractLogoFromExtendedMetadata(extData);
          if (logoUrl) {
            logoCache.set(cacheKey, logoUrl);
            return logoUrl;
          }
        }
      }
    }

    logoCache.set(cacheKey, null);
    return null;
  } catch {
    // Silently handle any unexpected errors
    logoCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Get information about a staking pool from Koios
 */
export async function getPoolInfo(
  poolId: string,
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig
): Promise<PoolInfo | null> {
  try {
    const response = await koiosFetch(
      `/pool_info`,
      network,
      koiosConfig,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _pool_bech32_ids: [poolId] }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const poolData = data[0];
    return {
      pool_id_bech32: poolData.pool_id_bech32,
      pool_id_hex: poolData.pool_id_hex,
      active_epoch_no: poolData.active_epoch_no,
      vrf_key_hash: poolData.vrf_key_hash,
      margin: poolData.margin,
      fixed_cost: poolData.fixed_cost,
      pledge: poolData.pledge,
      reward_addr: poolData.reward_addr,
      owners: poolData.owners || [],
      relays: poolData.relays || [],
      meta_url: poolData.meta_url,
      meta_hash: poolData.meta_hash,
      meta_json: poolData.meta_json,
      retiring_epoch: poolData.retiring_epoch,
    };
  } catch (error) {
    console.warn(`Failed to fetch pool info for ${poolId}:`, error);
    return null;
  }
}

/**
 * Get multiple pools information from Koios
 */
export async function getPoolsInfo(
  poolIds: string[],
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig
): Promise<Record<string, PoolInfo | null>> {
  const results: Record<string, PoolInfo | null> = {};

  if (poolIds.length === 0) return results;

  try {
    const response = await koiosFetch(
      `/pool_info`,
      network,
      koiosConfig,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _pool_bech32_ids: poolIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      poolIds.forEach(id => results[id] = null);
      return results;
    }

    // Initialize all as null
    poolIds.forEach(id => results[id] = null);

    // Fill in found pools
    data.forEach((poolData: any) => {
      if (poolData?.pool_id_bech32) {
        results[poolData.pool_id_bech32] = {
          pool_id_bech32: poolData.pool_id_bech32,
          pool_id_hex: poolData.pool_id_hex,
          active_epoch_no: poolData.active_epoch_no,
          vrf_key_hash: poolData.vrf_key_hash,
          margin: poolData.margin,
          fixed_cost: poolData.fixed_cost,
          pledge: poolData.pledge,
          reward_addr: poolData.reward_addr,
          owners: poolData.owners || [],
          relays: poolData.relays || [],
          meta_url: poolData.meta_url,
          meta_hash: poolData.meta_hash,
          meta_json: poolData.meta_json,
          retiring_epoch: poolData.retiring_epoch,
        };
      }
    });

    return results;
  } catch (error) {
    console.warn('Error fetching batch of pool info:', error);
    poolIds.forEach(id => results[id] = null);
    return results;
  }
}

/**
 * Search for staking pools by ticker or pool ID using Koios
 */
export async function searchPools(
  query: string,
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig
): Promise<string[]> {
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

    // Search by ticker (case-insensitive with ilike)
    const tickerPromise = fetch(
      `${baseUrl}/pool_list?ticker=ilike.*${query}*&network=${networkParam}`,
      { headers }
    );

    // If query looks like a pool ID (starts with "pool1"), also search by ID
    let idPromise: Promise<Response> | null = null;
    if (query.startsWith('pool1') || query.length > 10) {
      idPromise = fetch(
        `${baseUrl}/pool_list?pool_id_bech32=ilike.*${query}*&network=${networkParam}`,
        { headers }
      );
    }

    const responses = await Promise.all([
      tickerPromise,
      idPromise || Promise.resolve(null),
    ]);

    const results: any[] = [];
    
    for (const response of responses) {
      if (response && response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          results.push(...data);
        }
      }
    }

    // Combine results and return unique pool IDs
    const uniquePoolIds = [...new Set(
      results
        .filter((pool: any) => pool && pool.pool_id_bech32)
        .map((pool: any) => pool.pool_id_bech32)
    )].slice(0, 20); // Limit to 20 results

    return uniquePoolIds;
  } catch (error) {
    console.warn('Failed to search pools:', error);
    return [];
  }
}

/**
 * Validate if a string is a valid pool ID
 */
export function isValidPoolId(poolId: string): boolean {
  // Bech32 pool IDs start with "pool1" and are typically 56 characters
  if (poolId.startsWith('pool1') && poolId.length >= 50 && poolId.length <= 64) {
    return /^pool1[a-z0-9]+$/.test(poolId);
  }
  // Hex pool IDs are 56 characters
  if (poolId.length === 56) {
    return /^[a-f0-9]+$/i.test(poolId);
  }
  return false;
}

/**
 * Format pool information for display
 */
export function formatPoolInfo(poolInfo: PoolInfo): {
  id: string;
  name: string;
  ticker: string;
  description: string;
  isRetiring: boolean;
  retiringEpoch?: number;
} {
  return {
    id: poolInfo.pool_id_bech32,
    name: poolInfo.meta_json?.name || poolInfo.pool_id_bech32.slice(0, 12) + '...',
    ticker: poolInfo.meta_json?.ticker || 'N/A',
    description: poolInfo.meta_json?.description || 'No description available',
    isRetiring: poolInfo.retiring_epoch !== undefined,
    retiringEpoch: poolInfo.retiring_epoch
  };
}

/**
 * Get comprehensive pool information with metrics from Koios API
 * Includes pool logo from extended metadata if available
 */
export async function getPoolInfoExtended(
  poolId: string,
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig
): Promise<PoolInfoExtended | null> {
  try {
    const response = await koiosFetch(
      `/pool_info`,
      network,
      koiosConfig,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _pool_bech32_ids: [poolId] }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const poolData = data[0];
    
    // Build pool info object first
    const poolInfo: PoolInfo = {
      pool_id_bech32: poolData.pool_id_bech32,
      pool_id_hex: poolData.pool_id_hex,
      active_epoch_no: poolData.active_epoch_no,
      vrf_key_hash: poolData.vrf_key_hash,
      margin: poolData.margin,
      fixed_cost: poolData.fixed_cost,
      pledge: poolData.pledge,
      reward_addr: poolData.reward_addr,
      owners: poolData.owners || [],
      relays: poolData.relays || [],
      meta_url: poolData.meta_url,
      meta_hash: poolData.meta_hash,
      meta_json: poolData.meta_json,
      retiring_epoch: poolData.retiring_epoch,
    };
    
    // Try to fetch logo (tries meta_json.icon, then fetches meta_url for extended metadata)
    const logo = (await getPoolLogo(
      poolData.pool_id_bech32,
      poolInfo,
      network,
      koiosConfig
    )) || undefined;

    return {
      ...poolInfo,
      live_stake: poolData.live_stake,
      active_stake: poolData.active_stake,
      live_saturation: poolData.live_saturation,
      live_delegators: poolData.live_delegators,
      block_count: poolData.block_count,
      roa: typeof poolData.pool_roa === 'number' ? poolData.pool_roa : 
           typeof poolData.roa === 'number' ? poolData.roa : 
           typeof poolData.ros === 'number' ? poolData.ros : undefined,
      logo,
    };
  } catch (error) {
    console.warn(`Failed to fetch extended pool info for ${poolId}:`, error);
    return null;
  }
}

/**
 * Get pool performance metrics
 */
export async function getPoolMetrics(
  poolId: string,
  network: string = 'mainnet',
  koiosConfig?: KoiosApiConfig
): Promise<{
  activeStake: string;
  liveStake: string;
  saturation: number;
  blocks: number;
  delegators: number;
  roa?: number;
} | null> {
  try {
    const poolInfo = await getPoolInfoExtended(poolId, network, koiosConfig);
    
    if (!poolInfo) return null;

    return {
      activeStake: poolInfo.active_stake || '0',
      liveStake: poolInfo.live_stake || '0',
      saturation: poolInfo.live_saturation || 0,
      blocks: poolInfo.block_count || 0,
      delegators: poolInfo.live_delegators || 0,
      roa: poolInfo.roa
    };
  } catch (error) {
    console.warn('Failed to fetch pool metrics:', error);
    return null;
  }
}

/**
 * Get popular/top pools by stake from Koios
 */
export async function getPopularPools(
  network: string = 'mainnet',
  limit: number = 10,
  koiosConfig?: KoiosApiConfig
): Promise<string[]> {
  try {
    // First get a list of registered pools
    const listResponse = await koiosFetch(
      `/pool_list?pool_status=eq.registered&limit=${limit * 2}`,
      network,
      koiosConfig
    );

    if (!listResponse.ok) {
      throw new Error(`HTTP error! status: ${listResponse.status}`);
    }

    const pools = await listResponse.json();
    
    if (!pools || !Array.isArray(pools) || pools.length === 0) {
      return [];
    }

    const poolIds = pools
      .filter((p: any) => p?.pool_id_bech32)
      .map((p: any) => p.pool_id_bech32);

    // Get detailed info to sort by stake
    const infoResponse = await koiosFetch(
      `/pool_info`,
      network,
      koiosConfig,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _pool_bech32_ids: poolIds }),
      }
    );

    if (!infoResponse.ok) {
      return poolIds.slice(0, limit);
    }

    const poolInfo = await infoResponse.json();
    
    // Sort by active_stake descending
    return poolInfo
      .filter((p: any) => p?.pool_id_bech32)
      .sort((a: any, b: any) => {
        const stakeA = parseInt(a.active_stake || '0');
        const stakeB = parseInt(b.active_stake || '0');
        return stakeB - stakeA;
      })
      .map((p: any) => p.pool_id_bech32)
      .slice(0, limit);
  } catch (error) {
    console.warn('Failed to fetch popular pools:', error);
    return [];
  }
}

/**
 * Clear the logo cache
 */
export function clearLogoCache(): void {
  logoCache.clear();
}
