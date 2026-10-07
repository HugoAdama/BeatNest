import React, { useState, useEffect } from 'react';
import { X, Edit3, Music, User, Disc, Tag, Calendar, Save } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useLibraryStore } from '../../stores/useLibraryStore';

export const EditTrackModal: React.FC = () => {
  const { editingTrack, setEditingTrack } = useUIStore();
  const { updateTrackMetadata } = useLibraryStore();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingTrack) {
      setTitle(editingTrack.title || '');
      setArtist(editingTrack.artist || '');
      setAlbum(editingTrack.album || '');
      setGenre(editingTrack.genre || '');
      setYear(editingTrack.year ? String(editingTrack.year) : '');
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
      setEditingTrack(null);
    } catch (err) {
      console.error('Error updating track metadata:', err);
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
        className="w-full max-w-md bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl overflow-hidden p-6 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--app-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] flex items-center justify-center">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 id="edit-track-title" className="text-base font-bold text-[var(--app-text)] leading-tight">
                Editar Metadatos
              </h3>
              <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-1 max-w-[240px]">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] mb-1.5">
              <Music size={13} />
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

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] mb-1.5">
              <User size={13} />
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
              <Disc size={13} />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] mb-1.5">
                <Tag size={13} />
                <span>Género</span>
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Ej. Rock, Synthwave"
                className="w-full px-3 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-sm text-[var(--app-text)] focus:outline-none focus:border-[#7C5CFF] transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] mb-1.5">
                <Calendar size={13} />
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
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#7C5CFF] hover:bg-[#6D48F7] active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-md shadow-[#7C5CFF]/20"
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
