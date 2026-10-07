import React, { useMemo } from 'react';
import {
  BarChart3,
  X,
  Clock,
  Music,
  Heart,
  ListMusic,
  User,
  Disc,
  Tag,
  History,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';

export const StatsModal: React.FC = () => {
  const { isStatsOpen, toggleStats } = useUIStore();
  const { tracks, playlists } = useLibraryStore();
  const { recentTracks } = usePlayerStore();

  const stats = useMemo(() => {
    const totalDurationSec = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
    const favoritesCount = tracks.filter((t) => t.isFavorite).length;

    // Artists count
    const artistMap = new Map<string, number>();
    tracks.forEach((t) => {
      const art = t.artist.trim() || 'Desconocido';
      artistMap.set(art, (artistMap.get(art) || 0) + 1);
    });
    const topArtists = Array.from(artistMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Genres breakdown
    const genreMap = new Map<string, number>();
    tracks.forEach((t) => {
      if (t.genre && t.genre.trim() && t.genre.toLowerCase() !== 'unknown') {
        const g = t.genre.trim();
        genreMap.set(g, (genreMap.get(g) || 0) + 1);
      }
    });
    const topGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Albums breakdown
    const albumMap = new Map<string, number>();
    tracks.forEach((t) => {
      const alb = t.album.trim() || 'Desconocido';
      albumMap.set(alb, (albumMap.get(alb) || 0) + 1);
    });
    const topAlbums = Array.from(albumMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Format total duration into hours and minutes
    const hours = Math.floor(totalDurationSec / 3600);
    const mins = Math.floor((totalDurationSec % 3600) / 60);

    return {
      totalTracks: tracks.length,
      totalDurationSec,
      hours,
      mins,
      favoritesCount,
      playlistsCount: playlists.length,
      recentHistoryCount: recentTracks.length,
      uniqueArtistsCount: artistMap.size,
      uniqueAlbumsCount: albumMap.size,
      uniqueGenresCount: genreMap.size,
      topArtists,
      topGenres,
      topAlbums,
    };
  }, [tracks, playlists, recentTracks]);

  if (!isStatsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => toggleStats(false)}
    >
      <div
        className="w-full max-w-2xl bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#4FD1C5]/15 text-[#4FD1C5]">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--app-text)] leading-tight">
                Estadísticas de la Biblioteca (BeatNest Insights)
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                Métricas de tu colección local calculadas en tu dispositivo
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleStats(false)}
            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable stats content */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--app-text-muted)] mb-1">
                <Music size={13} className="text-[#7C5CFF]" />
                <span>Canciones</span>
              </div>
              <div className="text-xl font-extrabold text-[var(--app-text)]">
                {stats.totalTracks}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--app-text-muted)] mb-1">
                <Clock size={13} className="text-[#4FD1C5]" />
                <span>Tiempo Total</span>
              </div>
              <div className="text-xl font-extrabold text-[var(--app-text)]">
                {stats.hours}h {stats.mins}m
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--app-text-muted)] mb-1">
                <Heart size={13} className="text-red-400" />
                <span>Favoritos</span>
              </div>
              <div className="text-xl font-extrabold text-[var(--app-text)]">
                {stats.favoritesCount}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--app-text-muted)] mb-1">
                <History size={13} className="text-amber-400" />
                <span>En Historial</span>
              </div>
              <div className="text-xl font-extrabold text-[var(--app-text)]">
                {stats.recentHistoryCount}
              </div>
            </div>
          </div>

          {/* Top Artists & Top Albums */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Artists */}
            <div className="p-4 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)]">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[var(--app-text)] uppercase tracking-wider">
                <User size={14} className="text-[#7C5CFF]" />
                <span>Artistas Destacados</span>
              </div>
              {stats.topArtists.length === 0 ? (
                <p className="text-xs text-[var(--app-text-muted)]">Sin datos aún</p>
              ) : (
                <div className="space-y-2">
                  {stats.topArtists.map(([artist, count]) => {
                    const percent = Math.round((count / (stats.totalTracks || 1)) * 100);
                    return (
                      <div key={artist} className="space-y-1">
                        <div className="flex justify-between text-xs text-[var(--app-text)]">
                          <span className="truncate pr-2 font-medium">{artist}</span>
                          <span className="font-mono text-[var(--app-text-muted)] text-[11px] shrink-0">
                            {count} {count === 1 ? 'pista' : 'pistas'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--app-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#7C5CFF] rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Genres */}
            <div className="p-4 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)]">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[var(--app-text)] uppercase tracking-wider">
                <Tag size={14} className="text-[#4FD1C5]" />
                <span>Distribución por Géneros</span>
              </div>
              {stats.topGenres.length === 0 ? (
                <p className="text-xs text-[var(--app-text-muted)]">
                  Sin etiquetas de género registradas en metadatos
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.topGenres.map(([genre, count]) => {
                    const percent = Math.round((count / (stats.totalTracks || 1)) * 100);
                    return (
                      <div key={genre} className="space-y-1">
                        <div className="flex justify-between text-xs text-[var(--app-text)]">
                          <span className="truncate pr-2 font-medium">{genre}</span>
                          <span className="font-mono text-[var(--app-text-muted)] text-[11px] shrink-0">
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--app-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4FD1C5] rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick secondary metrics */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--app-surface-elevated)]/50 border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
            <div className="flex items-center gap-1.5">
              <Disc size={14} />
              <span>{stats.uniqueAlbumsCount} álbumes únicos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span>{stats.uniqueArtistsCount} artistas catalogados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ListMusic size={14} />
              <span>{stats.playlistsCount} playlists activas</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--app-border)] flex justify-end shrink-0">
          <button
            onClick={() => toggleStats(false)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--app-surface-elevated)] text-[var(--app-text)] hover:bg-[var(--app-border)] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
