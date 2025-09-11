/**
 * Formatting utility functions for UI display
 */

/**
 * Formats a number as currency
 */
export function formatCurrency(
  amount: number | bigint,
  currency = 'USD',
  options: Intl.NumberFormatOptions = {}
): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(numAmount);
}

/**
 * Formats a number with compact notation (K, M, B)
 */
export function formatCompactNumber(
  num: number | bigint,
  options: Intl.NumberFormatOptions = {}
): string {
  const numValue = typeof num === 'bigint' ? Number(num) : num;

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
    ...options
  }).format(numValue);
}

/**
 * Formats a percentage
 */
export function formatPercentage(
  value: number,
  decimals = 2,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    ...options
  }).format(value / 100);
}

/**
 * Formats a date in a human-readable format
 */
export function formatDate(
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }).format(dateObj);
}

/**
 * Formats a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | number | string,
  baseDate: Date = new Date()
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  const diffInMs = baseDate.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDate(dateObj);
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts camelCase to Title Case
 */
export function camelToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Formats a transaction hash for display
 */
export function formatTxHash(hash: string, prefixLength = 8, suffixLength = 8): string {
  if (hash.length <= prefixLength + suffixLength) return hash;
  return `${hash.slice(0, prefixLength)}...${hash.slice(-suffixLength)}`;
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(
  num: number | bigint,
  options: Intl.NumberFormatOptions = {}
): string {
  const numValue = typeof num === 'bigint' ? Number(num) : num;

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    ...options
  }).format(numValue);
}
