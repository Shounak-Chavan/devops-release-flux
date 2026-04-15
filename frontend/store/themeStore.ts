/**
 * @file themeStore.ts
 * @description Zustand store for managing the application's light/dark theme preference.
 * Persists the user's choice to localStorage so it survives page reloads.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  /** The currently active theme. */
  theme: Theme;
  /** Toggles between 'dark' and 'light' themes. */
  toggleTheme: () => void;
  /** Explicitly set a theme. */
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark', // Default to dark — the "Obsidian" theme
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        // Apply the data attribute to the root element for CSS variable switching
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
      },
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    {
      name: 'featureflow-theme', // Key in localStorage
    }
  )
);
