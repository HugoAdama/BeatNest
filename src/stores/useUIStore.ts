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
  isCommandPaletteOpen: boolean;
  isStatsOpen: boolean;
  isShareTrackOpen: boolean;
  isMobileSidebarOpen: boolean;
  isPlayerPreferencesOpen: boolean;
  isAppearanceOpen: boolean;
  isDashboardPreferencesOpen: boolean;
  isDisplayPreferencesOpen: boolean;

  // Actions
  toggleVisualizer: (open?: boolean) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  toggleEqualizer: (open?: boolean) => void;
  toggleShortcutModal: (open?: boolean) => void;
  toggleLyrics: (open?: boolean) => void;
  toggleMiniPlayer: (open?: boolean) => void;
  toggleCommandPalette: (open?: boolean) => void;
  toggleStats: (open?: boolean) => void;
  toggleShareTrack: (open?: boolean) => void;
  toggleMobileSidebar: (open?: boolean) => void;
  togglePlayerPreferences: (open?: boolean) => void;
  toggleAppearance: (open?: boolean) => void;
  toggleDashboardPreferences: (open?: boolean) => void;
  toggleDisplayPreferences: (open?: boolean) => void;
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
  isCommandPaletteOpen: false,
  isStatsOpen: false,
  isShareTrackOpen: false,
  isMobileSidebarOpen: false,
  isPlayerPreferencesOpen: false,
  isAppearanceOpen: false,
  isDashboardPreferencesOpen: false,
  isDisplayPreferencesOpen: false,

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

  toggleCommandPalette: (open?: boolean) =>
    set((state) => ({
      isCommandPaletteOpen: open !== undefined ? open : !state.isCommandPaletteOpen,
    })),

  toggleStats: (open?: boolean) =>
    set((state) => ({
      isStatsOpen: open !== undefined ? open : !state.isStatsOpen,
    })),

  toggleShareTrack: (open?: boolean) =>
    set((state) => ({
      isShareTrackOpen: open !== undefined ? open : !state.isShareTrackOpen,
    })),

  toggleMobileSidebar: (open?: boolean) =>
    set((state) => ({
      isMobileSidebarOpen: open !== undefined ? open : !state.isMobileSidebarOpen,
    })),

  togglePlayerPreferences: (open?: boolean) =>
    set((state) => ({
      isPlayerPreferencesOpen: open !== undefined ? open : !state.isPlayerPreferencesOpen,
    })),

  toggleAppearance: (open?: boolean) =>
    set((state) => ({
      isAppearanceOpen: open !== undefined ? open : !state.isAppearanceOpen,
    })),

  toggleDashboardPreferences: (open?: boolean) =>
    set((state) => ({
      isDashboardPreferencesOpen: open !== undefined ? open : !state.isDashboardPreferencesOpen,
    })),

  toggleDisplayPreferences: (open?: boolean) =>
    set((state) => ({
      isDisplayPreferencesOpen: open !== undefined ? open : !state.isDisplayPreferencesOpen,
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
      isCommandPaletteOpen: false,
      isStatsOpen: false,
      isShareTrackOpen: false,
      isMobileSidebarOpen: false,
      isPlayerPreferencesOpen: false,
      isAppearanceOpen: false,
      isDashboardPreferencesOpen: false,
      isDisplayPreferencesOpen: false,
    }),
}));
