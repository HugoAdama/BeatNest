import { create } from 'zustand';
import type { EqualizerPreset, ReverbMode } from '../types/music';
import { audioEngine, DEFAULT_PRESETS } from '../lib/audioEngine';

interface AudioSettingsStore {
  reverbMode: ReverbMode;
  eqEnabled: boolean;
  eqGains: [number, number, number, number, number];
  activePresetId: string;
  customPresets: EqualizerPreset[];
  preampGain: number;
  autoGainEnabled: boolean;
  setEqGain: (bandIndex: number, gain: number) => void;
  setEqPreset: (presetId: string) => void;
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (id: string) => void;
  toggleEq: (enabled?: boolean) => void;
  setReverbMode: (mode: ReverbMode) => void;
  setPreampGain: (gainDb: number) => void;
  toggleAutoGain: (enabled?: boolean) => void;
}

function loadSavedCustomPresets(): EqualizerPreset[] {
  try {
    const raw = localStorage.getItem('beatnest_custom_eq_presets');
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const useAudioSettingsStore = create<AudioSettingsStore>((set, get) => ({
  reverbMode: 'off',
  eqEnabled: true,
  eqGains: [0, 0, 0, 0, 0],
  activePresetId: 'flat',
  customPresets: loadSavedCustomPresets(),
  preampGain: 0,
  autoGainEnabled: false,

  setEqGain: (bandIndex, gain) => {
    const gains = [...get().eqGains] as [number, number, number, number, number];
    gains[bandIndex] = gain;
    audioEngine.setEqGain(bandIndex, gain);
    set({ eqGains: gains, activePresetId: 'custom' });
  },

  setEqPreset: (presetId) => {
    const preset = DEFAULT_PRESETS.find((item) => item.id === presetId)
      ?? get().customPresets.find((item) => item.id === presetId);
    if (!preset) return;

    audioEngine.applyPreset(preset.gains);
    set({ eqGains: [...preset.gains], activePresetId: presetId });
  },

  saveCustomPreset: (name) => {
    if (!name.trim()) return;
    const preset: EqualizerPreset = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      gains: [...get().eqGains],
    };
    const customPresets = [...get().customPresets, preset];
    try {
      localStorage.setItem('beatnest_custom_eq_presets', JSON.stringify(customPresets));
    } catch (error) {
      console.warn('Could not save custom EQ preset:', error);
    }
    set({ customPresets, activePresetId: preset.id });
  },

  deleteCustomPreset: (id) => {
    const customPresets = get().customPresets.filter((preset) => preset.id !== id);
    try {
      localStorage.setItem('beatnest_custom_eq_presets', JSON.stringify(customPresets));
    } catch (error) {
      console.warn('Could not delete custom EQ preset:', error);
    }
    const activePresetId = get().activePresetId === id ? 'flat' : get().activePresetId;
    set({ customPresets, activePresetId });
    if (activePresetId === 'flat') get().setEqPreset('flat');
  },

  toggleEq: (enabled) => {
    const eqEnabled = enabled ?? !get().eqEnabled;
    audioEngine.setEqEnabled(eqEnabled, get().eqGains);
    set({ eqEnabled });
  },

  setReverbMode: (reverbMode) => {
    audioEngine.setSpatialReverb(reverbMode);
    set({ reverbMode });
  },

  setPreampGain: (preampGain) => {
    audioEngine.setPreampGain(preampGain);
    set({ preampGain });
  },

  toggleAutoGain: (enabled) => {
    const autoGainEnabled = enabled ?? !get().autoGainEnabled;
    audioEngine.setAutoGainEnabled(autoGainEnabled);
    set({ autoGainEnabled });
  },
}));
