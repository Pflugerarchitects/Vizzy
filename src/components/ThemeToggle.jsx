import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
      <Sun className={`theme-toggle-icon sun ${mode === 'light' ? 'active' : ''}`} size={20} />
      <Moon className={`theme-toggle-icon moon ${mode === 'dark' ? 'active' : ''}`} size={20} />
    </button>
  );
};

export default ThemeToggle;
