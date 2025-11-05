import { Contact } from './ContactMenu';

/**
 * Load contacts from localStorage
 * @param key - The localStorage key
 * @param fallback - Fallback contacts if nothing is stored
 * @returns Array of contacts
 */
export const loadContactsFromStorage = (key: string, fallback: Contact[] = []): Contact[] => {
  if (typeof window === 'undefined') return fallback;
  
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that it's an array
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading contacts from localStorage:', error);
  }
  return fallback;
};

/**
 * Save contacts to localStorage
 * @param key - The localStorage key
 * @param contacts - Array of contacts to save
 */
export const saveContactsToStorage = (key: string, contacts: Contact[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(contacts));
  } catch (error) {
    console.error('Error saving contacts to localStorage:', error);
    // Handle quota exceeded or other localStorage errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Consider clearing old data.');
    }
  }
};

/**
 * Clear contacts from localStorage
 * @param key - The localStorage key
 */
export const clearContactsFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing contacts from localStorage:', error);
  }
};

/**
 * Get a single contact by ID from localStorage
 * @param key - The localStorage key
 * @param contactId - The contact ID to find
 * @returns Contact or null if not found
 */
export const getContactFromStorage = (key: string, contactId: string): Contact | null => {
  const contacts = loadContactsFromStorage(key);
  return contacts.find(contact => contact.id === contactId) || null;
};

/**
 * Hook-compatible storage utilities
 */
export const contactStorage = {
  load: loadContactsFromStorage,
  save: saveContactsToStorage,
  clear: clearContactsFromStorage,
  getById: getContactFromStorage,
};




