import React, { useState } from 'react';
import { Assets } from '@broclan/framework-core';
import { TokenElement } from '../token/TokenElement';

export interface TokenDropdownListProps {
  balances: Assets;
  onTokenSelect: (tokenId: string) => void;
  excludeTokens?: string[];
  placeholder?: string;
  className?: string;
}

export const TokenDropdownList: React.FC<TokenDropdownListProps> = ({
  balances,
  onTokenSelect,
  excludeTokens = [],
  placeholder = 'Search',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hovering, setHovering] = useState('');

  const handleClick = (tokenId: string) => {
    onTokenSelect(tokenId);
    setIsOpen(false);
    setSearch('');
  };

  const filteredTokens = Object.keys(balances)
    .filter(tokenId => tokenId !== 'lovelace') // Exclude ADA by default
    .filter(tokenId => !excludeTokens.includes(tokenId))
    .filter(tokenId => {
      if (!search.trim()) return true;
      const searchLower = search.toLowerCase();
      return tokenId.toLowerCase().includes(searchLower);
    });

  return (
    <div className={`token-list-wrapper ${className}`}>
      <div
        onMouseEnter={() => setHovering('addToken')}
        onMouseLeave={() => setHovering('')}
        onClick={() => setIsOpen(!isOpen)}
        className="icon-wrapper token-icon-button"
      >
        <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {hovering === 'addToken' && (
          <label className="icon-label">Add Token</label>
        )}
        <br />
      </div>

      {isOpen && (
        <div className="token-dropdown-menu">
          <div className="token-search">
            <input
              type="text"
              value={search}
              placeholder={placeholder}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="token-list">
            {filteredTokens.length === 0 ? (
              <div className="no-tokens">
                {search ? 'No tokens found' : 'No tokens available'}
              </div>
            ) : (
              filteredTokens.map((tokenId, index) => (
                <div
                  key={`${tokenId}-${index}`}
                  onClick={() => handleClick(tokenId)}
                  className="token-list-item"
                >
                  <TokenElement
                    tokenId={tokenId}
                    amount={Number(balances[tokenId])}
                    className="dropdown-token-element"
                    expanded={false}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDropdownList;
