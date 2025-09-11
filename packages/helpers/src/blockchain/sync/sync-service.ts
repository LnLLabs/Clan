/**
 * Synchronization service for blockchain data and transactions
 * Simplified version based on the original BroClanWallet SyncService
 */

export interface SyncConfig {
  serverUrl: string;
  reconnectInterval: number;
  maxRetries: number;
  enableEncryption: boolean;
}

export interface SyncEvent {
  type: 'connect' | 'disconnect' | 'error' | 'transaction' | 'wallet_update' | 'block_update';
  data?: any;
  timestamp: number;
}

export interface SyncSubscription {
  id: string;
  eventType: SyncEvent['type'];
  callback: (event: SyncEvent) => void;
}

export class SyncService {
  private config: SyncConfig;
  private socket: WebSocket | null = null;
  private subscriptions: Map<string, SyncSubscription> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isConnected = false;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      serverUrl: 'wss://sync.broclan.io',
      reconnectInterval: 5000,
      maxRetries: 5,
      enableEncryption: false,
      ...config
    };
  }

  /**
   * Connect to the sync service
   */
  async connect(): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.config.serverUrl);

        this.socket.onopen = () => {
          console.log('SyncService: Connected to sync server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emitEvent({ type: 'connect', timestamp: Date.now() });
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.warn('SyncService: Failed to parse message:', error);
          }
        };

        this.socket.onclose = () => {
          console.log('SyncService: Disconnected from sync server');
          this.isConnected = false;
          this.emitEvent({ type: 'disconnect', timestamp: Date.now() });
          this.handleReconnect();
        };

        this.socket.onerror = (error) => {
          console.error('SyncService: WebSocket error:', error);
          this.emitEvent({
            type: 'error',
            data: { message: 'WebSocket connection error' },
            timestamp: Date.now()
          });
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the sync service
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.isConnected = false;
    this.subscriptions.clear();
  }

  /**
   * Send a message to the sync server
   */
  sendMessage(type: string, data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('SyncService: Not connected, cannot send message');
      return;
    }

    const message = {
      type,
      data,
      timestamp: Date.now()
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Subscribe to sync events
   */
  subscribe(eventType: SyncEvent['type'], callback: (event: SyncEvent) => void): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      eventType,
      callback
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from sync events
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Reconnect if server URL changed
    if (newConfig.serverUrl && this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }

  private handleMessage(data: any): void {
    const event: SyncEvent = {
      type: data.type || 'transaction',
      data: data.data,
      timestamp: data.timestamp || Date.now()
    };

    this.emitEvent(event);
  }

  private emitEvent(event: SyncEvent): void {
    // Emit to all subscribers of this event type
    this.subscriptions.forEach((subscription) => {
      if (subscription.eventType === event.type || subscription.eventType === '*') {
        try {
          subscription.callback(event);
        } catch (error) {
          console.error('SyncService: Error in event callback:', error);
        }
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxRetries) {
      console.error('SyncService: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`SyncService: Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxRetries})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.warn('SyncService: Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }
}

// Default sync service instance
export const defaultSyncService = new SyncService();

// Helper functions for common operations
export const connectToSync = async (config?: Partial<SyncConfig>): Promise<SyncService> => {
  const service = new SyncService(config);
  await service.connect();
  return service;
};

export const createSyncSubscription = (
  service: SyncService,
  eventType: SyncEvent['type'],
  callback: (event: SyncEvent) => void
): string => {
  return service.subscribe(eventType, callback);
};

export const syncWithWallet = async (
  service: SyncService,
  walletAddress: string
): Promise<void> => {
  service.sendMessage('wallet_sync', {
    address: walletAddress,
    timestamp: Date.now()
  });
};

export const syncTransaction = async (
  service: SyncService,
  transactionId: string,
  walletAddress: string
): Promise<void> => {
  service.sendMessage('transaction_sync', {
    transactionId,
    walletAddress,
    timestamp: Date.now()
  });
};
