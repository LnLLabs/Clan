import React, { ReactNode } from 'react';
import { WalletInterface, WalletConfig, Assets, TransactionHistoryEntry, NetworkConfig } from '@clan/framework-core';
interface WalletState {
    wallets: WalletInterface[];
    selectedWallet: WalletInterface | null;
    isConnecting: boolean;
    isConnected: boolean;
    address: string | null;
    balance: Assets | null;
    network: NetworkConfig | null;
    transactions: TransactionHistoryEntry[];
    error: string | null;
    isLoading: boolean;
}
interface WalletContextValue extends WalletState {
    connectWallet: (wallet: WalletInterface) => Promise<void>;
    disconnectWallet: () => Promise<void>;
    refreshBalance: () => Promise<void>;
    refreshTransactions: () => Promise<void>;
    clearError: () => void;
}
interface WalletProviderProps {
    children: ReactNode;
    wallets?: WalletInterface[];
    config?: WalletConfig;
    onWalletConnected?: (wallet: WalletInterface) => void;
    onWalletDisconnected?: () => void;
    onError?: (error: string) => void;
}
export declare const WalletProvider: React.FC<WalletProviderProps>;
export declare const useWallet: () => WalletContextValue;
export default WalletProvider;
//# sourceMappingURL=WalletProvider.d.ts.map