import React, { useRef } from 'react';
import {
  Clock,
  FileDown,
  FolderPlus,
  Heart,
  History,
  ListMusic,
  Pause,
  Play,
  Shuffle,
  Sparkles,
  Timer,
  Trash2,
  Upload,
} from 'lucide-react';
import type { Track } from '../../types/music';
import type { LibraryTab } from '../../stores/useLibraryStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { formatDuration } from '../../lib/metadata';
import { exportPlaylistAsM3U } from '../../lib/playlistExport';
import { showToast } from '../../stores/useToastStore';

interface LibraryHeaderProps {
  activeTab: LibraryTab;
  selectedPlaylistId: string | null;
  selectedArtistName: string | null;
  selectedAlbumName: string | null;
  tracks: Track[];
  displayedTracks: Track[];
  totalDuration: number;
  playlistCollageCovers: string[];
  onOpenCreatePlaylistModal: () => void;
  onPlayAll: () => void;
  onShuffleAll: () => void;
  onLoadDemoPack: () => void;
  onBackToCollection: () => void;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  activeTab,
  selectedPlaylistId,
  selectedArtistName,
  selectedAlbumName,
  tracks,
  displayedTracks,
  totalDuration,
  playlistCollageCovers,
  onOpenCreatePlaylistModal,
  onPlayAll,
  onShuffleAll,
  onLoadDemoPack,
  onBackToCollection,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { playlists, deletePlaylist, navigateTo, updatePlaylistCover } = useLibraryStore();
  const { playTrack, isPlaying, currentTrack, togglePlay } = usePlayerStore();
  const currentPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId);
  const isSelectionPlaying = Boolean(
    isPlaying && currentTrack && displayedTracks.some((track) => track.id === currentTrack.id)
  );

  const handleCoverChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentPlaylist) await updatePlaylistCover(currentPlaylist.id, file);
    event.target.value = '';
  };

  const isEntityDetail = Boolean(selectedArtistName || selectedAlbumName);
  const selectionActions = displayedTracks.length > 0 && (activeTab !== 'artists' && activeTab !== 'albums' || isEntityDetail) && activeTab !== 'home' && (
    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
      <button
        onClick={onPlayAll}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md border border-white/20"
      >
        <Play size={15} fill="currentColor" />
        <span>Reproducir todo</span>
      </button>
      <button
        onClick={onShuffleAll}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass-subtle hover:bg-[var(--app-surface-hover)] text-[var(--app-text)] text-xs font-semibold transition-all border border-[var(--liquid-glass-border)] shadow-sm"
      >
        <Shuffle size={14} className="text-[#4FD1C5]" />
        <span>Aleatorio</span>
      </button>
      {tracks.length < 5 && (
        <button
          onClick={onLoadDemoPack}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7C5CFF]/15 to-[#4FD1C5]/15 hover:from-[#7C5CFF]/25 hover:to-[#4FD1C5]/25 border border-[#7C5CFF]/30 text-[var(--app-text)] transition-all shadow-sm"
          title="Cargar pistas demo para probar el reproductor"
        >
          <Sparkles size={13} className="text-[#7C5CFF]" />
          <span>Pack demo</span>
        </button>
      )}
    </div>
  );

  if (activeTab === 'playlists' && currentPlaylist) {
    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#7C5CFF] to-[#4FD1C5] flex items-center justify-center shadow-2xl shrink-0 border border-white/20 group"
            title="Cambiar portada de la playlist"
          >
            {currentPlaylist.coverUrl ? (
              <img src={currentPlaylist.coverUrl} alt={currentPlaylist.name} className="w-full h-full object-cover" />
            ) : playlistCollageCovers.length >= 4 ? (
              <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                {playlistCollageCovers.slice(0, 4).map((url, index) => (
                  <img key={index} src={url} alt="" className="w-full h-full object-cover" />
                ))}
              </div>
            ) : playlistCollageCovers.length > 0 ? (
              <img src={playlistCollageCovers[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <ListMusic size={48} className="text-white" />
            )}
            <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity gap-1.5">
              <Upload size={16} /> Cambiar foto
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#4FD1C5]">Playlist local</span>
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
        <div className="flex items-center gap-2.5 self-start md:self-end shrink-0">
          {displayedTracks.length > 0 && (
            <>
              <button
                onClick={() => isSelectionPlaying ? togglePlay() : onPlayAll()}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#6366F1] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border border-white/20"
                title="Reproducir playlist"
              >
                {isSelectionPlaying
                  ? <Pause size={20} fill="currentColor" />
                  : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>
              <button
                onClick={onShuffleAll}
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
                title="Exportar archivo .M3U"
              >
                <FileDown size={18} />
              </button>
            </>
          )}
          <button
            onClick={() => {
              deletePlaylist(currentPlaylist.id);
              navigateTo('playlists');
              showToast('Playlist eliminada', `Se eliminó la playlist «${currentPlaylist.name}»`, 'warning');
            }}
            className="p-3 rounded-2xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all shadow-sm"
            title="Eliminar esta playlist"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === 'playlists' && selectedPlaylistId && !currentPlaylist) return null;

  if (activeTab === 'playlists') {
    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--app-text)] tracking-tight">Tus Playlists</h2>
            <p className="text-xs text-[var(--app-text-muted)] mt-1">Colecciones locales creadas en BeatNest</p>
          </div>
          <button
            onClick={onOpenCreatePlaylistModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md border border-white/20 self-start sm:self-auto"
          >
            <FolderPlus size={15} /> <span>Crear playlist</span>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {playlists.map((playlist) => {
            const playlistTracks = playlist.trackIds
              .map((id) => tracks.find((track) => track.id === id))
              .filter((track): track is Track => Boolean(track));
            return (
              <article
                key={playlist.id}
                className="group relative rounded-2xl liquid-glass p-3.5 transition-all hover:-translate-y-0.5 hover:bg-[var(--app-surface-hover)] hover:shadow-xl"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-tr from-[#7C5CFF] to-[#4FD1C5] mb-3 flex items-center justify-center shadow-md">
                  <button type="button" onClick={() => navigateTo('playlists', { playlistId: playlist.id })} aria-label={`Abrir playlist ${playlist.name}`} className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white">
                    {playlist.coverUrl
                      ? <img src={playlist.coverUrl} alt="" className="h-full w-full object-cover" />
                      : <ListMusic size={36} className="text-white opacity-90" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (playlistTracks.length > 0) {
                        playTrack(playlistTracks[0], playlistTracks, false);
                        showToast('Reproduciendo playlist', `Iniciando «${playlist.name}»`, 'info');
                      }
                    }}
                    className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#6366F1] text-white opacity-100 shadow-lg transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-0 sm:group-hover:opacity-100"
                    title="Reproducir playlist"
                    aria-label={`Reproducir playlist ${playlist.name}`}
                  >
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </button>
                </div>
                <button type="button" onClick={() => navigateTo('playlists', { playlistId: playlist.id })} className="block max-w-full truncate text-left text-sm font-bold text-[var(--app-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">{playlist.name}</button>
                <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                  {playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'canción' : 'canciones'}
                </p>
              </article>
            );
          })}
        </div>
      </>
    );
  }

  const sections: Partial<Record<LibraryTab, { title: string; subtitle: string; icon: React.ReactNode; color: string }>> = {
    favorites: {
      title: 'Canciones favoritas', subtitle: `${displayedTracks.length} pistas guardadas`,
      icon: <Heart size={26} fill="currentColor" />, color: 'text-red-400 bg-red-500/15 border-red-500/30',
    },
    history: {
      title: 'Historial reciente', subtitle: `${displayedTracks.length} pistas reproducidas recientemente`,
      icon: <History size={26} />, color: 'text-[#4FD1C5] bg-[#4FD1C5]/15 border-[#4FD1C5]/30',
    },
    'smart-top': {
      title: 'Más reproducidas', subtitle: `${displayedTracks.length} pistas con mayor actividad de escucha`,
      icon: <Sparkles size={26} />, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    },
    'smart-recent': {
      title: 'Añadidas recientemente', subtitle: `${displayedTracks.length} pistas en tu biblioteca local`,
      icon: <Clock size={26} />, color: 'text-[#4FD1C5] bg-[#4FD1C5]/15 border-[#4FD1C5]/30',
    },
    'smart-long': {
      title: 'Pistas largas (+5 min)', subtitle: `${displayedTracks.length} pistas y sesiones extensas registradas`,
      icon: <Timer size={26} />, color: 'text-[#7C5CFF] bg-[#7C5CFF]/15 border-[#7C5CFF]/30',
    },
  };
  const section = sections[activeTab];
  const title = selectedArtistName || selectedAlbumName || (
    activeTab === 'home' ? 'Inicio' : activeTab === 'artists' ? 'Artistas' : activeTab === 'albums' ? 'Álbumes' : 'Todas las pistas'
  );
  const subtitle = selectedArtistName || selectedAlbumName
    ? `${displayedTracks.length} ${displayedTracks.length === 1 ? 'pista' : 'pistas'} • ${formatDuration(totalDuration)}`
    : section?.subtitle ?? `${displayedTracks.length} ${displayedTracks.length === 1 ? 'pista' : 'pistas'} registradas • ${formatDuration(totalDuration)} de audio`;

  return (
    <>
    {isEntityDetail && (
      <button type="button" onClick={onBackToCollection} className="mb-3 inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">
        ← {selectedArtistName ? 'Artistas' : 'Álbumes'}
      </button>
    )}
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        {section && (
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-md ${section.color}`}>
            {section.icon}
          </div>
        )}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--app-text)] tracking-tight">
            {section?.title ?? title}
          </h2>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            {subtitle}
          </p>
        </div>
      </div>
      {selectionActions}
    </div>
    </>
  );
};
