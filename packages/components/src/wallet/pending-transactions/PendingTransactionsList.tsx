import React from 'react';
import { PendingTransaction, PendingTransactionData } from './PendingTransaction';

export interface PendingTransactionsListProps {
  transactions: PendingTransactionData[];
  wallet: any; // WalletInterface
  onSignTransaction?: (transactionId: string, signature: string) => void;
  onRemoveTransaction?: (transactionId: string) => void;
  onSubmitTransaction?: (transactionId: string) => void;
  className?: string;
  emptyMessage?: string;
}

export const PendingTransactionsList: React.FC<PendingTransactionsListProps> = ({
  transactions,
  wallet,
  onSignTransaction,
  onRemoveTransaction,
  onSubmitTransaction,
  className = '',
  emptyMessage = 'No pending transactions'
}) => {
  const handleSign = (transactionId: string, signature: string) => {
    onSignTransaction?.(transactionId, signature);
  };

  const handleRemove = (transactionId: string) => {
    onRemoveTransaction?.(transactionId);
  };

  const handleSubmit = (transactionId: string) => {
    onSubmitTransaction?.(transactionId);
  };

  if (transactions.length === 0) {
    return (
      <div className={`pending-transactions-empty ${className}`}>
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Pending Transactions</h3>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Sort transactions by creation date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className={`pending-transactions-list ${className}`}>
      <div className="list-header">
        <h3>Pending Transactions</h3>
        <span className="transaction-count">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="transactions-container">
        {sortedTransactions.map((transaction) => (
          <PendingTransaction
            key={transaction.id}
            transaction={transaction}
            wallet={wallet}
            onSign={(signature) => handleSign(transaction.id, signature)}
            onRemove={() => handleRemove(transaction.id)}
            onSubmit={() => handleSubmit(transaction.id)}
            className="pending-transaction-item"
          />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="list-footer">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{transactions.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Fully Signed:</span>
            <span className="stat-value">
              {transactions.filter(tx =>
                Object.keys(tx.signatures).length >= tx.requiredSigners.length
              ).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">
              {transactions.filter(tx =>
                Object.keys(tx.signatures).length < tx.requiredSigners.length
              ).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingTransactionsList;
