import React from 'react';
import { Assets, Asset } from '@clan/framework-core';

export interface BalanceDisplayProps {
  balance: Assets;
  loading?: boolean;
  showZeroBalances?: boolean;
  formatAssetName?: (asset: Asset) => string;
  formatAssetValue?: (asset: Asset) => string;
  className?: string;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  loading = false,
  showZeroBalances = false,
  formatAssetName,
  formatAssetValue,
  className = ''
}) => {
  const formatDefaultAssetName = (asset: Asset): string => {
    if (asset.assetName === '') {
      return 'ADA';
    }
    return asset.assetName;
  };

  const formatDefaultAssetValue = (asset: Asset): string => {
    // Convert from lovelace to ADA (1 ADA = 1,000,000 lovelace)
    if (asset.assetName === '') {
      return (Number(asset.quantity) / 1000000).toFixed(6);
    }
    return asset.quantity.toString();
  };

  const assets = Object.entries(balance)
    .map(([assetId, quantity]) => {
      const [policyId, assetName] = assetId.split('.');
      return {
        policyId,
        assetName: assetName || '',
        quantity
      };
    })
    .filter(asset => showZeroBalances || Number(asset.quantity) > 0)
    .sort((a, b) => {
      // Sort ADA first, then by quantity descending
      if (a.assetName === '' && b.assetName !== '') return -1;
      if (a.assetName !== '' && b.assetName === '') return 1;
      return Number(b.quantity) - Number(a.quantity);
    });

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No assets found
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {assets.map((asset, index) => (
        <div
          key={`${asset.policyId}.${asset.assetName}`}
          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {(formatAssetName || formatDefaultAssetName)(asset).charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-gray-900">
              {(formatAssetName || formatDefaultAssetName)(asset)}
            </span>
          </div>
          <span className="font-mono text-sm text-gray-600">
            {(formatAssetValue || formatDefaultAssetValue)(asset)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default BalanceDisplay;

