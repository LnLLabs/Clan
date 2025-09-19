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
export declare function getPoolInfo(poolId: string, network?: string): Promise<PoolInfo | null>;
/**
 * Get multiple pools information
 */
export declare function getPoolsInfo(poolIds: string[], network?: string): Promise<Record<string, PoolInfo | null>>;
/**
 * Search for staking pools by ticker or pool ID
 */
export declare function searchPools(query: string, network?: string): Promise<string[]>;
/**
 * Validate if a string is a valid pool ID
 */
export declare function isValidPoolId(poolId: string): boolean;
/**
 * Format pool information for display
 */
export declare function formatPoolInfo(poolInfo: PoolInfo): {
    id: string;
    name: string;
    ticker: string;
    description: string;
    isRetiring: boolean;
    retiringEpoch?: number;
};
/**
 * Get pool performance metrics (simplified)
 */
export declare function getPoolMetrics(poolId: string, network?: string): Promise<{
    activeStake: string;
    liveStake: string;
    saturation: number;
    blocks: number;
    delegators: number;
} | null>;
//# sourceMappingURL=pool-info.d.ts.map