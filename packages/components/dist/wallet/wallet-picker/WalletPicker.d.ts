import React from 'react';
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
export declare const WalletPicker: React.FC<WalletPickerProps>;
export default WalletPicker;
//# sourceMappingURL=WalletPicker.d.ts.map