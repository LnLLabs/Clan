"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletDelegation = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framework_helpers_1 = require("@clan/framework-helpers");
const Button_1 = require("../../ui/buttons/Button");
const Modal_1 = require("../../ui/modals/Modal");
const WalletDelegation = ({ wallet, delegationInfo, onDelegationChange, onRewardsWithdraw, className = '' }) => {
    const [pools, setPools] = (0, react_1.useState)([]);
    const [filteredPools, setFilteredPools] = (0, react_1.useState)([]);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [selectedPool, setSelectedPool] = (0, react_1.useState)('');
    const [isSearching, setIsSearching] = (0, react_1.useState)(false);
    const [isDelegating, setIsDelegating] = (0, react_1.useState)(false);
    const [isWithdrawing, setIsWithdrawing] = (0, react_1.useState)(false);
    const [showPoolSelector, setShowPoolSelector] = (0, react_1.useState)(false);
    const [showConfirmDialog, setShowConfirmDialog] = (0, react_1.useState)(false);
    // Load popular pools on component mount
    (0, react_1.useEffect)(() => {
        loadPopularPools();
    }, []);
    // Filter pools based on search query
    (0, react_1.useEffect)(() => {
        if (searchQuery.trim() === '') {
            setFilteredPools(pools);
        }
        else {
            const filtered = pools.filter(pool => pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.id.toLowerCase().includes(searchQuery.toLowerCase()));
            setFilteredPools(filtered);
        }
    }, [pools, searchQuery]);
    const loadPopularPools = async () => {
        setIsSearching(true);
        try {
            // Search for popular pools (this would be implemented with actual pool data)
            const popularPoolIds = [
                'pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvyfa000rahe0mvd6',
                'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lk5',
                'pool1jcwn98a6rqr7a7yakanm5sz6asst3adu81e557rt72gv6gycnk2'
            ];
            const poolDetails = await Promise.all(popularPoolIds.map(async (poolId) => {
                const info = await (0, framework_helpers_1.getPoolInfo)(poolId);
                if (info) {
                    return {
                        ...(0, framework_helpers_1.formatPoolInfo)(info),
                        saturation: Math.random() * 100, // Mock saturation data
                    };
                }
                return null;
            }));
            setPools(poolDetails.filter(Boolean));
        }
        catch (error) {
            console.error('Error loading pools:', error);
        }
        finally {
            setIsSearching(false);
        }
    };
    const handlePoolSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim().length < 3)
            return;
        setIsSearching(true);
        try {
            const poolIds = await (0, framework_helpers_1.searchPools)(query);
            if (poolIds.length > 0) {
                const poolDetails = await Promise.all(poolIds.slice(0, 10).map(async (poolId) => {
                    const info = await (0, framework_helpers_1.getPoolInfo)(poolId);
                    if (info) {
                        return {
                            ...(0, framework_helpers_1.formatPoolInfo)(info),
                            saturation: Math.random() * 100, // Mock saturation data
                        };
                    }
                    return null;
                }));
                const validPools = poolDetails.filter(Boolean);
                setPools(validPools);
            }
        }
        catch (error) {
            console.error('Error searching pools:', error);
        }
        finally {
            setIsSearching(false);
        }
    };
    const handleDelegate = async () => {
        if (!selectedPool || isDelegating)
            return;
        setIsDelegating(true);
        try {
            await onDelegationChange?.(selectedPool);
            setShowPoolSelector(false);
            setShowConfirmDialog(false);
            setSelectedPool('');
        }
        catch (error) {
            console.error('Error delegating:', error);
        }
        finally {
            setIsDelegating(false);
        }
    };
    const handleWithdrawRewards = async () => {
        if (isWithdrawing || delegationInfo.rewards <= 0n)
            return;
        setIsWithdrawing(true);
        try {
            await onRewardsWithdraw?.();
        }
        catch (error) {
            console.error('Error withdrawing rewards:', error);
        }
        finally {
            setIsWithdrawing(false);
        }
    };
    const getSaturationColor = (saturation) => {
        if (saturation < 50)
            return 'saturation-low';
        if (saturation < 80)
            return 'saturation-medium';
        return 'saturation-high';
    };
    const formatRewards = (rewards) => {
        return (Number(rewards) / 1000000).toFixed(6);
    };
    const currentPool = pools.find(pool => pool.id === delegationInfo.delegatedPool);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `wallet-delegation ${className}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "delegation-header", children: (0, jsx_runtime_1.jsx)("h2", { children: "Staking Delegation" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "delegation-status", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Current Delegation" }), delegationInfo.delegatedPool ? ((0, jsx_runtime_1.jsxs)("div", { className: "current-pool", children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-info", children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-name", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Pool:" }), (0, jsx_runtime_1.jsx)("span", { className: "value", children: currentPool ? currentPool.name : delegationInfo.delegatedPool.slice(0, 12) + '...' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "pool-ticker", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Ticker:" }), (0, jsx_runtime_1.jsx)("span", { className: "value", children: currentPool?.ticker || 'N/A' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "delegation-details", children: [(0, jsx_runtime_1.jsxs)("div", { className: "active-epoch", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Active Epoch:" }), (0, jsx_runtime_1.jsx)("span", { className: "value", children: delegationInfo.activeEpoch })] }), delegationInfo.nextRewardEpoch && ((0, jsx_runtime_1.jsxs)("div", { className: "next-reward", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Next Reward:" }), (0, jsx_runtime_1.jsxs)("span", { className: "value", children: ["Epoch ", delegationInfo.nextRewardEpoch] })] }))] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "no-delegation", children: [(0, jsx_runtime_1.jsx)("p", { children: "No active delegation" }), (0, jsx_runtime_1.jsx)("span", { className: "delegation-hint", children: "Delegate your stake to earn rewards" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "rewards-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Staking Rewards" }), (0, jsx_runtime_1.jsxs)("div", { className: "rewards-info", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rewards-amount", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Available Rewards:" }), (0, jsx_runtime_1.jsxs)("span", { className: "value", children: [formatRewards(delegationInfo.rewards), " \u20B3"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "rewards-actions", children: (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: handleWithdrawRewards, disabled: isWithdrawing || delegationInfo.rewards <= 0n, size: "sm", children: isWithdrawing ? 'Withdrawing...' : 'Withdraw Rewards' }) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "delegation-actions", children: (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", onClick: () => setShowPoolSelector(true), disabled: isDelegating, children: delegationInfo.delegatedPool ? 'Change Delegation' : 'Delegate Stake' }) }), (0, jsx_runtime_1.jsx)(Modal_1.Modal, { isOpen: showPoolSelector, onClose: () => setShowPoolSelector(false), title: "Select Stake Pool", size: "xl", children: (0, jsx_runtime_1.jsxs)("div", { className: "pool-selector", children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-search", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search pools by name, ticker, or ID...", value: searchQuery, onChange: (e) => handlePoolSearch(e.target.value), className: "pool-search-input" }), isSearching && ((0, jsx_runtime_1.jsx)("div", { className: "search-indicator", children: "Searching..." }))] }), (0, jsx_runtime_1.jsx)("div", { className: "pool-list", children: filteredPools.length > 0 ? (filteredPools.map((pool) => ((0, jsx_runtime_1.jsxs)("div", { className: `pool-option ${selectedPool === pool.id ? 'selected' : ''}`, onClick: () => setSelectedPool(pool.id), children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-main-info", children: [(0, jsx_runtime_1.jsx)("h4", { className: "pool-name", children: pool.name }), (0, jsx_runtime_1.jsxs)("span", { className: "pool-ticker", children: ["[", pool.ticker, "]"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "pool-saturation", children: (0, jsx_runtime_1.jsxs)("span", { className: `saturation-indicator ${getSaturationColor(pool.saturation)}`, children: [pool.saturation.toFixed(1), "% saturated"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "pool-details", children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-id", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Pool ID:" }), (0, jsx_runtime_1.jsxs)("span", { className: "value", children: [pool.id.slice(0, 16), "..."] })] }), pool.isRetiring && ((0, jsx_runtime_1.jsx)("div", { className: "pool-retiring", children: (0, jsx_runtime_1.jsxs)("span", { className: "retiring-warning", children: ["\u26A0\uFE0F Retiring in epoch ", pool.retiringEpoch] }) }))] }), selectedPool === pool.id && ((0, jsx_runtime_1.jsx)("div", { className: "pool-selected-indicator", children: "\u2713 Selected" }))] }, pool.id)))) : ((0, jsx_runtime_1.jsx)("div", { className: "no-pools", children: isSearching ? 'Searching for pools...' : 'No pools found' })) }), (0, jsx_runtime_1.jsxs)("div", { className: "pool-selector-actions", children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: () => setShowPoolSelector(false), children: "Cancel" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", onClick: () => setShowConfirmDialog(true), disabled: !selectedPool, children: "Delegate to Selected Pool" })] })] }) }), (0, jsx_runtime_1.jsx)(Modal_1.Modal, { isOpen: showConfirmDialog, onClose: () => setShowConfirmDialog(false), title: "Confirm Delegation", children: (0, jsx_runtime_1.jsxs)("div", { className: "delegation-confirmation", children: [(0, jsx_runtime_1.jsxs)("div", { className: "confirmation-details", children: [(0, jsx_runtime_1.jsx)("p", { children: "Are you sure you want to delegate your stake to:" }), selectedPool && ((0, jsx_runtime_1.jsxs)("div", { className: "selected-pool-confirm", children: [(0, jsx_runtime_1.jsx)("h4", { children: pools.find(p => p.id === selectedPool)?.name }), (0, jsx_runtime_1.jsxs)("p", { children: ["Ticker: ", pools.find(p => p.id === selectedPool)?.ticker] }), (0, jsx_runtime_1.jsx)("p", { className: "pool-id-confirm", children: selectedPool })] })), (0, jsx_runtime_1.jsx)("div", { className: "delegation-warning", children: (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Note:" }), " This will redelegate all your stake to the selected pool. The change will take effect in the next epoch."] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "confirmation-actions", children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: () => setShowConfirmDialog(false), children: "Cancel" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", onClick: handleDelegate, disabled: isDelegating, children: isDelegating ? 'Delegating...' : 'Confirm Delegation' })] })] }) })] }));
};
exports.WalletDelegation = WalletDelegation;
exports.default = exports.WalletDelegation;
//# sourceMappingURL=WalletDelegation.js.map