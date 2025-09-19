import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/modals/Modal';
import { Button } from '../../ui/buttons/Button';

export interface WalletExtension {
  name: string;
  icon: string;
  apiVersion: string;
  enable: () => Promise<any>;
  isEnabled: () => Promise<boolean>;
}

export interface WalletPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect: (walletName: string, walletApi: any) => void;
  title?: string;
  supportedWallets?: string[];
  excludeWallets?: string[];
  className?: string;
}

export const WalletPicker: React.FC<WalletPickerProps> = ({
  isOpen,
  onClose,
  onWalletSelect,
  title = 'Select Wallet',
  supportedWallets,
  excludeWallets = ['ccvault', 'typhoncip30'],
  className = ''
}) => {
  const [availableWallets, setAvailableWallets] = useState<WalletExtension[]>([]);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get available wallet extensions
  useEffect(() => {
    const getAvailableWallets = async () => {
      if (!isOpen || !(window as any).cardano) return;

      try {
        const wallets: WalletExtension[] = [];

        for (const [walletName, walletApi] of Object.entries((window as any).cardano)) {
          // Skip excluded wallets
          if (excludeWallets.includes(walletName)) continue;

          // Check if wallet is supported (if filter provided)
          if (supportedWallets && !supportedWallets.includes(walletName)) continue;

          // Check if wallet has required properties
          if (walletApi && typeof walletApi === 'object' && 'icon' in walletApi && walletApi.icon) {
            wallets.push({
              name: walletName,
              icon: String(walletApi.icon),
              apiVersion: (walletApi as any).apiVersion || '1.0.0',
              enable: (walletApi as any).enable,
              isEnabled: (walletApi as any).isEnabled
            });
          }
        }

        setAvailableWallets(wallets);
      } catch (err) {
        console.error('Error getting available wallets:', err);
        setError('Failed to load wallet extensions');
      }
    };

    getAvailableWallets();
  }, [isOpen, supportedWallets, excludeWallets]);

  const handleWalletSelect = async (wallet: WalletExtension) => {
    try {
      setConnectingWallet(wallet.name);
      setError(null);

      // Enable the wallet
      const walletApi = await wallet.enable();

      // Call the selection callback
      onWalletSelect(wallet.name, walletApi);

      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to wallet');
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleClose = () => {
    setError(null);
    setConnectingWallet(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      className={className}
    >
      <div className="wallet-picker">
        {error && (
          <div className="wallet-picker-error">
            <p>{error}</p>
          </div>
        )}

        {availableWallets.length === 0 ? (
          <div className="wallet-picker-empty">
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h3>No wallets found</h3>
              <p>Please install a Cardano wallet extension to continue</p>
              <a
                href="https://docs.cardano.org/new-to-cardano/getting-started-wallet/"
                target="_blank"
                rel="noopener noreferrer"
                className="wallet-info-link"
              >
                Learn about Cardano wallets
              </a>
            </div>
          </div>
        ) : (
          <div className="wallet-picker-grid">
            {availableWallets.map((wallet) => (
              <div key={wallet.name} className="wallet-option">
                <button
                  className="wallet-option-button"
                  onClick={() => handleWalletSelect(wallet)}
                  disabled={connectingWallet === wallet.name}
                >
                  <div className="wallet-option-content">
                    <img
                      src={wallet.icon}
                      alt={`${wallet.name} wallet`}
                      className="wallet-icon"
                    />
                    <div className="wallet-info">
                      <span className="wallet-name">{wallet.name}</span>
                      <span className="wallet-version">v{wallet.apiVersion}</span>
                    </div>
                    {connectingWallet === wallet.name && (
                      <div className="connecting-indicator">
                        <svg className="spinner" viewBox="0 0 24 24">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray="31.416"
                            strokeDashoffset="31.416"
                          >
                            <animateTransform
                              attributeName="transform"
                              type="rotate"
                              from="0 12 12"
                              to="360 12 12"
                              dur="1s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </svg>
                        <span>Connecting...</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="wallet-picker-footer">
          <p className="wallet-picker-note">
            Make sure your wallet is unlocked and has access to the current domain.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default WalletPicker;

