import React from 'react';
import { ArrowRight, Clock3, Disc3, Headphones, Music2, Pause, Play, Sparkles } from 'lucide-react';
import type { Track } from '../../types/music';
import type { Playlist } from '../../types/music';
import type { LibraryTab } from '../../stores/useLibraryStore';

interface LibraryHomeViewProps {
  tracks: Track[];
  playlists: Playlist[];
  recentTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queue: Track[]) => void;
  onTogglePlayback: () => void;
  onNavigate: (tab: LibraryTab) => void;
  onOpenPlaylist: (playlistId: string) => void;
}

export const LibraryHomeView: React.FC<LibraryHomeViewProps> = ({
  tracks,
  playlists,
  recentTracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlayback,
  onNavigate,
  onOpenPlaylist,
}) => {
  const recentlyAdded = [...tracks].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 6);
  const mostPlayed = [...tracks]
    .filter((track) => (track.playCount || 0) > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 6);

  const sections = [
    { title: 'Escuchado recientemente', icon: <Clock3 size={16} />, items: recentTracks.slice(0, 6), destination: 'history' as LibraryTab },
    { title: 'Añadido recientemente', icon: <Sparkles size={16} />, items: recentlyAdded, destination: 'smart-recent' as LibraryTab },
    { title: 'Más reproducido', icon: <Headphones size={16} />, items: mostPlayed, destination: 'smart-top' as LibraryTab },
  ];

  const renderTrack = (track: Track, collection: Track[]) => (
    <button
      key={track.id}
      type="button"
      onClick={() => onPlayTrack(track, collection)}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-[var(--liquid-glass-border-subtle)] bg-[var(--app-surface)]/55 p-2.5 text-left transition-colors hover:bg-[var(--app-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
      title={`Reproducir ${track.title}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--app-surface-elevated)]">
        {track.coverUrl ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" /> : <Music2 size={18} className="text-[var(--app-accent)]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[var(--app-text)]">{track.title}</span>
        <span className="mt-0.5 block truncate text-xs text-[var(--app-text-muted)]">{track.artist}</span>
      </span>
      <Play size={15} className="shrink-0 text-[var(--app-accent)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
    </button>
  );

  return (
    <section aria-label="Inicio de la biblioteca" className="space-y-8 pb-8">
      {currentTrack && (
        <div className="flex flex-col gap-4 rounded-3xl border border-[var(--liquid-glass-border)] bg-gradient-to-r from-[#7C5CFF]/15 via-[var(--app-surface)]/65 to-[#4FD1C5]/10 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--app-surface-elevated)]">
              {currentTrack.coverUrl ? <img src={currentTrack.coverUrl} alt="" className="h-full w-full object-cover" /> : <Disc3 size={24} className="text-[var(--app-accent)]" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-accent)]">{isPlaying ? 'Sonando ahora' : 'Continuar escuchando'}</p>
              <h3 className="mt-1 truncate text-lg font-bold text-[var(--app-text)]">{currentTrack.title}</h3>
              <p className="truncate text-sm text-[var(--app-text-muted)]">{currentTrack.artist}</p>
            </div>
          </div>
          <button type="button" onClick={onTogglePlayback} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] px-4 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] sm:self-auto">
            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}{isPlaying ? 'Pausar reproducción' : 'Reanudar'}
          </button>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-[var(--app-text)] sm:text-lg">
              <span className="text-[var(--app-accent)]">{section.icon}</span>{section.title}
            </h3>
            {section.items.length > 0 && (
              <button type="button" onClick={() => onNavigate(section.destination)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">
                Ver todo <ArrowRight size={14} />
              </button>
            )}
          </div>
          {section.items.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {section.items.map((track) => renderTrack(track, section.items))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[var(--liquid-glass-border)] px-4 py-5 text-sm text-[var(--app-text-muted)]">
              {section.destination === 'history' ? 'Cuando reproduzcas música, tus escuchas recientes aparecerán aquí.' : section.destination === 'smart-top' ? 'Tus pistas más reproducidas aparecerán aquí conforme las escuches.' : 'Las pistas importadas recientemente aparecerán aquí.'}
            </p>
          )}
        </div>
      ))}

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-[var(--app-text)] sm:text-lg"><span className="text-[var(--app-accent)]"><Disc3 size={16} /></span>Tus playlists</h3>
          <button type="button" onClick={() => onNavigate('playlists')} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">Ver todas <ArrowRight size={14} /></button>
        </div>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {playlists.slice(0, 4).map((playlist) => (
              <button key={playlist.id} type="button" onClick={() => onOpenPlaylist(playlist.id)} className="group min-w-0 rounded-2xl border border-[var(--liquid-glass-border)] bg-[var(--app-surface)]/55 p-3 text-left transition-colors hover:bg-[var(--app-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">
                <span className="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#7C5CFF]/30 to-[#4FD1C5]/30">
                  {playlist.coverUrl ? <img src={playlist.coverUrl} alt="" className="h-full w-full object-cover" /> : <Disc3 size={24} className="text-[var(--app-accent)]" />}
                </span>
                <span className="block truncate text-sm font-semibold text-[var(--app-text)]">{playlist.name}</span>
                <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">{playlist.trackIds.length} canciones</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--liquid-glass-border)] px-4 py-5 text-sm text-[var(--app-text-muted)]">Crea una playlist para organizar tus canciones favoritas.</p>
        )}
      </div>
    </section>
  );
};
