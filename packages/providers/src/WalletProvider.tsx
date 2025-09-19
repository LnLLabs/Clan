import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  WalletInterface,
  WalletConfig,
  Assets,
  Transaction,
  TransactionHistoryEntry,
  WalletEvent,
  WalletEventType,
  NetworkConfig
} from '@clan/framework-core';
import { setStorageItem, getStorageItem } from '@clan/framework-helpers';

// Wallet state
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

// Wallet actions
type WalletAction =
  | { type: 'SET_WALLETS'; payload: WalletInterface[] }
  | { type: 'SELECT_WALLET'; payload: WalletInterface | null }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ADDRESS'; payload: string | null }
  | { type: 'SET_BALANCE'; payload: Assets | null }
  | { type: 'SET_NETWORK'; payload: NetworkConfig | null }
  | { type: 'SET_TRANSACTIONS'; payload: TransactionHistoryEntry[] }
  | { type: 'ADD_TRANSACTION'; payload: TransactionHistoryEntry }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

// Initial state
const initialState: WalletState = {
  wallets: [],
  selectedWallet: null,
  isConnecting: false,
  isConnected: false,
  address: null,
  balance: null,
  network: null,
  transactions: [],
  error: null,
  isLoading: false
};

// Reducer
function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_WALLETS':
      return { ...state, wallets: action.payload };
    case 'SELECT_WALLET':
      return { ...state, selectedWallet: action.payload };
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_ADDRESS':
      return { ...state, address: action.payload };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    case 'SET_NETWORK':
      return { ...state, network: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context
interface WalletContextValue extends WalletState {
  connectWallet: (wallet: WalletInterface) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// Provider props
interface WalletProviderProps {
  children: ReactNode;
  wallets?: WalletInterface[];
  config?: WalletConfig;
  onWalletConnected?: (wallet: WalletInterface) => void;
  onWalletDisconnected?: () => void;
  onError?: (error: string) => void;
}

// Provider component
export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  wallets = [],
  config,
  onWalletConnected,
  onWalletDisconnected,
  onError
}) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Initialize wallets
  useEffect(() => {
    dispatch({ type: 'SET_WALLETS', payload: wallets });
  }, [wallets]);

  // Connect to wallet
  const connectWallet = async (wallet: WalletInterface) => {
    try {
      dispatch({ type: 'SET_CONNECTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await wallet.connect();
      const address = wallet.getAddress();
      const network = wallet.getNetwork();

      dispatch({ type: 'SELECT_WALLET', payload: wallet });
      dispatch({ type: 'SET_CONNECTED', payload: true });
      dispatch({ type: 'SET_ADDRESS', payload: address });
      dispatch({ type: 'SET_NETWORK', payload: network });

      // Persist selected wallet
      setStorageItem('selectedWallet', wallet.getName());

      // Load initial data
      await refreshBalance();
      await refreshTransactions();

      onWalletConnected?.(wallet);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    } finally {
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      if (state.selectedWallet) {
        await state.selectedWallet.disconnect();
      }

      dispatch({ type: 'RESET' });
      setStorageItem('selectedWallet', null);

      onWalletDisconnected?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect wallet';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (!state.selectedWallet) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const balance = await state.selectedWallet.getBalance();
      dispatch({ type: 'SET_BALANCE', payload: balance });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh balance';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh transactions
  const refreshTransactions = async () => {
    if (!state.selectedWallet) return;

    try {
      // This would need to be implemented based on the wallet interface
      // For now, we'll leave it as a placeholder
      dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh transactions';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: WalletContextValue = {
    ...state,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    refreshTransactions,
    clearError
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use wallet context
export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default WalletProvider;

