"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBlockchain = exports.BlockchainProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framework_core_1 = require("@clan/framework-core");
// Initial state
const initialState = {
    isConnected: false,
    network: framework_core_1.NETWORKS.cardano_mainnet,
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
function blockchainReducer(state, action) {
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
const BlockchainContext = (0, react_1.createContext)(null);
// Provider creation functions (based on original newLucidEvolution.ts)
async function createProvider(providerType, config, network) {
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
async function createLucidInstance(provider, network) {
    // This would create the actual LucidEvolution instance
    // For now, return a mock instance
    return {
        provider,
        network,
        switchProvider: async (newProvider) => {
            // Implementation for switching providers
        }
    };
}
// Provider component
const BlockchainProvider = ({ children, network = framework_core_1.NETWORKS.cardano_mainnet, providerType = 'Blockfrost', providerConfig = {}, autoConnect = true, refreshInterval = 30000, onNetworkChange, onProviderChange, onConnectionChange, onError }) => {
    const [state, dispatch] = (0, react_1.useReducer)(blockchainReducer, {
        ...initialState,
        network,
        providerType,
        providerConfig
    });
    // Auto-connect on mount
    (0, react_1.useEffect)(() => {
        if (autoConnect) {
            connect();
        }
    }, [autoConnect]);
    // Network change effect
    (0, react_1.useEffect)(() => {
        dispatch({ type: 'SET_NETWORK', payload: network });
        onNetworkChange?.(network);
    }, [network, onNetworkChange]);
    // Refresh data periodically
    (0, react_1.useEffect)(() => {
        if (!state.isConnected || !refreshInterval)
            return;
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to connect to blockchain';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
        finally {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect from blockchain';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
        finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    // Refresh blockchain data
    const refreshData = async () => {
        if (!state.isConnected)
            return;
        try {
            await Promise.all([
                getBlockData(),
                getProtocolParameters()
            ]);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to refresh blockchain data';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
    };
    // Switch network
    const switchNetwork = async (newNetwork) => {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
        finally {
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
        }
        catch (error) {
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
        }
        catch (error) {
            throw new Error('Failed to fetch protocol parameters');
        }
    };
    // Switch provider
    const switchProvider = async (type, config) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            // Create new provider
            const newProvider = await createProvider(type, config, state.network);
            // Switch provider on existing Lucid instance
            if (state.lucidInstance) {
                await state.lucidInstance.switchProvider(newProvider);
            }
            else {
                // If no instance exists, create new one
                const newLucidInstance = await createLucidInstance(newProvider, state.network);
                dispatch({ type: 'SET_LUCID_INSTANCE', payload: newLucidInstance });
            }
            dispatch({ type: 'SET_PROVIDER', payload: { type, config } });
            onProviderChange?.(type, config);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to switch provider';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
        finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    // Get Lucid instance
    const getLucidInstance = () => {
        return state.lucidInstance;
    };
    const contextValue = {
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
    return ((0, jsx_runtime_1.jsx)(BlockchainContext.Provider, { value: contextValue, children: children }));
};
exports.BlockchainProvider = BlockchainProvider;
// Hook to use blockchain context
const useBlockchain = () => {
    const context = (0, react_1.useContext)(BlockchainContext);
    if (!context) {
        throw new Error('useBlockchain must be used within a BlockchainProvider');
    }
    return context;
};
exports.useBlockchain = useBlockchain;
exports.default = exports.BlockchainProvider;
//# sourceMappingURL=BlockchainProvider.js.map