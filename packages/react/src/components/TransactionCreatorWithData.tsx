import React, { useState, useEffect } from 'react';
import { WalletInterface } from '@clan/framework-core';
import type { TransactionBuildOptions } from '@clan/framework-core';
import { 
  TransactionCreator, 
  UIAsset,
  convertAssetsToAssetArray,
  convertAssetsToAssetArraySync 
} from '@clan/framework-components';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { useWalletUtxos } from '../hooks/useWalletUtxos';

/**
 * Token metadata provider interface for enriching assets with metadata
 * Compatible with future BroClan metadata provider integration
 */
export interface TokenMetadataProvider {
  getMetadata(assetId: string): Promise<Partial<Omit<UIAsset, 'id' | 'balance'>>>;
}

export interface TransactionCreatorWithDataProps {
  wallet: WalletInterface;
  metadataProvider?: TokenMetadataProvider;
  onTransactionCreated?: (options: TransactionBuildOptions) => void;
  onCancel?: () => void;
  className?: string;
  refetchInterval?: number;
}

/**
 * Smart wrapper around TransactionCreator that automatically fetches wallet data
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
  refetchInterval = 10000,
  ...props
}) => {
  const [availableAssets, setAvailableAssets] = useState<UIAsset[]>([]);
  const [isEnrichingAssets, setIsEnrichingAssets] = useState(false);

  // Auto-fetch wallet data with React Query
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useWalletBalance(wallet, {
    refetchInterval,
    enabled: true
  });

  const { data: utxos, isLoading: utxosLoading, error: utxosError } = useWalletUtxos(wallet, {
    refetchInterval,
    enabled: true
  });

  // Convert balance to Asset[] format with optional metadata enrichment
  useEffect(() => {
    if (!balance) return;

    const enrichAssets = async () => {
      setIsEnrichingAssets(true);
      try {
        if (metadataProvider) {
          // Async enrichment with metadata provider
          const enrichedAssets = await convertAssetsToAssetArray(
            balance,
            async (assetId) => {
              try {
                return await metadataProvider.getMetadata(assetId);
              } catch (error) {
                console.warn(`Failed to fetch metadata for ${assetId}:`, error);
                return {};
              }
            }
          );
          setAvailableAssets(enrichedAssets);
        } else {
          // Sync conversion without metadata
          const basicAssets = convertAssetsToAssetArraySync(balance);
          setAvailableAssets(basicAssets);
        }
      } catch (error) {
        console.error('Error enriching assets:', error);
        // Fallback to basic assets
        setAvailableAssets(convertAssetsToAssetArraySync(balance));
      } finally {
        setIsEnrichingAssets(false);
      }
    };

    enrichAssets();
  }, [balance, metadataProvider]);

  // Loading state
  if (balanceLoading || utxosLoading) {
    return (
      <div className="transaction-creator-loading" style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading wallet data...</div>
      </div>
    );
  }

  // Error state
  if (balanceError || utxosError) {
    return (
      <div className="transaction-creator-error" style={{ padding: '2rem', color: '#ef4444' }}>
        <div>Error loading wallet data</div>
        {balanceError && <div>{balanceError.message}</div>}
        {utxosError && <div>{utxosError.message}</div>}
      </div>
    );
  }

  // No UTXOs available
  if (!utxos || utxos.length === 0) {
    return (
      <div className="transaction-creator-no-utxos" style={{ padding: '2rem', textAlign: 'center' }}>
        <div>No funds available in wallet</div>
      </div>
    );
  }

  return (
    <TransactionCreator
      wallet={wallet}
      availableUtxos={utxos}
      availableAssets={availableAssets}
      {...props}
    />
  );
};

