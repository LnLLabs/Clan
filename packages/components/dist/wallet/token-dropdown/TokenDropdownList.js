"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDropdownList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TokenElement_1 = require("../token/TokenElement");
const TokenDropdownList = ({ balances, onTokenSelect, excludeTokens = [], placeholder = 'Search', className = '' }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [search, setSearch] = (0, react_1.useState)('');
    const [hovering, setHovering] = (0, react_1.useState)('');
    const handleClick = (tokenId) => {
        onTokenSelect(tokenId);
        setIsOpen(false);
        setSearch('');
    };
    const filteredTokens = Object.keys(balances)
        .filter(tokenId => tokenId !== 'lovelace') // Exclude ADA by default
        .filter(tokenId => !excludeTokens.includes(tokenId))
        .filter(tokenId => {
        if (!search.trim())
            return true;
        const searchLower = search.toLowerCase();
        return tokenId.toLowerCase().includes(searchLower);
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: `token-list-wrapper ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { onMouseEnter: () => setHovering('addToken'), onMouseLeave: () => setHovering(''), onClick: () => setIsOpen(!isOpen), className: "icon-wrapper token-icon-button", children: [(0, jsx_runtime_1.jsx)("svg", { className: "icon", viewBox: "0 0 24 24", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }) }), hovering === 'addToken' && ((0, jsx_runtime_1.jsx)("label", { className: "icon-label", children: "Add Token" })), (0, jsx_runtime_1.jsx)("br", {})] }), isOpen && ((0, jsx_runtime_1.jsxs)("div", { className: "token-dropdown-menu", children: [(0, jsx_runtime_1.jsx)("div", { className: "token-search", children: (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, placeholder: placeholder, onChange: (e) => setSearch(e.target.value), className: "search-input" }) }), (0, jsx_runtime_1.jsx)("div", { className: "token-list", children: filteredTokens.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "no-tokens", children: search ? 'No tokens found' : 'No tokens available' })) : (filteredTokens.map((tokenId, index) => ((0, jsx_runtime_1.jsx)("div", { onClick: () => handleClick(tokenId), className: "token-list-item", children: (0, jsx_runtime_1.jsx)(TokenElement_1.TokenElement, { tokenId: tokenId, amount: Number(balances[tokenId]), className: "dropdown-token-element", expanded: false }) }, `${tokenId}-${index}`)))) })] }))] }));
};
exports.TokenDropdownList = TokenDropdownList;
exports.default = exports.TokenDropdownList;
//# sourceMappingURL=TokenDropdownList.js.map