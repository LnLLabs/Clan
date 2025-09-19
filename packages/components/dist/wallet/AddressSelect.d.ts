import React from 'react';
import { WalletInterface } from '@clan/framework-core';
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
export declare const AddressSelect: React.FC<AddressSelectProps>;
export default AddressSelect;
//# sourceMappingURL=AddressSelect.d.ts.map