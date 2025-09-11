"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletEventType = void 0;
// Event types for wallet state changes
var WalletEventType;
(function (WalletEventType) {
    WalletEventType["CONNECTED"] = "connected";
    WalletEventType["DISCONNECTED"] = "disconnected";
    WalletEventType["BALANCE_CHANGED"] = "balance_changed";
    WalletEventType["NETWORK_CHANGED"] = "network_changed";
    WalletEventType["TRANSACTION_SUBMITTED"] = "transaction_submitted";
    WalletEventType["TRANSACTION_CONFIRMED"] = "transaction_confirmed";
    WalletEventType["ERROR"] = "error";
})(WalletEventType || (exports.WalletEventType = WalletEventType = {}));
//# sourceMappingURL=wallet-interface.js.map