import type { Asset as MeshAsset } from '@meshsdk/common';
import type { Assets, UTxO } from './types';

/** Expand Clan balance-style map into Mesh {@link MeshAsset}[] for transaction outputs. */
export function assetsMapToMeshAssets(assets: Assets): MeshAsset[] {
  return Object.entries(assets).map(([unit, quantity]) => ({
    unit,
    quantity: quantity.toString(),
  }));
}

/** Collapse Mesh `output.amount` into Clan {@link Assets} (bigint quantities). */
export function meshAmountArrayToAssets(
  amount: ReadonlyArray<{ unit: string; quantity: string }>
): Assets {
  const out: Assets = {};
  for (const { unit, quantity } of amount) {
    out[unit] = (out[unit] ?? 0n) + BigInt(quantity);
  }
  return out;
}

export function meshUtxoToAssets(utxo: UTxO): Assets {
  return meshAmountArrayToAssets(utxo.output.amount);
}

export function meshUtxoLovelace(utxo: UTxO): bigint {
  return meshUtxoToAssets(utxo)['lovelace'] ?? 0n;
}

export function meshUtxoOutRefKey(utxo: UTxO): string {
  return `${utxo.input.txHash}#${utxo.input.outputIndex}`;
}

export function meshUtxosEqual(a: UTxO, b: UTxO): boolean {
  return a.input.txHash === b.input.txHash && a.input.outputIndex === b.input.outputIndex;
}
