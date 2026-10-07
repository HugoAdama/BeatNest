import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import type { RepeatMode } from '../../types/music';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  canPlay: boolean;
  hasTrack: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isShuffled,
  repeatMode,
  canPlay,
  hasTrack,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onToggleShuffle,
  onCycleRepeat,
}) => {
  return (
    <div className="flex items-center gap-3 mb-1">
      {/* Shuffle button */}
      <button
        onClick={onToggleShuffle}
        className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
          isShuffled
            ? 'text-[var(--app-accent)] bg-[var(--app-accent)]/15 font-bold'
            : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
        }`}
        title={isShuffled ? 'Aleatorio activado' : 'Aleatorio desactivado'}
      >
        <Shuffle size={16} />
      </button>

      {/* Prev button */}
      <button
        onClick={onPrevTrack}
        disabled={!hasTrack}
        className="p-2 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
        title="Pista anterior"
      >
        <SkipBack size={18} />
      </button>

      {/* Play / Pause main button */}
      <button
        onClick={onTogglePlay}
        disabled={!canPlay}
        className={`p-3 rounded-2xl bg-[#7C5CFF] text-white hover:bg-[#6D48F7] active:scale-90 hover:scale-105 transition-all shadow-[0_4px_16px_rgba(124,92,255,0.4)] disabled:opacity-30 disabled:hover:bg-[#7C5CFF] ${
          isPlaying ? 'ring-2 ring-[#7C5CFF]/50 shadow-[0_0_22px_rgba(124,92,255,0.6)]' : ''
        }`}
        title={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? (
          <Pause size={20} />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
      </button>

      {/* Next button */}
      <button
        onClick={onNextTrack}
        disabled={!canPlay}
        className="p-2 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
        title="Siguiente pista"
      >
        <SkipForward size={18} />
      </button>

      {/* Repeat button */}
      <button
        onClick={onCycleRepeat}
        className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 relative ${
          repeatMode !== 'off'
            ? 'text-[var(--app-accent)] bg-[var(--app-accent)]/15 font-bold'
            : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
        }`}
        title={
          repeatMode === 'one'
            ? 'Repetir una pista'
            : repeatMode === 'all'
            ? 'Repetir todo'
            : 'No repetir'
        }
      >
        {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
      </button>
    </div>
  );
};
