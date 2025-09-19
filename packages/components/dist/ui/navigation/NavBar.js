"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const assets_1 = require("../../assets");
const NavBar = ({ theme, onThemeToggle, onSettingsClick, onModuleChange, currentModule, modules = [
    { key: 'multisig', label: 'Multisig' },
    { key: 'smartWallets', label: 'Smart Wallets' }
], logoSrc, className = '' }) => {
    const [hovering, setHovering] = (0, react_1.useState)('');
    const [isMobile, setIsMobile] = (0, react_1.useState)(false);
    const [navOpen, setNavOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const updateWindowDimensions = () => {
            const newIsMobile = window.innerWidth <= 768;
            if (isMobile !== newIsMobile) {
                setIsMobile(newIsMobile);
            }
        };
        window.addEventListener('resize', updateWindowDimensions);
        updateWindowDimensions();
        return () => window.removeEventListener('resize', updateWindowDimensions);
    }, [isMobile]);
    const handleModuleChange = (moduleKey) => {
        onModuleChange?.(moduleKey);
        setNavOpen(false);
    };
    const getDefaultLogoSrc = () => {
        return theme === 'light'
            ? './assets/fullLogoDark.png'
            : './assets/fullLogo.png';
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `NavBarWrapper ${className}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "modeToggle", onClick: onThemeToggle, children: theme === 'light' ? ((0, jsx_runtime_1.jsx)(assets_1.MoonIcon, { className: "modeIcon nightIcon" })) : ((0, jsx_runtime_1.jsx)(assets_1.SunIcon, { className: "modeIcon dayIcon" })) }), (0, jsx_runtime_1.jsx)("img", { src: logoSrc || getDefaultLogoSrc(), alt: "Logo", className: "MainAppLogo" }), (0, jsx_runtime_1.jsxs)("div", { onMouseEnter: () => setHovering('settings'), onMouseLeave: () => setHovering(''), onClick: () => setNavOpen(true), className: `settingsButton menuIcon ${navOpen ? 'menuIconOpen' : ''}`, children: [(0, jsx_runtime_1.jsx)(assets_1.MenuIcon, {}), (hovering === 'settings' || isMobile) && ((0, jsx_runtime_1.jsx)("label", { className: "iconLabel" }))] }), navOpen && ((0, jsx_runtime_1.jsx)("div", { className: "navMenuBackground", onClick: () => setNavOpen(false), children: (0, jsx_runtime_1.jsxs)("div", { className: "navMenu", children: [(0, jsx_runtime_1.jsx)("div", { className: "navMenuCarveLeft" }), (0, jsx_runtime_1.jsx)("div", { className: "navMenuPop" }), modules.map((module) => ((0, jsx_runtime_1.jsx)("div", { className: `navMenuOption ${currentModule === module.key ? 'navMenuOptionActive' : ''}`, onClick: () => handleModuleChange(module.key), children: module.label }, module.key))), (0, jsx_runtime_1.jsx)("div", { className: "navMenuOption", onClick: () => {
                                onSettingsClick();
                                setNavOpen(false);
                            }, children: "Settings" })] }) })), (0, jsx_runtime_1.jsx)("div", { className: "navMenuBar" })] }));
};
exports.NavBar = NavBar;
exports.default = exports.NavBar;
//# sourceMappingURL=NavBar.js.map