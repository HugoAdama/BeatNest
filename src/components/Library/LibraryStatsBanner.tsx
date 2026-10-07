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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl liquid-card">
        <div className="p-2.5 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 shadow-sm shrink-0">
          <Music size={18} />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-medium text-[var(--app-text-muted)] block">Pistas</span>
          <span className="text-base font-bold text-[var(--app-text)] tracking-tight">{trackCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl liquid-card">
        <div className="p-2.5 rounded-xl bg-[var(--app-accent)]/15 text-[var(--app-accent)] border border-[var(--app-accent)]/30 shadow-sm shrink-0">
          <Clock size={18} />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-medium text-[var(--app-text-muted)] block">Duración</span>
          <span className="text-base font-bold text-[var(--app-text)] tracking-tight">{formatDuration(totalDuration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl liquid-card">
        <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-sm shrink-0">
          <Mic2 size={18} />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-medium text-[var(--app-text-muted)] block">Artistas</span>
          <span className="text-base font-bold text-[var(--app-text)] tracking-tight">{artistCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl liquid-card">
        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-sm shrink-0">
          <Disc size={18} />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-medium text-[var(--app-text-muted)] block">Álbumes</span>
          <span className="text-base font-bold text-[var(--app-text)] tracking-tight">{albumCount}</span>
        </div>
      </div>
    </div>
  );
};
