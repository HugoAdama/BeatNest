import React from 'react';
import { Disc, Play } from 'lucide-react';
import type { Track } from '../../types/music';

interface AlbumsGridViewProps {
  groupedAlbums: [string, Track[]][];
  onSelectAlbum: (album: string, artist: string) => void;
  onPlayAlbum: (tracks: Track[]) => void;
}

export const AlbumsGridView: React.FC<AlbumsGridViewProps> = ({
  groupedAlbums,
  onSelectAlbum,
  onPlayAlbum,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {groupedAlbums.map(([albumName, albumTracks]) => {
        const coverUrl = albumTracks.find((t) => t.coverUrl)?.coverUrl;
        return (
          <article
            key={`${albumName}-${albumTracks[0]?.artist ?? 'unknown'}`}
            className="group relative rounded-2xl liquid-card p-4 hover-lift"
          >
            <button type="button" onClick={() => onSelectAlbum(albumName, albumTracks[0]?.artist ?? '')} className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">
              <span className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-[var(--liquid-glass-border-subtle)] bg-[var(--app-surface-elevated)]">
                {coverUrl ? <img src={coverUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <Disc size={36} className="text-[#7C5CFF]" />}
              </span>
              <span className="block truncate text-sm font-semibold text-[var(--app-text)]">{albumName}</span>
              <span className="mt-0.5 block truncate text-xs text-[var(--app-text-muted)]">
                {albumTracks[0]?.artist || 'Varios artistas'} • {albumTracks.length} pistas
              </span>
            </button>
            <button type="button" onClick={() => onPlayAlbum(albumTracks)} aria-label={`Reproducir álbum ${albumName}`} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-md opacity-100 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-0 sm:group-hover:opacity-100">
              <Play size={16} fill="currentColor" />
            </button>
          </article>
        );
      })}
    </div>
  );
};
