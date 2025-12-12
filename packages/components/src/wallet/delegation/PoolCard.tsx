import React from 'react';

export interface PoolDisplayInfo {
  type: 'pool';
  id: string;
  name: string;
  ticker: string;
  pledge: number;
  margin: number;
  cost: number;
  lifetimeROI: number;
  saturation: number;
  logo?: string;
  isRetiring?: boolean;
  retiringEpoch?: number;
}

export interface PoolCardProps {
  pool: PoolDisplayInfo;
  isSelected?: boolean;
  isCurrent?: boolean;
  onClick?: () => void;
  className?: string;
}

const formatADA = (amount: number): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toLocaleString();
};

export const PoolCard: React.FC<PoolCardProps> = ({
  pool,
  isSelected = false,
  isCurrent = false,
  onClick,
  className = '',
}) => {
  const cardClasses = [
    'pool-card',
    isSelected && 'selected',
    isCurrent && !isSelected && 'current',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="pool-card-header">
        <div className="pool-card-icon">
          {pool.logo ? (
            <img src={pool.logo} alt={pool.name} />
          ) : (
            '🏊'
          )}
        </div>
        <div className="pool-card-info">
          <div className="pool-card-name">{pool.name}</div>
          <div className="pool-card-ticker">[{pool.ticker}]</div>
        </div>
        <div className="pool-card-badges">
          {isCurrent && <span className="delegation-badge current">Current</span>}
          {isSelected && !isCurrent && <span className="delegation-badge selected">Selected</span>}
        </div>
      </div>

      <div className="pool-card-stats">
        <div className="pool-card-stat">
          <span className="pool-card-stat-label">Pledge</span>
          <span className="pool-card-stat-value">{formatADA(pool.pledge)} ₳</span>
        </div>
        <div className="pool-card-stat">
          <span className="pool-card-stat-label">Margin</span>
          <span className="pool-card-stat-value">{pool.margin.toFixed(2)}%</span>
        </div>
        <div className="pool-card-stat">
          <span className="pool-card-stat-label">Saturation</span>
          <span className="pool-card-stat-value">{pool.saturation.toFixed(1)}%</span>
        </div>
        <div className="pool-card-stat">
          <span className="pool-card-stat-label">ROI</span>
          <span className="pool-card-stat-value">{pool.lifetimeROI.toFixed(2)}%</span>
        </div>
      </div>

    
    </div>
  );
};

export default PoolCard;

