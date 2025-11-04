# @clan/framework-react

React hooks for managing Clan wallet state with React Query.

## Installation

```bash
npm install @clan/framework-react @tanstack/react-query
```

## Usage

### Setup React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchInterval: 10000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### Using the Hooks

```typescript
import { useWalletBalance, useSendTransaction } from '@clan/framework-react';

function WalletComponent({ wallet }) {
  // Get balance with auto-refresh
  const { data: balance, isLoading } = useWalletBalance(wallet, {
    walletId: 'main',
    refetchInterval: 10000, // 10 seconds
  });

  // Send transaction mutation
  const { mutate: sendTx, isPending } = useSendTransaction(wallet, {
    walletId: 'main',
    onSuccess: (data) => {
      console.log('Transaction sent:', data.txHash);
    },
  });

  const handleSend = () => {
    sendTx({
      recipientAddress: 'addr1...',
      assets: { lovelace: BigInt(1000000) },
    });
  };

  return (
    <div>
      <div>Balance: {balance?.lovelace?.toString()}</div>
      <button onClick={handleSend} disabled={isPending}>
        Send
      </button>
    </div>
  );
}
```

## API

### useWalletBalance(wallet, options)
Fetches and caches wallet balance with automatic refresh.

**Options:**
- `walletId` (string, required): Unique identifier for the wallet
- `refetchInterval` (number, optional): Auto-refresh interval in ms (default: 10000)
- `enabled` (boolean, optional): Enable/disable the query (default: true)

**Returns:** React Query result with balance data as `Record<string, bigint>`

### useWalletUtxos(wallet, options)
Fetches and caches wallet UTXOs with automatic refresh.

**Options:**
- `walletId` (string, required): Unique identifier for the wallet
- `refetchInterval` (number, optional): Auto-refresh interval in ms (default: 10000)
- `enabled` (boolean, optional): Enable/disable the query (default: true)

**Returns:** React Query result with UTXOs array

### useSendTransaction(wallet, options)
Mutation hook for sending transactions. Automatically invalidates cache on success.

**Options:**
- `walletId` (string, required): Unique identifier for the wallet
- `onSuccess` (function, optional): Callback called on successful transaction
- `onError` (function, optional): Callback called on error

**Mutation Parameters:**
- `recipientAddress` (string): Recipient's blockchain address
- `assets` (Record<string, bigint>): Assets to send (e.g., `{ lovelace: BigInt(1000000) }`)
- `options` (any, optional): Additional transaction options

**Returns:** React Query mutation result with transaction data

## Features

- ✅ TypeScript support with full type definitions
- ✅ Automatic cache invalidation after mutations
- ✅ Configurable auto-refresh intervals
- ✅ Works with any wallet implementing `WalletInterface`
- ✅ Built on React Query for powerful data management
- ✅ JSDoc documentation for all exports

## Requirements

- React ^18.0.0
- @tanstack/react-query ^5.0.0
- @clan/framework-core workspace:*

## Development

This package uses Vite for building:

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run dev
```

### Build Output
- `dist/index.js` - CommonJS bundle
- `dist/index.mjs` - ES Module bundle
- `dist/index.d.ts` - TypeScript declarations
- Source maps for both formats

## License

See LICENSE file in the repository root.

