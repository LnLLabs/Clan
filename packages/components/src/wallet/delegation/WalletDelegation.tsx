import React, { useState, useEffect } from 'react';
import { searchPools, getPoolInfo, formatPoolInfo } from '@clan/framework-helpers';
import { Button } from '../../ui/buttons/Button';
import { Modal } from '../../ui/modals/Modal';

export interface DelegationInfo {
  stakeAddress: string;
  delegatedPool?: string;
  rewards: bigint;
  activeEpoch: number;
  nextRewardEpoch?: number;
}

export interface WalletDelegationProps {
  wallet: any; // WalletInterface
  delegationInfo: DelegationInfo;
  onDelegationChange?: (poolId: string) => Promise<void>;
  onRewardsWithdraw?: () => Promise<void>;
  className?: string;
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
  onDelegationChange,
  onRewardsWithdraw,
  className = ''
}) => {
  const [pools, setPools] = useState<PoolOption[]>([]);
  const [filteredPools, setFilteredPools] = useState<PoolOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDelegating, setIsDelegating] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showPoolSelector, setShowPoolSelector] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load popular pools on component mount
  useEffect(() => {
    loadPopularPools();
  }, []);

  // Filter pools based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPools(pools);
    } else {
      const filtered = pools.filter(pool =>
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPools(filtered);
    }
  }, [pools, searchQuery]);

  const loadPopularPools = async () => {
    setIsSearching(true);
    try {
      // Search for popular pools (this would be implemented with actual pool data)
      const popularPoolIds = [
        'pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvyfa000rahe0mvd6',
        'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lk5',
        'pool1jcwn98a6rqr7a7yakanm5sz6asst3adu81e557rt72gv6gycnk2'
      ];

      const poolDetails = await Promise.all(
        popularPoolIds.map(async (poolId) => {
          const info = await getPoolInfo(poolId);
          if (info) {
            return {
              ...formatPoolInfo(info),
              saturation: Math.random() * 100, // Mock saturation data
            } as PoolOption;
          }
          return null;
        })
      );

      setPools(poolDetails.filter(Boolean) as PoolOption[]);
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePoolSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 3) return;

    setIsSearching(true);
    try {
      const poolIds = await searchPools(query);
      if (poolIds.length > 0) {
        const poolDetails = await Promise.all(
          poolIds.slice(0, 10).map(async (poolId) => {
            const info = await getPoolInfo(poolId);
            if (info) {
              return {
                ...formatPoolInfo(info),
                saturation: Math.random() * 100, // Mock saturation data
              } as PoolOption;
            }
            return null;
          })
        );

        const validPools = poolDetails.filter(Boolean) as PoolOption[];
        setPools(validPools);
      }
    } catch (error) {
      console.error('Error searching pools:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelegate = async () => {
    if (!selectedPool || isDelegating) return;

    setIsDelegating(true);
    try {
      await onDelegationChange?.(selectedPool);
      setShowPoolSelector(false);
      setShowConfirmDialog(false);
      setSelectedPool('');
    } catch (error) {
      console.error('Error delegating:', error);
    } finally {
      setIsDelegating(false);
    }
  };

  const handleWithdrawRewards = async () => {
    if (isWithdrawing || delegationInfo.rewards <= 0n) return;

    setIsWithdrawing(true);
    try {
      await onRewardsWithdraw?.();
    } catch (error) {
      console.error('Error withdrawing rewards:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getSaturationColor = (saturation: number): string => {
    if (saturation < 50) return 'saturation-low';
    if (saturation < 80) return 'saturation-medium';
    return 'saturation-high';
  };

  const formatRewards = (rewards: bigint): string => {
    return (Number(rewards) / 1000000).toFixed(6);
  };

  const currentPool = pools.find(pool => pool.id === delegationInfo.delegatedPool);

  return (
    <div className={`wallet-delegation ${className}`}>
      <div className="delegation-header">
        <h2>Staking Delegation</h2>
      </div>

      {/* Current Delegation Status */}
      <div className="delegation-status">
        <h3>Current Delegation</h3>

        {delegationInfo.delegatedPool ? (
          <div className="current-pool">
            <div className="pool-info">
              <div className="pool-name">
                <span className="label">Pool:</span>
                <span className="value">
                  {currentPool ? currentPool.name : delegationInfo.delegatedPool.slice(0, 12) + '...'}
                </span>
              </div>
              <div className="pool-ticker">
                <span className="label">Ticker:</span>
                <span className="value">
                  {currentPool?.ticker || 'N/A'}
                </span>
              </div>
            </div>

            <div className="delegation-details">
              <div className="active-epoch">
                <span className="label">Active Epoch:</span>
                <span className="value">{delegationInfo.activeEpoch}</span>
              </div>
              {delegationInfo.nextRewardEpoch && (
                <div className="next-reward">
                  <span className="label">Next Reward:</span>
                  <span className="value">Epoch {delegationInfo.nextRewardEpoch}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-delegation">
            <p>No active delegation</p>
            <span className="delegation-hint">
              Delegate your stake to earn rewards
            </span>
          </div>
        )}
      </div>

      {/* Rewards Section */}
      <div className="rewards-section">
        <h3>Staking Rewards</h3>
        <div className="rewards-info">
          <div className="rewards-amount">
            <span className="label">Available Rewards:</span>
            <span className="value">
              {formatRewards(delegationInfo.rewards)} ₳
            </span>
          </div>

          <div className="rewards-actions">
            <Button
              variant="secondary"
              onClick={handleWithdrawRewards}
              disabled={isWithdrawing || delegationInfo.rewards <= 0n}
              size="sm"
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw Rewards'}
            </Button>
          </div>
        </div>
      </div>

      {/* Delegation Actions */}
      <div className="delegation-actions">
        <Button
          variant="primary"
          onClick={() => setShowPoolSelector(true)}
          disabled={isDelegating}
        >
          {delegationInfo.delegatedPool ? 'Change Delegation' : 'Delegate Stake'}
        </Button>
      </div>

      {/* Pool Selector Modal */}
      <Modal
        isOpen={showPoolSelector}
        onClose={() => setShowPoolSelector(false)}
        title="Select Stake Pool"
        size="xl"
      >
        <div className="pool-selector">
          {/* Search Input */}
          <div className="pool-search">
            <input
              type="text"
              placeholder="Search pools by name, ticker, or ID..."
              value={searchQuery}
              onChange={(e) => handlePoolSearch(e.target.value)}
              className="pool-search-input"
            />
            {isSearching && (
              <div className="search-indicator">Searching...</div>
            )}
          </div>

          {/* Pool List */}
          <div className="pool-list">
            {filteredPools.length > 0 ? (
              filteredPools.map((pool) => (
                <div
                  key={pool.id}
                  className={`pool-option ${selectedPool === pool.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPool(pool.id)}
                >
                  <div className="pool-header">
                    <div className="pool-main-info">
                      <h4 className="pool-name">{pool.name}</h4>
                      <span className="pool-ticker">[{pool.ticker}]</span>
                    </div>

                    <div className="pool-saturation">
                      <span className={`saturation-indicator ${getSaturationColor(pool.saturation)}`}>
                        {pool.saturation.toFixed(1)}% saturated
                      </span>
                    </div>
                  </div>

                  <div className="pool-details">
                    <div className="pool-id">
                      <span className="label">Pool ID:</span>
                      <span className="value">{pool.id.slice(0, 16)}...</span>
                    </div>

                    {pool.isRetiring && (
                      <div className="pool-retiring">
                        <span className="retiring-warning">
                          ⚠️ Retiring in epoch {pool.retiringEpoch}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedPool === pool.id && (
                    <div className="pool-selected-indicator">✓ Selected</div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-pools">
                {isSearching ? 'Searching for pools...' : 'No pools found'}
              </div>
            )}
          </div>

          {/* Pool Selector Actions */}
          <div className="pool-selector-actions">
            <Button
              variant="secondary"
              onClick={() => setShowPoolSelector(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={() => setShowConfirmDialog(true)}
              disabled={!selectedPool}
            >
              Delegate to Selected Pool
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirm Delegation"
      >
        <div className="delegation-confirmation">
          <div className="confirmation-details">
            <p>Are you sure you want to delegate your stake to:</p>

            {selectedPool && (
              <div className="selected-pool-confirm">
                <h4>{pools.find(p => p.id === selectedPool)?.name}</h4>
                <p>Ticker: {pools.find(p => p.id === selectedPool)?.ticker}</p>
                <p className="pool-id-confirm">{selectedPool}</p>
              </div>
            )}

            <div className="delegation-warning">
              <p><strong>Note:</strong> This will redelegate all your stake to the selected pool.
              The change will take effect in the next epoch.</p>
            </div>
          </div>

          <div className="confirmation-actions">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleDelegate}
              disabled={isDelegating}
            >
              {isDelegating ? 'Delegating...' : 'Confirm Delegation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WalletDelegation;

