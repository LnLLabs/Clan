import React, { useState, useEffect } from 'react';
import { WalletInterface, Assets } from '@clan/framework-core';
import { TokenElement } from '../token/TokenElement';
import { AddressSelect } from '../AddressSelect';
import { useTokenInfo } from '@clan/framework-helpers';

export interface OverviewProps {
  wallet: WalletInterface;
  selectedAddress?: string;
  onAddressChange?: (address: string) => void;
  onTokenClick?: (tokenId: string) => void;
  onSetDefaultAddress?: (address: string) => void;
  onChangeAddressName?: (address: string, name: string) => void;
  className?: string;
}

// Helper function to decode hex asset name from token ID
const decodeAssetName = (tokenId: string): string => {
  // If it's just "lovelace", return "ADA"
  if (tokenId === 'lovelace') return 'ADA';
  
  // Determine the hex portion to decode
  let hexName: string;
  
  // Check if tokenId has the full format: policyId (56 chars) + hexEncodedName
  if (tokenId.length > 56) {
    hexName = tokenId.slice(56);
  } else {
    // Otherwise, treat the entire tokenId as the hex name
    hexName = tokenId;
  }
  
  if (!hexName) return tokenId;
  
  try {
    // Check if it's valid hex
    if (!/^[0-9a-fA-F]+$/.test(hexName)) return hexName;
    
    // Decode hex to string
    const decoded = hexName.match(/.{1,2}/g)
      ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
      .join('') || '';
    
    // Remove trailing null bytes and trim
    const cleaned = decoded.replace(/\x00+$/g, '').trim();
    
    // Return decoded if it's printable ASCII, otherwise return the original hex
    if (cleaned && /^[\x20-\x7E]+$/.test(cleaned)) {
      return cleaned;
    }
    
    // If not printable, return the hex as-is
    return hexName;
  } catch {
    return hexName;
  }
};

// Helper component for token row
interface TokenRowProps {
  tokenId: string;
  amount: number;
  totalValue: number;
  onClick: () => void;
}

const TokenRow: React.FC<TokenRowProps> = ({ tokenId, amount, totalValue, onClick }) => {
  const { tokenInfo, loading } = useTokenInfo(tokenId);
  
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
  
  // Mock USD value calculation (you'll need real price data)
  // Use raw amount for portfolio calculation to match totalValue calculation
  const usdValue = displayAmount * 0.627; // Mock price for display
  const rawUsdValue = amount * 0.627; // Use raw amount for percentage calculation
  const portfolioPercentage = (rawUsdValue / totalValue) * 100;

  // Decode asset name if metadata not available, and clean null bytes
  const rawName = tokenInfo?.name || decodeAssetName(tokenId);
  const decodedName = rawName.replace(/\x00+$/g, '').trim();
  const rawTicker = tokenInfo?.ticker || decodedName;
  const displayTicker = rawTicker.replace(/\x00+$/g, '').trim();
  
  // Generate placeholder with initials from ticker or decoded name
  const getPlaceholder = () => {
    const text = displayTicker;
    const initials = text.slice(0, 4).toUpperCase();
    const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const colorIndex = tokenId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div 
        className="overview-token-placeholder" 
        style={{ backgroundColor: colors[colorIndex] }}
      >
        {initials}
      </div>
    );
  };

  const hasImage = tokenInfo?.image && tokenInfo.image !== '/assets/token.svg';

  return (
    <div className="overview-token-row" onClick={onClick}>
      <div className="overview-token-asset">
        {hasImage ? (
          <>
            <img 
              className="overview-token-icon" 
              src={tokenInfo.image} 
              alt={decodedName}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.parentElement?.querySelector('.overview-token-placeholder');
                if (placeholder) {
                  placeholder.classList.remove('hidden');
                }
              }}
            />
            <div className="overview-token-placeholder hidden" style={{ backgroundColor: '#8b5cf6' }}>
              {displayTicker.slice(0, 4).toUpperCase()}
            </div>
          </>
        ) : (
          getPlaceholder()
        )}
        <div className="overview-token-info">
          <div className="overview-token-ticker">{displayTicker}</div>
          <div className="overview-token-name">{decodedName}</div>
        </div>
      </div>
      <div className="overview-token-quantity">
        {displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="overview-token-value">
        ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="overview-token-portfolio">
        <span className="overview-portfolio-percentage">
          {portfolioPercentage.toFixed(1)}%
        </span>
        <div className="overview-portfolio-bar">
          <div 
            className="overview-portfolio-fill" 
            style={{ width: `${Math.min(portfolioPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Helper component for NFT grid item
interface NFTItemProps {
  tokenId: string;
  onClick: () => void;
}

const NFTItem: React.FC<NFTItemProps> = ({ tokenId, onClick }) => {
  const { tokenInfo, loading } = useTokenInfo(tokenId);
  
  if (loading) {
    return (
      <div className="overview-nft-item loading">
        <div className="overview-nft-image-skeleton" />
        <div className="overview-nft-name-skeleton" />
      </div>
    );
  }

  // Decode asset name if metadata not available, and clean null bytes
  const rawName = !tokenInfo?.name ? decodeAssetName(tokenId) : tokenInfo.name;
  const decodedName = rawName.replace(/\x00+$/g, '').trim();

  const getPlaceholderNFT = () => {
    const text = decodedName;
    const initials = text.slice(0, 3).toUpperCase();
    const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#a855f7'];
    const colorIndex = tokenId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div 
        className="overview-nft-placeholder" 
        style={{ backgroundColor: colors[colorIndex] }}
      >
        {initials}
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
  className = ''
}) => {
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
  };

  const handleSeeMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  // Calculate total portfolio value (mock)
  const totalValue = Object.values(balance).reduce((sum, amount) => sum + Number(amount) * 0.627, 0);

  // Filter and sort tokens based on search and portfolio %
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
      
      // Sort by portfolio percentage (descending)
      const valueA = Number(balance[a]) * 0.627;
      const valueB = Number(balance[b]) * 0.627;
      const percentA = (valueA / totalValue) * 100;
      const percentB = (valueB / totalValue) * 100;
      
      return percentB - percentA;
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

