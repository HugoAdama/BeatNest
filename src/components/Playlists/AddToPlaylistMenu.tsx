import React from 'react';
import { Plus, Check, ListMusic, X } from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';

interface AddToPlaylistMenuProps {
  trackId: string;
  onClose: () => void;
  onOpenCreateModal: () => void;
}

export const AddToPlaylistMenu: React.FC<AddToPlaylistMenuProps> = ({
  trackId,
  onClose,
  onOpenCreateModal,
}) => {
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = useLibraryStore();

  return (
    <div className="absolute right-0 top-8 z-50 w-56 liquid-glass border border-[var(--liquid-glass-border)] rounded-2xl shadow-2xl p-1.5 animate-fadeIn">
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--liquid-glass-border-subtle)]">
        <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
          Añadir a playlist
        </span>
        <button
          onClick={onClose}
          className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] p-0.5 rounded-lg"
        >
          <X size={14} />
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto py-1 space-y-0.5">
        {playlists.length === 0 ? (
          <div className="p-3 text-center text-xs text-[var(--app-text-muted)]">
            No tienes playlists aún.
          </div>
        ) : (
          playlists.map((pl) => {
            const hasTrack = pl.trackIds.includes(trackId);
            return (
              <button
                key={pl.id}
                onClick={() => {
                  if (hasTrack) {
                    removeTrackFromPlaylist(pl.id, trackId);
                  } else {
                    addTrackToPlaylist(pl.id, trackId);
                  }
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                  hasTrack
                    ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] font-medium'
                    : 'text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <ListMusic size={14} className="shrink-0 text-[#7C5CFF]" />
                  <span className="truncate">{pl.name}</span>
                </div>
                {hasTrack && <Check size={14} className="shrink-0 text-[#4FD1C5]" />}
              </button>
            );
          })
        )}
      </div>

      <div className="pt-1 mt-1 border-t border-[var(--liquid-glass-border-subtle)]">
        <button
          onClick={() => {
            onClose();
            onOpenCreateModal();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-[#7C5CFF] hover:bg-[#7C5CFF]/10 transition-colors font-medium"
        >
          <Plus size={14} />
          <span>Crear nueva playlist</span>
        </button>
      </div>
    </div>
  );
};
