/**
 * Usage examples for the enhanced SettingsProvider with flexible provider configurations
 */

import { 
  SettingsProvider, 
  useSettings, 
  ProviderConfig, 
  ProviderType,
  validateProviderConfig,
  getAvailableProviders,
  createDefaultProviderConfig,
  PROVIDER_DEFINITIONS
} from './SettingsProvider';
import { NetworkConfig, NETWORKS } from '@clan/framework-core';

// Example 1: Basic usage with different providers
export const ExampleProviderUsage = () => {
  const { 
    settings, 
    updateProvider, 
    updateMetadataProvider, 
    validateProvider,
    getAvailableProviders,
    createProviderConfig 
  } = useSettings();

  // Get available providers for different use cases
  const availableProviders = getAvailableProviders(false); // For blockchain provider
  const availableMetadataProviders = getAvailableProviders(true); // For metadata provider

  // Example: Switch to Blockfrost provider
  const switchToBlockfrost = async () => {
    const blockfrostConfig: ProviderConfig = {
      type: 'Blockfrost',
      config: {
        url: 'https://cardano-mainnet.blockfrost.io/api/v0',
        projectId: 'your-project-id-here'
      }
    };

    // Validate before updating
    const validation = validateProvider(blockfrostConfig);
    if (validation.isValid) {
      await updateProvider(blockfrostConfig);
    } else {
      console.error('Invalid Blockfrost configuration:', validation.errors);
    }
  };

  // Example: Switch to Kupmios provider
  const switchToKupmios = async () => {
    const kupmiosConfig: ProviderConfig = {
      type: 'Kupmios',
      config: {
        kupoUrl: 'https://kupo-mainnet.blockfrost.io',
        ogmiosUrl: 'wss://ogmios-mainnet.blockfrost.io'
      }
    };

    await updateProvider(kupmiosConfig);
  };

  // Example: Switch to Maestro provider
  const switchToMaestro = async () => {
    const maestroConfig: ProviderConfig = {
      type: 'Maestro',
      config: {
        apiKey: 'your-maestro-api-key-here'
      }
    };

    await updateProvider(maestroConfig);
  };

  // Example: Set Maestro as metadata provider
  const setMaestroAsMetadataProvider = async () => {
    const maestroMetadataConfig: ProviderConfig = {
      type: 'Maestro',
      config: {
        apiKey: 'your-maestro-api-key-here'
      }
    };

    await updateMetadataProvider(maestroMetadataConfig);
  };

  return {
    currentProvider: settings.provider,
    currentMetadataProvider: settings.metadataProvider,
    availableProviders,
    availableMetadataProviders,
    switchToBlockfrost,
    switchToKupmios,
    switchToMaestro,
    setMaestroAsMetadataProvider
  };
};

// Example 2: Provider configuration validation
export const validateProviderExamples = () => {
  // Valid Blockfrost configuration
  const validBlockfrost: ProviderConfig = {
    type: 'Blockfrost',
    config: {
      url: 'https://cardano-mainnet.blockfrost.io/api/v0',
      projectId: 'project123'
    }
  };

  // Invalid Blockfrost configuration (missing projectId)
  const invalidBlockfrost: ProviderConfig = {
    type: 'Blockfrost',
    config: {
      url: 'https://cardano-mainnet.blockfrost.io/api/v0',
      projectId: '' // Empty projectId
    }
  };

  // Valid Kupmios configuration
  const validKupmios: ProviderConfig = {
    type: 'Kupmios',
    config: {
      kupoUrl: 'https://kupo-mainnet.blockfrost.io',
      ogmiosUrl: 'wss://ogmios-mainnet.blockfrost.io'
    }
  };

  // Invalid Kupmios configuration (missing ogmiosUrl)
  const invalidKupmios: ProviderConfig = {
    type: 'Kupmios',
    config: {
      kupoUrl: 'https://kupo-mainnet.blockfrost.io'
      // Missing ogmiosUrl
    } as any
  };

  // Test validations
  console.log('Valid Blockfrost:', validateProviderConfig(validBlockfrost));
  console.log('Invalid Blockfrost:', validateProviderConfig(invalidBlockfrost));
  console.log('Valid Kupmios:', validateProviderConfig(validKupmios));
  console.log('Invalid Kupmios:', validateProviderConfig(invalidKupmios));

  return {
    validBlockfrost,
    invalidBlockfrost,
    validKupmios,
    invalidKupmios
  };
};

// Example 3: Network switching with provider updates
export const networkSwitchingExample = () => {
  const { switchNetwork } = useSettings();

  const switchToMainnet = async () => {
    await switchNetwork(NETWORKS.cardano_mainnet);
    // Provider configurations will be automatically updated for mainnet
  };

  const switchToTestnet = async () => {
    await switchNetwork(NETWORKS.cardano_testnet);
    // Provider configurations will be automatically updated for testnet
  };

  return {
    switchToMainnet,
    switchToTestnet
  };
};

// Example 4: Provider capabilities checking
export const providerCapabilitiesExample = () => {
  // Check if a provider can be used as a blockchain provider
  const canBeProvider = (type: ProviderType) => {
    return PROVIDER_DEFINITIONS[type].canBeProvider;
  };

  // Check if a provider can be used as a metadata provider
  const canBeMetadataProvider = (type: ProviderType) => {
    return PROVIDER_DEFINITIONS[type].canBeMetadataProvider;
  };

  // Get required fields for a provider
  const getRequiredFields = (type: ProviderType) => {
    return PROVIDER_DEFINITIONS[type].requiredFields;
  };

  // Examples
  console.log('Blockfrost can be provider:', canBeProvider('Blockfrost')); // true
  console.log('Blockfrost can be metadata provider:', canBeMetadataProvider('Blockfrost')); // true
  console.log('Kupmios can be provider:', canBeProvider('Kupmios')); // true
  console.log('Kupmios can be metadata provider:', canBeMetadataProvider('Kupmios')); // false
  console.log('None can be provider:', canBeProvider('None')); // false
  console.log('None can be metadata provider:', canBeMetadataProvider('None')); // true

  console.log('Blockfrost required fields:', getRequiredFields('Blockfrost')); // ['url', 'projectId']
  console.log('Kupmios required fields:', getRequiredFields('Kupmios')); // ['kupoUrl', 'ogmiosUrl']
  console.log('Maestro required fields:', getRequiredFields('Maestro')); // ['apiKey']

  return {
    canBeProvider,
    canBeMetadataProvider,
    getRequiredFields
  };
};

// Example 5: Creating default configurations for different networks
export const defaultConfigExamples = () => {
  const mainnetBlockfrost = createDefaultProviderConfig('Blockfrost', NETWORKS.cardano_mainnet);
  const testnetBlockfrost = createDefaultProviderConfig('Blockfrost', NETWORKS.cardano_testnet);
  const mainnetKupmios = createDefaultProviderConfig('Kupmios', NETWORKS.cardano_mainnet);
  const testnetKupmios = createDefaultProviderConfig('Kupmios', NETWORKS.cardano_testnet);

  console.log('Mainnet Blockfrost default:', mainnetBlockfrost);
  console.log('Testnet Blockfrost default:', testnetBlockfrost);
  console.log('Mainnet Kupmios default:', mainnetKupmios);
  console.log('Testnet Kupmios default:', testnetKupmios);

  return {
    mainnetBlockfrost,
    testnetBlockfrost,
    mainnetKupmios,
    testnetKupmios
  };
};

// Example 6: Complete provider setup component
export const ProviderSetupComponent = () => {
  const {
    settings,
    updateProvider,
    updateMetadataProvider,
    validateProvider,
    getAvailableProviders,
    createProviderConfig,
    switchNetwork
  } = useSettings();

  const handleProviderChange = async (type: ProviderType, config: any) => {
    const providerConfig: ProviderConfig = {
      type,
      config
    };

    const validation = validateProvider(providerConfig);
    if (validation.isValid) {
      await updateProvider(providerConfig);
    } else {
      alert(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
  };

  const handleMetadataProviderChange = async (type: ProviderType, config: any) => {
    const providerConfig: ProviderConfig = {
      type,
      config
    };

    const validation = validateProvider(providerConfig);
    if (validation.isValid) {
      await updateMetadataProvider(providerConfig);
    } else {
      alert(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
  };

  return {
    currentSettings: settings,
    availableProviders: getAvailableProviders(false),
    availableMetadataProviders: getAvailableProviders(true),
    handleProviderChange,
    handleMetadataProviderChange,
    switchNetwork
  };
};
