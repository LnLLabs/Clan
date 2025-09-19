"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSettings = exports.SettingsProvider = exports.createDefaultProviderConfig = exports.getAvailableProviders = exports.validateProviderConfig = exports.PROVIDER_DEFINITIONS = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framework_core_1 = require("@clan/framework-core");
const framework_helpers_1 = require("@clan/framework-helpers");
// Provider definitions with their capabilities and requirements
exports.PROVIDER_DEFINITIONS = {
    Blockfrost: {
        canBeProvider: true,
        canBeMetadataProvider: true,
        requiredFields: ['url', 'projectId'],
        optionalFields: []
    },
    Kupmios: {
        canBeProvider: true,
        canBeMetadataProvider: false,
        requiredFields: ['kupoUrl', 'ogmiosUrl'],
        optionalFields: []
    },
    MWallet: {
        canBeProvider: true,
        canBeMetadataProvider: false,
        requiredFields: ['url', 'projectId'],
        optionalFields: []
    },
    Maestro: {
        canBeProvider: true,
        canBeMetadataProvider: true,
        requiredFields: ['apiKey'],
        optionalFields: []
    },
    None: {
        canBeProvider: false,
        canBeMetadataProvider: true,
        requiredFields: [],
        optionalFields: []
    }
};
// Validation functions
const validateProviderConfig = (providerConfig) => {
    const definition = exports.PROVIDER_DEFINITIONS[providerConfig.type];
    const errors = [];
    // Check required fields
    for (const field of definition.requiredFields) {
        if (!providerConfig.config[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateProviderConfig = validateProviderConfig;
const getAvailableProviders = (forMetadataProvider = false) => {
    return Object.entries(exports.PROVIDER_DEFINITIONS)
        .filter(([_, capabilities]) => forMetadataProvider ? capabilities.canBeMetadataProvider : capabilities.canBeProvider)
        .map(([type, _]) => type);
};
exports.getAvailableProviders = getAvailableProviders;
const createDefaultProviderConfig = (type, network) => {
    switch (type) {
        case 'Blockfrost':
            return {
                type: 'Blockfrost',
                config: {
                    url: network.name === 'mainnet'
                        ? 'https://cardano-mainnet.blockfrost.io/api/v0'
                        : 'https://cardano-testnet.blockfrost.io/api/v0',
                    projectId: ''
                }
            };
        case 'Kupmios':
            return {
                type: 'Kupmios',
                config: {
                    kupoUrl: network.name === 'mainnet'
                        ? 'https://kupo-mainnet.blockfrost.io'
                        : 'https://kupo-testnet.blockfrost.io',
                    ogmiosUrl: network.name === 'mainnet'
                        ? 'wss://ogmios-mainnet.blockfrost.io'
                        : 'wss://ogmios-testnet.blockfrost.io'
                }
            };
        case 'MWallet':
            return {
                type: 'MWallet',
                config: {
                    url: 'https://passthrough.broclan.io',
                    projectId: ''
                }
            };
        case 'Maestro':
            return {
                type: 'Maestro',
                config: {
                    apiKey: ''
                }
            };
        case 'None':
            return {
                type: 'None',
                config: {}
            };
        default:
            throw new Error(`Unknown provider type: ${type}`);
    }
};
exports.createDefaultProviderConfig = createDefaultProviderConfig;
// Default settings
const defaultSettings = {
    theme: 'auto',
    language: 'en',
    currency: 'USD',
    network: framework_core_1.NETWORKS.cardano_mainnet,
    explorer: 'https://cardanoscan.io/',
    enableNotifications: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    customSettings: {},
    sendAll: false,
    disableSync: false,
    provider: (0, exports.createDefaultProviderConfig)('Blockfrost', framework_core_1.NETWORKS.cardano_mainnet),
    metadataProvider: (0, exports.createDefaultProviderConfig)('Blockfrost', framework_core_1.NETWORKS.cardano_mainnet)
};
// Initial state
const initialState = {
    settings: defaultSettings,
    isLoading: false,
    error: null
};
// Reducer
function settingsReducer(state, action) {
    switch (action.type) {
        case 'SET_SETTINGS':
            return { ...state, settings: action.payload };
        case 'UPDATE_SETTING':
            const updatedSettings = { ...state.settings, ...action.payload };
            return { ...state, settings: updatedSettings };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'RESET_TO_DEFAULTS':
            return { ...state, settings: defaultSettings };
        case 'UPDATE_PROVIDER':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    provider: action.payload
                }
            };
        case 'UPDATE_METADATA_PROVIDER':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    metadataProvider: action.payload
                }
            };
        case 'SWITCH_NETWORK':
            const newNetwork = action.payload;
            return {
                ...state,
                settings: {
                    ...state.settings,
                    network: newNetwork,
                    // Update provider configs for the new network
                    provider: (0, exports.createDefaultProviderConfig)(state.settings.provider.type, newNetwork),
                    metadataProvider: (0, exports.createDefaultProviderConfig)(state.settings.metadataProvider.type, newNetwork)
                }
            };
        default:
            return state;
    }
}
const SettingsContext = (0, react_1.createContext)(null);
// Provider component
const SettingsProvider = ({ children, defaultSettings: customDefaults, storageKey = 'broclan_settings', onSettingsChange, onError }) => {
    const [state, dispatch] = (0, react_1.useReducer)(settingsReducer, {
        ...initialState,
        settings: { ...defaultSettings, ...customDefaults }
    });
    // Load settings from storage on mount
    (0, react_1.useEffect)(() => {
        const loadSettings = async () => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });
                const storedSettings = (0, framework_helpers_1.getStorageItem)(storageKey);
                if (storedSettings) {
                    const mergedSettings = { ...defaultSettings, ...customDefaults, ...storedSettings };
                    dispatch({ type: 'SET_SETTINGS', payload: mergedSettings });
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
                dispatch({ type: 'SET_ERROR', payload: errorMessage });
                onError?.(errorMessage);
            }
            finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };
        loadSettings();
    }, [storageKey, customDefaults, onError]);
    // Save settings to storage whenever they change
    (0, react_1.useEffect)(() => {
        const saveSettings = async () => {
            try {
                await (0, framework_helpers_1.setStorageItem)(storageKey, state.settings);
                onSettingsChange?.(state.settings);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
                dispatch({ type: 'SET_ERROR', payload: errorMessage });
                onError?.(errorMessage);
            }
        };
        if (!state.isLoading) {
            saveSettings();
        }
    }, [state.settings, storageKey, onSettingsChange, onError, state.isLoading]);
    // Update settings
    const updateSettings = async (newSettings) => {
        try {
            dispatch({ type: 'UPDATE_SETTING', payload: newSettings });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
    };
    // Reset to defaults
    const resetToDefaults = async () => {
        try {
            const resetSettings = { ...defaultSettings, ...customDefaults };
            dispatch({ type: 'SET_SETTINGS', payload: resetSettings });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reset settings';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
    };
    // Get a specific setting
    const getSetting = (key) => {
        return state.settings[key];
    };
    // Set a specific setting
    const setSetting = async (key, value) => {
        await updateSettings({ [key]: value });
    };
    // Update provider
    const updateProvider = async (provider) => {
        try {
            dispatch({ type: 'UPDATE_PROVIDER', payload: provider });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update provider';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
    };
    // Update metadata provider
    const updateMetadataProvider = async (provider) => {
        try {
            dispatch({ type: 'UPDATE_METADATA_PROVIDER', payload: provider });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update metadata provider';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
    };
    // Switch network
    const switchNetwork = async (network) => {
        try {
            dispatch({ type: 'SWITCH_NETWORK', payload: network });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            onError?.(errorMessage);
        }
    };
    // Validate provider
    const validateProvider = (provider) => {
        return (0, exports.validateProviderConfig)(provider);
    };
    // Get available providers
    const getAvailableProviders = (forMetadataProvider = false) => {
        return getAvailableProviders(forMetadataProvider);
    };
    // Create provider config
    const createProviderConfig = (type) => {
        return (0, exports.createDefaultProviderConfig)(type, state.settings.network);
    };
    const contextValue = {
        ...state,
        updateSettings,
        resetToDefaults,
        getSetting,
        setSetting,
        updateProvider,
        updateMetadataProvider,
        switchNetwork,
        validateProvider,
        getAvailableProviders,
        createProviderConfig
    };
    return ((0, jsx_runtime_1.jsx)(SettingsContext.Provider, { value: contextValue, children: children }));
};
exports.SettingsProvider = SettingsProvider;
// Hook to use settings context
const useSettings = () => {
    const context = (0, react_1.useContext)(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
exports.useSettings = useSettings;
exports.default = exports.SettingsProvider;
//# sourceMappingURL=SettingsProvider.js.map