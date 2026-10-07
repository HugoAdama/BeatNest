import React, { useEffect, useState } from 'react';
import { Check, ListChecks, Music, PencilLine, Plus } from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { useLibraryDisplayPreferencesStore } from '../../stores/useLibraryDisplayPreferencesStore';
import { TrackRow } from './TrackRow';
import { TrackCard } from './TrackCard';
import { LibraryStatsBanner } from './LibraryStatsBanner';
import { LibraryEmptyState } from './LibraryEmptyState';
import { ArtistsGridView } from './ArtistsGridView';
import { AlbumsGridView } from './AlbumsGridView';
import { showToast } from '../../stores/useToastStore';
import { useLibraryViewModel } from './useLibraryViewModel';
import { LibraryHeader } from './LibraryHeader';
import { LibraryFilters } from './LibraryFilters';
import { LibraryHomeView } from './LibraryHomeView';
import { BulkEditTracksModal } from './BulkEditTracksModal';
import { VirtualizedTrackRows } from './VirtualizedTrackRows';
import type { PlaybackCollectionContext } from '../../types/music';

interface LibraryViewProps {
  onOpenCreatePlaylistModal: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onOpenCreatePlaylistModal }) => {
  const {
    tracks,
    playlists,
    activeTab,
    selectedPlaylistId,
    selectedArtistName,
    selectedAlbumName,
    selectedAlbumArtistName,
    searchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedFormat,
    setSelectedFormat,
    setSearchQuery,
    navigateTo,
    sortBy,
    sortOrder,
    viewMode,
    importDirectoryWithPicker,
    importFiles,
    reorderPlaylistTracks,
    addTrackToPlaylist,
    loadDemoPack,
  } = useLibraryStore();

  const { playTrack, recentTracks, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const toggleDashboardPreferences = useUIStore((state) => state.toggleDashboardPreferences);
  const { gridColumns } = useLibraryDisplayPreferencesStore();
  const gridStyle = { '--library-grid-columns': gridColumns } as React.CSSProperties;
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(() => new Set());
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const canSelectTracks = activeTab === 'tracks' || activeTab === 'favorites' || activeTab === 'history' || activeTab.startsWith('smart-') ||
    (activeTab === 'playlists' && !!selectedPlaylistId) || (activeTab === 'artists' && !!selectedArtistName) || (activeTab === 'albums' && !!selectedAlbumName);

  useEffect(() => {
    setSelectionMode(false);
    setSelectedTrackIds(new Set());
  }, [activeTab, selectedPlaylistId, selectedArtistName, selectedAlbumName]);

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds((current) => {
      const next = new Set(current);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };
  const {
    uniqueGenres,
    displayedTracks,
    groupedArtists,
    groupedAlbums,
    currentPlaylist,
    availableTracksToAdd,
    playlistCollageCovers,
    totalDuration,
  } = useLibraryViewModel({
    tracks,
    playlists,
    recentTracks,
    activeTab,
    selectedPlaylistId,
    selectedArtistName,
    selectedAlbumName,
    selectedAlbumArtistName,
    selectedGenre,
    selectedFormat,
    searchQuery,
    sortBy,
    sortOrder,
  });

  const playlistPlaybackContext: PlaybackCollectionContext | null = currentPlaylist
    ? { playlistId: currentPlaylist.id, playlistTrackIds: currentPlaylist.trackIds }
    : null;

  useEffect(() => {
    const visibleIds = new Set(displayedTracks.map((track) => track.id));
    setSelectedTrackIds((current) => {
      const next = new Set([...current].filter((id) => visibleIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [displayedTracks]);

  const selectedVisibleCount = displayedTracks.reduce((count, track) => count + Number(selectedTrackIds.has(track.id)), 0);
  const selectAllVisible = () => setSelectedTrackIds((current) => {
    const next = new Set(current);
    const allVisibleSelected = displayedTracks.length > 0 && displayedTracks.every((track) => next.has(track.id));
    displayedTracks.forEach((track) => allVisibleSelected ? next.delete(track.id) : next.add(track.id));
    return next;
  });

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
      playTrack(displayedTracks[0], displayedTracks, false, playlistPlaybackContext);
      showToast('Reproduciendo', `Iniciada lista de ${displayedTracks.length} canciones en orden`, 'info');
    }
  };

  // Play whole list in random order
  const handleShuffleAll = () => {
    if (displayedTracks.length > 0) {
      const shuffled = [...displayedTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled, false, playlistPlaybackContext);
      showToast('Modo aleatorio', `Reproduciendo ${displayedTracks.length} canciones en orden aleatorio`, 'info');
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
      <div className="px-4 sm:px-8 pt-6 sm:pt-9 pb-5 relative z-10">
      <LibraryHeader
        activeTab={activeTab}
        selectedPlaylistId={selectedPlaylistId}
        selectedArtistName={selectedArtistName}
        selectedAlbumName={selectedAlbumName}
        tracks={tracks}
        displayedTracks={displayedTracks}
        totalDuration={totalDuration}
        playlistCollageCovers={playlistCollageCovers}
        onOpenCreatePlaylistModal={onOpenCreatePlaylistModal}
        onPlayAll={handlePlayAll}
        onShuffleAll={handleShuffleAll}
        onLoadDemoPack={loadDemoPack}
        onBackToCollection={() => navigateTo(activeTab)}
      />
        {/* Top Slim Stats Strip */}
        {activeTab !== 'playlists' && activeTab !== 'home' && (
          <LibraryStatsBanner
            trackCount={tracks.length}
            totalDuration={tracks.reduce((acc, t) => acc + (t.duration || 0), 0)}
            artistCount={new Set(tracks.map((track) => track.artist)).size}
            albumCount={new Set(tracks.map((track) => `${track.album}\u0000${track.artist}`)).size}
          />
        )}

        {activeTab !== 'home' && <LibraryFilters
          activeTab={activeTab}
          selectedPlaylistId={selectedPlaylistId}
          uniqueGenres={uniqueGenres}
          selectedGenre={selectedGenre}
          selectedFormat={selectedFormat}
          searchQuery={searchQuery}
          onSelectGenre={setSelectedGenre}
          onSelectFormat={setSelectedFormat}
          onClearSearch={() => setSearchQuery('')}
          onClearAll={() => {
            setSearchQuery('');
            setSelectedGenre(null);
            setSelectedFormat(null);
          }}
        />}
        {canSelectTracks && displayedTracks.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--liquid-glass-border-subtle)] bg-[var(--app-surface)]/45 px-3 py-2">
            <button type="button" onClick={() => { setSelectionMode((value) => !value); setSelectedTrackIds(new Set()); }} className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">
              <ListChecks size={15} /> {selectionMode ? 'Cancelar selección' : 'Seleccionar pistas'}
            </button>
            {selectionMode && <>
              <span aria-live="polite" className="text-xs text-[var(--app-text-muted)]">{selectedVisibleCount} seleccionadas</span>
              <button type="button" onClick={selectAllVisible} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[var(--app-accent)] hover:bg-[var(--app-primary-light)]"><Check size={14} /> {selectedVisibleCount === displayedTracks.length ? 'Deseleccionar visibles' : 'Seleccionar visibles'}</button>
              <button type="button" disabled={selectedVisibleCount === 0} onClick={() => setIsBulkEditOpen(true)} className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[var(--app-primary)] px-3 text-xs font-semibold text-white shadow-sm hover:bg-[var(--app-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"><PencilLine size={14} /> Editar metadatos</button>
            </>}
          </div>
        )}
        {/* Content Views: home, artist/album collections, table, or grid */}
        {activeTab !== 'home' && activeTab !== 'playlists' && displayedTracks.length === 0 && (
          <div className="my-4 rounded-2xl border border-dashed border-[var(--liquid-glass-border)] bg-[var(--app-surface)]/45 px-5 py-8 text-center">
            <p className="text-base font-semibold text-[var(--app-text)]">No encontramos resultados</p>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">Prueba con otro término o elimina los filtros activos.</p>
            <button type="button" onClick={() => { setSearchQuery(''); setSelectedGenre(null); setSelectedFormat(null); }} className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--app-accent)] hover:bg-[var(--app-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">Limpiar filtros</button>
          </div>
        )}
        {activeTab === 'home' ? (
          <LibraryHomeView
            tracks={tracks}
            playlists={playlists}
            recentTracks={recentTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={(track, queue) => playTrack(track, queue, false)}
            onPlayLibrary={handlePlayAll}
            onTogglePlayback={togglePlay}
            onNavigate={(tab) => navigateTo(tab)}
            onOpenPlaylist={(playlistId) => navigateTo('playlists', { playlistId })}
            onOpenCreatePlaylist={onOpenCreatePlaylistModal}
            onOpenDashboardSettings={() => toggleDashboardPreferences(true)}
          />
        ) : activeTab === 'playlists' && selectedPlaylistId && !currentPlaylist ? null : activeTab !== 'playlists' && displayedTracks.length === 0 ? null : activeTab === 'playlists' && !selectedPlaylistId ? null : activeTab === 'artists' && !selectedArtistName ? (
          <ArtistsGridView
            groupedArtists={groupedArtists}
            onSelectArtist={(artistName) => navigateTo('artists', { artistName })}
            onPlayArtist={(artistTracks) => playTrack(artistTracks[0], artistTracks)}
          />
        ) : activeTab === 'albums' && !selectedAlbumName ? (
          <AlbumsGridView
            groupedAlbums={groupedAlbums}
            onSelectAlbum={(albumName, albumArtistName) => navigateTo('albums', { albumName, albumArtistName })}
            onPlayAlbum={(albumTracks) => playTrack(albumTracks[0], albumTracks)}
          />
        ) : viewMode === 'list' ? (
          <div className="liquid-glass rounded-2xl shadow-sm p-1 sm:p-2 border border-[var(--liquid-glass-border)]">
            <div className="flex items-center gap-3 px-3.5 py-3 text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider border-b border-[var(--liquid-glass-border-subtle)]">
              <span className="w-8 text-center">#</span>
              <span className="flex-1 md:w-5/12">Título</span>
              <span className="hidden md:block w-3/12">Artista</span>
              <span className="hidden lg:block w-3/12">Álbum</span>
              <span className="w-24 text-right pr-2">Duración</span>
            </div>

            {displayedTracks.length > 150 ? (
              <VirtualizedTrackRows tracks={displayedTracks} renderTrack={(track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} onOpenCreatePlaylistModal={onOpenCreatePlaylistModal} playbackContext={playlistPlaybackContext} virtualized={true} selectionMode={selectionMode} isSelected={selectedTrackIds.has(track.id)} onToggleSelected={() => toggleTrackSelection(track.id)} onMoveUp={activeTab === 'playlists' && selectedPlaylistId && idx > 0 ? () => reorderPlaylistTracks(selectedPlaylistId, idx, idx - 1) : undefined} onMoveDown={activeTab === 'playlists' && selectedPlaylistId && idx < displayedTracks.length - 1 ? () => reorderPlaylistTracks(selectedPlaylistId, idx, idx + 1) : undefined} />
              )} />
            ) : (
              <div className="divide-y divide-[var(--liquid-glass-border-subtle)]">
                {displayedTracks.map((track, idx) => (
                  <TrackRow
                    key={track.id} track={track} index={idx}
                    onOpenCreatePlaylistModal={onOpenCreatePlaylistModal}
                    playbackContext={playlistPlaybackContext}
                    selectionMode={selectionMode} isSelected={selectedTrackIds.has(track.id)}
                    onToggleSelected={() => toggleTrackSelection(track.id)}
                    onMoveUp={activeTab === 'playlists' && selectedPlaylistId && idx > 0 ? () => reorderPlaylistTracks(selectedPlaylistId, idx, idx - 1) : undefined}
                    onMoveDown={activeTab === 'playlists' && selectedPlaylistId && idx < displayedTracks.length - 1 ? () => reorderPlaylistTracks(selectedPlaylistId, idx, idx + 1) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="library-responsive-grid gap-3.5 sm:gap-4" style={gridStyle}>
            {displayedTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onOpenCreatePlaylistModal={onOpenCreatePlaylistModal}
                playbackContext={playlistPlaybackContext}
                selectionMode={selectionMode}
                isSelected={selectedTrackIds.has(track.id)}
                onToggleSelected={() => toggleTrackSelection(track.id)}
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
      {activeTab === 'playlists' && selectedPlaylistId && !currentPlaylist && (
        <div className="mx-4 mb-5 rounded-2xl border border-dashed border-[var(--liquid-glass-border)] p-6 text-center sm:mx-8">
          <p className="text-sm font-semibold text-[var(--app-text)]">Esta playlist ya no está disponible.</p>
          <button type="button" onClick={() => navigateTo('playlists')} className="mt-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--app-accent)] hover:bg-[var(--app-surface-hover)]">Volver a tus playlists</button>
        </div>
      )}
      {isBulkEditOpen && (
        <BulkEditTracksModal
          tracks={displayedTracks.filter((track) => selectedTrackIds.has(track.id))}
          onClose={() => { setIsBulkEditOpen(false); setSelectionMode(false); setSelectedTrackIds(new Set()); }}
        />
      )}
    </div>
  );
};
