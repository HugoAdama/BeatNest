import { useEffect } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUIStore } from '../stores/useUIStore';
import { useLibraryStore } from '../stores/useLibraryStore';

export function useKeyboardShortcuts() {
  const {
    togglePlay,
    seek,
    currentTime,
    duration,
    volume,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    currentTrack,
  } = usePlayerStore();

  const {
    toggleVisualizer,
    toggleEqualizer,
    toggleShortcutModal,
    toggleLyrics,
    closeAllModals,
  } = useUIStore();

  const { toggleFavorite } = useLibraryStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (duration > 0) {
            seek(Math.min(duration, currentTime + 5));
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;

        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;

        case 'KeyL':
          if (currentTrack) {
            e.preventDefault();
            toggleFavorite(currentTrack.id);
          }
          break;

        case 'KeyS':
          e.preventDefault();
          toggleShuffle();
          break;

        case 'KeyR':
          e.preventDefault();
          cycleRepeat();
          break;

        case 'KeyV':
          e.preventDefault();
          toggleVisualizer();
          break;

        case 'KeyE':
          e.preventDefault();
          toggleEqualizer();
          break;

        case 'KeyT':
          e.preventDefault();
          toggleLyrics();
          break;

        case 'Slash':
          if (e.shiftKey) {
            // '?' key
            e.preventDefault();
            toggleShortcutModal();
          }
          break;

        case 'Escape':
          closeAllModals();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    seek,
    currentTime,
    duration,
    volume,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleVisualizer,
    toggleEqualizer,
    toggleShortcutModal,
    toggleLyrics,
    closeAllModals,
    currentTrack,
    toggleFavorite,
  ]);
}
