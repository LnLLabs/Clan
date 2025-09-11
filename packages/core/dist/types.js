"use strict";
// Generic blockchain types that can be used across different implementations
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionError = exports.NetworkError = exports.WalletError = void 0;
// Generic error types
class WalletError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'WalletError';
    }
}
exports.WalletError = WalletError;
class NetworkError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
class TransactionError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'TransactionError';
    }
}
exports.TransactionError = TransactionError;
//# sourceMappingURL=types.js.map