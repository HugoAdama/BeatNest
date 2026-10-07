import { create } from 'zustand';
import type { Track, RepeatMode, VisualizerMode } from '../types/music';
import { audioEngine, DEFAULT_PRESETS } from '../lib/audioEngine';
import { db } from '../db';

interface PlayerStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  playbackRate: number;
  crossfadeDuration: number; // in seconds (0 = off)
  queue: Track[];
  queueIndex: number;
  isMiniPlayer: boolean;
  isVisualizerOpen: boolean;
  visualizerMode: VisualizerMode;
  isEqualizerOpen: boolean;
  eqEnabled: boolean;
  eqGains: [number, number, number, number, number];
  activePresetId: string;
  isShortcutModalOpen: boolean;
  isLyricsOpen: boolean;

  // Actions
  initAudioListeners: () => void;
  playTrack: (track: Track, newQueue?: Track[], useCrossfade?: boolean) => Promise<void>;
  togglePlay: () => void;
  nextTrack: (useCrossfade?: boolean) => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPlaybackRate: (rate: number) => void;
  setCrossfadeDuration: (sec: number) => void;
  addToQueue: (track: Track) => void;
  playNextInQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  setEqGain: (bandIndex: number, gain: number) => void;
  setEqPreset: (presetId: string) => void;
  toggleEq: (enabled?: boolean) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  toggleVisualizer: (open?: boolean) => void;
  toggleMiniPlayer: (open?: boolean) => void;
  toggleEqualizer: (open?: boolean) => void;
  toggleShortcutModal: (open?: boolean) => void;
  toggleLyrics: (open?: boolean) => void;
  setTrackLyrics: (trackId: string, lyricsText: string) => Promise<void>;
}

let hasTriggeredAutoCrossfade = false;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  isMuted: false,
  repeatMode: 'off',
  isShuffled: false,
  playbackRate: 1.0,
  crossfadeDuration: 3,
  queue: [],
  queueIndex: -1,
  isMiniPlayer: false,
  isVisualizerOpen: false,
  visualizerMode: 'bars',
  isEqualizerOpen: false,
  eqEnabled: true,
  eqGains: [0, 0, 0, 0, 0],
  activePresetId: 'flat',
  isShortcutModalOpen: false,
  isLyricsOpen: false,

  initAudioListeners: () => {
    const bindAudioEvents = (audio: HTMLAudioElement) => {
      audio.ontimeupdate = () => {
        const activeAudio = audioEngine.getAudioElement();
        if (audio === activeAudio) {
          const cur = activeAudio.currentTime;
          const dur = activeAudio.duration && !isNaN(activeAudio.duration) ? activeAudio.duration : get().duration;
          
          set({
            currentTime: cur,
            duration: dur,
          });

          // Automatic Crossfade trigger before track ends
          const { crossfadeDuration, queue, queueIndex } = get();
          if (
            crossfadeDuration > 0 &&
            dur > crossfadeDuration * 2 &&
            dur - cur <= crossfadeDuration &&
            !hasTriggeredAutoCrossfade &&
            queueIndex < queue.length - 1
          ) {
            hasTriggeredAutoCrossfade = true;
            get().nextTrack(true);
          }
        }
      };

      audio.onended = () => {
        const activeAudio = audioEngine.getAudioElement();
        if (audio === activeAudio) {
          const { repeatMode, nextTrack } = get();
          if (repeatMode === 'one') {
            activeAudio.currentTime = 0;
            activeAudio.play().catch(console.warn);
          } else {
            nextTrack(false);
          }
        }
      };

      audio.onplay = () => set({ isPlaying: true });
      audio.onpause = () => {
        if (!audioEngine.isChannelCrossfading()) {
          set({ isPlaying: false });
        }
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        set({ isPlaying: false });
      };
    };

    bindAudioEvents(audioEngine.getAudioElement());
    bindAudioEvents(audioEngine.getInactiveAudioElement());
  },

  playTrack: async (track: Track, newQueue?: Track[], useCrossfade?: boolean) => {
    hasTriggeredAutoCrossfade = false;
    let queue = get().queue;
    let queueIndex = get().queueIndex;

    if (newQueue) {
      queue = [...newQueue];
      queueIndex = queue.findIndex((t) => t.id === track.id);
      if (queueIndex === -1) {
        queue.unshift(track);
        queueIndex = 0;
      }
    } else {
      const foundIdx = queue.findIndex((t) => t.id === track.id);
      if (foundIdx !== -1) {
        queueIndex = foundIdx;
      } else {
        queue = [...queue, track];
        queueIndex = queue.length - 1;
      }
    }

    set({
      currentTrack: track,
      queue,
      queueIndex,
      currentTime: 0,
      duration: track.duration || 0,
    });

    const crossfadeSec = useCrossfade ? get().crossfadeDuration : 0;

    if (track.file) {
      await audioEngine.loadTrack(track.file, crossfadeSec);
    } else if (track.coverUrl) {
      await audioEngine.loadTrack(track.coverUrl, crossfadeSec);
    }

    try {
      await audioEngine.play();
      set({ isPlaying: true });
    } catch (err) {
      console.warn('Playback autoplay was prevented or failed:', err);
    }

    // Media Session API integration
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.coverUrl
          ? [{ src: track.coverUrl, sizes: '512x512', type: 'image/png' }]
          : [],
      });

      navigator.mediaSession.setActionHandler('play', () => get().togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => get().togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => get().prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => get().nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          get().seek(details.seekTime);
        }
      });
    }
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }
    if (!currentTrack) return;

    if (isPlaying) {
      audioEngine.pause();
      set({ isPlaying: false });
    } else {
      audioEngine.play().then(() => {
        set({ isPlaying: true });
      }).catch(console.warn);
    }
  },

  nextTrack: (useCrossfade?: boolean) => {
    const { queue, queueIndex, repeatMode, isShuffled } = get();
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;

    if (isShuffled && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === queueIndex && queue.length > 1);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        audioEngine.pause();
        set({ isPlaying: false, currentTime: 0 });
        return;
      }
    }

    const nextTrk = queue[nextIndex];
    if (nextTrk) {
      get().playTrack(nextTrk, undefined, useCrossfade);
    }
  },

  prevTrack: () => {
    const { queue, queueIndex, currentTime } = get();
    if (queue.length === 0) return;

    if (currentTime > 3) {
      get().seek(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevTrk = queue[prevIndex];
    if (prevTrk) {
      get().playTrack(prevTrk);
    }
  },

  seek: (seconds: number) => {
    audioEngine.seek(seconds);
    set({ currentTime: seconds });
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    audioEngine.setVolume(clamped);
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const newMuted = !isMuted;
    audioEngine.setMuted(newMuted);
    set({ isMuted: newMuted });
    if (!newMuted && volume === 0) {
      get().setVolume(0.5);
    }
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffled: !state.isShuffled }));
  },

  cycleRepeat: () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIdx = modes.indexOf(get().repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    set({ repeatMode: nextMode });
  },

  setPlaybackRate: (rate: number) => {
    audioEngine.setPlaybackRate(rate);
    set({ playbackRate: rate });
  },

  setCrossfadeDuration: (sec: number) => {
    set({ crossfadeDuration: Math.max(0, Math.min(12, sec)) });
  },

  addToQueue: (track: Track) => {
    set((state) => ({ queue: [...state.queue, track] }));
  },

  playNextInQueue: (track: Track) => {
    set((state) => {
      const newQueue = [...state.queue];
      const insertIdx = state.queueIndex + 1;
      newQueue.splice(insertIdx, 0, track);
      return { queue: newQueue };
    });
  },

  removeFromQueue: (index: number) => {
    set((state) => {
      const newQueue = state.queue.filter((_, i) => i !== index);
      let newQueueIndex = state.queueIndex;
      if (index < state.queueIndex) {
        newQueueIndex -= 1;
      }
      return { queue: newQueue, queueIndex: newQueueIndex };
    });
  },

  clearQueue: () => {
    set({ queue: [], queueIndex: -1 });
  },

  reorderQueue: (startIndex: number, endIndex: number) => {
    set((state) => {
      const newQueue = [...state.queue];
      const [removed] = newQueue.splice(startIndex, 1);
      newQueue.splice(endIndex, 0, removed);
      
      let newIdx = state.queueIndex;
      if (state.queueIndex === startIndex) {
        newIdx = endIndex;
      } else if (startIndex < state.queueIndex && endIndex >= state.queueIndex) {
        newIdx -= 1;
      } else if (startIndex > state.queueIndex && endIndex <= state.queueIndex) {
        newIdx += 1;
      }

      return { queue: newQueue, queueIndex: newIdx };
    });
  },

  setEqGain: (bandIndex: number, gain: number) => {
    const gains = [...get().eqGains] as [number, number, number, number, number];
    gains[bandIndex] = gain;
    audioEngine.setEqGain(bandIndex, gain);
    set({ eqGains: gains, activePresetId: 'custom' });
  },

  setEqPreset: (presetId: string) => {
    const preset = DEFAULT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      audioEngine.applyPreset(preset.gains);
      set({ eqGains: [...preset.gains] as [number, number, number, number, number], activePresetId: presetId });
    }
  },

  toggleEq: (enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !get().eqEnabled;
    audioEngine.setEqEnabled(newEnabled, get().eqGains);
    set({ eqEnabled: newEnabled });
  },

  setVisualizerMode: (mode: VisualizerMode) => {
    set({ visualizerMode: mode });
  },

  toggleVisualizer: (open?: boolean) => {
    set((state) => ({
      isVisualizerOpen: open !== undefined ? open : !state.isVisualizerOpen,
    }));
  },

  toggleMiniPlayer: (open?: boolean) => {
    set((state) => ({
      isMiniPlayer: open !== undefined ? open : !state.isMiniPlayer,
    }));
  },

  toggleEqualizer: (open?: boolean) => {
    set((state) => ({
      isEqualizerOpen: open !== undefined ? open : !state.isEqualizerOpen,
    }));
  },

  toggleShortcutModal: (open?: boolean) => {
    set((state) => ({
      isShortcutModalOpen: open !== undefined ? open : !state.isShortcutModalOpen,
    }));
  },

  toggleLyrics: (open?: boolean) => {
    set((state) => ({
      isLyricsOpen: open !== undefined ? open : !state.isLyricsOpen,
    }));
  },

  setTrackLyrics: async (trackId: string, lyricsText: string) => {
    // Save in active track in store
    const { currentTrack, queue } = get();
    if (currentTrack && currentTrack.id === trackId) {
      set({ currentTrack: { ...currentTrack, lyrics: lyricsText } });
    }
    const updatedQueue = queue.map((t) => t.id === trackId ? { ...t, lyrics: lyricsText } : t);
    set({ queue: updatedQueue });

    // Save in IndexedDB
    try {
      await db.tracks.update(trackId, { lyrics: lyricsText } as any);
    } catch (err) {
      console.warn('Error saving lyrics in IndexedDB:', err);
    }
  },
}));
