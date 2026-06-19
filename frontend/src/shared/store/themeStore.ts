import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/** Lee el tema inicial: localStorage > preferencia del sistema > 'light'. */
const getInitialTheme = (): Theme => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
};

/** Aplica la clase `.dark` en <html> */
const applyTheme = (theme: Theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
};

type ThemeStore = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: getInitialTheme(),
            setTheme: theme => {
                applyTheme(theme);
                set({ theme });
            },
            toggleTheme: () => {
                const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
                applyTheme(next);
                set({ theme: next });
            },
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            // Al rehidratar desde localStorage, aplica la clase `.dark` en <html>.
            onRehydrateStorage: () => state => {
                if (state) applyTheme(state.theme);
            },
        },
    ),
);
