import React, { createContext, useContext, ReactNode, useMemo } from 'react';

/**
 * Koios API configuration
 */
export interface KoiosConfig {
  /** Base URL for Koios API (auto-detected from network if not provided) */
  url?: string;
  /** API key for authenticated requests (optional, increases rate limits) */
  apiKey?: string;
  /** Network name (mainnet, preprod, preview) - auto-detected from wallet if not provided */
  network?: string;
}

/**
 * Complete delegation provider configuration
 */
export interface DelegationProviderConfig {
  koios: KoiosConfig;
}

/**
 * Base Koios passthrough URL
 */
export const KOIOS_PASSTHROUGH_BASE_URL = 'https://koios.keypact.io/';

/**
 * Get Koios base URL for a specific network
 * Returns base URL without query parameters (network is added in koiosFetch)
 */
export function getKoiosUrl(network: string): string {
  return KOIOS_PASSTHROUGH_BASE_URL;
}

/**
 * Context value provided by DelegationProvider
 */
export interface DelegationContextValue {
  /** Get the Koios API URL for a given network */
  getKoiosUrl: (network?: string) => string;
  /** Get the API key if configured */
  getApiKey: () => string | undefined;
  /** Make an authenticated request to Koios */
  koiosFetch: (endpoint: string, network?: string, options?: RequestInit) => Promise<Response>;
  /** Raw configuration */
  config: DelegationProviderConfig;
}

/**
 * Default configuration
 */
const defaultConfig: DelegationProviderConfig = {
  koios: {},
};

/**
 * Default context value (no-op implementation)
 */
const defaultContextValue: DelegationContextValue = {
  getKoiosUrl: (network?: string) => getKoiosUrl(network || 'mainnet'),
  getApiKey: () => undefined,
  koiosFetch: async (endpoint: string, network?: string) => {
    const baseUrl = getKoiosUrl(network || 'mainnet');
    const normalizedNetwork = (network || 'mainnet').toLowerCase().replace(/cardano[-_\s]*/gi, '').trim();
    const networkParam = normalizedNetwork || 'mainnet';
    const fullUrl = `${baseUrl}${endpoint}?network=${networkParam}`;
    return fetch(fullUrl, {
      headers: { 'accept': 'application/json' },
    });
  },
  config: defaultConfig,
};

/**
 * Context for delegation provider configuration
 */
const DelegationProviderContext = createContext<DelegationContextValue>(defaultContextValue);

export interface DelegationProviderWrapperProps {
  children: ReactNode;
  /** Koios configuration */
  config?: DelegationProviderConfig;
}

/**
 * DelegationProviderWrapper - Injects Koios configuration into the app
 * 
 * Usage:
 * ```tsx
 * <DelegationProviderWrapper config={{
 *   koios: { apiKey: 'your-api-key' }
 * }}>
 *   <App />
 * </DelegationProviderWrapper>
 * ```
 */
export const DelegationProviderWrapper: React.FC<DelegationProviderWrapperProps> = ({
  children,
  config = defaultConfig,
}) => {
  const contextValue = useMemo<DelegationContextValue>(() => {
    const mergedConfig: DelegationProviderConfig = {
      koios: { ...defaultConfig.koios, ...config.koios },
    };

    const getKoiosUrlForNetwork = (network?: string): string => {
      if (mergedConfig.koios.url) {
        return mergedConfig.koios.url;
      }
      const networkName = network || mergedConfig.koios.network || 'mainnet';
      return getKoiosUrl(networkName);
    };

    const getApiKey = (): string | undefined => {
      return mergedConfig.koios.apiKey;
    };

    const koiosFetch = async (
      endpoint: string,
      network?: string,
      options?: RequestInit
    ): Promise<Response> => {
      const baseUrl = getKoiosUrlForNetwork(network);
      const apiKey = getApiKey();
      const networkName = network || mergedConfig.koios.network || 'mainnet';
      const normalizedNetwork = networkName.toLowerCase().replace(/cardano[-_\s]*/gi, '').trim();
      const networkParam = normalizedNetwork || 'mainnet';
      
      // Construct URL: baseUrl + endpoint + query parameter
      const fullUrl = `${baseUrl}${endpoint}?network=${networkParam}`;
      
      const headers: HeadersInit = {
        'accept': 'application/json',
        ...(options?.headers || {}),
      };

      if (apiKey) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${apiKey}`;
      }

      return fetch(fullUrl, {
        ...options,
        headers,
      });
    };

    return {
      getKoiosUrl: getKoiosUrlForNetwork,
      getApiKey,
      koiosFetch,
      config: mergedConfig,
    };
  }, [config]);

  return (
    <DelegationProviderContext.Provider value={contextValue}>
      {children}
    </DelegationProviderContext.Provider>
  );
};

/**
 * Hook to access the delegation provider configuration
 * Components and helpers use this to make Koios API calls
 */
export const useDelegationProvider = (): DelegationContextValue => {
  return useContext(DelegationProviderContext);
};

export default DelegationProviderContext;

