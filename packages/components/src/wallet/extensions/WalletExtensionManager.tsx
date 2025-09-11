import React, { useState, useEffect } from 'react';

export interface WalletExtension {
  name: string;
  identifier: string;
  icon: string;
  version: string;
  isInstalled: boolean;
  isEnabled: boolean;
  api?: any;
}

export interface WalletExtensionManagerProps {
  onWalletConnected?: (wallet: WalletExtension) => void;
  onWalletDisconnected?: () => void;
  supportedWallets?: string[];
  autoConnect?: boolean;
  className?: string;
}

export const WalletExtensionManager: React.FC<WalletExtensionManagerProps> = ({
  onWalletConnected,
  onWalletDisconnected,
  supportedWallets = ['nami', 'eternl', 'flint', 'gerowallet', 'yoroi'],
  autoConnect = false,
  className = ''
}) => {
  const [extensions, setExtensions] = useState<WalletExtension[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<WalletExtension | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize wallet extensions detection
  useEffect(() => {
    detectWalletExtensions();
  }, []);

  // Auto-connect if enabled and a wallet was previously connected
  useEffect(() => {
    if (autoConnect && !connectedWallet) {
      const lastConnected = localStorage.getItem('broclan-last-wallet');
      if (lastConnected) {
        const wallet = extensions.find(ext => ext.identifier === lastConnected);
        if (wallet) {
          connectWallet(wallet.identifier);
        }
      }
    }
  }, [extensions, autoConnect, connectedWallet]);

  const detectWalletExtensions = () => {
    const detectedExtensions: WalletExtension[] = [];

    // Check for each supported wallet extension
    supportedWallets.forEach(walletId => {
      const walletExtension = detectWallet(walletId);
      if (walletExtension) {
        detectedExtensions.push(walletExtension);
      }
    });

    setExtensions(detectedExtensions);
  };

  const detectWallet = (walletId: string): WalletExtension | null => {
    try {
      // Check if the wallet extension is available in window.cardano
      const cardano = (window as any).cardano;
      if (!cardano || !cardano[walletId]) {
        return null;
      }

      const walletApi = cardano[walletId];
      const walletInfo = walletApi.getWalletInfo ? walletApi.getWalletInfo() : {};

      return {
        name: walletInfo.name || getWalletDisplayName(walletId),
        identifier: walletId,
        icon: walletInfo.icon || getWalletIcon(walletId),
        version: walletInfo.version || 'Unknown',
        isInstalled: true,
        isEnabled: false,
        api: walletApi
      };
    } catch (error) {
      console.warn(`Failed to detect ${walletId} wallet:`, error);
      return null;
    }
  };

  const getWalletDisplayName = (walletId: string): string => {
    const nameMap: Record<string, string> = {
      nami: 'Nami',
      eternl: 'Eternl',
      flint: 'Flint',
      gerowallet: 'GeroWallet',
      yoroi: 'Yoroi'
    };
    return nameMap[walletId] || walletId;
  };

  const getWalletIcon = (walletId: string): string => {
    const iconMap: Record<string, string> = {
      nami: '🟡',
      eternl: '🔷',
      flint: '🔴',
      gerowallet: '🟢',
      yoroi: '🔵'
    };
    return iconMap[walletId] || '📱';
  };

  const connectWallet = async (walletId: string) => {
    const wallet = extensions.find(ext => ext.identifier === walletId);
    if (!wallet || isConnecting) return;

    setIsConnecting(true);
    try {
      // Enable the wallet extension
      const api = await wallet.api.enable();

      // Update wallet status
      const updatedWallet = { ...wallet, isEnabled: true, api };

      // Update extensions list
      setExtensions(prev =>
        prev.map(ext =>
          ext.identifier === walletId ? updatedWallet : ext
        )
      );

      // Set connected wallet
      setConnectedWallet(updatedWallet);

      // Store last connected wallet
      localStorage.setItem('broclan-last-wallet', walletId);

      // Notify parent component
      onWalletConnected?.(updatedWallet);

    } catch (error) {
      console.error(`Failed to connect to ${walletId}:`, error);
      // Handle user rejection or other errors
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (connectedWallet) {
      // Update wallet status
      setExtensions(prev =>
        prev.map(ext =>
          ext.identifier === connectedWallet.identifier
            ? { ...ext, isEnabled: false, api: undefined }
            : ext
        )
      );

      // Clear connected wallet
      setConnectedWallet(null);

      // Remove from localStorage
      localStorage.removeItem('broclan-last-wallet');

      // Notify parent component
      onWalletDisconnected?.();
    }
  };

  const refreshWallets = () => {
    detectWalletExtensions();
  };

  const getWalletAddress = async (): Promise<string | null> => {
    if (!connectedWallet?.api) return null;

    try {
      const addresses = await connectedWallet.api.getUsedAddresses();
      return addresses[0] || null;
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  };

  const getWalletBalance = async (): Promise<any> => {
    if (!connectedWallet?.api) return null;

    try {
      const balance = await connectedWallet.api.getBalance();
      return balance;
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return null;
    }
  };

  const signTransaction = async (tx: any): Promise<any> => {
    if (!connectedWallet?.api) {
      throw new Error('No wallet connected');
    }

    try {
      const witnessSet = await connectedWallet.api.signTx(tx, true);
      return witnessSet;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  };

  const submitTransaction = async (tx: any): Promise<string> => {
    if (!connectedWallet?.api) {
      throw new Error('No wallet connected');
    }

    try {
      const txHash = await connectedWallet.api.submitTx(tx);
      return txHash;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  };

  // Expose wallet methods for parent components
  const walletMethods = {
    getAddress: getWalletAddress,
    getBalance: getWalletBalance,
    signTx: signTransaction,
    submitTx: submitTransaction
  };

  return (
    <div className={`wallet-extension-manager ${className}`}>
      <div className="extension-header">
        <h3>Wallet Extensions</h3>
        <button
          className="refresh-button"
          onClick={refreshWallets}
          title="Refresh wallet detection"
        >
          🔄
        </button>
      </div>

      {connectedWallet ? (
        <div className="connected-wallet">
          <div className="wallet-info">
            <div className="wallet-icon">{connectedWallet.icon}</div>
            <div className="wallet-details">
              <h4>{connectedWallet.name}</h4>
              <span className="wallet-status connected">Connected</span>
            </div>
          </div>

          <button
            className="disconnect-button"
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="available-wallets">
          {extensions.length > 0 ? (
            <div className="wallets-grid">
              {extensions.map((extension) => (
                <div
                  key={extension.identifier}
                  className={`wallet-option ${isConnecting ? 'connecting' : ''}`}
                  onClick={() => connectWallet(extension.identifier)}
                >
                  <div className="wallet-icon">{extension.icon}</div>
                  <div className="wallet-info">
                    <h4>{extension.name}</h4>
                    <span className="wallet-version">v{extension.version}</span>
                  </div>

                  {isConnecting && (
                    <div className="connecting-spinner">⟳</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-wallets">
              <div className="no-wallets-icon">🔌</div>
              <h4>No Wallet Extensions Found</h4>
              <p>Please install a Cardano wallet extension to continue.</p>

              <div className="wallet-links">
                <a
                  href="https://namiwallet.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wallet-link"
                >
                  Nami Wallet
                </a>
                <a
                  href="https://eternl.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wallet-link"
                >
                  Eternl
                </a>
                <a
                  href="https://flint-wallet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wallet-link"
                >
                  Flint
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connection Status */}
      {isConnecting && (
        <div className="connection-status">
          <div className="status-spinner">⟳</div>
          <span>Connecting to wallet...</span>
        </div>
      )}
    </div>
  );
};

// Wallet extension utilities
export const isWalletExtensionAvailable = (walletId: string): boolean => {
  try {
    const cardano = (window as any).cardano;
    return !!(cardano && cardano[walletId]);
  } catch {
    return false;
  }
};

export const getInstalledWallets = (): string[] => {
  const supportedWallets = ['nami', 'eternl', 'flint', 'gerowallet', 'yoroi'];
  return supportedWallets.filter(walletId => isWalletExtensionAvailable(walletId));
};

export const requestWalletAccess = async (walletId: string): Promise<any> => {
  const cardano = (window as any).cardano;
  if (!cardano || !cardano[walletId]) {
    throw new Error(`Wallet ${walletId} is not available`);
  }

  return await cardano[walletId].enable();
};

export default WalletExtensionManager;
