import React, { useMemo, useState } from 'react';
import { Play, Heart, ListMusic, History, Tag } from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { TrackRow } from './TrackRow';
import { TrackCard } from './TrackCard';
import { LibraryStatsBanner } from './LibraryStatsBanner';
import { LibraryEmptyState } from './LibraryEmptyState';
import { ArtistsGridView } from './ArtistsGridView';
import { AlbumsGridView } from './AlbumsGridView';
import { formatDuration } from '../../lib/metadata';
import { generateDemoArpeggioTrack } from '../../lib/audioGenerator';

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
  } = useLibraryStore();

  const { playTrack, recentTracks } = usePlayerStore();
  const [isDragOver, setIsDragOver] = useState(false);

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

    // Filter by Playlist or Favorites
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
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [tracks, recentTracks, playlists, activeTab, selectedPlaylistId, selectedGenre, searchQuery, sortBy, sortOrder]);

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

  const handlePlayAll = () => {
    if (displayedTracks.length > 0) {
      playTrack(displayedTracks[0], displayedTracks);
    }
  };

  const handleGenerateSampleTrack = async () => {
    try {
      const demoFile = await generateDemoArpeggioTrack();
      await importFiles([demoFile]);
    } catch (err) {
      console.warn('Could not generate sample track:', err);
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
        onGenerateSampleTrack={handleGenerateSampleTrack}
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
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-[#4FD1C5] flex items-center justify-center shadow-xl shrink-0 border border-white/20">
              <ListMusic size={44} className="text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--app-accent)]">
                Playlist
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--app-text)] tracking-tight mt-0.5 mb-1.5">
                {currentPlaylist.name}
              </h2>
              {currentPlaylist.description && (
                <p className="text-xs text-[var(--app-text-muted)] mb-2">
                  {currentPlaylist.description}
                </p>
              )}
              <div className="flex items-center gap-2.5 text-xs text-[var(--app-text-muted)]">
                <span>{displayedTracks.length} pistas</span>
                <span>•</span>
                <span>{formatDuration(totalDuration)} tiempo total</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'favorites' ? (
          <div className="flex items-center gap-4 mb-4">
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
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-[0_4px_16px_rgba(124,92,255,0.4)] border border-white/20 self-start sm:self-auto"
              >
                <Play size={15} fill="currentColor" />
                <span>Reproducir todo</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Stats Banner */}
        {activeTab === 'tracks' && displayedTracks.length > 0 && (
          <LibraryStatsBanner
            trackCount={tracks.length}
            totalDuration={totalDuration}
            artistCount={groupedArtists.length}
            albumCount={groupedAlbums.length}
          />
        )}

        {/* Interactive Genre filter chips */}
        {uniqueGenres.length > 0 && activeTab !== 'artists' && activeTab !== 'albums' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mt-1">
            <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1 opacity-80">
              <Tag size={12} />
              <span>Género:</span>
            </span>
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                selectedGenre === null
                  ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm shadow-[#7C5CFF]/30 border border-white/20'
                  : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[#7C5CFF]/40'
              }`}
            >
              Todos
            </button>
            {uniqueGenres.map((genre) => {
              const isSelected = selectedGenre?.toLowerCase() === genre.toLowerCase();
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(isSelected ? null : genre)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm shadow-[#7C5CFF]/30 border border-white/20'
                      : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[#7C5CFF]/40'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Render based on view mode and tab */}
      <div className="px-4 sm:px-8 flex-1 relative z-10">
        {displayedTracks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center text-[var(--app-text-muted)]">
            <p className="text-sm font-medium text-[var(--app-text)] mb-1">
              {activeTab === 'history' ? 'Historial vacío' : 'No se encontraron canciones'}
            </p>
            <p className="text-xs">
              {activeTab === 'history'
                ? 'Las canciones que reproduzcas aparecerán aquí automáticamente.'
                : searchQuery
                ? `No hay resultados para «${searchQuery}».`
                : selectedGenre
                ? `No hay pistas con el género «${selectedGenre}».`
                : 'Añade pistas a esta sección.'}
            </p>
          </div>
        ) : activeTab === 'artists' ? (
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
      </div>
    </div>
  );
};
