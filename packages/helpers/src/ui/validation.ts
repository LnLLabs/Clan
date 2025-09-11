/**
 * Validation utility functions
 */

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

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

export function validatePasswordStrength(
  password: string,
  options: PasswordStrengthOptions = {}
): { isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' } {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false
  } = options;

  const errors: string[] = [];

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

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
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
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a value is within a numeric range
 */
export function isInRange(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Validates if a string matches a regex pattern
 */
export function matchesPattern(
  value: string,
  pattern: RegExp
): boolean {
  return pattern.test(value);
}

/**
 * Validates required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = obj[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field as string);
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
export function validateStringLength(
  str: string,
  minLength?: number,
  maxLength?: number
): boolean {
  if (minLength !== undefined && str.length < minLength) return false;
  if (maxLength !== undefined && str.length > maxLength) return false;
  return true;
}

/**
 * Validates if all values in an array pass a validation function
 */
export function validateArray<T>(
  array: T[],
  validator: (item: T) => boolean
): boolean {
  return array.every(validator);
}

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
export function combineValidations(
  ...results: ValidationResult[]
): ValidationResult {
  const combined: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  for (const result of results) {
    combined.isValid = combined.isValid && result.isValid;
    combined.errors.push(...result.errors);
    if (result.warnings) {
      combined.warnings!.push(...result.warnings);
    }
  }

  return combined;
}
