import { create } from 'zustand';
import type {
  AudioProfile,
  AudioProfileBinding,
  AudioProfileTargetType,
  EqualizerPreset,
  PlaybackCollectionContext,
  ReverbMode,
  Track,
} from '../types/music';
import { audioEngine, DEFAULT_PRESETS } from '../lib/audioEngine';

interface AudioSettingsStore {
  reverbMode: ReverbMode;
  eqEnabled: boolean;
  eqGains: [number, number, number, number, number];
  activePresetId: string;
  customPresets: EqualizerPreset[];
  audioProfiles: AudioProfile[];
  audioProfileBindings: AudioProfileBinding[];
  activeAudioProfileId: string | null;
  preampGain: number;
  autoGainEnabled: boolean;
  setEqGain: (bandIndex: number, gain: number) => void;
  setEqPreset: (presetId: string) => void;
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (id: string) => void;
  saveAudioProfile: (name: string) => string | null;
  deleteAudioProfile: (id: string) => void;
  bindAudioProfile: (targetType: AudioProfileTargetType, targetId: string, profileId: string | null) => void;
  applyAudioProfile: (id: string) => void;
  applyAutomaticAudioProfile: (track: Track, context?: PlaybackCollectionContext | null) => void;
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

function loadSavedProfiles(): AudioProfile[] {
  try {
    const raw = localStorage.getItem('beatnest_audio_profiles');
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AudioProfile => {
      if (!item || typeof item !== 'object') return false;
      const profile = item as Partial<AudioProfile>;
      return typeof profile.id === 'string' &&
        typeof profile.name === 'string' &&
        Array.isArray(profile.eqGains) && profile.eqGains.length === 5 &&
        profile.eqGains.every((gain) => typeof gain === 'number' && Number.isFinite(gain)) &&
        typeof profile.eqEnabled === 'boolean' &&
        ['off', 'room', 'hall', 'cathedral'].includes(profile.reverbMode ?? '') &&
        typeof profile.preampGain === 'number' && Number.isFinite(profile.preampGain) &&
        typeof profile.autoGainEnabled === 'boolean' &&
        typeof profile.createdAt === 'number' && Number.isFinite(profile.createdAt);
    });
  } catch {
    return [];
  }
}

function loadSavedProfileBindings(): AudioProfileBinding[] {
  try {
    const raw = localStorage.getItem('beatnest_audio_profile_bindings');
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AudioProfileBinding => {
      if (!item || typeof item !== 'object') return false;
      const binding = item as Partial<AudioProfileBinding>;
      return (binding.targetType === 'genre' || binding.targetType === 'playlist') &&
        typeof binding.targetId === 'string' &&
        typeof binding.profileId === 'string';
    });
  } catch {
    return [];
  }
}

const normalizeGenre = (genre: string) => genre.trim().toLocaleLowerCase();

function persistProfiles(audioProfiles: AudioProfile[]) {
  try {
    localStorage.setItem('beatnest_audio_profiles', JSON.stringify(audioProfiles));
  } catch (error) {
    console.warn('Could not save audio profiles:', error);
  }
}

function persistProfileBindings(audioProfileBindings: AudioProfileBinding[]) {
  try {
    localStorage.setItem('beatnest_audio_profile_bindings', JSON.stringify(audioProfileBindings));
  } catch (error) {
    console.warn('Could not save audio profile bindings:', error);
  }
}

export const useAudioSettingsStore = create<AudioSettingsStore>((set, get) => ({
  reverbMode: 'off',
  eqEnabled: true,
  eqGains: [0, 0, 0, 0, 0],
  activePresetId: 'flat',
  customPresets: loadSavedCustomPresets(),
  audioProfiles: loadSavedProfiles(),
  audioProfileBindings: loadSavedProfileBindings(),
  activeAudioProfileId: null,
  preampGain: 0,
  autoGainEnabled: false,

  setEqGain: (bandIndex, gain) => {
    const gains = [...get().eqGains] as [number, number, number, number, number];
    gains[bandIndex] = gain;
    audioEngine.setEqGain(bandIndex, gain);
    set({ eqGains: gains, activePresetId: 'custom', activeAudioProfileId: null });
  },

  setEqPreset: (presetId) => {
    const preset = DEFAULT_PRESETS.find((item) => item.id === presetId)
      ?? get().customPresets.find((item) => item.id === presetId);
    if (!preset) return;

    audioEngine.applyPreset(preset.gains);
    set({ eqGains: [...preset.gains], activePresetId: presetId, activeAudioProfileId: null });
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
    set({ customPresets, activePresetId: preset.id, activeAudioProfileId: null });
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

  saveAudioProfile: (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;
    const state = get();
    const profile: AudioProfile = {
      id: `audio_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      eqGains: [...state.eqGains],
      eqEnabled: state.eqEnabled,
      reverbMode: state.reverbMode,
      preampGain: state.preampGain,
      autoGainEnabled: state.autoGainEnabled,
      createdAt: Date.now(),
    };
    const audioProfiles = [...state.audioProfiles, profile];
    persistProfiles(audioProfiles);
    set({ audioProfiles, activeAudioProfileId: profile.id });
    return profile.id;
  },

  deleteAudioProfile: (id) => {
    const audioProfiles = get().audioProfiles.filter((profile) => profile.id !== id);
    const audioProfileBindings = get().audioProfileBindings.filter((binding) => binding.profileId !== id);
    persistProfiles(audioProfiles);
    persistProfileBindings(audioProfileBindings);
    set({
      audioProfiles,
      audioProfileBindings,
      activeAudioProfileId: get().activeAudioProfileId === id ? null : get().activeAudioProfileId,
    });
  },

  bindAudioProfile: (targetType, targetId, profileId) => {
    const normalizedId = targetType === 'genre' ? normalizeGenre(targetId) : targetId;
    const remaining = get().audioProfileBindings.filter((binding) => !(
      binding.targetType === targetType && binding.targetId === normalizedId
    ));
    const audioProfileBindings = profileId
      ? [...remaining, { targetType, targetId: normalizedId, profileId }]
      : remaining;
    persistProfileBindings(audioProfileBindings);
    set({ audioProfileBindings });
  },

  applyAudioProfile: (id) => {
    const profile = get().audioProfiles.find((item) => item.id === id);
    if (!profile) return;
    audioEngine.applyPreset(profile.eqGains);
    audioEngine.setEqEnabled(profile.eqEnabled, profile.eqGains);
    audioEngine.setSpatialReverb(profile.reverbMode);
    audioEngine.setPreampGain(profile.preampGain);
    audioEngine.setAutoGainEnabled(profile.autoGainEnabled);
    set({
      eqGains: [...profile.eqGains],
      eqEnabled: profile.eqEnabled,
      activePresetId: 'custom',
      activeAudioProfileId: profile.id,
      reverbMode: profile.reverbMode,
      preampGain: profile.preampGain,
      autoGainEnabled: profile.autoGainEnabled,
    });
  },

  applyAutomaticAudioProfile: (track, context) => {
    const { audioProfileBindings } = get();
    const playlistMatches = !!(
      context?.playlistId &&
      context.playlistTrackIds?.includes(track.id)
    );
    const playlistBinding = playlistMatches
      ? audioProfileBindings.find((binding) =>
          binding.targetType === 'playlist' && binding.targetId === context?.playlistId
        )
      : undefined;
    const genre = track.genre?.trim();
    const genreBinding = genre
      ? audioProfileBindings.find((binding) =>
          binding.targetType === 'genre' && binding.targetId === normalizeGenre(genre)
        )
      : undefined;
    const profileId = playlistBinding?.profileId ?? genreBinding?.profileId;
    if (!profileId) return;
    get().applyAudioProfile(profileId);
  },

  toggleEq: (enabled) => {
    const eqEnabled = enabled ?? !get().eqEnabled;
    audioEngine.setEqEnabled(eqEnabled, get().eqGains);
    set({ eqEnabled, activeAudioProfileId: null });
  },

  setReverbMode: (reverbMode) => {
    audioEngine.setSpatialReverb(reverbMode);
    set({ reverbMode, activeAudioProfileId: null });
  },

  setPreampGain: (preampGain) => {
    audioEngine.setPreampGain(preampGain);
    set({ preampGain, activeAudioProfileId: null });
  },

  toggleAutoGain: (enabled) => {
    const autoGainEnabled = enabled ?? !get().autoGainEnabled;
    audioEngine.setAutoGainEnabled(autoGainEnabled);
    set({ autoGainEnabled, activeAudioProfileId: null });
  },
}));
