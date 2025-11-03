import { useState, useEffect } from "react";
import { loadContactsFromStorage, saveContactsToStorage } from './contactStorage';

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

  return (
    <div className="contacts-menu">
      <div className="contacts-header">
        <h2>Contact List</h2>
      </div>

      <div className="contacts-container">
        <div className="contacts-list">
    {contacts.map((contact) => (
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
                    ✏️ Edit
                  </button>
                  <div className="actions-dropdown">
                    <button
                      className="btn-actions"
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
    ))}
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
          <button
            className="btn-add-contact"
            onClick={() => setIsAddingContact(true)}
          >
            👤 Add New Contact
          </button>
        )}
      </div>
    </div>
  );
};
