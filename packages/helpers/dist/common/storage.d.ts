/**
 * Local storage utility functions with error handling
 */
/**
 * Safely gets an item from localStorage
 */
export declare function getStorageItem<T>(key: string, defaultValue?: T): T | null;
/**
 * Safely sets an item in localStorage
 */
export declare function setStorageItem<T>(key: string, value: T): boolean;
/**
 * Safely removes an item from localStorage
 */
export declare function removeStorageItem(key: string): boolean;
/**
 * Checks if localStorage is available
 */
export declare function isStorageAvailable(): boolean;
/**
 * Gets storage usage information
 */
export declare function getStorageUsage(): {
    used: number;
    available: number;
} | null;
/**
 * Clears all localStorage items
 */
export declare function clearStorage(): boolean;
/**
 * Creates a storage wrapper with a namespace
 */
export declare function createNamespacedStorage(namespace: string): {
    get: <T>(key: string, defaultValue?: T) => T | null;
    set: <T>(key: string, value: T) => boolean;
    remove: (key: string) => boolean;
    clear: () => boolean;
};
/**
 * Storage with expiration
 */
export interface ExpirableStorageItem<T> {
    value: T;
    expiresAt: number;
}
export declare function setStorageItemWithExpiry<T>(key: string, value: T, ttlMs: number): boolean;
export declare function getStorageItemWithExpiry<T>(key: string, defaultValue?: T): T | null;
//# sourceMappingURL=storage.d.ts.map