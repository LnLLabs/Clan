import { useState, useEffect, useRef } from "react";
import { Contact } from './ContactMenu';
import { loadContactsFromStorage } from './contactStorage';
import './ContactPicker.css';

export interface ContactPickerProps {
  storageKey?: string;
  onSelect: (contact: Contact) => void;
  onClose?: () => void;
  title?: string;
  searchPlaceholder?: string;
  selectedContactId?: string;
  showEmail?: boolean;
  className?: string;
  isModal?: boolean;
}

export const ContactPicker = ({
  storageKey = 'clan-contacts',
  onSelect,
  onClose,
  title = 'Select from Contact List',
  searchPlaceholder = 'Search contacts...',
  selectedContactId,
  showEmail = false,
  className = '',
  isModal = false
}: ContactPickerProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load contacts from storage
  useEffect(() => {
    const loaded = loadContactsFromStorage(storageKey);
    setContacts(loaded);

    // Set selected contact if provided
    if (selectedContactId) {
      const contact = loaded.find(c => c.id === selectedContactId);
      if (contact) {
        setSelectedContact(contact);
      }
    }
  }, [storageKey, selectedContactId]);

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle contact selection
  const handleSelect = (contact: Contact) => {
    setSelectedContact(contact);
    onSelect(contact);
    setSearchTerm('');
    if (onClose) {
      onClose();
    }
  };

  // Handle click outside to close (only in modal mode)
  useEffect(() => {
    if (!isModal) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModal, onClose]);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  const content = (
    <>
      <div className="contact-picker-header">
        <h2 className="contact-picker-title">{title}</h2>
      </div>

      <div className="contact-picker-search">
        <input
          ref={searchInputRef}
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="contact-picker-search-input"
        />
      </div>

      <div className="contact-picker-list">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              className={`contact-picker-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
              onClick={() => handleSelect(contact)}
            >
              <div className="contact-picker-item-content">
                <span className="contact-picker-item-name">{contact.name}</span>
                {showEmail && contact.email && (
                  <span className="contact-picker-item-email">{contact.email}</span>
                )}
              </div>
              {selectedContact?.id === contact.id && (
                <span className="contact-picker-checkmark">✓</span>
              )}
            </button>
          ))
        ) : (
          <div className="contact-picker-empty">
            {searchTerm ? 'No contacts match your search' : 'No contacts available'}
          </div>
        )}
      </div>
    </>
  );

  if (isModal) {
    return (
      <div className={`contact-picker-modal ${className}`}>
        <div className="contact-picker-overlay" />
        <div className="contact-picker-container" ref={containerRef}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`contact-picker ${className}`} ref={containerRef}>
      {content}
    </div>
  );
};

