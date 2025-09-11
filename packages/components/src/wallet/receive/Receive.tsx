import React, { useEffect, useRef } from 'react';
import { WalletInterface } from '@broclan/framework-core';
import { copyToClipboard, showInfo } from '@broclan/framework-helpers';

export interface ReceiveProps {
  wallet: WalletInterface;
  donationAddress?: string;
  onAddressCopy?: (address: string) => void;
  className?: string;
}

export const Receive: React.FC<ReceiveProps> = ({
  wallet,
  donationAddress = 'addr1q9jae9tlky2gw97hxqkrdm5lu0qlasrzw5u5ju9acpazk3ev94h8gqswgsgfp59e4v0z2dapyamyctfeyzykr97pajdq0nanuq',
  onAddressCopy,
  className = ''
}) => {
  const [address, setAddress] = React.useState(
    wallet.getDefaultAddress() === '' ? wallet.getAddress() : wallet.getDefaultAddress()
  );
  const [newStake, setNewStake] = React.useState(false);
  const [options, setOptions] = React.useState<string[]>([]);
  const [optionsNames, setOptionsNames] = React.useState<{ [key: string]: string }>({});
  const [isValidAddress, setIsValidAddress] = React.useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamically import QRCode to avoid SSR issues
  const [QRCode, setQRCode] = React.useState<any>(null);

  useEffect(() => {
    import('qrcode').then((module) => {
      setQRCode(module.default);
    }).catch((error) => {
      console.warn('QRCode library not available:', error);
    });
  }, []);

  const handleClick = async (value: string) => {
    if (isValidAddress) {
      const success = await copyToClipboard(value);
      if (success) {
        showInfo('Address copied to clipboard!');
        onAddressCopy?.(value);
      }
    }
  };

  useEffect(() => {
    if (QRCode && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        isValidAddress ? address : ' ',
        (error: any) => {
          if (error) console.error(error);
        }
      );
    }
  }, [address, QRCode, isValidAddress]);

  const handleStakingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (value === 'new') {
      setNewStake(true);
      setIsValidAddress(false);
      setAddress('Enter an address of the wallet that will receive the rewards');
    } else {
      setNewStake(false);
      setIsValidAddress(true);
      try {
        setAddress(wallet.getAddress(value));
      } catch (error) {
        setAddress('Invalid address');
        setIsValidAddress(false);
      }
    }
  };

  const handleNewAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value === '') {
      setAddress('Enter an address of the wallet that will receive the rewards');
      setIsValidAddress(false);
      return;
    }

    try {
      setAddress(wallet.getAddress(value));
      setIsValidAddress(true);
    } catch {
      setAddress('Invalid Stake Address');
      setIsValidAddress(false);
    }
  };

  useEffect(() => {
    const fundedAddresses = wallet.getFundedAddress();
    const addressNames: { [key: string]: string } = {};

    fundedAddresses.forEach((address: string) => {
      addressNames[address] = wallet.getAddressName(address);
    });

    // Add the unstaked address only if it is not already in the list
    const walletAddress = wallet.getAddress();
    if (!fundedAddresses.includes(walletAddress)) {
      fundedAddresses.push(walletAddress);
      addressNames[walletAddress] = 'Regular Address';
    }

    // Add donation address
    const donationAddr = wallet.getAddress(donationAddress);
    if (!fundedAddresses.includes(donationAddr)) {
      fundedAddresses.push(donationAddr);
      if (!(donationAddr in addressNames) || addressNames[donationAddr] === donationAddr) {
        addressNames[donationAddr] = 'Donate rewards';
      }
    }

    // Add new stake option
    fundedAddresses.push('new');
    addressNames['new'] = 'New Externaly Staked Address';

    setOptions(fundedAddresses);
    setOptionsNames(addressNames);
  }, [wallet, donationAddress]);

  return (
    <div className={`receive-tab ${className}`}>
      <select
        onChange={handleStakingChange}
        className="address-select"
        defaultValue={wallet.getAddress()}
      >
        {options.map((item, index) => (
          <option key={index} value={item}>
            {optionsNames[item]}
          </option>
        ))}
      </select>

      <br />

      {newStake && (
        <input
          type="text"
          onChange={handleNewAddressChange}
          placeholder="Enter stake address"
          className="new-address-input"
        />
      )}

      {wallet.getAddress(donationAddress) === address && (
        <div className="donation-message">
          By using this address your Staking rewards will support the development of this software!
        </div>
      )}

      <div
        className="receive-address"
        onClick={() => handleClick(address)}
        style={{ cursor: isValidAddress ? 'pointer' : 'not-allowed' }}
      >
        <canvas ref={canvasRef} className="qr-canvas" />
        <br />
        <div className="address-text">{address}</div>
        {isValidAddress && (
          <svg className="copy-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default Receive;
