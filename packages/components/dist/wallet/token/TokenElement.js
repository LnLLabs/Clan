"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenElement = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const framework_helpers_1 = require("@clan/framework-helpers");
const TokenElement = ({ tokenId, amount, filter, search, className = '', expanded = false, index, onClick, onImageClick }) => {
    const [showTooltip, setShowTooltip] = react_1.default.useState(false);
    const { tokenInfo, loading, error } = (0, framework_helpers_1.useTokenInfo)(tokenId);
    const handleThumbnailClick = (e) => {
        e.stopPropagation();
        onImageClick?.(tokenId);
    };
    const handleClick = () => {
        onClick?.(tokenId);
    };
    // Search filter
    if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        const tokenIdMatch = tokenId.toLowerCase().includes(searchLower);
        const nameMatch = tokenInfo?.name?.toLowerCase().includes(searchLower);
        const fingerprintMatch = tokenInfo?.fingerprint?.toLowerCase().includes(searchLower);
        if (!tokenIdMatch && !nameMatch && !fingerprintMatch) {
            return null;
        }
    }
    // Filter by type
    if (filter === 'NFTs' && tokenInfo && !tokenInfo.isNft) {
        return null;
    }
    else if (filter === 'FTs' && tokenInfo && tokenInfo.isNft) {
        return null;
    }
    if (loading) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: `token-element-loading ${className}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "token-thumbnail-skeleton" }), (0, jsx_runtime_1.jsxs)("div", { className: "token-info-skeleton", children: [(0, jsx_runtime_1.jsx)("div", { className: "token-name-skeleton" }), (0, jsx_runtime_1.jsx)("div", { className: "token-amount-skeleton" })] })] }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsx)("div", { className: `token-element-error ${className}`, children: (0, jsx_runtime_1.jsx)("span", { children: "Error loading token info" }) }));
    }
    const displayAmount = tokenInfo?.decimals
        ? amount / Math.pow(10, tokenInfo.decimals)
        : amount;
    const tooltipInfo = ((0, jsx_runtime_1.jsxs)("div", { className: "token-tooltip", children: [(0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("a", { href: `https://cexplorer.io/asset/${tokenId}`, target: "_blank", rel: "noopener noreferrer", children: tokenId }), (0, jsx_runtime_1.jsx)("br", {})] }), (0, jsx_runtime_1.jsx)("span", { children: tokenInfo?.fingerprint })] }));
    return ((0, jsx_runtime_1.jsx)("div", { className: className, children: (0, jsx_runtime_1.jsxs)("div", { className: "token-element-wrapper", onMouseEnter: () => setShowTooltip(true), onMouseLeave: () => setShowTooltip(false), children: [(0, jsx_runtime_1.jsxs)("div", { className: "token-element", onClick: handleClick, children: [(0, jsx_runtime_1.jsx)("img", { className: "token-thumbnail", src: tokenInfo?.image || '/assets/token.svg', alt: tokenInfo?.name || 'Token', onClick: handleThumbnailClick }), (0, jsx_runtime_1.jsxs)("div", { className: "token-element-text", children: [(0, jsx_runtime_1.jsx)("div", { className: (tokenInfo?.name && tokenInfo.name.length > 20) ? 'scroll-container' : '', children: (0, jsx_runtime_1.jsx)("span", { className: "token-element-name", children: tokenInfo?.name || tokenId.slice(-8) }) }), !tokenInfo?.isNft && ((0, jsx_runtime_1.jsx)("span", { className: `token-element-amount ${amount > 0 ? 'positive' : 'negative'}`, children: displayAmount.toString() }))] })] }), (showTooltip || expanded) && ((0, jsx_runtime_1.jsx)("div", { className: "token-element-tooltip", children: tooltipInfo }))] }) }, index));
};
exports.TokenElement = TokenElement;
exports.default = exports.TokenElement;
//# sourceMappingURL=TokenElement.js.map