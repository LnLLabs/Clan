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

const decodeHexToAscii = (hex: string): string => {
  try {
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
      return hex;
    }

    let output = '';
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.substring(i, i + 2), 16);
      if (!Number.isNaN(byte)) {
        output += String.fromCharCode(byte);
      }
    }

    const cleaned = output.replace(/\x00+$/g, '').trim();
    return cleaned || hex;
  } catch {
    return hex;
  }
};

const DEFAULT_TICKER = 'TOKEN';

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
  const [tooltipDirection, setTooltipDirection] = React.useState<'up' | 'down'>('down');
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  // Generate placeholder color from tokenId (must be before any early returns)
  const placeholderColor = React.useMemo(() => {
    const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const index = tokenId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }, [tokenId]);

  const { policyId, assetHex } = React.useMemo(() => {
    if (tokenId === 'lovelace' || tokenId.length <= 56) {
      return { policyId: tokenId, assetHex: '' };
    }
    return {
      policyId: tokenId.slice(0, 56),
      assetHex: tokenId.slice(56)
    };
  }, [tokenId]);

  const displayInfo = React.useMemo(() => {
    const decodedHexName = assetHex ? decodeHexToAscii(assetHex) : '';
    const fallbackName =
      tokenInfo?.name ||
      (decodedHexName && decodedHexName !== assetHex ? decodedHexName : tokenId.slice(-8));

    const tickerSource = tokenInfo?.ticker || decodedHexName || fallbackName || DEFAULT_TICKER;
    const normalizedTicker = tickerSource.trim() || DEFAULT_TICKER;

    return {
      name: fallbackName,
      ticker: normalizedTicker.slice(0, 12).toUpperCase()
    };
  }, [tokenInfo, assetHex, tokenId]);

  React.useEffect(() => {
    if (!(showTooltip || expanded)) {
      return;
    }

    const tooltipEl = tooltipRef.current;
    if (!tooltipEl) {
      return;
    }

    const frame =
      typeof window !== 'undefined'
        ? window.requestAnimationFrame(() => {
            const rect = tooltipEl.getBoundingClientRect();
            const viewportHeight =
              window.innerHeight ||
              (typeof document !== 'undefined' ? document.documentElement.clientHeight : 0) ||
              (typeof document !== 'undefined' ? document.body.clientHeight : 0);
            const spaceBelow = viewportHeight ? viewportHeight - rect.bottom : 0;
            const spaceAbove = rect.top;

            if (spaceBelow < 24 && spaceAbove > spaceBelow) {
              setTooltipDirection('up');
            } else {
              setTooltipDirection('down');
            }
          })
        : null;

    return () => {
      if (frame !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [showTooltip, expanded, tokenInfo, displayInfo]);

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
      <div className="token-tooltip-row token-tooltip-title">
        <span>{displayInfo.name}</span>
      </div>
      <div className="token-tooltip-row">
        <span className="token-tooltip-label">Ticker</span>
        <span className="token-tooltip-value">{displayInfo.ticker}</span>
      </div>
      <div className="token-tooltip-row">
        <span className="token-tooltip-label">Policy ID</span>
        <span className="token-tooltip-value token-tooltip-mono">{policyId}</span>
      </div>
      <div className="token-tooltip-row">
        <span className="token-tooltip-label">Asset (hex)</span>
        <span className="token-tooltip-value token-tooltip-mono">{assetHex || '—'}</span>
      </div>
      <div className="token-tooltip-row">
        <span className="token-tooltip-label">Decimals</span>
        <span className="token-tooltip-value">{tokenInfo?.decimals ?? '—'}</span>
      </div>
      {tokenInfo?.fingerprint && (
        <div className="token-tooltip-row">
          <span className="token-tooltip-label">Fingerprint</span>
          <span className="token-tooltip-value token-tooltip-mono">{tokenInfo.fingerprint}</span>
        </div>
      )}
      <div className="token-tooltip-row token-tooltip-link">
        <a
          href={`https://cexplorer.io/asset/${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on CExplorer
        </a>
      </div>
    </div>
  );

  const isLongName = displayInfo.name.length > 20;
  const isPositiveAmount = amount > 0;
  const placeholderInitial = displayInfo.ticker.charAt(0).toUpperCase();
  
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
                {displayInfo.name}
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
          <div
            className={`token-element-tooltip token-element-tooltip--${tooltipDirection}`}
            style={{ position: 'absolute', zIndex: 1000, pointerEvents: 'none' }}
            ref={tooltipRef}
          >
            {tooltipInfo}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenElement;

