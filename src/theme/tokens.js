// Apple-inspired design tokens

export const themes = {
  light: {
    // Base colors
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f7',
      tertiary: '#e8e8ed',
    },
    text: {
      primary: '#1d1d1f',
      secondary: '#6e6e73',
      tertiary: '#86868b',
    },
    // Semantic colors
    accent: {
      blue: '#007aff',
      blueHover: '#0051d5',
      green: '#34c759',
      red: '#ff3b30',
      orange: '#ff9500',
    },
    border: {
      default: '#d2d2d7',
      light: '#e5e5ea',
    },
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
  dark: {
    // Base colors
    background: {
      primary: '#000000',
      secondary: '#1c1c1e',
      tertiary: '#2c2c2e',
    },
    text: {
      primary: '#f5f5f7',
      secondary: '#98989d',
      tertiary: '#636366',
    },
    // Semantic colors
    accent: {
      blue: '#0a84ff',
      blueHover: '#409cff',
      green: '#30d158',
      red: '#ff453a',
      orange: '#ff9f0a',
    },
    border: {
      default: '#38383a',
      light: '#48484a',
    },
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

// Typography scale (Apple-inspired, using system fonts)
export const typography = {
  fontFamily: {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  fontSize: {
    xs: '12px',      // Footnote
    sm: '14px',      // Subheadline
    base: '17px',    // Body (Apple's default)
    lg: '20px',      // Title3
    xl: '22px',      // Title2
    '2xl': '28px',   // Title1
    '3xl': '34px',   // Large Title
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing scale (Apple uses 8pt grid, 44pt min touch target)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  touchTarget: '44px',  // Minimum touch target size
};

// Border radius (Apple's style)
export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

// Shadows (subtle, Apple-style)
export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 12px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
};
