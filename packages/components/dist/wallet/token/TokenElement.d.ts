import React from 'react';
export interface TokenElementProps {
    tokenId: string;
    amount: number;
    filter?: 'FTs' | 'NFTs';
    search?: string;
    className?: string;
    expanded?: boolean;
    index?: number;
    onClick?: (tokenId: string) => void;
    onImageClick?: (tokenId: string) => void;
}
export declare const TokenElement: React.FC<TokenElementProps>;
export default TokenElement;
//# sourceMappingURL=TokenElement.d.ts.map