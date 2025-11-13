import React from 'react';
import { WalletInterface, MetadataProvider } from '@clan/framework-core';
import type { TransactionBuildOptions } from '@clan/framework-core';
import { TransactionCreator } from '@clan/framework-components';

export interface TransactionCreatorWithDataProps {
  wallet: WalletInterface;
  metadataProvider?: MetadataProvider;
  onTransactionCreated?: (options: TransactionBuildOptions) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Backwards compatible wrapper that forwards props to the enhanced TransactionCreator.
 * 
 * @example
 * // Simple usage (no metadata)
 * <TransactionCreatorWithData 
 *   wallet={wallet}
 *   onTransactionCreated={(tx) => console.log('Created!', tx)}
 * />
 * 
 * @example
 * // With metadata provider (BroClan integration)
 * <TransactionCreatorWithData 
 *   wallet={wallet}
 *   metadataProvider={broClanMetadataProvider}
 *   onTransactionCreated={(tx) => console.log('Created!', tx)}
 * />
 */
export const TransactionCreatorWithData: React.FC<TransactionCreatorWithDataProps> = ({
  wallet,
  metadataProvider,
  ...props
}) => {
  return (
    <TransactionCreator
      wallet={wallet}
      metadataProvider={metadataProvider}
      {...props}
    />
  );
};

