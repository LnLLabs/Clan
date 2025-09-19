"use strict";
/**
 * Transaction details normalization utilities
 * Based on the original BroClanWallet normalizeTxDetails implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTxDetails = normalizeTxDetails;
exports.deepNormalizeTxDetails = deepNormalizeTxDetails;
exports.unwrapTxFormat = unwrapTxFormat;
exports.isWrappedFormat = isWrappedFormat;
exports.getFormatType = getFormatType;
exports.validateNormalizedTx = validateNormalizedTx;
exports.createTxSummary = createTxSummary;
exports.formatNormalizedTx = formatNormalizedTx;
/**
 * Normalize transaction details from various formats
 * Handles different output formats from Lucid and other libraries
 */
function normalizeTxDetails(txBody) {
    if (!txBody || typeof txBody !== 'object') {
        return null;
    }
    try {
        const normalized = { ...txBody };
        // Normalize outputs - handle wrapped format types
        if (normalized.outputs) {
            normalized.outputs = normalized.outputs.map((output) => {
                // Check if the output is an object with a single key (format type)
                const formatKeys = Object.keys(output);
                if (formatKeys.length === 1 && typeof output[formatKeys[0]] === 'object') {
                    // Return the inner object, which contains the actual output data
                    return output[formatKeys[0]];
                }
                return output;
            });
        }
        // Normalize inputs - handle wrapped format types
        if (normalized.inputs) {
            normalized.inputs = normalized.inputs.map((input) => {
                // Check if the input is an object with a single key (format type)
                const formatKeys = Object.keys(input);
                if (formatKeys.length === 1 && typeof input[formatKeys[0]] === 'object') {
                    // Return the inner object, which contains the actual input data
                    return input[formatKeys[0]];
                }
                return input;
            });
        }
        // Normalize collateral return - handle wrapped format
        if (normalized.collateral_return) {
            const formatKeys = Object.keys(normalized.collateral_return);
            if (formatKeys.length === 1 && typeof normalized.collateral_return[formatKeys[0]] === 'object') {
                normalized.collateral_return = normalized.collateral_return[formatKeys[0]];
            }
        }
        // Normalize reference inputs - handle wrapped format
        if (normalized.reference_inputs) {
            normalized.reference_inputs = normalized.reference_inputs.map((input) => {
                const formatKeys = Object.keys(input);
                if (formatKeys.length === 1 && typeof input[formatKeys[0]] === 'object') {
                    return input[formatKeys[0]];
                }
                return input;
            });
        }
        return normalized;
    }
    catch (error) {
        console.error('Error normalizing transaction details:', error);
        return null;
    }
}
/**
 * Deep normalize transaction details recursively
 * Handles nested objects and arrays
 */
function deepNormalizeTxDetails(txBody) {
    if (!txBody || typeof txBody !== 'object') {
        return null;
    }
    try {
        const normalized = { ...txBody };
        // Recursively normalize all properties
        for (const [key, value] of Object.entries(normalized)) {
            if (Array.isArray(value)) {
                // Handle arrays
                normalized[key] = value.map((item) => {
                    if (typeof item === 'object' && item !== null) {
                        const formatKeys = Object.keys(item);
                        if (formatKeys.length === 1 && typeof item[formatKeys[0]] === 'object') {
                            return deepNormalizeTxDetails(item[formatKeys[0]]) || item[formatKeys[0]];
                        }
                    }
                    return item;
                });
            }
            else if (typeof value === 'object' && value !== null) {
                // Handle nested objects
                const formatKeys = Object.keys(value);
                if (formatKeys.length === 1 && typeof value[formatKeys[0]] === 'object') {
                    normalized[key] = deepNormalizeTxDetails(value[formatKeys[0]]) || value;
                }
            }
        }
        return normalized;
    }
    catch (error) {
        console.error('Error deep normalizing transaction details:', error);
        return null;
    }
}
/**
 * Extract the actual transaction data from a wrapped format
 */
function unwrapTxFormat(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }
    const keys = Object.keys(data);
    if (keys.length === 1 && typeof data[keys[0]] === 'object') {
        return data[keys[0]];
    }
    return data;
}
/**
 * Check if transaction data is in wrapped format
 */
function isWrappedFormat(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    const keys = Object.keys(data);
    return keys.length === 1 && typeof data[keys[0]] === 'object';
}
/**
 * Get the format type from wrapped transaction data
 */
function getFormatType(data) {
    if (!isWrappedFormat(data)) {
        return null;
    }
    return Object.keys(data)[0];
}
/**
 * Validate normalized transaction structure
 */
function validateNormalizedTx(tx) {
    const errors = [];
    const warnings = [];
    // Check required fields
    if (!tx.fee && tx.fee !== 0) {
        warnings.push('Missing fee field');
    }
    // Validate outputs
    if (tx.outputs) {
        tx.outputs.forEach((output, index) => {
            if (!output.address) {
                errors.push(`Output ${index} missing address`);
            }
            if (!output.amount) {
                errors.push(`Output ${index} missing amount`);
            }
        });
    }
    else {
        warnings.push('No outputs found');
    }
    // Validate inputs
    if (tx.inputs) {
        tx.inputs.forEach((input, index) => {
            if (!input.txHash) {
                errors.push(`Input ${index} missing txHash`);
            }
            if (typeof input.outputIndex !== 'number' && input.outputIndex !== 0) {
                errors.push(`Input ${index} missing or invalid outputIndex`);
            }
        });
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Create a standardized transaction summary
 */
function createTxSummary(tx) {
    return {
        inputCount: tx.inputs?.length || 0,
        outputCount: tx.outputs?.length || 0,
        totalInputValue: calculateTotalValue(tx.inputs),
        totalOutputValue: calculateTotalValue(tx.outputs),
        fee: tx.fee || null,
        hasMetadata: !!tx.metadata,
        hasScripts: !!(tx.script_data_hash || tx.reference_inputs?.length)
    };
}
/**
 * Calculate total value from inputs or outputs
 */
function calculateTotalValue(items) {
    if (!items || !Array.isArray(items)) {
        return {};
    }
    const total = {};
    items.forEach((item) => {
        const amount = item.amount || item.assets || {};
        // Handle different amount formats
        if (typeof amount === 'object') {
            for (const [asset, value] of Object.entries(amount)) {
                if (!total[asset]) {
                    total[asset] = 0n;
                }
                try {
                    total[asset] = total[asset] + BigInt(value);
                }
                catch {
                    // Skip invalid values
                }
            }
        }
    });
    return total;
}
/**
 * Convert normalized transaction to a more readable format
 */
function formatNormalizedTx(tx) {
    const summary = createTxSummary(tx);
    const validation = validateNormalizedTx(tx);
    return {
        summary,
        validation,
        details: tx,
        formatted: {
            inputs: tx.inputs?.map((input, i) => ({
                index: i,
                txHash: input.txHash,
                outputIndex: input.outputIndex,
                address: input.address,
                value: input.amount || input.assets
            })),
            outputs: tx.outputs?.map((output, i) => ({
                index: i,
                address: output.address,
                value: output.amount,
                datum: output.datum,
                datumHash: output.datumHash,
                scriptRef: output.scriptRef
            })),
            metadata: tx.metadata,
            scripts: {
                scriptDataHash: tx.script_data_hash,
                referenceInputs: tx.reference_inputs
            }
        }
    };
}
//# sourceMappingURL=normalize-tx-details.js.map