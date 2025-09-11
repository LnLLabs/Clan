import React, { useState } from 'react';
import { Button } from '../ui/buttons/Button';
import { Modal } from '../ui/modals/Modal';
import { WalletInterface, WalletConfig } from '@broclan/framework-core';

export interface WalletConnectorProps {
  wallets: WalletInterface[];
  onWalletSelect: (wallet: WalletInterface) => void;
  selectedWallet?: WalletInterface;
  isLoading?: boolean;
  className?: string;
  buttonText?: string;
  modalTitle?: string;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  wallets,
  onWalletSelect,
  selectedWallet,
  isLoading = false,
  className,
  buttonText = 'Connect Wallet',
  modalTitle = 'Select Wallet'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const handleWalletSelect = async (wallet: WalletInterface) => {
    setConnectingWallet(wallet.getName());
    try {
      await wallet.connect();
      onWalletSelect(wallet);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // You might want to show an error message here
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleDisconnect = async () => {
    if (selectedWallet) {
      await selectedWallet.disconnect();
      onWalletSelect(null as any); // This should be handled properly in the parent component
    }
  };

  if (selectedWallet) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            {selectedWallet.getName()}
          </span>
          <span className="text-xs text-green-600">
            ({selectedWallet.getAddress().slice(0, 8)}...{selectedWallet.getAddress().slice(-8)})
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          disabled={isLoading}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading || wallets.length === 0}
        className={className}
        loading={isLoading}
      >
        {wallets.length === 0 ? 'No wallets available' : buttonText}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="space-y-3">
          {wallets.map((wallet, index) => (
            <button
              key={index}
              onClick={() => handleWalletSelect(wallet)}
              disabled={connectingWallet === wallet.getName()}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {wallet.getName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-gray-900">{wallet.getName()}</span>
              </div>
              {connectingWallet === wallet.getName() && (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="ml-2 text-sm text-blue-600">Connecting...</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default WalletConnector;
