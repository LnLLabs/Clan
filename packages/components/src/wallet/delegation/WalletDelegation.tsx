import React, { useState, useEffect } from 'react';
import { 
  searchPools, 
  getPoolInfoExtended, 
  formatPoolInfo, 
  getPopularPools,
  type PoolInfoExtended 
} from '@clan/framework-helpers';
import { Button } from '../../ui/buttons/Button';
import { Modal } from '../../ui/modals/Modal';

// Note: Import these from @clan/framework-react in parent component
// This component is UI-only, hooks should be used in parent
export interface DelegationInfo {
  stakeAddress: string;
  delegatedPool?: string;
  rewards: bigint;
  activeEpoch: number;
  nextRewardEpoch?: number;
}

export interface WalletDelegationProps {
  wallet: any; // WalletInterface
  delegationInfo?: DelegationInfo;
  onDelegate?: (poolId: string) => Promise<void>;
  onUndelegate?: () => Promise<void>;
  onWithdrawRewards?: () => Promise<void>;
  isDelegating?: boolean;
  isUndelegating?: boolean;
  isWithdrawing?: boolean;
  className?: string;
}

export interface PoolInfo {
  id: string;
  name: string;
  ticker: string;
  pledge: number;
  margin: number;
  cost: number;
  lifetimeROI: number;
  saturation: number;
  icon?: string;
}

export interface PoolOption {
  id: string;
  name: string;
  ticker: string;
  saturation: number;
  isRetiring: boolean;
  retiringEpoch?: number;
}

export const WalletDelegation: React.FC<WalletDelegationProps> = ({
  wallet,
  delegationInfo,
  onDelegate,
  onUndelegate,
  onWithdrawRewards,
  isDelegating = false,
  isUndelegating = false,
  isWithdrawing = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'delegate'>('status');
  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [filteredPools, setFilteredPools] = useState<PoolInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [filterOption, setFilterOption] = useState<string>('auto-abstain');

  // Load popular pools on component mount
  useEffect(() => {
    loadPopularPools();
  }, []);

  // Search pools when query changes
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredPools(pools);
      } else if (searchQuery.trim().length >= 3) {
        // Trigger search if 3+ characters
        handlePoolSearch(searchQuery);
      } else {
        // Filter local pools for shorter queries
        const filtered = pools.filter(pool =>
          pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pool.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pool.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredPools(filtered);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(searchTimer);
  }, [searchQuery, pools]);

  const convertPoolInfoToLocal = (poolInfo: PoolInfoExtended): PoolInfo => {
    return {
      id: poolInfo.pool_id_bech32,
      name: poolInfo.meta_json?.name || poolInfo.pool_id_bech32.slice(0, 12) + '...',
      ticker: poolInfo.meta_json?.ticker || 'N/A',
      pledge: parseInt(poolInfo.pledge) / 1_000_000, // Convert lovelace to ADA
      margin: poolInfo.margin * 100, // Convert to percentage
      cost: parseInt(poolInfo.fixed_cost) / 1_000_000, // Convert lovelace to ADA
      lifetimeROI: poolInfo.roa || 0,
      saturation: (poolInfo.live_saturation || 0) * 100, // Convert to percentage
      icon: '🏊' // Default icon - could be enhanced with actual pool icons
    };
  };

  const getNetworkName = () => {
    const networkName = wallet.getNetwork?.()?.name?.toLowerCase() || 'mainnet';
    // Clean up network name (remove "cardano" prefix and spaces)
    return networkName.replace(/cardano\s*/gi, '').trim();
  };

  const loadPopularPools = async () => {
    setIsSearching(true);
    try {
      const network = getNetworkName();
      
      // Fetch popular pools (always use mainnet for pool directory)
      const popularPoolIds = await getPopularPools('mainnet', 6);
      
      // Fetch detailed info for each pool (from mainnet as pool metadata is network-agnostic)
      const poolsData = await Promise.all(
        popularPoolIds.map(async (poolId: string) => {
          try {
            const poolInfo = await getPoolInfoExtended(poolId, 'mainnet');
            return poolInfo ? convertPoolInfoToLocal(poolInfo) : null;
          } catch (error) {
            console.warn(`Failed to load pool ${poolId}:`, error);
            return null;
          }
        })
      );

      // Filter out failed fetches
      const validPools = poolsData.filter((pool: PoolInfo | null): pool is PoolInfo => pool !== null);
      setPools(validPools);
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePoolSearch = async (query: string) => {
    if (query.trim().length < 3) return;

    setIsSearching(true);
    try {
      const network = getNetworkName();
      
      // Search for pools by ticker or ID (use wallet network for Koios query)
      const poolIds = await searchPools(query, network);
      
      if (poolIds.length === 0) {
        setFilteredPools([]);
        return;
      }

      // Fetch detailed info for found pools (use mainnet for pool metadata)
      const poolsData = await Promise.all(
        poolIds.slice(0, 10).map(async (poolId: string) => {
          try {
            const poolInfo = await getPoolInfoExtended(poolId, 'mainnet');
            return poolInfo ? convertPoolInfoToLocal(poolInfo) : null;
          } catch (error) {
            console.warn(`Failed to load pool ${poolId}:`, error);
            return null;
          }
        })
      );

      // Filter out failed fetches and update filtered pools
      const validPools = poolsData.filter((pool: PoolInfo | null): pool is PoolInfo => pool !== null);
      setFilteredPools(validPools);
    } catch (error) {
      console.error('Error searching pools:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelegate = async () => {
    if (!selectedPool || isDelegating || !onDelegate) return;

    try {
      await onDelegate(selectedPool);
      setSelectedPool('');
      setActiveTab('status');
    } catch (error) {
      console.error('Error delegating:', error);
    }
  };

  const handleUndelegate = async () => {
    if (isUndelegating || !onUndelegate) return;

    try {
      await onUndelegate();
    } catch (error) {
      console.error('Error undelegating:', error);
    }
  };

  const handleWithdrawRewards = async () => {
    if (isWithdrawing || !onWithdrawRewards || !delegationInfo?.rewards || delegationInfo.rewards <= 0n) return;

    try {
      await onWithdrawRewards();
    } catch (error) {
      console.error('Error withdrawing rewards:', error);
    }
  };

  const formatRewards = (rewards: bigint): string => {
    return (Number(rewards) / 1000000).toFixed(3);
  };

  const formatADA = (amount: number): string => {
    return amount.toLocaleString();
  };

  const currentPool = pools.find(pool => pool.id === delegationInfo?.delegatedPool);

  // Pool Card Component
  const PoolCard: React.FC<{ pool: PoolInfo; isSelected?: boolean; onClick?: () => void }> = ({ 
    pool, 
    isSelected = false,
    onClick 
  }) => (
    <div 
      className={`pool-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="pool-card-header">
        <div className="pool-icon">{pool.icon || '🏊'}</div>
        <div className="pool-name">{pool.name}</div>
      </div>
      <div className="pool-stats">
        <div className="pool-stat">
          <span className="stat-label">Pledge:</span>
          <span className="stat-value">{formatADA(pool.pledge)}</span>
        </div>
        <div className="pool-stat">
          <span className="stat-label">Margin:</span>
          <span className="stat-value">{pool.margin.toFixed(6)}%</span>
        </div>
        <div className="pool-stat">
          <span className="stat-label">Cost:</span>
          <span className="stat-value">{formatADA(pool.cost)}</span>
        </div>
        <div className="pool-stat">
          <span className="stat-label">Lifetime ROI:</span>
          <span className="stat-value">{pool.lifetimeROI.toFixed(2)}</span>
        </div>
        <div className="pool-stat">
          <span className="stat-label">Saturation:</span>
          <span className="stat-value">{pool.saturation.toFixed(6)}</span>
        </div>
      </div>
      <div className="pool-data-source">
        Pool data provided by <a href="https://cexplorer.io" target="_blank" rel="noopener noreferrer">Cexplorer.io</a>
      </div>
    </div>
  );

  return (
    <div className={`wallet-delegation ${className}`}>
      {/* Tabs */}
      <div className="delegation-tabs">
        <button
          className={`delegation-tab ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          Status
        </button>
        <button
          className={`delegation-tab ${activeTab === 'delegate' ? 'active' : ''}`}
          onClick={() => setActiveTab('delegate')}
        >
          Delegate
        </button>
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div className="delegation-status-view">
          <h1 className="delegation-title">Delegation</h1>
          
          <div className="delegation-content">
            <div className="delegation-left">
              <h3 className="section-label">Currently delegate to:</h3>
              
              {delegationInfo?.delegatedPool && currentPool ? (
                <PoolCard pool={currentPool} />
              ) : (
                <div className="no-delegation">
                  <p>No active delegation</p>
                </div>
              )}
            </div>
            
            <div className="delegation-right">
              <h3 className="section-label">Rewards Available:</h3>
              <div className="rewards-amount">
                {formatRewards(delegationInfo?.rewards || 0n)} ₳
              </div>
              {delegationInfo?.rewards !== undefined && delegationInfo.rewards > 0n && (
                <Button
                  variant="secondary"
                  onClick={handleWithdrawRewards}
                  disabled={isWithdrawing}
                  size="sm"
                >
                  {isWithdrawing ? 'Withdrawing...' : 'Withdraw Rewards'}
                </Button>
              )}
            </div>
          </div>

          <div className="delegation-actions">
            <Button
              variant="primary"
              onClick={handleUndelegate}
              disabled={isUndelegating || !delegationInfo?.delegatedPool}
            >
              {isUndelegating ? 'Undelegating...' : 'Undelegate'}
            </Button>
          </div>
        </div>
      )}

      {/* Delegate Tab */}
      {activeTab === 'delegate' && (
        <div className="delegation-delegate-view">
          <h1 className="delegation-title">Delegate</h1>
          
          <div className="delegation-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search for assets by name or policy"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pool-search-input"
              />
            </div>
            
            <div className="filter-container">
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="filter-select"
              >
                <option value="auto-abstain">Auto Abstain</option>
                <option value="auto-vote">Auto Vote</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="pools-grid">
            {filteredPools.map((pool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                isSelected={selectedPool === pool.id}
                onClick={() => setSelectedPool(pool.id)}
              />
            ))}
          </div>

          <div className="delegation-actions">
            <Button
              variant="primary"
              onClick={handleDelegate}
              disabled={!selectedPool || isDelegating}
            >
              {isDelegating ? 'Delegating...' : 'Delegate'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDelegation;

