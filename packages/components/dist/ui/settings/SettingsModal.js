"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const Modal_1 = require("../modals/Modal");
const Button_1 = require("../buttons/Button");
const framework_providers_1 = require("@clan/framework-providers");
const framework_core_1 = require("@clan/framework-core");
const framework_helpers_1 = require("@clan/framework-helpers");
const SettingsModal = ({ isOpen, onClose, onSettingsChange }) => {
    const { settings, updateSettings, resetToDefaults, updateProvider, updateMetadataProvider, validateProvider, getAvailableProviders, createProviderConfig, switchNetwork: switchSettingsNetwork } = (0, framework_providers_1.useSettings)();
    const { switchNetwork } = (0, framework_providers_1.useBlockchain)();
    // Local state for form
    const [network, setNetwork] = (0, react_1.useState)(settings.network.name);
    const [provider, setProvider] = (0, react_1.useState)(settings.provider);
    const [metadataProvider, setMetadataProvider] = (0, react_1.useState)(settings.metadataProvider);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const MwalletPassthrough = 'https://passthrough.broclan.io';
    // Reset form when modal opens
    react_1.default.useEffect(() => {
        if (isOpen) {
            setNetwork(settings.network.name);
            setProvider(settings.provider);
            setMetadataProvider(settings.metadataProvider);
        }
    }, [isOpen, settings]);
    const networkChange = (newNetwork) => {
        setNetwork(newNetwork);
        const networkConfig = Object.values(framework_core_1.NETWORKS).find(n => n.name === newNetwork);
        if (networkConfig) {
            // Update provider configs for the new network
            const newProvider = createProviderConfig(provider.type);
            const newMetadataProvider = createProviderConfig(metadataProvider.type);
            setProvider(newProvider);
            setMetadataProvider(newMetadataProvider);
        }
    };
    const changeProvider = (newProviderType) => {
        const newProvider = createProviderConfig(newProviderType);
        setProvider(newProvider);
    };
    const changeMetadataProvider = (newProviderType) => {
        const newMetadataProvider = createProviderConfig(newProviderType);
        setMetadataProvider(newMetadataProvider);
    };
    const updateProviderConfig = (field, value) => {
        setProvider(prev => {
            const newConfig = { ...prev.config, [field]: value };
            return {
                ...prev,
                config: newConfig
            };
        });
    };
    const updateMetadataProviderConfig = (field, value) => {
        setMetadataProvider(prev => {
            const newConfig = { ...prev.config, [field]: value };
            return {
                ...prev,
                config: newConfig
            };
        });
    };
    const handleApplySettings = async () => {
        setIsLoading(true);
        try {
            // Validate provider configuration
            const providerValidation = validateProvider(provider);
            if (!providerValidation.isValid) {
                (0, framework_helpers_1.showError)(`Invalid provider configuration: ${providerValidation.errors.join(', ')}`);
                return;
            }
            // Validate metadata provider configuration
            const metadataValidation = validateProvider(metadataProvider);
            if (!metadataValidation.isValid) {
                (0, framework_helpers_1.showError)(`Invalid metadata provider configuration: ${metadataValidation.errors.join(', ')}`);
                return;
            }
            // Get network configuration
            const networkConfig = Object.values(framework_core_1.NETWORKS).find(n => n.name === network);
            if (!networkConfig) {
                (0, framework_helpers_1.showError)('Invalid network selected');
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
            (0, framework_helpers_1.showSuccess)('Settings applied successfully');
            onSettingsChange?.();
            onClose();
        }
        catch (error) {
            (0, framework_helpers_1.showError)('Failed to apply settings');
            console.error('Settings error:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleResetSettings = async () => {
        try {
            await resetToDefaults();
            (0, framework_helpers_1.showSuccess)('Settings reset to defaults');
            onSettingsChange?.();
            onClose();
        }
        catch (error) {
            (0, framework_helpers_1.showError)('Failed to reset settings');
        }
    };
    const providerSettings = () => {
        // Provider configuration
        if (provider.type === 'Blockfrost') {
            return ((0, jsx_runtime_1.jsxs)("div", { children: [network === 'Custom' && ((0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "API URL", value: provider.config.url || '', onChange: (e) => updateProviderConfig('url', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md mb-2" })), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Project ID", value: provider.config.projectId || '', onChange: (e) => updateProviderConfig('projectId', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }));
        }
        if (provider.type === 'Kupmios') {
            return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Kupo URL", value: provider.config.kupoUrl || '', onChange: (e) => updateProviderConfig('kupoUrl', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md mb-2" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Ogmios URL", value: provider.config.ogmiosUrl || '', onChange: (e) => updateProviderConfig('ogmiosUrl', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }));
        }
        if (provider.type === 'Maestro') {
            return ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "API Key", value: provider.config.apiKey || '', onChange: (e) => updateProviderConfig('apiKey', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md" }) }));
        }
        if (provider.type === 'MWallet') {
            return ((0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "MWallet configuration is automatically set based on the selected network." }));
        }
        return null;
    };
    const metadataProviderSettings = () => {
        // Metadata provider configuration
        if (metadataProvider.type === 'Blockfrost') {
            return ((0, jsx_runtime_1.jsxs)("div", { children: [network === 'Custom' && ((0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "API URL", value: metadataProvider.config.url || '', onChange: (e) => updateMetadataProviderConfig('url', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md mb-2" })), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Project ID", value: metadataProvider.config.projectId || '', onChange: (e) => updateMetadataProviderConfig('projectId', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }));
        }
        if (metadataProvider.type === 'Maestro') {
            return ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "API Key", value: metadataProvider.config.apiKey || '', onChange: (e) => updateMetadataProviderConfig('apiKey', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md" }) }));
        }
        if (metadataProvider.type === 'None') {
            return ((0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "No metadata provider configuration needed." }));
        }
        return null;
    };
    return ((0, jsx_runtime_1.jsx)(Modal_1.Modal, { isOpen: isOpen, onClose: onClose, title: "Settings", size: "lg", children: (0, jsx_runtime_1.jsx)("div", { className: "settings-modal", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Network" }), (0, jsx_runtime_1.jsxs)("select", { value: network, onChange: (e) => networkChange(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [(0, jsx_runtime_1.jsx)("option", { value: "Preprod", children: "Preprod" }), (0, jsx_runtime_1.jsx)("option", { value: "Preview", children: "Preview" }), (0, jsx_runtime_1.jsx)("option", { value: "Mainnet", children: "Mainnet" }), provider.type !== 'MWallet' && (0, jsx_runtime_1.jsx)("option", { value: "Custom", children: "Custom" })] }), network === 'Mainnet' && ['alpha.broclan.io', 'beta.broclan.io', 'testnet.broclan.io'].includes(window.location.hostname) && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-600 text-sm mt-1", children: "WARNING: This is a testnet deployment, make sure you understand the risks before using it on the mainnet." }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Provider" }), (0, jsx_runtime_1.jsx)("select", { value: provider.type, onChange: (e) => changeProvider(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: getAvailableProviders(false).map((providerType) => ((0, jsx_runtime_1.jsx)("option", { value: providerType, children: providerType === 'MWallet' ? 'KeyPact' : providerType }, providerType))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Provider Configuration" }), providerSettings()] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Metadata Provider" }), (0, jsx_runtime_1.jsx)("select", { value: metadataProvider.type, onChange: (e) => changeMetadataProvider(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: getAvailableProviders(true).map((providerType) => ((0, jsx_runtime_1.jsx)("option", { value: providerType, children: providerType }, providerType))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Metadata Provider Configuration" }), metadataProviderSettings()] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", id: "sendAll", checked: settings.sendAll, onChange: (e) => updateSettings({ sendAll: e.target.checked }), className: "mr-2" }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "sendAll", className: "text-sm", children: "Enable Send All" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", id: "disableSync", checked: settings.disableSync, onChange: (e) => updateSettings({ disableSync: e.target.checked }), className: "mr-2" }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "disableSync", className: "text-sm", children: "Disable All Sync" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-3 pt-4", children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleApplySettings, loading: isLoading, className: "flex-1", children: "Apply" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "outline", onClick: handleResetSettings, className: "flex-1", children: "Reset" })] })] }) }) }));
};
exports.SettingsModal = SettingsModal;
exports.default = exports.SettingsModal;
//# sourceMappingURL=SettingsModal.js.map