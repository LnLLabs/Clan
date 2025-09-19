"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingTransaction = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framework_helpers_1 = require("@clan/framework-helpers");
const TokenElement_1 = require("../token/TokenElement");
const PendingTransaction = ({ transaction, wallet, onSign, onRemove, onSubmit, className = '' }) => {
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(false);
    const [isSigning, setIsSigning] = (0, react_1.useState)(false);
    const [signatures, setSignatures] = (0, react_1.useState)(transaction.signatures);
    // Calculate signature status
    const signedCount = Object.keys(signatures).length;
    const requiredCount = transaction.requiredSigners.length;
    const isFullySigned = signedCount >= requiredCount;
    // Calculate transaction balance (simplified)
    const getTransactionBalance = () => {
        // This would be calculated from transaction inputs/outputs
        // For now, return a placeholder
        return {
            ada: 0,
            tokens: {}
        };
    };
    const handleSign = async () => {
        if (!wallet)
            return;
        setIsSigning(true);
        try {
            // This would integrate with the wallet's signing functionality
            // For now, this is a placeholder
            const signature = await wallet.signTransaction(transaction.transaction);
            const newSignatures = { ...signatures, [wallet.getName()]: signature };
            setSignatures(newSignatures);
            onSign?.(signature);
            (0, framework_helpers_1.showInfo)('Transaction signed successfully');
        }
        catch (error) {
            (0, framework_helpers_1.showError)('Failed to sign transaction');
            console.error('Signing error:', error);
        }
        finally {
            setIsSigning(false);
        }
    };
    const handleCopyTxId = () => {
        (0, framework_helpers_1.copyToClipboard)(transaction.id);
        (0, framework_helpers_1.showInfo)('Transaction ID copied to clipboard');
    };
    const handleCopyTransaction = () => {
        // This would copy the transaction CBOR
        (0, framework_helpers_1.copyToClipboard)(JSON.stringify(transaction.transaction));
        (0, framework_helpers_1.showInfo)('Transaction data copied to clipboard');
    };
    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        if (diffInMinutes < 1)
            return 'Just now';
        if (diffInMinutes < 60)
            return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24)
            return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };
    const balance = getTransactionBalance();
    return ((0, jsx_runtime_1.jsxs)("div", { className: `pending-transaction ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "pending-transaction-header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "transaction-info", children: [(0, jsx_runtime_1.jsx)("div", { className: "transaction-type", children: "Pending Transaction" }), (0, jsx_runtime_1.jsxs)("div", { className: "transaction-id", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "TxID:" }), (0, jsx_runtime_1.jsxs)("span", { className: "value", children: [transaction.id.slice(0, 16), "..."] }), (0, jsx_runtime_1.jsx)("button", { className: "copy-button", onClick: handleCopyTxId, title: "Copy Transaction ID", children: "\uD83D\uDCCB" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "transaction-time", children: ["Created ", formatTimeAgo(transaction.createdAt)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "transaction-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "expand-button", onClick: () => setIsExpanded(!isExpanded), children: isExpanded ? '▼' : '▶' }), (0, jsx_runtime_1.jsx)("button", { className: "copy-button", onClick: handleCopyTransaction, title: "Copy Transaction Data", children: "\uD83D\uDCCB" }), onRemove && ((0, jsx_runtime_1.jsx)("button", { className: "remove-button", onClick: onRemove, title: "Remove Transaction", children: "\u2715" }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "transaction-balance", children: [(0, jsx_runtime_1.jsx)("div", { className: "balance-ada", children: (0, jsx_runtime_1.jsxs)("span", { className: `amount ${balance.ada >= 0 ? 'positive' : 'negative'}`, children: [balance.ada >= 0 ? '+' : '', (balance.ada / 1000000).toFixed(6), " \u20B3"] }) }), (0, jsx_runtime_1.jsx)("div", { className: "balance-tokens", children: Object.keys(balance.tokens).map((tokenId) => ((0, jsx_runtime_1.jsx)(TokenElement_1.TokenElement, { tokenId: tokenId, amount: Number(balance.tokens[tokenId]), className: "balance-token" }, tokenId))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "signature-status", children: [(0, jsx_runtime_1.jsxs)("div", { className: "signature-count", children: ["Signatures: ", signedCount, " / ", requiredCount] }), (0, jsx_runtime_1.jsx)("div", { className: "signature-progress", children: (0, jsx_runtime_1.jsx)("div", { className: "progress-bar", style: { width: `${(signedCount / requiredCount) * 100}%` } }) }), isFullySigned && ((0, jsx_runtime_1.jsx)("div", { className: "fully-signed-badge", children: "\u2713 Fully Signed" }))] }), isExpanded && ((0, jsx_runtime_1.jsxs)("div", { className: "transaction-details", children: [(0, jsx_runtime_1.jsxs)("div", { className: "signers-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Required Signers" }), (0, jsx_runtime_1.jsx)("div", { className: "signers-list", children: transaction.requiredSigners.map((signer, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "signer-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "signer-name", children: signer }), signatures[signer] ? ((0, jsx_runtime_1.jsx)("span", { className: "signer-status signed", children: "\u2713 Signed" })) : ((0, jsx_runtime_1.jsx)("span", { className: "signer-status pending", children: "\u23F3 Pending" }))] }, index))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "transaction-actions-expanded", children: [!isFullySigned && ((0, jsx_runtime_1.jsx)("button", { className: "sign-button", onClick: handleSign, disabled: isSigning, children: isSigning ? 'Signing...' : 'Sign Transaction' })), isFullySigned && onSubmit && ((0, jsx_runtime_1.jsx)("button", { className: "submit-button", onClick: onSubmit, children: "Submit Transaction" }))] }), transaction.expiresAt && transaction.expiresAt < new Date() && ((0, jsx_runtime_1.jsx)("div", { className: "expiration-warning", children: "\u26A0\uFE0F This transaction has expired" }))] }))] }));
};
exports.PendingTransaction = PendingTransaction;
exports.default = exports.PendingTransaction;
//# sourceMappingURL=PendingTransaction.js.map