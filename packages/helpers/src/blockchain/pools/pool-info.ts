/**
 * Staking pool information utilities
 * Based on the original BroClanWallet PoolInfo implementation
 */

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
    extended: string;
  };
  retiring_epoch?: number;
}

/**
 * Get information about a staking pool
 */
export async function getPoolInfo(poolId: string, network: string = 'mainnet'): Promise<PoolInfo | null> {
  try {
    // Use a public API endpoint for pool information
    // This is a simplified version - in production you'd use Koios, Blockfrost, etc.
    const networkPrefix = network === 'mainnet' ? '' : `${network}-`;
    const url = `https://${networkPrefix}js.cexplorer.io/api-static/pool/${poolId}.json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.warn(`Failed to fetch pool info for ${poolId}:`, error);
    return null;
  }
}

/**
 * Get multiple pools information
 */
export async function getPoolsInfo(poolIds: string[], network: string = 'mainnet'): Promise<Record<string, PoolInfo | null>> {
  const results: Record<string, PoolInfo | null> = {};

  // Fetch pools in parallel with a concurrency limit
  const concurrencyLimit = 5;
  for (let i = 0; i < poolIds.length; i += concurrencyLimit) {
    const batch = poolIds.slice(i, i + concurrencyLimit);
    const promises = batch.map(poolId => getPoolInfo(poolId, network));

    try {
      const batchResults = await Promise.all(promises);
      batch.forEach((poolId, index) => {
        results[poolId] = batchResults[index];
      });
    } catch (error) {
      console.warn('Error fetching batch of pool info:', error);
      // Continue with other batches
    }
  }

  return results;
}

/**
 * Search for staking pools by ticker or pool ID
 */
export async function searchPools(query: string, network: string = 'mainnet'): Promise<string[]> {
  try {
    // Use Koios API for pool search
    const apiUrl = network === 'mainnet'
      ? 'https://api.koios.rest/api/v1/pool_list'
      : `https://${network}.koios.rest/api/v1/pool_list`;

    // Search by ticker
    const tickerResponse = await fetch(
      `${apiUrl}?ticker=like.${query}*`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          // Note: In production, you'd want to handle API keys properly
        }
      }
    );

    // Search by pool ID
    const idResponse = await fetch(
      `${apiUrl}?pool_id_bech32=like.${query}*`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        }
      }
    );

    const [tickerData, idData] = await Promise.all([
      tickerResponse.json(),
      idResponse.json()
    ]);

    // Combine results and return unique pool IDs
    const allPools = [...(tickerData || []), ...(idData || [])];
    const uniquePoolIds = [...new Set(
      allPools
        .filter((pool: any) => pool && pool.pool_id_bech32)
        .map((pool: any) => pool.pool_id_bech32)
        .slice(0, 10) // Limit to 10 results
    )];

    return uniquePoolIds;
  } catch (error) {
    console.warn('Failed to search pools:', error);
    // Return the original query as a fallback
    return [query];
  }
}

/**
 * Validate if a string is a valid pool ID
 */
export function isValidPoolId(poolId: string): boolean {
  // Basic validation for Cardano pool IDs
  // Pool IDs are typically 56-64 characters long and contain only hex characters
  const poolIdRegex = /^[a-z0-9]{56,64}$/;
  return poolIdRegex.test(poolId.toLowerCase());
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
 * Get pool performance metrics (simplified)
 */
export async function getPoolMetrics(poolId: string, network: string = 'mainnet'): Promise<{
  activeStake: string;
  liveStake: string;
  saturation: number;
  blocks: number;
  delegators: number;
} | null> {
  try {
    // This would integrate with a pool metrics API
    // For now, return placeholder data
    return {
      activeStake: '0',
      liveStake: '0',
      saturation: 0,
      blocks: 0,
      delegators: 0
    };
  } catch (error) {
    console.warn('Failed to fetch pool metrics:', error);
    return null;
  }
}
