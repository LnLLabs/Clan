import React, { useState, useMemo, useEffect } from 'react';
import { Assets } from '@clan/framework-core';

/**
 * UI-focused asset model with optional metadata for display purposes.
 * Distinct from core Asset type which represents blockchain asset structure.
 */
export interface UIAsset {
  id: string;
  name?: string;           // Optional: fallback to shortened id
  policyId?: string;       // Optional: extracted from id if not provided
  icon?: string;           // Optional: will use placeholder
  balance: bigint;         // Required: from wallet
  decimals?: number;       // Optional: defaults to 6 for FTs, 0 for NFTs
  isNFT?: boolean;         // Optional: inferred from quantity if not provided
  fingerprint?: string;    // Optional: CIP-14 fingerprint
  ticker?: string;         // Optional: short symbol
}

export interface SelectedAsset {
  assetId: string;
  amount: bigint;
}

export interface AssetPickerProps {
  availableAssets: UIAsset[];
  selectedAssets: SelectedAsset[];
  onConfirm: (assets: SelectedAsset[]) => void;
  onClose: () => void;
  hasMetadataProvider?: boolean;
}

type TabType = 'all' | 'ft' | 'nft';

// Helper functions for asset metadata fallbacks
const decodeAssetName = (assetId: string): string => {
  try {
    // AssetId format: policyId (56 chars) + hex-encoded asset name
    if (assetId.length <= 56) {
      return assetId.slice(0, 8) + '...';
    }
    
    const hexAssetName = assetId.slice(56);
    if (!hexAssetName) {
      return assetId.slice(0, 8) + '...';
    }
    
    // Decode hex to UTF-8
    const decoded = hexAssetName.match(/.{1,2}/g)
      ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
      .join('');
    
    return decoded || assetId.slice(0, 8) + '...';
  } catch (error) {
    return assetId.slice(0, 8) + '...';
  }
};

const getAssetName = (asset: UIAsset): string => {
  return asset.name || asset.ticker || decodeAssetName(asset.id);
};

const getAssetDecimals = (asset: UIAsset): number => {
  if (asset.decimals !== undefined) return asset.decimals;
  // If isNFT is true or balance is 1, assume 0 decimals
  if (asset.isNFT || asset.balance === 1n) return 0;
  // Default to 6 decimals for fungible tokens (common for Cardano tokens)
  return 6;
};

const isAssetNFT = (asset: UIAsset): boolean => {
  if (asset.isNFT !== undefined) return asset.isNFT;
  // Infer NFT: quantity of 1 and 0 decimals typically means NFT
  return asset.balance === 1n;
};

const getAssetPolicyId = (asset: UIAsset): string => {
  if (asset.policyId) return asset.policyId;
  // Extract policy ID from asset ID (format: policyId.assetName)
  if (!asset.id) return '';
  const parts = asset.id.split('.');
  return parts[0] || asset.id;
};

export const AssetPicker: React.FC<AssetPickerProps> = ({
  availableAssets,
  selectedAssets: initialSelected,
  onConfirm,
  onClose,
  hasMetadataProvider = false
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>(initialSelected);
  const [editingAmounts, setEditingAmounts] = useState<{ [key: string]: string }>({});

  const showTabs = hasMetadataProvider;

  useEffect(() => {
    if (!showTabs && activeTab !== 'all') {
      setActiveTab('all');
    }
  }, [showTabs, activeTab]);

  // Filter assets based on tab and search
  const filteredAssets = useMemo(() => {
    return availableAssets.filter(asset => {
      // Filter out invalid assets
      if (!asset || !asset.id) return false;
      
      const isNFT = showTabs ? isAssetNFT(asset) : false;
      const matchesTab = 
        !showTabs ||
        activeTab === 'all' ||
        (activeTab === 'ft' && !isNFT) ||
        (activeTab === 'nft' && isNFT);

      const assetName = getAssetName(asset);
      const policyId = getAssetPolicyId(asset);
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        assetName.toLowerCase().includes(searchLower) ||
        policyId.toLowerCase().includes(searchLower) ||
        asset.id.toLowerCase().includes(searchLower) ||
        (asset.fingerprint && asset.fingerprint.toLowerCase().includes(searchLower));

      return matchesTab && matchesSearch;
    });
  }, [availableAssets, activeTab, searchTerm]);

  const getSelectedAmount = (assetId: string): bigint => {
    const selected = selectedAssets.find(s => s.assetId === assetId);
    return selected?.amount || 0n;
  };

  const updateAssetAmount = (assetId: string, amount: bigint) => {
    if (amount === 0n) {
      setSelectedAssets(selectedAssets.filter(s => s.assetId !== assetId));
    } else {
      const existing = selectedAssets.find(s => s.assetId === assetId);
      if (existing) {
        setSelectedAssets(
          selectedAssets.map(s => s.assetId === assetId ? { ...s, amount } : s)
        );
      } else {
        setSelectedAssets([...selectedAssets, { assetId, amount }]);
      }
    }
  };

  const handleAmountChange = (assetId: string, value: string, asset: UIAsset) => {
    setEditingAmounts({ ...editingAmounts, [assetId]: value });
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      const decimals = hasMetadataProvider ? getAssetDecimals(asset) : (asset.decimals ?? 0);
      const amount = BigInt(Math.floor(numValue * Math.pow(10, decimals)));
      updateAssetAmount(assetId, amount);
    }
  };

  const setMaxAmount = (assetId: string, asset: UIAsset) => {
    updateAssetAmount(assetId, asset.balance);
    const decimals = hasMetadataProvider ? getAssetDecimals(asset) : (asset.decimals ?? 0);
    const displayAmount = Number(asset.balance) / Math.pow(10, decimals);
    setEditingAmounts({ ...editingAmounts, [assetId]: displayAmount.toString() });
  };

  const handleReset = () => {
    setSelectedAssets([]);
    setEditingAmounts({});
  };

  const handleAddAll = () => {
    const allAssets = filteredAssets.map(asset => ({
      assetId: asset.id,
      amount: asset.balance
    }));
    setSelectedAssets(allAssets);
    
    const newEditingAmounts: { [key: string]: string } = {};
    filteredAssets.forEach(asset => {
      const decimals = hasMetadataProvider ? getAssetDecimals(asset) : (asset.decimals ?? 0);
      const displayAmount = Number(asset.balance) / Math.pow(10, decimals);
      newEditingAmounts[asset.id] = displayAmount.toString();
    });
    setEditingAmounts(newEditingAmounts);
  };

  const getDisplayAmount = (assetId: string, asset: UIAsset): string => {
    if (editingAmounts[assetId] !== undefined) {
      return editingAmounts[assetId];
    }
    const amount = getSelectedAmount(assetId);
    const decimals = hasMetadataProvider ? getAssetDecimals(asset) : (asset.decimals ?? 0);
    return (Number(amount) / Math.pow(10, decimals)).toString();
  };

  return (
    <div className="asset-picker-modal">
      <div className="asset-picker-overlay" onClick={onClose} />
      <div className="asset-picker-container">
      {/* Header */}
      <div className="asset-picker-header">
        <h2>Add Assets</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      {/* Search and Tabs */}
      <div className="asset-picker-controls">
        {/* Search */}
        <div className="asset-picker-search">
          <input
            type="text"
            placeholder="Search for assets by name or policy"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>

        {/* Tabs */}
        {showTabs && (
          <div className="asset-picker-tabs">
            <button
              className={`asset-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`asset-tab ${activeTab === 'ft' ? 'active' : ''}`}
              onClick={() => setActiveTab('ft')}
            >
              FTs
            </button>
            <button
              className={`asset-tab ${activeTab === 'nft' ? 'active' : ''}`}
              onClick={() => setActiveTab('nft')}
            >
              NFTs
            </button>
          </div>
        )}
      </div>

        {/* Assets Grid */}
        <div className="asset-picker-grid">
          {filteredAssets.map((asset) => {
            const selectedAmount = getSelectedAmount(asset.id);
            const isSelected = selectedAmount > 0n;
            const displayAmount = getDisplayAmount(asset.id, asset);
            const decimals = hasMetadataProvider ? getAssetDecimals(asset) : (asset.decimals ?? 0);
            const maxAmount = Number(asset.balance) / Math.pow(10, decimals);
            const assetName = getAssetName(asset);
            const isNFT = showTabs ? isAssetNFT(asset) : false;

            const isEditing = editingAmounts[asset.id] !== undefined;
            const showInput = !isSelected || isEditing;

            return (
              <div key={asset.id} className={`asset-card ${isSelected ? 'selected' : ''}`}>
                {/* Asset Icon */}
                <div className="asset-icon">
                  {asset.icon ? (
                    <img src={asset.icon} alt={assetName} />
                  ) : (
                    <div className="asset-icon-placeholder">
                      {assetName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

              {/* Asset Info */}
              <div className="asset-info">
                <div className="asset-balance">
                  <span className="total-balance">{maxAmount.toString()}</span>
                </div>
                <div className="asset-name" title={asset.id}>{assetName}</div>
              </div>

                {/* Show either selected indicator or input, never both */}
                <div className="asset-amount-controls">
                  {isSelected && !showInput ? (
                    <>
                      <div className="selected-indicator">
                        <span>{displayAmount}/{maxAmount.toString()}</span>
                        <button
                          className="remove-selection"
                          onClick={() => updateAssetAmount(asset.id, 0n)}
                        >
                          ✕
                        </button>
                      </div>
                      <button 
                        className="edit-amount-button"
                        onClick={() => {
                          const decimals = getAssetDecimals(asset);
                          const amount = Number(getSelectedAmount(asset.id)) / Math.pow(10, decimals);
                          setEditingAmounts({ ...editingAmounts, [asset.id]: amount.toString() });
                        }}
                      >
                        Edit Amount
                      </button>
                    </>
                  ) : (
                    <div className="asset-input-section">
                      <input
                        type="number"
                        min="0"
                        max={maxAmount}
                        step={decimals > 0 ? (Math.pow(10, -decimals)).toString() : "1"}
                        value={displayAmount}
                        onChange={(e) => handleAmountChange(asset.id, e.target.value, asset)}
                        placeholder="0"
                      />
                      <button
                        className="max-button"
                        onClick={() => setMaxAmount(asset.id, asset)}
                      >
                        Max
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      {/* Footer Actions */}
      <div className="asset-picker-footer">
        <button className="reset-button" onClick={handleReset}>Reset</button>
        <button className="add-all-button" onClick={handleAddAll}>Add All</button>
        <button className="confirm-button" onClick={() => onConfirm(selectedAssets)}>Confirm</button>
      </div>
      </div>
    </div>
  );
};

/**
 * Utility function to convert wallet Assets (raw balance) to UIAsset[] format
 * This is useful for parent components that need to convert wallet balance to AssetPicker format
 * 
 * @param assets - Raw assets from wallet.getBalance()
 * @param metadataProvider - Optional function to enrich assets with metadata
 * @returns Array of UIAsset objects with minimal data (balance only, metadata optional)
 * 
 * @example
 * const balance = await wallet.getBalance();
 * const availableAssets = convertAssetsToAssetArray(balance);
 * // Or with metadata provider:
 * const availableAssets = convertAssetsToAssetArray(balance, async (assetId) => {
 *   return await tokenRegistry.getMetadata(assetId);
 * });
 */
export const convertAssetsToAssetArray = async (
  assets: Assets,
  metadataProvider?: (assetId: string) => Promise<Partial<Omit<UIAsset, 'id' | 'balance'>>>,
  excludeLovelace: boolean = true // Default to excluding ADA since it has special UI
): Promise<UIAsset[]> => {
  const assetArray: UIAsset[] = [];
  
  for (const [assetId, balance] of Object.entries(assets)) {
    if (balance <= 0n) continue;
    if (excludeLovelace && assetId === 'lovelace') continue;
    
    let metadata: Partial<Omit<UIAsset, 'id' | 'balance'>> = {};
    
    if (metadataProvider) {
      try {
        metadata = await metadataProvider(assetId);
      } catch (error) {
        console.warn(`Failed to fetch metadata for asset ${assetId}:`, error);
      }
    }
    
    assetArray.push({
      id: assetId,
      balance,
      ...metadata
    });
  }
  
  return assetArray;
};

/**
 * Synchronous version for when metadata is already available
 */
export const convertAssetsToAssetArraySync = (
  assets: Assets,
  metadataMap?: Record<string, Partial<Omit<UIAsset, 'id' | 'balance'>>>,
  excludeLovelace: boolean = true // Default to excluding ADA since it has special UI
): UIAsset[] => {
  return Object.entries(assets)
    .filter(([assetId, balance]) => {
      if (balance <= 0n) return false;
      if (excludeLovelace && assetId === 'lovelace') return false;
      return true;
    })
    .map(([assetId, balance]) => ({
      id: assetId,
      balance,
      ...(metadataMap?.[assetId] || {})
    }));
};

