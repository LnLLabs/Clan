import { deserializeAddress } from '@meshsdk/core-cst';
import type { UTxO } from './types';

const normalizeScriptHash = (hash: string): string => hash.trim().toLowerCase();

/** Payment script hash from a bech32 address (undefined for key addresses). */
export const paymentScriptHashFromAddress = (bech32: string): string | undefined => {
  try {
    const parts = deserializeAddress(bech32) as {
      scriptHash?: string;
      pubKeyHash?: string;
    };
    const hash = parts.scriptHash?.trim();
    return hash ? normalizeScriptHash(hash) : undefined;
  } catch {
    return undefined;
  }
};

export const utxoMatchesPaymentScriptHash = (utxo: UTxO, scriptHash: string): boolean => {
  const expected = normalizeScriptHash(scriptHash);
  const actual = paymentScriptHashFromAddress(utxo.output.address);
  return actual !== undefined && actual === expected;
};
