import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

const AppearanceContext = createContext(null);
const THEME_KEY = 'rubavu-connect-theme';
const REDUCED_MOTION_KEY = 'rubavu-connect-reduced-motion';
const validThemes = ['light', 'dark', 'system'];

function getSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  return validThemes.includes(savedTheme) ? savedTheme : 'system';
}

function getSavedReducedMotion() {
  return localStorage.getItem(REDUCED_MOTION_KEY) === 'true';
}

export function AppearanceProvider({ children }) {
  const [theme, setTheme] = useState(getSavedTheme);
  const [reducedMotion, setReducedMotion] = useState(getSavedReducedMotion);
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (event) => setSystemPrefersDark(event.matches);
    mediaQuery.addEventListener('change', updateSystemTheme);
    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(REDUCED_MOTION_KEY, String(reducedMotion));
  }, [reducedMotion]);

  return (
    <AppearanceContext.Provider value={{ theme, setTheme, reducedMotion, setReducedMotion }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return context;
}
