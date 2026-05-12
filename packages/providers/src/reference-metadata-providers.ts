import {
  MetadataProvider,
  NoOpMetadataProvider,
  MeshAssetMetadataFetcher
} from '@clan/framework-core';
import {
  MeshMetadataProvider,
  MeshMetadataProviderOptions,
  createMeshMetadataProvider
} from './mesh-metadata-provider';

type BlockfrostFetcher = MeshAssetMetadataFetcher;
type MaestroFetcher = MeshAssetMetadataFetcher;

/**
 * Backward-compatible Blockfrost provider that delegates normalization to MeshMetadataProvider.
 */
export class BlockfrostMetadataProvider extends MeshMetadataProvider {
  constructor(baseUrl: string, projectId: string, options?: MeshMetadataProviderOptions) {
    super(createBlockfrostFetcher(baseUrl, projectId), options);
  }
}

/**
 * Backward-compatible Maestro provider that delegates normalization to MeshMetadataProvider.
 */
export class MaestroMetadataProvider extends MeshMetadataProvider {
  constructor(apiKey: string, network: string = 'mainnet', options?: MeshMetadataProviderOptions) {
    super(createMaestroFetcher(apiKey, network), options);
  }
}

/**
 * Factory function to create metadata provider based on settings
 * This is a convenience function for apps that want to use standard providers
 */
export function createMetadataProvider(config: {
  type: 'Blockfrost' | 'Maestro' | 'None';
  blockfrostUrl?: string;
  blockfrostProjectId?: string;
  maestroApiKey?: string;
  maestroNetwork?: string;
}): MetadataProvider {
  switch (config.type) {
    case 'Blockfrost':
      if (!config.blockfrostUrl || !config.blockfrostProjectId) {
        throw new Error('Blockfrost requires url and projectId');
      }
      return new BlockfrostMetadataProvider(config.blockfrostUrl, config.blockfrostProjectId);
    
    case 'Maestro':
      if (!config.maestroApiKey) {
        throw new Error('Maestro requires apiKey');
      }
      return new MaestroMetadataProvider(config.maestroApiKey, config.maestroNetwork);
    
    case 'None':
    default:
      return new NoOpMetadataProvider();
  }
}

export { MeshMetadataProvider, createMeshMetadataProvider };
export type { MeshMetadataProviderOptions };

function createBlockfrostFetcher(baseUrl: string, projectId: string): BlockfrostFetcher {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  return {
    async fetchAssetMetadata(assetId: string): Promise<unknown> {
      const response = await fetch(`${normalizedBaseUrl}/assets/${assetId}`, {
        headers: { project_id: projectId }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`Blockfrost API error: ${response.statusText}`);
      }

      return response.json();
    }
  };
}

function createMaestroFetcher(apiKey: string, network: string): MaestroFetcher {
  return {
    async fetchAssetMetadata(assetId: string): Promise<unknown> {
      const response = await fetch(`https://${network}.gomaestro-api.org/v1/assets/${assetId}`, {
        headers: { 'api-key': apiKey }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`Maestro API error: ${response.statusText}`);
      }

      return response.json();
    }
  };
}




