import React, { useState } from 'react';
import { Gauge, Layers } from 'lucide-react';

interface PlayerMenusProps {
  playbackRate: number;
  crossfadeDuration: number;
  onSelectPlaybackRate: (speed: number) => void;
  onSelectCrossfadeDuration: (sec: number) => void;
}

export const PlayerMenus: React.FC<PlayerMenusProps> = ({
  playbackRate,
  crossfadeDuration,
  onSelectPlaybackRate,
  onSelectCrossfadeDuration,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showCrossfadeMenu, setShowCrossfadeMenu] = useState(false);

  const speedOptions = [0.8, 1.0, 1.25, 1.5, 2.0];
  const crossfadeOptions = [
    { sec: 0, label: 'Desactivado' },
    { sec: 2, label: '2 segundos' },
    { sec: 3, label: '3 segundos' },
    { sec: 5, label: '5 segundos' },
    { sec: 8, label: '8 segundos' },
  ];

  return (
    <>
      {/* Speed menu */}
      <div className="relative">
        <button
          onClick={() => {
            setShowSpeedMenu(!showSpeedMenu);
            setShowCrossfadeMenu(false);
          }}
          className="p-2 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors flex items-center gap-1 text-xs font-mono"
          title="Velocidad de reproducción"
        >
          <Gauge size={16} />
          <span>{playbackRate}x</span>
        </button>

        {showSpeedMenu && (
          <div className="absolute bottom-11 right-0 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl shadow-xl p-1 z-50 flex flex-col min-w-20 animate-fadeScale">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  onSelectPlaybackRate(speed);
                  setShowSpeedMenu(false);
                }}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg text-left transition-colors ${
                  playbackRate === speed
                    ? 'bg-[#7C5CFF] text-white'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Crossfade menu */}
      <div className="relative">
        <button
          onClick={() => {
            setShowCrossfadeMenu(!showCrossfadeMenu);
            setShowSpeedMenu(false);
          }}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono ${
            crossfadeDuration > 0
              ? 'text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10 font-bold'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
          }`}
          title="Transición suave (Crossfade)"
        >
          <Layers size={16} />
          <span>{crossfadeDuration > 0 ? `${crossfadeDuration}s` : 'Off'}</span>
        </button>

        {showCrossfadeMenu && (
          <div className="absolute bottom-11 right-0 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl shadow-xl p-1.5 z-50 flex flex-col min-w-36 text-xs animate-fadeScale">
            <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-[var(--app-text-muted)] border-b border-[var(--app-border)] mb-1">
              Crossfade entre pistas
            </div>
            {crossfadeOptions.map((opt) => (
              <button
                key={opt.sec}
                onClick={() => {
                  onSelectCrossfadeDuration(opt.sec);
                  setShowCrossfadeMenu(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  crossfadeDuration === opt.sec
                    ? 'bg-[#7C5CFF] text-white font-medium'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
