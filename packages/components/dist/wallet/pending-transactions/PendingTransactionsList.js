"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingTransactionsList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const PendingTransaction_1 = require("./PendingTransaction");
const PendingTransactionsList = ({ transactions, wallet, onSignTransaction, onRemoveTransaction, onSubmitTransaction, className = '', emptyMessage = 'No pending transactions' }) => {
    const handleSign = (transactionId, signature) => {
        onSignTransaction?.(transactionId, signature);
    };
    const handleRemove = (transactionId) => {
        onRemoveTransaction?.(transactionId);
    };
    const handleSubmit = (transactionId) => {
        onSubmitTransaction?.(transactionId);
    };
    if (transactions.length === 0) {
        return ((0, jsx_runtime_1.jsx)("div", { className: `pending-transactions-empty ${className}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("div", { className: "empty-icon", children: "\uD83D\uDCDD" }), (0, jsx_runtime_1.jsx)("h3", { children: "No Pending Transactions" }), (0, jsx_runtime_1.jsx)("p", { children: emptyMessage })] }) }));
    }
    // Sort transactions by creation date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return ((0, jsx_runtime_1.jsxs)("div", { className: `pending-transactions-list ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "list-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Pending Transactions" }), (0, jsx_runtime_1.jsxs)("span", { className: "transaction-count", children: [transactions.length, " transaction", transactions.length !== 1 ? 's' : ''] })] }), (0, jsx_runtime_1.jsx)("div", { className: "transactions-container", children: sortedTransactions.map((transaction) => ((0, jsx_runtime_1.jsx)(PendingTransaction_1.PendingTransaction, { transaction: transaction, wallet: wallet, onSign: (signature) => handleSign(transaction.id, signature), onRemove: () => handleRemove(transaction.id), onSubmit: () => handleSubmit(transaction.id), className: "pending-transaction-item" }, transaction.id))) }), (0, jsx_runtime_1.jsx)("div", { className: "list-footer", children: (0, jsx_runtime_1.jsxs)("div", { className: "summary-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Total:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: transactions.length })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Fully Signed:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: transactions.filter(tx => Object.keys(tx.signatures).length >= tx.requiredSigners.length).length })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Pending:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: transactions.filter(tx => Object.keys(tx.signatures).length < tx.requiredSigners.length).length })] })] }) })] }));
};
exports.PendingTransactionsList = PendingTransactionsList;
exports.default = exports.PendingTransactionsList;
//# sourceMappingURL=PendingTransactionsList.js.map