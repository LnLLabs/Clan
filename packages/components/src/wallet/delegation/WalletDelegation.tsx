import React, { useState, useEffect, useCallback } from 'react';
import { 
  searchPools, 
  getPoolInfoExtended, 
  getPopularPools,
  searchDReps,
  getDRepInfo,
  type PoolInfoExtended,
  type DRepInfo,
  type KoiosApiConfig,
} from '@clan/framework-helpers';
import { Button } from '../../ui/buttons/Button';
import { PoolCard, type PoolDisplayInfo } from './PoolCard';
import { DRepCard, type DRepDisplayInfo } from './DRepCard';
import './delegation.css';

// Re-export types
export type { PoolDisplayInfo } from './PoolCard';
export type { DRepDisplayInfo } from './DRepCard';
export type { KoiosApiConfig } from '@clan/framework-helpers';

export interface WalletDelegationInfo {
  stakeAddress: string;
  delegatedPool?: string;
  delegatedDRep?: string;
  rewards: bigint;
  nextRewardEpoch?: number;
}

export interface DelegationProviderConfig {
  koios?: KoiosApiConfig;
}

export interface WalletDelegationProps {
  wallet: any;
  delegationInfo?: WalletDelegationInfo;
  /** Delegate to both pool and dRep in a single action */
  onDelegate?: (poolId: string | null, drepId: string | null) => Promise<void>;
  onUndelegate?: () => Promise<void>;
  onWithdrawRewards?: () => Promise<void>;
  isDelegating?: boolean;
  isUndelegating?: boolean;
  isWithdrawing?: boolean;
  className?: string;
  providerConfig?: DelegationProviderConfig;
  /** Koios API configuration (URL, API key, network) - overrides wallet network */
  koiosConfig?: KoiosApiConfig;
}

export type DelegationOptionType = 'pool' | 'drep';
export type DelegationOption = PoolDisplayInfo | DRepDisplayInfo;

// Special dRep options
const SPECIAL_DREPS: DRepDisplayInfo[] = [
  {
    type: 'drep',
    id: 'drep_always_abstain',
    name: 'Always Abstain',
    description: 'Automatically abstain from all governance votes',
    votingPower: 'N/A',
    isActive: true,
    isSpecial: true,
  },
  {
    type: 'drep',
    id: 'drep_always_no_confidence',
    name: 'No Confidence',
    description: 'Automatically vote no confidence on all proposals',
    votingPower: 'N/A',
    isActive: true,
    isSpecial: true,
  },
];

export const WalletDelegation: React.FC<WalletDelegationProps> = ({
  wallet,
  delegationInfo,
  onDelegate,
  onUndelegate,
  onWithdrawRewards,
  isDelegating = false,
  isUndelegating = false,
  isWithdrawing = false,
  className = '',
  koiosConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'delegate'>('status');
  
  // Separate state for pools and dReps
  const [pools, setPools] = useState<PoolDisplayInfo[]>([]);
  const [dreps, setDreps] = useState<DRepDisplayInfo[]>(SPECIAL_DREPS);
  const [filteredPools, setFilteredPools] = useState<PoolDisplayInfo[]>([]);
  const [filteredDreps, setFilteredDreps] = useState<DRepDisplayInfo[]>(SPECIAL_DREPS);
  
  // Separate search queries
  const [poolSearch, setPoolSearch] = useState('');
  const [drepSearch, setDrepSearch] = useState('');
  
  // Separate selections - can select both simultaneously
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [selectedDRep, setSelectedDRep] = useState<string | null>(null);
  
  const [isLoadingPools, setIsLoadingPools] = useState(false);
  const [isLoadingDreps, setIsLoadingDreps] = useState(false);
  
  // Current delegation info (fetched separately if not in pools list)
  const [currentPoolInfo, setCurrentPoolInfo] = useState<PoolDisplayInfo | null>(null);
  const [isLoadingCurrentPool, setIsLoadingCurrentPool] = useState(false);

  // Get network - prefer koiosConfig.network, then wallet network, then mainnet
  const getNetworkName = useCallback(() => {
    if (koiosConfig?.network) {
      return koiosConfig.network.toLowerCase().replace(/cardano[-_\s]*/gi, '').trim();
    }
    const networkName = wallet?.getNetwork?.()?.name?.toLowerCase() || 'mainnet';
    return networkName.replace(/cardano[-_\s]*/gi, '').trim() || 'mainnet';
  }, [wallet, koiosConfig]);

  const convertPoolToDisplayInfo = (poolInfo: PoolInfoExtended): PoolDisplayInfo => {
    const extendedInfo = poolInfo as PoolInfoExtended & { logo?: string };
    return {
      type: 'pool',
      id: poolInfo.pool_id_bech32,
      name: poolInfo.meta_json?.name || poolInfo.pool_id_bech32.slice(0, 12) + '...',
      ticker: poolInfo.meta_json?.ticker || 'N/A',
      pledge: parseInt(poolInfo.pledge) / 1_000_000,
      margin: poolInfo.margin * 100,
      cost: parseInt(poolInfo.fixed_cost) / 1_000_000,
      lifetimeROI: poolInfo.roa || 0,
      saturation: (poolInfo.live_saturation || 0) * 100,
      logo: extendedInfo.logo,
      isRetiring: poolInfo.retiring_epoch !== undefined,
      retiringEpoch: poolInfo.retiring_epoch,
    };
  };

  const convertDRepToDisplayInfo = (drepInfo: DRepInfo): DRepDisplayInfo => {
    const votingPowerAda = drepInfo.amount 
      ? (parseInt(drepInfo.amount) / 1_000_000).toLocaleString()
      : '0';
    return {
      type: 'drep',
      id: drepInfo.drep_id,
      name: drepInfo.metadata?.name || drepInfo.drep_id.slice(0, 16) + '...',
      description: drepInfo.metadata?.bio || drepInfo.metadata?.objectives || 'No description available',
      votingPower: `${votingPowerAda} ₳`,
      isActive: drepInfo.active && drepInfo.registered,
      logo: drepInfo.logo,
      isSpecial: false,
    };
  };

  // Load pools on mount
  const loadPools = useCallback(async () => {
    setIsLoadingPools(true);
    try {
      const network = getNetworkName();
      const popularPoolIds = await getPopularPools(network, 10, koiosConfig);
      
      const poolsData = await Promise.all(
        popularPoolIds.map(async (poolId: string) => {
          try {
            const poolInfo = await getPoolInfoExtended(poolId, network, koiosConfig);
            return poolInfo ? convertPoolToDisplayInfo(poolInfo) : null;
          } catch (error) {
            console.warn(`Failed to load pool ${poolId}:`, error);
            return null;
          }
        })
      );

      const validPools = poolsData.filter((pool): pool is PoolDisplayInfo => pool !== null);
      setPools(validPools);
      setFilteredPools(validPools);
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setIsLoadingPools(false);
    }
  }, [getNetworkName, koiosConfig]);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  // Pre-select based on current delegation
  useEffect(() => {
    if (delegationInfo?.delegatedPool && !selectedPool) {
      setSelectedPool(delegationInfo.delegatedPool);
    }
    if (delegationInfo?.delegatedDRep && !selectedDRep) {
      setSelectedDRep(delegationInfo.delegatedDRep);
    }
  }, [delegationInfo, selectedPool, selectedDRep]);

  // Fetch current delegated pool info if not in pools list
  useEffect(() => {
    const fetchCurrentPool = async () => {
      if (!delegationInfo?.delegatedPool) {
        setCurrentPoolInfo(null);
        return;
      }
      
      // Skip if we already have info for this pool
      if (currentPoolInfo?.id === delegationInfo.delegatedPool) {
        return;
      }
      
      // Check if already in pools list
      const existingPool = pools.find(p => p.id === delegationInfo.delegatedPool);
      if (existingPool) {
        setCurrentPoolInfo(existingPool);
        return;
      }
      
      // Don't fetch if pools haven't loaded yet (wait for them first)
      if (isLoadingPools) {
        return;
      }
      
      // Fetch the pool info
      setIsLoadingCurrentPool(true);
      try {
        const network = getNetworkName();
        const poolInfo = await getPoolInfoExtended(delegationInfo.delegatedPool, network, koiosConfig);
        if (poolInfo) {
          setCurrentPoolInfo(convertPoolToDisplayInfo(poolInfo));
        }
      } catch (error) {
        console.warn('Failed to fetch current pool info:', error);
      } finally {
        setIsLoadingCurrentPool(false);
      }
    };
    
    fetchCurrentPool();
  }, [delegationInfo?.delegatedPool, pools, isLoadingPools, getNetworkName, koiosConfig]);

  // Filter pools based on search
  useEffect(() => {
    if (!poolSearch.trim()) {
      setFilteredPools(pools);
      return;
    }
    
    const query = poolSearch.toLowerCase();
    const filtered = pools.filter(pool =>
      pool.name.toLowerCase().includes(query) ||
      pool.ticker.toLowerCase().includes(query) ||
      pool.id.toLowerCase().includes(query)
    );
    setFilteredPools(filtered);
  }, [poolSearch, pools]);

  // Filter dReps based on search
  useEffect(() => {
    if (!drepSearch.trim()) {
      setFilteredDreps(dreps);
      return;
    }
    
    const query = drepSearch.toLowerCase();
    const filtered = dreps.filter(drep =>
      drep.name.toLowerCase().includes(query) ||
      drep.description.toLowerCase().includes(query) ||
      drep.id.toLowerCase().includes(query)
    );
    setFilteredDreps(filtered);
  }, [drepSearch, dreps]);

  // Search pools when query is long enough
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (poolSearch.trim().length >= 3) {
        setIsLoadingPools(true);
        try {
          const network = getNetworkName();
          const poolIds = await searchPools(poolSearch, network, koiosConfig);
          
          const poolsData = await Promise.all(
            poolIds.slice(0, 10).map(async (poolId: string) => {
              try {
                const poolInfo = await getPoolInfoExtended(poolId, network, koiosConfig);
                return poolInfo ? convertPoolToDisplayInfo(poolInfo) : null;
              } catch (error) {
                return null;
              }
            })
          );

          const validPools = poolsData.filter((pool): pool is PoolDisplayInfo => pool !== null);
          setFilteredPools(validPools);
        } catch (error) {
          console.error('Error searching pools:', error);
        } finally {
          setIsLoadingPools(false);
        }
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [poolSearch, getNetworkName, koiosConfig]);

  // Search dReps when query is long enough
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (drepSearch.trim().length >= 3) {
        setIsLoadingDreps(true);
        try {
          const network = getNetworkName();
          const drepList = await searchDReps(drepSearch, network, koiosConfig, 10);
          
          // Fetch full info for each dRep
          const drepsData = await Promise.all(
            drepList.map(async (item) => {
              try {
                const drepInfo = await getDRepInfo(item.drep_id, network, koiosConfig, true);
                return drepInfo ? convertDRepToDisplayInfo(drepInfo) : null;
              } catch (error) {
                return null;
              }
            })
          );

          const validDreps = drepsData.filter((drep): drep is DRepDisplayInfo => drep !== null);
          // Keep special dReps at the top, add search results after
          setFilteredDreps([...SPECIAL_DREPS, ...validDreps]);
        } catch (error) {
          console.error('Error searching dReps:', error);
        } finally {
          setIsLoadingDreps(false);
        }
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [drepSearch, getNetworkName, koiosConfig]);

  const handleDelegate = async () => {
    if (isDelegating || !onDelegate) return;
    if (!selectedPool && !selectedDRep) return;

    try {
      await onDelegate(selectedPool, selectedDRep);
      setActiveTab('status');
    } catch (error) {
      console.error('Error delegating:', error);
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

  const isCurrentPool = (poolId: string) => delegationInfo?.delegatedPool === poolId;
  const isCurrentDRep = (drepId: string) => delegationInfo?.delegatedDRep === drepId;

  const hasChanges = 
    (selectedPool !== delegationInfo?.delegatedPool) || 
    (selectedDRep !== delegationInfo?.delegatedDRep);

  return (
    <div className={`delegation-container ${className}`}>
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
          <h2 className="delegation-title">Delegation Status</h2>
          
          {/* Rewards Section */}
          <div className="delegation-rewards">
            <div className="delegation-rewards-info">
              <div className="delegation-rewards-label">Available Rewards</div>
              <div className="delegation-rewards-amount">
                {formatRewards(delegationInfo?.rewards || 0n)} ₳
              </div>
            </div>
            {delegationInfo?.rewards !== undefined && delegationInfo.rewards > 0n && (
              <Button
                variant="secondary"
                onClick={handleWithdrawRewards}
                disabled={isWithdrawing}
                size="sm"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
              </Button>
            )}
          </div>

          {/* Current Delegations */}
          <div className="delegation-split-layout">
            <div className="delegation-panel">
              <div className="delegation-panel-header">
                <div className="delegation-panel-title">
                  <span className="delegation-panel-icon">🏊</span>
                  Stake Pool
                </div>
              </div>
              {delegationInfo?.delegatedPool ? (
                <div>
                  {isLoadingCurrentPool ? (
                    <div className="delegation-loading">
                      <span className="delegation-spinner">🔄</span>
                      Loading pool info...
                    </div>
                  ) : currentPoolInfo ? (
                    <PoolCard 
                      pool={currentPoolInfo}
                      isCurrent={true}
                    />
                  ) : (
                    <div className="delegation-no-results">
                      <div style={{ fontWeight: 500, marginBottom: '8px' }}>Delegated to:</div>
                      <div style={{ fontSize: '12px', wordBreak: 'break-all', fontFamily: 'var(--font-family-mono)' }}>
                        {delegationInfo.delegatedPool}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="delegation-no-results">
                  No stake pool delegation
                </div>
              )}
            </div>

            <div className="delegation-panel">
              <div className="delegation-panel-header">
                <div className="delegation-panel-title">
                  <span className="delegation-panel-icon">🏛️</span>
                  dRep
                </div>
              </div>
              {delegationInfo?.delegatedDRep ? (
                <div>
                  {dreps.find(d => d.id === delegationInfo.delegatedDRep) ? (
                    <DRepCard 
                      drep={dreps.find(d => d.id === delegationInfo.delegatedDRep)!}
                      isCurrent={true}
                    />
                  ) : (
                    <div className="delegation-no-results">
                      <div style={{ fontWeight: 500, marginBottom: '8px' }}>Delegated to:</div>
                      <div style={{ fontSize: '12px', wordBreak: 'break-all', fontFamily: 'var(--font-family-mono)' }}>
                        {delegationInfo.delegatedDRep}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="delegation-no-results">
                  No dRep delegation
                </div>
              )}
            </div>
          </div>

          <div className="delegation-actions">
            <Button
              variant="secondary"
              onClick={() => setActiveTab('delegate')}
            >
              Change Delegation
            </Button>
          </div>
        </div>
      )}

      {/* Delegate Tab */}
      {activeTab === 'delegate' && (
        <div className="delegation-delegate-view">
          <h2 className="delegation-title">Update Delegation</h2>
          
          <div className="delegation-split-layout">
            {/* Pools Panel - Left */}
            <div className="delegation-panel">
              <div className="delegation-panel-header">
                <div className="delegation-panel-title">
                  <span className="delegation-panel-icon">🏊</span>
                  Stake Pool
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Search pools by name or ticker..."
                value={poolSearch}
                onChange={(e) => setPoolSearch(e.target.value)}
                className="delegation-search-input"
              />
              
              {isLoadingPools && (
                <div className="delegation-loading">
                  <span className="delegation-spinner">🔄</span>
                  Loading pools...
                </div>
              )}
              
              <div className="delegation-options-list">
                {/* Show current pool at top if not in filtered list */}
                {currentPoolInfo && 
                 !filteredPools.find(p => p.id === currentPoolInfo.id) && 
                 !poolSearch && (
                  <PoolCard
                    key={currentPoolInfo.id}
                    pool={currentPoolInfo}
                    isSelected={selectedPool === currentPoolInfo.id}
                    isCurrent={true}
                    onClick={() => setSelectedPool(currentPoolInfo.id)}
                  />
                )}
                {filteredPools.length === 0 && !isLoadingPools && !currentPoolInfo ? (
                  <div className="delegation-no-results">
                    {poolSearch ? 'No pools found' : 'No pools available'}
                  </div>
                ) : (
                  filteredPools.map(pool => (
                    <PoolCard
                      key={pool.id}
                      pool={pool}
                      isSelected={selectedPool === pool.id}
                      isCurrent={isCurrentPool(pool.id)}
                      onClick={() => setSelectedPool(pool.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* DReps Panel - Right */}
            <div className="delegation-panel">
              <div className="delegation-panel-header">
                <div className="delegation-panel-title">
                  <span className="delegation-panel-icon">🏛️</span>
                  dRep (Governance)
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Search dReps by name..."
                value={drepSearch}
                onChange={(e) => setDrepSearch(e.target.value)}
                className="delegation-search-input"
              />
              
              {isLoadingDreps && (
                <div className="delegation-loading">
                  <span className="delegation-spinner">🔄</span>
                  Loading dReps...
                </div>
              )}
              
              <div className="delegation-options-list">
                {filteredDreps.length === 0 && !isLoadingDreps ? (
                  <div className="delegation-no-results">
                    {drepSearch ? 'No dReps found' : 'No dReps available'}
                  </div>
                ) : (
                  filteredDreps.map(drep => (
                    <DRepCard
                      key={drep.id}
                      drep={drep}
                      isSelected={selectedDRep === drep.id}
                      isCurrent={isCurrentDRep(drep.id)}
                      onClick={() => setSelectedDRep(drep.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {(selectedPool || selectedDRep) && (
            <div className="delegation-summary">
              <div className="delegation-summary-title">
                Delegation Summary
              </div>
              <div className="delegation-summary-content">
                <div className="delegation-summary-item">
                  <span className="delegation-summary-label">Pool:</span>
                  <span className="delegation-summary-value">
                    {selectedPool 
                      ? (pools.find(p => p.id === selectedPool)?.name || 
                         (currentPoolInfo?.id === selectedPool ? currentPoolInfo?.name : null) || 
                         selectedPool.slice(0, 16) + '...')
                      : 'None'
                    }
                  </span>
                  {selectedPool && isCurrentPool(selectedPool) && (
                    <span className="delegation-summary-unchanged">(unchanged)</span>
                  )}
                </div>
                <div className="delegation-summary-item">
                  <span className="delegation-summary-label">dRep:</span>
                  <span className="delegation-summary-value">
                    {selectedDRep 
                      ? (dreps.find(d => d.id === selectedDRep)?.name || selectedDRep.slice(0, 16) + '...')
                      : 'None'
                    }
                  </span>
                  {selectedDRep && isCurrentDRep(selectedDRep) && (
                    <span className="delegation-summary-unchanged">(unchanged)</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="delegation-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedPool(delegationInfo?.delegatedPool || null);
                setSelectedDRep(delegationInfo?.delegatedDRep || null);
                setActiveTab('status');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelegate}
              disabled={!hasChanges || isDelegating || (!selectedPool && !selectedDRep)}
            >
              {isDelegating ? 'Delegating...' : 'Confirm Delegation'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDelegation;
