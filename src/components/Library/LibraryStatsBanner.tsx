import React from 'react';
import { Music, Clock, Mic2, Disc } from 'lucide-react';
import { formatDuration } from '../../lib/metadata';

interface LibraryStatsBannerProps {
  trackCount: number;
  totalDuration: number;
  artistCount: number;
  albumCount: number;
}

export const LibraryStatsBanner: React.FC<LibraryStatsBannerProps> = ({
  trackCount,
  totalDuration,
  artistCount,
  albumCount,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 py-1 mb-4">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl liquid-glass-subtle border border-[var(--liquid-glass-border-subtle)] text-xs font-medium text-[var(--app-text)] shadow-sm hover:border-[#7C5CFF]/30 transition-colors">
        <Music size={14} className="text-[#7C5CFF]" />
        <span>{trackCount} {trackCount === 1 ? 'pista' : 'pistas'}</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl liquid-glass-subtle border border-[var(--liquid-glass-border-subtle)] text-xs font-medium text-[var(--app-text)] shadow-sm hover:border-[#4FD1C5]/30 transition-colors">
        <Clock size={14} className="text-[#4FD1C5]" />
        <span className="font-mono">{formatDuration(totalDuration)}</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl liquid-glass-subtle border border-[var(--liquid-glass-border-subtle)] text-xs font-medium text-[var(--app-text)] shadow-sm hover:border-emerald-500/30 transition-colors">
        <Mic2 size={14} className="text-emerald-400" />
        <span>{artistCount} {artistCount === 1 ? 'artista' : 'artistas'}</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl liquid-glass-subtle border border-[var(--liquid-glass-border-subtle)] text-xs font-medium text-[var(--app-text)] shadow-sm hover:border-amber-500/30 transition-colors">
        <Disc size={14} className="text-amber-400" />
        <span>{albumCount} {albumCount === 1 ? 'álbum' : 'álbumes'}</span>
      </div>
    </div>
  );
};
