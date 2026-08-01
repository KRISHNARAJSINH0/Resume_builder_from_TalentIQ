import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UI_THEMES, applyTheme, DEFAULT_THEME_ID } from '../utils/themes';

const ThemeContext = createContext({
  themeId: DEFAULT_THEME_ID,
  theme: null,
  setTheme: () => {},
  themes: UI_THEMES,
});

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    try {
      const saved = localStorage.getItem('talentiq-ui-theme');
      // Reset old dark defaults to the new white glassmorphism theme
      if (!saved || saved === 'deep-space') return DEFAULT_THEME_ID;
      return UI_THEMES[saved] ? saved : DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  useEffect(() => { applyTheme(themeId); }, [themeId]);

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
