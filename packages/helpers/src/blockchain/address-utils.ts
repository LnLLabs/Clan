/**
 * Address utility functions for blockchain operations
 */

export interface AddressFormatOptions {
  truncate?: boolean;
  truncateLength?: number;
  showPrefix?: boolean;
  showSuffix?: boolean;
}

/**
 * Formats an address for display purposes
 */
export function formatAddress(
  address: string,
  options: AddressFormatOptions = {}
): string {
  const {
    truncate = true,
    truncateLength = 8,
    showPrefix = true,
    showSuffix = true
  } = options;

  if (!address || typeof address !== 'string') {
    return '';
  }

  if (!truncate || address.length <= truncateLength * 2) {
    return address;
  }

  const prefix = showPrefix ? address.slice(0, truncateLength) : '';
  const suffix = showSuffix ? address.slice(-truncateLength) : '';

  if (prefix && suffix) {
    return `${prefix}...${suffix}`;
  } else if (prefix) {
    return `${prefix}...`;
  } else if (suffix) {
    return `...${suffix}`;
  }

  return address;
}

/**
 * Validates if a string is a valid blockchain address
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Basic length checks (addresses are typically 50-100+ characters)
  if (address.length < 20 || address.length > 200) {
    return false;
  }

  // Check for valid characters (hex, bech32, etc.)
  const validChars = /^[a-zA-Z0-9]+$/;
  return validChars.test(address);
}

/**
 * Extracts the network prefix from an address if available
 */
export function getAddressNetwork(address: string): string | null {
  if (!address) return null;

  // For Cardano addresses, check for network prefixes
  if (address.startsWith('addr1')) return 'mainnet';
  if (address.startsWith('addr_test1')) return 'testnet';
  if (address.startsWith('stake1')) return 'mainnet';
  if (address.startsWith('stake_test1')) return 'testnet';

  // For Ethereum addresses
  if (address.startsWith('0x')) return 'ethereum';

  return null;
}

/**
 * Compares two addresses for equality (case-insensitive)
 */
export function addressesEqual(address1: string, address2: string): boolean {
  if (!address1 || !address2) return false;

  // Normalize addresses by removing any formatting
  const normalized1 = address1.toLowerCase().trim();
  const normalized2 = address2.toLowerCase().trim();

  return normalized1 === normalized2;
}

/**
 * Checks if an address belongs to the current user
 */
export function isOwnAddress(address: string, userAddresses: string[]): boolean {
  if (!address || !Array.isArray(userAddresses)) return false;

  return userAddresses.some(userAddress => addressesEqual(address, userAddress));
}

/**
 * Generates a checksum for an address (for validation purposes)
 */
export function generateAddressChecksum(address: string): string {
  if (!address) return '';

  let checksum = 0;
  for (let i = 0; i < address.length; i++) {
    checksum = (checksum + address.charCodeAt(i)) % 256;
  }

  return checksum.toString(16).padStart(2, '0');
}

/**
 * Validates an address checksum
 */
export function validateAddressChecksum(address: string, checksum: string): boolean {
  if (!address || !checksum) return false;

  const calculatedChecksum = generateAddressChecksum(address);
  return calculatedChecksum === checksum.toLowerCase();
}
