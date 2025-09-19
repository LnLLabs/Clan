/**
 * Transaction details normalization utilities
 * Based on the original BroClanWallet normalizeTxDetails implementation
 */
export interface NormalizedTransaction {
    inputs?: any[];
    outputs?: any[];
    collateral?: any[];
    collateral_return?: any;
    reference_inputs?: any[];
    mint?: any;
    script_data_hash?: string;
    network_id?: number;
    fee?: number;
    ttl?: number;
    validity_start_interval?: number;
    metadata?: any;
    [key: string]: any;
}
/**
 * Normalize transaction details from various formats
 * Handles different output formats from Lucid and other libraries
 */
export declare function normalizeTxDetails(txBody: any): NormalizedTransaction | null;
/**
 * Deep normalize transaction details recursively
 * Handles nested objects and arrays
 */
export declare function deepNormalizeTxDetails(txBody: any): NormalizedTransaction | null;
/**
 * Extract the actual transaction data from a wrapped format
 */
export declare function unwrapTxFormat(data: any): any;
/**
 * Check if transaction data is in wrapped format
 */
export declare function isWrappedFormat(data: any): boolean;
/**
 * Get the format type from wrapped transaction data
 */
export declare function getFormatType(data: any): string | null;
/**
 * Validate normalized transaction structure
 */
export declare function validateNormalizedTx(tx: NormalizedTransaction): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Create a standardized transaction summary
 */
export declare function createTxSummary(tx: NormalizedTransaction): {
    inputCount: number;
    outputCount: number;
    totalInputValue: any;
    totalOutputValue: any;
    fee: number | null;
    hasMetadata: boolean;
    hasScripts: boolean;
};
/**
 * Convert normalized transaction to a more readable format
 */
export declare function formatNormalizedTx(tx: NormalizedTransaction): any;
//# sourceMappingURL=normalize-tx-details.d.ts.map