import { create } from 'zustand';
import type { VisualizerMode } from '../types/music';

interface UIStore {
  isVisualizerOpen: boolean;
  visualizerMode: VisualizerMode;
  isEqualizerOpen: boolean;
  isShortcutModalOpen: boolean;
  isLyricsOpen: boolean;
  isMiniPlayer: boolean;

  // Actions
  toggleVisualizer: (open?: boolean) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  toggleEqualizer: (open?: boolean) => void;
  toggleShortcutModal: (open?: boolean) => void;
  toggleLyrics: (open?: boolean) => void;
  toggleMiniPlayer: (open?: boolean) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isVisualizerOpen: false,
  visualizerMode: 'bars',
  isEqualizerOpen: false,
  isShortcutModalOpen: false,
  isLyricsOpen: false,
  isMiniPlayer: false,

  toggleVisualizer: (open?: boolean) =>
    set((state) => ({
      isVisualizerOpen: open !== undefined ? open : !state.isVisualizerOpen,
    })),

  setVisualizerMode: (mode: VisualizerMode) =>
    set({ visualizerMode: mode }),

  toggleEqualizer: (open?: boolean) =>
    set((state) => ({
      isEqualizerOpen: open !== undefined ? open : !state.isEqualizerOpen,
    })),

  toggleShortcutModal: (open?: boolean) =>
    set((state) => ({
      isShortcutModalOpen: open !== undefined ? open : !state.isShortcutModalOpen,
    })),

  toggleLyrics: (open?: boolean) =>
    set((state) => ({
      isLyricsOpen: open !== undefined ? open : !state.isLyricsOpen,
    })),

  toggleMiniPlayer: (open?: boolean) =>
    set((state) => ({
      isMiniPlayer: open !== undefined ? open : !state.isMiniPlayer,
    })),

  closeAllModals: () =>
    set({
      isVisualizerOpen: false,
      isEqualizerOpen: false,
      isShortcutModalOpen: false,
      isLyricsOpen: false,
    }),
}));
