import React from 'react';
import { TransactionHistory } from './TransactionHistory';
import { WalletInterface, MetadataProvider } from '@clan/framework-core';

/**
 * Example usage of the TransactionHistory component
 * The component will automatically fetch transactions from the wallet
 */
export const TransactionHistoryExample: React.FC<{ wallet: WalletInterface; metadataProvider?: MetadataProvider }> = ({ wallet, metadataProvider }) => {
  const handleSeeMore = () => {
    console.log('See more clicked');
    // Navigate to full transaction history page or load more transactions
  };

  const handleTransactionLinkClick = (transaction: any) => {
    console.log('Transaction link clicked:', transaction);
    // Open transaction details modal or navigate to explorer
    if (transaction.hash) {
      window.open(`https://cexplorer.io/tx/${transaction.hash}`, '_blank');
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f3f4f6' }}>
      <TransactionHistory
        wallet={wallet}
        metadataProvider={metadataProvider}
        onSeeMore={handleSeeMore}
        onTransactionLinkClick={handleTransactionLinkClick}
        maxVisibleTransactions={5}
        showSeeMore={true}
        limit={50}
      />
    </div>
  );
};

/**
 * Example with limited transactions
 */
export const TransactionHistoryLimitedExample: React.FC<{ wallet: WalletInterface }> = ({ wallet }) => {
  return (
    <div style={{ padding: '24px', background: '#f3f4f6' }}>
      <TransactionHistory
        wallet={wallet}
        limit={10}
        showSeeMore={false}
      />
    </div>
  );
};

export default TransactionHistoryExample;
