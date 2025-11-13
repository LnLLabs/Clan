import React, { useMemo, useState, useEffect } from 'react';
import { Assets, MetadataProvider } from '@clan/framework-core';
import { TokenElement } from '../token/TokenElement';
import { useMetadataProvider } from '@clan/framework-providers';
import { getTokenInfo, TokenInfo, decodeAssetName } from '@clan/framework-helpers';

export interface TokenDropdownListProps {
  balances: Assets;
  onTokenSelect: (tokenId: string) => void;
  excludeTokens?: string[];
  placeholder?: string;
  className?: string;
  metadataProvider?: MetadataProvider;
}

export const TokenDropdownList: React.FC<TokenDropdownListProps> = ({
  balances,
  onTokenSelect,
  excludeTokens = [],
  placeholder = 'Search',
  className = '',
  metadataProvider
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hovering, setHovering] = useState('');
  const [tokenMetadataMap, setTokenMetadataMap] = useState<Record<string, TokenInfo | null>>({});
  const [hasMetadata, setHasMetadata] = useState(false);

  const metadataProviderFromContext = useMetadataProvider();
  const effectiveMetadataProvider = metadataProvider ?? metadataProviderFromContext;

  useEffect(() => {
    let isMounted = true;

    const tokenIds = Object.keys(balances)
      .filter(tokenId => tokenId !== 'lovelace')
      .filter(tokenId => !excludeTokens.includes(tokenId));

    if (tokenIds.length === 0) {
      setTokenMetadataMap({});
      setHasMetadata(false);
      return;
    }

    const fetchMetadata = async () => {
      const entries = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const info = await getTokenInfo(tokenId, effectiveMetadataProvider);
            return [tokenId, info ?? null] as [string, TokenInfo | null];
          } catch (error) {
            console.warn(`Failed to fetch metadata for ${tokenId}:`, error);
            return [tokenId, null] as [string, TokenInfo | null];
          }
        })
      );

      if (!isMounted) {
        return;
      }

      const metadataDetected = entries.some(([, info]) => info?.provider === 'metadata-provider');
      const metadataMap: Record<string, TokenInfo | null> = {};
      entries.forEach(([tokenId, info]) => {
        metadataMap[tokenId] = info;
      });

      setTokenMetadataMap(metadataMap);
      setHasMetadata(metadataDetected);
    };

    fetchMetadata().catch((error) => {
      console.error('Failed to load token metadata:', error);
      if (isMounted) {
        setTokenMetadataMap({});
        setHasMetadata(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [balances, effectiveMetadataProvider, excludeTokens]);

  const handleClick = (tokenId: string) => {
    onTokenSelect(tokenId);
    setIsOpen(false);
    setSearch('');
  };

  const filteredTokens = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return Object.keys(balances)
      .filter(tokenId => tokenId !== 'lovelace')
      .filter(tokenId => !excludeTokens.includes(tokenId))
      .filter(tokenId => {
        if (!searchLower) return true;
        const metadata = tokenMetadataMap[tokenId];
        const displayName = metadata?.name || metadata?.ticker || decodeAssetName(tokenId);
        const ticker = metadata?.ticker || '';

        return (
          tokenId.toLowerCase().includes(searchLower) ||
          displayName.toLowerCase().includes(searchLower) ||
          ticker.toLowerCase().includes(searchLower)
        );
      });
  }, [balances, excludeTokens, search, tokenMetadataMap]);

  const fungibleTokens = useMemo(() => {
    if (!hasMetadata) {
      return filteredTokens;
    }

    return filteredTokens.filter(tokenId => {
      const metadata = tokenMetadataMap[tokenId];
      return metadata?.isNft !== true;
    });
  }, [filteredTokens, hasMetadata, tokenMetadataMap]);

  const nftTokens = useMemo(() => {
    if (!hasMetadata) {
      return [];
    }

    return filteredTokens.filter(tokenId => tokenMetadataMap[tokenId]?.isNft === true);
  }, [filteredTokens, hasMetadata, tokenMetadataMap]);

  const renderToken = (tokenId: string, index: number) => (
    <div
      key={`${tokenId}-${index}`}
      onClick={() => handleClick(tokenId)}
      className="token-list-item"
    >
      <TokenElement
        tokenId={tokenId}
        amount={Number(balances[tokenId])}
        className="dropdown-token-element"
        expanded={false}
        metadataProvider={effectiveMetadataProvider}
      />
    </div>
  );

  const renderTokenGroup = (label: string, tokens: string[]) => {
    if (tokens.length === 0) return null;
    return (
      <>
        <div className="token-group-header">{label}</div>
        {tokens.map((tokenId, index) => renderToken(tokenId, index))}
      </>
    );
  };

  return (
    <div className={`token-list-wrapper ${className}`}>
      <div
        onMouseEnter={() => setHovering('addToken')}
        onMouseLeave={() => setHovering('')}
        onClick={() => setIsOpen(!isOpen)}
        className="icon-wrapper token-icon-button"
      >
        <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {hovering === 'addToken' && (
          <label className="icon-label">Add Token</label>
        )}
        <br />
      </div>

      {isOpen && (
        <div className="token-dropdown-menu">
          <div className="token-search">
            <input
              type="text"
              value={search}
              placeholder={placeholder}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="token-list">
            {filteredTokens.length === 0 ? (
              <div className="no-tokens">
                {search ? 'No tokens found' : 'No tokens available'}
              </div>
            ) : (
              hasMetadata
                ? (
                  <>
                    {renderTokenGroup('Fungible Tokens', fungibleTokens)}
                    {renderTokenGroup('NFTs', nftTokens)}
                  </>
                )
                : filteredTokens.map((tokenId, index) => renderToken(tokenId, index))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDropdownList;

