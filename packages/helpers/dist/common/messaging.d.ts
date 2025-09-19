/**
 * Messaging and notification utilities
 */
export type MessageType = 'success' | 'error' | 'warning' | 'info';
export interface Message {
    id: string;
    type: MessageType;
    title?: string;
    message: string;
    timestamp: number;
    duration?: number;
    persistent?: boolean;
}
export interface MessageOptions {
    title?: string;
    duration?: number;
    persistent?: boolean;
    onClose?: () => void;
    onClick?: () => void;
}
/**
 * Simple message manager for handling notifications
 */
export declare class MessageManager {
    private messages;
    private listeners;
    /**
     * Adds a message
     */
    addMessage(type: MessageType, message: string, options?: MessageOptions): string;
    /**
     * Removes a message
     */
    removeMessage(id: string): void;
    /**
     * Gets all messages
     */
    getMessages(): Message[];
    /**
     * Gets messages by type
     */
    getMessagesByType(type: MessageType): Message[];
    /**
     * Clears all messages
     */
    clearMessages(): void;
    /**
     * Subscribes to message changes
     */
    subscribe(listener: (messages: Message[]) => void): () => void;
    private notifyListeners;
}
/**
 * Global message manager instance
 */
export declare const messageManager: MessageManager;
/**
 * Convenience functions for adding messages
 */
export declare const showSuccess: (message: string, options?: MessageOptions) => string;
export declare const showError: (message: string, options?: MessageOptions) => string;
export declare const showWarning: (message: string, options?: MessageOptions) => string;
export declare const showInfo: (message: string, options?: MessageOptions) => string;
/**
 * Formats an error for display
 */
export declare function formatError(error: unknown): string;
/**
 * Debounce function for limiting function calls
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function for limiting function calls
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Creates a promise that resolves after a delay
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Retries a function with exponential backoff
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, initialDelay?: number): Promise<T>;
//# sourceMappingURL=messaging.d.ts.map