import React from 'react';
import { TransactionHistory } from './TransactionHistory';
import { WalletInterface, MetadataProvider, BlockchainExplorer } from '@clan/framework-core';
import { CExplorerExplorer } from '@clan/framework-providers';

/**
 * Example usage of the TransactionHistory component
 * The component will automatically use CExplorer if no explorer is provided
 * and automatically detect the network (mainnet, preprod, preview)
 */
export const TransactionHistoryExample: React.FC<{ 
  wallet: WalletInterface; 
  metadataProvider?: MetadataProvider;
  explorer?: BlockchainExplorer;
}> = ({ wallet, metadataProvider, explorer }) => {
  const handleSeeMore = () => {
    console.log('See more clicked');
    // Navigate to full transaction history page or load more transactions
  };

  const handleTransactionLinkClick = (transaction: any) => {
    console.log('Transaction link clicked:', transaction);
    // The link is already clickable in the component, but you can add custom behavior here
  };

  return (
    <div style={{ padding: '24px', background: '#f3f4f6' }}>
      <TransactionHistory
        wallet={wallet}
        metadataProvider={metadataProvider}
        explorer={explorer}  // Optional - defaults to CExplorer with network auto-detection
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
 * Example with limited transactions and custom explorer
 */
export const TransactionHistoryLimitedExample: React.FC<{ 
  wallet: WalletInterface;
  explorer?: BlockchainExplorer;
}> = ({ wallet, explorer }) => {
  return (
    <div style={{ padding: '24px', background: '#f3f4f6' }}>
      <TransactionHistory
        wallet={wallet}
        explorer={explorer}
        limit={10}
        showSeeMore={false}
      />
    </div>
  );
};

/**
 * Example with explicit CExplorer (optional, as this is the default)
 */
export const TransactionHistoryWithCExplorerExample: React.FC<{ wallet: WalletInterface }> = ({ wallet }) => {
  const explorer = new CExplorerExplorer('mainnet');

  return (
    <div style={{ padding: '24px', background: '#f3f4f6' }}>
      <TransactionHistory
        wallet={wallet}
        explorer={explorer}
        limit={20}
      />
    </div>
  );
};

/**
 * Example with CardanoScan explorer
 */
export const TransactionHistoryWithCardanoScanExample: React.FC<{ wallet: WalletInterface }> = ({ wallet }) => {
  const { CardanoScanExplorer } = require('@clan/framework-providers');
  const explorer = new CardanoScanExplorer('mainnet');

  return (
    <div style={{ padding: '24px', background: '#f3f4f6' }}>
      <TransactionHistory
        wallet={wallet}
        explorer={explorer}
        limit={20}
      />
    </div>
  );
};

/**
 * Example with preprod network explorer
 */
export const TransactionHistoryPreprodExample: React.FC<{ wallet: WalletInterface }> = ({ wallet }) => {
  const explorer = new CExplorerExplorer('preprod');

  return (
    <div style={{ padding: '24px', background: '#f3f4f6' }}>
      <TransactionHistory
        wallet={wallet}
        explorer={explorer}
        limit={20}
      />
    </div>
  );
};

export default TransactionHistoryExample;
