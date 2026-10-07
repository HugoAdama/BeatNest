import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Sparkles, Trash2, Upload } from 'lucide-react';
import { createColoredCoverBlob } from '../../lib/audioGenerator';
import { showToast } from '../../stores/useToastStore';

interface TrackCoverEditorProps {
  initialCoverUrl: string | null;
  title: string;
  artist: string;
  isGenerating: boolean;
  onGeneratingChange: (isGenerating: boolean) => void;
  onCoverChange: (cover: Blob | File | null) => void;
}

export const TrackCoverEditor: React.FC<TrackCoverEditorProps> = ({
  initialCoverUrl,
  title,
  artist,
  isGenerating,
  onGeneratingChange,
  onCoverChange,
}) => {
  const [coverPreview, setCoverPreview] = useState<string | null>(initialCoverUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!coverPreview || coverPreview === initialCoverUrl || !coverPreview.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview, initialCoverUrl]);

  const setCover = (cover: Blob | File) => {
    onCoverChange(cover);
    setCoverPreview(URL.createObjectURL(cover));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Formato no válido', 'Por favor selecciona un archivo de imagen (PNG, JPG, WEBP)', 'warning');
        e.target.value = '';
        return;
      }
      setCover(file);
    }
    e.target.value = '';
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) setCover(file);
  };

  const handleGenerateArt = async () => {
    onGeneratingChange(true);
    try {
      const palette = [
        ['#7C5CFF', '#0284C7'],
        ['#EC4899', '#8B5CF6'],
        ['#F59E0B', '#EF4444'],
        ['#10B981', '#3B82F6'],
        ['#6366F1', '#14B8A6'],
      ];
      const selected = palette[Math.floor(Math.random() * palette.length)];
      const blob = await createColoredCoverBlob(
        selected[0],
        selected[1],
        title.trim() || 'Pista de audio',
        artist.trim() || 'BeatNest'
      );
      setCover(blob);
      showToast('Arte generado', 'Carátula artística creada en alta resolución', 'info');
    } catch (err) {
      console.warn('Error generating artwork:', err);
      showToast('Error', 'No se pudo generar la carátula automática', 'warning');
    } finally {
      onGeneratingChange(false);
    }
  };

  const handleRemoveCover = () => {
    onCoverChange(null);
    setCoverPreview(null);
  };

  return (
    <div className="mb-5 p-3.5 rounded-2xl liquid-glass-subtle border border-[var(--liquid-glass-border-subtle)]">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-2.5">
        Arte de portada / Carátula
      </span>

      <div className="flex items-center gap-4">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropImage}
          onClick={() => fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[var(--app-surface)] border-2 border-dashed border-[var(--liquid-glass-border)] hover:border-[#7C5CFF] cursor-pointer group shrink-0 flex items-center justify-center shadow-md transition-all"
          title="Haz clic o arrastra una imagen aquí para cambiar la carátula"
        >
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Carátula"
              className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[var(--app-text-muted)] group-hover:text-[#7C5CFF] transition-colors p-2 text-center">
              <ImageIcon size={26} className="mb-1" />
              <span className="text-[10px] font-medium leading-tight">Subir foto</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-semibold transition-opacity">
            <Upload size={16} />
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex-1 flex flex-col gap-2">
          <p className="text-xs text-[var(--app-text)] font-medium">
            {coverPreview ? 'Carátula personalizada asignada' : 'Sin imagen de portada'}
          </p>
          <p className="text-[11px] text-[var(--app-text-muted)] leading-tight">
            Arrastra una foto o selecciona un archivo (PNG, JPG, WEBP).
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] border border-[var(--liquid-glass-border)] text-[var(--app-text)] transition-all shadow-sm"
            >
              <Upload size={13} className="text-[#7C5CFF]" />
              <span>Subir imagen</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateArt}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7C5CFF]/15 to-[#4FD1C5]/15 hover:from-[#7C5CFF]/25 hover:to-[#4FD1C5]/25 border border-[#7C5CFF]/30 text-[var(--app-text)] transition-all shadow-sm"
              title="Generar carátula con diseño de sintetizador y gradientes de estudio"
            >
              <Sparkles size={13} className="text-[#4FD1C5]" />
              <span>{isGenerating ? 'Generando...' : 'Generar arte'}</span>
            </button>

            {coverPreview && (
              <button
                type="button"
                onClick={handleRemoveCover}
                className="p-1.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                title="Eliminar carátula"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
