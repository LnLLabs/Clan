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
export declare class SyncService {
    private config;
    private socket;
    private subscriptions;
    private reconnectTimeout;
    private reconnectAttempts;
    private isConnected;
    constructor(config?: Partial<SyncConfig>);
    /**
     * Connect to the sync service
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the sync service
     */
    disconnect(): void;
    /**
     * Send a message to the sync server
     */
    sendMessage(type: string, data: any): void;
    /**
     * Subscribe to sync events
     */
    subscribe(eventType: SyncEvent['type'], callback: (event: SyncEvent) => void): string;
    /**
     * Unsubscribe from sync events
     */
    unsubscribe(subscriptionId: string): void;
    /**
     * Get connection status
     */
    getConnectionStatus(): boolean;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<SyncConfig>): void;
    private handleMessage;
    private emitEvent;
    private handleReconnect;
}
export declare const defaultSyncService: SyncService;
export declare const connectToSync: (config?: Partial<SyncConfig>) => Promise<SyncService>;
export declare const createSyncSubscription: (service: SyncService, eventType: SyncEvent["type"], callback: (event: SyncEvent) => void) => string;
export declare const syncWithWallet: (service: SyncService, walletAddress: string) => Promise<void>;
export declare const syncTransaction: (service: SyncService, transactionId: string, walletAddress: string) => Promise<void>;
//# sourceMappingURL=sync-service.d.ts.map