import React from 'react';
export interface TermsBannerProps {
    isAccepted: boolean;
    onAccept: (version: string) => void;
    acceptedVersion?: string;
    currentVersion?: string;
    licenseUrl?: string;
    title?: string;
    message?: string;
    acceptButtonText?: string;
    className?: string;
}
export declare const TermsBanner: React.FC<TermsBannerProps>;
export default TermsBanner;
//# sourceMappingURL=TermsBanner.d.ts.map