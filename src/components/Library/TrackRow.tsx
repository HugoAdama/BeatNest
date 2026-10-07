import React, { useState } from 'react';
import {
  Play,
  Pause,
  Heart,
  MoreVertical,
  Music,
  ListPlus,
  PlaySquare,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import type { Track } from '../../types/music';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { formatDuration } from '../../lib/metadata';
import { AddToPlaylistMenu } from '../Playlists/AddToPlaylistMenu';

interface TrackRowProps {
  track: Track;
  index: number;
  onOpenCreatePlaylistModal: () => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  onOpenCreatePlaylistModal,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue, playNextInQueue } = usePlayerStore();
  const { toggleFavorite, deleteTrack, tracks } = useLibraryStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isRowPlaying = isCurrent && isPlaying;

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all select-none ${
        isCurrent
          ? 'bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[var(--app-text)]'
          : 'hover:bg-[var(--app-surface-hover)] border border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
      }`}
    >
      {/* Index number or Play icon */}
      <div className="w-8 flex items-center justify-center shrink-0">
        <button
          onClick={handleRowClick}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:bg-[#7C5CFF] group-hover:text-white"
        >
          {isRowPlaying ? (
            <Pause size={14} className="text-[#4FD1C5]" />
          ) : isCurrent ? (
            <Play size={14} className="text-[#4FD1C5]" fill="currentColor" />
          ) : (
            <>
              <span className="text-xs font-mono group-hover:hidden text-[var(--app-text-muted)]">
                {index + 1}
              </span>
              <Play size={13} className="hidden group-hover:block" fill="currentColor" />
            </>
          )}
        </button>
      </div>

      {/* Album Cover & Title */}
      <div
        onClick={handleRowClick}
        className="flex items-center gap-3 min-w-0 flex-1 md:w-5/12 cursor-pointer"
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--app-surface-elevated)] border border-[var(--app-border)] shrink-0 flex items-center justify-center">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music size={16} className="text-[#7C5CFF]" />
          )}
        </div>

        <div className="min-w-0">
          <p
            className={`text-sm font-semibold truncate ${
              isCurrent ? 'text-[var(--app-accent)]' : 'text-[var(--app-text)]'
            }`}
          >
            {track.title}
          </p>
          <p className="text-xs text-[var(--app-text-muted)] truncate md:hidden">
            {track.artist}
          </p>
        </div>
      </div>

      {/* Artist (Desktop) */}
      <div
        onClick={handleRowClick}
        className="hidden md:block w-3/12 text-xs truncate text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
      >
        {track.artist}
      </div>

      {/* Album (Desktop) */}
      <div
        onClick={handleRowClick}
        className="hidden lg:block w-3/12 text-xs truncate text-[var(--app-text-muted)] cursor-pointer"
      >
        {track.album}
      </div>

      {/* Duration & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            track.isFavorite
              ? 'text-red-500'
              : 'text-[var(--app-text-muted)] opacity-0 group-hover:opacity-100 hover:text-red-400'
          }`}
          title={track.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart size={15} fill={track.isFavorite ? 'currentColor' : 'none'} />
        </button>

        <span className="text-xs font-mono text-[var(--app-text-muted)] w-12 text-right tabular-nums">
          {formatDuration(track.duration)}
        </span>

        {/* More actions menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
            title="Opciones de pista"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-8 z-40 w-48 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl shadow-2xl p-1 animate-fadeIn text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  playNextInQueue(track);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
              >
                <PlaySquare size={14} className="text-[#4FD1C5]" />
                <span>Reproducir siguiente</span>
              </button>

              <button
                onClick={() => {
                  addToQueue(track);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
              >
                <ListPlus size={14} className="text-[#7C5CFF]" />
                <span>Añadir a la cola</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowPlaylistMenu(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
              >
                <FolderPlus size={14} className="text-[var(--app-text-muted)]]" />
                <span>Añadir a playlist...</span>
              </button>

              <div className="my-1 border-t border-[var(--app-border)]" />

              <button
                onClick={() => {
                  deleteTrack(track.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
                <span>Eliminar de biblioteca</span>
              </button>
            </div>
          )}

          {showPlaylistMenu && (
            <AddToPlaylistMenu
              trackId={track.id}
              onClose={() => setShowPlaylistMenu(false)}
              onOpenCreateModal={onOpenCreatePlaylistModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};
