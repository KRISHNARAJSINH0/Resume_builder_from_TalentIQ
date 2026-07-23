import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UI_THEMES, applyTheme, getSavedThemeId } from '../utils/themes';

const ThemeContext = createContext({
  themeId: 'deep-space',
  theme: null,
  setTheme: () => {},
  themes: UI_THEMES,
});

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(getSavedThemeId);

  // Apply theme on mount + on change
  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  const setTheme = useCallback((id) => {
    if (UI_THEMES[id]) setThemeId(id);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeId, theme: UI_THEMES[themeId], setTheme, themes: UI_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
