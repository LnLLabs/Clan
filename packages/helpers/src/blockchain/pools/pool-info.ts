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
 * Extended pool information with performance metrics
 */
export interface PoolInfoExtended extends PoolInfo {
  live_stake?: string;
  active_stake?: string;
  live_saturation?: number;
  live_delegators?: number;
  block_count?: number;
  roa?: number; // Return on ADA (lifetime ROI)
}

/**
 * Sample pool data for development (CORS fallback)
 * In production, fetch from backend API or use CORS proxy
 */
const SAMPLE_POOLS: Record<string, PoolInfoExtended> = {
  'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy': {
    pool_id_bech32: 'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy',
    pool_id_hex: '0dc2484c8cc54e7e79e8cf46c7a4fef3ced1b8deea02a37e6d25aa5f',
    active_epoch_no: 404,
    vrf_key_hash: '5e3f75fbe3e99b07b24c8e61dd6883f8a56e1f2e2adc11e7f85c1f7f',
    margin: 0.02,
    fixed_cost: '340000000',
    pledge: '100000000000',
    reward_addr: 'stake1u9ylzsgxaa6xctf4juup682ar3juj85n8tx3hthnljg47zqgxy2gx',
    owners: [],
    relays: [],
    meta_json: {
      name: 'BLOOM Pool',
      description: 'Sustainable Cardano Staking',
      ticker: 'BLOOM',
      homepage: 'https://www.bloompool.io',
      extended: ''
    },
    live_saturation: 0.42,
    live_stake: '28000000000000',
    active_stake: '28000000000000',
    live_delegators: 1230,
    block_count: 5420,
    roa: 4.2
  },
  'pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvyfa000rahe0mvd6': {
    pool_id_bech32: 'pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvyfa000rahe0mvd6',
    pool_id_hex: '1a475d8f8a9c73d3d54a675c8c3c7e01c5a7e3f3f07400ee0f766fa',
    active_epoch_no: 404,
    vrf_key_hash: '6e2f85fce4e99b08b34c9e71ed7984f9a56e1f3e3adc11e7f95c2f8f',
    margin: 0.019,
    fixed_cost: '340000000',
    pledge: '50000000000',
    reward_addr: 'stake1uy8jyzxgxaa8xctf5kjup792ar4kvk96n9ty4hthnmjg58zqgxz3hy',
    owners: [],
    relays: [],
    meta_json: {
      name: 'ITZA Pool',
      description: 'Professional Cardano Staking',
      ticker: 'ITZA',
      homepage: 'https://www.itzapool.com',
      extended: ''
    },
    live_saturation: 0.38,
    live_stake: '25000000000000',
    active_stake: '25000000000000',
    live_delegators: 980,
    block_count: 4890,
    roa: 4.5
  },
  'pool1jcwn98a6rqr7a7yakanm5sz6asst3adu81e557rt72gv6gycnk2': {
    pool_id_bech32: 'pool1jcwn98a6rqr7a7yakanm5sz6asst3adu81e557rt72gv6gycnk2',
    pool_id_hex: '94e75ca3d4806fc7e1c7ad6f20da740d5dafd5fd1be35a1ff71c64ca',
    active_epoch_no: 404,
    vrf_key_hash: '7f3f95fde5e99b19c44c0e82fe8084gab56e1f4f4adc11e7fa5c3f9f',
    margin: 0.03,
    fixed_cost: '340000000',
    pledge: '200000000000',
    reward_addr: 'stake1ux9kzztgyxaa9xctf6lmup803ar5lwl07o0uz5iuiomkg68zrgya4iz',
    owners: [],
    relays: [],
    meta_json: {
      name: 'SPAIN Pool',
      description: 'Spanish Cardano Stake Pool',
      ticker: 'SPAIN',
      homepage: 'https://www.spainpool.com',
      extended: ''
    },
    live_saturation: 0.52,
    live_stake: '34000000000000',
    active_stake: '34000000000000',
    live_delegators: 1450,
    block_count: 6200,
    roa: 3.9
  },
  'pool1lzq2j46cq9r5fg6nt6qnq0vq5vgclp3lxw85ke06w9t0fgmrsp4': {
    pool_id_bech32: 'pool1lzq2j46cq9r5fg6nt6qnq0vq5vgclp3lxw85ke06w9t0fgmrsp4',
    pool_id_hex: 'fe01951eac184a9495ad80201e054cf8603fe79f5de2f5e3afe9df3d',
    active_epoch_no: 404,
    vrf_key_hash: '8g4fa6gef6e09b2ad54d1e93gf9195hbc67e1f5g5bec11e8fb6d4gag',
    margin: 0.025,
    fixed_cost: '340000000',
    pledge: '150000000000',
    reward_addr: 'stake1uya0lzzuhzxba0xcug7mnvp914ar6mxm18p1v6jvjpnlh78zshzb5ja',
    owners: [],
    relays: [],
    meta_json: {
      name: 'AZTEC Pool',
      description: 'Reliable Cardano Staking',
      ticker: 'AZTEC',
      homepage: 'https://www.aztecpool.com',
      extended: ''
    },
    live_saturation: 0.35,
    live_stake: '23000000000000',
    active_stake: '23000000000000',
    live_delegators: 850,
    block_count: 4320,
    roa: 4.3
  },
  'pool1qqq6qqa0hpzvumv5p87ynczfmdj557xuwlc3289ke42g72z7f74': {
    pool_id_bech32: 'pool1qqq6qqa0hpzvumv5p87ynczfmdj557xuwlc3289ke42g72z7f74',
    pool_id_hex: '0000d002f49ce606dcd8d8bf02183646a7db8d571c3d8ac400eaa03a',
    active_epoch_no: 404,
    vrf_key_hash: '9h5gb7hfg7f10c3be65e2fa4hga206icd78f2g6h6cfd22f9gc7e5hbh',
    margin: 0.02,
    fixed_cost: '340000000',
    pledge: '500000000000',
    reward_addr: 'stake1uzb1mz03hizxcb1yduh8noq025bs7nan29q2w7kvkqnmi88zsic6kc',
    owners: [],
    relays: [],
    meta_json: {
      name: 'ADACT Pool',
      description: 'Community Focused Pool',
      ticker: 'ADACT',
      homepage: 'https://www.adactpool.com',
      extended: ''
    },
    live_saturation: 0.28,
    live_stake: '18000000000000',
    active_stake: '18000000000000',
    live_delegators: 620,
    block_count: 3750,
    roa: 4.6
  },
  'pool1t5j2hnpcvavyp30v3vqrmgk6xqxz9h5m0ek88hjx8p87dykk5ct': {
    pool_id_bech32: 'pool1t5j2hnpcvavyp30v3vqrmgk6xqxz9h5m0ek88hjx8p87dykk5ct',
    pool_id_hex: '5d29d76c0f5d2862c366031df6d024c25e5e4f9e3cb6f61e737f8cd5',
    active_epoch_no: 404,
    vrf_key_hash: 'ai6hc8igh8g21d4cf76f3gb5ihb317jde89g3h7i7dgef33gahd8f6ici',
    margin: 0.03,
    fixed_cost: '340000000',
    pledge: '75000000000',
    reward_addr: 'stake1uxc2na14ijzydc2zevvi9opq136ct8obo30q3x8lwlrqnj98ztjd7ld',
    owners: [],
    relays: [],
    meta_json: {
      name: 'OTG Pool',
      description: 'Off The Grid Staking',
      ticker: 'OTG',
      homepage: 'https://www.otgpool.io',
      extended: ''
    },
    live_saturation: 0.45,
    live_stake: '29000000000000',
    active_stake: '29000000000000',
    live_delegators: 1100,
    block_count: 5100,
    roa: 4.1
  }
};

/**
 * Get comprehensive pool information with metrics from Koios API
 * Falls back to sample data due to CORS restrictions in browser
 * TODO: In production, proxy these requests through your backend
 */
export async function getPoolInfoExtended(poolId: string, network: string = 'mainnet'): Promise<PoolInfoExtended | null> {
  try {
    // CORS Issue: Direct calls to Koios API are blocked by CORS in browser
    // Using sample data for development. In production:
    // 1. Proxy through your backend API
    // 2. Use Blockfrost with API key
    // 3. Run your own Koios instance
    
    // Check if sample data is available
    if (SAMPLE_POOLS[poolId]) {
      return SAMPLE_POOLS[poolId];
    }

    // Try to fetch from API (will fail with CORS in browser)
    const apiUrl = network === 'mainnet'
      ? 'https://api.koios.rest/api/v1'
      : `https://${network}.koios.rest/api/v1`;

    const response = await fetch(`${apiUrl}/pool_info?_pool_bech32=${poolId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const poolData = data[0];
    
    // Transform Koios format to our format
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
      live_stake: poolData.live_stake,
      active_stake: poolData.active_stake,
      live_saturation: poolData.live_saturation,
      live_delegators: poolData.live_delegators,
      block_count: poolData.block_count,
      roa: poolData.pool_status ? parseFloat(poolData.pool_status) : undefined
    };
  } catch (error) {
    console.warn(`Failed to fetch extended pool info for ${poolId}:`, error);
    return null;
  }
}

/**
 * Get pool performance metrics
 */
export async function getPoolMetrics(poolId: string, network: string = 'mainnet'): Promise<{
  activeStake: string;
  liveStake: string;
  saturation: number;
  blocks: number;
  delegators: number;
  roa?: number;
} | null> {
  try {
    const poolInfo = await getPoolInfoExtended(poolId, network);
    
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
 * Get popular/top pools from cexplorer
 */
export async function getPopularPools(network: string = 'mainnet', limit: number = 10): Promise<string[]> {
  try {
    // For now, return a curated list of well-known pools
    // In production, you might want to fetch from a ranking API
    const popularPoolIds = [
      'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy', // BLOOM
      'pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvyfa000rahe0mvd6', // ITZA
      'pool1jcwn98a6rqr7a7yakanm5sz6asst3adu81e557rt72gv6gycnk2', // SPAIN
      'pool1lzq2j46cq9r5fg6nt6qnq0vq5vgclp3lxw85ke06w9t0fgmrsp4', // AZTEC
      'pool1qqq6qqa0hpzvumv5p87ynczfmdj557xuwlc3289ke42g72z7f74', // ADACT
      'pool1t5j2hnpcvavyp30v3vqrmgk6xqxz9h5m0ek88hjx8p87dykk5ct', // OTG
      'pool1hrqk3esvlxjkfktqh39cwjdwy8lka5fvqjdkjycg0qw7gzjsgha', // DIGI
    ];

    return popularPoolIds.slice(0, limit);
  } catch (error) {
    console.warn('Failed to fetch popular pools:', error);
    return [];
  }
}

