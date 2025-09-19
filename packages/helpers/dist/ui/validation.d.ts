/**
 * Validation utility functions
 */
/**
 * Email validation
 */
export declare function isValidEmail(email: string): boolean;
/**
 * URL validation
 */
export declare function isValidUrl(url: string): boolean;
/**
 * Password strength validation
 */
export interface PasswordStrengthOptions {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
}
export declare function validatePasswordStrength(password: string, options?: PasswordStrengthOptions): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
};
/**
 * Validates if a string is a valid JSON
 */
export declare function isValidJSON(str: string): boolean;
/**
 * Validates if a value is within a numeric range
 */
export declare function isInRange(value: number, min?: number, max?: number): boolean;
/**
 * Validates if a string matches a regex pattern
 */
export declare function matchesPattern(value: string, pattern: RegExp): boolean;
/**
 * Validates required fields in an object
 */
export declare function validateRequiredFields<T extends Record<string, any>>(obj: T, requiredFields: (keyof T)[]): {
    isValid: boolean;
    missingFields: string[];
};
/**
 * Validates string length
 */
export declare function validateStringLength(str: string, minLength?: number, maxLength?: number): boolean;
/**
 * Validates if all values in an array pass a validation function
 */
export declare function validateArray<T>(array: T[], validator: (item: T) => boolean): boolean;
/**
 * Generic validation result type
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}
/**
 * Combines multiple validation results
 */
export declare function combineValidations(...results: ValidationResult[]): ValidationResult;
export declare function copyToClipboard(text: string): Promise<void>;
export declare function formatAddress(address: string, length?: number): string;
export declare function formatAssetQuantity(quantity: string | number, decimals?: number): string;
//# sourceMappingURL=validation.d.ts.map