import React from 'react';
import { TransactionHistoryEntry, Assets } from '@broclan/framework-core';

export interface TransactionHistoryProps {
  transactions: TransactionHistoryEntry[];
  loading?: boolean;
  onTransactionClick?: (transaction: TransactionHistoryEntry) => void;
  formatAssetValue?: (assets: Assets) => string;
  formatTimestamp?: (timestamp: number) => string;
  className?: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
  onTransactionClick,
  formatAssetValue,
  formatTimestamp,
  className = ''
}) => {
  const formatDefaultAssetValue = (assets: Assets): string => {
    const assetEntries = Object.entries(assets);
    if (assetEntries.length === 0) return '0';

    // Show ADA value primarily, or first asset if no ADA
    const adaEntry = assetEntries.find(([assetId]) => assetId.endsWith('.'));
    if (adaEntry) {
      return `${(Number(adaEntry[1]) / 1000000).toFixed(6)} ADA`;
    }

    const [assetId, quantity] = assetEntries[0];
    const assetName = assetId.split('.')[1] || 'Unknown';
    return `${quantity.toString()} ${assetName}`;
  };

  const formatDefaultTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'incoming':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'outgoing':
        return (
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10H5a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414l-3-3z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
        <p className="mt-1 text-sm text-gray-500">Your transaction history will appear here.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {transactions.map((transaction) => (
        <div
          key={transaction.hash}
          onClick={() => onTransactionClick?.(transaction)}
          className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
            onTransactionClick ? 'cursor-pointer' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getDirectionIcon(transaction.direction)}
              <div>
                <div className="font-medium text-gray-900">
                  {(formatAssetValue || formatDefaultAssetValue)(transaction.amount)}
                </div>
                <div className="text-sm text-gray-500">
                  {(formatTimestamp || formatDefaultTimestamp)(transaction.timestamp)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 7.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400 font-mono">
            {transaction.hash.slice(0, 16)}...{transaction.hash.slice(-16)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistory;
