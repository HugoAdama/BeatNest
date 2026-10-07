import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  Gauge,
  Layers,
  Timer,
  Activity,
  Minimize2,
  Share2,
  X,
} from 'lucide-react';

interface PlayerMenusProps {
  playbackRate: number;
  crossfadeDuration: number;
  onSelectPlaybackRate: (speed: number) => void;
  onSelectCrossfadeDuration: (sec: number) => void;
  sleepTimerActive: boolean;
  onOpenSleepTimer: () => void;
  onOpenVisualizer: () => void;
  onOpenMiniPlayer: () => void;
  onOpenShareTrack?: () => void;
  hasTrack: boolean;
}

export const PlayerMenus: React.FC<PlayerMenusProps> = ({
  playbackRate,
  crossfadeDuration,
  onSelectPlaybackRate,
  onSelectCrossfadeDuration,
  sleepTimerActive,
  onOpenSleepTimer,
  onOpenVisualizer,
  onOpenMiniPlayer,
  onOpenShareTrack,
  hasTrack,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const crossfadeOptions = [
    { sec: 0, label: 'Off' },
    { sec: 2, label: '2s' },
    { sec: 3, label: '3s' },
    { sec: 5, label: '5s' },
    { sec: 8, label: '8s' },
  ];

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const hasCustomSettings = playbackRate !== 1.0 || crossfadeDuration > 0 || sleepTimerActive;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all flex items-center justify-center relative ${
          isOpen || hasCustomSettings
            ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/40 shadow-sm'
            : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
        }`}
        title="Herramientas y ajustes de reproducción"
      >
        <SlidersHorizontal size={17} />
        {hasCustomSettings && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#7C5CFF] ring-2 ring-[var(--app-surface)]" />
        )}
      </button>

      {/* Floating Tools Popover */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-72 liquid-glass-elevated border border-[var(--liquid-glass-border)] rounded-2xl shadow-2xl p-3.5 z-50 animate-fadeScale text-[var(--app-text)] select-none">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--liquid-glass-border-subtle)]">
            <span className="text-xs font-bold tracking-tight text-[var(--app-text)] flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-[#7C5CFF]" />
              Herramientas de audio
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Speed Selector */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-[var(--app-text-muted)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Gauge size={12} className="text-[#4FD1C5]" />
                  Velocidad
                </span>
                <span className="font-mono text-[#7C5CFF] font-semibold">{playbackRate}x</span>
              </div>
              <div className="grid grid-cols-6 gap-1 bg-[var(--app-surface)] p-1 rounded-xl border border-[var(--liquid-glass-border-subtle)]">
                {speedOptions.map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onSelectPlaybackRate(spd)}
                    className={`py-1 text-[11px] font-mono font-medium rounded-lg transition-all ${
                      playbackRate === spd
                        ? 'bg-[#7C5CFF] text-white shadow-sm font-semibold'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Crossfade Selector */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-[var(--app-text-muted)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Layers size={12} className="text-[#7C5CFF]" />
                  Transición (Crossfade)
                </span>
                <span className="font-mono text-[#4FD1C5] font-semibold">
                  {crossfadeDuration > 0 ? `${crossfadeDuration}s` : 'Desactivado'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 bg-[var(--app-surface)] p-1 rounded-xl border border-[var(--liquid-glass-border-subtle)]">
                {crossfadeOptions.map((opt) => (
                  <button
                    key={opt.sec}
                    onClick={() => onSelectCrossfadeDuration(opt.sec)}
                    className={`py-1 text-[11px] font-mono font-medium rounded-lg transition-all ${
                      crossfadeDuration === opt.sec
                        ? 'bg-[#4FD1C5] text-black shadow-sm font-bold'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="pt-2 border-t border-[var(--liquid-glass-border-subtle)] grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onOpenSleepTimer();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all ${
                  sleepTimerActive
                    ? 'bg-[#4FD1C5]/20 text-[#4FD1C5] font-semibold border border-[#4FD1C5]/30'
                    : 'liquid-glass-subtle text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                }`}
              >
                <Timer size={14} className={sleepTimerActive ? 'text-[#4FD1C5]' : 'text-[var(--app-text-muted)]'} />
                <span className="truncate">Temporizador</span>
              </button>

              <button
                onClick={() => {
                  onOpenVisualizer();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium liquid-glass-subtle text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-all"
              >
                <Activity size={14} className="text-[#7C5CFF]" />
                <span className="truncate">Visualizador</span>
              </button>

              <button
                onClick={() => {
                  onOpenMiniPlayer();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium liquid-glass-subtle text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-all"
              >
                <Minimize2 size={14} className="text-[var(--app-text-muted)]" />
                <span className="truncate">Mini player</span>
              </button>

              {hasTrack && onOpenShareTrack && (
                <button
                  onClick={() => {
                    onOpenShareTrack();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium liquid-glass-subtle text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-all"
                >
                  <Share2 size={14} className="text-amber-400" />
                  <span className="truncate">Compartir</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
