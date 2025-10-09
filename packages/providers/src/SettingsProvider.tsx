import React, { createContext, useContext, Component, ReactNode } from 'react';
import { NetworkConfig, NETWORKS } from '@clan/framework-core';
import { setStorageItem, getStorageItem } from '@clan/framework-helpers';

// Provider types
export type ProviderType = 'Blockfrost' | 'Kupmios' | 'MWallet' | 'Maestro' | 'None';

// Provider configuration interfaces
export interface BlockfrostConfig {
  url: string;
  projectId: string;
}

export interface KupmiosConfig {
  kupoUrl: string;
  ogmiosUrl: string;
}

export interface MWalletConfig {
  url: string;
  projectId: string;
}

export interface MaestroConfig {
  apiKey: string;
}

export interface NoneConfig {
  // No configuration needed
}

// Union type for all provider configurations
export type ProviderConfig = 
  | { type: 'Blockfrost'; config: BlockfrostConfig }
  | { type: 'Kupmios'; config: KupmiosConfig }
  | { type: 'MWallet'; config: MWalletConfig }
  | { type: 'Maestro'; config: MaestroConfig }
  | { type: 'None'; config: NoneConfig };

// Provider capabilities
export interface ProviderCapabilities {
  canBeProvider: boolean;
  canBeMetadataProvider: boolean;
  requiredFields: string[];
  optionalFields?: string[];
}

// Provider definitions with their capabilities and requirements
export const PROVIDER_DEFINITIONS: Record<ProviderType, ProviderCapabilities> = {
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

// Settings interface
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  network: NetworkConfig;
  explorer: string;
  enableNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  customSettings: Record<string, any>;
  sendAll: boolean;
  disableSync: boolean;
  // Enhanced provider settings
  provider: ProviderConfig;
  metadataProvider: ProviderConfig;
}

// Validation functions
export const validateProviderConfig = (providerConfig: ProviderConfig): { isValid: boolean; errors: string[] } => {
  const definition = PROVIDER_DEFINITIONS[providerConfig.type];
  const errors: string[] = [];

  // Check required fields
  for (const field of definition.requiredFields) {
    if (!providerConfig.config[field as keyof typeof providerConfig.config]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getAvailableProviders = (forMetadataProvider: boolean = false): ProviderType[] => {
  return Object.entries(PROVIDER_DEFINITIONS)
    .filter(([_, capabilities]) => forMetadataProvider ? capabilities.canBeMetadataProvider : capabilities.canBeProvider)
    .map(([type, _]) => type as ProviderType);
};

export const createDefaultProviderConfig = (type: ProviderType, network: NetworkConfig): ProviderConfig => {
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

// Settings state
interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

// Settings actions (keeping for reference but not used with useState)
type SettingsAction =
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTING'; payload: Partial<AppSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_TO_DEFAULTS' }
  | { type: 'UPDATE_PROVIDER'; payload: ProviderConfig }
  | { type: 'UPDATE_METADATA_PROVIDER'; payload: ProviderConfig }
  | { type: 'SWITCH_NETWORK'; payload: NetworkConfig };

// Default settings
const defaultSettings: AppSettings = {
  theme: 'auto',
  language: 'en',
  currency: 'USD',
  network: NETWORKS.cardano_mainnet,
  explorer: 'https://cardanoscan.io/',
  enableNotifications: true,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  customSettings: {},
  sendAll: false,
  disableSync: false,
  provider: createDefaultProviderConfig('Blockfrost', NETWORKS.cardano_mainnet),
  metadataProvider: createDefaultProviderConfig('Blockfrost', NETWORKS.cardano_mainnet)
};

// Initial state
const initialState: SettingsState = {
  settings: defaultSettings,
  isLoading: false,
  error: null
};

// State helper functions
const updateSettingsState = (currentSettings: AppSettings, updates: Partial<AppSettings>): AppSettings => {
  return { ...currentSettings, ...updates };
};

const updateProviderInSettings = (currentSettings: AppSettings, provider: ProviderConfig): AppSettings => {
  return {
    ...currentSettings,
    provider
  };
};

const updateMetadataProviderInSettings = (currentSettings: AppSettings, metadataProvider: ProviderConfig): AppSettings => {
  return {
    ...currentSettings,
    metadataProvider
  };
};

const switchNetworkInSettings = (currentSettings: AppSettings, network: NetworkConfig): AppSettings => {
  return {
    ...currentSettings,
    network,
    // Update provider configs for the new network
    provider: createDefaultProviderConfig(currentSettings.provider.type, network),
    metadataProvider: createDefaultProviderConfig(currentSettings.metadataProvider.type, network)
  };
};

// Context
interface SettingsContextValue extends SettingsState {
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  getSetting: <T>(key: keyof AppSettings) => T;
  setSetting: <T>(key: keyof AppSettings, value: T) => Promise<void>;
  // Provider management methods
  updateProvider: (provider: ProviderConfig) => Promise<void>;
  updateMetadataProvider: (provider: ProviderConfig) => Promise<void>;
  switchNetwork: (network: NetworkConfig) => Promise<void>;
  validateProvider: (provider: ProviderConfig) => { isValid: boolean; errors: string[] };
  getAvailableProviders: (forMetadataProvider?: boolean) => ProviderType[];
  createProviderConfig: (type: ProviderType) => ProviderConfig;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

// Provider props
interface SettingsProviderProps {
  children: ReactNode;
  defaultSettings?: Partial<AppSettings>;
  storageKey?: string;
  onSettingsChange?: (settings: AppSettings) => void;
  onError?: (error: string) => void;
}

  // Start of Selection
// Provider component
export class SettingsProvider extends Component<SettingsProviderProps, SettingsState> {
  constructor(props: SettingsProviderProps) {
    super(props);
    
    this.state = {
      settings: {
        ...defaultSettings,
        ...props.defaultSettings
      },
      isLoading: false,
      error: null
    };
  }

  async componentDidMount() {
    await this.loadSettings();
  }

  async componentDidUpdate(prevProps: SettingsProviderProps, prevState: SettingsState) {
    // Save settings when they change
    if (prevState.settings !== this.state.settings && !this.state.isLoading) {
      await this.saveSettings();
    }
  }

  private async loadSettings() {
    try {
      this.setState({ isLoading: true });
      const { storageKey = 'broclan_settings', defaultSettings: customDefaults, onError } = this.props;
      const storedSettings = getStorageItem<AppSettings>(storageKey);

      if (storedSettings) {
        const mergedSettings = { ...defaultSettings, ...customDefaults, ...storedSettings };
        this.setState({ settings: mergedSettings });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
      this.setState({ error: errorMessage });
      this.props.onError?.(errorMessage);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  private async saveSettings() {
    try {
      const { storageKey = 'broclan_settings', onSettingsChange } = this.props;
      await setStorageItem(storageKey, this.state.settings);
      onSettingsChange?.(this.state.settings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      this.setState({ error: errorMessage });
      this.props.onError?.(errorMessage);
    }
  }

  // Update settings
  private updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      this.setState(prevState => ({
        settings: updateSettingsState(prevState.settings, newSettings)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      this.setState({ error: errorMessage });
      this.props.onError?.(errorMessage);
    }
  };

  // Reset to defaults
  private resetToDefaults = async () => {
    try {
      const resetSettings = { ...defaultSettings, ...this.props.defaultSettings };
      this.setState({ settings: resetSettings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset settings';
      this.setState({ error: errorMessage });
      this.props.onError?.(errorMessage);
    }
  };

  // Get a specific setting
  private getSetting = <T,>(key: keyof AppSettings): T => {
    return this.state.settings[key] as T;
  };

  // Set a specific setting
  private setSetting = async <T,>(key: keyof AppSettings, value: T) => {
    await this.updateSettings({ [key]: value } as Partial<AppSettings>);
  };

  // Update provider
  private updateProvider = async (provider: ProviderConfig) => {
    try {
      this.setState(prevState => ({
        settings: updateProviderInSettings(prevState.settings, provider)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update provider';
      this.setState({ error: errorMessage });
      this.props.onError?.(errorMessage);
    }
  };

  // Update metadata provider
  private updateMetadataProvider = async (provider: ProviderConfig) => {
    try {
      this.setState(prevState => ({
        settings: updateMetadataProviderInSettings(prevState.settings, provider)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update metadata provider';
      this.setState({ error: errorMessage });
      this.props.onError?.(errorMessage);
    }
  };

  // Switch network
  private switchNetwork = async (network: NetworkConfig) => {
    try {
      this.setState(prevState => ({
        settings: switchNetworkInSettings(prevState.settings, network)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
      this.setState({ error: errorMessage });
      this.props.onError?.(errorMessage);
    }
  };

  // Validate provider
  private validateProvider = (provider: ProviderConfig) => {
    return validateProviderConfig(provider);
  };

  // Get available providers
  private getAvailableProvidersList = (forMetadataProvider: boolean = false) => {
    return getAvailableProviders(forMetadataProvider);
  };

  // Create provider config
  private createProviderConfig = (type: ProviderType) => {
    return createDefaultProviderConfig(type, this.state.settings.network);
  };

  render() {
    const contextValue: SettingsContextValue = {
      settings: this.state.settings,
      isLoading: this.state.isLoading,
      error: this.state.error,
      updateSettings: this.updateSettings,
      resetToDefaults: this.resetToDefaults,
      getSetting: this.getSetting,
      setSetting: this.setSetting,
      updateProvider: this.updateProvider,
      updateMetadataProvider: this.updateMetadataProvider,
      switchNetwork: this.switchNetwork,
      validateProvider: this.validateProvider,
      getAvailableProviders: this.getAvailableProvidersList,
      createProviderConfig: this.createProviderConfig
    };

    return (
      <SettingsContext.Provider value={contextValue}>
        {this.props.children}
      </SettingsContext.Provider>
    );
  }
}

// Hook to use settings context
export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsProvider;

