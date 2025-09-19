import React, { useState } from 'react';
import { Modal } from '../../ui/modals/Modal';
import { Button } from '../../ui/buttons/Button';

export type ImportType = 'mnemonic' | 'private-key' | 'hardware' | 'watch-only';

export interface WalletImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importData: WalletImportData) => Promise<void>;
  supportedTypes?: ImportType[];
  className?: string;
}

export interface WalletImportData {
  type: ImportType;
  name: string;
  data: {
    mnemonic?: string;
    privateKey?: string;
    publicKey?: string;
    address?: string;
    derivationPath?: string;
    passphrase?: string;
  };
}

export const WalletImportModal: React.FC<WalletImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  supportedTypes = ['mnemonic', 'private-key', 'hardware', 'watch-only'],
  className = ''
}) => {
  const [selectedType, setSelectedType] = useState<ImportType>('mnemonic');
  const [walletName, setWalletName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Form data for different import types
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicPassphrase, setMnemonicPassphrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [address, setAddress] = useState('');
  const [derivationPath, setDerivationPath] = useState("m/1852'/1815'/0'/0/0");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setWalletName('');
    setMnemonic('');
    setMnemonicPassphrase('');
    setPrivateKey('');
    setPublicKey('');
    setAddress('');
    setDerivationPath("m/1852'/1815'/0'/0/0");
    setErrors({});
    setSelectedType('mnemonic');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!walletName.trim()) {
      newErrors.name = 'Wallet name is required';
    }

    switch (selectedType) {
      case 'mnemonic':
        if (!mnemonic.trim()) {
          newErrors.mnemonic = 'Mnemonic phrase is required';
        } else {
          const words = mnemonic.trim().split(/\s+/);
          if (words.length < 12 || words.length > 24) {
            newErrors.mnemonic = 'Mnemonic must be 12-24 words';
          }
        }
        break;

      case 'private-key':
        if (!privateKey.trim()) {
          newErrors.privateKey = 'Private key is required';
        } else if (!/^([0-9a-fA-F]{64}|[0-9a-fA-F]{128})$/.test(privateKey.trim())) {
          newErrors.privateKey = 'Invalid private key format';
        }
        break;

      case 'hardware':
        if (!publicKey.trim()) {
          newErrors.publicKey = 'Public key is required';
        }
        break;

      case 'watch-only':
        if (!address.trim()) {
          newErrors.address = 'Address is required';
        } else if (!address.startsWith('addr1') && !address.startsWith('addr_test1')) {
          newErrors.address = 'Invalid Cardano address format';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImport = async () => {
    if (!validateForm()) return;

    setIsImporting(true);
    try {
      const importData: WalletImportData = {
        type: selectedType,
        name: walletName.trim(),
        data: {}
      };

      switch (selectedType) {
        case 'mnemonic':
          importData.data = {
            mnemonic: mnemonic.trim(),
            derivationPath
          };
          if (mnemonicPassphrase.trim()) {
            importData.data.passphrase = mnemonicPassphrase.trim();
          }
          break;

        case 'private-key':
          importData.data = {
            privateKey: privateKey.trim(),
            derivationPath
          };
          break;

        case 'hardware':
          importData.data = {
            publicKey: publicKey.trim(),
            derivationPath
          };
          break;

        case 'watch-only':
          importData.data = {
            address: address.trim()
          };
          break;
      }

      await onImport(importData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      setErrors({ general: 'Failed to import wallet. Please check your input and try again.' });
    } finally {
      setIsImporting(false);
    }
  };

  const getTypeDescription = (type: ImportType): string => {
    switch (type) {
      case 'mnemonic':
        return 'Import using a 12-24 word recovery phrase';
      case 'private-key':
        return 'Import using a private key (hex format)';
      case 'hardware':
        return 'Connect to a hardware wallet';
      case 'watch-only':
        return 'Monitor an address without signing capability';
      default:
        return '';
    }
  };

  const getTypeIcon = (type: ImportType): string => {
    switch (type) {
      case 'mnemonic':
        return '📝';
      case 'private-key':
        return '🔑';
      case 'hardware':
        return '🔒';
      case 'watch-only':
        return '👁️';
      default:
        return '📱';
    }
  };

  const renderForm = () => {
    switch (selectedType) {
      case 'mnemonic':
        return (
          <div className="import-form">
            <div className="form-group">
              <label htmlFor="mnemonic">Mnemonic Phrase *</label>
              <textarea
                id="mnemonic"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Enter your 12-24 word mnemonic phrase"
                rows={4}
                className={errors.mnemonic ? 'error' : ''}
              />
              {errors.mnemonic && <span className="error-message">{errors.mnemonic}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="passphrase">Passphrase (Optional)</label>
              <input
                id="passphrase"
                type="password"
                value={mnemonicPassphrase}
                onChange={(e) => setMnemonicPassphrase(e.target.value)}
                placeholder="Enter BIP39 passphrase if used"
              />
            </div>

            <div className="form-group">
              <label htmlFor="derivation-path">Derivation Path</label>
              <input
                id="derivation-path"
                type="text"
                value={derivationPath}
                onChange={(e) => setDerivationPath(e.target.value)}
                placeholder="m/1852'/1815'/0'/0/0"
              />
              <small className="help-text">
                Default Cardano derivation path for Shelley-era addresses
              </small>
            </div>
          </div>
        );

      case 'private-key':
        return (
          <div className="import-form">
            <div className="form-group">
              <label htmlFor="private-key">Private Key *</label>
              <textarea
                id="private-key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key in hex format (64 or 128 characters)"
                rows={3}
                className={errors.privateKey ? 'error' : ''}
              />
              {errors.privateKey && <span className="error-message">{errors.privateKey}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="derivation-path">Derivation Path</label>
              <input
                id="derivation-path"
                type="text"
                value={derivationPath}
                onChange={(e) => setDerivationPath(e.target.value)}
                placeholder="m/1852'/1815'/0'/0/0"
              />
            </div>
          </div>
        );

      case 'hardware':
        return (
          <div className="import-form">
            <div className="hardware-import">
              <div className="hardware-icon">🔗</div>
              <h3>Connect Hardware Wallet</h3>
              <p>Connect your hardware wallet to import using your public key</p>

              <div className="form-group">
                <label htmlFor="public-key">Public Key *</label>
                <textarea
                  id="public-key"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="Enter your extended public key (xpub)"
                  rows={3}
                  className={errors.publicKey ? 'error' : ''}
                />
                {errors.publicKey && <span className="error-message">{errors.publicKey}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="derivation-path">Derivation Path</label>
                <input
                  id="derivation-path"
                  type="text"
                  value={derivationPath}
                  onChange={(e) => setDerivationPath(e.target.value)}
                  placeholder="m/1852'/1815'/0'/0/0"
                />
              </div>
            </div>
          </div>
        );

      case 'watch-only':
        return (
          <div className="import-form">
            <div className="form-group">
              <label htmlFor="address">Cardano Address *</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter the Cardano address to monitor"
                rows={2}
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
              <small className="help-text">
                This will create a watch-only wallet that can monitor the address but cannot sign transactions
              </small>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Wallet"
      size="xl"
      className={`wallet-import-modal ${className}`}
    >
      <div className="import-modal-content">
        {/* Import Type Selection */}
        <div className="import-types">
          <h3>Select Import Method</h3>
          <div className="type-grid">
            {supportedTypes.map((type) => (
              <div
                key={type}
                className={`type-option ${selectedType === type ? 'selected' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                <div className="type-icon">{getTypeIcon(type)}</div>
                <div className="type-info">
                  <h4>{type.replace('-', ' ').toUpperCase()}</h4>
                  <p>{getTypeDescription(type)}</p>
                </div>
                {selectedType === type && <div className="selected-indicator">✓</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Import Form */}
        <div className="import-form-section">
          <div className="form-group">
            <label htmlFor="wallet-name">Wallet Name *</label>
            <input
              id="wallet-name"
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Enter a name for your wallet"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {renderForm()}

          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="import-actions">
          <Button
            variant="secondary"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isImporting}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : 'Import Wallet'}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="notice-icon">⚠️</div>
          <div className="notice-content">
            <h4>Security Notice</h4>
            <p>
              Never share your mnemonic phrase or private keys with anyone.
              Make sure you are on the correct website and that your connection is secure.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WalletImportModal;

