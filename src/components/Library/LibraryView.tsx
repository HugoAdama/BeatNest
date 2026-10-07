import React, { useState } from 'react';
import { Music, Plus } from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
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
    addTrackToPlaylist,
    loadDemoPack,
  } = useLibraryStore();

  const { playTrack, recentTracks } = usePlayerStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

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
    selectedGenre,
    selectedFormat,
    searchQuery,
    sortBy,
    sortOrder,
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
        tracks={tracks}
        displayedTracks={displayedTracks}
        totalDuration={totalDuration}
        playlistCollageCovers={playlistCollageCovers}
        onOpenCreatePlaylistModal={onOpenCreatePlaylistModal}
        onPlayAll={handlePlayAll}
        onShuffleAll={handleShuffleAll}
        onLoadDemoPack={loadDemoPack}
      />
        {/* Top Slim Stats Strip */}
        {activeTab !== 'playlists' && (
          <LibraryStatsBanner
            trackCount={tracks.length}
            totalDuration={tracks.reduce((acc, t) => acc + (t.duration || 0), 0)}
            artistCount={uniqueGenres.length > 0 ? groupedArtists.length : 1}
            albumCount={groupedAlbums.length}
          />
        )}

        <LibraryFilters
          activeTab={activeTab}
          selectedPlaylistId={selectedPlaylistId}
          uniqueGenres={uniqueGenres}
          selectedGenre={selectedGenre}
          selectedFormat={selectedFormat}
          onSelectGenre={setSelectedGenre}
          onSelectFormat={setSelectedFormat}
        />
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
            <div className="flex items-center gap-3 px-3.5 py-3 text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider border-b border-[var(--liquid-glass-border-subtle)]">
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
