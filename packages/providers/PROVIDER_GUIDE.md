# Enhanced Provider Configuration Guide

This guide explains how to use the enhanced SettingsProvider with flexible provider configurations for different blockchain and metadata providers.

## Overview

The enhanced SettingsProvider now supports multiple provider types with their specific configuration requirements:

- **Blockfrost**: Requires `url` and `projectId`
- **Kupmios**: Requires `kupoUrl` and `ogmiosUrl`
- **MWallet**: Requires `url` and `projectId`
- **Maestro**: Requires `apiKey`
- **None**: No configuration needed (metadata provider only)

## Provider Capabilities

Each provider has specific capabilities:

| Provider | Can be Provider | Can be Metadata Provider | Required Fields |
|----------|----------------|-------------------------|-----------------|
| Blockfrost | ✅ | ✅ | `url`, `projectId` |
| Kupmios | ✅ | ❌ | `kupoUrl`, `ogmiosUrl` |
| MWallet | ✅ | ❌ | `url`, `projectId` |
| Maestro | ✅ | ✅ | `apiKey` |
| None | ❌ | ✅ | None |

## Basic Usage

### 1. Setting up the Provider

```tsx
import { SettingsProvider } from '@clan/framework-providers';

function App() {
  return (
    <SettingsProvider>
      <YourApp />
    </SettingsProvider>
  );
}
```

### 2. Using the Hook

```tsx
import { useSettings } from '@clan/framework-providers';

function YourComponent() {
  const {
    settings,
    updateProvider,
    updateMetadataProvider,
    validateProvider,
    getAvailableProviders,
    switchNetwork
  } = useSettings();

  // Access current provider configurations
  const currentProvider = settings.provider;
  const currentMetadataProvider = settings.metadataProvider;

  return (
    <div>
      <p>Current Provider: {currentProvider.type}</p>
      <p>Current Metadata Provider: {currentMetadataProvider.type}</p>
    </div>
  );
}
```

## Provider Configuration Examples

### Blockfrost Configuration

```tsx
const blockfrostConfig = {
  type: 'Blockfrost' as const,
  config: {
    url: 'https://cardano-mainnet.blockfrost.io/api/v0',
    projectId: 'your-project-id-here'
  }
};

await updateProvider(blockfrostConfig);
```

### Kupmios Configuration

```tsx
const kupmiosConfig = {
  type: 'Kupmios' as const,
  config: {
    kupoUrl: 'https://kupo-mainnet.blockfrost.io',
    ogmiosUrl: 'wss://ogmios-mainnet.blockfrost.io'
  }
};

await updateProvider(kupmiosConfig);
```

### Maestro Configuration

```tsx
const maestroConfig = {
  type: 'Maestro' as const,
  config: {
    apiKey: 'your-maestro-api-key-here'
  }
};

await updateProvider(maestroConfig);
```

### MWallet Configuration

```tsx
const mwalletConfig = {
  type: 'MWallet' as const,
  config: {
    url: 'https://passthrough.broclan.io',
    projectId: 'your-project-id-here'
  }
};

await updateProvider(mwalletConfig);
```

## Validation

### Validate Provider Configuration

```tsx
const validation = validateProvider(providerConfig);
if (validation.isValid) {
  console.log('Configuration is valid');
} else {
  console.error('Configuration errors:', validation.errors);
}
```

### Get Available Providers

```tsx
// Get providers that can be used as blockchain providers
const blockchainProviders = getAvailableProviders(false);
// Returns: ['Blockfrost', 'Kupmios', 'MWallet', 'Maestro']

// Get providers that can be used as metadata providers
const metadataProviders = getAvailableProviders(true);
// Returns: ['Blockfrost', 'Maestro', 'None']
```

## Network Switching

When switching networks, provider configurations are automatically updated with appropriate default URLs:

```tsx
// Switch to mainnet
await switchNetwork(NETWORKS.cardano_mainnet);

// Switch to testnet
await switchNetwork(NETWORKS.cardano_testnet);
```

## Advanced Usage

### Creating Default Configurations

```tsx
import { createDefaultProviderConfig } from '@clan/framework-providers';

// Create default configuration for current network
const defaultBlockfrost = createDefaultProviderConfig('Blockfrost', currentNetwork);
const defaultKupmios = createDefaultProviderConfig('Kupmios', currentNetwork);
```

### Provider Capabilities Checking

```tsx
import { PROVIDER_DEFINITIONS } from '@clan/framework-providers';

// Check if a provider can be used as a blockchain provider
const canBeProvider = PROVIDER_DEFINITIONS['Blockfrost'].canBeProvider; // true

// Check if a provider can be used as a metadata provider
const canBeMetadataProvider = PROVIDER_DEFINITIONS['Kupmios'].canBeMetadataProvider; // false

// Get required fields for a provider
const requiredFields = PROVIDER_DEFINITIONS['Blockfrost'].requiredFields; // ['url', 'projectId']
```

## Complete Example

```tsx
import React, { useState } from 'react';
import { useSettings, ProviderConfig } from '@clan/framework-providers';

function ProviderSettings() {
  const {
    settings,
    updateProvider,
    updateMetadataProvider,
    validateProvider,
    getAvailableProviders,
    switchNetwork
  } = useSettings();

  const [selectedProvider, setSelectedProvider] = useState(settings.provider.type);
  const [providerConfig, setProviderConfig] = useState(settings.provider.config);

  const handleProviderChange = async (type: string) => {
    setSelectedProvider(type);
    
    // Create new configuration based on provider type
    let newConfig: ProviderConfig;
    
    switch (type) {
      case 'Blockfrost':
        newConfig = {
          type: 'Blockfrost',
          config: {
            url: 'https://cardano-mainnet.blockfrost.io/api/v0',
            projectId: ''
          }
        };
        break;
      case 'Kupmios':
        newConfig = {
          type: 'Kupmios',
          config: {
            kupoUrl: 'https://kupo-mainnet.blockfrost.io',
            ogmiosUrl: 'wss://ogmios-mainnet.blockfrost.io'
          }
        };
        break;
      case 'Maestro':
        newConfig = {
          type: 'Maestro',
          config: {
            apiKey: ''
          }
        };
        break;
      default:
        return;
    }

    // Validate and update
    const validation = validateProvider(newConfig);
    if (validation.isValid) {
      await updateProvider(newConfig);
      setProviderConfig(newConfig.config);
    } else {
      alert(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
  };

  const handleConfigUpdate = (field: string, value: string) => {
    setProviderConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveConfiguration = async () => {
    const config: ProviderConfig = {
      type: selectedProvider as any,
      config: providerConfig as any
    };

    const validation = validateProvider(config);
    if (validation.isValid) {
      await updateProvider(config);
      alert('Configuration saved successfully!');
    } else {
      alert(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
  };

  return (
    <div>
      <h3>Provider Settings</h3>
      
      <div>
        <label>Provider Type:</label>
        <select 
          value={selectedProvider} 
          onChange={(e) => handleProviderChange(e.target.value)}
        >
          {getAvailableProviders(false).map(provider => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
      </div>

      {selectedProvider === 'Blockfrost' && (
        <div>
          <label>URL:</label>
          <input
            type="text"
            value={providerConfig.url || ''}
            onChange={(e) => handleConfigUpdate('url', e.target.value)}
          />
          <label>Project ID:</label>
          <input
            type="text"
            value={providerConfig.projectId || ''}
            onChange={(e) => handleConfigUpdate('projectId', e.target.value)}
          />
        </div>
      )}

      {selectedProvider === 'Kupmios' && (
        <div>
          <label>Kupo URL:</label>
          <input
            type="text"
            value={providerConfig.kupoUrl || ''}
            onChange={(e) => handleConfigUpdate('kupoUrl', e.target.value)}
          />
          <label>Ogmios URL:</label>
          <input
            type="text"
            value={providerConfig.ogmiosUrl || ''}
            onChange={(e) => handleConfigUpdate('ogmiosUrl', e.target.value)}
          />
        </div>
      )}

      {selectedProvider === 'Maestro' && (
        <div>
          <label>API Key:</label>
          <input
            type="text"
            value={providerConfig.apiKey || ''}
            onChange={(e) => handleConfigUpdate('apiKey', e.target.value)}
          />
        </div>
      )}

      <button onClick={saveConfiguration}>Save Configuration</button>
    </div>
  );
}

export default ProviderSettings;
```

## Migration from Legacy System

If you're migrating from the old system, here are the key changes:

### Old System
```tsx
// Old way
const settings = {
  provider: 'Blockfrost',
  metadataProvider: 'Blockfrost',
  apiUrl: 'https://cardano-mainnet.blockfrost.io/api/v0'
};
```

### New System
```tsx
// New way
const settings = {
  provider: {
    type: 'Blockfrost',
    config: {
      url: 'https://cardano-mainnet.blockfrost.io/api/v0',
      projectId: 'your-project-id'
    }
  },
  metadataProvider: {
    type: 'Blockfrost',
    config: {
      url: 'https://cardano-mainnet.blockfrost.io/api/v0',
      projectId: 'your-project-id'
    }
  }
};
```

## TypeScript Support

The enhanced provider system is fully typed with TypeScript support:

```tsx
import { 
  ProviderConfig, 
  BlockfrostConfig, 
  KupmiosConfig, 
  MaestroConfig,
  ProviderType 
} from '@clan/framework-providers';

// Type-safe provider configuration
const config: ProviderConfig = {
  type: 'Blockfrost',
  config: {
    url: 'https://cardano-mainnet.blockfrost.io/api/v0',
    projectId: 'project123'
  }
};
```

This enhanced system provides much more flexibility and type safety for managing different provider configurations in your Cardano applications.
