import React, { useMemo, useState, useRef } from 'react';
import {
  Play,
  Pause,
  Heart,
  ListMusic,
  History,
  Tag,
  Sparkles,
  Clock,
  Timer,
  FileDown,
  Layers,
  Shuffle,
  Plus,
  Trash2,
  Upload,
  Music,
  FolderPlus,
} from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { TrackRow } from './TrackRow';
import { TrackCard } from './TrackCard';
import { LibraryStatsBanner } from './LibraryStatsBanner';
import { LibraryEmptyState } from './LibraryEmptyState';
import { ArtistsGridView } from './ArtistsGridView';
import { AlbumsGridView } from './AlbumsGridView';
import { formatDuration } from '../../lib/metadata';
import { exportPlaylistAsM3U } from '../../lib/playlistExport';
import { showToast } from '../../stores/useToastStore';

interface LibraryViewProps {
  onOpenCreatePlaylistModal: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onOpenCreatePlaylistModal }) => {
  const {
    tracks,
    playlists,
    activeTab,
    selectedPlaylistId,
    searchQuery,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    sortOrder,
    viewMode,
    importDirectoryWithPicker,
    importFiles,
    reorderPlaylistTracks,
    deletePlaylist,
    addTrackToPlaylist,
    updatePlaylistCover,
    loadDemoPack,
    setSelectedPlaylistId,
  } = useLibraryStore();

  const { playTrack, recentTracks, isPlaying, currentTrack, togglePlay } = usePlayerStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const playlistFileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract unique genres across entire library
  const uniqueGenres = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.genre && t.genre.trim() && t.genre.toLowerCase() !== 'unknown') {
        set.add(t.genre.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tracks]);

  // Filter & sort tracks based on activeTab, selected playlist, search query, and genre
  const displayedTracks = useMemo(() => {
    let list = activeTab === 'history' ? [...recentTracks] : [...tracks];

    // Filter by Playlist, Favorites, or Smart Playlists
    if (activeTab === 'playlists' && selectedPlaylistId) {
      const pl = playlists.find((p) => p.id === selectedPlaylistId);
      if (pl) {
        const trackMap = new Map(tracks.map((t) => [t.id, t]));
        list = pl.trackIds
          .map((id) => trackMap.get(id))
          .filter((t): t is (typeof tracks)[0] => !!t);
      }
    } else if (activeTab === 'favorites') {
      list = list.filter((t) => t.isFavorite);
    } else if (activeTab === 'smart-top') {
      list = list.filter((t) => (t.playCount || 0) > 0);
    } else if (activeTab === 'smart-recent') {
      list = [...tracks];
    } else if (activeTab === 'smart-long') {
      list = list.filter((t) => t.duration >= 300);
    }

    // Filter by Audio Format
    if (selectedFormat) {
      list = list.filter((t) => {
        const ext = t.fileName.split('.').pop()?.toUpperCase() || '';
        return ext === selectedFormat;
      });
    }

    // Filter by Genre
    if (selectedGenre) {
      list = list.filter(
        (t) => t.genre && t.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.fileName.toLowerCase().includes(q)
      );
    }

    // Sort (skip custom sort on history and custom playlists to preserve custom ordering)
    if (activeTab !== 'history' && !(activeTab === 'playlists' && selectedPlaylistId)) {
      list.sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortBy) {
          case 'title':
            valA = a.title.toLowerCase();
            valB = b.title.toLowerCase();
            break;
          case 'artist':
            valA = a.artist.toLowerCase();
            valB = b.artist.toLowerCase();
            break;
          case 'album':
            valA = a.album.toLowerCase();
            valB = b.album.toLowerCase();
            break;
          case 'duration':
            valA = a.duration;
            valB = b.duration;
            break;
          case 'dateAdded':
            valA = a.dateAdded;
            valB = b.dateAdded;
            break;
          case 'playCount':
            valA = a.playCount || 0;
            valB = b.playCount || 0;
            break;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [tracks, recentTracks, playlists, activeTab, selectedPlaylistId, selectedGenre, selectedFormat, searchQuery, sortBy, sortOrder]);

  // Groupings for Artists and Albums view
  const groupedArtists = useMemo(() => {
    const map = new Map<string, typeof tracks>();
    tracks.forEach((t) => {
      const arr = map.get(t.artist) || [];
      arr.push(t);
      map.set(t.artist, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const groupedAlbums = useMemo(() => {
    const map = new Map<string, typeof tracks>();
    tracks.forEach((t) => {
      const arr = map.get(t.album) || [];
      arr.push(t);
      map.set(t.album, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  // Available tracks from library not yet in current playlist
  const availableTracksToAdd = useMemo(() => {
    if (!currentPlaylist) return [];
    const inPlaylist = new Set(currentPlaylist.trackIds);
    return tracks.filter((t) => !inPlaylist.has(t.id));
  }, [currentPlaylist, tracks]);

  // Up to 4 covers for Spotify 2x2 collage
  const playlistCollageCovers = useMemo(() => {
    if (!currentPlaylist) return [];
    const trackMap = new Map(tracks.map((t) => [t.id, t]));
    const urls: string[] = [];
    for (const tid of currentPlaylist.trackIds) {
      const t = trackMap.get(tid);
      if (t?.coverUrl) {
        urls.push(t.coverUrl);
        if (urls.length >= 4) break;
      }
    }
    return urls;
  }, [currentPlaylist, tracks]);

  const totalDuration = useMemo(() => {
    return displayedTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  }, [displayedTracks]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await importFiles(e.dataTransfer.files);
    }
  };

  // Play whole list in order
  const handlePlayAll = () => {
    if (displayedTracks.length > 0) {
      playTrack(displayedTracks[0], displayedTracks, false);
      showToast('Reproduciendo', `Iniciada lista de ${displayedTracks.length} canciones en orden`, 'info');
    }
  };

  // Play whole list in random order
  const handleShuffleAll = () => {
    if (displayedTracks.length > 0) {
      const shuffled = [...displayedTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled, false);
      showToast('Modo aleatorio', `Reproduciendo ${displayedTracks.length} canciones en orden aleatorio`, 'info');
    }
  };

  const handlePlaylistCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentPlaylist) {
      await updatePlaylistCover(currentPlaylist.id, file);
    }
  };

  // If entire library is empty
  if (tracks.length === 0) {
    return (
      <LibraryEmptyState
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onImportDirectory={importDirectoryWithPicker}
        onLoadDemoPack={loadDemoPack}
      />
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col overflow-y-auto pb-36 sm:pb-32 transition-colors relative ${
        isDragOver ? 'bg-[#7C5CFF]/10 border-2 border-dashed border-[#7C5CFF]' : ''
      }`}
    >
      {/* Header Banner */}
      <div className="px-4 sm:px-8 pt-5 sm:pt-8 pb-4 relative z-10">
        {activeTab === 'playlists' && currentPlaylist ? (
          /* Spotify-Style Playlist View Header */
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Cover Artwork / 2x2 collage */}
              <div
                onClick={() => playlistFileInputRef.current?.click()}
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#7C5CFF] to-[#4FD1C5] flex items-center justify-center shadow-2xl shrink-0 border border-white/20 group cursor-pointer"
                title="Haz clic para subir una foto de portada personalizada"
              >
                {currentPlaylist.coverUrl ? (
                  <img
                    src={currentPlaylist.coverUrl}
                    alt={currentPlaylist.name}
                    className="w-full h-full object-cover"
                  />
                ) : playlistCollageCovers.length >= 4 ? (
                  <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                    {playlistCollageCovers.slice(0, 4).map((url, i) => (
                      <img key={i} src={url} alt="" className="w-full h-full object-cover" />
                    ))}
                  </div>
                ) : playlistCollageCovers.length > 0 ? (
                  <img src={playlistCollageCovers[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ListMusic size={48} className="text-white" />
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity gap-1.5">
                  <Upload size={16} />
                  <span>Cambiar foto</span>
                </div>
              </div>

              <input
                type="file"
                ref={playlistFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePlaylistCoverChange}
              />

              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#4FD1C5]">
                  Playlist pública
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[var(--app-text)] tracking-tight mt-1 mb-2 truncate">
                  {currentPlaylist.name}
                </h2>
                {currentPlaylist.description && (
                  <p className="text-xs text-[var(--app-text-muted)] mb-2.5 line-clamp-2">
                    {currentPlaylist.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--app-text-muted)]">
                  <span className="font-semibold text-[var(--app-text)]">BeatNest</span>
                  <span>•</span>
                  <span>{displayedTracks.length} canciones</span>
                  <span>•</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </div>
            </div>

            {/* Spotify-style Action Bar */}
            <div className="flex items-center gap-2.5 self-start md:self-end shrink-0">
              {displayedTracks.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      const isThisPlaying = isPlaying && currentTrack && displayedTracks.some((t) => t.id === currentTrack.id);
                      if (isThisPlaying) {
                        togglePlay();
                      } else {
                        handlePlayAll();
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#6366F1] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border border-white/20"
                    title="Reproducir playlist"
                  >
                    {isPlaying && currentTrack && displayedTracks.some((t) => t.id === currentTrack.id) ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={handleShuffleAll}
                    className="p-3 rounded-2xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[#4FD1C5] hover:bg-[var(--app-surface-hover)] transition-all shadow-sm"
                    title="Reproducir en orden aleatorio"
                  >
                    <Shuffle size={18} />
                  </button>

                  <button
                    onClick={() => {
                      exportPlaylistAsM3U(currentPlaylist.name, displayedTracks);
                      showToast('Exportación M3U', `Descargado archivo .m3u para «${currentPlaylist.name}»`);
                    }}
                    className="p-3 rounded-2xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-all shadow-sm"
                    title="Exportar archivo de playlist .M3U"
                  >
                    <FileDown size={18} />
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  deletePlaylist(currentPlaylist.id);
                  setSelectedPlaylistId(null);
                  showToast('Playlist eliminada', `Se eliminó la playlist «${currentPlaylist.name}»`, 'warning');
                }}
                className="p-3 rounded-2xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all shadow-sm"
                title="Eliminar esta playlist"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ) : activeTab === 'playlists' && !selectedPlaylistId ? (
          /* Spotify-Style Playlists Hub View */
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--app-text)] tracking-tight">
                  Tus Playlists
                </h2>
                <p className="text-xs text-[var(--app-text-muted)] mt-1">
                  Colecciones locales creadas en BeatNest
                </p>
              </div>

              <button
                onClick={onOpenCreatePlaylistModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md border border-white/20 self-start sm:self-auto"
              >
                <FolderPlus size={15} />
                <span>Crear playlist</span>
              </button>
            </div>

            {/* Playlists Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlists.map((pl) => {
                const count = pl.trackIds.length;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(pl.id)}
                    className="group relative p-3.5 rounded-2xl liquid-glass hover:bg-[var(--app-surface-hover)] border border-[var(--liquid-glass-border)] cursor-pointer transition-all shadow-sm hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-tr from-[#7C5CFF] to-[#4FD1C5] mb-3 flex items-center justify-center shadow-md">
                      {pl.coverUrl ? (
                        <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                      ) : (
                        <ListMusic size={36} className="text-white opacity-90" />
                      )}

                      {/* Play Hover Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const plTracks = pl.trackIds
                            .map((id) => tracks.find((t) => t.id === id))
                            .filter((t): t is (typeof tracks)[0] => !!t);
                          if (plTracks.length > 0) {
                            playTrack(plTracks[0], plTracks, false);
                            showToast('Reproduciendo playlist', `Iniciando «${pl.name}»`, 'info');
                          }
                        }}
                        className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#6366F1] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg transition-all"
                        title="Reproducir playlist"
                      >
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--app-text)] truncate">{pl.name}</h4>
                    <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                      {count} {count === 1 ? 'canción' : 'canciones'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'favorites' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-md">
                <Heart size={26} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--app-text)]">Canciones favoritas</h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {displayedTracks.length} pistas guardadas
                </p>
              </div>
            </div>

            {displayedTracks.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md border border-white/20"
                >
                  <Play size={15} fill="currentColor" />
                  <span>Reproducir todo</span>
                </button>
                <button
                  onClick={handleShuffleAll}
                  className="p-2.5 rounded-xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[#4FD1C5] hover:bg-[var(--app-surface-hover)] transition-all shadow-sm"
                  title="Reproducción aleatoria"
                >
                  <Shuffle size={16} />
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'history' ? (
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4FD1C5]/15 border border-[#4FD1C5]/30 flex items-center justify-center text-[#4FD1C5] shadow-md">
              <History size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--app-text)]">Historial reciente</h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                {displayedTracks.length} {displayedTracks.length === 1 ? 'pista reproducida' : 'pistas reproducidas'} recientemente
              </p>
            </div>
          </div>
        ) : activeTab === 'smart-top' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <Sparkles size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--app-text)]">Más reproducidas</h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {displayedTracks.length} pistas con mayor actividad de escucha
                </p>
              </div>
            </div>
            {displayedTracks.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md border border-white/20"
                >
                  <Play size={15} fill="currentColor" />
                  <span>Reproducir todo</span>
                </button>
                <button
                  onClick={handleShuffleAll}
                  className="p-2.5 rounded-xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[#4FD1C5] hover:bg-[var(--app-surface-hover)] transition-all shadow-sm"
                  title="Reproducción aleatoria"
                >
                  <Shuffle size={16} />
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'smart-recent' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#4FD1C5]/15 border border-[#4FD1C5]/30 flex items-center justify-center text-[#4FD1C5] shadow-md">
                <Clock size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--app-text)]">Añadidas recientemente</h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {displayedTracks.length} pistas en tu biblioteca local
                </p>
              </div>
            </div>
            {displayedTracks.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md border border-white/20"
                >
                  <Play size={15} fill="currentColor" />
                  <span>Reproducir todo</span>
                </button>
                <button
                  onClick={handleShuffleAll}
                  className="p-2.5 rounded-xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[#4FD1C5] hover:bg-[var(--app-surface-hover)] transition-all shadow-sm"
                  title="Reproducción aleatoria"
                >
                  <Shuffle size={16} />
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'smart-long' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[#7C5CFF] shadow-md">
                <Timer size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--app-text)]">Pistas largas (+5 min)</h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {displayedTracks.length} pistas y sesiones extensas registradas
                </p>
              </div>
            </div>
            {displayedTracks.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md border border-white/20"
                >
                  <Play size={15} fill="currentColor" />
                  <span>Reproducir todo</span>
                </button>
                <button
                  onClick={handleShuffleAll}
                  className="p-2.5 rounded-xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[#4FD1C5] hover:bg-[var(--app-surface-hover)] transition-all shadow-sm"
                  title="Reproducción aleatoria"
                >
                  <Shuffle size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--app-text)] tracking-tight">
                {activeTab === 'artists'
                  ? 'Artistas'
                  : activeTab === 'albums'
                  ? 'Álbumes'
                  : 'Todas las pistas'}
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                {displayedTracks.length} {displayedTracks.length === 1 ? 'pista' : 'pistas'} registradas • {formatDuration(totalDuration)} de audio
              </p>
            </div>

            {displayedTracks.length > 0 && activeTab !== 'artists' && activeTab !== 'albums' && (
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md border border-white/20"
                  title="Inicia la reproducción desde la primera canción y pone todas las canciones en la cola"
                >
                  <Play size={15} fill="currentColor" />
                  <span>Reproducir todo</span>
                </button>

                <button
                  onClick={handleShuffleAll}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass-subtle hover:bg-[var(--app-surface-hover)] text-[var(--app-text)] text-xs font-semibold transition-all border border-[var(--liquid-glass-border)] shadow-sm"
                  title="Reproduce todas las canciones en orden aleatorio"
                >
                  <Shuffle size={14} className="text-[#4FD1C5]" />
                  <span>Aleatorio</span>
                </button>

                {tracks.length < 5 && (
                  <button
                    onClick={loadDemoPack}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7C5CFF]/15 to-[#4FD1C5]/15 hover:from-[#7C5CFF]/25 hover:to-[#4FD1C5]/25 border border-[#7C5CFF]/30 text-[var(--app-text)] transition-all shadow-sm"
                    title="Cargar 3 canciones demo con portadas para probar crossfade y playlists"
                  >
                    <Sparkles size={13} className="text-[#7C5CFF]" />
                    <span>Pack demo (3 pistas)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Top Slim Stats Strip */}
        {activeTab !== 'playlists' && (
          <LibraryStatsBanner
            trackCount={tracks.length}
            totalDuration={tracks.reduce((acc, t) => acc + (t.duration || 0), 0)}
            artistCount={uniqueGenres.length > 0 ? groupedArtists.length : 1}
            albumCount={groupedAlbums.length}
          />
        )}

        {/* Interactive Genre & Format filter toolbar */}
        {activeTab !== 'artists' && activeTab !== 'albums' && (activeTab !== 'playlists' || selectedPlaylistId) && (
          <div className="flex flex-wrap items-center justify-between gap-3 py-2 mb-3 border-y border-[var(--liquid-glass-border-subtle)]">
            {/* Format Filter Segmented Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1 opacity-80">
                <Layers size={12} className="text-[#4FD1C5]" />
                <span>Formato:</span>
              </span>
              <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-[var(--app-surface)] border border-[var(--liquid-glass-border-subtle)]">
                {['ALL', 'MP3', 'FLAC', 'WAV', 'OGG', 'M4A'].map((fmt) => {
                  const isSelected = (fmt === 'ALL' && selectedFormat === null) || selectedFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt === 'ALL' ? null : fmt)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                        isSelected
                          ? 'bg-[#4FD1C5] text-black shadow-sm font-bold'
                          : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Genre Filter Chips */}
            {uniqueGenres.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1 opacity-80">
                  <Tag size={12} className="text-[#7C5CFF]" />
                  <span>Género:</span>
                </span>
                <button
                  onClick={() => setSelectedGenre(null)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    selectedGenre === null
                      ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm font-semibold'
                      : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[#7C5CFF]/30'
                  }`}
                >
                  Todos
                </button>
                {uniqueGenres.map((genre) => {
                  const isSelected = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(isSelected ? null : genre)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm font-semibold'
                          : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[#7C5CFF]/30'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Content Views: Artists, Albums, Table, or Grid */}
        {activeTab === 'playlists' && !selectedPlaylistId ? null : activeTab === 'artists' ? (
          <ArtistsGridView
            groupedArtists={groupedArtists}
            onPlayArtist={(artistTracks) => playTrack(artistTracks[0], artistTracks)}
          />
        ) : activeTab === 'albums' ? (
          <AlbumsGridView
            groupedAlbums={groupedAlbums}
            onPlayAlbum={(albumTracks) => playTrack(albumTracks[0], albumTracks)}
          />
        ) : viewMode === 'list' ? (
          <div className="liquid-glass rounded-2xl shadow-sm p-1 sm:p-2 border border-[var(--liquid-glass-border)]">
            <div className="flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider border-b border-[var(--liquid-glass-border-subtle)]">
              <span className="w-8 text-center">#</span>
              <span className="flex-1 md:w-5/12">Título</span>
              <span className="hidden md:block w-3/12">Artista</span>
              <span className="hidden lg:block w-3/12">Álbum</span>
              <span className="w-24 text-right pr-2">Duración</span>
            </div>

            <div className="divide-y divide-[var(--liquid-glass-border-subtle)]">
              {displayedTracks.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  onOpenCreatePlaylistModal={onOpenCreatePlaylistModal}
                  onMoveUp={
                    activeTab === 'playlists' && selectedPlaylistId && idx > 0
                      ? () => reorderPlaylistTracks(selectedPlaylistId, idx, idx - 1)
                      : undefined
                  }
                  onMoveDown={
                    activeTab === 'playlists' && selectedPlaylistId && idx < displayedTracks.length - 1
                      ? () => reorderPlaylistTracks(selectedPlaylistId, idx, idx + 1)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {displayedTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onOpenCreatePlaylistModal={onOpenCreatePlaylistModal}
              />
            ))}
          </div>
        )}

        {/* Spotify-style "Añadir más canciones a esta playlist" section */}
        {activeTab === 'playlists' && currentPlaylist && (
          <div className="mt-8 pt-6 border-t border-[var(--liquid-glass-border-subtle)]">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h3 className="text-base font-bold text-[var(--app-text)]">
                  Añadir canciones a «{currentPlaylist.name}»
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Canciones disponibles en tu biblioteca para incorporar
                </p>
              </div>
            </div>

            {availableTracksToAdd.length === 0 ? (
              <div className="p-5 rounded-2xl liquid-glass-subtle text-xs text-[var(--app-text-muted)] text-center">
                Todas las canciones de tu biblioteca ya están añadidas a esta playlist.
              </div>
            ) : (
              <div className="space-y-1.5">
                {availableTracksToAdd.slice(0, 10).map((cand) => (
                  <div
                    key={cand.id}
                    className="flex items-center justify-between p-2.5 rounded-xl liquid-glass-subtle hover:bg-[var(--app-surface-hover)] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--app-surface)] shrink-0 shadow-sm flex items-center justify-center">
                        {cand.coverUrl ? (
                          <img src={cand.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Music size={16} className="text-[#7C5CFF]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--app-text)] truncate">{cand.title}</p>
                        <p className="text-[11px] text-[var(--app-text-muted)] truncate">
                          {cand.artist} • {cand.album}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addTrackToPlaylist(currentPlaylist.id, cand.id);
                        showToast('Canción añadida', `«${cand.title}» se agregó a la playlist`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--app-surface)] hover:bg-[#7C5CFF] hover:text-white border border-[var(--liquid-glass-border)] text-xs font-semibold text-[var(--app-text)] transition-all shrink-0"
                    >
                      <Plus size={13} />
                      <span>Añadir</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
