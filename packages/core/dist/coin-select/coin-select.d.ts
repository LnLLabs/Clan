import { UTxO, Assets } from '../types';
/**
 * Coin selection algorithm for UTXO selection
 * Based on the original BroClanWallet implementation
 * Uses a greedy approach optimized for multi-asset transactions
 */
export declare function coinSelect(value: Assets, utxos: UTxO[]): UTxO[];
/**
 * Advanced coin selection with change optimization
 * Attempts to minimize transaction size and fees
 */
export declare function coinSelectOptimized(value: Assets, utxos: UTxO[], maxUtxos?: number): UTxO[];
/**
 * Calculate the total value of selected UTXOs
 */
export declare function calculateUtxoTotal(utxos: UTxO[]): Assets;
/**
 * Calculate change amount after coin selection
 */
export declare function calculateChange(selectedUtxos: UTxO[], requiredValue: Assets): Assets;
/**
 * Validate that selected UTXOs cover the required value
 */
export declare function validateCoinSelection(selectedUtxos: UTxO[], requiredValue: Assets): boolean;
/**
 * Filter UTXOs by minimum ADA value (to avoid dust)
 */
export declare function filterDustUtxos(utxos: UTxO[], minAdaValue?: bigint): UTxO[];
/**
 * Get UTXO selection statistics
 */
export declare function getUtxoSelectionStats(selectedUtxos: UTxO[], requiredValue: Assets): {
    utxoCount: number;
    totalValue: Assets;
    changeValue: Assets;
    adaEfficiency: number;
    isValid: boolean;
};
//# sourceMappingURL=coin-select.d.ts.map