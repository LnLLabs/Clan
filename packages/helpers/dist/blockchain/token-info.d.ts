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
/**
 * Hook for getting token information
 */
export declare function useTokenInfo(tokenId: string): {
    tokenInfo: TokenInfo | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};
/**
 * Get token information
 */
export declare function getTokenInfo(tokenId: string): Promise<TokenInfo>;
//# sourceMappingURL=token-info.d.ts.map