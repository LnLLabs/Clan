import React, { useState, useEffect } from 'react';
import { Assets, UTxO, Transaction, TransactionBuildOptions } from '@broclan/framework-core';
import { coinSelect } from '@broclan/framework-core/src/coin-select/coin-select';
import { TokenElement } from '../token/TokenElement';
import { AddressSelect } from '../AddressSelect';
import { Button } from '../../ui/buttons/Button';
import { Modal } from '../../ui/modals/Modal';

export interface TransactionRecipient {
  address: string;
  assets: Assets;
  datum?: string;
  datumHash?: string;
}

export interface TransactionCreatorProps {
  wallet: any; // WalletInterface
  availableUtxos: UTxO[];
  onTransactionCreated?: (transaction: Transaction, options: TransactionBuildOptions) => void;
  onCancel?: () => void;
  className?: string;
}

export const TransactionCreator: React.FC<TransactionCreatorProps> = ({
  wallet,
  availableUtxos,
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
  const [previewTransaction, setPreviewTransaction] = useState<Transaction | null>(null);

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
  const updateRecipient = (index: number, field: keyof TransactionRecipient, value: any) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  // Update recipient assets
  const updateRecipientAsset = (index: number, assetId: string, amount: string) => {
    const newRecipients = [...recipients];
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount >= 0) {
      newRecipients[index].assets = {
        ...newRecipients[index].assets,
        [assetId]: BigInt(Math.floor(numAmount * 1000000)) // Convert ADA to lovelace
      };
    }
    setRecipients(newRecipients);
  };

  // Add asset to recipient
  const addAssetToRecipient = (index: number, assetId: string) => {
    const newRecipients = [...recipients];
    if (!newRecipients[index].assets[assetId]) {
      newRecipients[index].assets = {
        ...newRecipients[index].assets,
        [assetId]: 0n
      };
    }
    setRecipients(newRecipients);
  };

  // Remove asset from recipient
  const removeAssetFromRecipient = (index: number, assetId: string) => {
    const newRecipients = [...recipients];
    const newAssets = { ...newRecipients[index].assets };
    delete newAssets[assetId];
    newRecipients[index].assets = newAssets;
    setRecipients(newRecipients);
  };

  // Preview transaction
  const previewTransactionCreation = async () => {
    try {
      const totalAssets = calculateTotalAssets();
      const transaction = await wallet.buildTransaction({
        recipients,
        selectedUtxos,
        totalAssets,
        estimatedFee
      });
      setPreviewTransaction(transaction);
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
      const totalAssets = calculateTotalAssets();
      const options: TransactionBuildOptions = {
        recipients,
        selectedUtxos,
        totalAssets,
        estimatedFee
      };

      const transaction = await wallet.buildTransaction(options);
      onTransactionCreated?.(transaction, options);
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
          <button className="add-recipient-button" onClick={addRecipient}>
            + Add Recipient
          </button>
        </div>

        <div className="recipients-list">
          {recipients.map((recipient, index) => (
            <div key={index} className="recipient-item">
              <div className="recipient-header">
                <span className="recipient-label">Recipient {index + 1}</span>
                {recipients.length > 1 && (
                  <button
                    className="remove-recipient"
                    onClick={() => removeRecipient(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Address Input */}
              <div className="address-input">
                <label>Address</label>
                <AddressSelect
                  value={recipient.address}
                  onChange={(address) => updateRecipient(index, 'address', address)}
                  placeholder="Enter recipient address"
                />
              </div>

              {/* Assets Section */}
              <div className="assets-section">
                <label>Assets</label>

                {/* ADA Amount */}
                <div className="asset-input">
                  <span className="asset-label">ADA</span>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={Number(recipient.assets['lovelace'] || 0n) / 1000000}
                    onChange={(e) => updateRecipientAsset(index, 'lovelace', e.target.value)}
                    placeholder="0.000000"
                  />
                </div>

                {/* Other Assets */}
                {Object.entries(recipient.assets)
                  .filter(([assetId]) => assetId !== 'lovelace')
                  .map(([assetId, amount]) => (
                    <div key={assetId} className="asset-input">
                      <TokenElement
                        tokenId={assetId}
                        amount={Number(amount)}
                        className="asset-token"
                      />
                      <input
                        type="number"
                        min="0"
                        value={Number(amount)}
                        onChange={(e) => updateRecipientAsset(index, assetId, e.target.value)}
                        placeholder="0"
                      />
                      <button
                        className="remove-asset"
                        onClick={() => removeAssetFromRecipient(index, assetId)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                {/* Add Asset Button */}
                <button
                  className="add-asset-button"
                  onClick={() => addAssetToRecipient(index, 'asset_' + Date.now())}
                >
                  + Add Asset
                </button>
              </div>

              {/* Datum Input (Optional) */}
              <div className="datum-input">
                <label>Datum (Optional)</label>
                <textarea
                  value={recipient.datum || ''}
                  onChange={(e) => updateRecipient(index, 'datum', e.target.value)}
                  placeholder="JSON datum or CBOR hex"
                  rows={3}
                />
              </div>
            </div>
          ))}
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
      {showPreview && previewTransaction && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Transaction Preview"
        >
          <div className="transaction-preview">
            <div className="preview-details">
              <h4>Transaction Details</h4>
              <pre className="transaction-json">
                {JSON.stringify(previewTransaction, null, 2)}
              </pre>
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
    </div>
  );
};

export default TransactionCreator;
