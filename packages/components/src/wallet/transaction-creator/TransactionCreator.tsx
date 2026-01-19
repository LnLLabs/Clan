import React, { useState, useEffect } from 'react';
import { Assets, UTxO, WalletInterface, TransactionBuildOptions, MetadataProvider } from '@clan/framework-core';
import { coinSelect } from '@clan/framework-core';
import { Button } from '../../ui/buttons/Button';
import { Modal } from '../../ui/modals/Modal';
import { ContactPicker } from '../../contacts/ContactPicker';
import { AssetPicker, UIAsset, SelectedAsset } from '../asset-picker/AssetPicker';
import { useMetadataProvider } from '@clan/framework-providers';
import { getTokenInfo, TokenInfo, decodeAssetName as decodeAssetNameHelper } from '@clan/framework-helpers';
import { TokenElement } from '../token/TokenElement';
import { normalizeNumberString } from '../../utils/number';

export interface TransactionRecipient {
  address: string;
  assets: Assets;
  datum?: string;
  datumHash?: string;
}

export interface TransactionCreatorProps {
  wallet: WalletInterface;
  metadataProvider?: MetadataProvider;
  onTransactionCreated?: (options: TransactionBuildOptions) => void;
  onCancel?: () => void;
  className?: string;
  /**
   * @deprecated TransactionCreator now fetches UTxOs directly from the provided wallet.
   */
  availableUtxos?: UTxO[];
  /**
   * @deprecated TransactionCreator now derives available assets from the wallet balance.
   */
  availableAssets?: UIAsset[];
  title?: string;
  /**
   * Optional initial recipients to prefill the transaction form.
   * If provided, these will be used to initialize the recipients state on first render.
   * Assets default to { lovelace: 0n } if not provided.
   */
  initialRecipients?: { address: string; assets?: Assets; datum?: string; datumHash?: string }[];
}

const useWalletSnapshot = (
  wallet: WalletInterface
): {
  balance: Assets | null;
  utxos: UTxO[];
  balanceLoading: boolean;
  utxosLoading: boolean;
  balanceError: string | null;
  utxosError: string | null;
} => {
  const [balance, setBalance] = useState<Assets | null>(null);
  const [utxos, setUtxos] = useState<UTxO[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [utxosLoading, setUtxosLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [utxosError, setUtxosError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWalletData = async () => {
      setBalanceLoading(true);
      setBalanceError(null);
      setUtxosLoading(true);
      setUtxosError(null);

      try {
        const [balanceResult, utxosResult] = await Promise.allSettled([
          wallet.getBalance(),
          wallet.getUtxos()
        ]);

        if (!isMounted) {
          return;
        }

        if (balanceResult.status === 'fulfilled') {
          setBalance(balanceResult.value);
        } else {
          setBalance(null);
          const reason = balanceResult.reason;
          setBalanceError(reason instanceof Error ? reason.message : String(reason));
        }

        if (utxosResult.status === 'fulfilled') {
          setUtxos(utxosResult.value);
        } else {
          setUtxos([]);
          const reason = utxosResult.reason;
          setUtxosError(reason instanceof Error ? reason.message : String(reason));
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setBalance(null);
        setUtxos([]);
        setBalanceError(error instanceof Error ? error.message : String(error));
        setUtxosError(error instanceof Error ? error.message : String(error));
      } finally {
        if (isMounted) {
          setBalanceLoading(false);
          setUtxosLoading(false);
        }
      }
    };

    fetchWalletData();

    return () => {
      isMounted = false;
    };
  }, [wallet]);

  return {
    balance,
    utxos,
    balanceLoading,
    utxosLoading,
    balanceError,
    utxosError
  };
};

export const TransactionCreator: React.FC<TransactionCreatorProps> = ({
  wallet,
  metadataProvider,
  onTransactionCreated,
  onCancel,
  className = '',
  availableUtxos,
  availableAssets = [],
  title = 'Create Transaction',
  initialRecipients = [],
}) => {
  const metadataProviderFromContext = useMetadataProvider();
  const effectiveMetadataProvider = metadataProvider ?? metadataProviderFromContext;

  // Lazy initialization: only initialize from initialRecipients on first render
  const [recipients, setRecipients] = useState<TransactionRecipient[]>(() => {
    if (initialRecipients && initialRecipients.length > 0) {
      return initialRecipients.map(recipient => ({
        address: recipient.address,
        assets: recipient.assets ?? { 'lovelace': 0n },
        datum: recipient.datum,
        datumHash: recipient.datumHash
      }));
    }
    return [{ address: '', assets: { 'lovelace': 0n } }];
  });
  const [selectedUtxos, setSelectedUtxos] = useState<UTxO[]>([]);
  const [estimatedFee, setEstimatedFee] = useState<bigint>(0n);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewOptions, setPreviewOptions] = useState<TransactionBuildOptions | null>(null);
  const [showContactPicker, setShowContactPicker] = useState<number | null>(null);
  const [addressErrors, setAddressErrors] = useState<{ [key: number]: string }>({});
  const [adaInputValues, setAdaInputValues] = useState<Record<number, string>>({});
  const [showAssetPicker, setShowAssetPicker] = useState<number | null>(null);
  const [assetsForPicker, setAssetsForPicker] = useState<UIAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [hasMetadataForPicker, setHasMetadataForPicker] = useState(false);

  const {
    balance: walletBalance,
    utxos: walletUtxos,
    balanceLoading,
    utxosLoading,
    balanceError,
    utxosError
  } = useWalletSnapshot(wallet);
  const usingDeprecatedUtxos = Boolean(availableUtxos && availableUtxos.length > 0);
  const usingDeprecatedAssets = Boolean(availableAssets && availableAssets.length > 0);
  const resolvedUtxos = usingDeprecatedUtxos ? (availableUtxos ?? []) : walletUtxos;

  useEffect(() => {
    if (availableUtxos && availableUtxos.length > 0) {
      console.warn(
        'TransactionCreator: `availableUtxos` prop is deprecated. The component now fetches UTxOs directly from the provided wallet.'
      );
    }
  }, [availableUtxos]);

  useEffect(() => {
    if (availableAssets && availableAssets.length > 0) {
      console.warn(
        'TransactionCreator: `availableAssets` prop is deprecated. The component now derives assets from the wallet balance.'
      );
      setAssetsForPicker(availableAssets);
      setHasMetadataForPicker(availableAssets.some(asset => asset.isNFT !== undefined));
      setAssetsLoading(false);
      setAssetsError(null);
    }
  }, [availableAssets]);

  // Decode hex-encoded asset name from assetId
  const decodeAssetName = (assetId: string): string => {
    if (assetId === 'lovelace') {
      return 'ADA';
    }
    try {
      return decodeAssetNameHelper(assetId);
    } catch {
      return assetId.slice(0, 8) + '...';
    }
  };
  useEffect(() => {
    let isMounted = true;

    if (availableAssets && availableAssets.length > 0) {
      return () => {
        isMounted = false;
      };
    }

    if (!walletBalance) {
      setAssetsForPicker([]);
      setHasMetadataForPicker(false);
      setAssetsLoading(false);
      setAssetsError(null);
      return () => {
        isMounted = false;
      };
    }

    const assetEntries = Object.entries(walletBalance).filter(
      ([assetId, balance]) => assetId !== 'lovelace' && balance > 0n
    );

    const fallbackAssets: UIAsset[] = assetEntries.map(([assetId, balance]) => ({
      id: assetId,
      balance,
      name: decodeAssetName(assetId),
      decimals: 0
    }));

    if (assetEntries.length === 0) {
      setAssetsForPicker([]);
      setHasMetadataForPicker(false);
      setAssetsLoading(false);
      setAssetsError(null);
      return () => {
        isMounted = false;
      };
    }

    if (!effectiveMetadataProvider) {
      if (isMounted) {
        setAssetsForPicker(fallbackAssets);
        setHasMetadataForPicker(false);
        setAssetsLoading(false);
        setAssetsError(null);
      }
      return () => {
        isMounted = false;
      };
    }

    setAssetsLoading(true);
    setAssetsError(null);

    const enrichAssets = async () => {
      try {
        const enriched = await Promise.all(
          assetEntries.map(async ([assetId, balance]) => {
            try {
              const info = await getTokenInfo(assetId, effectiveMetadataProvider);
              return [assetId, balance, info ?? null] as [string, bigint, TokenInfo | null];
            } catch (error) {
              console.warn(`Failed to fetch metadata for ${assetId}:`, error);
              return [assetId, balance, null] as [string, bigint, TokenInfo | null];
            }
          })
        );

        if (!isMounted) {
          return;
        }

        let metadataDetected = false;

        const assets = enriched.map(([assetId, balance, info]) => {
          const isMetadata = info?.provider === 'metadata-provider';
          if (isMetadata) {
            metadataDetected = true;
          }

          const decimals =
            isMetadata && typeof info?.decimals === 'number'
              ? info.decimals
              : 0;
          const name = isMetadata
            ? info?.name || decodeAssetName(assetId)
            : decodeAssetName(assetId);

          return {
            id: assetId,
            balance,
            name,
            ticker: info?.ticker,
            decimals,
            isNFT: isMetadata ? !!info?.isNft : undefined,
            icon: info?.image
          } as UIAsset;
        });

        setAssetsForPicker(assets);
        setHasMetadataForPicker(metadataDetected);
        setAssetsLoading(false);
        setAssetsError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load token metadata:', error);
        setAssetsForPicker(fallbackAssets);
        setHasMetadataForPicker(false);
        setAssetsError(error instanceof Error ? error.message : String(error));
        setAssetsLoading(false);
      }
    };

    enrichAssets();

    return () => {
      isMounted = false;
    };
  }, [walletBalance, effectiveMetadataProvider]);

  // Validate Cardano address
  const validateCardanoAddress = (address: string): boolean => {
    if (!address) return false;
    // Basic Cardano address validation
    // Mainnet addresses start with 'addr1' and testnets with 'addr_test1'
    // Addresses are typically 103-108 characters long (bech32 format)
    const cardanoAddressRegex = /^(addr1|addr_test1)[a-z0-9]{98,104}$/;
    return cardanoAddressRegex.test(address);
  };

  // Update recipient address with validation
  const updateRecipientAddress = (index: number, address: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], address };
    setRecipients(newRecipients);

    // Validate address
    if (address && !validateCardanoAddress(address)) {
      setAddressErrors({ ...addressErrors, [index]: 'Invalid Cardano address' });
    } else {
      const newErrors = { ...addressErrors };
      delete newErrors[index];
      setAddressErrors(newErrors);
    }
  };

  // Convert Assets to SelectedAsset[] (excluding lovelace)
  const assetsToSelectedAssets = (assets: Assets): SelectedAsset[] => {
    return Object.entries(assets)
      .filter(([assetId, amount]) => assetId !== 'lovelace' && amount > 0n)
      .map(([assetId, amount]) => ({ assetId, amount }));
  };

  // Convert SelectedAsset[] to Assets
  const selectedAssetsToAssets = (selectedAssets: SelectedAsset[]): Assets => {
    const assets: Assets = {};
    selectedAssets.forEach(({ assetId, amount }) => {
      assets[assetId] = amount;
    });
    return assets;
  };

  // Update recipient assets from asset picker (preserve lovelace)
  const handleAssetsConfirmed = (index: number, selectedAssets: SelectedAsset[]) => {
    const newRecipients = [...recipients];
    const currentLovelace = newRecipients[index].assets['lovelace'] || 0n;
    newRecipients[index] = {
      ...newRecipients[index],
      assets: {
        'lovelace': currentLovelace, // Preserve lovelace amount
        ...selectedAssetsToAssets(selectedAssets)
      }
    };
    setRecipients(newRecipients);
    setShowAssetPicker(null);
  };

  // Remove a specific asset from recipient
  const removeAssetFromRecipient = (index: number, assetId: string) => {
    const newRecipients = [...recipients];
    const newAssets = { ...newRecipients[index].assets };
    delete newAssets[assetId];
    newRecipients[index] = { ...newRecipients[index], assets: newAssets };
    setRecipients(newRecipients);
  };

  // Remove all assets from recipient (except lovelace which has its own input)
  const removeAllAssetsFromRecipient = (index: number) => {
    const newRecipients = [...recipients];
    const currentLovelace = newRecipients[index].assets['lovelace'] || 0n;
    newRecipients[index] = { 
      ...newRecipients[index], 
      assets: { 'lovelace': currentLovelace } // Preserve lovelace
    };
    setRecipients(newRecipients);
  };

  // Calculate total assets to send
  const calculateTotalAssets = (): Assets => {
    const total: Assets = {};

    recipients.forEach(recipient => {
      Object.entries(recipient.assets).forEach(([assetId, amount]) => {
        if (total[assetId]) {
          total[assetId] += BigInt(amount);
        } else {
          total[assetId] = BigInt(amount);
        }
      });
    });

    return total;
  };

  // Estimate fee based on transaction complexity
  const estimateFee = async (totalAssets: Assets): Promise<bigint> => {
    // Simple fee estimation - in a real implementation, this would use the wallet's fee estimation
    const baseFee = 200000n; // 0.2 ADA base fee
    const perOutputFee = 10000n; // 0.01 ADA per output
    const perAssetFee = 10000n; // 0.01 ADA per asset type

    const outputCount = recipients.length;
    const assetCount = Object.keys(totalAssets).length;

    return baseFee + (perOutputFee * BigInt(outputCount)) + (perAssetFee * BigInt(assetCount));
  };

  // Calculate required UTXOs for the transaction
  const calculateRequiredUtxos = async () => {
    if (isCalculating) return;
    if (resolvedUtxos.length === 0) {
      setSelectedUtxos([]);
      setEstimatedFee(0n);
      return;
    }

    setIsCalculating(true);
    try {
      const totalAssets = calculateTotalAssets();
      const fee = await estimateFee(totalAssets);
      setEstimatedFee(fee);

      // Add fee to required assets
      const requiredAssets = { ...totalAssets };
      if (requiredAssets['lovelace']) {
        requiredAssets['lovelace'] += fee;
      } else {
        requiredAssets['lovelace'] = fee;
      }

      // Use coin selection algorithm
      const selected = coinSelect(requiredAssets, resolvedUtxos);
      setSelectedUtxos(selected);
    } catch (error) {
      console.error('Error calculating UTXOs:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Add a new recipient
  const addRecipient = () => {
    setRecipients([...recipients, { address: '', assets: { 'lovelace': 0n } }]);
    setAdaInputValues((prev) => ({ ...prev, [recipients.length]: '' }));
  };

  // Remove a recipient
  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(newRecipients);
      setAdaInputValues((prev) => {
        const updated: Record<number, string> = {};
        Object.entries(prev).forEach(([key, value]) => {
          const currentIndex = Number(key);
          if (currentIndex === index) return;
          updated[currentIndex > index ? currentIndex - 1 : currentIndex] = value;
        });
        return updated;
      });
    }
  };

  // Update recipient data
  const updateRecipient = (index: number, field: keyof TransactionRecipient, value: string | Assets) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };


  // Preview transaction
  const previewTransactionCreation = async () => {
    try {
      const options: TransactionBuildOptions = {
        outputs: recipients.map(r => ({ address: r.address, assets: r.assets }))
      };
      setPreviewOptions(options);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing transaction:', error);
    }
  };

  // Create transaction
  const createTransaction = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const options: TransactionBuildOptions = {
        outputs: recipients.map(r => ({ address: r.address, assets: r.assets }))
      };

      onTransactionCreated?.(options);
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Recalculate when recipients change
  useEffect(() => {
    if (!usingDeprecatedUtxos && utxosLoading) {
      return;
    }
    calculateRequiredUtxos();
  }, [recipients, walletUtxos, availableUtxos, utxosLoading, usingDeprecatedUtxos]);

  const balanceReady = usingDeprecatedAssets || !balanceLoading;
  const utxosReady = usingDeprecatedUtxos || !utxosLoading;

  if (!balanceReady || !utxosReady) {
    return (
      <div className={`transaction-creator ${className}`}>
        <div className="transaction-creator-loading" style={{ padding: '2rem', textAlign: 'center' }}>
          Loading wallet data...
        </div>
      </div>
    );
  }

  const criticalBalanceError = !usingDeprecatedAssets && balanceError;
  const criticalUtxosError = !usingDeprecatedUtxos && utxosError;

  if (criticalBalanceError || criticalUtxosError) {
    return (
      <div className={`transaction-creator ${className}`}>
        <div className="transaction-creator-error" style={{ padding: '2rem', color: '#ef4444' }}>
          <div>Error loading wallet information</div>
          {criticalBalanceError && <div>{criticalBalanceError}</div>}
          {criticalUtxosError && <div>{criticalUtxosError}</div>}
        </div>
      </div>
    );
  }

  if (resolvedUtxos.length === 0) {
    return (
      <div className={`transaction-creator ${className}`}>
        <div className="transaction-creator-empty" style={{ padding: '2rem', textAlign: 'center' }}>
          No funds available in wallet
        </div>
      </div>
    );
  }

  const totalAssets = calculateTotalAssets();
  const adaTotal = Number(totalAssets['lovelace'] || 0n) / 1000000;

  return (
    <div className={`transaction-creator ${className}`}>
      <div className="creator-header">
        <h2>{title}</h2>
        {onCancel && (
          <button className="cancel-button" onClick={onCancel}>
            ✕
          </button>
        )}
      </div>

      {/* Recipients Section */}
      <div className="recipients-section">
        <div className="section-header">
          <h3>Recipients</h3>
        </div>

        <div className="recipients-list">
          {recipients.map((recipient, index) => (
            <div key={index} className="recipient-item">
              {index > 0 && (
                  <button
                  className="remove-recipient-x"
                    onClick={() => removeRecipient(index)}
                  title="Remove recipient"
                  >
                  ✕
                  </button>
                )}

              {/* Address Input with ADA Amount */}
              <div className="address-input">
                <div className="address-input-wrapper">
                  <input
                    
                    type="text"
                    value={recipient.address}
                    onChange={(e) => updateRecipientAddress(index, e.target.value)}
                    placeholder="Recipient address"
                    className={addressErrors[index] ? 'address-input-base error' : 'address-input-base'}
                  />
                  <button
                    type="button"
                    className="contact-picker-button"
                    onClick={() => setShowContactPicker(index)}
                    title="Select from contacts"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </button>
                  <div className="ada-amount-input-wrapper">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      className="ada-amount-input"
                      value={adaInputValues[index] ?? (Number(recipient.assets['lovelace'] || 0n) / 1000000).toString()}
                      onChange={(e) => {
                        const normalized = normalizeNumberString(e.target.value);
                        setAdaInputValues((prev) => ({ ...prev, [index]: normalized }));

                        if (normalized === '') {
                          const newRecipients = [...recipients];
                          newRecipients[index] = {
                            ...newRecipients[index],
                            assets: {
                              ...newRecipients[index].assets,
                              'lovelace': 0n
                            }
                          };
                          setRecipients(newRecipients);
                          return;
                        }

                        const numAmount = parseFloat(normalized);
                        if (!isNaN(numAmount) && numAmount >= 0) {
                          const newRecipients = [...recipients];
                          newRecipients[index] = {
                            ...newRecipients[index],
                            assets: {
                              ...newRecipients[index].assets,
                              'lovelace': BigInt(Math.floor(numAmount * 1000000))
                            }
                          };
                          setRecipients(newRecipients);
                        }
                      }}
                      placeholder="0"
                    />
                    <button
                      type="button"
                      className="max-ada-button"
                      onClick={() => {
                        // Get total available ADA from wallet
                        const totalLovelace = resolvedUtxos.reduce((sum, utxo) =>
                          sum + (utxo.assets['lovelace'] || 0n), 0n
                        );
                        const newRecipients = [...recipients];
                        newRecipients[index] = {
                          ...newRecipients[index],
                          assets: {
                            ...newRecipients[index].assets,
                            'lovelace': totalLovelace
                          }
                        };
                        setRecipients(newRecipients);
                        setAdaInputValues((prev) => ({
                          ...prev,
                          [index]: (Number(totalLovelace) / 1000000).toString()
                        }));
                      }}
                      title="Send maximum ADA"
                    >
                      Max
                    </button>
                  </div>
                </div>
                {addressErrors[index] && (
                  <span className="address-error">{addressErrors[index]}</span>
                )}
              </div>

              {/* Assets Section */}
              <div className="assets-section">

                {assetsLoading && (
                  <div className="assets-loading" style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Loading asset details...
                  </div>
                )}

                {assetsError && (
                  <div className="assets-error" style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '0.5rem' }}>
                    {assetsError}
                  </div>
                )}

                {/* Selected Assets Chips (excluding ADA/lovelace) */}
                <div className="selected-assets-chips">
                  {Object.entries(recipient.assets)
                    .filter(([assetId, amount]) => assetId !== 'lovelace' && amount > 0n)
                    .map(([assetId, amount]) => {
                      const handleTokenClick = () => {
                        if (!assetId || assetId === 'lovelace') {
                          return;
                        }

                        const policyId = assetId.slice(0, 56);
                        const assetNameHex = assetId.slice(56);
                        const explorerBaseUrl = 'https://cexplorer.io';
                        const tokenLink = assetNameHex && assetNameHex !== ''
                          ? `${explorerBaseUrl}/asset/${policyId}${assetNameHex}`
                          : `${explorerBaseUrl}/policy/${policyId}`;

                        if (tokenLink && typeof window !== 'undefined') {
                          window.open(tokenLink, '_blank', 'noopener');
                        }
                      };

                      const asset = assetsForPicker.find(a => a.id === assetId);
                      const decimals = asset?.decimals !== undefined
                        ? asset.decimals
                        : (hasMetadataForPicker ? (asset?.isNFT ? 0 : 6) : 0);
                      const displayAmount = decimals > 0
                        ? Number(amount) / Math.pow(10, decimals)
                        : Number(amount);

                      const formattedAmount = decimals > 0
                        ? displayAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: Math.min(decimals, 6)
                          })
                        : displayAmount.toLocaleString('en-US');

                      const isMetadataAsset = Boolean(hasMetadataForPicker && asset?.id);
                      const chipClassName = `asset-chip transaction-asset-chip${
                        isMetadataAsset ? ' transaction-asset-chip--metadata' : ''
                      }`;

                      return (
                        <div key={assetId} className={chipClassName} title={assetId}>
                          {isMetadataAsset
                            ? (
                            <TokenElement
                              tokenId={assetId}
                              amount={Number(amount)}
                              metadataProvider={effectiveMetadataProvider}
                              className="asset-chip-token"
                              onClick={handleTokenClick}
                            />
                            )
                            : (
                            <>
                              <span className="asset-chip-text">
                                {decodeAssetName(assetId)} {formattedAmount}
                              </span>
                            </>
                            )}
                          {isMetadataAsset && (
                            <span className="transaction-asset-amount">
                              {formattedAmount}
                            </span>
                          )}
                          <button
                            className="asset-chip-remove"
                            onClick={() => removeAssetFromRecipient(index, assetId)}
                            title="Remove asset"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="asset-actions">
                  <button
                    className="add-assets-button"
                    onClick={() => setShowAssetPicker(index)}
                    disabled={assetsLoading || assetsForPicker.length === 0}
                  >
                    Add Assets
                  </button>
                  {Object.keys(recipient.assets).filter(k => k !== 'lovelace').length > 0 && (
                    <button
                      className="remove-all-button"
                      onClick={() => removeAllAssetsFromRecipient(index)}
                    >
                      Remove All
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Recipient Button */}
          <div className="add-recipient-button-container">
          <button className="add-recipient-button" onClick={addRecipient}>
            + Add Recipient
          </button>
          </div>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="creator-actions">

        <Button
          variant="primary"
          onClick={createTransaction}
          disabled={isCreating || isCalculating || recipients.some(r => !r.address)}
        >
          {isCreating ? 'Creating...' : 'Create Transaction'}
        </Button>
      </div>


      {/* Contact Picker Modal */}
      {showContactPicker !== null && (
        <ContactPicker
          isModal={true}
          onSelect={(contact) => {
            if (showContactPicker !== null) {
              updateRecipientAddress(showContactPicker, contact.address);
              setShowContactPicker(null);
            }
          }}
          onClose={() => setShowContactPicker(null)}
          title="Select Contact"
          searchPlaceholder="Search contacts..."
        />
      )}

      {/* Asset Picker Modal */}
      {showAssetPicker !== null && (
        <AssetPicker
          availableAssets={assetsForPicker.filter(a => a && a.id && a.id !== 'lovelace')}
          selectedAssets={assetsToSelectedAssets(recipients[showAssetPicker].assets)}
          onConfirm={(selected) => handleAssetsConfirmed(showAssetPicker, selected)}
          onClose={() => setShowAssetPicker(null)}
          hasMetadataProvider={hasMetadataForPicker}
        />
      )}
    </div>
  );
};

export default TransactionCreator;

