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
    <div className="flex items-center gap-1.5 sm:gap-3 mb-0.5">
      {/* Shuffle button */}
      <button
        onClick={onToggleShuffle}
        className={`p-1.5 sm:p-2 rounded-xl transition-all hover:scale-105 active:scale-95 ${
          isShuffled
            ? 'text-[#4FD1C5] bg-[#4FD1C5]/15 font-bold shadow-sm'
            : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
        }`}
        title={isShuffled ? 'Modo aleatorio activado' : 'Activar aleatorio'}
      >
        <Shuffle size={15} />
      </button>

      {/* Prev button */}
      <button
        onClick={onPrevTrack}
        disabled={!hasTrack}
        className="p-1.5 sm:p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
        title="Pista anterior"
      >
        <SkipBack size={17} />
      </button>

      {/* Play / Pause Hero Button */}
      <button
        onClick={onTogglePlay}
        disabled={!canPlay}
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#6366F1] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(124,92,255,0.45)] border border-white/20 disabled:opacity-30 disabled:scale-100 ${
          isPlaying ? 'ring-2 ring-[#7C5CFF]/40 shadow-[0_0_25px_rgba(124,92,255,0.6)]' : ''
        }`}
        title={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? (
          <Pause size={19} />
        ) : (
          <Play size={19} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      {/* Next button */}
      <button
        onClick={onNextTrack}
        disabled={!canPlay}
        className="p-1.5 sm:p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
        title="Siguiente pista"
      >
        <SkipForward size={17} />
      </button>

      {/* Repeat button */}
      <button
        onClick={onCycleRepeat}
        className={`p-1.5 sm:p-2 rounded-xl transition-all hover:scale-105 active:scale-95 relative ${
          repeatMode !== 'off'
            ? 'text-[#4FD1C5] bg-[#4FD1C5]/15 font-bold shadow-sm'
            : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
        }`}
        title={
          repeatMode === 'one'
            ? 'Repetir una pista'
            : repeatMode === 'all'
            ? 'Repetir todo'
            : 'No repetir'
        }
      >
        {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
      </button>
    </div>
  );
};
