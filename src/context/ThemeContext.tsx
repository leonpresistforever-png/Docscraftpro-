import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'forest' | 'ocean' | 'rose' | 'soothing';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [accentColor, setAccentColorState] = useState<string>('#D4AF37');

  useEffect(() => {
    const savedTheme = localStorage.getItem('dc-theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    const savedAccent = localStorage.getItem('dc-accent-color');
    if (savedAccent) {
      setAccentColorState(savedAccent);
      document.documentElement.style.setProperty('--dc-gold', savedAccent);
      document.documentElement.style.setProperty('--dc-gold-hover', savedAccent);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('dc-theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem('dc-accent-color', color);
    document.documentElement.style.setProperty('--dc-gold', color);
    document.documentElement.style.setProperty('--dc-gold-hover', color);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
