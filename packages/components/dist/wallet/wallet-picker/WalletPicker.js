"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletPicker = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Modal_1 = require("../../ui/modals/Modal");
const WalletPicker = ({ isOpen, onClose, onWalletSelect, title = 'Select Wallet', supportedWallets, excludeWallets = ['ccvault', 'typhoncip30'], className = '' }) => {
    const [availableWallets, setAvailableWallets] = (0, react_1.useState)([]);
    const [connectingWallet, setConnectingWallet] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    // Get available wallet extensions
    (0, react_1.useEffect)(() => {
        const getAvailableWallets = async () => {
            if (!isOpen || !window.cardano)
                return;
            try {
                const wallets = [];
                for (const [walletName, walletApi] of Object.entries(window.cardano)) {
                    // Skip excluded wallets
                    if (excludeWallets.includes(walletName))
                        continue;
                    // Check if wallet is supported (if filter provided)
                    if (supportedWallets && !supportedWallets.includes(walletName))
                        continue;
                    // Check if wallet has required properties
                    if (walletApi && typeof walletApi === 'object' && 'icon' in walletApi && walletApi.icon) {
                        wallets.push({
                            name: walletName,
                            icon: String(walletApi.icon),
                            apiVersion: walletApi.apiVersion || '1.0.0',
                            enable: walletApi.enable,
                            isEnabled: walletApi.isEnabled
                        });
                    }
                }
                setAvailableWallets(wallets);
            }
            catch (err) {
                console.error('Error getting available wallets:', err);
                setError('Failed to load wallet extensions');
            }
        };
        getAvailableWallets();
    }, [isOpen, supportedWallets, excludeWallets]);
    const handleWalletSelect = async (wallet) => {
        try {
            setConnectingWallet(wallet.name);
            setError(null);
            // Enable the wallet
            const walletApi = await wallet.enable();
            // Call the selection callback
            onWalletSelect(wallet.name, walletApi);
            // Close the modal
            onClose();
        }
        catch (err) {
            console.error('Error connecting to wallet:', err);
            setError(err instanceof Error ? err.message : 'Failed to connect to wallet');
        }
        finally {
            setConnectingWallet(null);
        }
    };
    const handleClose = () => {
        setError(null);
        setConnectingWallet(null);
        onClose();
    };
    return ((0, jsx_runtime_1.jsx)(Modal_1.Modal, { isOpen: isOpen, onClose: handleClose, title: title, size: "md", className: className, children: (0, jsx_runtime_1.jsxs)("div", { className: "wallet-picker", children: [error && ((0, jsx_runtime_1.jsx)("div", { className: "wallet-picker-error", children: (0, jsx_runtime_1.jsx)("p", { children: error }) })), availableWallets.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "wallet-picker-empty", children: (0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("svg", { className: "empty-icon", viewBox: "0 0 24 24", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }) }), (0, jsx_runtime_1.jsx)("h3", { children: "No wallets found" }), (0, jsx_runtime_1.jsx)("p", { children: "Please install a Cardano wallet extension to continue" }), (0, jsx_runtime_1.jsx)("a", { href: "https://docs.cardano.org/new-to-cardano/getting-started-wallet/", target: "_blank", rel: "noopener noreferrer", className: "wallet-info-link", children: "Learn about Cardano wallets" })] }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "wallet-picker-grid", children: availableWallets.map((wallet) => ((0, jsx_runtime_1.jsx)("div", { className: "wallet-option", children: (0, jsx_runtime_1.jsx)("button", { className: "wallet-option-button", onClick: () => handleWalletSelect(wallet), disabled: connectingWallet === wallet.name, children: (0, jsx_runtime_1.jsxs)("div", { className: "wallet-option-content", children: [(0, jsx_runtime_1.jsx)("img", { src: wallet.icon, alt: `${wallet.name} wallet`, className: "wallet-icon" }), (0, jsx_runtime_1.jsxs)("div", { className: "wallet-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "wallet-name", children: wallet.name }), (0, jsx_runtime_1.jsxs)("span", { className: "wallet-version", children: ["v", wallet.apiVersion] })] }), connectingWallet === wallet.name && ((0, jsx_runtime_1.jsxs)("div", { className: "connecting-indicator", children: [(0, jsx_runtime_1.jsx)("svg", { className: "spinner", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none", strokeDasharray: "31.416", strokeDashoffset: "31.416", children: (0, jsx_runtime_1.jsx)("animateTransform", { attributeName: "transform", type: "rotate", from: "0 12 12", to: "360 12 12", dur: "1s", repeatCount: "indefinite" }) }) }), (0, jsx_runtime_1.jsx)("span", { children: "Connecting..." })] }))] }) }) }, wallet.name))) })), (0, jsx_runtime_1.jsx)("div", { className: "wallet-picker-footer", children: (0, jsx_runtime_1.jsx)("p", { className: "wallet-picker-note", children: "Make sure your wallet is unlocked and has access to the current domain." }) })] }) }));
};
exports.WalletPicker = WalletPicker;
exports.default = exports.WalletPicker;
//# sourceMappingURL=WalletPicker.js.map