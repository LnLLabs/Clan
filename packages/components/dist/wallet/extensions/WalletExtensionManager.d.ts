import React from 'react';
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
export declare const WalletExtensionManager: React.FC<WalletExtensionManagerProps>;
export declare const isWalletExtensionAvailable: (walletId: string) => boolean;
export declare const getInstalledWallets: () => string[];
export declare const requestWalletAccess: (walletId: string) => Promise<any>;
export default WalletExtensionManager;
//# sourceMappingURL=WalletExtensionManager.d.ts.map