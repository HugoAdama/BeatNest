import { create } from 'zustand';
import type { SleepTimerOption } from '../types/music';
import { audioEngine } from '../lib/audioEngine';
import { usePlayerStore } from './usePlayerStore';

interface SleepTimerStore {
  activeOption: SleepTimerOption;
  secondsRemaining: number | null;
  isFadingOut: boolean;
  isModalOpen: boolean;

  // Actions
  setSleepTimer: (option: SleepTimerOption) => void;
  cancelSleepTimer: () => void;
  toggleModal: (open?: boolean) => void;
}

let timerInterval: ReturnType<typeof setInterval> | null = null;

export const useSleepTimerStore = create<SleepTimerStore>((set, get) => ({
  activeOption: null,
  secondsRemaining: null,
  isFadingOut: false,
  isModalOpen: false,

  toggleModal: (open?: boolean) =>
    set((state) => ({
      isModalOpen: open !== undefined ? open : !state.isModalOpen,
    })),

  setSleepTimer: (option: SleepTimerOption) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (!option) {
      const vol = usePlayerStore.getState().volume;
      audioEngine.restoreVolume(vol);
      set({ activeOption: null, secondsRemaining: null, isFadingOut: false });
      return;
    }

    if (option === 'track_end') {
      const currentTrack = usePlayerStore.getState().currentTrack;
      const duration = usePlayerStore.getState().duration;
      const currentTime = usePlayerStore.getState().currentTime;
      const remaining = currentTrack && duration > currentTime ? Math.round(duration - currentTime) : 180;

      set({
        activeOption: 'track_end',
        secondsRemaining: remaining,
        isFadingOut: false,
      });

      timerInterval = setInterval(() => {
        const { secondsRemaining, isFadingOut } = get();
        if (secondsRemaining === null || secondsRemaining <= 1) {
          if (timerInterval) clearInterval(timerInterval);
          timerInterval = null;
          usePlayerStore.getState().togglePlay();
          const vol = usePlayerStore.getState().volume;
          audioEngine.restoreVolume(vol);
          set({ activeOption: null, secondsRemaining: null, isFadingOut: false });
          return;
        }

        if (secondsRemaining <= 15 && !isFadingOut) {
          audioEngine.fadeOut(secondsRemaining);
          set({ isFadingOut: true });
        }

        set({ secondsRemaining: secondsRemaining - 1 });
      }, 1000);
      return;
    }

    // Number option (15, 30, 45, 60 minutes)
    const initialSeconds = option * 60;
    set({
      activeOption: option,
      secondsRemaining: initialSeconds,
      isFadingOut: false,
    });

    timerInterval = setInterval(() => {
      const { secondsRemaining, isFadingOut } = get();
      if (secondsRemaining === null || secondsRemaining <= 1) {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        usePlayerStore.getState().togglePlay();
        const vol = usePlayerStore.getState().volume;
        audioEngine.restoreVolume(vol);
        set({ activeOption: null, secondsRemaining: null, isFadingOut: false });
        return;
      }

      // Smooth fade-out in the last 45 seconds
      if (secondsRemaining <= 45 && !isFadingOut) {
        audioEngine.fadeOut(secondsRemaining);
        set({ isFadingOut: true });
      }

      set({ secondsRemaining: secondsRemaining - 1 });
    }, 1000);
  },

  cancelSleepTimer: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const vol = usePlayerStore.getState().volume;
    audioEngine.restoreVolume(vol);
    set({ activeOption: null, secondsRemaining: null, isFadingOut: false });
  },
}));
