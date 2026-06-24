import React, { useState, useEffect, useMemo } from 'react';
import {
  Assets,
  WalletInterface,
  MetadataProvider,
  Transaction,
  BlockchainExplorer,
  meshUtxoToAssets,
  parseAssetId,
  paymentScriptHashFromAddress,
  utxoMatchesPaymentScriptHash
} from '@clan/framework-core';
import { useMetadataProvider } from '@clan/framework-providers';
import { TokenElement } from '../token/TokenElement';
import { createDefaultExplorer } from './default-explorer';
import { CardanoLogo } from '../../assets';

export type TransactionType = 'sent' | 'received' | 'withdrawal';

const formatAbsoluteAmount = (amount: bigint, decimals: number = 0): string => {
  if (decimals <= 0) {
    return amount.toLocaleString();
  }

  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = (amount % divisor)
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/g, '');

  const wholeText = whole.toLocaleString();
  return fraction ? `${wholeText}.${fraction}` : wholeText;
};

const formatSignedAmount = (amount: bigint, decimals: number = 0): string => {
  const isPositive = amount >= 0n;
  const absoluteAmount = isPositive ? amount : -amount;
  return `${isPositive ? '+' : '-'}${formatAbsoluteAmount(absoluteAmount, decimals)}`;
};

const inferTransactionType = (
  inputAssets: Assets,
  outputAssets: Assets
): TransactionType => {
  const hasInputs = Object.keys(inputAssets).length > 0;
  const hasOutputs = Object.keys(outputAssets).length > 0;

  if (!hasInputs && hasOutputs) {
    return 'received';
  }

  if (hasInputs && !hasOutputs) {
    return 'sent';
  }

  if (hasInputs && hasOutputs) {
    const totalChange = (outputAssets.lovelace ?? 0n) - (inputAssets.lovelace ?? 0n);

    if (totalChange > 0n) {
      return 'received';
    }

    if (totalChange < 0n) {
      return 'sent';
    }
  }

  return 'withdrawal';
};

const formatTransactionTypeLabel = (type: string): string => {
  const normalizedType = type.trim();
  if (!normalizedType) {
    return 'Withdrawal';
  }

  const humanized = normalizedType
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ');

  return humanized.charAt(0).toUpperCase() + humanized.slice(1);
};

export interface TransactionHistoryItem {
  date: string; // Format: DD-MM-YYYY
  type: TransactionType;
  transactionType?: string;
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
  const metadataProviderFromContext = useMetadataProvider();
  const effectiveMetadataProvider = metadataProvider ?? metadataProviderFromContext;

  // Create a default explorer if none provided - uses CExplorer with network auto-detection
  const effectiveExplorer = useMemo(() => {
    if (explorer) return explorer;
    return createDefaultExplorer(wallet.getNetwork());
  }, [explorer, wallet]);

  useEffect(() => {
    let isMounted = true;

    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        setError(undefined);

        const ownedAddresses = new Set<string>([walletAddress]);
        let defaultAddress = walletAddress;
        try {
          const resolvedDefaultAddress = await wallet.getDefaultAddress?.();
          if (resolvedDefaultAddress) {
            defaultAddress = resolvedDefaultAddress;
          }
        } catch {
          // keep walletAddress
        }

        const paymentScriptHash = paymentScriptHashFromAddress(defaultAddress);
        const usePaymentScriptHashFilter = Boolean(paymentScriptHash);

        if (!usePaymentScriptHashFilter) {
          ownedAddresses.add(defaultAddress);

          const fundedAddressResult = await Promise.allSettled([
            wallet.getFundedAddress?.(),
          ]).then((results) => results[0]);

          if (fundedAddressResult.status === 'fulfilled' && fundedAddressResult.value) {
            fundedAddressResult.value.forEach(address => ownedAddresses.add(address));
          }
        }

        const utxoBelongsToWallet = (utxo: Transaction['inputs'][number]): boolean => {
          if (usePaymentScriptHashFilter && paymentScriptHash) {
            return utxoMatchesPaymentScriptHash(utxo, paymentScriptHash);
          }
          return ownedAddresses.has(utxo.output.address);
        };

        // Try to fetch from wallet's getTransactionHistory method
        let rawTransactions: Transaction[] = [];
        if (effectiveMetadataProvider?.getTransactionHistory) {
          rawTransactions = await effectiveMetadataProvider.getTransactionHistory(walletAddress, limit);
        }

        // Transform Transaction to TransactionHistoryItem
        const historyItems: TransactionHistoryItem[] = rawTransactions.map((tx) => {
          // Calculate balance changes correctly:
          // Balance change = received (own address outputs) - spent (own address inputs)
          // This properly accounts for change coming back to the wallet
          let assets: Assets = {};

          if (
            !usePaymentScriptHashFilter &&
            tx.historyLovelaceDelta !== undefined &&
            tx.historyLovelaceDelta !== 0n
          ) {
            assets = { lovelace: tx.historyLovelaceDelta };
          }

          // Sum all inputs from wallet address (what was spent)
          const inputAssets: Assets = {};
          tx.inputs.forEach(input => {
            if (utxoBelongsToWallet(input)) {
              const utxoAssets = meshUtxoToAssets(input);
              Object.entries(utxoAssets).forEach(([assetId, amount]) => {
                inputAssets[assetId] = (inputAssets[assetId] || BigInt(0)) + BigInt(amount);
              });
            }
          });

          // Sum all outputs to wallet address (what was received)
          const outputAssets: Assets = {};
          tx.outputs.forEach(output => {
            if (utxoBelongsToWallet(output)) {
              const utxoAssets = meshUtxoToAssets(output);
              Object.entries(utxoAssets).forEach(([assetId, amount]) => {
                outputAssets[assetId] = (outputAssets[assetId] || BigInt(0)) + BigInt(amount);
              });
            }
          });

          // Calculate net change for each asset: received - spent
          const allAssetIds = new Set([
            ...Object.keys(inputAssets),
            ...Object.keys(outputAssets)
          ]);

          if (Object.keys(assets).length === 0) {
            allAssetIds.forEach(assetId => {
              const spent = inputAssets[assetId] || BigInt(0);
              const received = outputAssets[assetId] || BigInt(0);
              const netChange = received - spent;

              if (netChange !== BigInt(0)) {
                assets[assetId] = netChange;
              }
            });
          }

          const type = inferTransactionType(inputAssets, outputAssets);
          const transactionType =
            typeof tx.transactionType === 'string' && tx.transactionType.trim()
              ? tx.transactionType.trim()
              : undefined;

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
            transactionType,
            assets,
            transactionLink,
            hash: tx.hash
          };
        });

        if (!isMounted) {
          return;
        }

        setTransactions(historyItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction history:', err);
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
        setLoading(false);
      }
    };

    fetchTransactionHistory();

    return () => {
      isMounted = false;
    };
  }, [wallet, walletAddress, limit, effectiveExplorer, effectiveMetadataProvider]);

  const visibleTransactions = maxVisibleTransactions
    ? transactions.slice(0, maxVisibleTransactions)
    : transactions;

  const splitTokenId = (tokenId: string): { policyId: string; assetName: string } => {
    return parseAssetId(tokenId);
  };

  const handleTokenClick = (tokenId: string) => {
    if (!tokenId || tokenId === 'lovelace') return;

    const { policyId, assetName } = splitTokenId(tokenId);
    const tokenLink = effectiveExplorer.getTokenLink(policyId, assetName || undefined);

    if (tokenLink && typeof window !== 'undefined') {
      window.open(tokenLink, '_blank', 'noopener');
    }
  };

  const getTransactionIcon = (type: TransactionType): string => {
    switch (type) {
      case 'sent':
        return '📤'; // Hand with upward arrow
      case 'received':
        return '📥'; // Inbox for received
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
    window.open(transaction.transactionLink, '_blank');
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
                        {formatTransactionTypeLabel(transaction.transactionType ?? transaction.type)}
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
                            {formatSignedAmount(lovelaceEntry[1], 6)}
                          </span>
                        </div>
                      )}
                      
                      {otherAssets.map(([assetId, amount], assetIndex) => {
                        return (
                          <div key={assetIndex} className="asset-item token-asset">
                            <TokenElement
                              tokenId={assetId}
                              amount={amount}
                              className="transaction-token"
                              metadataProvider={effectiveMetadataProvider}
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

