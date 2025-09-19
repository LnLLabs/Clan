import React from 'react';
export type ImportType = 'mnemonic' | 'private-key' | 'hardware' | 'watch-only';
export interface WalletImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (importData: WalletImportData) => Promise<void>;
    supportedTypes?: ImportType[];
    className?: string;
}
export interface WalletImportData {
    type: ImportType;
    name: string;
    data: {
        mnemonic?: string;
        privateKey?: string;
        publicKey?: string;
        address?: string;
        derivationPath?: string;
        passphrase?: string;
    };
}
export declare const WalletImportModal: React.FC<WalletImportModalProps>;
export default WalletImportModal;
//# sourceMappingURL=WalletImportModal.d.ts.map