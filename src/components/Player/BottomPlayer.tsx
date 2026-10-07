import React, { useState } from 'react';
import {
  Sliders,
  Activity,
  Heart,
  ListMusic,
  Minimize2,
  Music,
  AlignLeft,
  Timer,
  Share2,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { useSleepTimerStore } from '../../stores/useSleepTimerStore';
import { WaveformScrubber } from './WaveformScrubber';
import { QueueDrawer } from './QueueDrawer';
import { PlayingIndicator } from '../Common/PlayingIndicator';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { PlayerMenus } from './PlayerMenus';

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
    eqEnabled,
  } = usePlayerStore();

  const {
    isLyricsOpen,
    isMiniPlayer,
    toggleVisualizer,
    toggleEqualizer,
    toggleMiniPlayer,
    toggleLyrics,
  } = useUIStore();

  const { toggleFavorite } = useLibraryStore();
  const { activeOption: sleepTimerOption, toggleModal: toggleSleepTimerModal } = useSleepTimerStore();
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  if (isMiniPlayer) return null;

  const isFavorite = currentTrack?.isFavorite ?? false;

  return (
    <>
      <footer className="absolute bottom-2.5 sm:bottom-3.5 left-2.5 right-2.5 sm:left-4 sm:right-4 md:left-6 md:right-6 max-w-6xl mx-auto z-30 liquid-dock rounded-2xl sm:rounded-3xl p-2.5 sm:px-4 md:px-5 sm:py-2.5 md:py-3 select-none transition-all">
        {/* Desktop & Tablet Layout (>= md) */}
        <div className="hidden md:flex items-center justify-between gap-3 lg:gap-4">
          {/* Left: Track Info & Favorite */}
          <div className="flex items-center gap-3 w-1/4 min-w-[180px] max-w-[260px] shrink-0">
            <div className="relative w-11 h-11 lg:w-12 lg:h-12 rounded-2xl overflow-hidden bg-[var(--app-surface-elevated)] border border-[var(--liquid-glass-border)] shrink-0 flex items-center justify-center shadow-md transition-all">
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : ''
                  }`}
                />
              ) : (
                <Music
                  size={20}
                  className={isPlaying ? 'text-[#4FD1C5]' : 'text-[#7C5CFF]'}
                />
              )}

              {/* Live Playing Indicator */}
              {currentTrack && (
                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded-md bg-black/75 backdrop-blur-sm flex items-center shadow-md">
                  <PlayingIndicator isPlaying={isPlaying} color="accent" size="xs" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-semibold text-[var(--app-text)] truncate">
                {currentTrack ? currentTrack.title : 'BeatNest'}
              </p>
              <p className="text-[11px] lg:text-xs text-[var(--app-text-muted)] truncate">
                {currentTrack
                  ? `${currentTrack.artist} • ${currentTrack.album}`
                  : 'Selecciona una pista para reproducir'}
              </p>
            </div>

            {currentTrack && (
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={`p-1.5 lg:p-2 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                  isFavorite
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-[var(--app-text-muted)] hover:text-red-500 hover:bg-[var(--app-surface-hover)]'
                }`}
                title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex-1 flex flex-col items-center max-w-xl min-w-0 px-2">
            <PlaybackControls
              isPlaying={isPlaying}
              isShuffled={isShuffled}
              repeatMode={repeatMode}
              canPlay={!!currentTrack || queue.length > 0}
              hasTrack={!!currentTrack}
              onTogglePlay={togglePlay}
              onPrevTrack={prevTrack}
              onNextTrack={() => nextTrack(true)}
              onToggleShuffle={toggleShuffle}
              onCycleRepeat={cycleRepeat}
            />

            {/* Waveform Scrubber */}
            <WaveformScrubber
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              isPlaying={isPlaying}
            />
          </div>

          {/* Right: Tools & Volume */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 justify-end w-1/4 min-w-fit">
            <PlayerMenus
              playbackRate={playbackRate}
              crossfadeDuration={crossfadeDuration}
              onSelectPlaybackRate={setPlaybackRate}
              onSelectCrossfadeDuration={setCrossfadeDuration}
            />

            {/* Lyrics trigger */}
            <button
              onClick={() => toggleLyrics(true)}
              className={`p-1.5 lg:p-2 rounded-xl transition-colors relative ${
                isLyricsOpen
                  ? 'bg-[var(--app-accent)]/20 text-[var(--app-accent)] font-bold'
                  : currentTrack?.lyrics
                  ? 'text-[var(--app-accent)] hover:bg-[var(--app-accent)]/15'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
              }`}
              title="Letras sincronizadas"
            >
              <AlignLeft size={16} />
              {currentTrack?.lyrics && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--app-accent)]" />
              )}
            </button>

            {/* Equalizer trigger */}
            <button
              onClick={() => toggleEqualizer(true)}
              className={`p-1.5 lg:p-2 rounded-xl transition-colors relative ${
                eqEnabled
                  ? 'text-[#7C5CFF] bg-[#7C5CFF]/15'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
              }`}
              title="Ecualizador de 5 bandas"
            >
              <Sliders size={16} />
              {eqEnabled && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--app-accent)]" />
              )}
            </button>

            {/* Visualizer trigger */}
            <button
              onClick={() => toggleVisualizer(true)}
              className="p-1.5 lg:p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:bg-[var(--app-surface-hover)] transition-colors"
              title="Visualizador de audio"
            >
              <Activity size={16} />
            </button>

            {/* Sleep Timer trigger */}
            <button
              onClick={() => toggleSleepTimerModal(true)}
              className={`p-1.5 lg:p-2 rounded-xl transition-colors relative ${
                sleepTimerOption !== null
                  ? 'text-[#4FD1C5] bg-[#4FD1C5]/15 font-bold'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
              }`}
              title="Temporizador de apagado"
            >
              <Timer size={16} />
              {sleepTimerOption !== null && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4FD1C5] animate-pulse" />
              )}
            </button>

            {/* Share Track Card trigger */}
            {currentTrack && (
              <button
                onClick={() => useUIStore.getState().toggleShareTrack(true)}
                className="hidden xl:flex p-1.5 lg:p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
                title="Compartir tarjeta de canción"
              >
                <Share2 size={16} />
              </button>
            )}

            {/* Mini Player mode toggle */}
            <button
              onClick={() => toggleMiniPlayer(true)}
              className="hidden lg:flex p-1.5 lg:p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
              title="Modo mini reproductor"
            >
              <Minimize2 size={16} />
            </button>

            {/* Queue trigger */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-1.5 lg:p-2 rounded-xl transition-colors relative ${
                isQueueOpen
                  ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
              }`}
              title="Cola de reproducción"
            >
              <ListMusic size={16} />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[var(--app-accent)] text-white text-[10px] font-bold">
                  {queue.length}
                </span>
              )}
            </button>

            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
            />
          </div>
        </div>

        {/* Mobile Layout (< md) */}
        <div className="flex flex-col gap-2 md:hidden">
          {/* Top row: Track Info & Primary Controls */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--app-surface-elevated)] border border-[var(--liquid-glass-border)] shrink-0 flex items-center justify-center">
                {currentTrack?.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music size={17} className="text-[#7C5CFF]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--app-text)] truncate">
                  {currentTrack ? currentTrack.title : 'BeatNest'}
                </p>
                <p className="text-[11px] text-[var(--app-text-muted)] truncate">
                  {currentTrack ? currentTrack.artist : 'Sin reproducción'}
                </p>
              </div>
            </div>

            {/* Primary Mobile Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {currentTrack && (
                <button
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isFavorite ? 'text-red-500' : 'text-[var(--app-text-muted)]'
                  }`}
                  title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}

              <button
                onClick={togglePlay}
                disabled={!currentTrack && queue.length === 0}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40"
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
              </button>

              <button
                onClick={() => nextTrack(true)}
                disabled={!currentTrack}
                className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] disabled:opacity-40"
                title="Siguiente pista"
              >
                <SkipForward size={17} />
              </button>

              <button
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className={`p-1.5 rounded-lg transition-colors relative ${
                  isQueueOpen ? 'text-[#7C5CFF]' : 'text-[var(--app-text-muted)]'
                }`}
                title="Cola de reproducción"
              >
                <ListMusic size={17} />
                {queue.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[var(--app-accent)]" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Waveform Scrubber */}
          <div className="px-1">
            <WaveformScrubber
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              isPlaying={isPlaying}
            />
          </div>
        </div>
      </footer>

      {/* Slide-out Queue Drawer */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
};
