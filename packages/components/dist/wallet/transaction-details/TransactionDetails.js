"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionDetails = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TokenElement_1 = require("../token/TokenElement");
const framework_helpers_1 = require("@clan/framework-helpers");
const TransactionDetails = ({ transaction, walletAddress, onClose, className = '' }) => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    const isAddressMine = (address) => {
        return walletAddress ? address === walletAddress : false;
    };
    const formatAmount = (assets) => {
        const adaAmount = assets['lovelace'] ? Number(assets['lovelace']) / 1000000 : 0;
        const tokens = { ...assets };
        delete tokens['lovelace'];
        return { ada: adaAmount, tokens };
    };
    const copyToClipboardHandler = (text, label) => {
        (0, framework_helpers_1.copyToClipboard)(text);
        (0, framework_helpers_1.showInfo)(`${label} copied to clipboard`);
    };
    const renderOverview = () => {
        const totalInputs = transaction.inputs?.length || 0;
        const totalOutputs = transaction.outputs?.length || 0;
        // Calculate total amounts (simplified)
        const totalInputAda = transaction.inputs?.reduce((sum, input) => {
            return sum + (input.assets['lovelace'] ? Number(input.assets['lovelace']) / 1000000 : 0);
        }, 0) || 0;
        const totalOutputAda = transaction.outputs?.reduce((sum, output) => {
            const amount = formatAmount(output.assets);
            return sum + amount.ada;
        }, 0) || 0;
        const fee = totalInputAda - totalOutputAda;
        return ((0, jsx_runtime_1.jsx)("div", { className: "transaction-overview", children: (0, jsx_runtime_1.jsxs)("div", { className: "overview-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "overview-item", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Transaction Hash" }), (0, jsx_runtime_1.jsxs)("div", { className: "hash-display", children: [(0, jsx_runtime_1.jsxs)("span", { className: "hash-text", children: [transaction.hash.slice(0, 32), "..."] }), (0, jsx_runtime_1.jsx)("button", { className: "copy-btn", onClick: () => copyToClipboardHandler(transaction.hash, 'Transaction hash'), children: "\uD83D\uDCCB" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "overview-item", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Structure" }), (0, jsx_runtime_1.jsxs)("div", { className: "structure-info", children: [(0, jsx_runtime_1.jsxs)("span", { children: [totalInputs, " input", totalInputs !== 1 ? 's' : ''] }), (0, jsx_runtime_1.jsx)("span", { children: "\u2192" }), (0, jsx_runtime_1.jsxs)("span", { children: [totalOutputs, " output", totalOutputs !== 1 ? 's' : ''] })] })] }), transaction.fee && ((0, jsx_runtime_1.jsxs)("div", { className: "overview-item", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Fee" }), (0, jsx_runtime_1.jsxs)("span", { className: "fee-amount", children: [(Number(transaction.fee) / 1000000).toFixed(6), " \u20B3"] })] })), transaction.metadata && ((0, jsx_runtime_1.jsxs)("div", { className: "overview-item", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Metadata" }), (0, jsx_runtime_1.jsx)("span", { className: "metadata-indicator", children: "Present" })] }))] }) }));
    };
    const renderInputs = () => {
        if (!transaction.inputs || transaction.inputs.length === 0) {
            return (0, jsx_runtime_1.jsx)("div", { className: "empty-state", children: "No inputs found" });
        }
        return ((0, jsx_runtime_1.jsx)("div", { className: "transaction-inputs", children: transaction.inputs.map((input, index) => {
                const amount = formatAmount(input.assets);
                return ((0, jsx_runtime_1.jsxs)("div", { className: "input-item", children: [(0, jsx_runtime_1.jsxs)("div", { className: "input-header", children: [(0, jsx_runtime_1.jsxs)("span", { className: "input-index", children: ["Input #", index + 1] }), (0, jsx_runtime_1.jsx)("span", { className: `address-type ${isAddressMine(input.address) ? 'mine' : 'external'}`, children: isAddressMine(input.address) ? 'Mine' : 'External' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "input-address", children: [(0, jsx_runtime_1.jsx)("span", { className: "address-label", children: "Address:" }), (0, jsx_runtime_1.jsxs)("div", { className: "address-display", children: [(0, jsx_runtime_1.jsx)("span", { className: "address-text", children: (0, framework_helpers_1.formatAddress)(input.address) }), (0, jsx_runtime_1.jsx)("button", { className: "copy-btn", onClick: () => copyToClipboardHandler(input.address, 'Address'), children: "\uD83D\uDCCB" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "input-reference", children: [(0, jsx_runtime_1.jsx)("span", { className: "ref-label", children: "Reference:" }), (0, jsx_runtime_1.jsxs)("div", { className: "reference-display", children: [(0, jsx_runtime_1.jsxs)("span", { className: "ref-text", children: [input.txHash.slice(0, 16), "...#", input.outputIndex] }), (0, jsx_runtime_1.jsx)("button", { className: "copy-btn", onClick: () => copyToClipboardHandler(input.txHash, 'Transaction hash'), children: "\uD83D\uDCCB" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "input-assets", children: [(0, jsx_runtime_1.jsx)("div", { className: "asset-ada", children: (0, jsx_runtime_1.jsxs)("span", { className: "ada-amount", children: [amount.ada.toFixed(6), " \u20B3"] }) }), Object.keys(amount.tokens).length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "asset-tokens", children: Object.keys(amount.tokens).map((tokenId) => ((0, jsx_runtime_1.jsx)(TokenElement_1.TokenElement, { tokenId: tokenId, amount: Number(amount.tokens[tokenId]), className: "input-token" }, tokenId))) }))] }), input.datum && ((0, jsx_runtime_1.jsx)("div", { className: "input-datum", children: (0, jsx_runtime_1.jsxs)("details", { children: [(0, jsx_runtime_1.jsx)("summary", { children: "Datum" }), (0, jsx_runtime_1.jsx)("pre", { className: "datum-content", children: typeof input.datum === 'string'
                                            ? input.datum
                                            : JSON.stringify(input.datum, null, 2) })] }) }))] }, `${input.txHash}-${input.outputIndex}`));
            }) }));
    };
    const renderOutputs = () => {
        if (!transaction.outputs || transaction.outputs.length === 0) {
            return (0, jsx_runtime_1.jsx)("div", { className: "empty-state", children: "No outputs found" });
        }
        return ((0, jsx_runtime_1.jsx)("div", { className: "transaction-outputs", children: transaction.outputs.map((output, index) => {
                const amount = formatAmount(output.assets);
                return ((0, jsx_runtime_1.jsxs)("div", { className: "output-item", children: [(0, jsx_runtime_1.jsxs)("div", { className: "output-header", children: [(0, jsx_runtime_1.jsxs)("span", { className: "output-index", children: ["Output #", index + 1] }), (0, jsx_runtime_1.jsx)("span", { className: `address-type ${isAddressMine(output.address) ? 'mine' : 'external'}`, children: isAddressMine(output.address) ? 'Mine' : 'External' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "output-address", children: [(0, jsx_runtime_1.jsx)("span", { className: "address-label", children: "Address:" }), (0, jsx_runtime_1.jsxs)("div", { className: "address-display", children: [(0, jsx_runtime_1.jsx)("span", { className: "address-text", children: (0, framework_helpers_1.formatAddress)(output.address) }), (0, jsx_runtime_1.jsx)("button", { className: "copy-btn", onClick: () => copyToClipboardHandler(output.address, 'Address'), children: "\uD83D\uDCCB" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "output-assets", children: [(0, jsx_runtime_1.jsx)("div", { className: "asset-ada", children: (0, jsx_runtime_1.jsxs)("span", { className: "ada-amount", children: [amount.ada.toFixed(6), " \u20B3"] }) }), Object.keys(amount.tokens).length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "asset-tokens", children: Object.keys(amount.tokens).map((tokenId) => ((0, jsx_runtime_1.jsx)(TokenElement_1.TokenElement, { tokenId: tokenId, amount: Number(amount.tokens[tokenId]), className: "output-token" }, tokenId))) }))] }), output.datum && ((0, jsx_runtime_1.jsx)("div", { className: "output-datum", children: (0, jsx_runtime_1.jsxs)("details", { children: [(0, jsx_runtime_1.jsx)("summary", { children: "Datum" }), (0, jsx_runtime_1.jsx)("pre", { className: "datum-content", children: typeof output.datum === 'string'
                                            ? output.datum
                                            : JSON.stringify(output.datum, null, 2) })] }) })), output.datumHash && ((0, jsx_runtime_1.jsxs)("div", { className: "output-datum-hash", children: [(0, jsx_runtime_1.jsx)("span", { className: "datum-hash-label", children: "Datum Hash:" }), (0, jsx_runtime_1.jsxs)("div", { className: "datum-hash-display", children: [(0, jsx_runtime_1.jsx)("span", { className: "datum-hash-text", children: output.datumHash }), (0, jsx_runtime_1.jsx)("button", { className: "copy-btn", onClick: () => copyToClipboardHandler(output.datumHash, 'Datum hash'), children: "\uD83D\uDCCB" })] })] }))] }, index));
            }) }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `transaction-details ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "details-header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Transaction Details" }), onClose && ((0, jsx_runtime_1.jsx)("button", { className: "close-btn", onClick: onClose, children: "\u2715" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "details-tabs", children: [(0, jsx_runtime_1.jsx)("button", { className: `tab-btn ${activeTab === 'overview' ? 'active' : ''}`, onClick: () => setActiveTab('overview'), children: "Overview" }), (0, jsx_runtime_1.jsxs)("button", { className: `tab-btn ${activeTab === 'inputs' ? 'active' : ''}`, onClick: () => setActiveTab('inputs'), children: ["Inputs (", transaction.inputs?.length || 0, ")"] }), (0, jsx_runtime_1.jsxs)("button", { className: `tab-btn ${activeTab === 'outputs' ? 'active' : ''}`, onClick: () => setActiveTab('outputs'), children: ["Outputs (", transaction.outputs?.length || 0, ")"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "details-content", children: [activeTab === 'overview' && renderOverview(), activeTab === 'inputs' && renderInputs(), activeTab === 'outputs' && renderOutputs()] })] }));
};
exports.TransactionDetails = TransactionDetails;
exports.default = exports.TransactionDetails;
//# sourceMappingURL=TransactionDetails.js.map