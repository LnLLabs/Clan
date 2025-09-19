import React, { useState, useEffect } from 'react';
import { Transaction, Assets } from '@clan/framework-core';
import { copyToClipboard, showInfo, showError } from '@clan/framework-helpers';
import { TokenElement } from '../token/TokenElement';

export interface PendingTransactionData {
  id: string;
  transaction: Transaction;
  signatures: Record<string, string>;
  requiredSigners: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface PendingTransactionProps {
  transaction: PendingTransactionData;
  wallet: any; // WalletInterface
  onSign?: (signature: string) => void;
  onRemove?: () => void;
  onSubmit?: () => void;
  className?: string;
}

export const PendingTransaction: React.FC<PendingTransactionProps> = ({
  transaction,
  wallet,
  onSign,
  onRemove,
  onSubmit,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatures, setSignatures] = useState<Record<string, string>>(transaction.signatures);

  // Calculate signature status
  const signedCount = Object.keys(signatures).length;
  const requiredCount = transaction.requiredSigners.length;
  const isFullySigned = signedCount >= requiredCount;

  // Calculate transaction balance (simplified)
  const getTransactionBalance = (): { ada: number; tokens: Assets } => {
    // This would be calculated from transaction inputs/outputs
    // For now, return a placeholder
    return {
      ada: 0,
      tokens: {}
    };
  };

  const handleSign = async () => {
    if (!wallet) return;

    setIsSigning(true);
    try {
      // This would integrate with the wallet's signing functionality
      // For now, this is a placeholder
      const signature = await wallet.signTransaction(transaction.transaction);

      const newSignatures = { ...signatures, [wallet.getName()]: signature };
      setSignatures(newSignatures);

      onSign?.(signature);
      showInfo('Transaction signed successfully');
    } catch (error) {
      showError('Failed to sign transaction');
      console.error('Signing error:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleCopyTxId = () => {
    copyToClipboard(transaction.id);
    showInfo('Transaction ID copied to clipboard');
  };

  const handleCopyTransaction = () => {
    // This would copy the transaction CBOR
    copyToClipboard(JSON.stringify(transaction.transaction));
    showInfo('Transaction data copied to clipboard');
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const balance = getTransactionBalance();

  return (
    <div className={`pending-transaction ${className}`}>
      {/* Header */}
      <div className="pending-transaction-header">
        <div className="transaction-info">
          <div className="transaction-type">
            Pending Transaction
          </div>
          <div className="transaction-id">
            <span className="label">TxID:</span>
            <span className="value">{transaction.id.slice(0, 16)}...</span>
            <button
              className="copy-button"
              onClick={handleCopyTxId}
              title="Copy Transaction ID"
            >
              📋
            </button>
          </div>
          <div className="transaction-time">
            Created {formatTimeAgo(transaction.createdAt)}
          </div>
        </div>

        <div className="transaction-actions">
          <button
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            className="copy-button"
            onClick={handleCopyTransaction}
            title="Copy Transaction Data"
          >
            📋
          </button>
          {onRemove && (
            <button
              className="remove-button"
              onClick={onRemove}
              title="Remove Transaction"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Balance Summary */}
      <div className="transaction-balance">
        <div className="balance-ada">
          <span className={`amount ${balance.ada >= 0 ? 'positive' : 'negative'}`}>
            {balance.ada >= 0 ? '+' : ''}{(balance.ada / 1000000).toFixed(6)} ₳
          </span>
        </div>
        <div className="balance-tokens">
          {Object.keys(balance.tokens).map((tokenId) => (
            <TokenElement
              key={tokenId}
              tokenId={tokenId}
              amount={Number(balance.tokens[tokenId])}
              className="balance-token"
            />
          ))}
        </div>
      </div>

      {/* Signature Status */}
      <div className="signature-status">
        <div className="signature-count">
          Signatures: {signedCount} / {requiredCount}
        </div>
        <div className="signature-progress">
          <div
            className="progress-bar"
            style={{ width: `${(signedCount / requiredCount) * 100}%` }}
          />
        </div>
        {isFullySigned && (
          <div className="fully-signed-badge">✓ Fully Signed</div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="transaction-details">
          {/* Signers List */}
          <div className="signers-section">
            <h4>Required Signers</h4>
            <div className="signers-list">
              {transaction.requiredSigners.map((signer, index) => (
                <div key={index} className="signer-item">
                  <span className="signer-name">{signer}</span>
                  {signatures[signer] ? (
                    <span className="signer-status signed">✓ Signed</span>
                  ) : (
                    <span className="signer-status pending">⏳ Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="transaction-actions-expanded">
            {!isFullySigned && (
              <button
                className="sign-button"
                onClick={handleSign}
                disabled={isSigning}
              >
                {isSigning ? 'Signing...' : 'Sign Transaction'}
              </button>
            )}

            {isFullySigned && onSubmit && (
              <button
                className="submit-button"
                onClick={onSubmit}
              >
                Submit Transaction
              </button>
            )}
          </div>

          {/* Expiration Warning */}
          {transaction.expiresAt && transaction.expiresAt < new Date() && (
            <div className="expiration-warning">
              ⚠️ This transaction has expired
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingTransaction;

