import React, { useEffect, useState } from 'react';
import { Disc3, Edit3, Tag, Users, X } from 'lucide-react';
import type { Track } from '../../types/music';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { showToast } from '../../stores/useToastStore';

interface BulkEditTracksModalProps {
  tracks: Track[];
  onClose: () => void;
}

function getSharedValue(values: string[]): string {
  if (values.length === 0) return '';
  const first = values[0];
  return values.every((value) => value === first) ? first : '';
}

export const BulkEditTracksModal: React.FC<BulkEditTracksModalProps> = ({ tracks, onClose }) => {
  const { updateTracksMetadata } = useLibraryStore();
  const [artist, setArtist] = useState(() => getSharedValue(tracks.map((track) => track.artist)));
  const [album, setAlbum] = useState(() => getSharedValue(tracks.map((track) => track.album)));
  const [genre, setGenre] = useState(() => getSharedValue(tracks.map((track) => track.genre ?? '')));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isSaving, onClose]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const updates: Partial<Pick<Track, 'artist' | 'album' | 'genre'>> = {};
    if (artist.trim()) updates.artist = artist.trim();
    if (album.trim()) updates.album = album.trim();
    if (genre.trim()) updates.genre = genre.trim();
    if (Object.keys(updates).length === 0) {
      showToast('Sin cambios', 'Escribe al menos un valor para aplicar a las pistas seleccionadas.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await updateTracksMetadata(tracks.map((track) => track.id), updates);
      showToast('Metadatos actualizados', `Se actualizaron ${tracks.length} pistas.`);
      onClose();
    } catch (error) {
      console.error('Could not apply bulk metadata edits:', error);
      showToast('No se pudieron actualizar los metadatos', 'Inténtalo de nuevo.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="bulk-edit-title" className="liquid-glass-elevated w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--liquid-glass-border)] text-[var(--app-text)] shadow-2xl animate-fadeScale">
        <header className="flex items-start justify-between gap-3 border-b border-[var(--liquid-glass-border-subtle)] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary-light)] text-[var(--app-primary)]"><Edit3 size={18} /></span>
            <div>
              <h2 id="bulk-edit-title" className="text-lg font-bold">Editar metadatos en lote</h2>
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">Aplica los valores a {tracks.length} pistas. Deja en blanco lo que quieras conservar.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Cerrar" className="rounded-xl p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] disabled:opacity-50"><X size={18} /></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <label className="block text-xs font-semibold text-[var(--app-text-muted)]">
            <span className="mb-1.5 flex items-center gap-2"><Users size={14} /> Artista</span>
            <input value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="Sin cambios" className="w-full rounded-xl border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]" />
          </label>
          <label className="block text-xs font-semibold text-[var(--app-text-muted)]">
            <span className="mb-1.5 flex items-center gap-2"><Disc3 size={14} /> Álbum</span>
            <input value={album} onChange={(event) => setAlbum(event.target.value)} placeholder="Sin cambios" className="w-full rounded-xl border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]" />
          </label>
          <label className="block text-xs font-semibold text-[var(--app-text-muted)]">
            <span className="mb-1.5 flex items-center gap-2"><Tag size={14} /> Género</span>
            <input value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="Sin cambios" className="w-full rounded-xl border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]" />
          </label>

          <footer className="flex justify-end gap-2 border-t border-[var(--liquid-glass-border-subtle)] pt-4">
            <button type="button" onClick={onClose} disabled={isSaving} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]">Cancelar</button>
            <button type="submit" disabled={isSaving || tracks.length === 0} className="rounded-xl bg-[var(--app-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[var(--app-primary-hover)] disabled:opacity-50">
              {isSaving ? 'Guardando…' : 'Aplicar a las pistas'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};
