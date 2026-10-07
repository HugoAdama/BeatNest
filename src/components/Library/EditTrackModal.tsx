import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Edit3,
  Music,
  User,
  Disc,
  Tag,
  Calendar,
  Save,
  Upload,
  Trash2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { showToast } from '../../stores/useToastStore';
import { createColoredCoverBlob } from '../../lib/audioGenerator';

export const EditTrackModal: React.FC = () => {
  const { editingTrack, setEditingTrack } = useUIStore();
  const { updateTrackMetadata, updateTrackCover } = useLibraryStore();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  // Cover image state
  const [coverBlob, setCoverBlob] = useState<Blob | File | null | undefined>(undefined);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingTrack) {
      setTitle(editingTrack.title || '');
      setArtist(editingTrack.artist || '');
      setAlbum(editingTrack.album || '');
      setGenre(editingTrack.genre || '');
      setYear(editingTrack.year ? String(editingTrack.year) : '');
      setCoverPreview(editingTrack.coverUrl || null);
      setCoverBlob(undefined); // undefined means unchanged
    }
  }, [editingTrack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingTrack) {
        setEditingTrack(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTrack, setEditingTrack]);

  if (!editingTrack) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Formato no válido', 'Por favor selecciona un archivo de imagen (PNG, JPG, WEBP)', 'warning');
        return;
      }
      setCoverBlob(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverBlob(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateArt = async () => {
    setIsGeneratingCover(true);
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
      setCoverBlob(blob);
      setCoverPreview(URL.createObjectURL(blob));
      showToast('Arte generado', 'Carátula artística creada en alta resolución', 'info');
    } catch (err) {
      console.warn('Error generating artwork:', err);
      showToast('Error', 'No se pudo generar la carátula automática', 'warning');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverBlob(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const parsedYear = year.trim() ? parseInt(year.trim(), 10) : undefined;
      await updateTrackMetadata(editingTrack.id, {
        title: title.trim(),
        artist: artist.trim() || 'Desconocido',
        album: album.trim() || 'Desconocido',
        genre: genre.trim() || undefined,
        year: isNaN(Number(parsedYear)) ? undefined : parsedYear,
      });

      // Update cover image if changed
      if (coverBlob !== undefined) {
        await updateTrackCover(editingTrack.id, coverBlob);
      }

      showToast('Metadatos guardados', `«${title.trim()}» actualizado correctamente`);
      setEditingTrack(null);
    } catch (err) {
      console.error('Error updating track metadata:', err);
      showToast('Error al actualizar', 'No se pudieron guardar los cambios', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-track-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setEditingTrack(null)}
    >
      <div
        className="w-full max-w-lg liquid-glass-elevated border border-[var(--liquid-glass-border)] rounded-3xl shadow-2xl overflow-hidden p-6 relative animate-fadeScale max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--liquid-glass-border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] flex items-center justify-center">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 id="edit-track-title" className="text-base font-bold text-[var(--app-text)] leading-tight">
                Editar Canción y Carátula
              </h3>
              <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-1 max-w-[280px]">
                {editingTrack.fileName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditingTrack(null)}
            className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] rounded-lg transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cover Art Manager Section */}
        <div className="mb-5 p-3.5 rounded-2xl liquid-glass-subtle border border-[var(--liquid-glass-border-subtle)]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-2.5">
            Arte de portada / Carátula
          </span>

          <div className="flex items-center gap-4">
            {/* Interactive Image Preview Box */}
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

            {/* Actions for artwork */}
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
                  disabled={isGeneratingCover}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7C5CFF]/15 to-[#4FD1C5]/15 hover:from-[#7C5CFF]/25 hover:to-[#4FD1C5]/25 border border-[#7C5CFF]/30 text-[var(--app-text)] transition-all shadow-sm"
                  title="Generar carátula con diseño de sintetizador y gradientes de estudio"
                >
                  <Sparkles size={13} className="text-[#4FD1C5]" />
                  <span>{isGeneratingCover ? 'Generando...' : 'Generar arte'}</span>
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

        {/* Metadata Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] mb-1.5">
              <Music size={13} className="text-[#7C5CFF]" />
              <span>Título</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la pista"
              className="w-full px-3 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-sm text-[var(--app-text)] focus:outline-none focus:border-[#7C5CFF] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] mb-1.5">
                <User size={13} className="text-[#4FD1C5]" />
                <span>Artista</span>
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Nombre del artista"
                className="w-full px-3 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-sm text-[var(--app-text)] focus:outline-none focus:border-[#7C5CFF] transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] mb-1.5">
                <Disc size={13} className="text-amber-400" />
                <span>Álbum</span>
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Nombre del álbum"
                className="w-full px-3 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-sm text-[var(--app-text)] focus:outline-none focus:border-[#7C5CFF] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] mb-1.5">
                <Tag size={13} className="text-pink-400" />
                <span>Género</span>
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Ej. Synthwave, Rock"
                className="w-full px-3 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-sm text-[var(--app-text)] focus:outline-none focus:border-[#7C5CFF] transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] mb-1.5">
                <Calendar size={13} className="text-emerald-400" />
                <span>Año</span>
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Ej. 2024"
                min="1900"
                max="2099"
                className="w-full px-3 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-sm text-[var(--app-text)] focus:outline-none focus:border-[#7C5CFF] transition-colors"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--app-border)]">
            <button
              type="button"
              onClick={() => setEditingTrack(null)}
              className="px-4 py-2 text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-xl hover:bg-[var(--app-surface-hover)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-md shadow-[#7C5CFF]/20 border border-white/20"
            >
              <Save size={14} />
              <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
