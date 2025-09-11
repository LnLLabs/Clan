import React, { useState, useEffect } from 'react';
import { ReactComponent as SettingsIcon } from '../../../html/assets/menu.svg';
import { ReactComponent as SunIcon } from '../../../html/assets/sun.svg';
import { ReactComponent as MoonIcon } from '../../../html/assets/moon.svg';

export interface NavBarProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onSettingsClick: () => void;
  onModuleChange?: (module: string) => void;
  currentModule?: string;
  modules?: Array<{ key: string; label: string }>;
  logoSrc?: string;
  className?: string;
}

export const NavBar: React.FC<NavBarProps> = ({
  theme,
  onThemeToggle,
  onSettingsClick,
  onModuleChange,
  currentModule,
  modules = [
    { key: 'multisig', label: 'Multisig' },
    { key: 'smartWallets', label: 'Smart Wallets' }
  ],
  logoSrc,
  className = ''
}) => {
  const [hovering, setHovering] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
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

  const handleModuleChange = (moduleKey: string) => {
    onModuleChange?.(moduleKey);
    setNavOpen(false);
  };

  const getDefaultLogoSrc = () => {
    return theme === 'light'
      ? './assets/fullLogoDark.png'
      : './assets/fullLogo.png';
  };

  return (
    <div className={`NavBarWrapper ${className}`}>
      <div className="modeToggle" onClick={onThemeToggle}>
        {theme === 'light' ? (
          <MoonIcon className="modeIcon nightIcon" />
        ) : (
          <SunIcon className="modeIcon dayIcon" />
        )}
      </div>

      <img
        src={logoSrc || getDefaultLogoSrc()}
        alt="Logo"
        className="MainAppLogo"
      />

      <div
        onMouseEnter={() => setHovering('settings')}
        onMouseLeave={() => setHovering('')}
        onClick={() => setNavOpen(true)}
        className={`settingsButton menuIcon ${navOpen ? 'menuIconOpen' : ''}`}
      >
        <SettingsIcon />
        {(hovering === 'settings' || isMobile) && (
          <label className="iconLabel"></label>
        )}
      </div>

      {navOpen && (
        <div className="navMenuBackground" onClick={() => setNavOpen(false)}>
          <div className="navMenu">
            <div className="navMenuCarveLeft"></div>
            <div className="navMenuPop"></div>

            {modules.map((module) => (
              <div
                key={module.key}
                className={`navMenuOption ${
                  currentModule === module.key ? 'navMenuOptionActive' : ''
                }`}
                onClick={() => handleModuleChange(module.key)}
              >
                {module.label}
              </div>
            ))}

            <div
              className="navMenuOption"
              onClick={() => {
                onSettingsClick();
                setNavOpen(false);
              }}
            >
              Settings
            </div>
          </div>
        </div>
      )}

      <div className="navMenuBar"></div>
    </div>
  );
};

export default NavBar;
