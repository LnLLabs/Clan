// Import CSS files as side effects
import './index.css';

// Re-export for consumers who might need path references
export const frameworkStylesPath = './index.css';
export const themeStylesPath = './theme.css';

/**
 * Theme customization guide for consuming applications:
 * 
 * To customize the theme colors in your consuming app, you can override CSS variables
 * in your app's CSS file. Here's an example:
 * 
 * ```css
 * :root {
 *   --color-primary: #your-color;
 *   --color-accent-purple: #your-accent;
 *   // ... override any other theme variables
 * }
 * ```
 * 
 * Available theme variables are defined in theme.css:
 * - Primary Colors: --color-primary, --color-primary-hover, etc.
 * - Accent Colors: --color-accent-pink, --color-accent-purple, etc.
 * - Neutral Colors: --color-bg-primary, --color-text-primary, etc.
 * - Overview Specific: --color-overview-bg, --color-overview-card-light, etc.
 * - Spacing: --space-xs through --space-3xl
 * - Border Radius: --radius-sm through --radius-full
 * - Shadows: --shadow-sm through --shadow-4xl
 * - Typography: --font-family-base, --font-family-mono, --font-size-*, etc.
 * 
 * For a complete list of available variables, please refer to theme.css
 */

export interface ThemeCustomization {
  // Primary colors
  colorPrimary?: string;
  colorPrimaryHover?: string;
  
  // Accent colors
  colorAccentPink?: string;
  colorAccentPurple?: string;
  
  // Background colors
  colorBgPrimary?: string;
  colorBgSecondary?: string;
  
  // Text colors
  colorTextPrimary?: string;
  colorTextSecondary?: string;
  
  // Overview specific
  colorOverviewBg?: string;
  colorOverviewCardLight?: string;
  
  // Add more as needed...
}

/**
 * Helper function to apply theme customization programmatically
 * @param theme - Object containing CSS variable overrides
 */
export function applyTheme(theme: ThemeCustomization): void {
  const root = document.documentElement;
  
  if (theme.colorPrimary) root.style.setProperty('--color-primary', theme.colorPrimary);
  if (theme.colorPrimaryHover) root.style.setProperty('--color-primary-hover', theme.colorPrimaryHover);
  if (theme.colorAccentPink) root.style.setProperty('--color-accent-pink', theme.colorAccentPink);
  if (theme.colorAccentPurple) root.style.setProperty('--color-accent-purple', theme.colorAccentPurple);
  if (theme.colorBgPrimary) root.style.setProperty('--color-bg-primary', theme.colorBgPrimary);
  if (theme.colorBgSecondary) root.style.setProperty('--color-bg-secondary', theme.colorBgSecondary);
  if (theme.colorTextPrimary) root.style.setProperty('--color-text-primary', theme.colorTextPrimary);
  if (theme.colorTextSecondary) root.style.setProperty('--color-text-secondary', theme.colorTextSecondary);
  if (theme.colorOverviewBg) root.style.setProperty('--color-overview-bg', theme.colorOverviewBg);
  if (theme.colorOverviewCardLight) root.style.setProperty('--color-overview-card-light', theme.colorOverviewCardLight);
}
