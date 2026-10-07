import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

interface ThemeStore {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('beatnest_theme') as ThemeMode;
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
};

export const useThemeStore = create<ThemeStore>((set, get) => {
  const initial = getInitialTheme();
  
  if (typeof document !== 'undefined') {
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }

  return {
    theme: initial,
    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(nextTheme);
    },
    setTheme: (theme: ThemeMode) => {
      localStorage.setItem('beatnest_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      set({ theme });
    },
  };
});
