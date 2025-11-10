import React, { createContext, useContext, ReactNode } from 'react';
import { MetadataProvider, NoOpMetadataProvider } from '@clan/framework-core';

/**
 * Context for injecting a MetadataProvider implementation
 * Consuming apps provide their custom implementation via this context
 */
const MetadataProviderContext = createContext<MetadataProvider>(new NoOpMetadataProvider());

export interface MetadataProviderWrapperProps {
  children: ReactNode;
  provider: MetadataProvider;
}

/**
 * MetadataProviderWrapper - Injects a custom metadata provider into the app
 * 
 * Usage:
 * ```tsx
 * <MetadataProviderWrapper provider={myCustomProvider}>
 *   <App />
 * </MetadataProviderWrapper>
 * ```
 */
export const MetadataProviderWrapper: React.FC<MetadataProviderWrapperProps> = ({
  children,
  provider
}) => {
  return (
    <MetadataProviderContext.Provider value={provider}>
      {children}
    </MetadataProviderContext.Provider>
  );
};

/**
 * Hook to access the current MetadataProvider
 * Components and helpers use this to fetch metadata
 */
export const useMetadataProvider = (): MetadataProvider => {
  return useContext(MetadataProviderContext);
};

export default MetadataProviderContext;

