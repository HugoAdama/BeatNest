import { create } from 'zustand';
import {
  applyAppearanceSettings,
  loadAppearanceSettings,
  type AppearanceSettings,
} from '../lib/appearance';

interface AppearanceStore {
  settings: AppearanceSettings;
  saveSettings: (settings: AppearanceSettings, theme: 'dark' | 'light') => void;
}

const savedSettings = loadAppearanceSettings();

export const useAppearanceStore = create<AppearanceStore>((set) => ({
  settings: savedSettings,

  saveSettings: (settings, theme) => {
    try {
      localStorage.setItem('beatnest_appearance', JSON.stringify(settings));
    } catch (error) {
      console.warn('Could not save appearance preferences:', error);
    }
    applyAppearanceSettings(settings, theme);
    set({ settings });
  },
}));

if (typeof document !== 'undefined') {
  const dark = document.documentElement.classList.contains('dark');
  applyAppearanceSettings(savedSettings, dark ? 'dark' : 'light');
}
