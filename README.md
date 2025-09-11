# BroClan Framework

A modular, extensible framework for building blockchain wallet applications. This framework provides the core components, utilities, and patterns needed to create feature-rich wallet experiences across different blockchain networks.

## 🚀 Features

- **Modular Architecture**: Import only what you need
- **TypeScript Support**: Full type safety and excellent developer experience
- **React Components**: Pre-built UI components for common wallet features
- **Provider Pattern**: Context-based state management
- **Blockchain Agnostic**: Support for multiple blockchain networks
- **Extensible**: Easy to extend and customize for specific use cases

## 📦 Packages

### Core (`@broclan/framework-core`)
The foundation package containing types, interfaces, and abstractions.

```typescript
import { WalletInterface, Assets, Transaction } from '@broclan/framework-core';
```

**Features:**
- Generic wallet interfaces
- Blockchain-agnostic types
- Network configurations
- Transaction types and utilities

### Components (`@broclan/framework-components`)
React UI components for wallet applications.

```typescript
import { WalletConnector, BalanceDisplay, TransactionHistory } from '@broclan/framework-components';
```

**Features:**
- Wallet connection components
- Balance and transaction displays
- Modal dialogs
- Form components
- Layout utilities

### Helpers (`@broclan/framework-helpers`)
Utility functions for common operations.

```typescript
import { formatAddress, formatAssetQuantity, copyToClipboard } from '@broclan/framework-helpers';
```

**Features:**
- Address formatting and validation
- Asset quantity formatting
- Clipboard operations
- Storage utilities
- Validation helpers

### Providers (`@broclan/framework-providers`)
React context providers for state management.

```typescript
import { WalletProvider, SettingsProvider, BlockchainProvider } from '@broclan/framework-providers';
```

**Features:**
- Wallet state management
- App settings persistence
- Blockchain data and connections

## 🏗️ Architecture

The framework follows a layered architecture:

```
┌─────────────────────────────────────┐
│         Application Layer           │
│  (Your Custom Wallet Implementation) │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│        Framework Layer              │
│  Components │ Providers │ Helpers   │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│          Core Layer                 │
│    Types │ Interfaces │ Abstractions │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @broclan/framework-core @broclan/framework-components @broclan/framework-helpers @broclan/framework-providers
```

### 2. Basic Setup

```tsx
import React from 'react';
import {
  WalletProvider,
  SettingsProvider,
  BlockchainProvider
} from '@broclan/framework-providers';
import { WalletConnector } from '@broclan/framework-components';

function App() {
  return (
    <SettingsProvider>
      <BlockchainProvider>
        <WalletProvider>
          <div className="app">
            <WalletConnector />
            {/* Your wallet UI */}
          </div>
        </WalletProvider>
      </BlockchainProvider>
    </SettingsProvider>
  );
}

export default App;
```

### 3. Using Components

```tsx
import React from 'react';
import { useWallet } from '@broclan/framework-providers';
import { BalanceDisplay, TransactionHistory } from '@broclan/framework-components';
import { formatAddress } from '@broclan/framework-helpers';

function WalletDashboard() {
  const { address, balance, transactions } = useWallet();

  return (
    <div className="wallet-dashboard">
      <h2>Wallet: {formatAddress(address)}</h2>
      <BalanceDisplay balance={balance} />
      <TransactionHistory transactions={transactions} />
    </div>
  );
}
```

## 📚 API Reference

### Core Types

```typescript
interface WalletInterface {
  getName(): string;
  getAddress(): string;
  getBalance(): Promise<Assets>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  // ... more methods
}

interface Assets {
  [assetId: string]: bigint;
}

interface Transaction {
  hash: string;
  inputs: UTxO[];
  outputs: UTxO[];
  fee: bigint;
  // ... more properties
}
```

### Component Props

```typescript
interface WalletConnectorProps {
  wallets: WalletInterface[];
  onWalletSelect: (wallet: WalletInterface) => void;
  selectedWallet?: WalletInterface;
  isLoading?: boolean;
  className?: string;
}

interface BalanceDisplayProps {
  balance: Assets;
  loading?: boolean;
  showZeroBalances?: boolean;
  formatAssetName?: (asset: Asset) => string;
  formatAssetValue?: (asset: Asset) => string;
}
```

## 🔧 Configuration

### Network Configuration

```typescript
import { NETWORKS } from '@broclan/framework-core';

const customNetwork = {
  name: 'Custom Network',
  networkId: 1,
  protocolMagic: 123456,
  explorerUrl: 'https://explorer.example.com',
  apiUrl: 'https://api.example.com'
};
```

### Provider Configuration

```tsx
<SettingsProvider
  defaultSettings={{
    theme: 'dark',
    currency: 'EUR',
    network: NETWORKS.cardano_mainnet
  }}
  storageKey="my-app-settings"
>
  {/* Your app */}
</SettingsProvider>
```

## 🎨 Theming

The framework components support CSS custom properties for theming:

```css
:root {
  --broclan-primary-color: #3b82f6;
  --broclan-secondary-color: #64748b;
  --broclan-background-color: #ffffff;
  --broclan-text-color: #1f2937;
  --broclan-border-radius: 0.375rem;
}
```

## 🔌 Extending the Framework

### Custom Wallet Implementation

```typescript
import { WalletInterface } from '@broclan/framework-core';

class MyCustomWallet implements WalletInterface {
  // Implement the WalletInterface methods
  getName(): string {
    return 'My Custom Wallet';
  }

  async getBalance(): Promise<Assets> {
    // Your balance fetching logic
    return {};
  }

  // ... other methods
}
```

### Custom Components

```tsx
import React from 'react';
import { Button } from '@broclan/framework-components';

interface CustomButtonProps {
  variant?: 'success' | 'danger';
  children: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'success',
  children
}) => {
  return (
    <Button
      className={variant === 'success' ? 'bg-green-500' : 'bg-red-500'}
    >
      {children}
    </Button>
  );
};
```

## 📝 Examples

### Simple Wallet App

```tsx
import React from 'react';
import {
  WalletProvider,
  useWallet
} from '@broclan/framework-providers';
import {
  WalletConnector,
  BalanceDisplay
} from '@broclan/framework-components';

function WalletApp() {
  return (
    <WalletProvider>
      <WalletContent />
    </WalletProvider>
  );
}

function WalletContent() {
  const { selectedWallet, connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="wallet-app">
      {!selectedWallet ? (
        <WalletConnector onWalletSelect={connectWallet} />
      ) : (
        <div>
          <button onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
          <BalanceDisplay balance={selectedWallet.getBalance()} />
        </div>
      )}
    </div>
  );
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built upon the foundation of the BroClanWallet project
- Inspired by modern React patterns and blockchain best practices
- Thanks to the Cardano and blockchain communities for their contributions

---

For more detailed documentation, visit our [documentation site](https://docs.broclan.io) or check out the examples in the `/examples` directory.