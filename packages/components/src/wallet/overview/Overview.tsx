import React, { useState, useEffect } from 'react';
import { WalletInterface, Assets, MetadataProvider } from '@clan/framework-core';
import { useMetadataProvider } from '@clan/framework-providers';
import { getTokenInfo, getNFTDisplayInfo, TokenInfo } from '@clan/framework-helpers';
import { CardanoLogo } from '../../assets';
import { TokenElement } from '../token/TokenElement';

export interface OverviewProps {
  wallet: WalletInterface;
  selectedAddress?: string;
  onAddressChange?: (address: string) => void;
  onTokenClick?: (tokenId: string) => void;
  onSetDefaultAddress?: (address: string) => void;
  onChangeAddressName?: (address: string, name: string) => void;
  metadataProvider?: MetadataProvider;
  className?: string;
}

// Helper component for token row
interface TokenRowProps {
  tokenId: string;
  amount: number;
  totalValue: number;
  onClick: () => void;
  metadataProvider?: MetadataProvider;
  prefetchedTokenInfo?: TokenInfo | null;
}

const useOverviewTokenInfo = (
  tokenId: string,
  metadataProvider?: MetadataProvider,
  initialTokenInfo?: TokenInfo | null
): { tokenInfo: TokenInfo | null; loading: boolean } => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(initialTokenInfo ?? null);
  const [loading, setLoading] = useState<boolean>(initialTokenInfo === undefined);

  useEffect(() => {
    let isMounted = true;

    const fetchTokenInfo = async () => {
      if (initialTokenInfo !== undefined) {
        setTokenInfo(initialTokenInfo);
        setLoading(false);
        return;
      }

      if (!tokenId) {
        if (isMounted) {
          setTokenInfo(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const info = await getTokenInfo(tokenId, metadataProvider);
        if (isMounted) {
          setTokenInfo(info ?? null);
        }
      } catch {
        if (isMounted) {
          setTokenInfo(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTokenInfo();

    return () => {
      isMounted = false;
    };
  }, [tokenId, metadataProvider, initialTokenInfo]);

  return { tokenInfo, loading };
};

const splitTokenId = (tokenId: string): { policyId: string; assetName: string } => {
  if (!tokenId || tokenId === 'lovelace') {
    return { policyId: '', assetName: '' };
  }

  if (tokenId.length <= 56) {
    return { policyId: tokenId, assetName: '' };
  }

  return {
    policyId: tokenId.slice(0, 56),
    assetName: tokenId.slice(56)
  };
};

const TokenRow: React.FC<TokenRowProps> = ({ tokenId, amount, totalValue, onClick, metadataProvider, prefetchedTokenInfo }) => {
  const { tokenInfo, loading } = useOverviewTokenInfo(tokenId, metadataProvider, prefetchedTokenInfo);
  const isAdaToken = tokenId === 'lovelace' || tokenId === 'ADA';
  
  if (loading) {
    return (
      <div className="overview-token-row loading">
        <div className="overview-token-asset">
          <div className="overview-token-icon-skeleton" />
          <div className="overview-token-info">
            <div className="overview-token-name-skeleton" />
            <div className="overview-token-ticker-skeleton" />
          </div>
        </div>
        <div className="overview-token-quantity">...</div>
        <div className="overview-token-value">...</div>
        <div className="overview-token-portfolio">...</div>
      </div>
    );
  }

  const displayAmount = tokenInfo?.decimals
    ? amount / Math.pow(10, tokenInfo.decimals)
    : amount;
  
  // Calculate USD value if price is available
  const usdValue = 0;
  const rawUsdValue = 0;
  const portfolioPercentage = (rawUsdValue && totalValue > 0) 
    ? (rawUsdValue / totalValue) * 100 
    : null;

  return (
    <div className="overview-token-row" onClick={onClick}>
      <div className="overview-token-asset">
        {isAdaToken ? (
          <div className="overview-token-chip overview-ada-chip">
            <div className="overview-token-icon ada">
              <CardanoLogo className="cardano-logo" />
            </div>
            <div className="overview-token-info">
              <span className="overview-token-ticker">ADA</span>
              <span className="overview-token-name">Cardano</span>
            </div>
          </div>
        ) : (
          <TokenElement
            tokenId={tokenId}
            amount={amount}
            metadataProvider={metadataProvider}
            className="overview-token-chip"
          />
        )}
      </div>
      <div className="overview-token-quantity">
        {displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="overview-token-value">
        {usdValue !== null 
          ? `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '—'
        }
      </div>
      <div className="overview-token-portfolio">
        <span className="overview-portfolio-percentage">
          {portfolioPercentage !== null ? `${portfolioPercentage.toFixed(1)}%` : '—'}
        </span>
        {portfolioPercentage !== null && (
          <div className="overview-portfolio-bar">
            <div 
              className="overview-portfolio-fill" 
              style={{ width: `${Math.min(portfolioPercentage, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for NFT grid item
interface NFTItemProps {
  tokenId: string;
  onClick: () => void;
  metadataProvider?: MetadataProvider;
  prefetchedTokenInfo?: TokenInfo | null;
}

const NFTItem: React.FC<NFTItemProps> = ({ tokenId, onClick, metadataProvider, prefetchedTokenInfo }) => {
  const { tokenInfo, loading } = useOverviewTokenInfo(tokenId, metadataProvider, prefetchedTokenInfo);
  
  if (loading) {
    return (
      <div className="overview-nft-item loading">
        <div className="overview-nft-image-skeleton" />
        <div className="overview-nft-name-skeleton" />
      </div>
    );
  }

  // Get display information using helper
  const { decodedName, placeholderColor, placeholderInitials } = getNFTDisplayInfo(tokenId, tokenInfo);

  const getPlaceholderNFT = () => {
    return (
      <div 
        className="overview-nft-placeholder" 
        style={{ backgroundColor: placeholderColor }}
      >
        {placeholderInitials}
      </div>
    );
  };

  const hasImage = tokenInfo?.image && tokenInfo.image !== '/assets/token.svg';

  const placeholderElement = getPlaceholderNFT();
  
  return (
    <div className="overview-nft-item" onClick={onClick}>
      {hasImage ? (
        <>
          <img 
            className="overview-nft-image" 
            src={tokenInfo.image} 
            alt={decodedName}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const placeholder = e.currentTarget.parentElement?.querySelector('.overview-nft-placeholder');
              if (placeholder) {
                placeholder.classList.remove('hidden');
              }
            }}
          />
          <div className="overview-nft-placeholder hidden" style={{ backgroundColor: placeholderElement.props.style.backgroundColor }}>
            {placeholderElement.props.children}
          </div>
        </>
      ) : (
        placeholderElement
      )}
      <div className="overview-nft-name">{decodedName}</div>
    </div>
  );
};

export const Overview: React.FC<OverviewProps> = ({
  wallet,
  selectedAddress: initialSelectedAddress,
  onAddressChange,
  onTokenClick,
  onSetDefaultAddress,
  onChangeAddressName,
  metadataProvider,
  className = ''
}) => {
  const metadataProviderFromContext = useMetadataProvider();
  const effectiveMetadataProvider = metadataProvider ?? metadataProviderFromContext;
  const [selectedAddress, setSelectedAddress] = useState(initialSelectedAddress || '');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [fundedAddresses, setFundedAddresses] = useState<string[]>([]);
  const [filter, setFilter] = useState<'Tokens' | 'NFTs'>('Tokens');
  const [search, setSearch] = useState('');
  const [balance, setBalance] = useState<Assets>({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [tokenMetadataMap, setTokenMetadataMap] = useState<Record<string, TokenInfo | null>>({});

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        if (wallet.getDefaultAddress && !initialSelectedAddress) {
          const defaultAddr = await wallet.getDefaultAddress();
          setDefaultAddress(defaultAddr);
          setSelectedAddress(defaultAddr);
        }

        if (wallet.getFundedAddress) {
          const addresses = await wallet.getFundedAddress();
          setFundedAddresses(addresses);
        }

        const bal = await wallet.getBalance();
        setBalance(bal);
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      }
    };

    loadWalletData();
  }, [wallet, initialSelectedAddress]);

  useEffect(() => {
    let isMounted = true;
    const tokenIds = Object.keys(balance);

    if (tokenIds.length === 0) {
      setTokenMetadataMap({});
      return () => {
        isMounted = false;
      };
    }

    setTokenMetadataMap(prev => {
      const next: Record<string, TokenInfo | null> = {};
      tokenIds.forEach(tokenId => {
        if (Object.prototype.hasOwnProperty.call(prev, tokenId)) {
          next[tokenId] = prev[tokenId];
        } else {
          next[tokenId] = null;
        }
      });
      return next;
    });

    const fetchMetadata = async () => {
      try {
        const entries = await Promise.all(
          tokenIds.map(async tokenId => {
            try {
              const info = await getTokenInfo(tokenId, effectiveMetadataProvider);
              return [tokenId, info ?? null] as const;
            } catch {
              return [tokenId, null] as const;
            }
          })
        );

        if (!isMounted) {
          return;
        }

        const metadataMap = new Map(entries);

        setTokenMetadataMap(prev => {
          const next: Record<string, TokenInfo | null> = {};
          tokenIds.forEach(tokenId => {
            if (metadataMap.has(tokenId)) {
              next[tokenId] = metadataMap.get(tokenId) ?? null;
            } else if (Object.prototype.hasOwnProperty.call(prev, tokenId)) {
              next[tokenId] = prev[tokenId];
            } else {
              next[tokenId] = null;
            }
          });
          return next;
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setTokenMetadataMap(() => {
          const fallback: Record<string, TokenInfo | null> = {};
          tokenIds.forEach(tokenId => {
            fallback[tokenId] = null;
          });
          return fallback;
        });
      }
    };

    fetchMetadata();

    return () => {
      isMounted = false;
    };
  }, [balance, effectiveMetadataProvider]);

  const handleAddressChange = (address: string) => {
    setSelectedAddress(address);
    onAddressChange?.(address);
  };

  const handleTokenClick = (tokenId: string) => {
    onTokenClick?.(tokenId);

    if (!tokenId || tokenId === 'lovelace' || tokenId === 'ADA') {
      return;
    }

    const { policyId, assetName } = splitTokenId(tokenId);
    const explorerBaseUrl = 'https://cexplorer.io';
    const tokenLink = assetName && assetName !== ''
      ? `${explorerBaseUrl}/asset/${policyId}${assetName}`
      : `${explorerBaseUrl}/policy/${policyId}`;

    if (tokenLink && typeof window !== 'undefined') {
      window.open(tokenLink, '_blank', 'noopener');
    }
  };

  const handleSeeMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  // Calculate total portfolio value
  // V1: totalValue is 0 since we have no prices
  // Future: Will calculate based on actual token prices
  const totalValue = 0;

  // Filter and sort tokens based on search
  const filteredTokens = Object.keys(balance)
    .filter(tokenId => {
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        if (!tokenId.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      // Always keep ADA (lovelace) first
      if (a === 'lovelace' || a === 'ADA') return -1;
      if (b === 'lovelace' || b === 'ADA') return 1;
      
      // V1: Sort by amount since we don't have prices yet
      // Future: Sort by portfolio percentage when prices are available
      return Number(balance[b]) - Number(balance[a]);
    });

  const typeFilteredTokens = filteredTokens.filter(tokenId => {
    const metadata = tokenMetadataMap[tokenId];

    if (filter === 'NFTs') {
      if (tokenId === 'lovelace' || tokenId === 'ADA') {
        return false;
      }

      if (!metadata) {
        return false;
      }

      return metadata.provider === 'metadata-provider' && !!metadata.isNft;
    }

    if (tokenId === 'lovelace' || tokenId === 'ADA') {
      return true;
    }

    if (metadata && metadata.provider === 'metadata-provider') {
      return !metadata.isNft;
    }

    return true;
  });

  const visibleTokens = typeFilteredTokens.slice(0, visibleCount);
  const hasMore = typeFilteredTokens.length > visibleCount;

  return (
    <div className={`overview-container ${className}`}>
      <div className="overview-search-container">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="overview-search-input"
        />
      </div>

      <div className="overview-tabs-container">
        <button
          className={`overview-tab-button ${filter === 'Tokens' ? 'active' : ''}`}
          onClick={() => setFilter('Tokens')}
        >
          Tokens
        </button>
        <button
          className={`overview-tab-button ${filter === 'NFTs' ? 'active' : ''}`}
          onClick={() => setFilter('NFTs')}
        >
          NFTs
        </button>
      </div>

      {filter === 'Tokens' ? (
        <div className="overview-tokens-card">
          <div className="overview-table-header">
            <div className="overview-header-asset">Asset</div>
            <div className="overview-header-quantity">Quantity</div>
            <div className="overview-header-value">Value $</div>
            <div className="overview-header-portfolio">Portfolio %</div>
          </div>
          
          <div className="overview-table-body">
            {visibleTokens.length === 0 ? (
              <div className="overview-empty-state">No tokens found</div>
            ) : (
              visibleTokens.map((tokenId, index) => (
                <TokenRow
                  key={`${tokenId}-${index}`}
                  tokenId={tokenId}
                  amount={Number(balance[tokenId])}
                  totalValue={totalValue}
                  onClick={() => handleTokenClick(tokenId)}
                  metadataProvider={effectiveMetadataProvider}
                  prefetchedTokenInfo={tokenMetadataMap[tokenId]}
                />
              ))
            )}
          </div>

          {hasMore && (
            <button className="overview-see-more-button" onClick={handleSeeMore}>
              See More
            </button>
          )}
        </div>
      ) : (
        <div className="overview-nfts-card">
          <div className="overview-nfts-grid">
            {visibleTokens.length === 0 ? (
              <div className="overview-empty-state">No NFTs found</div>
            ) : (
              visibleTokens.map((tokenId, index) => (
                <NFTItem
                  key={`${tokenId}-${index}`}
                  tokenId={tokenId}
                  onClick={() => handleTokenClick(tokenId)}
                  metadataProvider={effectiveMetadataProvider}
                  prefetchedTokenInfo={tokenMetadataMap[tokenId]}
                />
              ))
            )}
          </div>
          
          {hasMore && (
            <button className="overview-see-more-button" onClick={handleSeeMore}>
              See More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Overview;

