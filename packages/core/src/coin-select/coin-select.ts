import { meshUtxoToAssets, meshUtxosEqual } from '../mesh-utxo';
import type { Assets, UTxO } from '../types';

const UPPERBOUND: number = 10;

/**
 * Coin selection algorithm for UTXO selection
 * Based on the original BroClanWallet implementation
 * Uses a greedy approach optimized for multi-asset transactions
 */
export function coinSelect(value: Assets, utxos: UTxO[]): UTxO[] {
  /**
   * Check if remaining value requirements are satisfied
   */
  function isEnoughValue(remaining: Assets): boolean {
    for (const asset in value) {
      if (remaining[asset] > 0n) {
        return false;
      }
    }
    return true;
  }

  /**
   * Sort UTXOs by how well they match the remaining value requirements
   * Prioritizes UTXOs that contain more of the needed assets
   */
  function sortByLeft(utxoList: UTxO[], value_: Assets): UTxO[] {
    const targetAssets: string[] = Object.keys(value_).filter(asset => value_[asset] > 0n);

    return [...utxoList].sort((a, b) => {
      const assetsA = meshUtxoToAssets(a);
      const assetsB = meshUtxoToAssets(b);
      const aLeft = targetAssets.reduce((acc, asset) => acc + BigInt(assetsA[asset as keyof Assets] || 0), 0n);
      const bLeft = targetAssets.reduce((acc, asset) => acc + BigInt(assetsB[asset as keyof Assets] || 0), 0n);
      return Number(bLeft - aLeft);
    });
  }

  let availableUtxos = utxos;
  let selectedUtxos: UTxO[] = [];
  let totalRemaining: Assets = { ...value };

  for (const asset in value) {
    if (!totalRemaining[asset]) {
      totalRemaining[asset] = value[asset];
    }
  }

  while (availableUtxos.length > 0 && !isEnoughValue(totalRemaining)) {
    const sortedUtxos = sortByLeft(availableUtxos, totalRemaining);
    const selectedUtxo = sortedUtxos[0];

    selectedUtxos.push(selectedUtxo);

    availableUtxos = availableUtxos.filter(utxo => !meshUtxosEqual(utxo, selectedUtxo));

    const selectedAssets = meshUtxoToAssets(selectedUtxo);
    for (const asset in selectedAssets) {
      if (!totalRemaining[asset]) {
        totalRemaining[asset] = 0n;
      }

      const utxoAmount = BigInt(selectedAssets[asset] || 0);
      const remaining = totalRemaining[asset];

      if (utxoAmount >= remaining) {
        totalRemaining[asset] = 0n;
      } else {
        totalRemaining[asset] = remaining - utxoAmount;
      }
    }
  }

  if (!isEnoughValue(totalRemaining)) {
    throw new Error('Insufficient funds: Not enough UTXOs to cover the required amount');
  }

  return selectedUtxos;
}

/**
 * Advanced coin selection with change optimization
 * Attempts to minimize transaction size and fees
 */
export function coinSelectOptimized(value: Assets, utxos: UTxO[], maxUtxos: number = UPPERBOUND): UTxO[] {
  try {
    const selected = coinSelect(value, utxos);

    if (selected.length > maxUtxos) {
      const largeUtxos = [...utxos]
        .sort((a, b) => {
          const sumAssets = (u: UTxO) =>
            Object.values(meshUtxoToAssets(u)).reduce((sum, amt) => sum + BigInt(amt), 0n);
          const aTotal = sumAssets(a);
          const bTotal = sumAssets(b);
          return Number(bTotal - aTotal);
        })
        .slice(0, maxUtxos * 2);

      try {
        const optimized = coinSelect(value, largeUtxos);
        if (optimized.length <= maxUtxos) {
          return optimized;
        }
      } catch {
        // Fall back to original selection if optimization fails
      }
    }

    return selected;
  } catch {
    const largestFirst = [...utxos]
      .sort((a, b) => {
        const sumAssets = (u: UTxO) =>
          Object.values(meshUtxoToAssets(u)).reduce((sum, amt) => sum + BigInt(amt), 0n);
        const aTotal = sumAssets(a);
        const bTotal = sumAssets(b);
        return Number(bTotal - aTotal);
      })
      .slice(0, Math.min(maxUtxos, utxos.length));

    return coinSelect(value, largestFirst);
  }
}

/**
 * Calculate the total value of selected UTXOs
 */
export function calculateUtxoTotal(utxos: UTxO[]): Assets {
  const total: Assets = {};

  for (const utxo of utxos) {
    for (const [asset, amount] of Object.entries(meshUtxoToAssets(utxo))) {
      if (!total[asset]) {
        total[asset] = 0n;
      }
      total[asset] = total[asset] + BigInt(amount);
    }
  }

  return total;
}

/**
 * Calculate change amount after coin selection
 */
export function calculateChange(selectedUtxos: UTxO[], requiredValue: Assets): Assets {
  const totalSelected = calculateUtxoTotal(selectedUtxos);
  const change: Assets = {};

  for (const [asset, totalAmount] of Object.entries(totalSelected)) {
    const requiredAmount = requiredValue[asset] || 0n;
    const changeAmount = totalAmount - requiredAmount;

    if (changeAmount > 0n) {
      change[asset] = changeAmount;
    }
  }

  return change;
}

/**
 * Validate that selected UTXOs cover the required value
 */
export function validateCoinSelection(selectedUtxos: UTxO[], requiredValue: Assets): boolean {
  const totalSelected = calculateUtxoTotal(selectedUtxos);

  for (const [asset, requiredAmount] of Object.entries(requiredValue)) {
    const selectedAmount = totalSelected[asset] || 0n;
    if (selectedAmount < requiredAmount) {
      return false;
    }
  }

  return true;
}

/**
 * Filter UTXOs by minimum ADA value (to avoid dust)
 */
export function filterDustUtxos(utxos: UTxO[], minAdaValue: bigint = 1000000n): UTxO[] {
  return utxos.filter(utxo => {
    const adaAmount = BigInt(meshUtxoToAssets(utxo)['lovelace'] || 0);
    return adaAmount >= minAdaValue;
  });
}

/**
 * Get UTXO selection statistics
 */
export function getUtxoSelectionStats(selectedUtxos: UTxO[], requiredValue: Assets) {
  const totalSelected = calculateUtxoTotal(selectedUtxos);
  const change = calculateChange(selectedUtxos, requiredValue);

  const adaChange = change['lovelace'] || 0n;
  const totalAda = totalSelected['lovelace'] || 0n;

  return {
    utxoCount: selectedUtxos.length,
    totalValue: totalSelected,
    changeValue: change,
    adaEfficiency: totalAda > 0n ? Number((adaChange * 100n) / totalAda) : 0,
    isValid: validateCoinSelection(selectedUtxos, requiredValue)
  };
}
