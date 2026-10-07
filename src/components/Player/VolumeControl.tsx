import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}) => {
  return (
    <div className="hidden sm:flex items-center gap-1.5 pl-1 shrink-0">
      <button
        onClick={onToggleMute}
        className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
        title={isMuted ? 'Activar sonido' : 'Silenciar'}
      >
        {isMuted || volume === 0 ? (
          <VolumeX size={17} />
        ) : volume < 0.5 ? (
          <Volume1 size={17} />
        ) : (
          <Volume2 size={17} />
        )}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-16 lg:w-20 h-1.5 bg-[var(--liquid-glass-border)] rounded-lg cursor-pointer accent-[#7C5CFF]"
      />
    </div>
  );
};
