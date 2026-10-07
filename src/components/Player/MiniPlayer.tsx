import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Music,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { PlayingIndicator } from '../Common/PlayingIndicator';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
  } = usePlayerStore();

  const { isMiniPlayer, toggleMiniPlayer } = useUIStore();

  if (!isMiniPlayer || !currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-[var(--app-surface)]/95 backdrop-blur-xl border border-[var(--app-border)] rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
      {/* Top thin progress line */}
      <div className="w-full h-1 bg-[var(--app-surface-elevated)]">
        <div
          className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#4FD1C5] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-3.5 flex items-center gap-3">
        {/* Cover Art */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[var(--app-surface-elevated)] border border-[var(--app-border)] shrink-0 flex items-center justify-center">
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isPlaying ? 'scale-105' : ''
              }`}
            />
          ) : (
            <Music size={18} className="text-[#7C5CFF]" />
          )}

          {/* Mini playing indicator */}
          <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 backdrop-blur-sm flex items-center">
            <PlayingIndicator isPlaying={isPlaying} color="accent" size="xs" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--app-text)] truncate">
            {currentTrack.title}
          </p>
          <p className="text-[11px] text-[var(--app-text-muted)] truncate">
            {currentTrack.artist}
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevTrack}
            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-all hover:scale-105 active:scale-95"
            title="Anterior"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={togglePlay}
            className={`p-2 rounded-xl bg-[#7C5CFF] text-white hover:bg-[#6D48F7] active:scale-90 hover:scale-105 transition-all shadow-[0_0_12px_rgba(124,92,255,0.4)] ${
              isPlaying ? 'ring-2 ring-[#7C5CFF]/40 shadow-[0_0_16px_rgba(124,92,255,0.6)]' : ''
            }`}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
          </button>
          <button
            onClick={() => nextTrack(true)}
            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
          >
            <SkipForward size={15} />
          </button>
          <button
            onClick={() => toggleMiniPlayer(false)}
            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:bg-[var(--app-surface-elevated)] transition-colors ml-1"
            title="Restaurar reproductor"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
