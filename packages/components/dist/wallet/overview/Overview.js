"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Overview = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TokenElement_1 = require("../token/TokenElement");
const AddressSelect_1 = require("../AddressSelect");
const Overview = ({ wallet, selectedAddress: initialSelectedAddress, onAddressChange, onTokenClick, onSetDefaultAddress, onChangeAddressName, className = '' }) => {
    const [selectedAddress, setSelectedAddress] = (0, react_1.useState)(initialSelectedAddress || '');
    const [defaultAddress, setDefaultAddress] = (0, react_1.useState)('');
    const [fundedAddresses, setFundedAddresses] = (0, react_1.useState)([]);
    const [filter, setFilter] = (0, react_1.useState)(undefined);
    const [search, setSearch] = (0, react_1.useState)('');
    const [isMobile, setIsMobile] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const loadWalletData = async () => {
            try {
                if (wallet.getDefaultAddress && !initialSelectedAddress) {
                    const defaultAddr = await wallet.getDefaultAddress();
                    setDefaultAddress(defaultAddr);
                    setSelectedAddress(defaultAddr);
                }
                if (wallet.getFundedAddress) {
                    const addresses = await wallet.getFundedAddress();
                    setFundedAddresses(addresses);
                }
            }
            catch (error) {
                console.error('Failed to load wallet data:', error);
            }
        };
        loadWalletData();
        const updateWindowDimensions = () => {
            const newIsMobile = window.innerWidth <= 768;
            if (isMobile !== newIsMobile) {
                setIsMobile(newIsMobile);
            }
        };
        window.addEventListener('resize', updateWindowDimensions);
        updateWindowDimensions();
        return () => window.removeEventListener('resize', updateWindowDimensions);
    }, [wallet, isMobile, initialSelectedAddress]);
    const handleAddressChange = (address) => {
        setSelectedAddress(address);
        onAddressChange?.(address);
    };
    const handleTokenClick = (tokenId) => {
        onTokenClick?.(tokenId);
    };
    const getBalance = async () => {
        return await wallet.getBalance();
    };
    const filterTokens = async (tokenId) => {
        const balance = await getBalance();
        const amount = Number(balance[tokenId]);
        // Search filter
        if (search && search.trim() !== '') {
            const searchLower = search.toLowerCase();
            const tokenIdMatch = tokenId.toLowerCase().includes(searchLower);
            // For search, we would need token info, but for now we'll just check tokenId
            if (!tokenIdMatch) {
                return false;
            }
        }
        // Type filter
        if (filter === 'NFTs') {
            return amount === 1; // Assuming NFTs have quantity 1
        }
        else if (filter === 'FTs') {
            return amount > 1 || tokenId.includes('.'); // Assuming FTs have different quantities or are policy.token format
        }
        return true;
    };
    const [tokensRender, setTokensRender] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const renderTokensAsync = async () => {
            const balance = await getBalance();
            const tokenIds = Object.keys(balance);
            if (tokenIds.length === 0) {
                setTokensRender((0, jsx_runtime_1.jsx)("div", { className: "no-tokens-message", children: "No tokens found" }));
                return;
            }
            const filteredTokens = [];
            for (const tokenId of tokenIds) {
                if (await filterTokens(tokenId)) {
                    filteredTokens.push(tokenId);
                }
            }
            if (filteredTokens.length === 0) {
                setTokensRender((0, jsx_runtime_1.jsx)("div", { className: "no-tokens-message", children: filter === 'FTs' ? 'No fungible tokens found' :
                        filter === 'NFTs' ? 'No NFTs found' :
                            'No tokens found' }));
                return;
            }
            setTokensRender((0, jsx_runtime_1.jsx)("div", { className: "overview-tokens-container", children: filteredTokens.map((tokenId, index) => ((0, jsx_runtime_1.jsx)(TokenElement_1.TokenElement, { tokenId: tokenId, amount: Number(balance[tokenId]), filter: filter, search: search, className: "overview-token-container", onClick: () => handleTokenClick(tokenId) }, `${tokenId}-${selectedAddress}-${index}`))) }));
        };
        renderTokensAsync();
    }, [selectedAddress, filter, search]);
    const renderTokens = () => tokensRender;
    return ((0, jsx_runtime_1.jsxs)("div", { className: `overview-container ${className}`, children: [(0, jsx_runtime_1.jsx)("label", { children: (0, jsx_runtime_1.jsx)("h1", { children: "Overview" }) }), fundedAddresses.length > 1 && ((0, jsx_runtime_1.jsx)(AddressSelect_1.AddressSelect, { wallet: wallet, selectedAddress: selectedAddress, onAddressChange: handleAddressChange, onSetDefaultAddress: onSetDefaultAddress, onChangeAddressName: onChangeAddressName })), (0, jsx_runtime_1.jsxs)("div", { className: "overview-buttons-container", children: [(0, jsx_runtime_1.jsx)("button", { className: `overview-tab ${filter === undefined ? 'overview-tab-selected' : ''}`, onClick: () => setFilter(undefined), children: "All" }), (0, jsx_runtime_1.jsx)("button", { className: `overview-tab ${filter === 'FTs' ? 'overview-tab-selected' : ''}`, onClick: () => setFilter('FTs'), children: "FTs" }), (0, jsx_runtime_1.jsx)("button", { className: `overview-tab ${filter === 'NFTs' ? 'overview-tab-selected' : ''}`, onClick: () => setFilter('NFTs'), children: "NFTs" })] }), (0, jsx_runtime_1.jsx)("div", { className: "overview-token-search", children: (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search", value: search, onChange: (e) => setSearch(e.target.value) }) }), renderTokens()] }));
};
exports.Overview = Overview;
exports.default = exports.Overview;
//# sourceMappingURL=Overview.js.map