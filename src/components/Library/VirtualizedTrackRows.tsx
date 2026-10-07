import React, { useEffect, useRef, useState } from 'react';
import type { Track } from '../../types/music';

const ROW_HEIGHT = 68;
const OVERSCAN = 8;

interface VirtualizedTrackRowsProps {
  tracks: Track[];
  renderTrack: (track: Track, index: number) => React.ReactNode;
}

/** Keeps large libraries responsive by mounting only the visible rows. */
export const VirtualizedTrackRows: React.FC<VirtualizedTrackRowsProps> = ({ tracks, renderTrack }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ top: 0, height: 520 });

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const updateHeight = () => setViewport((current) => ({ ...current, height: element.clientHeight }));
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const start = Math.max(0, Math.floor(viewport.top / ROW_HEIGHT) - OVERSCAN);
  const end = Math.min(tracks.length, Math.ceil((viewport.top + viewport.height) / ROW_HEIGHT) + OVERSCAN);

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label="Lista de canciones"
      tabIndex={0}
      onScroll={(event) => setViewport((current) => ({ ...current, top: event.currentTarget.scrollTop }))}
      className="h-[65vh] min-h-64 max-h-[45rem] overflow-y-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--app-accent)]"
    >
      <div className="relative" style={{ height: tracks.length * ROW_HEIGHT }}>
        {tracks.slice(start, end).map((track, offset) => {
          const index = start + offset;
          return (
            <div key={track.id} className="absolute inset-x-0 px-1" style={{ height: ROW_HEIGHT, top: index * ROW_HEIGHT }}>
              {renderTrack(track, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
