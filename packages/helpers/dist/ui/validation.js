"use strict";
/**
 * Validation utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isValidUrl = isValidUrl;
exports.validatePasswordStrength = validatePasswordStrength;
exports.isValidJSON = isValidJSON;
exports.isInRange = isInRange;
exports.matchesPattern = matchesPattern;
exports.validateRequiredFields = validateRequiredFields;
exports.validateStringLength = validateStringLength;
exports.validateArray = validateArray;
exports.combineValidations = combineValidations;
exports.copyToClipboard = copyToClipboard;
exports.formatAddress = formatAddress;
exports.formatAssetQuantity = formatAssetQuantity;
/**
 * Email validation
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * URL validation
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function validatePasswordStrength(password, options = {}) {
    const { minLength = 8, requireUppercase = true, requireLowercase = true, requireNumbers = true, requireSpecialChars = false } = options;
    const errors = [];
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    let strength = 'weak';
    if (errors.length === 0) {
        const score = password.length >= 12 ? 2 :
            password.length >= 8 ? 1 : 0;
        strength = score === 2 ? 'strong' : score === 1 ? 'medium' : 'weak';
    }
    return {
        isValid: errors.length === 0,
        errors,
        strength
    };
}
/**
 * Validates if a string is a valid JSON
 */
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Validates if a value is within a numeric range
 */
function isInRange(value, min, max) {
    if (min !== undefined && value < min)
        return false;
    if (max !== undefined && value > max)
        return false;
    return true;
}
/**
 * Validates if a string matches a regex pattern
 */
function matchesPattern(value, pattern) {
    return pattern.test(value);
}
/**
 * Validates required fields in an object
 */
function validateRequiredFields(obj, requiredFields) {
    const missingFields = [];
    for (const field of requiredFields) {
        const value = obj[field];
        if (value === undefined || value === null || value === '') {
            missingFields.push(field);
        }
    }
    return {
        isValid: missingFields.length === 0,
        missingFields
    };
}
/**
 * Validates string length
 */
function validateStringLength(str, minLength, maxLength) {
    if (minLength !== undefined && str.length < minLength)
        return false;
    if (maxLength !== undefined && str.length > maxLength)
        return false;
    return true;
}
/**
 * Validates if all values in an array pass a validation function
 */
function validateArray(array, validator) {
    return array.every(validator);
}
/**
 * Combines multiple validation results
 */
function combineValidations(...results) {
    const combined = {
        isValid: true,
        errors: [],
        warnings: []
    };
    for (const result of results) {
        combined.isValid = combined.isValid && result.isValid;
        combined.errors.push(...result.errors);
        if (result.warnings) {
            combined.warnings.push(...result.warnings);
        }
    }
    return combined;
}
// Clipboard utilities
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    }
    catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}
// Address formatting
function formatAddress(address, length = 8) {
    if (address.length <= length * 2)
        return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
}
// Asset formatting
function formatAssetQuantity(quantity, decimals = 6) {
    const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    if (isNaN(num))
        return '0';
    return num.toFixed(decimals);
}
// Notification helpers are exported from common/messaging
//# sourceMappingURL=validation.js.map