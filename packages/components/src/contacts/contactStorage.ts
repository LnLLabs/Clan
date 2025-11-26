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
 * Export contacts to a JSON file
 * @param contacts - Array of contacts to export
 * @param filename - Optional filename (defaults to contacts-YYYY-MM-DD.json)
 */
export const exportContactsToFile = (contacts: Contact[], filename?: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const dataStr = JSON.stringify(contacts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    if (!filename) {
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      filename = `contacts-${dateStr}.json`;
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting contacts:', error);
    throw error;
  }
};

/**
 * Validate imported contact data
 * @param data - Data to validate
 * @returns Validated array of contacts or null if invalid
 */
export const validateImportedContacts = (data: any): Contact[] | null => {
  if (!data) return null;
  
  // Handle both array format and object with contacts property
  let contactsArray: any[] = [];
  if (Array.isArray(data)) {
    contactsArray = data;
  } else if (data.contacts && Array.isArray(data.contacts)) {
    contactsArray = data.contacts;
  } else {
    return null;
  }
  
  // Validate each contact
  const validContacts: Contact[] = [];
  for (const contact of contactsArray) {
    if (
      contact &&
      typeof contact === 'object' &&
      typeof contact.name === 'string' &&
      contact.name.trim() !== '' &&
      typeof contact.address === 'string' &&
      contact.address.trim() !== ''
    ) {
      // Preserve ID if it exists and is a valid string, otherwise generate a new one
      const contactId = (contact.id && typeof contact.id === 'string' && contact.id.trim() !== '') 
        ? contact.id.trim() 
        : Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      validContacts.push({
        id: contactId,
        name: contact.name.trim(),
        address: contact.address.trim(),
        email: contact.email && typeof contact.email === 'string' ? contact.email.trim() : ''
      });
    }
  }
  
  return validContacts.length > 0 ? validContacts : null;
};

/**
 * Import contacts from a file
 * @param file - File to import
 * @returns Promise resolving to validated contacts or null
 */
export const importContactsFromFile = (file: File): Promise<Contact[] | null> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('File reading not available'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const validated = validateImportedContacts(parsed);
        resolve(validated);
      } catch (error) {
        console.error('Error parsing imported file:', error);
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Merge imported contacts with existing contacts
 * @param existing - Existing contacts
 * @param imported - Imported contacts
 * @returns Merged contacts array (duplicates by ID are skipped)
 */
export const mergeContacts = (existing: Contact[], imported: Contact[]): Contact[] => {
  const existingIds = new Set(existing.map(c => c.id));
  const existingByAddress = new Map(existing.map(c => [c.address.toLowerCase(), c]));
  
  const newContacts = imported.filter(contact => {
    // If contact has an ID, only check by ID (allows restoring deleted contacts)
    if (contact.id) {
      // Skip only if ID already exists (true duplicate)
      if (existingIds.has(contact.id)) {
        return false;
      }
      // If ID doesn't exist, add it (even if address matches - could be restoring a deleted contact)
      return true;
    }
    
    // If contact doesn't have an ID, check by address to avoid duplicates
    // But only skip if the existing contact with same address also has no ID or different name
    const existingContact = existingByAddress.get(contact.address.toLowerCase());
    if (existingContact) {
      // Skip if address matches and it's likely the same contact
      return false;
    }
    
    return true;
  });
  
  return [...existing, ...newContacts];
};

/**
 * Hook-compatible storage utilities
 */
export const contactStorage = {
  load: loadContactsFromStorage,
  save: saveContactsToStorage,
  clear: clearContactsFromStorage,
  getById: getContactFromStorage,
  export: exportContactsToFile,
  import: importContactsFromFile,
  validate: validateImportedContacts,
  merge: mergeContacts,
};








