import { create } from 'zustand';
import type { Track, VisualizerMode } from '../types/music';

interface UIStore {
  isVisualizerOpen: boolean;
  visualizerMode: VisualizerMode;
  isEqualizerOpen: boolean;
  isShortcutModalOpen: boolean;
  isLyricsOpen: boolean;
  isMiniPlayer: boolean;
  editingTrack: Track | null;

  // Actions
  toggleVisualizer: (open?: boolean) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  toggleEqualizer: (open?: boolean) => void;
  toggleShortcutModal: (open?: boolean) => void;
  toggleLyrics: (open?: boolean) => void;
  toggleMiniPlayer: (open?: boolean) => void;
  setEditingTrack: (track: Track | null) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isVisualizerOpen: false,
  visualizerMode: 'bars',
  isEqualizerOpen: false,
  isShortcutModalOpen: false,
  isLyricsOpen: false,
  isMiniPlayer: false,
  editingTrack: null,

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

  setEditingTrack: (track: Track | null) =>
    set({ editingTrack: track }),

  closeAllModals: () =>
    set({
      isVisualizerOpen: false,
      isEqualizerOpen: false,
      isShortcutModalOpen: false,
      isLyricsOpen: false,
      editingTrack: null,
    }),
}));
