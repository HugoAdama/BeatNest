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
    <div className="absolute right-0 top-8 z-50 w-56 bg-[#1A1A1F] border border-[#2E2E38] rounded-xl shadow-2xl p-1.5 animate-fadeIn">
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#2E2E38]">
        <span className="text-[11px] font-semibold text-[#A0A0AB] uppercase tracking-wider">
          Añadir a playlist
        </span>
        <button
          onClick={onClose}
          className="text-[#A0A0AB] hover:text-[#F5F5F7] p-0.5 rounded"
        >
          <X size={14} />
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto py-1 space-y-0.5">
        {playlists.length === 0 ? (
          <div className="p-3 text-center text-xs text-[#A0A0AB]">
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                  hasTrack
                    ? 'bg-[#7C5CFF]/15 text-[#7C5CFF]'
                    : 'text-[#F5F5F7] hover:bg-[#24242B]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <ListMusic size={14} className="shrink-0 text-[#A0A0AB]" />
                  <span className="truncate">{pl.name}</span>
                </div>
                {hasTrack && <Check size={14} className="shrink-0 text-[#4FD1C5]" />}
              </button>
            );
          })
        )}
      </div>

      <div className="pt-1 border-t border-[#2E2E38]">
        <button
          onClick={() => {
            onClose();
            onOpenCreateModal();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#4FD1C5] hover:bg-[#4FD1C5]/10 transition-colors"
        >
          <Plus size={14} />
          <span>Nueva playlist</span>
        </button>
      </div>
    </div>
  );
};
