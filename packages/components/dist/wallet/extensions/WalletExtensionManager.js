"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestWalletAccess = exports.getInstalledWallets = exports.isWalletExtensionAvailable = exports.WalletExtensionManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const WalletExtensionManager = ({ onWalletConnected, onWalletDisconnected, supportedWallets = ['nami', 'eternl', 'flint', 'gerowallet', 'yoroi'], autoConnect = false, className = '' }) => {
    const [extensions, setExtensions] = (0, react_1.useState)([]);
    const [connectedWallet, setConnectedWallet] = (0, react_1.useState)(null);
    const [isConnecting, setIsConnecting] = (0, react_1.useState)(false);
    // Initialize wallet extensions detection
    (0, react_1.useEffect)(() => {
        detectWalletExtensions();
    }, []);
    // Auto-connect if enabled and a wallet was previously connected
    (0, react_1.useEffect)(() => {
        if (autoConnect && !connectedWallet) {
            const lastConnected = localStorage.getItem('broclan-last-wallet');
            if (lastConnected) {
                const wallet = extensions.find(ext => ext.identifier === lastConnected);
                if (wallet) {
                    connectWallet(wallet.identifier);
                }
            }
        }
    }, [extensions, autoConnect, connectedWallet]);
    const detectWalletExtensions = () => {
        const detectedExtensions = [];
        // Check for each supported wallet extension
        supportedWallets.forEach(walletId => {
            const walletExtension = detectWallet(walletId);
            if (walletExtension) {
                detectedExtensions.push(walletExtension);
            }
        });
        setExtensions(detectedExtensions);
    };
    const detectWallet = (walletId) => {
        try {
            // Check if the wallet extension is available in window.cardano
            const cardano = window.cardano;
            if (!cardano || !cardano[walletId]) {
                return null;
            }
            const walletApi = cardano[walletId];
            const walletInfo = walletApi.getWalletInfo ? walletApi.getWalletInfo() : {};
            return {
                name: walletInfo.name || getWalletDisplayName(walletId),
                identifier: walletId,
                icon: walletInfo.icon || getWalletIcon(walletId),
                version: walletInfo.version || 'Unknown',
                isInstalled: true,
                isEnabled: false,
                api: walletApi
            };
        }
        catch (error) {
            console.warn(`Failed to detect ${walletId} wallet:`, error);
            return null;
        }
    };
    const getWalletDisplayName = (walletId) => {
        const nameMap = {
            nami: 'Nami',
            eternl: 'Eternl',
            flint: 'Flint',
            gerowallet: 'GeroWallet',
            yoroi: 'Yoroi'
        };
        return nameMap[walletId] || walletId;
    };
    const getWalletIcon = (walletId) => {
        const iconMap = {
            nami: '🟡',
            eternl: '🔷',
            flint: '🔴',
            gerowallet: '🟢',
            yoroi: '🔵'
        };
        return iconMap[walletId] || '📱';
    };
    const connectWallet = async (walletId) => {
        const wallet = extensions.find(ext => ext.identifier === walletId);
        if (!wallet || isConnecting)
            return;
        setIsConnecting(true);
        try {
            // Enable the wallet extension
            const api = await wallet.api.enable();
            // Update wallet status
            const updatedWallet = { ...wallet, isEnabled: true, api };
            // Update extensions list
            setExtensions(prev => prev.map(ext => ext.identifier === walletId ? updatedWallet : ext));
            // Set connected wallet
            setConnectedWallet(updatedWallet);
            // Store last connected wallet
            localStorage.setItem('broclan-last-wallet', walletId);
            // Notify parent component
            onWalletConnected?.(updatedWallet);
        }
        catch (error) {
            console.error(`Failed to connect to ${walletId}:`, error);
            // Handle user rejection or other errors
        }
        finally {
            setIsConnecting(false);
        }
    };
    const disconnectWallet = () => {
        if (connectedWallet) {
            // Update wallet status
            setExtensions(prev => prev.map(ext => ext.identifier === connectedWallet.identifier
                ? { ...ext, isEnabled: false, api: undefined }
                : ext));
            // Clear connected wallet
            setConnectedWallet(null);
            // Remove from localStorage
            localStorage.removeItem('broclan-last-wallet');
            // Notify parent component
            onWalletDisconnected?.();
        }
    };
    const refreshWallets = () => {
        detectWalletExtensions();
    };
    const getWalletAddress = async () => {
        if (!connectedWallet?.api)
            return null;
        try {
            const addresses = await connectedWallet.api.getUsedAddresses();
            return addresses[0] || null;
        }
        catch (error) {
            console.error('Failed to get wallet address:', error);
            return null;
        }
    };
    const getWalletBalance = async () => {
        if (!connectedWallet?.api)
            return null;
        try {
            const balance = await connectedWallet.api.getBalance();
            return balance;
        }
        catch (error) {
            console.error('Failed to get wallet balance:', error);
            return null;
        }
    };
    const signTransaction = async (tx) => {
        if (!connectedWallet?.api) {
            throw new Error('No wallet connected');
        }
        try {
            const witnessSet = await connectedWallet.api.signTx(tx, true);
            return witnessSet;
        }
        catch (error) {
            console.error('Failed to sign transaction:', error);
            throw error;
        }
    };
    const submitTransaction = async (tx) => {
        if (!connectedWallet?.api) {
            throw new Error('No wallet connected');
        }
        try {
            const txHash = await connectedWallet.api.submitTx(tx);
            return txHash;
        }
        catch (error) {
            console.error('Failed to submit transaction:', error);
            throw error;
        }
    };
    // Expose wallet methods for parent components
    const walletMethods = {
        getAddress: getWalletAddress,
        getBalance: getWalletBalance,
        signTx: signTransaction,
        submitTx: submitTransaction
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `wallet-extension-manager ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "extension-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Wallet Extensions" }), (0, jsx_runtime_1.jsx)("button", { className: "refresh-button", onClick: refreshWallets, title: "Refresh wallet detection", children: "\uD83D\uDD04" })] }), connectedWallet ? ((0, jsx_runtime_1.jsxs)("div", { className: "connected-wallet", children: [(0, jsx_runtime_1.jsxs)("div", { className: "wallet-info", children: [(0, jsx_runtime_1.jsx)("div", { className: "wallet-icon", children: connectedWallet.icon }), (0, jsx_runtime_1.jsxs)("div", { className: "wallet-details", children: [(0, jsx_runtime_1.jsx)("h4", { children: connectedWallet.name }), (0, jsx_runtime_1.jsx)("span", { className: "wallet-status connected", children: "Connected" })] })] }), (0, jsx_runtime_1.jsx)("button", { className: "disconnect-button", onClick: disconnectWallet, children: "Disconnect" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "available-wallets", children: extensions.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "wallets-grid", children: extensions.map((extension) => ((0, jsx_runtime_1.jsxs)("div", { className: `wallet-option ${isConnecting ? 'connecting' : ''}`, onClick: () => connectWallet(extension.identifier), children: [(0, jsx_runtime_1.jsx)("div", { className: "wallet-icon", children: extension.icon }), (0, jsx_runtime_1.jsxs)("div", { className: "wallet-info", children: [(0, jsx_runtime_1.jsx)("h4", { children: extension.name }), (0, jsx_runtime_1.jsxs)("span", { className: "wallet-version", children: ["v", extension.version] })] }), isConnecting && ((0, jsx_runtime_1.jsx)("div", { className: "connecting-spinner", children: "\u27F3" }))] }, extension.identifier))) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "no-wallets", children: [(0, jsx_runtime_1.jsx)("div", { className: "no-wallets-icon", children: "\uD83D\uDD0C" }), (0, jsx_runtime_1.jsx)("h4", { children: "No Wallet Extensions Found" }), (0, jsx_runtime_1.jsx)("p", { children: "Please install a Cardano wallet extension to continue." }), (0, jsx_runtime_1.jsxs)("div", { className: "wallet-links", children: [(0, jsx_runtime_1.jsx)("a", { href: "https://namiwallet.io/", target: "_blank", rel: "noopener noreferrer", className: "wallet-link", children: "Nami Wallet" }), (0, jsx_runtime_1.jsx)("a", { href: "https://eternl.io/", target: "_blank", rel: "noopener noreferrer", className: "wallet-link", children: "Eternl" }), (0, jsx_runtime_1.jsx)("a", { href: "https://flint-wallet.com/", target: "_blank", rel: "noopener noreferrer", className: "wallet-link", children: "Flint" })] })] })) })), isConnecting && ((0, jsx_runtime_1.jsxs)("div", { className: "connection-status", children: [(0, jsx_runtime_1.jsx)("div", { className: "status-spinner", children: "\u27F3" }), (0, jsx_runtime_1.jsx)("span", { children: "Connecting to wallet..." })] }))] }));
};
exports.WalletExtensionManager = WalletExtensionManager;
// Wallet extension utilities
const isWalletExtensionAvailable = (walletId) => {
    try {
        const cardano = window.cardano;
        return !!(cardano && cardano[walletId]);
    }
    catch {
        return false;
    }
};
exports.isWalletExtensionAvailable = isWalletExtensionAvailable;
const getInstalledWallets = () => {
    const supportedWallets = ['nami', 'eternl', 'flint', 'gerowallet', 'yoroi'];
    return supportedWallets.filter(walletId => (0, exports.isWalletExtensionAvailable)(walletId));
};
exports.getInstalledWallets = getInstalledWallets;
const requestWalletAccess = async (walletId) => {
    const cardano = window.cardano;
    if (!cardano || !cardano[walletId]) {
        throw new Error(`Wallet ${walletId} is not available`);
    }
    return await cardano[walletId].enable();
};
exports.requestWalletAccess = requestWalletAccess;
exports.default = exports.WalletExtensionManager;
//# sourceMappingURL=WalletExtensionManager.js.map