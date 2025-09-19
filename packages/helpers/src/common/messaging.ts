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
export class MessageManager {
  private messages: Map<string, Message> = new Map();
  private listeners: Set<(messages: Message[]) => void> = new Set();

  /**
   * Adds a message
   */
  addMessage(
    type: MessageType,
    message: string,
    options: MessageOptions = {}
  ): string {
    const id = generateMessageId();
    const msg: Message = {
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
  removeMessage(id: string): void {
    if (this.messages.delete(id)) {
      this.notifyListeners();
    }
  }

  /**
   * Gets all messages
   */
  getMessages(): Message[] {
    return Array.from(this.messages.values());
  }

  /**
   * Gets messages by type
   */
  getMessagesByType(type: MessageType): Message[] {
    return this.getMessages().filter(msg => msg.type === type);
  }

  /**
   * Clears all messages
   */
  clearMessages(): void {
    this.messages.clear();
    this.notifyListeners();
  }

  /**
   * Subscribes to message changes
   */
  subscribe(listener: (messages: Message[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const messages = this.getMessages();
    this.listeners.forEach(listener => listener(messages));
  }
}

/**
 * Global message manager instance
 */
export const messageManager = new MessageManager();

/**
 * Convenience functions for adding messages
 */
export const showSuccess = (message: string, options?: MessageOptions) =>
  messageManager.addMessage('success', message, options);

export const showError = (message: string, options?: MessageOptions) =>
  messageManager.addMessage('error', message, options);

export const showWarning = (message: string, options?: MessageOptions) =>
  messageManager.addMessage('warning', message, options);

export const showInfo = (message: string, options?: MessageOptions) =>
  messageManager.addMessage('info', message, options);

/**
 * Generates a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats an error for display
 */
export function formatError(error: unknown): string {
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
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for limiting function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
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
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw new Error('Max retries exceeded');
}

