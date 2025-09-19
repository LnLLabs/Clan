"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolElement = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Button_1 = require("../../ui/buttons/Button");
const PoolElement = ({ pool, onDelegate, onViewDetails, isSelected = false, showDelegateButton = true, showDetailsButton = true, compact = false, className = '' }) => {
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(false);
    // Format pool information for display
    const formatPoolName = (pool) => {
        return pool.meta_json?.name || pool.pool_id_bech32.slice(0, 12) + '...';
    };
    const formatTicker = (pool) => {
        return pool.meta_json?.ticker || 'N/A';
    };
    const formatDescription = (pool) => {
        return pool.meta_json?.description || 'No description available';
    };
    const formatFixedCost = (cost) => {
        return (parseFloat(cost) / 1000000).toFixed(6) + ' ₳';
    };
    const formatPledge = (pledge) => {
        return (parseFloat(pledge) / 1000000000).toFixed(2) + ' ₳';
    };
    // Mock data for additional metrics (would come from pool metrics API)
    const getSaturation = () => {
        return Math.floor(Math.random() * 100);
    };
    const getPerformance = () => {
        return Math.floor(Math.random() * 100);
    };
    const getBlocksProduced = () => {
        return Math.floor(Math.random() * 1000);
    };
    const getSaturationColor = (saturation) => {
        if (saturation < 50)
            return 'saturation-low';
        if (saturation < 80)
            return 'saturation-medium';
        return 'saturation-high';
    };
    const getPerformanceColor = (performance) => {
        if (performance < 60)
            return 'performance-low';
        if (performance < 85)
            return 'performance-medium';
        return 'performance-high';
    };
    const saturation = getSaturation();
    const performance = getPerformance();
    const blocksProduced = getBlocksProduced();
    if (compact) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: `pool-element compact ${isSelected ? 'selected' : ''} ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "pool-name", children: formatPoolName(pool) }), (0, jsx_runtime_1.jsxs)("div", { className: "pool-ticker", children: ["[", formatTicker(pool), "]"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "pool-metrics", children: [(0, jsx_runtime_1.jsxs)("div", { className: "metric", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Saturation:" }), (0, jsx_runtime_1.jsxs)("span", { className: `value ${getSaturationColor(saturation)}`, children: [saturation, "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Performance:" }), (0, jsx_runtime_1.jsxs)("span", { className: `value ${getPerformanceColor(performance)}`, children: [performance, "%"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "pool-actions", children: [showDelegateButton && ((0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", size: "sm", onClick: () => onDelegate?.(pool.pool_id_bech32), children: "Delegate" })), showDetailsButton && ((0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", size: "sm", onClick: () => onViewDetails?.(pool.pool_id_bech32), children: "Details" }))] })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: `pool-element ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''} ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-header", onClick: () => setIsExpanded(!isExpanded), children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-main-info", children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-name-section", children: [(0, jsx_runtime_1.jsx)("h3", { className: "pool-name", children: formatPoolName(pool) }), (0, jsx_runtime_1.jsxs)("span", { className: "pool-ticker", children: ["[", formatTicker(pool), "]"] }), pool.retiring_epoch && ((0, jsx_runtime_1.jsx)("span", { className: "pool-retiring-badge", children: "Retiring" }))] }), (0, jsx_runtime_1.jsx)("div", { className: "pool-expand-toggle", children: isExpanded ? '▼' : '▶' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "pool-quick-metrics", children: [(0, jsx_runtime_1.jsxs)("div", { className: "metric-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-label", children: "Saturation" }), (0, jsx_runtime_1.jsxs)("span", { className: `metric-value ${getSaturationColor(saturation)}`, children: [saturation, "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-label", children: "Performance" }), (0, jsx_runtime_1.jsxs)("span", { className: `metric-value ${getPerformanceColor(performance)}`, children: [performance, "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-label", children: "Blocks" }), (0, jsx_runtime_1.jsx)("span", { className: "metric-value", children: blocksProduced })] })] })] }), isExpanded && ((0, jsx_runtime_1.jsxs)("div", { className: "pool-details", children: [(0, jsx_runtime_1.jsxs)("div", { className: "pool-description", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Description" }), (0, jsx_runtime_1.jsx)("p", { children: formatDescription(pool) }), pool.meta_json?.homepage && ((0, jsx_runtime_1.jsx)("a", { href: pool.meta_json.homepage, target: "_blank", rel: "noopener noreferrer", className: "pool-website", children: "Visit Website \u2192" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "pool-metrics-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "metric-card", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Saturation" }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-visual", children: [(0, jsx_runtime_1.jsx)("div", { className: `saturation-bar ${getSaturationColor(saturation)}`, style: { width: `${saturation}%` } }), (0, jsx_runtime_1.jsxs)("span", { className: "metric-percentage", children: [saturation, "%"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-card", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Performance" }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-visual", children: [(0, jsx_runtime_1.jsx)("div", { className: `performance-bar ${getPerformanceColor(performance)}`, style: { width: `${performance}%` } }), (0, jsx_runtime_1.jsxs)("span", { className: "metric-percentage", children: [performance, "%"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-card", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Blocks Produced" }), (0, jsx_runtime_1.jsx)("div", { className: "metric-value-large", children: blocksProduced })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "pool-info-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "info-label", children: "Pool ID:" }), (0, jsx_runtime_1.jsx)("span", { className: "info-value pool-id", children: pool.pool_id_bech32 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "info-label", children: "Fixed Cost:" }), (0, jsx_runtime_1.jsx)("span", { className: "info-value", children: formatFixedCost(pool.fixed_cost) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "info-label", children: "Pledge:" }), (0, jsx_runtime_1.jsx)("span", { className: "info-value", children: formatPledge(pool.pledge) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "info-label", children: "Margin:" }), (0, jsx_runtime_1.jsxs)("span", { className: "info-value", children: [(pool.margin * 100).toFixed(2), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "info-label", children: "Active Epoch:" }), (0, jsx_runtime_1.jsx)("span", { className: "info-value", children: pool.active_epoch_no })] }), pool.retiring_epoch && ((0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "info-label", children: "Retiring Epoch:" }), (0, jsx_runtime_1.jsx)("span", { className: "info-value retiring", children: pool.retiring_epoch })] }))] }), pool.owners && pool.owners.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "pool-owners", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Pool Owners" }), (0, jsx_runtime_1.jsx)("div", { className: "owners-list", children: pool.owners.map((owner, index) => ((0, jsx_runtime_1.jsxs)("span", { className: "owner-address", children: [owner.slice(0, 16), "..."] }, index))) })] })), pool.relays && pool.relays.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "pool-relays", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Pool Relays" }), (0, jsx_runtime_1.jsxs)("div", { className: "relays-list", children: [pool.relays.slice(0, 3).map((relay, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "relay-item", children: [relay.ipv4 && (0, jsx_runtime_1.jsx)("span", { className: "relay-ip", children: relay.ipv4 }), relay.ipv6 && (0, jsx_runtime_1.jsx)("span", { className: "relay-ip", children: relay.ipv6 }), relay.port && (0, jsx_runtime_1.jsxs)("span", { className: "relay-port", children: [":", relay.port] })] }, index))), pool.relays.length > 3 && ((0, jsx_runtime_1.jsxs)("span", { className: "more-relays", children: ["+", pool.relays.length - 3, " more"] }))] })] }))] })), (0, jsx_runtime_1.jsxs)("div", { className: "pool-actions", children: [showDelegateButton && ((0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", onClick: () => onDelegate?.(pool.pool_id_bech32), disabled: !!pool.retiring_epoch, children: pool.retiring_epoch ? 'Pool Retiring' : 'Delegate Stake' })), showDetailsButton && ((0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: () => onViewDetails?.(pool.pool_id_bech32), children: "View Details" }))] }), isSelected && ((0, jsx_runtime_1.jsx)("div", { className: "selection-indicator", children: "\u2713 Selected" }))] }));
};
exports.PoolElement = PoolElement;
exports.default = exports.PoolElement;
//# sourceMappingURL=PoolElement.js.map