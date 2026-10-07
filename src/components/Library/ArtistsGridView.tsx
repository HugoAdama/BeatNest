import React from 'react';
import { Mic2, Play } from 'lucide-react';
import type { Track } from '../../types/music';

interface ArtistsGridViewProps {
  groupedArtists: [string, Track[]][];
  onSelectArtist: (artist: string) => void;
  onPlayArtist: (tracks: Track[]) => void;
}

export const ArtistsGridView: React.FC<ArtistsGridViewProps> = ({
  groupedArtists,
  onSelectArtist,
  onPlayArtist,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {groupedArtists.map(([artistName, artistTracks]) => (
        <article
          key={artistName}
          className="group relative rounded-2xl liquid-card p-4 hover-lift"
        >
          <button type="button" onClick={() => onSelectArtist(artistName)} className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--liquid-glass-border)] bg-[var(--app-surface-elevated)] text-[#7C5CFF] shadow-sm transition-colors group-hover:bg-[#7C5CFF] group-hover:text-white">
              <Mic2 size={24} />
            </span>
            <span className="block truncate text-sm font-semibold text-[var(--app-text)]">{artistName}</span>
            <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">
              {artistTracks.length} {artistTracks.length === 1 ? 'pista' : 'pistas'}
            </span>
          </button>
          <button type="button" onClick={() => onPlayArtist(artistTracks)} aria-label={`Reproducir canciones de ${artistName}`} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-md opacity-100 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-0 sm:group-hover:opacity-100">
            <Play size={16} fill="currentColor" />
          </button>
        </article>
      ))}
    </div>
  );
};
