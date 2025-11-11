import React from 'react';
import { MetadataProvider } from '@clan/framework-core';
import { getTokenInfo, TokenInfo } from '@clan/framework-helpers';

export interface TokenElementProps {
  tokenId: string;
  amount: number;
  filter?: 'FTs' | 'NFTs';
  search?: string;
  className?: string;
  expanded?: boolean;
  index?: number;
  onClick?: (tokenId: string) => void;
  onImageClick?: (tokenId: string) => void;
  metadataProvider?: MetadataProvider;
}

export const TokenElement: React.FC<TokenElementProps> = ({
  tokenId,
  amount,
  filter,
  search,
  className = '',
  expanded = false,
  index,
  onClick,
  onImageClick,
  metadataProvider
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tokenInfo, setTokenInfo] = React.useState<TokenInfo | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [imageError, setImageError] = React.useState(false);

  // Generate placeholder color from tokenId (must be before any early returns)
  const placeholderColor = React.useMemo(() => {
    const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const index = tokenId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }, [tokenId]);

  React.useEffect(() => {
    let isMounted = true;

    const fetchTokenInfo = async () => {
      try {
        setLoading(true);
        setError(undefined);
        
        const info = await getTokenInfo(tokenId, metadataProvider);
        
        if (isMounted) {
          setTokenInfo(info);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch token info'));
          setLoading(false);
        }
      }
    };

    fetchTokenInfo();

    return () => {
      isMounted = false;
    };
  }, [tokenId, metadataProvider]);

  const handleThumbnailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageClick?.(tokenId);
  };

  const handleClick = () => {
    onClick?.(tokenId);
  };

  // Search filter
  if (search && search.trim() !== '') {
    const searchLower = search.toLowerCase();
    const tokenIdMatch = tokenId.toLowerCase().includes(searchLower);
    const nameMatch = tokenInfo?.name?.toLowerCase().includes(searchLower);
    const fingerprintMatch = tokenInfo?.fingerprint?.toLowerCase().includes(searchLower);

    if (!tokenIdMatch && !nameMatch && !fingerprintMatch) {
      return null;
    }
  }

  // Filter by type
  if (filter === 'NFTs' && tokenInfo && !tokenInfo.isNft) {
    return null;
  } else if (filter === 'FTs' && tokenInfo && tokenInfo.isNft) {
    return null;
  }

  if (loading) {
    return (
      <div className={`token-element-loading ${className}`}>
        <div className="token-thumbnail-skeleton" />
        <div className="token-info-skeleton">
          <div className="token-name-skeleton" />
          <div className="token-amount-skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`token-element-error ${className}`}>
        <span>Error loading token info</span>
      </div>
    );
  }

  const displayAmount = tokenInfo?.decimals
    ? amount / Math.pow(10, tokenInfo.decimals)
    : amount;

  const tooltipInfo = (
    <div className="token-tooltip">
      <span>
        <a href={`https://cexplorer.io/asset/${tokenId}`} target="_blank" rel="noopener noreferrer">
          {tokenId}
        </a>
        <br />
      </span>
      <span>{tokenInfo?.fingerprint}</span>
    </div>
  );

  const isLongName = tokenInfo?.name && tokenInfo.name.length > 20;
  const isPositiveAmount = amount > 0;
  const placeholderInitial = (tokenInfo?.name || tokenId).charAt(0).toUpperCase();
  
  // Format amount with sign for display
  const formattedAmount = isPositiveAmount 
    ? `+${Math.abs(displayAmount).toLocaleString()}`
    : `-${Math.abs(displayAmount).toLocaleString()}`;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={className} key={index}>
      <div
        className="token-element-wrapper"
        style={{ position: 'relative' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="token-element" onClick={handleClick}>
          {!imageError && tokenInfo?.image ? (
            <img
              className="token-thumbnail"
              src={tokenInfo.image}
              alt={tokenInfo?.name || 'Token'}
              onClick={handleThumbnailClick}
              onError={handleImageError}
            />
          ) : (
            <div 
              className="token-thumbnail token-placeholder"
              style={{ backgroundColor: placeholderColor }}
              onClick={handleThumbnailClick}
            >
              {placeholderInitial}
            </div>
          )}
          <div className="token-element-text">
            <div className={isLongName ? 'scroll-container' : ''}>
              <span className="token-element-name">
                {tokenInfo?.name || tokenId.slice(-8)}
              </span>
            </div>
            {!tokenInfo?.isNft && (
              <span className={`token-element-amount ${isPositiveAmount ? 'positive' : 'negative'}`}>
                {formattedAmount}
              </span>
            )}
          </div>
        </div>
        {(showTooltip || expanded) && (
          <div className="token-element-tooltip" style={{ position: 'absolute', zIndex: 1000, pointerEvents: 'none' }}>
            {tooltipInfo}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenElement;

