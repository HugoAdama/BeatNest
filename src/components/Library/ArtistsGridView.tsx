import React from 'react';
import { Mic2 } from 'lucide-react';
import type { Track } from '../../types/music';

interface ArtistsGridViewProps {
  groupedArtists: [string, Track[]][];
  onPlayArtist: (tracks: Track[]) => void;
}

export const ArtistsGridView: React.FC<ArtistsGridViewProps> = ({
  groupedArtists,
  onPlayArtist,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {groupedArtists.map(([artistName, artistTracks]) => (
        <div
          key={artistName}
          onClick={() => onPlayArtist(artistTracks)}
          className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] hover:border-[#7C5CFF]/60 hover:shadow-lg transition-all cursor-pointer group shadow-sm hover-lift"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--app-surface-elevated)] border border-[var(--app-border)] flex items-center justify-center mb-3 text-[#7C5CFF] group-hover:bg-[#7C5CFF] group-hover:text-white transition-colors">
            <Mic2 size={24} />
          </div>
          <h4 className="text-sm font-semibold text-[var(--app-text)] truncate">
            {artistName}
          </h4>
          <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
            {artistTracks.length} {artistTracks.length === 1 ? 'pista' : 'pistas'}
          </p>
        </div>
      ))}
    </div>
  );
};
