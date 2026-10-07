import { create } from 'zustand';
import type { Track, RepeatMode } from '../types/music';
import { audioEngine } from '../lib/audioEngine';
import { db } from '../db';
import { showToast } from './useToastStore';
import { generateDemoArpeggioTrack } from '../lib/audioGenerator';

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
  recentTracks: Track[];
  // Actions
  initAudioListeners: () => void;
  playTrack: (track: Track, newQueue?: Track[], useCrossfade?: boolean) => Promise<void>;
  play: () => void;
  pause: () => void;
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
  clearQueueUpcoming: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  setTrackLyrics: (trackId: string, lyricsText: string) => Promise<void>;
  updateTrackInPlayer: (trackId: string, updates: Partial<Track>) => void;
}

const loadSavedCrossfade = (): number => {
  if (typeof window === 'undefined') return 3;
  const val = localStorage.getItem('beatnest_crossfade');
  if (val !== null) {
    const num = Number(val);
    if (!isNaN(num) && num >= 0 && num <= 12) return num;
  }
  return 3;
};

let lastCrossfadedTrackId: string | null = null;

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
  crossfadeDuration: loadSavedCrossfade(),
  queue: [],
  queueIndex: -1,
  recentTracks: [],

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
          const { crossfadeDuration, queue, queueIndex, repeatMode, currentTrack } = get();
          const hasNext = queueIndex < queue.length - 1 || repeatMode === 'all';
          if (
            crossfadeDuration > 0 &&
            currentTrack &&
            cur >= 1.2 &&
            dur > crossfadeDuration + 0.5 &&
            dur - cur <= crossfadeDuration &&
            lastCrossfadedTrackId !== currentTrack.id &&
            hasNext &&
            repeatMode !== 'one'
          ) {
            lastCrossfadedTrackId = currentTrack.id;
            get().nextTrack(true);
          }
        }
      };

      audio.onended = () => {
        const activeAudio = audioEngine.getAudioElement();
        // Only the current active audio ending triggers nextTrack.
        // Outgoing audio from a crossfade is silenced and ignored.
        if (audio === activeAudio) {
          const { repeatMode, queue, nextTrack } = get();
          if (repeatMode === 'one') {
            activeAudio.currentTime = 0;
            activeAudio.play().catch(console.warn);
          } else if (queue.length === 0 && repeatMode === 'all') {
            activeAudio.currentTime = 0;
            activeAudio.play().catch(console.warn);
          } else if (queue.length === 0) {
            set({ isPlaying: false, currentTime: 0 });
          } else {
            nextTrack(false);
          }
        }
      };

      audio.onplay = () => {
        if (audio === audioEngine.getAudioElement()) {
          set({ isPlaying: true });
        }
      };

      audio.onpause = () => {
        if (audio === audioEngine.getAudioElement() && !audioEngine.isChannelCrossfading()) {
          set({ isPlaying: false });
        }
      };

      audio.onerror = (e) => {
        if (audio === audioEngine.getAudioElement()) {
          console.warn('Audio playback error:', e);
          set({ isPlaying: false });
        }
      };
    };

    bindAudioEvents(audioEngine.getAudioElement());
    bindAudioEvents(audioEngine.getInactiveAudioElement());
    audioEngine.setVolume(get().volume);
  },

  playTrack: async (track: Track, newQueue?: Track[], useCrossfade?: boolean) => {
    if (!useCrossfade) {
      lastCrossfadedTrackId = null;
    }
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

    // Regenerate synthetic demo track if audio file is not in memory/storage
    if (!track.file && (track.fileName === 'demo_arpeggio.wav' || track.title === 'Demo Arpeggio')) {
      try {
        const demoFile = await generateDemoArpeggioTrack();
        track.file = demoFile;
        db.tracks.update(track.id, { audioData: demoFile }).catch(console.warn);
      } catch (err) {
        console.warn('Could not regenerate demo track:', err);
      }
    }

    if (!track.file) {
      showToast(
        'Archivo no disponible',
        'Vuelve a añadir o importar el archivo de audio para reproducir esta pista.',
        'warning'
      );
      set({ isPlaying: false });
      return;
    }

    const filteredRecent = get().recentTracks.filter((t) => t.id !== track.id);
    set({
      currentTrack: track,
      queue,
      queueIndex,
      recentTracks: [track, ...filteredRecent].slice(0, 50),
      currentTime: 0,
      duration: track.duration || 0,
    });

    const isAlreadyPlaying = get().isPlaying && !!audioEngine.getAudioElement().src;
    const shouldCrossfade = useCrossfade !== undefined
      ? useCrossfade
      : (get().crossfadeDuration > 0 && isAlreadyPlaying);
    const crossfadeSec = shouldCrossfade ? get().crossfadeDuration : 0;
    await audioEngine.loadTrack(track.file, crossfadeSec);

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

      navigator.mediaSession.setActionHandler('play', () => get().play());
      navigator.mediaSession.setActionHandler('pause', () => get().pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => get().prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => get().nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          get().seek(details.seekTime);
        }
      });
    }
  },

  play: () => {
    const { isPlaying, currentTrack, queue } = get();
    if (isPlaying) return;
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }
    if (!currentTrack) return;

    set({ isPlaying: true });
    audioEngine.play().catch((err) => {
      set({ isPlaying: false });
      console.warn('Playback could not be resumed:', err);
    });
  },

  pause: () => {
    if (!get().isPlaying) return;
    audioEngine.pause();
    set({ isPlaying: false });
  },

  togglePlay: () => {
    if (get().isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  nextTrack: (useCrossfade?: boolean) => {
    const { queue, queueIndex, repeatMode } = get();
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;

    if (nextIndex >= queue.length) {
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
    const { queue, queueIndex, currentTime, repeatMode, currentTrack } = get();
    if (currentTime > 3) {
      get().seek(0);
      return;
    }

    if (queue.length === 0 || queueIndex < 0) {
      if (currentTrack) get().seek(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = queue.length - 1;
      } else {
        if (currentTrack) get().seek(0);
        return;
      }
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
    audioEngine.setMuted(clamped === 0);
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
    const { isShuffled, queue, queueIndex } = get();
    if (isShuffled) {
      set({ isShuffled: false });
      return;
    }

    const prefixEnd = Math.max(0, Math.min(queue.length, queueIndex + 1));
    const upcoming = queue.slice(prefixEnd);
    for (let index = upcoming.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [upcoming[index], upcoming[swapIndex]] = [upcoming[swapIndex], upcoming[index]];
    }
    set({ queue: [...queue.slice(0, prefixEnd), ...upcoming], isShuffled: true });
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
    const clamped = Math.max(0, Math.min(12, sec));
    if (typeof window !== 'undefined') {
      localStorage.setItem('beatnest_crossfade', String(clamped));
    }
    set({ crossfadeDuration: clamped });
    showToast(
      'Transición ajustada',
      clamped > 0 ? `Crossfade configurado a ${clamped}s` : 'Crossfade desactivado',
      'info'
    );
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
      if (index < 0 || index >= state.queue.length) return state;
      const newQueue = state.queue.filter((_, i) => i !== index);
      let newQueueIndex = index === state.queueIndex ? -1 : state.queueIndex;
      if (index < state.queueIndex) {
        newQueueIndex -= 1;
      }
      if (newQueue.length === 0) newQueueIndex = -1;
      return { queue: newQueue, queueIndex: newQueueIndex };
    });
  },

  clearQueue: () => {
    set({ queue: [], queueIndex: -1, isShuffled: false });
  },

  clearQueueUpcoming: () => {
    const { queue, queueIndex } = get();
    if (queueIndex >= 0 && queueIndex < queue.length) {
      set({ queue: [queue[queueIndex]], queueIndex: 0 });
    } else {
      set({ queue: [], queueIndex: -1 });
    }
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

  updateTrackInPlayer: (trackId: string, updates: Partial<Track>) => {
    const { currentTrack, queue, recentTracks } = get();
    const updatedCurrent =
      currentTrack && currentTrack.id === trackId
        ? { ...currentTrack, ...updates }
        : currentTrack;
    const updatedQueue = queue.map((t) =>
      t.id === trackId ? { ...t, ...updates } : t
    );
    const updatedRecent = recentTracks.map((t) =>
      t.id === trackId ? { ...t, ...updates } : t
    );
    set({
      currentTrack: updatedCurrent,
      queue: updatedQueue,
      recentTracks: updatedRecent,
    });
  },
}));
