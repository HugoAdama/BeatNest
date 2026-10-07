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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-sm">
        <div className="p-2 rounded-lg bg-[#7C5CFF]/15 text-[#7C5CFF]">
          <Music size={18} />
        </div>
        <div className="min-w-0">
          <span className="text-xs text-[var(--app-text-muted)] block">Pistas</span>
          <span className="text-sm font-bold text-[var(--app-text)]">{trackCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-sm">
        <div className="p-2 rounded-lg bg-[var(--app-accent)]/15 text-[var(--app-accent)]">
          <Clock size={18} />
        </div>
        <div className="min-w-0">
          <span className="text-xs text-[var(--app-text-muted)] block">Duración</span>
          <span className="text-sm font-bold text-[var(--app-text)]">{formatDuration(totalDuration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-sm">
        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500">
          <Mic2 size={18} />
        </div>
        <div className="min-w-0">
          <span className="text-xs text-[var(--app-text-muted)] block">Artistas</span>
          <span className="text-sm font-bold text-[var(--app-text)]">{artistCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-sm">
        <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500">
          <Disc size={18} />
        </div>
        <div className="min-w-0">
          <span className="text-xs text-[var(--app-text-muted)] block">Álbumes</span>
          <span className="text-sm font-bold text-[var(--app-text)]">{albumCount}</span>
        </div>
      </div>
    </div>
  );
};
