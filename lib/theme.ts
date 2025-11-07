/**
 * Theme Utility
 * Generate CSS variables from company settings
 */

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  fontFamily: string;
  sidebarBgColor: string;
  sidebarTextColor: string;
  headerBgColor: string;
  headerTextColor: string;
  customCSS?: string;
}

/**
 * Generate CSS variables from theme settings
 */
export function generateThemeCSS(settings: ThemeSettings): string {
  return `
:root {
  /* Brand Colors */
  --color-primary: ${settings.primaryColor};
  --color-primary-rgb: ${hexToRgb(settings.primaryColor)};
  --color-secondary: ${settings.secondaryColor};
  --color-secondary-rgb: ${hexToRgb(settings.secondaryColor)};
  --color-accent: ${settings.accentColor};
  --color-accent-rgb: ${hexToRgb(settings.accentColor)};

  /* Status Colors */
  --color-success: ${settings.successColor};
  --color-warning: ${settings.warningColor};
  --color-error: ${settings.errorColor};

  /* Typography */
  --font-family: ${settings.fontFamily}, system-ui, -apple-system, sans-serif;

  /* Layout Colors */
  --sidebar-bg: ${settings.sidebarBgColor};
  --sidebar-text: ${settings.sidebarTextColor};
  --header-bg: ${settings.headerBgColor};
  --header-text: ${settings.headerTextColor};

  /* Derived Colors */
  --color-primary-hover: ${darkenColor(settings.primaryColor, 10)};
  --color-primary-light: ${lightenColor(settings.primaryColor, 90)};
}

/* Custom CSS */
${settings.customCSS || ''}
`.trim();
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `${r}, ${g}, ${b}`;
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? R : 255) * 0x10000 +
      (G < 255 ? G : 255) * 0x100 +
      (B < 255 ? B : 255)
    )
      .toString(16)
      .slice(1)
  );
}

/**
 * Default theme settings
 */
export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#0070f3',
  secondaryColor: '#0051cc',
  accentColor: '#ea580c',
  successColor: '#059669',
  warningColor: '#eab308',
  errorColor: '#dc2626',
  fontFamily: 'Inter',
  sidebarBgColor: '#ffffff',
  sidebarTextColor: '#374151',
  headerBgColor: '#0070f3',
  headerTextColor: '#ffffff',
};

/**
 * Validate color format (hex)
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Sanitize custom CSS (remove dangerous patterns)
 */
export function sanitizeCustomCSS(css: string): string {
  // Remove @import, url(), and javascript:
  return css
    .replace(/@import\s+/gi, '')
    .replace(/url\s*\([^)]*\)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<script/gi, '')
    .replace(/<\/script>/gi, '');
}

/**
 * Get theme from company settings or defaults
 */
export function getThemeSettings(companySettings: any): ThemeSettings {
  if (!companySettings) return DEFAULT_THEME;

  return {
    primaryColor: companySettings.primaryColor || DEFAULT_THEME.primaryColor,
    secondaryColor: companySettings.secondaryColor || DEFAULT_THEME.secondaryColor,
    accentColor: companySettings.accentColor || DEFAULT_THEME.accentColor,
    successColor: companySettings.successColor || DEFAULT_THEME.successColor,
    warningColor: companySettings.warningColor || DEFAULT_THEME.warningColor,
    errorColor: companySettings.errorColor || DEFAULT_THEME.errorColor,
    fontFamily: companySettings.fontFamily || DEFAULT_THEME.fontFamily,
    sidebarBgColor: companySettings.sidebarBgColor || DEFAULT_THEME.sidebarBgColor,
    sidebarTextColor: companySettings.sidebarTextColor || DEFAULT_THEME.sidebarTextColor,
    headerBgColor: companySettings.headerBgColor || DEFAULT_THEME.headerBgColor,
    headerTextColor: companySettings.headerTextColor || DEFAULT_THEME.headerTextColor,
    customCSS: companySettings.customCSS ? sanitizeCustomCSS(companySettings.customCSS) : undefined,
  };
}
