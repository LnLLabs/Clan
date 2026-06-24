import assert from 'node:assert/strict';
import type { Transaction } from './types';
import {
  paymentScriptHashFromAddress,
  utxoMatchesPaymentScriptHash,
} from './historyPaymentScript';

const PURSE_HASH = '882fc2da504fb327f11ebd12517e613dee2a37e7cfd67b55b8384ede';
const CONFIG_HASH = 'c7c64c82b8b90dbc13027562d40fe48ab78e19172901efd7a4fbe4ec';
const purseAddress = 'addr_test1wzyzlsk62p8mxfl3r673y5t7vy77u23hul8av764hquyahsxfc9vp';
const configAddress = 'addr_test1wrruvnyzhzusm0qnqf6k94q0uj9t0rsezu5srm7h5na7fmqmf3m8l';

assert.equal(paymentScriptHashFromAddress(purseAddress), PURSE_HASH);
assert.equal(paymentScriptHashFromAddress(configAddress), CONFIG_HASH);

const lovelaceUtxo = (address: string, lovelace: bigint, outputIndex: number) => ({
  input: { txHash: 'tx', outputIndex },
  output: {
    address,
    amount: [{ unit: 'lovelace', quantity: lovelace.toString() }],
  },
});

const purseIoTx = {
  fee: 170_000n,
  inputs: [
    lovelaceUtxo(purseAddress, 10_000_000n, 0),
    lovelaceUtxo(configAddress, 2_000_000n, 1),
  ],
  outputs: [lovelaceUtxo(purseAddress, 9_600_000n, 2)],
} as Transaction;

let inputTotal = 0n;
let outputTotal = 0n;
for (const input of purseIoTx.inputs) {
  if (utxoMatchesPaymentScriptHash(input, PURSE_HASH)) {
    inputTotal += BigInt(input.output.amount[0]?.quantity ?? '0');
  }
}
for (const output of purseIoTx.outputs) {
  if (utxoMatchesPaymentScriptHash(output, PURSE_HASH)) {
    outputTotal += BigInt(output.output.amount[0]?.quantity ?? '0');
  }
}
assert.equal(outputTotal - inputTotal, -400_000n);

console.log('historyPaymentScript.test.ts: ok');
