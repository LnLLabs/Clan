import { useState, useEffect, useRef } from "react";
import { loadContactsFromStorage, saveContactsToStorage, exportContactsToFile, importContactsFromFile, mergeContacts } from './contactStorage';

export interface Contact {
  id: string;
  name: string;
  address: string;
  email?: string;
}

export interface ContactAction {
  id: string;
  label: string;
  icon: string;
  onClick: (contact: Contact) => void;
}

export interface ContactsMenuProps {
  initialContacts?: Contact[];
  onContactsChange?: (contacts: Contact[]) => void;
  actions?: ContactAction[];
  storageKey?: string;
  enableLocalStorage?: boolean;
}

const defaultContacts: Contact[] = [
  {
    id: '1',
    name: 'John',
    address: 'addr1q8ejx7t9v...',
    email: ''
  },
  {
    id: '2',
    name: 'Mary',
    address: 'addr1q8ejx7t9v...',
    email: 'mary@gmail.com'
  },
  {
    id: '3',
    name: 'Alice',
    address: 'addr1q8ejx7t9v...',
    email: 'alice@hotmail.com'
  },
  {
    id: '4',
    name: 'Mom',
    address: 'addr1q8ejx7t9v...',
    email: 'smoms@gmail.com'
  },
  {
    id: '5',
    name: 'Wife',
    address: 'addr1q8ejx7t9v...',
    email: 'teresa@gmail.com'
  },
  {
    id: '6',
    name: 'Son',
    address: 'addr1q8ejx7t9v...',
    email: 'artistmania@gmail.com'
  }
];

const defaultActions: ContactAction[] = [];

export const ContactsMenu = ({ 
  initialContacts = defaultContacts,
  onContactsChange,
  actions = defaultActions,
  storageKey = 'clan-contacts',
  enableLocalStorage = true
}: ContactsMenuProps) => {
  // Initialize contacts from localStorage or fallback to initial contacts
  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (enableLocalStorage) {
      return loadContactsFromStorage(storageKey, initialContacts);
    }
    return initialContacts;
  });
  
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [expandedActionsId, setExpandedActionsId] = useState<string | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage whenever contacts change
  useEffect(() => {
    if (enableLocalStorage) {
      saveContactsToStorage(storageKey, contacts);
    }
    onContactsChange?.(contacts);
  }, [contacts, enableLocalStorage, storageKey, onContactsChange]);

  // Cleanup delete animation on unmount
  useEffect(() => {
    return () => {
      if ((window as any).deleteAnimationFrame) {
        cancelAnimationFrame((window as any).deleteAnimationFrame);
        (window as any).deleteAnimationFrame = null;
      }
    };
  }, []);

  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    address: '',
    email: ''
  });

  const handleAddContact = () => {
    if (!formData.name || !formData.address) return;

    const newContact: Contact = {
      id: Date.now().toString(),
      name: formData.name,
      address: formData.address,
      email: formData.email || ''
    };

    setContacts([...contacts, newContact]);
    setFormData({ name: '', address: '', email: '' });
    setIsAddingContact(false);
  };

  const handleEditContact = () => {
    if (!editingContactId || !formData.name || !formData.address) return;

    setContacts(contacts.map(contact =>
      contact.id === editingContactId
        ? { ...contact, name: formData.name!, address: formData.address!, email: formData.email || '' }
        : contact
    ));
    setFormData({ name: '', address: '', email: '' });
    setEditingContactId(null);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
    setDeletingContactId(null);
    setDeleteProgress(0);
  };

  // Long press handlers for delete
  const handleDeleteStart = (id: string) => {
    setDeletingContactId(id);
    setDeleteProgress(0);

    // Animate progress over 1 second using requestAnimationFrame
    const startTime = performance.now();
    const duration = 1000; // 1 second

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      setDeleteProgress(progress);

      if (progress >= 100) {
        handleDeleteContact(id);
      } else {
        (window as any).deleteAnimationFrame = requestAnimationFrame(animate);
      }
    };

    (window as any).deleteAnimationFrame = requestAnimationFrame(animate);
  };

  const handleDeleteCancel = () => {
    if ((window as any).deleteAnimationFrame) {
      cancelAnimationFrame((window as any).deleteAnimationFrame);
      (window as any).deleteAnimationFrame = null;
    }
    setDeletingContactId(null);
    setDeleteProgress(0);
  };

  const startEditing = (contact: Contact) => {
    // If already editing this contact, cancel editing
    if (editingContactId === contact.id) {
      cancelEditing();
      return;
    }
    
    // Otherwise, start editing
    setEditingContactId(contact.id);
    setFormData({
      name: contact.name,
      address: contact.address,
      email: contact.email
    });
    setIsAddingContact(false);
  };

  const cancelEditing = () => {
    setEditingContactId(null);
    setIsAddingContact(false);
    setFormData({ name: '', address: '', email: '' });
  };

  const toggleActionsMenu = (id: string) => {
    setExpandedActionsId(expandedActionsId === id ? null : id);
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Export contacts to JSON file
  const handleExport = () => {
    try {
      exportContactsToFile(contacts);
      setMessage({ type: 'success', text: `Exported ${contacts.length} contact(s) successfully` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export contacts' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle file import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedContacts = await importContactsFromFile(file);
      
      if (!importedContacts) {
        setMessage({ type: 'error', text: 'Invalid file format or no valid contacts found' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      console.log('Current contacts:', contacts.length, contacts.map(c => ({ id: c.id, name: c.name })));
      console.log('Imported contacts:', importedContacts.length, importedContacts.map(c => ({ id: c.id, name: c.name })));

      // Merge imported contacts with existing ones
      const merged = mergeContacts(contacts, importedContacts);
      const addedCount = merged.length - contacts.length;
      
      console.log('Merged contacts:', merged.length, 'Added:', addedCount);
      console.log('Final contacts:', merged.map(c => ({ id: c.id, name: c.name })));
      
      setContacts(merged);
      
      if (addedCount > 0) {
        setMessage({ type: 'success', text: `Imported ${addedCount} new contact(s) successfully` });
      } else {
        setMessage({ type: 'success', text: 'Import completed (no new contacts added - duplicates skipped)' });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import contacts: ' + (error instanceof Error ? error.message : 'Unknown error') });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="contacts-menu">
      <div className="contacts-header">
        <h2>Contact List</h2>
        <div className="contacts-header-actions">
          <button
            className="btn-export"
            onClick={handleExport}
            title="Export contacts to JSON file"
          >
            <svg className="export-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export
          </button>
          <button
            className="btn-import"
            onClick={handleImportClick}
            title="Import contacts from JSON file"
          >
            <svg className="import-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 10L12 5L7 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>
      
      {message && (
        <div className={`contacts-message contacts-message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="contacts-container">
        {/* Search bar */}
        <div className="contacts-search">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="contacts-search-input"
          />
        </div>
        <div className="contacts-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
            <div key={contact.id}>
              <div className="contact-row">
                <div className="contact-info">
                  <span className="contact-name">{contact.name}</span>
                  <span className="contact-address">{contact.address}</span>
                  <span className="contact-email">{contact.email || ''}</span>
                </div>
                <div className="contact-actions">
                  <button
                    className="btn-edit"
                    onClick={() => startEditing(contact)}
                  >
                    <svg className="edit-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {actions.length === 1 ? (
                    <button
                      className="btn-actions btn-actions-single"
                      onClick={() => actions[0].onClick(contact)}
                    >
                      <span className="action-icon">{actions[0].icon}</span>
                      {actions[0].label}
                    </button>
                  ) : actions.length > 1 ? (
                    <div className="actions-dropdown">
                      <button
                        className={expandedActionsId === contact.id ? "btn-actions btn-actions-active" : "btn-actions"}
                        onClick={() => toggleActionsMenu(contact.id)}
                      >
                        <span className="actions-chevron">▼</span> Actions
                      </button>
                      {expandedActionsId === contact.id && (
                        <div className="actions-menu">
                          {actions.map((action) => (
                            <button 
                              key={action.id}
                              className="action-item"
                              onClick={() => {
                                action.onClick(contact);
                                setExpandedActionsId(null);
                              }}
                            >
                              <span className="action-icon">{action.icon}</span>
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                <button
                  className={`btn-delete ${deletingContactId === contact.id ? 'btn-delete-active' : ''}`}
                  onMouseDown={() => handleDeleteStart(contact.id)}
                  onMouseUp={handleDeleteCancel}
                  onMouseLeave={handleDeleteCancel}
                  onTouchStart={() => handleDeleteStart(contact.id)}
                  onTouchEnd={handleDeleteCancel}
                  onTouchCancel={handleDeleteCancel}
                  title="Hold to delete"
                >
                  {deletingContactId === contact.id ? (
                    <span className="delete-progress" style={{ width: `${deleteProgress}%` }} />
                  ) : null}
                  <span className="delete-icon">🗑️</span>
                </button>
                </div>
              </div>
              
              {/* Inline edit form */}
              {editingContactId === contact.id && (
                <div className="contact-form contact-form-inline">
                  <h3>Edit Contact</h3>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <div className="form-actions">
                    <button
                      className="btn-save"
                      onClick={handleEditContact}
                    >
                      Save Changes
                    </button>
                    <button className="btn-cancel" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            ))
          ) : (
            <div className="contacts-empty">
              {searchTerm ? 'No contacts match your search' : 'No contacts available'}
            </div>
          )}
        </div>

        {/* Add contact form at bottom */}
        {isAddingContact && (
          <div className="contact-form">
            <h3>Add New Contact</h3>
            <input
              type="text"
              placeholder="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <div className="form-actions">
              <button
                className="btn-save"
                onClick={handleAddContact}
              >
                Add Contact
              </button>
              <button className="btn-cancel" onClick={cancelEditing}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {!isAddingContact && !editingContactId && (
          <div className="add-contact-button-container">
          <button
            className="btn-add-contact"
            onClick={() => setIsAddingContact(true)}
          >
            <svg className="add-user-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 20C6 17.34 8.34 15 11 15H13C15.66 15 18 17.34 18 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M18 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add New Contact
          </button>
          </div>
        )}
      </div>
    </div>
  );
};
