import React, { useMemo, useState } from 'react';
import { Play, Heart, ListMusic } from 'lucide-react';
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
    sortBy,
    sortOrder,
    viewMode,
    importDirectoryWithPicker,
    importFiles,
  } = useLibraryStore();

  const { playTrack } = usePlayerStore();
  const [isDragOver, setIsDragOver] = useState(false);

  // Filter & sort tracks based on activeTab, selected playlist, and search query
  const displayedTracks = useMemo(() => {
    let list = [...tracks];

    // Filter by Playlist or Favorites
    if (activeTab === 'playlists' && selectedPlaylistId) {
      const pl = playlists.find((p) => p.id === selectedPlaylistId);
      if (pl) {
        list = list.filter((t) => pl.trackIds.includes(t.id));
      }
    } else if (activeTab === 'favorites') {
      list = list.filter((t) => t.isFavorite);
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

    // Sort
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

    return list;
  }, [tracks, playlists, activeTab, selectedPlaylistId, searchQuery, sortBy, sortOrder]);

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
      className={`flex-1 flex flex-col overflow-y-auto pb-32 transition-colors relative ${
        isDragOver ? 'bg-[#7C5CFF]/5 border-2 border-dashed border-[#7C5CFF]' : ''
      }`}
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 right-10 w-96 h-96 rounded-full bg-[#7C5CFF]/15 blur-3xl animate-float-1" />
      <div className="pointer-events-none absolute top-40 left-10 w-80 h-80 rounded-full bg-[#4FD1C5]/15 blur-3xl animate-float-2" />

      {/* Header Banner */}
      <div className="px-8 pt-8 pb-4 relative z-10">
        {activeTab === 'playlists' && currentPlaylist ? (
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-[#4FD1C5] flex items-center justify-center shadow-xl shrink-0">
              <ListMusic size={48} className="text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-accent)]">
                Playlist
              </span>
              <h2 className="text-3xl font-extrabold text-[var(--app-text)] tracking-tight mt-1 mb-2">
                {currentPlaylist.name}
              </h2>
              {currentPlaylist.description && (
                <p className="text-xs text-[var(--app-text-muted)] mb-3">
                  {currentPlaylist.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-[var(--app-text-muted)]">
                <span>{displayedTracks.length} pistas</span>
                <span>•</span>
                <span>{formatDuration(totalDuration)} tiempo total</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'favorites' ? (
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-md">
              <Heart size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--app-text)]">Canciones favoritas</h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                {displayedTracks.length} pistas guardadas
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold hover:bg-[#6D48F7] active:scale-95 transition-all shadow-[0_4px_16px_rgba(124,92,255,0.35)]"
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
      </div>

      {/* Render based on view mode and tab */}
      <div className="px-8 flex-1 relative z-10">
        {displayedTracks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center text-[var(--app-text-muted)]">
            <p className="text-sm font-medium text-[var(--app-text)] mb-1">
              No se encontraron canciones
            </p>
            <p className="text-xs">
              {searchQuery
                ? `No hay resultados para «${searchQuery}».`
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
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm p-2">
            <div className="flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider border-b border-[var(--app-border)]">
              <span className="w-8 text-center">#</span>
              <span className="flex-1 md:w-5/12">Título</span>
              <span className="hidden md:block w-3/12">Artista</span>
              <span className="hidden lg:block w-3/12">Álbum</span>
              <span className="w-24 text-right pr-2">Duración</span>
            </div>

            <div className="divide-y divide-[var(--app-border-subtle)]">
              {displayedTracks.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  onOpenCreatePlaylistModal={onOpenCreatePlaylistModal}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
