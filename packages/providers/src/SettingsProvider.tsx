import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { NetworkConfig, NETWORKS } from '@broclan/framework-core';
import { setStorageItem, getStorageItem } from '@broclan/framework-helpers';

// Settings interface
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  network: NetworkConfig;
  explorer: string;
  apiUrl: string;
  enableNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  customSettings: Record<string, any>;
}

// Settings state
interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

// Settings actions
type SettingsAction =
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTING'; payload: Partial<AppSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_TO_DEFAULTS' };

// Default settings
const defaultSettings: AppSettings = {
  theme: 'auto',
  language: 'en',
  currency: 'USD',
  network: NETWORKS.cardano_mainnet,
  explorer: 'https://cardanoscan.io/',
  apiUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
  enableNotifications: true,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  customSettings: {}
};

// Initial state
const initialState: SettingsState = {
  settings: defaultSettings,
  isLoading: false,
  error: null
};

// Reducer
function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
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
    default:
      return state;
  }
}

// Context
interface SettingsContextValue extends SettingsState {
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  getSetting: <T>(key: keyof AppSettings) => T;
  setSetting: <T>(key: keyof AppSettings, value: T) => Promise<void>;
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

// Provider component
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  defaultSettings: customDefaults,
  storageKey = 'broclan_settings',
  onSettingsChange,
  onError
}) => {
  const [state, dispatch] = useReducer(settingsReducer, {
    ...initialState,
    settings: { ...defaultSettings, ...customDefaults }
  });

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const storedSettings = getStorageItem<AppSettings>(storageKey);

        if (storedSettings) {
          const mergedSettings = { ...defaultSettings, ...customDefaults, ...storedSettings };
          dispatch({ type: 'SET_SETTINGS', payload: mergedSettings });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        onError?.(errorMessage);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadSettings();
  }, [storageKey, customDefaults, onError]);

  // Save settings to storage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await setStorageItem(storageKey, state.settings);
        onSettingsChange?.(state.settings);
      } catch (error) {
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
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      dispatch({ type: 'UPDATE_SETTING', payload: newSettings });
    } catch (error) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset settings';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    }
  };

  // Get a specific setting
  const getSetting = <T,>(key: keyof AppSettings): T => {
    return state.settings[key] as T;
  };

  // Set a specific setting
  const setSetting = async <T,>(key: keyof AppSettings, value: T) => {
    await updateSettings({ [key]: value } as Partial<AppSettings>);
  };

  const contextValue: SettingsContextValue = {
    ...state,
    updateSettings,
    resetToDefaults,
    getSetting,
    setSetting
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook to use settings context
export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsProvider;
