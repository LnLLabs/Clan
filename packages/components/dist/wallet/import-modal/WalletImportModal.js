"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletImportModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Modal_1 = require("../../ui/modals/Modal");
const Button_1 = require("../../ui/buttons/Button");
const WalletImportModal = ({ isOpen, onClose, onImport, supportedTypes = ['mnemonic', 'private-key', 'hardware', 'watch-only'], className = '' }) => {
    const [selectedType, setSelectedType] = (0, react_1.useState)('mnemonic');
    const [walletName, setWalletName] = (0, react_1.useState)('');
    const [isImporting, setIsImporting] = (0, react_1.useState)(false);
    // Form data for different import types
    const [mnemonic, setMnemonic] = (0, react_1.useState)('');
    const [mnemonicPassphrase, setMnemonicPassphrase] = (0, react_1.useState)('');
    const [privateKey, setPrivateKey] = (0, react_1.useState)('');
    const [publicKey, setPublicKey] = (0, react_1.useState)('');
    const [address, setAddress] = (0, react_1.useState)('');
    const [derivationPath, setDerivationPath] = (0, react_1.useState)("m/1852'/1815'/0'/0/0");
    const [errors, setErrors] = (0, react_1.useState)({});
    const resetForm = () => {
        setWalletName('');
        setMnemonic('');
        setMnemonicPassphrase('');
        setPrivateKey('');
        setPublicKey('');
        setAddress('');
        setDerivationPath("m/1852'/1815'/0'/0/0");
        setErrors({});
        setSelectedType('mnemonic');
    };
    const validateForm = () => {
        const newErrors = {};
        if (!walletName.trim()) {
            newErrors.name = 'Wallet name is required';
        }
        switch (selectedType) {
            case 'mnemonic':
                if (!mnemonic.trim()) {
                    newErrors.mnemonic = 'Mnemonic phrase is required';
                }
                else {
                    const words = mnemonic.trim().split(/\s+/);
                    if (words.length < 12 || words.length > 24) {
                        newErrors.mnemonic = 'Mnemonic must be 12-24 words';
                    }
                }
                break;
            case 'private-key':
                if (!privateKey.trim()) {
                    newErrors.privateKey = 'Private key is required';
                }
                else if (!/^([0-9a-fA-F]{64}|[0-9a-fA-F]{128})$/.test(privateKey.trim())) {
                    newErrors.privateKey = 'Invalid private key format';
                }
                break;
            case 'hardware':
                if (!publicKey.trim()) {
                    newErrors.publicKey = 'Public key is required';
                }
                break;
            case 'watch-only':
                if (!address.trim()) {
                    newErrors.address = 'Address is required';
                }
                else if (!address.startsWith('addr1') && !address.startsWith('addr_test1')) {
                    newErrors.address = 'Invalid Cardano address format';
                }
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleImport = async () => {
        if (!validateForm())
            return;
        setIsImporting(true);
        try {
            const importData = {
                type: selectedType,
                name: walletName.trim(),
                data: {}
            };
            switch (selectedType) {
                case 'mnemonic':
                    importData.data = {
                        mnemonic: mnemonic.trim(),
                        derivationPath
                    };
                    if (mnemonicPassphrase.trim()) {
                        importData.data.passphrase = mnemonicPassphrase.trim();
                    }
                    break;
                case 'private-key':
                    importData.data = {
                        privateKey: privateKey.trim(),
                        derivationPath
                    };
                    break;
                case 'hardware':
                    importData.data = {
                        publicKey: publicKey.trim(),
                        derivationPath
                    };
                    break;
                case 'watch-only':
                    importData.data = {
                        address: address.trim()
                    };
                    break;
            }
            await onImport(importData);
            resetForm();
            onClose();
        }
        catch (error) {
            console.error('Import error:', error);
            setErrors({ general: 'Failed to import wallet. Please check your input and try again.' });
        }
        finally {
            setIsImporting(false);
        }
    };
    const getTypeDescription = (type) => {
        switch (type) {
            case 'mnemonic':
                return 'Import using a 12-24 word recovery phrase';
            case 'private-key':
                return 'Import using a private key (hex format)';
            case 'hardware':
                return 'Connect to a hardware wallet';
            case 'watch-only':
                return 'Monitor an address without signing capability';
            default:
                return '';
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'mnemonic':
                return '📝';
            case 'private-key':
                return '🔑';
            case 'hardware':
                return '🔒';
            case 'watch-only':
                return '👁️';
            default:
                return '📱';
        }
    };
    const renderForm = () => {
        switch (selectedType) {
            case 'mnemonic':
                return ((0, jsx_runtime_1.jsxs)("div", { className: "import-form", children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "mnemonic", children: "Mnemonic Phrase *" }), (0, jsx_runtime_1.jsx)("textarea", { id: "mnemonic", value: mnemonic, onChange: (e) => setMnemonic(e.target.value), placeholder: "Enter your 12-24 word mnemonic phrase", rows: 4, className: errors.mnemonic ? 'error' : '' }), errors.mnemonic && (0, jsx_runtime_1.jsx)("span", { className: "error-message", children: errors.mnemonic })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "passphrase", children: "Passphrase (Optional)" }), (0, jsx_runtime_1.jsx)("input", { id: "passphrase", type: "password", value: mnemonicPassphrase, onChange: (e) => setMnemonicPassphrase(e.target.value), placeholder: "Enter BIP39 passphrase if used" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "derivation-path", children: "Derivation Path" }), (0, jsx_runtime_1.jsx)("input", { id: "derivation-path", type: "text", value: derivationPath, onChange: (e) => setDerivationPath(e.target.value), placeholder: "m/1852'/1815'/0'/0/0" }), (0, jsx_runtime_1.jsx)("small", { className: "help-text", children: "Default Cardano derivation path for Shelley-era addresses" })] })] }));
            case 'private-key':
                return ((0, jsx_runtime_1.jsxs)("div", { className: "import-form", children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "private-key", children: "Private Key *" }), (0, jsx_runtime_1.jsx)("textarea", { id: "private-key", value: privateKey, onChange: (e) => setPrivateKey(e.target.value), placeholder: "Enter your private key in hex format (64 or 128 characters)", rows: 3, className: errors.privateKey ? 'error' : '' }), errors.privateKey && (0, jsx_runtime_1.jsx)("span", { className: "error-message", children: errors.privateKey })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "derivation-path", children: "Derivation Path" }), (0, jsx_runtime_1.jsx)("input", { id: "derivation-path", type: "text", value: derivationPath, onChange: (e) => setDerivationPath(e.target.value), placeholder: "m/1852'/1815'/0'/0/0" })] })] }));
            case 'hardware':
                return ((0, jsx_runtime_1.jsx)("div", { className: "import-form", children: (0, jsx_runtime_1.jsxs)("div", { className: "hardware-import", children: [(0, jsx_runtime_1.jsx)("div", { className: "hardware-icon", children: "\uD83D\uDD17" }), (0, jsx_runtime_1.jsx)("h3", { children: "Connect Hardware Wallet" }), (0, jsx_runtime_1.jsx)("p", { children: "Connect your hardware wallet to import using your public key" }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "public-key", children: "Public Key *" }), (0, jsx_runtime_1.jsx)("textarea", { id: "public-key", value: publicKey, onChange: (e) => setPublicKey(e.target.value), placeholder: "Enter your extended public key (xpub)", rows: 3, className: errors.publicKey ? 'error' : '' }), errors.publicKey && (0, jsx_runtime_1.jsx)("span", { className: "error-message", children: errors.publicKey })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "derivation-path", children: "Derivation Path" }), (0, jsx_runtime_1.jsx)("input", { id: "derivation-path", type: "text", value: derivationPath, onChange: (e) => setDerivationPath(e.target.value), placeholder: "m/1852'/1815'/0'/0/0" })] })] }) }));
            case 'watch-only':
                return ((0, jsx_runtime_1.jsx)("div", { className: "import-form", children: (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "address", children: "Cardano Address *" }), (0, jsx_runtime_1.jsx)("textarea", { id: "address", value: address, onChange: (e) => setAddress(e.target.value), placeholder: "Enter the Cardano address to monitor", rows: 2, className: errors.address ? 'error' : '' }), errors.address && (0, jsx_runtime_1.jsx)("span", { className: "error-message", children: errors.address }), (0, jsx_runtime_1.jsx)("small", { className: "help-text", children: "This will create a watch-only wallet that can monitor the address but cannot sign transactions" })] }) }));
            default:
                return null;
        }
    };
    return ((0, jsx_runtime_1.jsx)(Modal_1.Modal, { isOpen: isOpen, onClose: onClose, title: "Import Wallet", size: "xl", className: `wallet-import-modal ${className}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "import-modal-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "import-types", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Select Import Method" }), (0, jsx_runtime_1.jsx)("div", { className: "type-grid", children: supportedTypes.map((type) => ((0, jsx_runtime_1.jsxs)("div", { className: `type-option ${selectedType === type ? 'selected' : ''}`, onClick: () => setSelectedType(type), children: [(0, jsx_runtime_1.jsx)("div", { className: "type-icon", children: getTypeIcon(type) }), (0, jsx_runtime_1.jsxs)("div", { className: "type-info", children: [(0, jsx_runtime_1.jsx)("h4", { children: type.replace('-', ' ').toUpperCase() }), (0, jsx_runtime_1.jsx)("p", { children: getTypeDescription(type) })] }), selectedType === type && (0, jsx_runtime_1.jsx)("div", { className: "selected-indicator", children: "\u2713" })] }, type))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "import-form-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "wallet-name", children: "Wallet Name *" }), (0, jsx_runtime_1.jsx)("input", { id: "wallet-name", type: "text", value: walletName, onChange: (e) => setWalletName(e.target.value), placeholder: "Enter a name for your wallet", className: errors.name ? 'error' : '' }), errors.name && (0, jsx_runtime_1.jsx)("span", { className: "error-message", children: errors.name })] }), renderForm(), errors.general && ((0, jsx_runtime_1.jsx)("div", { className: "error-message general-error", children: errors.general }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "import-actions", children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: () => {
                                resetForm();
                                onClose();
                            }, disabled: isImporting, children: "Cancel" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", onClick: handleImport, disabled: isImporting, children: isImporting ? 'Importing...' : 'Import Wallet' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "security-notice", children: [(0, jsx_runtime_1.jsx)("div", { className: "notice-icon", children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsxs)("div", { className: "notice-content", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Security Notice" }), (0, jsx_runtime_1.jsx)("p", { children: "Never share your mnemonic phrase or private keys with anyone. Make sure you are on the correct website and that your connection is secure." })] })] })] }) }));
};
exports.WalletImportModal = WalletImportModal;
exports.default = exports.WalletImportModal;
//# sourceMappingURL=WalletImportModal.js.map