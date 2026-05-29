import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, type Theme, type ThemeName } from './themes';

const STORAGE_KEY = '@chatapp_theme';

type ThemeContextType = {
  theme: Theme;
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes.light);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && saved in themes) {
        setThemeState(themes[saved as ThemeName]);
      }
    });
  }, []);

  const setTheme = (name: ThemeName) => {
    setThemeState(themes[name]);
    AsyncStorage.setItem(STORAGE_KEY, name);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
