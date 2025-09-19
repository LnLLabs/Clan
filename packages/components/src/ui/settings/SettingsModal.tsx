import React, { useState } from 'react';
import { Modal } from '../modals/Modal';
import { Button } from '../buttons/Button';
import { 
  useSettings, 
  useBlockchain
} from '@clan/framework-providers';
import type { 
  EnhancedProviderConfig as ProviderConfig, 
  EnhancedProviderType as ProviderType
} from '@clan/framework-providers';
import { NETWORKS } from '@clan/framework-core';
import { showSuccess, showError } from '@clan/framework-helpers';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChange
}) => {
  const { 
    settings, 
    updateSettings, 
    resetToDefaults, 
    updateProvider, 
    updateMetadataProvider,
    validateProvider,
    getAvailableProviders,
    createProviderConfig,
    switchNetwork: switchSettingsNetwork
  } = useSettings();
  const { switchNetwork } = useBlockchain();

  // Local state for form
  const [network, setNetwork] = useState(settings.network.name);
  const [provider, setProvider] = useState<ProviderConfig>(settings.provider);
  const [metadataProvider, setMetadataProvider] = useState<ProviderConfig>(settings.metadataProvider);
  const [isLoading, setIsLoading] = useState(false);

  const MwalletPassthrough = 'https://passthrough.broclan.io';

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setNetwork(settings.network.name);
      setProvider(settings.provider);
      setMetadataProvider(settings.metadataProvider);
    }
  }, [isOpen, settings]);

  const networkChange = (newNetwork: string) => {
    setNetwork(newNetwork);
    const networkConfig = Object.values(NETWORKS).find(n => n.name === newNetwork);
    if (networkConfig) {
      // Update provider configs for the new network
      const newProvider = createProviderConfig(provider.type);
      const newMetadataProvider = createProviderConfig(metadataProvider.type);
      setProvider(newProvider);
      setMetadataProvider(newMetadataProvider);
    }
  };

  const changeProvider = (newProviderType: ProviderType) => {
    const newProvider = createProviderConfig(newProviderType);
    setProvider(newProvider);
  };

  const changeMetadataProvider = (newProviderType: ProviderType) => {
    const newMetadataProvider = createProviderConfig(newProviderType);
    setMetadataProvider(newMetadataProvider);
  };

  const updateProviderConfig = (field: string, value: string) => {
    setProvider(prev => {
      const newConfig = { ...prev.config, [field]: value };
      return {
        ...prev,
        config: newConfig
      } as ProviderConfig;
    });
  };

  const updateMetadataProviderConfig = (field: string, value: string) => {
    setMetadataProvider(prev => {
      const newConfig = { ...prev.config, [field]: value };
      return {
        ...prev,
        config: newConfig
      } as ProviderConfig;
    });
  };

  const handleApplySettings = async () => {
    setIsLoading(true);

    try {
      // Validate provider configuration
      const providerValidation = validateProvider(provider);
      if (!providerValidation.isValid) {
        showError(`Invalid provider configuration: ${providerValidation.errors.join(', ')}`);
        return;
      }

      // Validate metadata provider configuration
      const metadataValidation = validateProvider(metadataProvider);
      if (!metadataValidation.isValid) {
        showError(`Invalid metadata provider configuration: ${metadataValidation.errors.join(', ')}`);
        return;
      }

      // Get network configuration
      const networkConfig = Object.values(NETWORKS).find(n => n.name === network);
      if (!networkConfig) {
        showError('Invalid network selected');
        return;
      }

      // Update provider configurations with network-specific URLs
      let updatedProvider = { ...provider };
      let updatedMetadataProvider = { ...metadataProvider };

      // Update URLs based on network for Blockfrost
      if (provider.type === 'Blockfrost') {
        updatedProvider = {
          ...provider,
          config: {
            ...provider.config,
            url: networkConfig.apiUrl || provider.config.url
          }
        };
      }

      if (metadataProvider.type === 'Blockfrost') {
        updatedMetadataProvider = {
          ...metadataProvider,
          config: {
            ...metadataProvider.config,
            url: networkConfig.apiUrl || metadataProvider.config.url
          }
        };
      }

      // Update MWallet configuration
      if (provider.type === 'MWallet') {
        updatedProvider = {
          ...provider,
          config: {
            url: MwalletPassthrough,
            projectId: network.toLowerCase()
          }
        };
      }

      // Update settings
      await updateSettings({
        network: networkConfig,
        provider: updatedProvider,
        metadataProvider: updatedMetadataProvider,
        sendAll: settings.sendAll,
        explorer: settings.explorer,
        disableSync: settings.disableSync
      });

      // Switch network if needed
      await switchNetwork(networkConfig);

      showSuccess('Settings applied successfully');
      onSettingsChange?.();
      onClose();

    } catch (error) {
      showError('Failed to apply settings');
      console.error('Settings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      await resetToDefaults();
      showSuccess('Settings reset to defaults');
      onSettingsChange?.();
      onClose();
    } catch (error) {
      showError('Failed to reset settings');
    }
  };

  const providerSettings = () => {
    // Provider configuration
    if (provider.type === 'Blockfrost') {
      return (
        <div>
          {network === 'Custom' && (
            <input
              type="text"
              placeholder="API URL"
              value={provider.config.url || ''}
              onChange={(e) => updateProviderConfig('url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
          )}
          <input
            type="text"
            placeholder="Project ID"
            value={provider.config.projectId || ''}
            onChange={(e) => updateProviderConfig('projectId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      );
    }

    if (provider.type === 'Kupmios') {
      return (
        <div>
          <input
            type="text"
            placeholder="Kupo URL"
            value={provider.config.kupoUrl || ''}
            onChange={(e) => updateProviderConfig('kupoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
          />
          <input
            type="text"
            placeholder="Ogmios URL"
            value={provider.config.ogmiosUrl || ''}
            onChange={(e) => updateProviderConfig('ogmiosUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      );
    }

    if (provider.type === 'Maestro') {
      return (
        <div>
          <input
            type="text"
            placeholder="API Key"
            value={provider.config.apiKey || ''}
            onChange={(e) => updateProviderConfig('apiKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      );
    }

    if (provider.type === 'MWallet') {
      return (
        <div className="text-sm text-gray-600">
          MWallet configuration is automatically set based on the selected network.
        </div>
      );
    }

    return null;
  };

  const metadataProviderSettings = () => {
    // Metadata provider configuration
    if (metadataProvider.type === 'Blockfrost') {
      return (
        <div>
          {network === 'Custom' && (
            <input
              type="text"
              placeholder="API URL"
              value={metadataProvider.config.url || ''}
              onChange={(e) => updateMetadataProviderConfig('url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
          )}
          <input
            type="text"
            placeholder="Project ID"
            value={metadataProvider.config.projectId || ''}
            onChange={(e) => updateMetadataProviderConfig('projectId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      );
    }

    if (metadataProvider.type === 'Maestro') {
      return (
        <div>
          <input
            type="text"
            placeholder="API Key"
            value={metadataProvider.config.apiKey || ''}
            onChange={(e) => updateMetadataProviderConfig('apiKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      );
    }

    if (metadataProvider.type === 'None') {
      return (
        <div className="text-sm text-gray-600">
          No metadata provider configuration needed.
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="lg"
    >
      <div className="settings-modal">
        <div className="space-y-6">
          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network
            </label>
            <select
              value={network}
              onChange={(e) => networkChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Preprod">Preprod</option>
              <option value="Preview">Preview</option>
              <option value="Mainnet">Mainnet</option>
              {provider.type !== 'MWallet' && <option value="Custom">Custom</option>}
            </select>
            {network === 'Mainnet' && ['alpha.broclan.io', 'beta.broclan.io', 'testnet.broclan.io'].includes(window.location.hostname) && (
              <p className="text-red-600 text-sm mt-1">
                WARNING: This is a testnet deployment, make sure you understand the risks before using it on the mainnet.
              </p>
            )}
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              value={provider.type}
              onChange={(e) => changeProvider(e.target.value as ProviderType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {getAvailableProviders(false).map((providerType: ProviderType) => (
                <option key={providerType} value={providerType}>
                  {providerType === 'MWallet' ? 'KeyPact' : providerType}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider Configuration
            </label>
            {providerSettings()}
          </div>

          {/* Metadata Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metadata Provider
            </label>
            <select
              value={metadataProvider.type}
              onChange={(e) => changeMetadataProvider(e.target.value as ProviderType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {getAvailableProviders(true).map((providerType: ProviderType) => (
                <option key={providerType} value={providerType}>
                  {providerType}
                </option>
              ))}
            </select>
          </div>

          {/* Metadata Provider Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metadata Provider Configuration
            </label>
            {metadataProviderSettings()}
          </div>

          {/* Additional Settings */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendAll"
                checked={settings.sendAll}
                onChange={(e) => updateSettings({ sendAll: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="sendAll" className="text-sm">Enable Send All</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="disableSync"
                checked={settings.disableSync}
                onChange={(e) => updateSettings({ disableSync: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="disableSync" className="text-sm">Disable All Sync</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleApplySettings}
              loading={isLoading}
              className="flex-1"
            >
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={handleResetSettings}
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;