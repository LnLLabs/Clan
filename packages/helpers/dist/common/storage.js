"use strict";
/**
 * Local storage utility functions with error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageItem = getStorageItem;
exports.setStorageItem = setStorageItem;
exports.removeStorageItem = removeStorageItem;
exports.isStorageAvailable = isStorageAvailable;
exports.getStorageUsage = getStorageUsage;
exports.clearStorage = clearStorage;
exports.createNamespacedStorage = createNamespacedStorage;
exports.setStorageItemWithExpiry = setStorageItemWithExpiry;
exports.getStorageItemWithExpiry = getStorageItemWithExpiry;
/**
 * Safely gets an item from localStorage
 */
function getStorageItem(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        if (item === null)
            return defaultValue || null;
        return JSON.parse(item);
    }
    catch (error) {
        console.warn(`Failed to get item from localStorage: ${key}`, error);
        return defaultValue || null;
    }
}
/**
 * Safely sets an item in localStorage
 */
function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    }
    catch (error) {
        console.warn(`Failed to set item in localStorage: ${key}`, error);
        return false;
    }
}
/**
 * Safely removes an item from localStorage
 */
function removeStorageItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    }
    catch (error) {
        console.warn(`Failed to remove item from localStorage: ${key}`, error);
        return false;
    }
}
/**
 * Checks if localStorage is available
 */
function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, 'test');
        localStorage.removeItem(test);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Gets storage usage information
 */
function getStorageUsage() {
    if (!isStorageAvailable())
        return null;
    try {
        // This is an approximation since localStorage doesn't provide direct usage info
        let used = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                used += localStorage[key].length + key.length;
            }
        }
        // Estimate available space (5MB is typical localStorage limit)
        const available = 5 * 1024 * 1024 - used;
        return { used, available };
    }
    catch {
        return null;
    }
}
/**
 * Clears all localStorage items
 */
function clearStorage() {
    try {
        localStorage.clear();
        return true;
    }
    catch (error) {
        console.warn('Failed to clear localStorage', error);
        return false;
    }
}
/**
 * Creates a storage wrapper with a namespace
 */
function createNamespacedStorage(namespace) {
    const prefix = `${namespace}::`;
    return {
        get: (key, defaultValue) => getStorageItem(`${prefix}${key}`, defaultValue),
        set: (key, value) => setStorageItem(`${prefix}${key}`, value),
        remove: (key) => removeStorageItem(`${prefix}${key}`),
        clear: () => {
            try {
                const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
                keys.forEach(key => localStorage.removeItem(key));
                return true;
            }
            catch {
                return false;
            }
        }
    };
}
function setStorageItemWithExpiry(key, value, ttlMs) {
    const expirableItem = {
        value,
        expiresAt: Date.now() + ttlMs
    };
    return setStorageItem(key, expirableItem);
}
function getStorageItemWithExpiry(key, defaultValue) {
    const item = getStorageItem(key);
    if (!item)
        return defaultValue || null;
    if (Date.now() > item.expiresAt) {
        removeStorageItem(key);
        return defaultValue || null;
    }
    return item.value;
}
//# sourceMappingURL=storage.js.map