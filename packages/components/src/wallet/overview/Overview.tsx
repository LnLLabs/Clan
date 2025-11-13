import React, { useState, useEffect } from 'react';
import { WalletInterface, Assets, MetadataProvider } from '@clan/framework-core';
import { useMetadataProvider } from '@clan/framework-providers';
import { getTokenInfo, getNFTDisplayInfo, TokenInfo } from '@clan/framework-helpers';
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
}

const useOverviewTokenInfo = (
  tokenId: string,
  metadataProvider?: MetadataProvider
): { tokenInfo: TokenInfo | null; loading: boolean } => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTokenInfo = async () => {
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
  }, [tokenId, metadataProvider]);

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

const TokenRow: React.FC<TokenRowProps> = ({ tokenId, amount, totalValue, onClick, metadataProvider }) => {
  const { tokenInfo, loading } = useOverviewTokenInfo(tokenId, metadataProvider);
  
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
        <TokenElement
          tokenId={tokenId}
          amount={amount}
          metadataProvider={metadataProvider}
          className="overview-token-chip"
        />
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
}

const NFTItem: React.FC<NFTItemProps> = ({ tokenId, onClick, metadataProvider }) => {
  const { tokenInfo, loading } = useOverviewTokenInfo(tokenId, metadataProvider);
  
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

  const visibleTokens = filteredTokens.slice(0, visibleCount);
  const hasMore = filteredTokens.length > visibleCount;

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

