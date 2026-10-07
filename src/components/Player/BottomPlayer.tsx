import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Sliders,
  Activity,
  Heart,
  ListMusic,
  Minimize2,
  Music,
  Gauge,
  AlignLeft,
  Layers,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { WaveformScrubber } from './WaveformScrubber';
import { QueueDrawer } from './QueueDrawer';

export const BottomPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    playbackRate,
    crossfadeDuration,
    queue,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setPlaybackRate,
    setCrossfadeDuration,
    toggleVisualizer,
    toggleEqualizer,
    toggleMiniPlayer,
    toggleLyrics,
    isLyricsOpen,
    isMiniPlayer,
    eqEnabled,
  } = usePlayerStore();

  const { toggleFavorite } = useLibraryStore();
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showCrossfadeMenu, setShowCrossfadeMenu] = useState(false);

  const speedOptions = [0.8, 1.0, 1.25, 1.5, 2.0];
  const crossfadeOptions = [
    { sec: 0, label: 'Desactivado' },
    { sec: 2, label: '2 segundos' },
    { sec: 3, label: '3 segundos' },
    { sec: 5, label: '5 segundos' },
    { sec: 8, label: '8 segundos' },
  ];

  if (isMiniPlayer) return null;

  const isFavorite = currentTrack?.isFavorite ?? false;

  return (
    <>
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-[var(--app-surface)]/95 backdrop-blur-xl border-t border-[var(--app-border)] px-4 py-2.5 select-none transition-colors shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Track Info & Favorite */}
          <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0 justify-between md:justify-start">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[var(--app-surface-elevated)] border border-[var(--app-border)] shrink-0 flex items-center justify-center shadow-md">
                {currentTrack?.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music size={20} className="text-[#7C5CFF]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--app-text)] truncate">
                  {currentTrack ? currentTrack.title : 'BeatNest'}
                </p>
                <p className="text-xs text-[var(--app-text-muted)] truncate">
                  {currentTrack
                    ? `${currentTrack.artist} • ${currentTrack.album}`
                    : 'Selecciona una pista para reproducir'}
                </p>
              </div>
            </div>

            {currentTrack && (
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-[var(--app-text-muted)] hover:text-red-500 hover:bg-[var(--app-surface-elevated)]'
                }`}
                title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex flex-col items-center w-full md:w-1/2 max-w-xl">
            {/* Playback action buttons */}
            <div className="flex items-center gap-3 mb-1">
              {/* Shuffle button */}
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-lg transition-all ${
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
                onClick={prevTrack}
                disabled={!currentTrack}
                className="p-2 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] disabled:opacity-30 transition-colors"
                title="Pista anterior"
              >
                <SkipBack size={18} />
              </button>

              {/* Play / Pause main button */}
              <button
                onClick={togglePlay}
                disabled={!currentTrack && queue.length === 0}
                className="p-3 rounded-2xl bg-[#7C5CFF] text-white hover:bg-[#6D48F7] active:scale-95 transition-all shadow-[0_4px_16px_rgba(124,92,255,0.4)] disabled:opacity-30 disabled:hover:bg-[#7C5CFF]"
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
                onClick={() => nextTrack(true)}
                disabled={!currentTrack && queue.length === 0}
                className="p-2 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] disabled:opacity-30 transition-colors"
                title="Siguiente pista"
              >
                <SkipForward size={18} />
              </button>

              {/* Repeat button */}
              <button
                onClick={cycleRepeat}
                className={`p-2 rounded-lg transition-all relative ${
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

            {/* Waveform Scrubber */}
            <WaveformScrubber
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              isPlaying={isPlaying}
            />
          </div>

          {/* Right: Tools & Volume */}
          <div className="flex items-center gap-1.5 w-full md:w-1/4 justify-end">
            {/* Speed menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowCrossfadeMenu(false);
                }}
                className="p-2 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors flex items-center gap-1 text-xs font-mono"
                title="Velocidad de reproducción"
              >
                <Gauge size={16} />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-11 right-0 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl shadow-xl p-1 z-50 flex flex-col min-w-20">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackRate(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`px-3 py-1.5 text-xs font-mono rounded-lg text-left transition-colors ${
                        playbackRate === speed
                          ? 'bg-[#7C5CFF] text-white'
                          : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Crossfade menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCrossfadeMenu(!showCrossfadeMenu);
                  setShowSpeedMenu(false);
                }}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono ${
                  crossfadeDuration > 0
                    ? 'text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10 font-bold'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
                }`}
                title="Transición suave (Crossfade)"
              >
                <Layers size={16} />
                <span>{crossfadeDuration > 0 ? `${crossfadeDuration}s` : 'Off'}</span>
              </button>

              {showCrossfadeMenu && (
                <div className="absolute bottom-11 right-0 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl shadow-xl p-1.5 z-50 flex flex-col min-w-36 text-xs">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-[var(--app-text-muted)] border-b border-[var(--app-border)] mb-1">
                    Crossfade entre pistas
                  </div>
                  {crossfadeOptions.map((opt) => (
                    <button
                      key={opt.sec}
                      onClick={() => {
                        setCrossfadeDuration(opt.sec);
                        setShowCrossfadeMenu(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        crossfadeDuration === opt.sec
                          ? 'bg-[#7C5CFF] text-white font-medium'
                          : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lyrics trigger */}
            <button
              onClick={() => toggleLyrics(true)}
              className={`p-2 rounded-lg transition-colors relative ${
                isLyricsOpen
                  ? 'bg-[var(--app-accent)]/20 text-[var(--app-accent)] font-bold'
                  : currentTrack?.lyrics
                  ? 'text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
              }`}
              title="Letras sincronizadas"
            >
              <AlignLeft size={18} />
              {currentTrack?.lyrics && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--app-accent)]" />
              )}
            </button>

            {/* Equalizer trigger */}
            <button
              onClick={() => toggleEqualizer(true)}
              className={`p-2 rounded-lg transition-colors relative ${
                eqEnabled
                  ? 'text-[#7C5CFF] hover:bg-[#7C5CFF]/15'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
              }`}
              title="Ecualizador de 5 bandas"
            >
              <Sliders size={18} />
              {eqEnabled && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--app-accent)]" />
              )}
            </button>

            {/* Visualizer trigger */}
            <button
              onClick={() => toggleVisualizer(true)}
              className="p-2 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10 transition-colors"
              title="Visualizador de audio con Canvas"
            >
              <Activity size={18} />
            </button>

            {/* Mini Player mode toggle */}
            <button
              onClick={() => toggleMiniPlayer(true)}
              className="hidden lg:flex p-2 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
              title="Modo mini reproductor flotante"
            >
              <Minimize2 size={18} />
            </button>

            {/* Queue trigger */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-lg transition-colors relative ${
                isQueueOpen
                  ? 'bg-[#7C5CFF] text-white shadow-sm'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
              }`}
              title="Cola de reproducción"
            >
              <ListMusic size={18} />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[var(--app-accent)] text-white text-[10px] font-bold">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={toggleMute}
                className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : volume < 0.5 ? (
                  <Volume1 size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-18 h-1.5 bg-[var(--app-border)] rounded-lg cursor-pointer accent-[#7C5CFF]"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Slide-out Queue Drawer */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
};
