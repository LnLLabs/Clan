import React, { useState } from 'react';
import { Modal } from '../modals/Modal';
import { Button } from '../buttons/Button';
import { useSettings, useBlockchain } from '@broclan/framework-providers';
import { NETWORKS } from '@broclan/framework-core';
import { showSuccess, showError } from '@broclan/framework-helpers';

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
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const { switchNetwork } = useBlockchain();

  // Local state for form
  const [network, setNetwork] = useState(settings.network.name);
  const [provider, setProvider] = useState(settings.provider || 'Blockfrost');
  const [providerConnection, setProviderConnection] = useState(settings.api || {});
  const [metadataProvider, setMetadataProvider] = useState(settings.metadataProvider || 'Blockfrost');
  const [isLoading, setIsLoading] = useState(false);

  const MwalletPassthrough = 'https://passthrough.broclan.io';

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setNetwork(settings.network.name);
      setProvider(settings.provider || 'Blockfrost');
      setProviderConnection(settings.api || {});
      setMetadataProvider(settings.metadataProvider || 'Blockfrost');
    }
  }, [isOpen, settings]);

  const networkChange = (newNetwork: string) => {
    setNetwork(newNetwork);
    setDefaultValues(newNetwork, provider, metadataProvider);
  };

  const changeProvider = (newProvider: string) => {
    setProvider(newProvider);
    if (newProvider === 'Blockfrost') {
      setProviderConnection({
        url: '',
        projectId: ''
      });
    } else if (newProvider === 'MWallet') {
      setProviderConnection({});
    }
    setDefaultValues(network, newProvider, metadataProvider);
  };

  const setDefaultValues = (net: string, prov: string, metaProv: string) => {
    if (prov === 'Blockfrost') {
      setProviderConnection({
        url: '',
        projectId: ''
      });
    } else if (prov === 'MWallet') {
      setProviderConnection({});
    } else if (prov === 'Kupmios') {
      if (net === 'Mainnet') {
        setProviderConnection({
          kupoUrl: 'https://kupo-mainnet-wmalletmainnet-c8be04.us1.demeter.run',
          ogmiosUrl: 'wss://ogmios-wmalletmainnet-c8be04.us1.demeter.run'
        });
      } else if (net === 'Preprod') {
        setProviderConnection({
          kupoUrl: 'https://kupo-preprod-mwallet-e048ec.us1.demeter.run',
          ogmiosUrl: 'wss://ogmios-mwallet-e048ec.us1.demeter.run'
        });
      } else {
        setProviderConnection({
          kupoUrl: '',
          ogmiosUrl: ''
        });
      }
    }

    if (metaProv === 'Blockfrost') {
      const newConnection = { ...providerConnection };
      newConnection.projectId = '';
      setProviderConnection(newConnection);
    }
  };

  const handleApplySettings = async () => {
    setIsLoading(true);

    try {
      let localProviderConnection = providerConnection;

      if (provider === 'Blockfrost') {
        if (!providerConnection.url || !providerConnection.projectId) {
          showError('Please fill all Blockfrost fields');
          return;
        }

        const networkConfig = Object.values(NETWORKS).find(n => n.name === network);
        if (networkConfig) {
          switch (network) {
            case 'Mainnet':
              localProviderConnection.url = networkConfig.apiUrl || '';
              break;
            case 'Preview':
              localProviderConnection.url = 'https://cardano-preview.blockfrost.io/api/v0';
              break;
            case 'Preprod':
              localProviderConnection.url = 'https://cardano-preprod.blockfrost.io/api/v0';
              break;
            default:
              localProviderConnection.url = providerConnection.url;
          }
        }
      } else if (provider === 'Kupmios') {
        if (!providerConnection.kupoUrl || !providerConnection.ogmiosUrl) {
          showError('Please fill all Kupmios fields');
          return;
        }
      } else if (provider === 'MWallet') {
        localProviderConnection.url = MwalletPassthrough;

        switch (network) {
          case 'Mainnet':
            localProviderConnection.projectId = 'mainnet';
            break;
          case 'Preview':
            localProviderConnection.projectId = 'preview';
            break;
          case 'Preprod':
            localProviderConnection.projectId = 'preprod';
            break;
          default:
            localProviderConnection.projectId = 'custom';
        }
      }

      // Update settings
      await updateSettings({
        network: NETWORKS[network.toLowerCase()] || settings.network,
        provider,
        api: providerConnection,
        metadataProvider,
        sendAll: settings.sendAll,
        explorer: settings.explorer,
        disableSync: settings.disableSync
      });

      // Switch network if needed
      await switchNetwork(NETWORKS[network.toLowerCase()] || settings.network);

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
    if ((provider === 'Blockfrost' || metadataProvider === 'Blockfrost') && provider !== 'MWallet') {
      return (
        <div>
          {network === 'Custom' && (
            <input
              type="text"
              placeholder="API URL"
              value={providerConnection.url || ''}
              onChange={(e) => setProviderConnection({ ...providerConnection, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
          )}
          <input
            type="text"
            placeholder="Project ID"
            value={providerConnection.projectId || ''}
            onChange={(e) => setProviderConnection({ ...providerConnection, projectId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      );
    }

    if (provider === 'Kupmios') {
      return (
        <div>
          <input
            type="text"
            placeholder="Kupo URL"
            value={providerConnection.kupoUrl || ''}
            onChange={(e) => setProviderConnection({ ...providerConnection, kupoUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
          />
          <input
            type="text"
            placeholder="Ogmios URL"
            value={providerConnection.ogmiosUrl || ''}
            onChange={(e) => setProviderConnection({ ...providerConnection, ogmiosUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      );
    }

    if ((provider === 'Maestro' || metadataProvider === 'Maestro')) {
      return (
        <div>
          <input
            type="text"
            placeholder="API Key"
            value={providerConnection.apiKey || ''}
            onChange={(e) => setProviderConnection({ ...providerConnection, apiKey: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
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
              {provider !== 'MWallet' && <option value="Custom">Custom</option>}
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
              value={provider}
              onChange={(e) => changeProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Blockfrost">Blockfrost</option>
              <option value="MWallet">KeyPact</option>
              <option value="Kupmios">Kupmios</option>
              <option value="Maestro">Maestro</option>
            </select>
          </div>

          {/* Metadata Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metadata Provider
            </label>
            <select
              value={metadataProvider}
              onChange={(e) => setMetadataProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="None">None</option>
              <option value="Maestro">Maestro</option>
              {provider && <option value="Blockfrost">Blockfrost</option>}
            </select>
          </div>

          {/* Provider Settings */}
          {providerSettings()}

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
