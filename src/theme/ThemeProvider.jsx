import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from './tokens';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme-mode');
    if (saved) return saved;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const theme = themes[mode];

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Save to localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    // Update document class for Tailwind dark mode
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      console.log('Dark mode enabled, classes:', root.className);
    } else {
      root.classList.remove('dark');
      console.log('Light mode enabled, classes:', root.className);
    }
  }, [mode]);

  const value = {
    mode,
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
