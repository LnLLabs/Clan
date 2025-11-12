import React, { useState, useEffect, useMemo } from 'react';
import { Assets, WalletInterface, MetadataProvider, Transaction, BlockchainExplorer } from '@clan/framework-core';
import { TokenElement } from '../token/TokenElement';
import { createDefaultExplorer } from './default-explorer';
import { CardanoLogo } from '../../assets';

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
  explorer?: BlockchainExplorer;
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
  explorer,
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

  // Create a default explorer if none provided - uses CExplorer with network auto-detection
  const effectiveExplorer = useMemo(() => {
    if (explorer) return explorer;
    return createDefaultExplorer(wallet.getNetwork());
  }, [explorer, wallet]);

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
          // Calculate balance changes correctly:
          // Balance change = received (own address outputs) - spent (own address inputs)
          // This properly accounts for change coming back to the wallet
          let type: TransactionType = 'withdrawal';
          let assets: Assets = {};

          // Sum all inputs from wallet address (what was spent)
          const inputAssets: Assets = {};
          tx.inputs.forEach(input => {
            if (input.address === walletAddress) {
              Object.entries(input.assets).forEach(([assetId, amount]) => {
                inputAssets[assetId] = (inputAssets[assetId] || BigInt(0)) + amount;
              });
            }
          });

          // Sum all outputs to wallet address (what was received)
          const outputAssets: Assets = {};
          tx.outputs.forEach(output => {
            if (output.address === walletAddress) {
              Object.entries(output.assets).forEach(([assetId, amount]) => {
                outputAssets[assetId] = (outputAssets[assetId] || BigInt(0)) + amount;
              });
            }
          });

          // Calculate net change for each asset: received - spent
          const allAssetIds = new Set([
            ...Object.keys(inputAssets),
            ...Object.keys(outputAssets)
          ]);

          let totalChange = BigInt(0);
          allAssetIds.forEach(assetId => {
            const spent = inputAssets[assetId] || BigInt(0);
            const received = outputAssets[assetId] || BigInt(0);
            const netChange = received - spent;
            
            if (netChange !== BigInt(0)) {
              assets[assetId] = netChange;
            }
            
            // Track total change (use lovelace for determining tx type if present)
            if (assetId === 'lovelace') {
              totalChange = netChange;
            }
          });

          // Determine transaction type based on net change
          const hasInputs = Object.keys(inputAssets).length > 0;
          const hasOutputs = Object.keys(outputAssets).length > 0;

          if (!hasInputs && hasOutputs) {
            // Only receiving, no spending
            type = 'received';
          } else if (hasInputs && !hasOutputs) {
            // Only spending, no receiving
            type = 'sent';
          } else if (hasInputs && hasOutputs) {
            // Both - determine by net lovelace change
            if (totalChange > BigInt(0)) {
              type = 'received';
            } else if (totalChange < BigInt(0)) {
              type = 'sent';
            } else {
              // No net change in lovelace, could be token-only or contract interaction
              type = 'withdrawal';
            }
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

          // Generate transaction link using the effective explorer
          const transactionLink = effectiveExplorer.getTransactionLink(tx.hash);

          return {
            date,
            type,
            assets,
            transactionLink,
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
  }, [wallet, walletAddress, limit, effectiveExplorer]);

  const visibleTransactions = maxVisibleTransactions
    ? transactions.slice(0, maxVisibleTransactions)
    : transactions;

  const splitTokenId = (tokenId: string): { policyId: string; assetName: string } => {
    if (!tokenId || tokenId === 'lovelace') {
      return { policyId: '', assetName: '' };
    }

    if (tokenId.length <= 56) {
      return { policyId: tokenId, assetName: '' };
    }

    return {
      policyId: tokenId.slice(0, 56),
      assetName: tokenId.slice(56)
    };
  };

  const handleTokenClick = (tokenId: string) => {
    if (!tokenId || tokenId === 'lovelace') return;

    const { policyId, assetName } = splitTokenId(tokenId);
    const mainnetBaseUrl = 'https://cexplorer.io';
    const tokenLink = assetName && assetName !== ''
      ? `${mainnetBaseUrl}/asset/${policyId}${assetName}`
      : `${mainnetBaseUrl}/policy/${policyId}`;

    if (tokenLink && typeof window !== 'undefined') {
      window.open(tokenLink, '_blank', 'noopener');
    }
  };

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
                    <div className="transaction-date-content">
                      {transaction.date}
                    </div>
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
                            <div className="asset-icon ada-icon">
                              <CardanoLogo className="cardano-logo" />
                            </div>
                          </div>
                          <span className="asset-amount">
                            {transaction.type === 'sent' ? '-' : '+'}
                            {(Math.abs(Number(lovelaceEntry[1])) / 1000000).toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {otherAssets.map(([assetId, amount], assetIndex) => {
                        const numAmount = Number(amount);
                        return (
                          <div key={assetIndex} className="asset-item token-asset">
                            <TokenElement
                              tokenId={assetId}
                              amount={numAmount}
                              className="transaction-token"
                              metadataProvider={metadataProvider}
                            onClick={handleTokenClick}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  
                  <td className="transaction-link">
                    <div className="transaction-link-content">
                      {transaction.hash && (
                        <a 
                          href={transaction.transactionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-text"
                          title={`View transaction ${transaction.hash}`}
                        >
                          {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-8)}
                        </a>
                      )}
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

