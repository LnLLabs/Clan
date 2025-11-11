import React, { useState, useEffect } from 'react';
import { Assets, WalletInterface, MetadataProvider, Transaction } from '@clan/framework-core';
import { TokenElement } from '../token/TokenElement';

export type TransactionType = 'sent' | 'received' | 'withdrawal';

export interface TransactionHistoryItem {
  date: string; // Format: DD-MM-YYYY
  type: TransactionType;
  assets: Assets;
  transactionLink: string;
  hash?: string;
}

export interface TransactionHistoryProps {
  wallet: WalletInterface;
  metadataProvider?: MetadataProvider;
  onSeeMore?: () => void;
  onTransactionLinkClick?: (transaction: TransactionHistoryItem) => void;
  className?: string;
  maxVisibleTransactions?: number;
  showSeeMore?: boolean;
  limit?: number;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  wallet,
  metadataProvider,
  onSeeMore,
  onTransactionLinkClick,
  className = '',
  maxVisibleTransactions,
  showSeeMore = true,
  limit = 50
}) => {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const walletAddress = wallet.getAddress();

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        setError(undefined);

        // Try to fetch from wallet's getTransactionHistory method
        let rawTransactions: Transaction[] = [];
        if (metadataProvider?.getTransactionHistory) {
          rawTransactions = await metadataProvider.getTransactionHistory(walletAddress, limit);
        }

        // Transform Transaction to TransactionHistoryItem
        const historyItems: TransactionHistoryItem[] = rawTransactions.map((tx) => {
          // Determine transaction type based on wallet address
          let type: TransactionType = 'withdrawal';
          let assets: Assets = {};

          // Check if transaction is incoming or outgoing
          const isIncoming = tx.outputs.some(output => output.address === walletAddress);
          const isOutgoing = tx.inputs.some(input => input.address === walletAddress);

          if (isIncoming && !isOutgoing) {
            type = 'received';
            // Sum incoming assets
            tx.outputs.forEach(output => {
              if (output.address === walletAddress) {
                Object.entries(output.assets).forEach(([assetId, amount]) => {
                  assets[assetId] = (assets[assetId] || BigInt(0)) + amount;
                });
              }
            });
          } else if (isOutgoing && !isIncoming) {
            type = 'sent';
            // Sum outgoing assets
            tx.inputs.forEach(input => {
              if (input.address === walletAddress) {
                Object.entries(input.assets).forEach(([assetId, amount]) => {
                  assets[assetId] = (assets[assetId] || BigInt(0)) + amount;
                });
              }
            });
          }

          // Format date
          const date = tx.timestamp 
            ? new Date(tx.timestamp).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).replace(/\//g, '-')
            : new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).replace(/\//g, '-');

          return {
            date,
            type,
            assets,
            transactionLink: `${wallet.getNetwork().explorerUrl}/tx/${tx.hash}`,
            hash: tx.hash
          };
        });

        setTransactions(historyItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction history:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [wallet, walletAddress, limit]);

  const visibleTransactions = maxVisibleTransactions
    ? transactions.slice(0, maxVisibleTransactions)
    : transactions;

  const getTransactionIcon = (type: TransactionType): string => {
    switch (type) {
      case 'sent':
        return '📤'; // Hand with upward arrow
      case 'received':
        return '🐷'; // Piggy bank
      case 'withdrawal':
        return '💰'; // Coins/wallet
      default:
        return '📝';
    }
  };

  const getTransactionClass = (type: TransactionType): string => {
    switch (type) {
      case 'sent':
        return 'transaction-sent';
      case 'received':
        return 'transaction-received';
      case 'withdrawal':
        return 'transaction-withdrawal';
      default:
        return '';
    }
  };

  const formatAssets = (assets: Assets) => {
    const entries = Object.entries(assets);
    
    // Separate lovelace from other assets
    const lovelaceEntry = entries.find(([assetId]) => assetId === 'lovelace');
    const otherAssets = entries.filter(([assetId]) => assetId !== 'lovelace');

    return { lovelaceEntry, otherAssets };
  };

  const handleTransactionLinkClick = (transaction: TransactionHistoryItem) => {
    onTransactionLinkClick?.(transaction);
  };

  if (loading) {
    return (
      <div className={`transaction-history-loading ${className}`}>
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <h3>Loading Transaction History...</h3>
          <p>Please wait while we fetch your transactions</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`transaction-history-error ${className}`}>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Transactions</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (transactions && transactions.length === 0) {
    return (
      <div className={`transaction-history-empty ${className}`}>
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Transaction History</h3>
          <p>Your transactions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`transaction-history ${className}`}>
      <div className="transaction-history-header">
        <h2>Transaction History</h2>
      </div>

      <div className="transaction-history-table-container">
        <table className="transaction-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction</th>
              <th>Assets</th>
              <th>Transaction Link</th>
            </tr>
          </thead>
          <tbody>
            {visibleTransactions.map((transaction, index) => {
              const { lovelaceEntry, otherAssets } = formatAssets(transaction.assets);
              const transactionClass = getTransactionClass(transaction.type);

              return (
                <tr key={index} className={`transaction-row ${transactionClass}`}>
                  <td className={`transaction-date ${transactionClass}-date`}>
                    {transaction.date}
                  </td>
                  
                  <td className="transaction-type">
                    <div className="transaction-type-content">
                      <span className={`transaction-icon ${transactionClass}-icon`}>
                        {getTransactionIcon(transaction.type)}
                      </span>
                      <span className={`transaction-label ${transactionClass}-label`}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="transaction-assets">
                    <div className="assets-container">
                      {lovelaceEntry && (
                        <div className="asset-item">
                          <div className="asset-icon-wrapper">
                            <div className="asset-icon ada-icon">₳</div>
                          </div>
                          <span className="asset-amount">
                            {transaction.type === 'sent' ? '-' : '+'}
                            {(Number(lovelaceEntry[1]) / 1000000).toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {otherAssets.map(([assetId, amount], assetIndex) => (
                        <div key={assetIndex} className="asset-item token-asset">
                          <TokenElement
                            tokenId={assetId}
                            amount={Number(amount)}
                            className="transaction-token"
                            metadataProvider={metadataProvider}
                          />
                          <span className="asset-amount">
                            {transaction.type === 'sent' ? '-' : '+'}
                            {Number(amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td className="transaction-link">
                    <div className="transaction-link-content">
                      <span className="link-text">{transaction.transactionLink}</span>
                      <button
                        className="link-action-button"
                        onClick={() => handleTransactionLinkClick(transaction)}
                        aria-label="View transaction details"
                      >
                        <span className="plus-icon">+</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showSeeMore && maxVisibleTransactions && transactions.length > maxVisibleTransactions && (
        <div className="transaction-history-footer">
          <button className="see-more-button" onClick={onSeeMore}>
            See More
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

