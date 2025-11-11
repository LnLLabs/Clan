# Transaction Balance Calculation

## Overview

This document explains how transaction balances are calculated in the TransactionHistory component, including the fix for properly accounting for change outputs.

## The Problem (Before Fix)

### Incorrect Calculation
The previous implementation incorrectly calculated balances by:
- **Sent transactions**: Summing all inputs from wallet address
- **Received transactions**: Summing all outputs to wallet address

### Why This Was Wrong

Example transaction:
```
Inputs (from your address):
  - 100 ADA

Outputs:
  - 10 ADA to recipient
  - 89 ADA back to you (change)
  - 1 ADA fees
```

**Old calculation showed**: -100 ADA (incorrect!)  
**Actual balance change**: -11 ADA (10 sent + 1 fee)

The old method didn't account for **change coming back** to your wallet.

## The Solution (After Fix)

### Correct Calculation

**Balance Change = Received - Spent**

Where:
- **Spent** = Sum of all inputs from your address
- **Received** = Sum of all outputs to your address
- **Net Change** = Received - Spent

### Implementation

```typescript
// 1. Sum all inputs from wallet address (what was spent)
const inputAssets: Assets = {};
tx.inputs.forEach(input => {
  if (input.address === walletAddress) {
    // Sum up all assets in inputs
  }
});

// 2. Sum all outputs to wallet address (what was received/change)
const outputAssets: Assets = {};
tx.outputs.forEach(output => {
  if (output.address === walletAddress) {
    // Sum up all assets in outputs
  }
});

// 3. Calculate net change for each asset
const netChange = received - spent;

// 4. Store absolute value (for display)
assets[assetId] = netChange > 0 ? netChange : -netChange;

// 5. Determine transaction type based on net lovelace change
if (totalChange > 0) type = 'received';
else if (totalChange < 0) type = 'sent';
else type = 'withdrawal';
```

## Examples

### Example 1: Simple Send

```
Transaction:
  Inputs (your address):
    - 100 ADA
  
  Outputs:
    - 50 ADA to recipient
    - 49 ADA back to you (change)
    - 1 ADA fees (burned)

Calculation:
  Spent: 100 ADA
  Received: 49 ADA
  Net Change: 49 - 100 = -51 ADA
  
Result: Type = 'sent', Display = 51 ADA
```

### Example 2: Simple Receive

```
Transaction:
  Inputs (someone else's address):
    - 100 ADA
  
  Outputs:
    - 50 ADA to you
    - 49 ADA back to sender (change)
    - 1 ADA fees

Calculation:
  Spent: 0 ADA
  Received: 50 ADA
  Net Change: 50 - 0 = +50 ADA
  
Result: Type = 'received', Display = 50 ADA
```

### Example 3: Send to Self (Transfer)

```
Transaction:
  Inputs (your address):
    - 100 ADA
  
  Outputs:
    - 99 ADA back to you
    - 1 ADA fees

Calculation:
  Spent: 100 ADA
  Received: 99 ADA
  Net Change: 99 - 100 = -1 ADA
  
Result: Type = 'sent', Display = 1 ADA (just the fee!)
```

### Example 4: Multi-Asset Transaction

```
Transaction:
  Inputs (your address):
    - 100 ADA
    - 1000 TOKEN_A
  
  Outputs:
    - 50 ADA to recipient
    - 500 TOKEN_A to recipient
    - 48 ADA back to you (change)
    - 500 TOKEN_A back to you (change)
    - 2 ADA fees

Calculation:
  ADA:
    Spent: 100 ADA
    Received: 48 ADA
    Net: -52 ADA (50 sent + 2 fee)
  
  TOKEN_A:
    Spent: 1000 TOKEN_A
    Received: 500 TOKEN_A
    Net: -500 TOKEN_A
  
Result: Type = 'sent', Display = 52 ADA, 500 TOKEN_A
```

### Example 5: Contract Interaction (No Net Change)

```
Transaction:
  Inputs (your address):
    - 100 ADA
  
  Outputs:
    - 100 ADA to smart contract
    - Some contract state changes
  
  Outputs (to your address from contract):
    - 100 ADA back from contract

Calculation:
  Spent: 100 ADA
  Received: 100 ADA
  Net Change: 0 ADA
  
Result: Type = 'withdrawal' (contract interaction)
```

## Transaction Type Logic

The transaction type is determined by the net lovelace (ADA) change:

```typescript
if (!hasInputs && hasOutputs) {
  // Pure receive - no spending involved
  type = 'received';
  
} else if (hasInputs && !hasOutputs) {
  // Pure send - no change coming back
  type = 'sent';
  
} else if (hasInputs && hasOutputs) {
  // Mixed transaction - check net change
  if (totalChange > 0) {
    type = 'received';  // Net positive
  } else if (totalChange < 0) {
    type = 'sent';      // Net negative
  } else {
    type = 'withdrawal'; // Net zero (contract interaction)
  }
}
```

## Display Logic

The component displays the **absolute value** of the net change:

```typescript
// Store absolute value for display
assets[assetId] = netChange > 0 ? netChange : -netChange;

// UI adds +/- sign based on transaction type
{transaction.type === 'sent' ? '-' : '+'}
{(Number(lovelaceEntry[1]) / 1000000).toFixed(2)}
```

## Benefits of This Approach

✅ **Accurate Balance Changes** - Shows actual wallet balance impact  
✅ **Handles Change Correctly** - Change outputs are properly accounted for  
✅ **Multi-Asset Support** - Works with ADA and native tokens  
✅ **Contract Interactions** - Properly identifies zero-net-change transactions  
✅ **Self-Transfers** - Shows only the fee for sending to yourself  
✅ **Intuitive Display** - Users see the real impact on their balance

## Edge Cases Handled

1. **Send to Self**: Shows only the fee amount
2. **Multiple Change Outputs**: All change is summed correctly
3. **Token-Only Transactions**: Net ADA might be zero, uses token changes
4. **Contract Interactions**: Identified as 'withdrawal' type
5. **Multi-Party Transactions**: Only calculates change for your address
6. **Fee Calculation**: Implicit in the net change (spent - received includes fees)

## Testing

Example test cases:

```typescript
describe('Transaction Balance Calculation', () => {
  it('calculates simple send correctly', () => {
    const tx = {
      inputs: [{ address: myAddress, assets: { lovelace: 100000000n } }],
      outputs: [
        { address: recipientAddress, assets: { lovelace: 50000000n } },
        { address: myAddress, assets: { lovelace: 49000000n } }
      ]
    };
    
    const result = calculateBalance(tx, myAddress);
    expect(result.netChange.lovelace).toBe(-51000000n); // 50 + 1 fee
    expect(result.type).toBe('sent');
  });
  
  it('calculates receive correctly', () => {
    const tx = {
      inputs: [{ address: senderAddress, assets: { lovelace: 100000000n } }],
      outputs: [{ address: myAddress, assets: { lovelace: 50000000n } }]
    };
    
    const result = calculateBalance(tx, myAddress);
    expect(result.netChange.lovelace).toBe(50000000n);
    expect(result.type).toBe('received');
  });
  
  it('handles send to self showing only fee', () => {
    const tx = {
      inputs: [{ address: myAddress, assets: { lovelace: 100000000n } }],
      outputs: [{ address: myAddress, assets: { lovelace: 99000000n } }]
    };
    
    const result = calculateBalance(tx, myAddress);
    expect(result.netChange.lovelace).toBe(-1000000n); // Just the fee
    expect(result.type).toBe('sent');
  });
});
```

## Related Files

- `TransactionHistory.tsx` - Main implementation
- `TransactionHistory.example.tsx` - Usage examples
- `README.md` - Component documentation

## References

This calculation method aligns with how blockchain wallets universally calculate balance changes:
- Subtract all inputs from your address (spent)
- Add all outputs to your address (received)
- Net change = received - spent

This is the standard UTXO accounting model used in Cardano and Bitcoin-based blockchains.

