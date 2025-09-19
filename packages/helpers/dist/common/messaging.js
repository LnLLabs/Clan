"use strict";
/**
 * Messaging and notification utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.showInfo = exports.showWarning = exports.showError = exports.showSuccess = exports.messageManager = exports.MessageManager = void 0;
exports.formatError = formatError;
exports.debounce = debounce;
exports.throttle = throttle;
exports.delay = delay;
exports.retryWithBackoff = retryWithBackoff;
/**
 * Simple message manager for handling notifications
 */
class MessageManager {
    constructor() {
        this.messages = new Map();
        this.listeners = new Set();
    }
    /**
     * Adds a message
     */
    addMessage(type, message, options = {}) {
        const id = generateMessageId();
        const msg = {
            id,
            type,
            message,
            timestamp: Date.now(),
            duration: options.duration || 5000,
            persistent: options.persistent || false,
            ...options
        };
        this.messages.set(id, msg);
        this.notifyListeners();
        // Auto-remove non-persistent messages
        if (!msg.persistent && typeof msg.duration === 'number' && msg.duration > 0) {
            setTimeout(() => {
                this.removeMessage(id);
            }, msg.duration);
        }
        return id;
    }
    /**
     * Removes a message
     */
    removeMessage(id) {
        if (this.messages.delete(id)) {
            this.notifyListeners();
        }
    }
    /**
     * Gets all messages
     */
    getMessages() {
        return Array.from(this.messages.values());
    }
    /**
     * Gets messages by type
     */
    getMessagesByType(type) {
        return this.getMessages().filter(msg => msg.type === type);
    }
    /**
     * Clears all messages
     */
    clearMessages() {
        this.messages.clear();
        this.notifyListeners();
    }
    /**
     * Subscribes to message changes
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notifyListeners() {
        const messages = this.getMessages();
        this.listeners.forEach(listener => listener(messages));
    }
}
exports.MessageManager = MessageManager;
/**
 * Global message manager instance
 */
exports.messageManager = new MessageManager();
/**
 * Convenience functions for adding messages
 */
const showSuccess = (message, options) => exports.messageManager.addMessage('success', message, options);
exports.showSuccess = showSuccess;
const showError = (message, options) => exports.messageManager.addMessage('error', message, options);
exports.showError = showError;
const showWarning = (message, options) => exports.messageManager.addMessage('warning', message, options);
exports.showWarning = showWarning;
const showInfo = (message, options) => exports.messageManager.addMessage('info', message, options);
exports.showInfo = showInfo;
/**
 * Generates a unique message ID
 */
function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Formats an error for display
 */
function formatError(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (typeof error === 'object' && error !== null) {
        return JSON.stringify(error);
    }
    return 'An unknown error occurred';
}
/**
 * Debounce function for limiting function calls
 */
function debounce(func, wait) {
    let timeout = null;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Throttle function for limiting function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
/**
 * Creates a promise that resolves after a delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retries a function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let delay = initialDelay;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
    throw new Error('Max retries exceeded');
}
//# sourceMappingURL=messaging.js.map