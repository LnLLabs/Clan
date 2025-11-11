import React, { useState, useEffect } from 'react';
import { Assets, UTxO, WalletInterface, TransactionBuildOptions } from '@clan/framework-core';
import { coinSelect } from '@clan/framework-core';
import { Button } from '../../ui/buttons/Button';
import { Modal } from '../../ui/modals/Modal';
import { ContactPicker } from '../../contacts/ContactPicker';
import { AssetPicker, UIAsset, SelectedAsset } from '../asset-picker/AssetPicker';

export interface TransactionRecipient {
  address: string;
  assets: Assets;
  datum?: string;
  datumHash?: string;
}

export interface TransactionCreatorProps {
  wallet: WalletInterface;
  availableUtxos: UTxO[];
  availableAssets?: UIAsset[];
  onTransactionCreated?: (options: TransactionBuildOptions) => void;
  onCancel?: () => void;
  className?: string;
}

export const TransactionCreator: React.FC<TransactionCreatorProps> = ({
  wallet,
  availableUtxos,
  availableAssets = [],
  onTransactionCreated,
  onCancel,
  className = ''
}) => {
  const [recipients, setRecipients] = useState<TransactionRecipient[]>([
    { address: '', assets: { 'lovelace': 0n } }
  ]);
  const [selectedUtxos, setSelectedUtxos] = useState<UTxO[]>([]);
  const [estimatedFee, setEstimatedFee] = useState<bigint>(0n);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewOptions, setPreviewOptions] = useState<TransactionBuildOptions | null>(null);
  const [showContactPicker, setShowContactPicker] = useState<number | null>(null);
  const [addressErrors, setAddressErrors] = useState<{ [key: number]: string }>({});
  const [showAssetPicker, setShowAssetPicker] = useState<number | null>(null);

  // Decode hex-encoded asset name from assetId
  const decodeAssetName = (assetId: string): string => {
    try {
      // AssetId format: policyId (56 chars) + hex-encoded asset name
      if (assetId.length <= 56) {
        return assetId.slice(0, 8) + '...';
      }
      
      const hexAssetName = assetId.slice(56);
      if (!hexAssetName) {
        return assetId.slice(0, 8) + '...';
      }
      
      // Decode hex to UTF-8
      const decoded = hexAssetName.match(/.{1,2}/g)
        ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
        .join('');
      
      return decoded || assetId.slice(0, 8) + '...';
    } catch (error) {
      return assetId.slice(0, 8) + '...';
    }
  };

  // Validate Cardano address
  const validateCardanoAddress = (address: string): boolean => {
    if (!address) return false;
    // Basic Cardano address validation
    // Mainnet addresses start with 'addr1' and testnets with 'addr_test1'
    // Addresses are typically 103-108 characters long (bech32 format)
    const cardanoAddressRegex = /^(addr1|addr_test1)[a-z0-9]{98,104}$/;
    return cardanoAddressRegex.test(address);
  };

  // Update recipient address with validation
  const updateRecipientAddress = (index: number, address: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], address };
    setRecipients(newRecipients);

    // Validate address
    if (address && !validateCardanoAddress(address)) {
      setAddressErrors({ ...addressErrors, [index]: 'Invalid Cardano address' });
    } else {
      const newErrors = { ...addressErrors };
      delete newErrors[index];
      setAddressErrors(newErrors);
    }
  };

  // Convert Assets to SelectedAsset[] (excluding lovelace)
  const assetsToSelectedAssets = (assets: Assets): SelectedAsset[] => {
    return Object.entries(assets)
      .filter(([assetId, amount]) => assetId !== 'lovelace' && amount > 0n)
      .map(([assetId, amount]) => ({ assetId, amount }));
  };

  // Convert SelectedAsset[] to Assets
  const selectedAssetsToAssets = (selectedAssets: SelectedAsset[]): Assets => {
    const assets: Assets = {};
    selectedAssets.forEach(({ assetId, amount }) => {
      assets[assetId] = amount;
    });
    return assets;
  };

  // Update recipient assets from asset picker (preserve lovelace)
  const handleAssetsConfirmed = (index: number, selectedAssets: SelectedAsset[]) => {
    const newRecipients = [...recipients];
    const currentLovelace = newRecipients[index].assets['lovelace'] || 0n;
    newRecipients[index] = {
      ...newRecipients[index],
      assets: {
        'lovelace': currentLovelace, // Preserve lovelace amount
        ...selectedAssetsToAssets(selectedAssets)
      }
    };
    setRecipients(newRecipients);
    setShowAssetPicker(null);
  };

  // Remove a specific asset from recipient
  const removeAssetFromRecipient = (index: number, assetId: string) => {
    const newRecipients = [...recipients];
    const newAssets = { ...newRecipients[index].assets };
    delete newAssets[assetId];
    newRecipients[index] = { ...newRecipients[index], assets: newAssets };
    setRecipients(newRecipients);
  };

  // Remove all assets from recipient (except lovelace which has its own input)
  const removeAllAssetsFromRecipient = (index: number) => {
    const newRecipients = [...recipients];
    const currentLovelace = newRecipients[index].assets['lovelace'] || 0n;
    newRecipients[index] = { 
      ...newRecipients[index], 
      assets: { 'lovelace': currentLovelace } // Preserve lovelace
    };
    setRecipients(newRecipients);
  };

  // Calculate total assets to send
  const calculateTotalAssets = (): Assets => {
    const total: Assets = {};

    recipients.forEach(recipient => {
      Object.entries(recipient.assets).forEach(([assetId, amount]) => {
        if (total[assetId]) {
          total[assetId] += BigInt(amount);
        } else {
          total[assetId] = BigInt(amount);
        }
      });
    });

    return total;
  };

  // Estimate fee based on transaction complexity
  const estimateFee = async (totalAssets: Assets): Promise<bigint> => {
    // Simple fee estimation - in a real implementation, this would use the wallet's fee estimation
    const baseFee = 200000n; // 0.2 ADA base fee
    const perOutputFee = 10000n; // 0.01 ADA per output
    const perAssetFee = 10000n; // 0.01 ADA per asset type

    const outputCount = recipients.length;
    const assetCount = Object.keys(totalAssets).length;

    return baseFee + (perOutputFee * BigInt(outputCount)) + (perAssetFee * BigInt(assetCount));
  };

  // Calculate required UTXOs for the transaction
  const calculateRequiredUtxos = async () => {
    if (isCalculating) return;

    setIsCalculating(true);
    try {
      const totalAssets = calculateTotalAssets();
      const fee = await estimateFee(totalAssets);
      setEstimatedFee(fee);

      // Add fee to required assets
      const requiredAssets = { ...totalAssets };
      if (requiredAssets['lovelace']) {
        requiredAssets['lovelace'] += fee;
      } else {
        requiredAssets['lovelace'] = fee;
      }

      // Use coin selection algorithm
      const selected = coinSelect(requiredAssets, availableUtxos);
      setSelectedUtxos(selected);
    } catch (error) {
      console.error('Error calculating UTXOs:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Add a new recipient
  const addRecipient = () => {
    setRecipients([...recipients, { address: '', assets: { 'lovelace': 0n } }]);
  };

  // Remove a recipient
  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(newRecipients);
    }
  };

  // Update recipient data
  const updateRecipient = (index: number, field: keyof TransactionRecipient, value: string | Assets) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };


  // Preview transaction
  const previewTransactionCreation = async () => {
    try {
      const options: TransactionBuildOptions = {
        outputs: recipients.map(r => ({ address: r.address, assets: r.assets }))
      };
      setPreviewOptions(options);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing transaction:', error);
    }
  };

  // Create transaction
  const createTransaction = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const options: TransactionBuildOptions = {
        outputs: recipients.map(r => ({ address: r.address, assets: r.assets }))
      };

      onTransactionCreated?.(options);
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Recalculate when recipients change
  useEffect(() => {
    calculateRequiredUtxos();
  }, [recipients, availableUtxos]);

  const totalAssets = calculateTotalAssets();
  const adaTotal = Number(totalAssets['lovelace'] || 0n) / 1000000;

  return (
    <div className={`transaction-creator ${className}`}>
      <div className="creator-header">
        <h2>Create Transaction</h2>
        {onCancel && (
          <button className="cancel-button" onClick={onCancel}>
            ✕
          </button>
        )}
      </div>

      {/* Recipients Section */}
      <div className="recipients-section">
        <div className="section-header">
          <h3>Recipients</h3>
        </div>

        <div className="recipients-list">
          {recipients.map((recipient, index) => (
            <div key={index} className="recipient-item">
              {index > 0 && (
                  <button
                  className="remove-recipient-x"
                    onClick={() => removeRecipient(index)}
                  title="Remove recipient"
                  >
                  ✕
                  </button>
                )}

              {/* Address Input with ADA Amount */}
              <div className="address-input">
                <label>Recipient Address</label>
                <div className="address-input-wrapper">
                  <input
                    type="text"
                    value={recipient.address}
                    onChange={(e) => updateRecipientAddress(index, e.target.value)}
                    placeholder="addr1..."
                    className={addressErrors[index] ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="contact-picker-button"
                    onClick={() => setShowContactPicker(index)}
                    title="Select from contacts"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </button>
                  <input
                    type="number"
                    className="ada-amount-input"
                    value={Number(recipient.assets['lovelace'] || 0n) / 1000000}
                    onChange={(e) => {
                      const numAmount = parseFloat(e.target.value);
                      if (!isNaN(numAmount) && numAmount >= 0) {
                        const newRecipients = [...recipients];
                        newRecipients[index] = {
                          ...newRecipients[index],
                          assets: {
                            ...newRecipients[index].assets,
                            'lovelace': BigInt(Math.floor(numAmount * 1000000))
                          }
                        };
                        setRecipients(newRecipients);
                      }
                    }}
                    placeholder="0"
                    step="0.001"
                    min="0"
                  />
                  <button
                    type="button"
                    className="max-ada-button"
                    onClick={() => {
                      // Get total available ADA from wallet
                      const totalLovelace = availableUtxos.reduce((sum, utxo) => 
                        sum + (utxo.assets['lovelace'] || 0n), 0n
                      );
                      const newRecipients = [...recipients];
                      newRecipients[index] = {
                        ...newRecipients[index],
                        assets: {
                          ...newRecipients[index].assets,
                          'lovelace': totalLovelace
                        }
                      };
                      setRecipients(newRecipients);
                    }}
                    title="Send maximum ADA"
                  >
                    Max
                  </button>
                </div>
                {addressErrors[index] && (
                  <span className="address-error">{addressErrors[index]}</span>
                )}
              </div>

              {/* Assets Section */}
              <div className="assets-section">
                <label>Assets</label>

                {/* Selected Assets Chips (excluding ADA/lovelace) */}
                <div className="selected-assets-chips">
                  {Object.entries(recipient.assets)
                    .filter(([assetId, amount]) => assetId !== 'lovelace' && amount > 0n)
                    .map(([assetId, amount]) => {
                      const asset = availableAssets.find(a => a.id === assetId);
                      
                      // Fallback for decimals if asset metadata not available
                      const decimals = asset?.decimals !== undefined 
                        ? asset.decimals 
                        : (asset?.isNFT || amount === 1n ? 0 : 6);
                      
                      const displayAmount = (Number(amount) / Math.pow(10, decimals)).toString();
                      
                      // Fallback for asset name - decode from hex if metadata not available
                      const assetName = asset?.name 
                        || asset?.ticker 
                        || decodeAssetName(assetId);

                      return (
                        <div key={assetId} className="asset-chip" title={assetId}>
                          <span className="asset-chip-text">
                            {assetName} {displayAmount}
                          </span>
                          <button
                            className="asset-chip-remove"
                            onClick={() => removeAssetFromRecipient(index, assetId)}
                            title="Remove asset"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="asset-actions">
                  <button
                    className="add-assets-button"
                    onClick={() => setShowAssetPicker(index)}
                  >
                    Add Assets
                  </button>
                  {Object.keys(recipient.assets).filter(k => k !== 'lovelace').length > 0 && (
                    <button
                      className="remove-all-button"
                      onClick={() => removeAllAssetsFromRecipient(index)}
                    >
                      Remove All
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Recipient Button */}
          <button className="add-recipient-button" onClick={addRecipient}>
            + Add Recipient
          </button>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="transaction-summary">
        <h3>Transaction Summary</h3>

        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Total ADA:</span>
            <span className="value">{adaTotal.toFixed(6)} ₳</span>
          </div>

          <div className="summary-item">
            <span className="label">Recipients:</span>
            <span className="value">{recipients.length}</span>
          </div>

          <div className="summary-item">
            <span className="label">UTXOs Selected:</span>
            <span className="value">{selectedUtxos.length}</span>
          </div>

          <div className="summary-item">
            <span className="label">Estimated Fee:</span>
            <span className="value">{Number(estimatedFee) / 1000000} ₳</span>
          </div>
        </div>

        {isCalculating && (
          <div className="calculating-indicator">
            Calculating optimal UTXO selection...
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="creator-actions">
        <Button
          variant="secondary"
          onClick={previewTransactionCreation}
          disabled={isCalculating || recipients.some(r => !r.address)}
        >
          Preview Transaction
        </Button>

        <Button
          variant="primary"
          onClick={createTransaction}
          disabled={isCreating || isCalculating || recipients.some(r => !r.address)}
        >
          {isCreating ? 'Creating...' : 'Create Transaction'}
        </Button>
      </div>

      {/* Transaction Preview Modal */}
      {showPreview && previewOptions && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Transaction Preview"
        >
          <div className="transaction-preview">
            <div className="preview-details">
              <h4>Transaction Details</h4>
              <div className="preview-recipients">
                {recipients.map((recipient, idx) => (
                  <div key={idx} className="preview-recipient">
                    <div><strong>Recipient {idx + 1}:</strong></div>
                    <div className="preview-address">{recipient.address}</div>
                    <div className="preview-assets">
                      {Object.entries(recipient.assets).map(([assetId, amount]) => (
                        <div key={assetId}>
                          {assetId === 'lovelace' ? 'ADA' : assetId.slice(0, 12)}:{' '}
                          {amount.toString()}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="preview-summary">
                <div>Selected UTXOs: {selectedUtxos.length}</div>
                <div>Estimated Fee: {Number(estimatedFee) / 1000000} ₳</div>
              </div>
            </div>

            <div className="preview-actions">
              <Button
                variant="secondary"
                onClick={() => setShowPreview(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowPreview(false);
                  createTransaction();
                }}
              >
                Confirm & Create
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Contact Picker Modal */}
      {showContactPicker !== null && (
        <ContactPicker
          isModal={true}
          onSelect={(contact) => {
            if (showContactPicker !== null) {
              updateRecipientAddress(showContactPicker, contact.address);
              setShowContactPicker(null);
            }
          }}
          onClose={() => setShowContactPicker(null)}
          title="Select Contact"
          searchPlaceholder="Search contacts..."
        />
      )}

      {/* Asset Picker Modal */}
      {showAssetPicker !== null && (
        <AssetPicker
          availableAssets={availableAssets.filter(a => a && a.id && a.id !== 'lovelace')}
          selectedAssets={assetsToSelectedAssets(recipients[showAssetPicker].assets)}
          onConfirm={(selected) => handleAssetsConfirmed(showAssetPicker, selected)}
          onClose={() => setShowAssetPicker(null)}
        />
      )}
    </div>
  );
};

export default TransactionCreator;

