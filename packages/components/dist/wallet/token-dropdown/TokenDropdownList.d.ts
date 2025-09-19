import React from 'react';
import { Assets } from '@clan/framework-core';
export interface TokenDropdownListProps {
    balances: Assets;
    onTokenSelect: (tokenId: string) => void;
    excludeTokens?: string[];
    placeholder?: string;
    className?: string;
}
export declare const TokenDropdownList: React.FC<TokenDropdownListProps>;
export default TokenDropdownList;
//# sourceMappingURL=TokenDropdownList.d.ts.map