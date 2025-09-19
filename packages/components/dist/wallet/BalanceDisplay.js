"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceDisplay = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const BalanceDisplay = ({ balance, loading = false, showZeroBalances = false, formatAssetName, formatAssetValue, className = '' }) => {
    const formatDefaultAssetName = (asset) => {
        if (asset.assetName === '') {
            return 'ADA';
        }
        return asset.assetName;
    };
    const formatDefaultAssetValue = (asset) => {
        // Convert from lovelace to ADA (1 ADA = 1,000,000 lovelace)
        if (asset.assetName === '') {
            return (Number(asset.quantity) / 1000000).toFixed(6);
        }
        return asset.quantity.toString();
    };
    const assets = Object.entries(balance)
        .map(([assetId, quantity]) => {
        const [policyId, assetName] = assetId.split('.');
        return {
            policyId,
            assetName: assetName || '',
            quantity
        };
    })
        .filter(asset => showZeroBalances || Number(asset.quantity) > 0)
        .sort((a, b) => {
        // Sort ADA first, then by quantity descending
        if (a.assetName === '' && b.assetName !== '')
            return -1;
        if (a.assetName !== '' && b.assetName === '')
            return 1;
        return Number(b.quantity) - Number(a.quantity);
    });
    if (loading) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: `animate-pulse ${className}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 rounded w-3/4 mb-2" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 rounded w-1/2" })] }));
    }
    if (assets.length === 0) {
        return ((0, jsx_runtime_1.jsx)("div", { className: `text-gray-500 text-sm ${className}`, children: "No assets found" }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: `space-y-2 ${className}`, children: assets.map((asset, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-medium text-blue-600", children: (formatAssetName || formatDefaultAssetName)(asset).charAt(0).toUpperCase() }) }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium text-gray-900", children: (formatAssetName || formatDefaultAssetName)(asset) })] }), (0, jsx_runtime_1.jsx)("span", { className: "font-mono text-sm text-gray-600", children: (formatAssetValue || formatDefaultAssetValue)(asset) })] }, `${asset.policyId}.${asset.assetName}`))) }));
};
exports.BalanceDisplay = BalanceDisplay;
exports.default = exports.BalanceDisplay;
//# sourceMappingURL=BalanceDisplay.js.map