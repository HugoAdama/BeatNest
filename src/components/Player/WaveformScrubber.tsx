import React, { useState, useRef, useMemo } from 'react';
import { formatDuration } from '../../lib/metadata';

interface WaveformScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  className?: string;
  isPlaying?: boolean;
}

export const WaveformScrubber: React.FC<WaveformScrubberProps> = ({
  currentTime,
  duration,
  onSeek,
  className = '',
  isPlaying = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate a pseudo waveform profile based on track duration or deterministic seed
  const barCount = 70;
  const waveformBars = useMemo(() => {
    const bars: number[] = [];
    let prev = 0.4;
    for (let i = 0; i < barCount; i++) {
      // Natural organic wave variation
      const sinWave = Math.sin(i * 0.2) * 0.3 + 0.5;
      const noise = ((i * 19) % 17) / 34;
      const height = Math.max(0.15, Math.min(1.0, (prev * 0.4 + sinWave * 0.4 + noise * 0.2)));
      bars.push(height);
      prev = height;
    }
    return bars;
  }, []);

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const hoverTime = hoverPosition !== null && duration > 0 ? hoverPosition * duration : 0;

  const calculatePositionFromX = (clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    return ratio;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ratio = calculatePositionFromX(e.clientX);
    setHoverPosition(ratio);
    if (isDragging && duration > 0) {
      onSeek(ratio * duration);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const ratio = calculatePositionFromX(e.clientX);
    setHoverPosition(ratio);
    onSeek(ratio * duration);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (e.pointerType !== 'mouse') setHoverPosition(null);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setHoverPosition(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    let nextTime: number | null = null;
    if (e.key === 'ArrowLeft') nextTime = currentTime - 5;
    if (e.key === 'ArrowRight') nextTime = currentTime + 5;
    if (e.key === 'Home') nextTime = 0;
    if (e.key === 'End') nextTime = duration;
    if (nextTime !== null) {
      e.preventDefault();
      onSeek(Math.max(0, Math.min(duration, nextTime)));
    }
  };

  return (
    <div className={`flex items-center gap-3 w-full select-none ${className}`}>
      <span className="text-xs font-mono text-[var(--app-text-muted)] w-11 text-right tabular-nums">
        {formatDuration(currentTime)}
      </span>

      <div
        ref={containerRef}
        role="slider"
        aria-label="Posición de reproducción"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Math.min(duration, Math.max(0, currentTime))}
        aria-valuetext={`${formatDuration(currentTime)} de ${formatDuration(duration)}`}
        tabIndex={duration > 0 ? 0 : -1}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={() => {
          if (!isDragging) setHoverPosition(null);
        }}
        className="relative flex-1 h-9 flex items-center cursor-pointer group py-1 touch-none"
      >
        {/* Hover timestamp tooltip */}
        {hoverPosition !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-[var(--app-surface)] border border-[var(--app-border)] text-[11px] font-mono text-[var(--app-accent)] shadow-lg pointer-events-none z-20 whitespace-nowrap font-bold animate-fadeScale"
            style={{ left: `${hoverPosition * 100}%` }}
          >
            {formatDuration(hoverTime)}
          </div>
        )}

        {/* Hover vertical needle line */}
        {hoverPosition !== null && (
          <div
            className="absolute inset-y-0 w-px bg-[var(--app-accent)]/60 pointer-events-none z-10"
            style={{ left: `${hoverPosition * 100}%` }}
          />
        )}

        {/* Waveform Bars Container */}
        <div className="w-full h-7 flex items-center gap-[2px]">
          {waveformBars.map((barHeight, idx) => {
            const barFraction = idx / barCount;
            const isPlayed = barFraction <= progress;
            const isHovered = hoverPosition !== null && barFraction <= hoverPosition;

            let bgColor = 'var(--app-waveform-unplayed)';
            if (isPlayed) {
              bgColor = '#7C5CFF';
            } else if (isHovered) {
              bgColor = 'rgba(124, 92, 255, 0.35)';
            }

            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-colors duration-150 relative ${isPlaying && isPlayed ? 'waveform-playing' : ''}`}
                style={{
                  height: `${barHeight * 100}%`,
                  backgroundColor: isPlayed ? undefined : bgColor,
                  animationDelay: `${idx * 24}ms`,
                  animationDuration: `${700 + (idx % 5) * 80}ms`,
                }}
              >
                {isPlayed && (
                  <div
                    className="w-full h-full rounded-full bg-gradient-to-t from-[#7C5CFF] to-[#4FD1C5] shadow-[0_0_8px_rgba(79,209,197,0.3)]"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Floating playhead scrubber circle on hover or drag */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#4FD1C5] border-2 border-[var(--app-surface)] shadow-[0_0_10px_#4FD1C5] transition-opacity duration-150 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      <span className="text-xs font-mono text-[var(--app-text-muted)] w-11 tabular-nums">
        {formatDuration(duration)}
      </span>
    </div>
  );
};
