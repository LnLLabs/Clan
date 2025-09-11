import React, { useState } from 'react';
import { PoolInfo } from '@broclan/framework-helpers';
import { Button } from '../../ui/buttons/Button';

export interface PoolElementProps {
  pool: PoolInfo;
  onDelegate?: (poolId: string) => void;
  onViewDetails?: (poolId: string) => void;
  isSelected?: boolean;
  showDelegateButton?: boolean;
  showDetailsButton?: boolean;
  compact?: boolean;
  className?: string;
}

export const PoolElement: React.FC<PoolElementProps> = ({
  pool,
  onDelegate,
  onViewDetails,
  isSelected = false,
  showDelegateButton = true,
  showDetailsButton = true,
  compact = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format pool information for display
  const formatPoolName = (pool: PoolInfo): string => {
    return pool.meta_json?.name || pool.pool_id_bech32.slice(0, 12) + '...';
  };

  const formatTicker = (pool: PoolInfo): string => {
    return pool.meta_json?.ticker || 'N/A';
  };

  const formatDescription = (pool: PoolInfo): string => {
    return pool.meta_json?.description || 'No description available';
  };

  const formatFixedCost = (cost: string): string => {
    return (parseFloat(cost) / 1000000).toFixed(6) + ' ₳';
  };

  const formatPledge = (pledge: string): string => {
    return (parseFloat(pledge) / 1000000000).toFixed(2) + ' ₳';
  };

  // Mock data for additional metrics (would come from pool metrics API)
  const getSaturation = (): number => {
    return Math.floor(Math.random() * 100);
  };

  const getPerformance = (): number => {
    return Math.floor(Math.random() * 100);
  };

  const getBlocksProduced = (): number => {
    return Math.floor(Math.random() * 1000);
  };

  const getSaturationColor = (saturation: number): string => {
    if (saturation < 50) return 'saturation-low';
    if (saturation < 80) return 'saturation-medium';
    return 'saturation-high';
  };

  const getPerformanceColor = (performance: number): string => {
    if (performance < 60) return 'performance-low';
    if (performance < 85) return 'performance-medium';
    return 'performance-high';
  };

  const saturation = getSaturation();
  const performance = getPerformance();
  const blocksProduced = getBlocksProduced();

  if (compact) {
    return (
      <div className={`pool-element compact ${isSelected ? 'selected' : ''} ${className}`}>
        <div className="pool-header">
          <div className="pool-name">{formatPoolName(pool)}</div>
          <div className="pool-ticker">[{formatTicker(pool)}]</div>
        </div>

        <div className="pool-metrics">
          <div className="metric">
            <span className="label">Saturation:</span>
            <span className={`value ${getSaturationColor(saturation)}`}>
              {saturation}%
            </span>
          </div>

          <div className="metric">
            <span className="label">Performance:</span>
            <span className={`value ${getPerformanceColor(performance)}`}>
              {performance}%
            </span>
          </div>
        </div>

        <div className="pool-actions">
          {showDelegateButton && (
            <Button
              variant="primary"
              size="small"
              onClick={() => onDelegate?.(pool.pool_id_bech32)}
            >
              Delegate
            </Button>
          )}

          {showDetailsButton && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => onViewDetails?.(pool.pool_id_bech32)}
            >
              Details
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`pool-element ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''} ${className}`}>
      {/* Pool Header */}
      <div className="pool-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="pool-main-info">
          <div className="pool-name-section">
            <h3 className="pool-name">{formatPoolName(pool)}</h3>
            <span className="pool-ticker">[{formatTicker(pool)}]</span>
            {pool.retiring_epoch && (
              <span className="pool-retiring-badge">Retiring</span>
            )}
          </div>

          <div className="pool-expand-toggle">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>

        <div className="pool-quick-metrics">
          <div className="metric-item">
            <span className="metric-label">Saturation</span>
            <span className={`metric-value ${getSaturationColor(saturation)}`}>
              {saturation}%
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Performance</span>
            <span className={`metric-value ${getPerformanceColor(performance)}`}>
              {performance}%
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Blocks</span>
            <span className="metric-value">{blocksProduced}</span>
          </div>
        </div>
      </div>

      {/* Pool Details (Expanded) */}
      {isExpanded && (
        <div className="pool-details">
          {/* Description */}
          <div className="pool-description">
            <h4>Description</h4>
            <p>{formatDescription(pool)}</p>
            {pool.meta_json?.homepage && (
              <a
                href={pool.meta_json.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="pool-website"
              >
                Visit Website →
              </a>
            )}
          </div>

          {/* Pool Metrics */}
          <div className="pool-metrics-grid">
            <div className="metric-card">
              <h5>Saturation</h5>
              <div className="metric-visual">
                <div
                  className={`saturation-bar ${getSaturationColor(saturation)}`}
                  style={{ width: `${saturation}%` }}
                />
                <span className="metric-percentage">{saturation}%</span>
              </div>
            </div>

            <div className="metric-card">
              <h5>Performance</h5>
              <div className="metric-visual">
                <div
                  className={`performance-bar ${getPerformanceColor(performance)}`}
                  style={{ width: `${performance}%` }}
                />
                <span className="metric-percentage">{performance}%</span>
              </div>
            </div>

            <div className="metric-card">
              <h5>Blocks Produced</h5>
              <div className="metric-value-large">{blocksProduced}</div>
            </div>
          </div>

          {/* Pool Information */}
          <div className="pool-info-grid">
            <div className="info-item">
              <span className="info-label">Pool ID:</span>
              <span className="info-value pool-id">{pool.pool_id_bech32}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Fixed Cost:</span>
              <span className="info-value">{formatFixedCost(pool.fixed_cost)}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Pledge:</span>
              <span className="info-value">{formatPledge(pool.pledge)}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Margin:</span>
              <span className="info-value">{(pool.margin * 100).toFixed(2)}%</span>
            </div>

            <div className="info-item">
              <span className="info-label">Active Epoch:</span>
              <span className="info-value">{pool.active_epoch_no}</span>
            </div>

            {pool.retiring_epoch && (
              <div className="info-item">
                <span className="info-label">Retiring Epoch:</span>
                <span className="info-value retiring">{pool.retiring_epoch}</span>
              </div>
            )}
          </div>

          {/* Owners */}
          {pool.owners && pool.owners.length > 0 && (
            <div className="pool-owners">
              <h5>Pool Owners</h5>
              <div className="owners-list">
                {pool.owners.map((owner, index) => (
                  <span key={index} className="owner-address">
                    {owner.slice(0, 16)}...
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Relays */}
          {pool.relays && pool.relays.length > 0 && (
            <div className="pool-relays">
              <h5>Pool Relays</h5>
              <div className="relays-list">
                {pool.relays.slice(0, 3).map((relay, index) => (
                  <div key={index} className="relay-item">
                    {relay.ipv4 && <span className="relay-ip">{relay.ipv4}</span>}
                    {relay.ipv6 && <span className="relay-ip">{relay.ipv6}</span>}
                    {relay.port && <span className="relay-port">:{relay.port}</span>}
                  </div>
                ))}
                {pool.relays.length > 3 && (
                  <span className="more-relays">+{pool.relays.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pool Actions */}
      <div className="pool-actions">
        {showDelegateButton && (
          <Button
            variant="primary"
            onClick={() => onDelegate?.(pool.pool_id_bech32)}
            disabled={!!pool.retiring_epoch}
          >
            {pool.retiring_epoch ? 'Pool Retiring' : 'Delegate Stake'}
          </Button>
        )}

        {showDetailsButton && (
          <Button
            variant="secondary"
            onClick={() => onViewDetails?.(pool.pool_id_bech32)}
          >
            View Details
          </Button>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="selection-indicator">
          ✓ Selected
        </div>
      )}
    </div>
  );
};

export default PoolElement;
