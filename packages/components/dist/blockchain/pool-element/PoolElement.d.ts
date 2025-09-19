import React from 'react';
import { PoolInfo } from '@clan/framework-helpers';
export interface PoolElementProps {
    pool: PoolInfo;
    onDelegate?: (poolId: string) => void;
    onViewDetails?: (poolId: string) => void;
    isSelected?: boolean;
    showDelegateButton?: boolean;
    showDetailsButton?: boolean;
    compact?: boolean;
    className?: string;
}
export declare const PoolElement: React.FC<PoolElementProps>;
export default PoolElement;
//# sourceMappingURL=PoolElement.d.ts.map