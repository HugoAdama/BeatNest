import React from 'react';
import { Disc } from 'lucide-react';
import type { Track } from '../../types/music';

interface AlbumsGridViewProps {
  groupedAlbums: [string, Track[]][];
  onPlayAlbum: (tracks: Track[]) => void;
}

export const AlbumsGridView: React.FC<AlbumsGridViewProps> = ({
  groupedAlbums,
  onPlayAlbum,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {groupedAlbums.map(([albumName, albumTracks]) => {
        const coverUrl = albumTracks.find((t) => t.coverUrl)?.coverUrl;
        return (
          <div
            key={albumName}
            onClick={() => onPlayAlbum(albumTracks)}
            className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] hover:border-[#7C5CFF]/60 hover:shadow-lg transition-all cursor-pointer group shadow-sm hover-lift"
          >
            <div className="aspect-square rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] overflow-hidden flex items-center justify-center mb-3">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={albumName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Disc size={36} className="text-[#7C5CFF]" />
              )}
            </div>
            <h4 className="text-sm font-semibold text-[var(--app-text)] truncate">
              {albumName}
            </h4>
            <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
              {albumTracks[0]?.artist || 'Varios artistas'} • {albumTracks.length} pistas
            </p>
          </div>
        );
      })}
    </div>
  );
};
