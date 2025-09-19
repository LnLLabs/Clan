/**
 * Local storage utility functions with error handling
 */

/**
 * Safely gets an item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue || null;

    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to get item from localStorage: ${key}`, error);
    return defaultValue || null;
  }
}

/**
 * Safely sets an item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to set item in localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Safely removes an item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove item from localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Checks if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets storage usage information
 */
export function getStorageUsage(): { used: number; available: number } | null {
  if (!isStorageAvailable()) return null;

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
  } catch {
    return null;
  }
}

/**
 * Clears all localStorage items
 */
export function clearStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn('Failed to clear localStorage', error);
    return false;
  }
}

/**
 * Creates a storage wrapper with a namespace
 */
export function createNamespacedStorage(namespace: string) {
  const prefix = `${namespace}::`;

  return {
    get: <T>(key: string, defaultValue?: T): T | null =>
      getStorageItem(`${prefix}${key}`, defaultValue),

    set: <T>(key: string, value: T): boolean =>
      setStorageItem(`${prefix}${key}`, value),

    remove: (key: string): boolean =>
      removeStorageItem(`${prefix}${key}`),

    clear: (): boolean => {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
        keys.forEach(key => localStorage.removeItem(key));
        return true;
      } catch {
        return false;
      }
    }
  };
}

/**
 * Storage with expiration
 */
export interface ExpirableStorageItem<T> {
  value: T;
  expiresAt: number;
}

export function setStorageItemWithExpiry<T>(
  key: string,
  value: T,
  ttlMs: number
): boolean {
  const expirableItem: ExpirableStorageItem<T> = {
    value,
    expiresAt: Date.now() + ttlMs
  };

  return setStorageItem(key, expirableItem);
}

export function getStorageItemWithExpiry<T>(
  key: string,
  defaultValue?: T
): T | null {
  const item = getStorageItem<ExpirableStorageItem<T>>(key);

  if (!item) return defaultValue || null;

  if (Date.now() > item.expiresAt) {
    removeStorageItem(key);
    return defaultValue || null;
  }

  return item.value;
}

