import React from 'react';
import { FolderOpen, Music, Sparkles, Info } from 'lucide-react';

interface LibraryEmptyStateProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onImportDirectory: () => void;
  onGenerateSampleTrack: () => void;
}

export const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onImportDirectory,
  onGenerateSampleTrack,
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center transition-all relative ${
        isDragOver ? 'bg-[#7C5CFF]/15 border-2 border-dashed border-[#7C5CFF]' : ''
      }`}
    >
      <div className="max-w-lg flex flex-col items-center relative z-10">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#7C5CFF]/30 to-[#4FD1C5]/30 border border-white/30 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
          <Music size={36} className="text-[#4FD1C5]" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--app-text)] mb-2">
          Tu música, sin nube
        </h2>
        <p className="text-sm text-[var(--app-text-muted)] mb-8 leading-relaxed max-w-md">
          BeatNest reproduce tus canciones directamente desde tu dispositivo sin subirlas a ningún servidor. Privado, instantáneo y 100% offline.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mb-6">
          <button
            onClick={onImportDirectory}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white font-semibold text-sm hover:opacity-95 active:scale-95 transition-all shadow-[0_4px_20px_rgba(124,92,255,0.4)] border border-white/20"
          >
            <FolderOpen size={18} />
            <span>Seleccionar carpeta de música</span>
          </button>

          <button
            onClick={onGenerateSampleTrack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl liquid-glass-subtle text-[var(--app-accent)] text-sm hover:border-[var(--app-accent)]/50 hover:bg-[var(--app-surface-hover)] transition-all shadow-sm"
          >
            <Sparkles size={16} />
            <span>Generar pista demo</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)] liquid-glass-subtle px-4 py-2 rounded-2xl shadow-sm">
          <Info size={14} className="text-[#7C5CFF]" />
          <span>Formatos compatibles: MP3, FLAC, WAV, OGG, M4A, AAC, OPUS</span>
        </div>
      </div>
    </div>
  );
};
