import { Assets, Asset, PolicyId, AssetName } from '@broclan/framework-core';

/**
 * Asset utility functions for blockchain operations
 */

export interface AssetDisplayOptions {
  decimals?: number;
  symbol?: string;
  compact?: boolean;
}

/**
 * Formats an asset quantity for display
 */
export function formatAssetQuantity(
  quantity: bigint | string | number,
  options: AssetDisplayOptions = {}
): string {
  const { decimals = 0, compact = false } = options;

  let numValue: number;
  if (typeof quantity === 'bigint') {
    numValue = Number(quantity) / Math.pow(10, decimals);
  } else if (typeof quantity === 'string') {
    numValue = parseFloat(quantity) / Math.pow(10, decimals);
  } else {
    numValue = quantity / Math.pow(10, decimals);
  }

  if (compact && numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(2)}M`;
  } else if (compact && numValue >= 1000) {
    return `${(numValue / 1000).toFixed(2)}K`;
  }

  return numValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals > 0 ? 2 : 0,
    maximumFractionDigits: decimals > 0 ? 6 : 0
  });
}

/**
 * Formats asset name for display
 */
export function formatAssetName(assetName: AssetName): string {
  if (!assetName || assetName === '') {
    return 'ADA';
  }

  // Convert hex to readable text if possible
  try {
    const decoded = Buffer.from(assetName, 'hex').toString('utf8');
    // Check if it's valid UTF-8 and not just binary data
    if (/^[\x20-\x7E]*$/.test(decoded) && decoded.length > 0) {
      return decoded;
    }
  } catch {
    // If decoding fails, use the hex value
  }

  return assetName;
}

/**
 * Creates an asset ID from policy ID and asset name
 */
export function createAssetId(policyId: PolicyId, assetName: AssetName = ''): string {
  return assetName ? `${policyId}.${assetName}` : policyId;
}

/**
 * Parses an asset ID into policy ID and asset name
 */
export function parseAssetId(assetId: string): { policyId: PolicyId; assetName: AssetName } {
  const parts = assetId.split('.');
  return {
    policyId: parts[0] as PolicyId,
    assetName: (parts[1] || '') as AssetName
  };
}

/**
 * Sums asset quantities in an Assets object
 */
export function sumAssets(assets: Assets): Assets {
  const result: Assets = {};

  for (const [assetId, quantity] of Object.entries(assets)) {
    if (result[assetId]) {
      result[assetId] = (result[assetId] + quantity);
    } else {
      result[assetId] = quantity;
    }
  }

  return result;
}

/**
 * Subtracts one Assets object from another
 */
export function subtractAssets(minuend: Assets, subtrahend: Assets): Assets {
  const result: Assets = { ...minuend };

  for (const [assetId, quantity] of Object.entries(subtrahend)) {
    if (result[assetId]) {
      result[assetId] = result[assetId] - quantity;
      if (result[assetId] <= 0n) {
        delete result[assetId];
      }
    }
  }

  return result;
}

/**
 * Checks if assets contain sufficient quantities
 */
export function hasSufficientAssets(required: Assets, available: Assets): boolean {
  for (const [assetId, requiredQuantity] of Object.entries(required)) {
    const availableQuantity = available[assetId] || 0n;
    if (availableQuantity < requiredQuantity) {
      return false;
    }
  }
  return true;
}

/**
 * Gets the total value of assets (useful for sorting)
 */
export function getAssetTotalValue(assets: Assets, prices?: Record<string, number>): number {
  let total = 0;

  for (const [assetId, quantity] of Object.entries(assets)) {
    const price = prices?.[assetId] || 0;
    total += Number(quantity) * price;
  }

  return total;
}

/**
 * Filters assets by minimum quantity
 */
export function filterAssetsByQuantity(
  assets: Assets,
  minQuantity: bigint = 1n
): Assets {
  const result: Assets = {};

  for (const [assetId, quantity] of Object.entries(assets)) {
    if (quantity >= minQuantity) {
      result[assetId] = quantity;
    }
  }

  return result;
}

/**
 * Gets assets sorted by quantity (descending)
 */
export function sortAssetsByQuantity(assets: Assets): Array<[string, bigint]> {
  return Object.entries(assets).sort(([, a], [, b]) => {
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
  });
}

/**
 * Merges multiple Assets objects
 */
export function mergeAssets(...assetsList: Assets[]): Assets {
  const result: Assets = {};

  for (const assets of assetsList) {
    for (const [assetId, quantity] of Object.entries(assets)) {
      result[assetId] = (result[assetId] || 0n) + quantity;
    }
  }

  return result;
}
