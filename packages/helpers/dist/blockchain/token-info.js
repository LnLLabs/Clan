"use strict";
/**
 * Token information utilities
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenInfo = useTokenInfo;
exports.getTokenInfo = getTokenInfo;
const IPFS_GATEWAY = 'https://ipfs.blockfrost.dev/ipfs/';
/**
 * Hook for getting token information
 */
function useTokenInfo(tokenId) {
    const [tokenInfo, setTokenInfo] = react_1.default.useState(null);
    const [loading, setLoading] = react_1.default.useState(false);
    const [error, setError] = react_1.default.useState(null);
    const fetchTokenInfo = react_1.default.useCallback(async () => {
        if (!tokenId)
            return;
        setLoading(true);
        setError(null);
        try {
            const info = await getTokenInfo(tokenId);
            setTokenInfo(info);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch token info');
        }
        finally {
            setLoading(false);
        }
    }, [tokenId]);
    react_1.default.useEffect(() => {
        fetchTokenInfo();
    }, [fetchTokenInfo]);
    return {
        tokenInfo,
        loading,
        error,
        refetch: fetchTokenInfo
    };
}
/**
 * Get token information
 */
async function getTokenInfo(tokenId) {
    // Handle ADA/lovelace
    if (tokenId === 'lovelace' || tokenId === '') {
        return {
            name: 'ADA',
            image: '/assets/ADA.png',
            decimals: 6,
            isNft: false,
            provider: 'system',
            fingerprint: '',
            fetchTime: Date.now()
        };
    }
    // Try to get from cache first
    const cached = getCachedTokenInfo(tokenId);
    if (cached) {
        return cached;
    }
    // Fetch from API
    const tokenInfo = await fetchTokenData(tokenId);
    // Cache the result
    setCachedTokenInfo(tokenId, tokenInfo);
    return tokenInfo;
}
/**
 * Get cached token info
 */
function getCachedTokenInfo(tokenId) {
    try {
        const cached = localStorage.getItem(`tokenInfo_${tokenId}`);
        if (!cached)
            return null;
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        if (Date.now() - parsed.fetchTime > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(`tokenInfo_${tokenId}`);
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
/**
 * Cache token info
 */
function setCachedTokenInfo(tokenId, tokenInfo) {
    try {
        localStorage.setItem(`tokenInfo_${tokenId}`, JSON.stringify(tokenInfo));
    }
    catch {
        // Ignore cache errors
    }
}
/**
 * Fetch token data from APIs
 */
async function fetchTokenData(tokenId) {
    const settings = getSettings();
    try {
        if (settings.metadataProvider === 'None') {
            return createBasicTokenInfo(tokenId);
        }
        // Try Blockfrost first (most reliable)
        if (settings.api?.url && settings.api?.projectId) {
            return await fetchFromBlockfrost(tokenId, settings);
        }
        // Fallback to basic info
        return createBasicTokenInfo(tokenId);
    }
    catch (error) {
        console.warn('Failed to fetch token info:', error);
        return createBasicTokenInfo(tokenId);
    }
}
/**
 * Fetch from Blockfrost API
 */
async function fetchFromBlockfrost(tokenId, settings) {
    const response = await fetch(`${settings.api.url}/assets/${tokenId}`, {
        headers: {
            'project_id': settings.api.projectId
        }
    });
    if (!response.ok) {
        throw new Error('Blockfrost API error');
    }
    const data = await response.json();
    const tokenInfo = {
        name: data.asset_name ? hexToAscii(data.asset_name) : tokenId,
        image: '',
        decimals: data.metadata?.decimals || 0,
        isNft: data.quantity === '1',
        provider: 'Blockfrost',
        fingerprint: data.fingerprint || '',
        fetchTime: Date.now()
    };
    // Set image from metadata
    if (data.metadata?.logo) {
        tokenInfo.image = `data:image/jpeg;base64,${data.metadata.logo}`;
    }
    else if (data.onchain_metadata?.image) {
        tokenInfo.image = processImageUrl(data.onchain_metadata.image);
    }
    return tokenInfo;
}
/**
 * Create basic token info when API is not available
 */
function createBasicTokenInfo(tokenId) {
    const parts = tokenId.split('.');
    const assetName = parts.length > 1 ? parts[1] : '';
    return {
        name: assetName ? hexToAscii(assetName) : tokenId.slice(-8),
        image: '',
        decimals: 0,
        isNft: false,
        provider: 'basic',
        fingerprint: '',
        fetchTime: Date.now()
    };
}
/**
 * Convert hex to ASCII
 */
function hexToAscii(hex) {
    try {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }
    catch {
        return hex;
    }
}
/**
 * Process image URL (handle IPFS, etc.)
 */
function processImageUrl(imageUrl) {
    if (!imageUrl)
        return '';
    if (imageUrl.startsWith('ipfs://')) {
        return imageUrl.replace('ipfs://', IPFS_GATEWAY);
    }
    if (Array.isArray(imageUrl)) {
        return imageUrl.join('');
    }
    return imageUrl;
}
/**
 * Get settings from localStorage
 */
function getSettings() {
    try {
        return JSON.parse(localStorage.getItem('settings') || '{}');
    }
    catch {
        return { metadataProvider: 'Blockfrost' };
    }
}
// Import React for the hook
const react_1 = __importDefault(require("react"));
//# sourceMappingURL=token-info.js.map