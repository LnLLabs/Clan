import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { NetworkConfig, NETWORKS } from '@broclan/framework-core';

// Provider types (based on original BroClanWallet implementation)
export type ProviderType = 'Blockfrost' | 'Kupmios' | 'MWallet' | 'Maestro';

export interface ProviderConfig {
  url?: string;
  projectId?: string;
  kupoUrl?: string;
  ogmiosUrl?: string;
  apiKey?: string;
}

export interface BlockchainProvider {
  name: string;
  url?: string;
  projectId?: string;
  kupoUrl?: string;
  ogmiosUrl?: string;
  apiKey?: string;
}

// Blockchain state
interface BlockchainState {
  isConnected: boolean;
  network: NetworkConfig;
  providerType: ProviderType;
  providerConfig: ProviderConfig;
  lucidInstance: any | null; // LucidEvolution instance
  blockHeight: number | null;
  slot: number | null;
  epoch: number | null;
  protocolParameters: any | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

// Blockchain actions
type BlockchainAction =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_NETWORK'; payload: NetworkConfig }
  | { type: 'SET_PROVIDER'; payload: { type: ProviderType; config: ProviderConfig } }
  | { type: 'SET_LUCID_INSTANCE'; payload: any }
  | { type: 'SET_BLOCK_DATA'; payload: { blockHeight: number; slot: number; epoch: number } }
  | { type: 'SET_PROTOCOL_PARAMETERS'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_UPDATE'; payload: Date }
  | { type: 'RESET' };

// Initial state
const initialState: BlockchainState = {
  isConnected: false,
  network: NETWORKS.cardano_mainnet,
  providerType: 'Blockfrost',
  providerConfig: {},
  lucidInstance: null,
  blockHeight: null,
  slot: null,
  epoch: null,
  protocolParameters: null,
  isLoading: false,
  error: null,
  lastUpdate: null
};

// Reducer
function blockchainReducer(state: BlockchainState, action: BlockchainAction): BlockchainState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_NETWORK':
      return { ...state, network: action.payload };
    case 'SET_PROVIDER':
      return {
        ...state,
        providerType: action.payload.type,
        providerConfig: action.payload.config
      };
    case 'SET_LUCID_INSTANCE':
      return { ...state, lucidInstance: action.payload };
    case 'SET_BLOCK_DATA':
      return {
        ...state,
        blockHeight: action.payload.blockHeight,
        slot: action.payload.slot,
        epoch: action.payload.epoch,
        lastUpdate: new Date()
      };
    case 'SET_PROTOCOL_PARAMETERS':
      return { ...state, protocolParameters: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LAST_UPDATE':
      return { ...state, lastUpdate: action.payload };
    case 'RESET':
      return { ...initialState, network: state.network };
    default:
      return state;
  }
}

// Context
interface BlockchainContextValue extends BlockchainState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshData: () => Promise<void>;
  switchNetwork: (network: NetworkConfig) => Promise<void>;
  switchProvider: (type: ProviderType, config: ProviderConfig) => Promise<void>;
  getLucidInstance: () => any;
  getBlockData: () => Promise<void>;
  getProtocolParameters: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextValue | null>(null);

// Provider props
interface BlockchainProviderProps {
  children: ReactNode;
  network?: NetworkConfig;
  providerType?: ProviderType;
  providerConfig?: ProviderConfig;
  autoConnect?: boolean;
  refreshInterval?: number;
  onNetworkChange?: (network: NetworkConfig) => void;
  onProviderChange?: (type: ProviderType, config: ProviderConfig) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

// Provider creation functions (based on original newLucidEvolution.ts)
async function createProvider(providerType: ProviderType, config: ProviderConfig, network: NetworkConfig) {
  // This would use the actual LucidEvolution imports
  // For now, we'll create mock implementations
  switch (providerType) {
    case 'Blockfrost':
      return {
        name: 'Blockfrost',
        url: config.url,
        projectId: config.projectId
      };
    case 'Kupmios':
      return {
        name: 'Kupmios',
        kupoUrl: config.kupoUrl,
        ogmiosUrl: config.ogmiosUrl
      };
    case 'MWallet':
      return {
        name: 'MWallet',
        url: config.url,
        projectId: config.projectId
      };
    case 'Maestro':
      return {
        name: 'Maestro',
        apiKey: config.apiKey
      };
    default:
      throw new Error('Invalid provider type');
  }
}

async function createLucidInstance(provider: any, network: NetworkConfig) {
  // This would create the actual LucidEvolution instance
  // For now, return a mock instance
  return {
    provider,
    network,
    switchProvider: async (newProvider: any) => {
      // Implementation for switching providers
    }
  };
}

// Provider component
export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({
  children,
  network = NETWORKS.cardano_mainnet,
  providerType = 'Blockfrost',
  providerConfig = {},
  autoConnect = true,
  refreshInterval = 30000,
  onNetworkChange,
  onProviderChange,
  onConnectionChange,
  onError
}) => {
  const [state, dispatch] = useReducer(blockchainReducer, {
    ...initialState,
    network,
    providerType,
    providerConfig
  });

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect]);

  // Network change effect
  useEffect(() => {
    dispatch({ type: 'SET_NETWORK', payload: network });
    onNetworkChange?.(network);
  }, [network, onNetworkChange]);

  // Refresh data periodically
  useEffect(() => {
    if (!state.isConnected || !refreshInterval) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [state.isConnected, refreshInterval]);

  // Connect to blockchain
  const connect = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Create provider instance
      const provider = await createProvider(state.providerType, state.providerConfig, state.network);

      // Create Lucid instance
      const lucidInstance = await createLucidInstance(provider, state.network);

      dispatch({ type: 'SET_LUCID_INSTANCE', payload: lucidInstance });
      dispatch({ type: 'SET_CONNECTED', payload: true });
      onConnectionChange?.(true);

      // Load initial data
      await refreshData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to blockchain';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Disconnect from blockchain
  const disconnect = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Here you would implement actual blockchain disconnection
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'RESET' });
      onConnectionChange?.(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect from blockchain';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh blockchain data
  const refreshData = async () => {
    if (!state.isConnected) return;

    try {
      await Promise.all([
        getBlockData(),
        getProtocolParameters()
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh blockchain data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    }
  };

  // Switch network
  const switchNetwork = async (newNetwork: NetworkConfig) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Disconnect from current network
      if (state.isConnected) {
        await disconnect();
      }

      // Switch to new network
      dispatch({ type: 'SET_NETWORK', payload: newNetwork });

      // Reconnect if previously connected
      if (autoConnect) {
        await connect();
      }

      onNetworkChange?.(newNetwork);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Get block data
  const getBlockData = async () => {
    try {
      // Here you would implement actual block data fetching
      // For now, we'll simulate some data
      const mockData = {
        blockHeight: 8500000 + Math.floor(Math.random() * 1000),
        slot: 95000000 + Math.floor(Math.random() * 10000),
        epoch: 425 + Math.floor(Math.random() * 5)
      };

      dispatch({ type: 'SET_BLOCK_DATA', payload: mockData });
    } catch (error) {
      throw new Error('Failed to fetch block data');
    }
  };

  // Get protocol parameters
  const getProtocolParameters = async () => {
    try {
      // Here you would implement actual protocol parameters fetching
      // For now, we'll simulate some data
      const mockParams = {
        minFeeA: 44,
        minFeeB: 155381,
        keyDeposit: 2000000,
        poolDeposit: 500000000,
        maxTxSize: 16384,
        maxValSize: 5000,
        priceMem: 0.0577,
        priceStep: 0.0000721,
        utxoCostPerWord: 4310
      };

      dispatch({ type: 'SET_PROTOCOL_PARAMETERS', payload: mockParams });
    } catch (error) {
      throw new Error('Failed to fetch protocol parameters');
    }
  };

  // Switch provider
  const switchProvider = async (type: ProviderType, config: ProviderConfig) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Create new provider
      const newProvider = await createProvider(type, config, state.network);

      // Switch provider on existing Lucid instance
      if (state.lucidInstance) {
        await state.lucidInstance.switchProvider(newProvider);
      } else {
        // If no instance exists, create new one
        const newLucidInstance = await createLucidInstance(newProvider, state.network);
        dispatch({ type: 'SET_LUCID_INSTANCE', payload: newLucidInstance });
      }

      dispatch({ type: 'SET_PROVIDER', payload: { type, config } });
      onProviderChange?.(type, config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch provider';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Get Lucid instance
  const getLucidInstance = () => {
    return state.lucidInstance;
  };

  const contextValue: BlockchainContextValue = {
    ...state,
    connect,
    disconnect,
    refreshData,
    switchNetwork,
    switchProvider,
    getLucidInstance,
    getBlockData,
    getProtocolParameters
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Hook to use blockchain context
export const useBlockchain = (): BlockchainContextValue => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export default BlockchainProvider;
