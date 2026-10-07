import React, { useState } from 'react';
import { Play, Pause, Heart, Music, MoreVertical, PlaySquare, ListPlus, FolderPlus, Trash2, Edit3 } from 'lucide-react';
import type { Track } from '../../types/music';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { useUIStore } from '../../stores/useUIStore';
import { formatDuration } from '../../lib/metadata';
import { AddToPlaylistMenu } from '../Playlists/AddToPlaylistMenu';
import { PlayingIndicator } from '../Common/PlayingIndicator';

interface TrackCardProps {
  track: Track;
  onOpenCreatePlaylistModal: () => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  onOpenCreatePlaylistModal,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue, playNextInQueue } = usePlayerStore();
  const { toggleFavorite, deleteTrack, tracks } = useLibraryStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isCardPlaying = isCurrent && isPlaying;

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative p-3.5 rounded-2xl bg-[var(--app-surface)] border transition-all cursor-pointer select-none hover:shadow-xl hover:-translate-y-1 shadow-sm ${
        isCurrent
          ? 'border-[#7C5CFF]/70 shadow-[0_4px_25px_rgba(124,92,255,0.25)] ring-1 ring-[#7C5CFF]/40 animate-pulse-glow'
          : 'border-[var(--app-border)] hover:border-[#7C5CFF]/50'
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--app-surface-elevated)] mb-3 flex items-center justify-center">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isCardPlaying ? 'scale-105' : 'group-hover:scale-105'
            }`}
          />
        ) : (
          <Music size={36} className="text-[#7C5CFF]" />
        )}

        {/* Live Audio Equalizer Pill if Current */}
        {isCurrent && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md flex items-center gap-1.5 shadow-md z-10">
            <PlayingIndicator isPlaying={isCardPlaying} color="accent" size="xs" />
            <span className="text-[10px] font-mono text-[#4FD1C5] font-semibold tracking-wider">
              {isCardPlaying ? 'EN VIVO' : 'PAUSA'}
            </span>
          </div>
        )}

        {/* Duration pill badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white">
          {formatDuration(track.duration)}
        </div>

        {/* Hover / Active Play Button Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl bg-[#7C5CFF] text-white flex items-center justify-center shadow-xl transform transition-transform duration-200 ${
              isCardPlaying ? 'scale-105 shadow-[0_0_20px_rgba(124,92,255,0.6)]' : 'group-hover:scale-105'
            }`}
          >
            {isCardPlaying ? (
              <Pause size={20} className="text-[#4FD1C5]" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </div>
        </div>

        {/* Favorite heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          className={`absolute top-2 left-2 p-1.5 rounded-lg bg-black/50 backdrop-blur-md transition-colors ${
            track.isFavorite
              ? 'text-red-500'
              : 'text-white/80 opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
        >
          <Heart size={15} fill={track.isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Context options menu trigger */}
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white/80 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={15} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-8 z-40 w-44 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl shadow-2xl p-1 animate-fadeScale text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  playNextInQueue(track);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]"
              >
                <PlaySquare size={14} className="text-[#4FD1C5]" />
                <span>Reproducir siguiente</span>
              </button>
              <button
                onClick={() => {
                  addToQueue(track);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]"
              >
                <ListPlus size={14} className="text-[#7C5CFF]" />
                <span>Añadir a la cola</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowPlaylistMenu(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]"
              >
                <FolderPlus size={14} className="text-[var(--app-text-muted)]" />
                <span>Añadir a playlist</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  useUIStore.getState().setEditingTrack(track);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]"
              >
                <Edit3 size={14} className="text-[#7C5CFF]" />
                <span>Editar metadatos</span>
              </button>
              <div className="my-1 border-t border-[var(--app-border)]" />
              <button
                onClick={() => {
                  deleteTrack(track.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={14} />
                <span>Eliminar</span>
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

      {/* Metadata info */}
      <h4
        className={`text-sm font-semibold truncate mb-0.5 ${
          isCurrent ? 'text-[var(--app-accent)]' : 'text-[var(--app-text)]'
        }`}
      >
        {track.title}
      </h4>
      <p className="text-xs text-[var(--app-text-muted)] truncate">
        {track.artist}
      </p>
    </div>
  );
};
