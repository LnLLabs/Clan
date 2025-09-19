import React from 'react';
export interface NavBarProps {
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    onSettingsClick: () => void;
    onModuleChange?: (module: string) => void;
    currentModule?: string;
    modules?: Array<{
        key: string;
        label: string;
    }>;
    logoSrc?: string;
    className?: string;
}
export declare const NavBar: React.FC<NavBarProps>;
export default NavBar;
//# sourceMappingURL=NavBar.d.ts.map