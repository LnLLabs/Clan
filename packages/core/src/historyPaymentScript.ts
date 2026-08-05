import { CredentialType, deserializeAddress } from '@meshsdk/core-cst';
import type { UTxO } from './types';

const normalizeScriptHash = (hash: string): string => hash.trim().toLowerCase();

/** Payment script hash from a bech32 address (undefined for key addresses). */
export const paymentScriptHashFromAddress = (bech32: string): string | undefined => {
  try {
    const address = deserializeAddress(bech32);
    const paymentPart = address.getProps().paymentPart;
    if (paymentPart?.type === CredentialType.ScriptHash && paymentPart.hash) {
      return normalizeScriptHash(paymentPart.hash);
    }
    return undefined;
  } catch {
    return undefined;
  }
};

export const utxoMatchesPaymentScriptHash = (utxo: UTxO, scriptHash: string): boolean => {
  const expected = normalizeScriptHash(scriptHash);
  const actual = paymentScriptHashFromAddress(utxo.output.address);
  return actual !== undefined && actual === expected;
};

/** First script payment hash found across candidate wallet addresses. */
export const resolvePaymentScriptHashFromAddresses = (
  ...addresses: Array<string | undefined>
): string | undefined => {
  for (const address of addresses) {
    if (!address?.trim()) {
      continue;
    }
    const scriptHash = paymentScriptHashFromAddress(address);
    if (scriptHash) {
      return scriptHash;
    }
  }
  return undefined;
};
