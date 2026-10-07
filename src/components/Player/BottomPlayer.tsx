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
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-[var(--app-surface)]/95 backdrop-blur-xl border-t border-[var(--app-border)] px-4 py-2.5 select-none transition-colors shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Track Info & Favorite */}
          <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0 justify-between md:justify-start">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`relative w-12 h-12 rounded-xl overflow-hidden bg-[var(--app-surface-elevated)] border shrink-0 flex items-center justify-center shadow-md transition-all ${
                  isPlaying
                    ? 'border-[#7C5CFF]/70 shadow-[0_0_16px_rgba(124,92,255,0.35)] ring-1 ring-[#7C5CFF]/40'
                    : 'border-[var(--app-border)]'
                }`}
              >
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
                  <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 backdrop-blur-sm flex items-center shadow-md">
                    <PlayingIndicator isPlaying={isPlaying} color="accent" size="xs" />
                  </div>
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
                className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
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
          <div className="flex items-center gap-1.5 w-full md:w-1/4 justify-end">
            <PlayerMenus
              playbackRate={playbackRate}
              crossfadeDuration={crossfadeDuration}
              onSelectPlaybackRate={setPlaybackRate}
              onSelectCrossfadeDuration={setCrossfadeDuration}
            />

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

            {/* Sleep Timer trigger */}
            <button
              onClick={() => toggleSleepTimerModal(true)}
              className={`p-2 rounded-lg transition-colors relative ${
                sleepTimerOption !== null
                  ? 'text-[#4FD1C5] hover:bg-[#4FD1C5]/15 font-bold'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
              }`}
              title="Temporizador de apagado"
            >
              <Timer size={18} />
              {sleepTimerOption !== null && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4FD1C5] animate-pulse" />
              )}
            </button>

            {/* Share Track Card trigger */}
            {currentTrack && (
              <button
                onClick={() => useUIStore.getState().toggleShareTrack(true)}
                className="p-2 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
                title="Generar tarjeta de pista para compartir"
              >
                <Share2 size={18} />
              </button>
            )}

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

            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
            />
          </div>
        </div>
      </footer>

      {/* Slide-out Queue Drawer */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
};
