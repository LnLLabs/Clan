# TransactionHistory Component

A beautifully designed transaction history table component for displaying blockchain transactions with type-specific styling and interactive elements.

## Features

- ✅ **Multiple Transaction Types**: Sent, Received, and Withdrawal transactions with unique styling
- ✅ **Color-Coded UI**: Visual differentiation with red (sent), green (received), and gray (withdrawal) colors
- ✅ **Multi-Asset Support**: Display multiple assets per transaction including ADA and native tokens
- ✅ **Interactive Links**: Action buttons for viewing transaction details
- ✅ **Pagination Support**: Built-in "See More" button for loading additional transactions
- ✅ **Responsive Design**: Mobile-friendly with responsive table layout
- ✅ **Empty State**: Elegant empty state when no transactions are available
- ✅ **Dark Mode Support**: Automatic dark mode styling
- ✅ **Token Integration**: Seamless integration with TokenElement component for displaying asset icons

## Installation

The component is part of the `@clan/framework-components` package:

```bash
npm install @clan/framework-components
```

## Basic Usage

```tsx
import React from 'react';
import { TransactionHistory, TransactionHistoryItem } from '@clan/framework-components';

function MyWallet() {
  const transactions: TransactionHistoryItem[] = [
    {
      date: '01-07-2025',
      type: 'sent',
      assets: {
        lovelace: BigInt(1500000000) // 1,500 ADA
      },
      transactionLink: 'www.transaction...',
      hash: '8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1'
    },
    {
      date: '23-06-2025',
      type: 'received',
      assets: {
        lovelace: BigInt(720000000) // 720 ADA
      },
      transactionLink: 'www.transaction...',
      hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a'
    }
  ];

  return (
    <TransactionHistory
      transactions={transactions}
      onTransactionLinkClick={(tx) => console.log('View details:', tx)}
    />
  );
}
```

## Props

### `TransactionHistoryProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transactions` | `TransactionHistoryItem[]` | Required | Array of transaction history items to display |
| `onSeeMore` | `() => void` | `undefined` | Callback when "See More" button is clicked |
| `onTransactionLinkClick` | `(transaction: TransactionHistoryItem) => void` | `undefined` | Callback when transaction link action button is clicked |
| `className` | `string` | `''` | Additional CSS class names |
| `maxVisibleTransactions` | `number` | `undefined` | Maximum number of transactions to display initially |
| `showSeeMore` | `boolean` | `true` | Whether to show the "See More" button |

### `TransactionHistoryItem`

| Property | Type | Description |
|----------|------|-------------|
| `date` | `string` | Transaction date in DD-MM-YYYY format |
| `type` | `'sent' \| 'received' \| 'withdrawal'` | Type of transaction |
| `assets` | `Assets` | Assets involved in the transaction (key: asset ID, value: amount) |
| `transactionLink` | `string` | Display text for transaction link |
| `hash` | `string` (optional) | Transaction hash for blockchain explorer links |

## Advanced Examples

### With Pagination

```tsx
import React, { useState } from 'react';
import { TransactionHistory, TransactionHistoryItem } from '@clan/framework-components';

function PaginatedTransactionHistory() {
  const [visibleCount, setVisibleCount] = useState(5);
  
  const allTransactions: TransactionHistoryItem[] = [
    // ... your transactions
  ];

  const handleSeeMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <TransactionHistory
      transactions={allTransactions}
      maxVisibleTransactions={visibleCount}
      showSeeMore={visibleCount < allTransactions.length}
      onSeeMore={handleSeeMore}
    />
  );
}
```

### With Multiple Assets

```tsx
const transactionWithMultipleAssets: TransactionHistoryItem = {
  date: '03-06-2025',
  type: 'received',
  assets: {
    lovelace: BigInt(2000000), // 2 ADA
    'abc123tokenid456def789': BigInt(720), // Fungible token
    'def456tokenid789abc012': BigInt(1) // NFT
  },
  transactionLink: 'www.transaction...',
  hash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
};
```

### Opening Blockchain Explorer

```tsx
function TransactionHistoryWithExplorer() {
  const handleTransactionClick = (transaction: TransactionHistoryItem) => {
    if (transaction.hash) {
      // Open Cardano Explorer
      window.open(`https://cexplorer.io/tx/${transaction.hash}`, '_blank');
    }
  };

  return (
    <TransactionHistory
      transactions={transactions}
      onTransactionLinkClick={handleTransactionClick}
    />
  );
}
```

### Integration with Wallet Provider

```tsx
import { useWallet } from '@clan/framework-providers';
import { TransactionHistory, TransactionHistoryItem } from '@clan/framework-components';

function WalletTransactionHistory() {
  const { transactions, loadMoreTransactions } = useWallet();

  // Convert wallet transactions to TransactionHistoryItem format
  const historyItems: TransactionHistoryItem[] = transactions.map(tx => ({
    date: new Date(tx.timestamp).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-'),
    type: determineTransactionType(tx),
    assets: tx.amount,
    transactionLink: 'www.transaction...',
    hash: tx.hash
  }));

  return (
    <TransactionHistory
      transactions={historyItems}
      onSeeMore={loadMoreTransactions}
      maxVisibleTransactions={10}
    />
  );
}
```

## Styling

The component uses CSS variables for theming. You can customize the appearance by overriding these variables:

```css
:root {
  /* Transaction type colors */
  --transaction-sent-color: #ef4444;
  --transaction-received-color: #10b981;
  --transaction-withdrawal-color: #6b7280;
  
  /* Action button color */
  --transaction-action-button-color: #a855f7;
  
  /* See More button gradient */
  --see-more-gradient-start: #ec4899;
  --see-more-gradient-end: #d946ef;
}
```

### Custom Styling

Add custom CSS classes for additional styling:

```tsx
<TransactionHistory
  transactions={transactions}
  className="my-custom-transaction-history"
/>
```

```css
.my-custom-transaction-history {
  max-width: 1200px;
  margin: 0 auto;
}

.my-custom-transaction-history .transaction-history-table {
  font-size: 14px;
}
```

## Transaction Types

### Sent (Red)
- Icon: 📤 (hand with upward arrow)
- Color: Red (#ef4444)
- Indicates outgoing transactions

### Received (Green)
- Icon: 🐷 (piggy bank)
- Color: Green (#10b981)
- Indicates incoming transactions

### Withdrawal (Gray)
- Icon: 💰 (coins/wallet)
- Color: Gray (#6b7280)
- Indicates stake reward withdrawals or similar operations

## Responsive Behavior

The component automatically adapts to different screen sizes:

- **Desktop (> 768px)**: Full table layout with all columns
- **Tablet (480px - 768px)**: Reduced padding and font sizes
- **Mobile (< 480px)**: Stacked card layout with labeled fields

## Accessibility

- Semantic HTML table structure
- ARIA labels on interactive buttons
- Keyboard navigation support
- Color is not the only means of conveying information
- High contrast support in dark mode

## Best Practices

1. **Date Format**: Use DD-MM-YYYY format for consistency
2. **Asset Amounts**: Always use `BigInt` for lovelace amounts (1 ADA = 1,000,000 lovelace)
3. **Transaction Links**: Provide meaningful link text or use the hash for explorer links
4. **Pagination**: Limit initial display to 5-10 transactions for better performance
5. **Error Handling**: Wrap component in error boundary for production use

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Related Components

- `TransactionDetails` - Detailed view of individual transactions
- `TokenElement` - Display token information
- `PendingTransactionsList` - Display pending/unconfirmed transactions

## License

Mozilla Public License 2.0

