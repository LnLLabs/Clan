import React, { useEffect, useRef } from 'react';
import { WalletInterface } from '@clan/framework-core';
import { copyToClipboard, showInfo } from '@clan/framework-helpers';
import './Receive.css';

export interface ReceiveAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export interface ReceiveProps {
  wallet: WalletInterface;
  onAddressCopy?: (address: string) => void;
  actions?: ReceiveAction[];
  className?: string;
}

export const Receive: React.FC<ReceiveProps> = ({
  wallet,
  onAddressCopy,
  actions = [],
  className = ''
}) => {
  const [address, setAddress] = React.useState(wallet.getAddress());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamically import QRCode to avoid SSR issues
  const [QRCode, setQRCode] = React.useState<any>(null);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        let selectedAddress = wallet.getAddress();

        if (wallet.getDefaultAddress) {
          const defaultAddr = await wallet.getDefaultAddress();
          if (defaultAddr && defaultAddr !== '') {
            selectedAddress = defaultAddr;
          }
        }

        setAddress(selectedAddress);
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      }
    };

    loadWalletData();

    import('qrcode').then((module) => {
      setQRCode(module.default);
    }).catch((error) => {
      console.warn('QRCode library not available:', error);
    });
  }, [wallet]);

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(address);
    if (success !== undefined) {
      showInfo('Address copied to clipboard!');
      onAddressCopy?.(address);
    }
  };

  useEffect(() => {
    if (QRCode && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        address,
        (error: any) => {
          if (error) console.error(error);
        }
      );
    }
  }, [address, QRCode]);

  const formatAddress = (addr: string) => {
    // Show full address - let CSS handle wrapping if needed
    return addr;
  };

  return (
    <div className={`receive-container ${className}`}>
      <p className="receive-instruction">
        Send funds from one of your other wallets to the address bellow:
      </p>

      <div className="receive-qr-container">
        <canvas ref={canvasRef} className="receive-qr-code" />
      </div>

      <div className="receive-address">
        {formatAddress(address)}
      </div>

      <div className="receive-actions">
        <button className="receive-button receive-button-copy" onClick={handleCopyAddress}>
          <svg className="receive-button-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
          Copy Address
        </button>

        {actions.map((action, index) => (
          <button key={index} className="receive-button" onClick={action.onClick}>
            <span className="receive-button-icon">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Receive;

