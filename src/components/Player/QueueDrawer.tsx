import React, { useState } from 'react';
import {
  ListMusic,
  Trash2,
  X,
  Play,
  ChevronUp,
  ChevronDown,
  Music,
  BookmarkPlus,
  Check,
  RotateCcw,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { showToast } from '../../stores/useToastStore';
import { formatDuration } from '../../lib/metadata';
import { PlayingIndicator } from '../Common/PlayingIndicator';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ isOpen, onClose }) => {
  const {
    queue,
    queueIndex,
    isPlaying,
    playTrack,
    removeFromQueue,
    clearQueue,
    clearQueueUpcoming,
    reorderQueue,
  } = usePlayerStore();

  const { createPlaylist } = useLibraryStore();
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');

  if (!isOpen) return null;

  const handleSaveAsPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (queue.length === 0) return;
    const title = playlistTitle.trim() || `Cola ${new Date().toLocaleDateString()}`;
    const trackIds = queue.map((t) => t.id);
    await createPlaylist(title, 'Playlist generada desde la cola de reproducción', trackIds);
    showToast('Playlist guardada', `Se añadieron ${trackIds.length} pistas a «${title}»`);
    setIsSavingPlaylist(false);
    setPlaylistTitle('');
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 liquid-glass border-l border-[var(--liquid-glass-border)] shadow-2xl flex flex-col animate-slideLeft transition-all">
        {/* Header */}
        <div className="p-4 border-b border-[var(--liquid-glass-border-subtle)] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30">
                <ListMusic size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--app-text)]">
                  Cola de reproducción
                </h3>
                <span className="text-xs text-[var(--app-text-muted)]">
                  {queue.length} {queue.length === 1 ? 'pista' : 'pistas'} en cola
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {queue.length > 0 && (
                <>
                  <button
                    onClick={() => setIsSavingPlaylist(!isSavingPlaylist)}
                    className="p-1.5 rounded-xl text-[var(--app-text-muted)] hover:text-[#7C5CFF] hover:bg-[#7C5CFF]/10 transition-colors"
                    title="Guardar cola como playlist"
                  >
                    <BookmarkPlus size={16} />
                  </button>
                  <button
                    onClick={clearQueueUpcoming}
                    className="p-1.5 rounded-xl text-[var(--app-text-muted)] hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                    title="Limpiar siguientes canciones"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    onClick={clearQueue}
                    className="p-1.5 rounded-xl text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Vaciar toda la cola"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
                title="Cerrar cola"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Inline Save as Playlist form */}
          {isSavingPlaylist && (
            <form onSubmit={handleSaveAsPlaylist} className="flex items-center gap-1.5 pt-1 animate-fadeIn">
              <input
                type="text"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                placeholder="Nombre de la nueva playlist..."
                className="flex-1 px-2.5 py-1.5 rounded-xl text-xs bg-[var(--app-surface)] text-[var(--app-text)] border border-[var(--liquid-glass-border)] focus:outline-none focus:border-[#7C5CFF]"
                autoFocus
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#7C5CFF] text-white hover:bg-[#6b4bf0]"
              >
                <Check size={13} />
                <span>Guardar</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSavingPlaylist(false)}
                className="px-2 py-1.5 rounded-xl text-xs text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>

        {/* Queue items list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {queue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[var(--app-text-muted)]">
              <div className="w-12 h-12 rounded-2xl liquid-glass-subtle flex items-center justify-center mb-3">
                <ListMusic size={22} className="text-[#7C5CFF]" />
              </div>
              <p className="text-sm font-medium text-[var(--app-text)] mb-1">
                La cola está vacía
              </p>
              <p className="text-xs max-w-xs">
                Añade canciones desde tu biblioteca seleccionando «Añadir a la cola» o «Reproducir siguiente».
              </p>
            </div>
          ) : (
            queue.map((track, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`group flex items-center gap-3 p-2 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-[#7C5CFF]/15 border border-[#7C5CFF]/35 text-[var(--app-text)] backdrop-blur-md'
                      : 'liquid-glass-subtle hover:bg-[var(--app-surface-hover)] border border-transparent hover:border-[var(--liquid-glass-border-subtle)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                  }`}
                >
                  {/* Thumbnail / Status */}
                  <div
                    onClick={() => playTrack(track)}
                    className="relative w-10 h-10 rounded-xl overflow-hidden bg-[var(--app-surface-elevated)] shrink-0 cursor-pointer flex items-center justify-center border border-[var(--liquid-glass-border-subtle)]"
                  >
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music size={16} className="text-[var(--app-text-muted)]" />
                    )}

                    <div
                      className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                        isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isCurrent ? (
                        <PlayingIndicator isPlaying={isPlaying} color="accent" size="xs" />
                      ) : (
                        <Play size={14} className="text-white" fill="white" />
                      )}
                    </div>
                  </div>

                  {/* Track details */}
                  <div
                    onClick={() => playTrack(track)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCurrent ? 'text-[#7C5CFF]' : 'text-[var(--app-text)]'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-[11px] text-[var(--app-text-muted)] truncate">
                      {track.artist}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-[11px] font-mono text-[var(--app-text-muted)] shrink-0">
                    {formatDuration(track.duration)}
                  </span>

                  {/* Reorder and Delete controls */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button
                        onClick={() => reorderQueue(idx, idx - 1)}
                        className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]"
                        title="Mover arriba"
                      >
                        <ChevronUp size={14} />
                      </button>
                    )}
                    {idx < queue.length - 1 && (
                      <button
                        onClick={() => reorderQueue(idx, idx + 1)}
                        className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]"
                        title="Mover abajo"
                      >
                        <ChevronDown size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/10"
                      title="Quitar de la cola"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
