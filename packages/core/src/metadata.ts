import type { AssetId, AssetName, PolicyId } from './types';

export const POLICY_ID_HEX_LENGTH = 56;

/**
 * Minimal Mesh-style fetcher shape used by metadata adapters.
 * Any provider implementing this can be wrapped by MeshMetadataProvider.
 */
export interface MeshAssetMetadataFetcher {
  fetchAssetMetadata(assetId: string): Promise<unknown>;
}

export function hasAssetMetadataFetcher(value: unknown): value is MeshAssetMetadataFetcher {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<MeshAssetMetadataFetcher>;
  return typeof candidate.fetchAssetMetadata === 'function';
}

export function toAssetId(policyId: PolicyId, assetName: AssetName): AssetId {
  return `${policyId}${assetName}`;
}

/**
 * Split a Cardano asset identifier into policyId + assetName.
 * Supports:
 * - policyId + assetName (standard unit)
 * - policyId.assetName (legacy dotted)
 * - policy-only ids
 */
export function parseAssetId(assetId: string): { policyId: PolicyId; assetName: AssetName } {
  if (!assetId || assetId === 'lovelace') {
    return { policyId: '', assetName: '' };
  }

  const separatorIndex = assetId.indexOf('.');
  if (separatorIndex > -1) {
    return {
      policyId: assetId.slice(0, separatorIndex),
      assetName: assetId.slice(separatorIndex + 1)
    };
  }

  if (assetId.length <= POLICY_ID_HEX_LENGTH) {
    return { policyId: assetId, assetName: '' };
  }

  return {
    policyId: assetId.slice(0, POLICY_ID_HEX_LENGTH),
    assetName: assetId.slice(POLICY_ID_HEX_LENGTH)
  };
}
