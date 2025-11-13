/**
 * React hook for fetching token information using the injected MetadataProvider
 */

import { useState, useEffect, useCallback } from 'react';
import { getTokenInfo, TokenInfo } from '@clan/framework-helpers';
import { useMetadataProvider } from '../MetadataProviderContext';

export interface UseTokenInfoResult {
  tokenInfo: TokenInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for getting token information with the injected MetadataProvider
 * 
 * Usage:
 * ```tsx
 * const { tokenInfo, loading, error } = useTokenInfo(tokenId);
 * ```
 */
export function useTokenInfo(tokenId: string): UseTokenInfoResult {
  const metadataProvider = useMetadataProvider();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenInfo = useCallback(async () => {
    if (!tokenId) return;

    setLoading(true);
    setError(null);

    try {
      const info = await getTokenInfo(tokenId, metadataProvider);
      setTokenInfo(info || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token info');
    } finally {
      setLoading(false);
    }
  }, [tokenId, metadataProvider]);

  useEffect(() => {
    fetchTokenInfo();
  }, [fetchTokenInfo]);

  return {
    tokenInfo,
    loading,
    error,
    refetch: fetchTokenInfo
  };
}




