"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionCreator = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framework_core_1 = require("@clan/framework-core");
const TokenElement_1 = require("../token/TokenElement");
const AddressSelect_1 = require("../AddressSelect");
const Button_1 = require("../../ui/buttons/Button");
const Modal_1 = require("../../ui/modals/Modal");
const TransactionCreator = ({ wallet, availableUtxos, onTransactionCreated, onCancel, className = '' }) => {
    const [recipients, setRecipients] = (0, react_1.useState)([
        { address: '', assets: { 'lovelace': 0n } }
    ]);
    const [selectedUtxos, setSelectedUtxos] = (0, react_1.useState)([]);
    const [estimatedFee, setEstimatedFee] = (0, react_1.useState)(0n);
    const [isCalculating, setIsCalculating] = (0, react_1.useState)(false);
    const [isCreating, setIsCreating] = (0, react_1.useState)(false);
    const [showPreview, setShowPreview] = (0, react_1.useState)(false);
    const [previewTransaction, setPreviewTransaction] = (0, react_1.useState)(null);
    // Calculate total assets to send
    const calculateTotalAssets = () => {
        const total = {};
        recipients.forEach(recipient => {
            Object.entries(recipient.assets).forEach(([assetId, amount]) => {
                if (total[assetId]) {
                    total[assetId] += BigInt(amount);
                }
                else {
                    total[assetId] = BigInt(amount);
                }
            });
        });
        return total;
    };
    // Estimate fee based on transaction complexity
    const estimateFee = async (totalAssets) => {
        // Simple fee estimation - in a real implementation, this would use the wallet's fee estimation
        const baseFee = 200000n; // 0.2 ADA base fee
        const perOutputFee = 10000n; // 0.01 ADA per output
        const perAssetFee = 10000n; // 0.01 ADA per asset type
        const outputCount = recipients.length;
        const assetCount = Object.keys(totalAssets).length;
        return baseFee + (perOutputFee * BigInt(outputCount)) + (perAssetFee * BigInt(assetCount));
    };
    // Calculate required UTXOs for the transaction
    const calculateRequiredUtxos = async () => {
        if (isCalculating)
            return;
        setIsCalculating(true);
        try {
            const totalAssets = calculateTotalAssets();
            const fee = await estimateFee(totalAssets);
            setEstimatedFee(fee);
            // Add fee to required assets
            const requiredAssets = { ...totalAssets };
            if (requiredAssets['lovelace']) {
                requiredAssets['lovelace'] += fee;
            }
            else {
                requiredAssets['lovelace'] = fee;
            }
            // Use coin selection algorithm
            const selected = (0, framework_core_1.coinSelect)(requiredAssets, availableUtxos);
            setSelectedUtxos(selected);
        }
        catch (error) {
            console.error('Error calculating UTXOs:', error);
        }
        finally {
            setIsCalculating(false);
        }
    };
    // Add a new recipient
    const addRecipient = () => {
        setRecipients([...recipients, { address: '', assets: { 'lovelace': 0n } }]);
    };
    // Remove a recipient
    const removeRecipient = (index) => {
        if (recipients.length > 1) {
            const newRecipients = recipients.filter((_, i) => i !== index);
            setRecipients(newRecipients);
        }
    };
    // Update recipient data
    const updateRecipient = (index, field, value) => {
        const newRecipients = [...recipients];
        newRecipients[index] = { ...newRecipients[index], [field]: value };
        setRecipients(newRecipients);
    };
    // Update recipient assets
    const updateRecipientAsset = (index, assetId, amount) => {
        const newRecipients = [...recipients];
        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount) && numAmount >= 0) {
            newRecipients[index].assets = {
                ...newRecipients[index].assets,
                [assetId]: BigInt(Math.floor(numAmount * 1000000)) // Convert ADA to lovelace
            };
        }
        setRecipients(newRecipients);
    };
    // Add asset to recipient
    const addAssetToRecipient = (index, assetId) => {
        const newRecipients = [...recipients];
        if (!newRecipients[index].assets[assetId]) {
            newRecipients[index].assets = {
                ...newRecipients[index].assets,
                [assetId]: 0n
            };
        }
        setRecipients(newRecipients);
    };
    // Remove asset from recipient
    const removeAssetFromRecipient = (index, assetId) => {
        const newRecipients = [...recipients];
        const newAssets = { ...newRecipients[index].assets };
        delete newAssets[assetId];
        newRecipients[index].assets = newAssets;
        setRecipients(newRecipients);
    };
    // Preview transaction
    const previewTransactionCreation = async () => {
        try {
            const totalAssets = calculateTotalAssets();
            const transaction = await wallet.buildTransaction({
                recipients,
                selectedUtxos,
                totalAssets,
                estimatedFee
            });
            setPreviewTransaction(transaction);
            setShowPreview(true);
        }
        catch (error) {
            console.error('Error previewing transaction:', error);
        }
    };
    // Create transaction
    const createTransaction = async () => {
        if (isCreating)
            return;
        setIsCreating(true);
        try {
            const totalAssets = calculateTotalAssets();
            const options = {
                recipients: recipients.map(r => ({ address: r.address, assets: r.assets })),
                inputs: selectedUtxos
            };
            const transaction = await wallet.buildTransaction(options);
            onTransactionCreated?.(transaction, options);
        }
        catch (error) {
            console.error('Error creating transaction:', error);
        }
        finally {
            setIsCreating(false);
        }
    };
    // Recalculate when recipients change
    (0, react_1.useEffect)(() => {
        calculateRequiredUtxos();
    }, [recipients, availableUtxos]);
    const totalAssets = calculateTotalAssets();
    const adaTotal = Number(totalAssets['lovelace'] || 0n) / 1000000;
    return ((0, jsx_runtime_1.jsxs)("div", { className: `transaction-creator ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "creator-header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Create Transaction" }), onCancel && ((0, jsx_runtime_1.jsx)("button", { className: "cancel-button", onClick: onCancel, children: "\u2715" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "recipients-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Recipients" }), (0, jsx_runtime_1.jsx)("button", { className: "add-recipient-button", onClick: addRecipient, children: "+ Add Recipient" })] }), (0, jsx_runtime_1.jsx)("div", { className: "recipients-list", children: recipients.map((recipient, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "recipient-item", children: [(0, jsx_runtime_1.jsxs)("div", { className: "recipient-header", children: [(0, jsx_runtime_1.jsxs)("span", { className: "recipient-label", children: ["Recipient ", index + 1] }), recipients.length > 1 && ((0, jsx_runtime_1.jsx)("button", { className: "remove-recipient", onClick: () => removeRecipient(index), children: "Remove" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "address-input", children: [(0, jsx_runtime_1.jsx)("label", { children: "Address" }), (0, jsx_runtime_1.jsx)(AddressSelect_1.AddressSelect, { wallet: wallet, selectedAddress: recipient.address, onAddressChange: (address) => updateRecipient(index, 'address', address) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "assets-section", children: [(0, jsx_runtime_1.jsx)("label", { children: "Assets" }), (0, jsx_runtime_1.jsxs)("div", { className: "asset-input", children: [(0, jsx_runtime_1.jsx)("span", { className: "asset-label", children: "ADA" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.001", min: "0", value: Number(recipient.assets['lovelace'] || 0n) / 1000000, onChange: (e) => updateRecipientAsset(index, 'lovelace', e.target.value), placeholder: "0.000000" })] }), Object.entries(recipient.assets)
                                            .filter(([assetId]) => assetId !== 'lovelace')
                                            .map(([assetId, amount]) => ((0, jsx_runtime_1.jsxs)("div", { className: "asset-input", children: [(0, jsx_runtime_1.jsx)(TokenElement_1.TokenElement, { tokenId: assetId, amount: Number(amount), className: "asset-token" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", value: Number(amount), onChange: (e) => updateRecipientAsset(index, assetId, e.target.value), placeholder: "0" }), (0, jsx_runtime_1.jsx)("button", { className: "remove-asset", onClick: () => removeAssetFromRecipient(index, assetId), children: "Remove" })] }, assetId))), (0, jsx_runtime_1.jsx)("button", { className: "add-asset-button", onClick: () => addAssetToRecipient(index, 'asset_' + Date.now()), children: "+ Add Asset" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "datum-input", children: [(0, jsx_runtime_1.jsx)("label", { children: "Datum (Optional)" }), (0, jsx_runtime_1.jsx)("textarea", { value: recipient.datum || '', onChange: (e) => updateRecipient(index, 'datum', e.target.value), placeholder: "JSON datum or CBOR hex", rows: 3 })] })] }, index))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "transaction-summary", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Transaction Summary" }), (0, jsx_runtime_1.jsxs)("div", { className: "summary-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "summary-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Total ADA:" }), (0, jsx_runtime_1.jsxs)("span", { className: "value", children: [adaTotal.toFixed(6), " \u20B3"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "summary-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Recipients:" }), (0, jsx_runtime_1.jsx)("span", { className: "value", children: recipients.length })] }), (0, jsx_runtime_1.jsxs)("div", { className: "summary-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "UTXOs Selected:" }), (0, jsx_runtime_1.jsx)("span", { className: "value", children: selectedUtxos.length })] }), (0, jsx_runtime_1.jsxs)("div", { className: "summary-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "Estimated Fee:" }), (0, jsx_runtime_1.jsxs)("span", { className: "value", children: [Number(estimatedFee) / 1000000, " \u20B3"] })] })] }), isCalculating && ((0, jsx_runtime_1.jsx)("div", { className: "calculating-indicator", children: "Calculating optimal UTXO selection..." }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "creator-actions", children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: previewTransactionCreation, disabled: isCalculating || recipients.some(r => !r.address), children: "Preview Transaction" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", onClick: createTransaction, disabled: isCreating || isCalculating || recipients.some(r => !r.address), children: isCreating ? 'Creating...' : 'Create Transaction' })] }), showPreview && previewTransaction && ((0, jsx_runtime_1.jsx)(Modal_1.Modal, { isOpen: showPreview, onClose: () => setShowPreview(false), title: "Transaction Preview", children: (0, jsx_runtime_1.jsxs)("div", { className: "transaction-preview", children: [(0, jsx_runtime_1.jsxs)("div", { className: "preview-details", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Transaction Details" }), (0, jsx_runtime_1.jsx)("pre", { className: "transaction-json", children: JSON.stringify(previewTransaction, null, 2) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "preview-actions", children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: () => setShowPreview(false), children: "Cancel" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", onClick: () => {
                                        setShowPreview(false);
                                        createTransaction();
                                    }, children: "Confirm & Create" })] })] }) }))] }));
};
exports.TransactionCreator = TransactionCreator;
exports.default = exports.TransactionCreator;
//# sourceMappingURL=TransactionCreator.js.map