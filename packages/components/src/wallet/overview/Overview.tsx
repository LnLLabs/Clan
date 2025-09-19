import React, { useState, useEffect } from 'react';
import { WalletInterface, Assets } from '@clan/framework-core';
import { TokenElement } from '../token/TokenElement';
import { AddressSelect } from '../AddressSelect';

export interface OverviewProps {
  wallet: WalletInterface;
  selectedAddress?: string;
  onAddressChange?: (address: string) => void;
  onTokenClick?: (tokenId: string) => void;
  onSetDefaultAddress?: (address: string) => void;
  onChangeAddressName?: (address: string, name: string) => void;
  className?: string;
}

export const Overview: React.FC<OverviewProps> = ({
  wallet,
  selectedAddress: initialSelectedAddress,
  onAddressChange,
  onTokenClick,
  onSetDefaultAddress,
  onChangeAddressName,
  className = ''
}) => {
  const [selectedAddress, setSelectedAddress] = useState(initialSelectedAddress || '');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [fundedAddresses, setFundedAddresses] = useState<string[]>([]);
  const [filter, setFilter] = useState<'FTs' | 'NFTs' | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        if (wallet.getDefaultAddress && !initialSelectedAddress) {
          const defaultAddr = await wallet.getDefaultAddress();
          setDefaultAddress(defaultAddr);
          setSelectedAddress(defaultAddr);
        }

        if (wallet.getFundedAddress) {
          const addresses = await wallet.getFundedAddress();
          setFundedAddresses(addresses);
        }
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      }
    };

    loadWalletData();

    const updateWindowDimensions = () => {
      const newIsMobile = window.innerWidth <= 768;
      if (isMobile !== newIsMobile) {
        setIsMobile(newIsMobile);
      }
    };

    window.addEventListener('resize', updateWindowDimensions);
    updateWindowDimensions();

    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, [wallet, isMobile, initialSelectedAddress]);

  const handleAddressChange = (address: string) => {
    setSelectedAddress(address);
    onAddressChange?.(address);
  };

  const handleTokenClick = (tokenId: string) => {
    onTokenClick?.(tokenId);
  };

  const getBalance = async (): Promise<Assets> => {
    return await wallet.getBalance();
  };

  const filterTokens = async (tokenId: string): Promise<boolean> => {
    const balance = await getBalance();
    const amount = Number(balance[tokenId]);

    // Search filter
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      const tokenIdMatch = tokenId.toLowerCase().includes(searchLower);

      // For search, we would need token info, but for now we'll just check tokenId
      if (!tokenIdMatch) {
        return false;
      }
    }

    // Type filter
    if (filter === 'NFTs') {
      return amount === 1; // Assuming NFTs have quantity 1
    } else if (filter === 'FTs') {
      return amount > 1 || tokenId.includes('.'); // Assuming FTs have different quantities or are policy.token format
    }

    return true;
  };

  const [tokensRender, setTokensRender] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const renderTokensAsync = async () => {
      const balance = await getBalance();
      const tokenIds = Object.keys(balance);

      if (tokenIds.length === 0) {
        setTokensRender(
          <div className="no-tokens-message">
            No tokens found
          </div>
        );
        return;
      }

      const filteredTokens = [];
      for (const tokenId of tokenIds) {
        if (await filterTokens(tokenId)) {
          filteredTokens.push(tokenId);
        }
      }

      if (filteredTokens.length === 0) {
        setTokensRender(
          <div className="no-tokens-message">
            {filter === 'FTs' ? 'No fungible tokens found' :
             filter === 'NFTs' ? 'No NFTs found' :
             'No tokens found'}
          </div>
        );
        return;
      }

      setTokensRender(
        <div className="overview-tokens-container">
          {filteredTokens.map((tokenId, index) => (
            <TokenElement
              key={`${tokenId}-${selectedAddress}-${index}`}
              tokenId={tokenId}
              amount={Number(balance[tokenId])}
              filter={filter}
              search={search}
              className="overview-token-container"
              onClick={() => handleTokenClick(tokenId)}
            />
          ))}
        </div>
      );
    };

    renderTokensAsync();
  }, [selectedAddress, filter, search]);

  const renderTokens = () => tokensRender;

  return (
    <div className={`overview-container ${className}`}>
      <label>
        <h1>Overview</h1>
      </label>

      {fundedAddresses.length > 1 && (
        <AddressSelect
          wallet={wallet}
          selectedAddress={selectedAddress}
          onAddressChange={handleAddressChange}
          onSetDefaultAddress={onSetDefaultAddress}
          onChangeAddressName={onChangeAddressName}
        />
      )}

      <div className="overview-buttons-container">
        <button
          className={`overview-tab ${filter === undefined ? 'overview-tab-selected' : ''}`}
          onClick={() => setFilter(undefined)}
        >
          All
        </button>
        <button
          className={`overview-tab ${filter === 'FTs' ? 'overview-tab-selected' : ''}`}
          onClick={() => setFilter('FTs')}
        >
          FTs
        </button>
        <button
          className={`overview-tab ${filter === 'NFTs' ? 'overview-tab-selected' : ''}`}
          onClick={() => setFilter('NFTs')}
        >
          NFTs
        </button>
      </div>

      <div className="overview-token-search">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {renderTokens()}
    </div>
  );
};

export default Overview;

