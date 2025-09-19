import React from 'react';
import { useTokenInfo } from '@clan/framework-helpers';

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
  onImageClick
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const { tokenInfo, loading, error } = useTokenInfo(tokenId);

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

  return (
    <div className={className} key={index}>
      <div
        className="token-element-wrapper"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="token-element" onClick={handleClick}>
          <img
            className="token-thumbnail"
            src={tokenInfo?.image || '/assets/token.svg'}
            alt={tokenInfo?.name || 'Token'}
            onClick={handleThumbnailClick}
          />
          <div className="token-element-text">
            <div className={(tokenInfo?.name && tokenInfo.name.length > 20) ? 'scroll-container' : ''}>
              <span className="token-element-name">
                {tokenInfo?.name || tokenId.slice(-8)}
              </span>
            </div>
            {!tokenInfo?.isNft && (
              <span className={`token-element-amount ${amount > 0 ? 'positive' : 'negative'}`}>
                {displayAmount.toString()}
              </span>
            )}
          </div>
        </div>
        {(showTooltip || expanded) && (
          <div className="token-element-tooltip">
            {tooltipInfo}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenElement;

