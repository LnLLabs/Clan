import React from 'react';
import { WalletInterface } from '@broclan/framework-core';

export interface AddressSelectProps {
  wallet: WalletInterface;
  selectedAddress: string;
  onAddressChange: (address: string) => void;
  showAll?: boolean;
  setName?: boolean;
  onSetDefaultAddress?: (address: string) => void;
  onChangeAddressName?: (address: string, name: string) => void;
  className?: string;
}

export const AddressSelect: React.FC<AddressSelectProps> = ({
  wallet,
  selectedAddress,
  onAddressChange,
  showAll = true,
  setName = false,
  onSetDefaultAddress,
  onChangeAddressName,
  className = ''
}) => {
  const fundedAddresses = wallet.getFundedAddress();
  const defaultAddress = wallet.getDefaultAddress();
  const addressNames = wallet.getAddressNames();

  const getAddressDisplayName = (address: string): string => {
    const name = addressNames[address];
    if (name) return name;

    // If no name, show truncated address
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className={`address-select-container ${className}`}>
      <div>
        <select
          className="addressSelect"
          value={selectedAddress}
          onChange={(event) => onAddressChange(event.target.value)}
        >
          {showAll && <option value="">All</option>}
          {fundedAddresses.map((address: string, index: number) => (
            <option key={index} value={address}>
              {getAddressDisplayName(address)}
            </option>
          ))}
        </select>

        {selectedAddress && selectedAddress !== defaultAddress && onSetDefaultAddress && (
          <button
            className="defaultButton"
            onClick={() => onSetDefaultAddress(selectedAddress)}
          >
            Make Default
          </button>
        )}
      </div>

      {setName && selectedAddress && selectedAddress !== '' && selectedAddress !== wallet.getAddress() && (
        <input
          type="text"
          placeholder="Name"
          onChange={(event) => onChangeAddressName?.(selectedAddress, event.target.value)}
          className="address-name-input"
        />
      )}
    </div>
  );
};

export default AddressSelect;
