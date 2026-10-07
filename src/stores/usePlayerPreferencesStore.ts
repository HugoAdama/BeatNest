import { create } from 'zustand';

export type PlayerLayout = 'compact' | 'expanded';
export type PlayerControl = 'favorite' | 'lyrics' | 'equalizer' | 'queue' | 'tools' | 'volume';

export interface PlayerControlVisibility {
  favorite: boolean;
  lyrics: boolean;
  equalizer: boolean;
  queue: boolean;
  tools: boolean;
  volume: boolean;
}

interface PlayerPreferences {
  layout: PlayerLayout;
  controls: PlayerControlVisibility;
  setLayout: (layout: PlayerLayout) => void;
  toggleControl: (control: PlayerControl) => void;
}

const DEFAULT_CONTROLS: PlayerControlVisibility = {
  favorite: true,
  lyrics: true,
  equalizer: true,
  queue: true,
  tools: true,
  volume: true,
};

function loadPreferences(): { layout: PlayerLayout; controls: PlayerControlVisibility } {
  const defaults = { layout: 'expanded' as PlayerLayout, controls: DEFAULT_CONTROLS };
  try {
    const raw = localStorage.getItem('beatnest_player_preferences');
    if (!raw) return defaults;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return defaults;
    const saved = value as Partial<{ layout: PlayerLayout; controls: Partial<PlayerControlVisibility> }>;
    const controls = { ...DEFAULT_CONTROLS };
    (Object.keys(DEFAULT_CONTROLS) as PlayerControl[]).forEach((control) => {
      const savedVisibility = saved.controls?.[control];
      if (typeof savedVisibility === 'boolean') controls[control] = savedVisibility;
    });
    return {
      layout: saved.layout === 'compact' ? 'compact' : 'expanded',
      controls,
    };
  } catch {
    return defaults;
  }
}

function persistPreferences(layout: PlayerLayout, controls: PlayerControlVisibility) {
  try {
    localStorage.setItem('beatnest_player_preferences', JSON.stringify({ layout, controls }));
  } catch (error) {
    console.warn('Could not save player preferences:', error);
  }
}

const savedPreferences = loadPreferences();

export const usePlayerPreferencesStore = create<PlayerPreferences>((set, get) => ({
  ...savedPreferences,

  setLayout: (layout) => {
    const controls = get().controls;
    persistPreferences(layout, controls);
    set({ layout });
  },

  toggleControl: (control) => {
    const layout = get().layout;
    const controls = { ...get().controls, [control]: !get().controls[control] };
    persistPreferences(layout, controls);
    set({ controls });
  },
}));
