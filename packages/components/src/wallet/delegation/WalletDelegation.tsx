import React, { useState, useEffect, useCallback } from 'react';
import { 
  searchPools, 
  getPoolInfoExtended, 
  getPopularPools,
  type PoolInfoExtended,
  type KoiosApiConfig,
} from '@clan/framework-helpers';
import { Button } from '../../ui/buttons/Button';

// Re-export KoiosApiConfig from helpers
export type { KoiosApiConfig } from '@clan/framework-helpers';

export interface DelegationInfo {
  stakeAddress: string;
  delegatedPool?: string;
  delegatedDRep?: string;
  rewards: bigint;
  activeEpoch: number;
  nextRewardEpoch?: number;
}

export interface DelegationProviderConfig {
  koios?: KoiosApiConfig;
}

export interface WalletDelegationProps {
  wallet: any;
  delegationInfo?: DelegationInfo;
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

export interface DRepDisplayInfo {
  type: 'drep';
  id: string;
  name: string;
  description: string;
  votingPower: string;
  isActive: boolean;
  logo?: string;
  isSpecial?: boolean;
}

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

// Inline styles for the component
const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: 'var(--delegation-bg, #0d1117)',
    color: 'var(--delegation-text, #e6edf3)',
    borderRadius: '12px',
    padding: '24px',
    minHeight: '500px',
  } as React.CSSProperties,
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px',
    borderBottom: '1px solid var(--delegation-border, #30363d)',
    paddingBottom: '12px',
  } as React.CSSProperties,
  tab: {
    padding: '10px 20px',
    border: 'none',
    background: 'transparent',
    color: 'var(--delegation-text-muted, #8b949e)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  tabActive: {
    backgroundColor: 'var(--delegation-accent, #238636)',
    color: '#fff',
  } as React.CSSProperties,
  title: {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '20px',
    color: 'var(--delegation-text, #e6edf3)',
  } as React.CSSProperties,
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  } as React.CSSProperties,
  panel: {
    backgroundColor: 'var(--delegation-panel-bg, #161b22)',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid var(--delegation-border, #30363d)',
  } as React.CSSProperties,
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  } as React.CSSProperties,
  panelTitle: {
    fontSize: '16px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  panelIcon: {
    fontSize: '20px',
  } as React.CSSProperties,
  searchInput: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--delegation-input-bg, #0d1117)',
    border: '1px solid var(--delegation-border, #30363d)',
    borderRadius: '6px',
    color: 'var(--delegation-text, #e6edf3)',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  } as React.CSSProperties,
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '320px',
    overflowY: 'auto',
    paddingRight: '4px',
  } as React.CSSProperties,
  optionCard: {
    padding: '12px',
    backgroundColor: 'var(--delegation-card-bg, #0d1117)',
    border: '2px solid var(--delegation-border, #30363d)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  optionCardSelected: {
    borderColor: 'var(--delegation-accent, #238636)',
    backgroundColor: 'var(--delegation-card-selected-bg, #0d1117)',
    boxShadow: '0 0 0 1px var(--delegation-accent, #238636)',
  } as React.CSSProperties,
  optionCardCurrent: {
    borderColor: 'var(--delegation-current, #1f6feb)',
    backgroundColor: 'rgba(31, 111, 235, 0.1)',
  } as React.CSSProperties,
  optionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  } as React.CSSProperties,
  optionIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--delegation-icon-bg, #21262d)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
    overflow: 'hidden',
  } as React.CSSProperties,
  optionLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
  } as React.CSSProperties,
  optionInfo: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  optionName: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--delegation-text, #e6edf3)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  optionTicker: {
    fontSize: '12px',
    color: 'var(--delegation-text-muted, #8b949e)',
  } as React.CSSProperties,
  optionStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
    fontSize: '11px',
  } as React.CSSProperties,
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--delegation-text-muted, #8b949e)',
  } as React.CSSProperties,
  statValue: {
    color: 'var(--delegation-text, #e6edf3)',
    fontWeight: 500,
  } as React.CSSProperties,
  currentBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: 'var(--delegation-current, #1f6feb)',
    color: '#fff',
    borderRadius: '4px',
    fontWeight: 600,
    textTransform: 'uppercase',
  } as React.CSSProperties,
  selectedBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: 'var(--delegation-accent, #238636)',
    color: '#fff',
    borderRadius: '4px',
    fontWeight: 600,
  } as React.CSSProperties,
  rewardsSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: 'var(--delegation-panel-bg, #161b22)',
    borderRadius: '8px',
    border: '1px solid var(--delegation-border, #30363d)',
    marginBottom: '24px',
  } as React.CSSProperties,
  rewardsLabel: {
    fontSize: '14px',
    color: 'var(--delegation-text-muted, #8b949e)',
  } as React.CSSProperties,
  rewardsAmount: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--delegation-accent, #238636)',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  } as React.CSSProperties,
  noResults: {
    textAlign: 'center',
    padding: '32px',
    color: 'var(--delegation-text-muted, #8b949e)',
    fontSize: '14px',
  } as React.CSSProperties,
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--delegation-text-muted, #8b949e)',
    fontSize: '12px',
    marginBottom: '8px',
  } as React.CSSProperties,
  spinner: {
    animation: 'spin 1s linear infinite',
  } as React.CSSProperties,
  description: {
    fontSize: '12px',
    color: 'var(--delegation-text-muted, #8b949e)',
    marginTop: '4px',
    lineHeight: 1.4,
  } as React.CSSProperties,
  specialTag: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: 'var(--delegation-warning, #9e6a03)',
    color: '#fff',
    borderRadius: '4px',
    fontWeight: 600,
    marginLeft: '8px',
  } as React.CSSProperties,
};

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

  // Get network - prefer koiosConfig.network, then wallet network, then mainnet
  const getNetworkName = useCallback(() => {
    // If koiosConfig specifies network, use that (overrides wallet)
    if (koiosConfig?.network) {
      return koiosConfig.network.toLowerCase().replace(/cardano[-_\s]*/gi, '').trim();
    }
    // Otherwise use wallet network
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

  const formatADA = (amount: number): string => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
  };

  const isCurrentPool = (poolId: string) => delegationInfo?.delegatedPool === poolId;
  const isCurrentDRep = (drepId: string) => delegationInfo?.delegatedDRep === drepId;

  // Pool Card
  const PoolOption: React.FC<{ pool: PoolDisplayInfo }> = ({ pool }) => {
    const isCurrent = isCurrentPool(pool.id);
    const isSelected = selectedPool === pool.id;
    
    return (
      <div
        style={{
          ...styles.optionCard,
          ...(isSelected ? styles.optionCardSelected : {}),
          ...(isCurrent && !isSelected ? styles.optionCardCurrent : {}),
        }}
        onClick={() => setSelectedPool(pool.id)}
      >
        <div style={styles.optionHeader}>
          <div style={styles.optionIcon}>
            {pool.logo ? (
              <img src={pool.logo} alt={pool.name} style={styles.optionLogo as React.CSSProperties} />
            ) : (
              '🏊'
            )}
          </div>
          <div style={styles.optionInfo}>
            <div style={styles.optionName}>{pool.name}</div>
            <div style={styles.optionTicker}>[{pool.ticker}]</div>
          </div>
          {isCurrent && <span style={styles.currentBadge}>Current</span>}
          {isSelected && !isCurrent && <span style={styles.selectedBadge}>Selected</span>}
        </div>
        <div style={styles.optionStats}>
          <div style={styles.statItem}>
            <span>Pledge:</span>
            <span style={styles.statValue}>{formatADA(pool.pledge)} ₳</span>
          </div>
          <div style={styles.statItem}>
            <span>Margin:</span>
            <span style={styles.statValue}>{pool.margin.toFixed(2)}%</span>
          </div>
          <div style={styles.statItem}>
            <span>Saturation:</span>
            <span style={styles.statValue}>{pool.saturation.toFixed(1)}%</span>
          </div>
          <div style={styles.statItem}>
            <span>ROI:</span>
            <span style={styles.statValue}>{pool.lifetimeROI.toFixed(2)}%</span>
          </div>
        </div>
        {pool.isRetiring && (
          <div style={{ color: '#f85149', fontSize: '11px', marginTop: '8px' }}>
            ⚠️ Retiring in epoch {pool.retiringEpoch}
          </div>
        )}
      </div>
    );
  };

  // DRep Card
  const DRepOption: React.FC<{ drep: DRepDisplayInfo }> = ({ drep }) => {
    const isCurrent = isCurrentDRep(drep.id);
    const isSelected = selectedDRep === drep.id;
    
    return (
      <div
        style={{
          ...styles.optionCard,
          ...(isSelected ? styles.optionCardSelected : {}),
          ...(isCurrent && !isSelected ? styles.optionCardCurrent : {}),
        }}
        onClick={() => setSelectedDRep(drep.id)}
      >
        <div style={styles.optionHeader}>
          <div style={styles.optionIcon}>
            {drep.logo ? (
              <img src={drep.logo} alt={drep.name} style={styles.optionLogo as React.CSSProperties} />
            ) : (
              drep.isSpecial ? '⚖️' : '🏛️'
            )}
          </div>
          <div style={styles.optionInfo}>
            <div style={styles.optionName}>
              {drep.name}
              {drep.isSpecial && <span style={styles.specialTag}>System</span>}
            </div>
            {!drep.isSpecial && (
              <div style={styles.optionTicker}>{drep.id.slice(0, 20)}...</div>
            )}
          </div>
          {isCurrent && <span style={styles.currentBadge}>Current</span>}
          {isSelected && !isCurrent && <span style={styles.selectedBadge}>Selected</span>}
        </div>
        <div style={styles.description}>{drep.description}</div>
        {!drep.isSpecial && (
          <div style={{ ...styles.optionStats, marginTop: '8px' }}>
            <div style={styles.statItem}>
              <span>Voting Power:</span>
              <span style={styles.statValue}>{drep.votingPower}</span>
            </div>
            <div style={styles.statItem}>
              <span>Status:</span>
              <span style={{ ...styles.statValue, color: drep.isActive ? '#3fb950' : '#f85149' }}>
                {drep.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const hasChanges = 
    (selectedPool !== delegationInfo?.delegatedPool) || 
    (selectedDRep !== delegationInfo?.delegatedDRep);

  return (
    <div style={styles.container} className={`wallet-delegation ${className}`}>
      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'status' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('status')}
        >
          Status
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'delegate' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('delegate')}
        >
          Delegate
        </button>
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div>
          <h2 style={styles.title}>Delegation Status</h2>
          
          {/* Rewards Section */}
          <div style={styles.rewardsSection}>
            <div>
              <div style={styles.rewardsLabel}>Available Rewards</div>
              <div style={styles.rewardsAmount}>
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
          <div style={styles.splitLayout}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitle}>
                  <span style={styles.panelIcon}>🏊</span>
                  Stake Pool
                </div>
              </div>
              {delegationInfo?.delegatedPool ? (
                <div>
                  {pools.find(p => p.id === delegationInfo.delegatedPool) ? (
                    <PoolOption pool={pools.find(p => p.id === delegationInfo.delegatedPool)!} />
                  ) : (
                    <div style={{ padding: '16px', fontSize: '14px', color: 'var(--delegation-text-muted, #8b949e)' }}>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>Delegated to:</div>
                      <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>{delegationInfo.delegatedPool}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.noResults as React.CSSProperties}>
                  No stake pool delegation
                </div>
              )}
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitle}>
                  <span style={styles.panelIcon}>🏛️</span>
                  dRep
                </div>
              </div>
              {delegationInfo?.delegatedDRep ? (
                <div>
                  {dreps.find(d => d.id === delegationInfo.delegatedDRep) ? (
                    <DRepOption drep={dreps.find(d => d.id === delegationInfo.delegatedDRep)!} />
                  ) : (
                    <div style={{ padding: '16px', fontSize: '14px', color: 'var(--delegation-text-muted, #8b949e)' }}>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>Delegated to:</div>
                      <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>{delegationInfo.delegatedDRep}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.noResults as React.CSSProperties}>
                  No dRep delegation
                </div>
              )}
            </div>
          </div>

          <div style={styles.actions}>
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
        <div>
          <h2 style={styles.title}>Update Delegation</h2>
          
          <div style={styles.splitLayout}>
            {/* Pools Panel - Left */}
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitle}>
                  <span style={styles.panelIcon}>🏊</span>
                  Stake Pool
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Search pools by name or ticker..."
                value={poolSearch}
                onChange={(e) => setPoolSearch(e.target.value)}
                style={styles.searchInput}
              />
              
              {isLoadingPools && (
                <div style={styles.loading}>
                  <span style={styles.spinner}>🔄</span>
                  Loading pools...
                </div>
              )}
              
              <div style={styles.optionsList as React.CSSProperties}>
                {filteredPools.length === 0 && !isLoadingPools ? (
                  <div style={styles.noResults as React.CSSProperties}>
                    {poolSearch ? 'No pools found' : 'No pools available'}
                  </div>
                ) : (
                  filteredPools.map(pool => (
                    <PoolOption key={pool.id} pool={pool} />
                  ))
                )}
              </div>
            </div>

            {/* DReps Panel - Right */}
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitle}>
                  <span style={styles.panelIcon}>🏛️</span>
                  dRep (Governance)
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Search dReps by name..."
                value={drepSearch}
                onChange={(e) => setDrepSearch(e.target.value)}
                style={styles.searchInput}
              />
              
              {isLoadingDreps && (
                <div style={styles.loading}>
                  <span style={styles.spinner}>🔄</span>
                  Loading dReps...
                </div>
              )}
              
              <div style={styles.optionsList as React.CSSProperties}>
                {filteredDreps.length === 0 && !isLoadingDreps ? (
                  <div style={styles.noResults as React.CSSProperties}>
                    {drepSearch ? 'No dReps found' : 'No dReps available'}
                  </div>
                ) : (
                  filteredDreps.map(drep => (
                    <DRepOption key={drep.id} drep={drep} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {(selectedPool || selectedDRep) && (
            <div style={{ 
              ...styles.panel, 
              marginBottom: '24px',
              backgroundColor: 'var(--delegation-summary-bg, #1c2128)',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                Delegation Summary
              </div>
              <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--delegation-text-muted, #8b949e)' }}>Pool: </span>
                  <span style={{ fontWeight: 500 }}>
                    {selectedPool 
                      ? (pools.find(p => p.id === selectedPool)?.name || selectedPool.slice(0, 16) + '...')
                      : 'None'
                    }
                  </span>
                  {selectedPool && isCurrentPool(selectedPool) && (
                    <span style={{ marginLeft: '8px', color: 'var(--delegation-current, #1f6feb)', fontSize: '11px' }}>
                      (unchanged)
                    </span>
                  )}
                </div>
                <div>
                  <span style={{ color: 'var(--delegation-text-muted, #8b949e)' }}>dRep: </span>
                  <span style={{ fontWeight: 500 }}>
                    {selectedDRep 
                      ? (dreps.find(d => d.id === selectedDRep)?.name || selectedDRep.slice(0, 16) + '...')
                      : 'None'
                    }
                  </span>
                  {selectedDRep && isCurrentDRep(selectedDRep) && (
                    <span style={{ marginLeft: '8px', color: 'var(--delegation-current, #1f6feb)', fontSize: '11px' }}>
                      (unchanged)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={styles.actions}>
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

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .wallet-delegation input:focus {
          border-color: var(--delegation-accent, #238636) !important;
        }
        .wallet-delegation *::-webkit-scrollbar {
          width: 6px;
        }
        .wallet-delegation *::-webkit-scrollbar-track {
          background: var(--delegation-panel-bg, #161b22);
          border-radius: 3px;
        }
        .wallet-delegation *::-webkit-scrollbar-thumb {
          background: var(--delegation-border, #30363d);
          border-radius: 3px;
        }
        .wallet-delegation *::-webkit-scrollbar-thumb:hover {
          background: var(--delegation-text-muted, #8b949e);
        }
      `}</style>
    </div>
  );
};

export default WalletDelegation;
