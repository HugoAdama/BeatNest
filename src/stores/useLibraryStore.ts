import { create } from 'zustand';
import type { Track, Playlist } from '../types/music';
import { db, type StoredTrack } from '../db';
import { importLibraryFiles } from '../lib/libraryImport';
import { usePlayerStore } from './usePlayerStore';
import { generateDemoTracksPack } from '../lib/audioGenerator';
import { showToast } from './useToastStore';

export type LibraryTab =
  | 'home'
  | 'tracks'
  | 'artists'
  | 'albums'
  | 'favorites'
  | 'playlists'
  | 'history'
  | 'smart-top'
  | 'smart-recent'
  | 'smart-long';

export type SortField = 'title' | 'artist' | 'album' | 'duration' | 'dateAdded' | 'playCount';
export type SortOrder = 'asc' | 'desc';

interface LibraryNavigationDetails {
  playlistId?: string | null;
  artistName?: string | null;
  albumName?: string | null;
  albumArtistName?: string | null;
}

const createLibraryHash = (
  tab: LibraryTab,
  details: LibraryNavigationDetails,
  searchQuery: string,
  selectedGenre: string | null,
  selectedFormat: string | null,
) => {
  const path = tab === 'smart-top' ? 'smart/top'
    : tab === 'smart-recent' ? 'smart/recent'
    : tab === 'smart-long' ? 'smart/long'
    : tab === 'artists' && details.artistName ? `artists/${encodeURIComponent(details.artistName)}`
    : tab === 'albums' && details.albumName ? `albums/${encodeURIComponent(details.albumName)}`
    : tab === 'playlists' && details.playlistId ? `playlists/${encodeURIComponent(details.playlistId)}`
    : tab;
  const params = new URLSearchParams();
  if (searchQuery) params.set('q', searchQuery);
  if (selectedGenre) params.set('genre', selectedGenre);
  if (selectedFormat) params.set('format', selectedFormat);
  if (tab === 'albums' && details.albumArtistName) params.set('artist', details.albumArtistName);
  const query = params.toString();
  return `#/${path}${query ? `?${query}` : ''}`;
};

const parseLibraryHash = (hash: string) => {
  const [rawPath, rawQuery = ''] = hash.replace(/^#\/?/, '').split('?');
  const segments = (rawPath || 'home').split('/').map((segment) => {
    try { return decodeURIComponent(segment); } catch { return segment; }
  });
  const params = new URLSearchParams(rawQuery);
  const detail = segments[1] ?? null;
  let activeTab: LibraryTab = 'home';
  switch (segments[0]) {
    case 'tracks': activeTab = 'tracks'; break;
    case 'favorites': activeTab = 'favorites'; break;
    case 'artists': activeTab = 'artists'; break;
    case 'albums': activeTab = 'albums'; break;
    case 'playlists': activeTab = 'playlists'; break;
    case 'history': activeTab = 'history'; break;
    case 'smart':
      activeTab = detail === 'top' ? 'smart-top' : detail === 'long' ? 'smart-long' : 'smart-recent';
      break;
  }
  return {
    activeTab,
    selectedPlaylistId: activeTab === 'playlists' ? detail : null,
    selectedArtistName: activeTab === 'artists' ? detail : null,
    selectedAlbumName: activeTab === 'albums' ? detail : null,
    selectedAlbumArtistName: activeTab === 'albums' ? params.get('artist') : null,
    searchQuery: params.get('q') ?? '',
    selectedGenre: params.get('genre'),
    selectedFormat: params.get('format'),
  };
};

interface LibraryStore {
  tracks: Track[];
  playlists: Playlist[];
  activeTab: LibraryTab;
  selectedPlaylistId: string | null;
  selectedArtistName: string | null;
  selectedAlbumName: string | null;
  selectedAlbumArtistName: string | null;
  searchQuery: string;
  selectedGenre: string | null;
  selectedFormat: string | null;
  sortBy: SortField;
  sortOrder: SortOrder;
  viewMode: 'list' | 'grid';
  isScanning: boolean;
  scanProgress: { current: number; total: number; filename: string } | null;

  // Actions
  loadFromDatabase: () => Promise<void>;
  importFiles: (fileList: FileList | File[]) => Promise<void>;
  importDirectoryWithPicker: () => Promise<void>;
  toggleFavorite: (trackId: string) => Promise<void>;
  recordTrackPlay: (trackId: string) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  createPlaylist: (name: string, description?: string, initialTrackIds?: string[]) => Promise<string>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  reorderPlaylistTracks: (playlistId: string, startIndex: number, endIndex: number) => Promise<void>;
  setActiveTab: (tab: LibraryTab) => void;
  navigateTo: (tab: LibraryTab, details?: LibraryNavigationDetails) => void;
  syncNavigationFromLocation: () => void;
  setSelectedPlaylistId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSelectedFormat: (format: string | null) => void;
  setSort: (field: SortField, order?: SortOrder) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  updateTrackMetadata: (
    trackId: string,
    updates: Partial<Pick<Track, 'title' | 'artist' | 'album' | 'genre' | 'year'>>
  ) => Promise<void>;
  updateTracksMetadata: (
    trackIds: string[],
    updates: Partial<Pick<Track, 'artist' | 'album' | 'genre'>>
  ) => Promise<void>;
  updateTrackCover: (trackId: string, imageBlob: Blob | File | null) => Promise<void>;
  updatePlaylistCover: (playlistId: string, imageBlob: Blob | File | null) => Promise<void>;
  loadDemoPack: () => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  tracks: [],
  playlists: [],
  activeTab: 'home',
  selectedPlaylistId: null,
  selectedArtistName: null,
  selectedAlbumName: null,
  selectedAlbumArtistName: null,
  searchQuery: '',
  selectedGenre: null,
  selectedFormat: null,
  sortBy: 'dateAdded',
  sortOrder: 'desc',
  viewMode: 'list',
  isScanning: false,
  scanProgress: null,

  loadFromDatabase: async () => {
    try {
      const previousTracks = get().tracks;
      const previousPlaylists = get().playlists;
      const storedTracks = await db.tracks.toArray();
      const storedPlaylists = await db.playlists.toArray();

      // Convert stored tracks into memory tracks, regenerating Object URLs for covers and restoring audio files
      const hydratedTracks: Track[] = storedTracks.map((st) => {
        let coverUrl: string | undefined = undefined;
        if (st.coverData) {
          try {
            coverUrl = URL.createObjectURL(st.coverData);
          } catch {
            coverUrl = undefined;
          }
        }

        let file: File | undefined = undefined;
        if (st.audioData) {
          try {
            file =
              st.audioData instanceof File
                ? st.audioData
                : new File([st.audioData], st.fileName, { type: st.fileType || 'audio/wav' });
          } catch {
            file = undefined;
          }
        }

        return {
          ...st,
          coverUrl,
          file,
        };
      });

      const hydratedPlaylists: Playlist[] = storedPlaylists.map((pl) => {
        let coverUrl: string | undefined = undefined;
        if (pl.coverData) {
          try {
            coverUrl = URL.createObjectURL(pl.coverData);
          } catch {
            coverUrl = undefined;
          }
        }
        return {
          ...pl,
          coverUrl,
        };
      });

      // Keep the active player pointed at the newly-created URL before releasing old URLs.
      const currentPlayerTrack = usePlayerStore.getState().currentTrack;
      if (currentPlayerTrack) {
        const refreshedTrack = hydratedTracks.find((track) => track.id === currentPlayerTrack.id);
        if (refreshedTrack) {
          usePlayerStore.getState().updateTrackInPlayer(refreshedTrack.id, {
            coverData: refreshedTrack.coverData,
            coverUrl: refreshedTrack.coverUrl,
          });
        }
      }
      for (const track of previousTracks) {
        if (track.coverUrl?.startsWith('blob:')) URL.revokeObjectURL(track.coverUrl);
      }
      for (const playlist of previousPlaylists) {
        if (playlist.coverUrl?.startsWith('blob:')) URL.revokeObjectURL(playlist.coverUrl);
      }

      set({
        tracks: hydratedTracks,
        playlists: hydratedPlaylists,
      });
    } catch (err) {
      console.warn('Error reading from IndexedDB:', err);
    }
  },

  importFiles: async (fileList: FileList | File[]) => {
    set({ isScanning: true });
    try {
      const result = await importLibraryFiles(fileList, get().tracks, (scanProgress) => set({ scanProgress }));
      set({ tracks: result.tracks });

      if (result.metadataOnlyCount > 0 || result.failedCount > 0) {
        const availableLabel = result.estimatedAvailableBytes === null
          ? ''
          : ` Espacio estimado restante: ${new Intl.NumberFormat('es', { maximumFractionDigits: 0 }).format(result.estimatedAvailableBytes / (1024 * 1024))} MB.`;
        showToast(
          'Importación finalizada con avisos',
          `${result.importedCount} pistas con audio guardado, ${result.metadataOnlyCount} disponibles solo en esta sesión y ${result.failedCount} con error.${availableLabel}`,
          'warning'
        );
      } else if (result.importedCount > 0) {
        showToast('Importación completada', `${result.importedCount} pistas añadidas y guardadas en este navegador.`, 'success');
      }
    } finally {
      set({ isScanning: false, scanProgress: null });
    }
  },

  importDirectoryWithPicker: async () => {
    // Check if File System Access API is supported
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        const files: File[] = [];

        async function scanDir(handle: any) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              files.push(file);
            } else if (entry.kind === 'directory') {
              await scanDir(entry);
            }
          }
        }

        await scanDir(dirHandle);
        await get().importFiles(files);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Error reading directory via File System Access API:', err);
        }
      }
    } else {
      // Trigger directory input fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      (input as any).webkitdirectory = true;
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          get().importFiles(target.files);
        }
      };
      input.click();
    }
  },

  toggleFavorite: async (trackId: string) => {
    const track = get().tracks.find((item) => item.id === trackId);
    if (!track) {
      showToast('No se pudo actualizar Favoritos', 'La pista ya no está en tu biblioteca.', 'warning');
      return;
    }

    const nextIsFavorite = !track.isFavorite;
    const updateLibraryTrack = (isFavorite: boolean) => {
      set((state) => ({
        tracks: state.tracks.map((item) =>
          item.id === trackId ? { ...item, isFavorite } : item
        ),
      }));
      usePlayerStore.getState().updateTrackInPlayer(trackId, { isFavorite });
    };

    // Update the library and player immediately so all heart buttons stay in sync.
    updateLibraryTrack(nextIsFavorite);

    try {
      const updatedRows = await db.tracks.update(trackId, { isFavorite: nextIsFavorite });
      if (updatedRows === 0) throw new Error('La pista no existe en IndexedDB.');
      showToast(
        nextIsFavorite ? 'Añadida a favoritos' : 'Eliminada de favoritos',
        `«${track.title}» ${nextIsFavorite ? 'se guardó en' : 'se quitó de'} Favoritos.`,
        'success',
      );
    } catch (error) {
      console.warn('Error saving favorite state in IndexedDB:', error);
      // Roll back only if no later click has changed this track again.
      const current = get().tracks.find((item) => item.id === trackId);
      if (current?.isFavorite === nextIsFavorite) updateLibraryTrack(Boolean(track.isFavorite));
      showToast('No se pudieron guardar los cambios', 'Comprueba el almacenamiento local e inténtalo de nuevo.', 'warning');
    }
  },

  recordTrackPlay: async (trackId: string) => {
    const track = get().tracks.find((item) => item.id === trackId);
    if (!track) return;
    const playCount = (track.playCount ?? 0) + 1;
    set((state) => ({
      tracks: state.tracks.map((item) => item.id === trackId ? { ...item, playCount } : item),
    }));
    usePlayerStore.getState().updateTrackInPlayer(trackId, { playCount });
    try {
      await db.tracks.update(trackId, { playCount });
    } catch (error) {
      console.warn('Could not save track play count:', error);
    }
  },

  deleteTrack: async (trackId: string) => {
    const track = get().tracks.find((item) => item.id === trackId);
    await db.tracks.delete(trackId);
    if (track?.coverUrl?.startsWith('blob:')) URL.revokeObjectURL(track.coverUrl);
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== trackId),
    }));
  },

  createPlaylist: async (name: string, description: string = '', initialTrackIds: string[] = []) => {
    const id = `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPlaylist: Playlist = {
      id,
      name,
      description,
      trackIds: initialTrackIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.playlists.put(newPlaylist);
    set((state) => ({ playlists: [...state.playlists, newPlaylist] }));
    get().navigateTo('playlists', { playlistId: id });
    return id;
  },

  deletePlaylist: async (playlistId: string) => {
    const wasSelected = get().selectedPlaylistId === playlistId;
    await db.playlists.delete(playlistId);
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== playlistId),
      selectedPlaylistId:
        state.selectedPlaylistId === playlistId ? null : state.selectedPlaylistId,
    }));
    if (wasSelected) get().navigateTo('playlists');
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string) => {
    const playlists = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        if (!pl.trackIds.includes(trackId)) {
          const updated = {
            ...pl,
            trackIds: [...pl.trackIds, trackId],
            updatedAt: Date.now(),
          };
          db.playlists.update(playlistId, {
            trackIds: updated.trackIds,
            updatedAt: updated.updatedAt,
          }).catch(console.warn);
          return updated;
        }
      }
      return pl;
    });
    set({ playlists });
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    const playlists = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        const updated = {
          ...pl,
          trackIds: pl.trackIds.filter((id) => id !== trackId),
          updatedAt: Date.now(),
        };
        db.playlists.update(playlistId, {
          trackIds: updated.trackIds,
          updatedAt: updated.updatedAt,
        }).catch(console.warn);
        return updated;
      }
      return pl;
    });
    set({ playlists });
  },

  reorderPlaylistTracks: async (playlistId: string, startIndex: number, endIndex: number) => {
    const playlists = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        const nextIds = [...pl.trackIds];
        const [moved] = nextIds.splice(startIndex, 1);
        nextIds.splice(endIndex, 0, moved);
        const updated = {
          ...pl,
          trackIds: nextIds,
          updatedAt: Date.now(),
        };
        db.playlists.update(playlistId, {
          trackIds: nextIds,
          updatedAt: updated.updatedAt,
        }).catch(console.warn);
        return updated;
      }
      return pl;
    });
    set({ playlists });
  },

  setActiveTab: (tab: LibraryTab) => {
    get().navigateTo(tab);
  },

  navigateTo: (tab: LibraryTab, details: LibraryNavigationDetails = {}) => {
    const next = {
      activeTab: tab,
      selectedPlaylistId: tab === 'playlists' ? details.playlistId ?? null : null,
      selectedArtistName: tab === 'artists' ? details.artistName ?? null : null,
      selectedAlbumName: tab === 'albums' ? details.albumName ?? null : null,
      selectedAlbumArtistName: tab === 'albums' ? details.albumArtistName ?? null : null,
    };
    set(tab === 'home' ? { ...next, searchQuery: '', selectedGenre: null, selectedFormat: null } : next);
    if (typeof window !== 'undefined') {
      const hash = createLibraryHash(tab, details, get().searchQuery, get().selectedGenre, get().selectedFormat);
      if (window.location.hash !== hash) {
        window.history.pushState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
      }
    }
  },

  syncNavigationFromLocation: () => {
    if (typeof window === 'undefined') return;
    const navigation = parseLibraryHash(window.location.hash);
    set(navigation);
    const hash = createLibraryHash(
      navigation.activeTab,
      {
        playlistId: navigation.selectedPlaylistId,
        artistName: navigation.selectedArtistName,
        albumName: navigation.selectedAlbumName,
        albumArtistName: navigation.selectedAlbumArtistName,
      },
      navigation.searchQuery,
      navigation.selectedGenre,
      navigation.selectedFormat,
    );
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    }
  },

  setSelectedPlaylistId: (id: string | null) => {
    get().navigateTo('playlists', { playlistId: id });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    if (typeof window !== 'undefined') {
      const { activeTab, selectedPlaylistId, selectedArtistName, selectedAlbumName, selectedAlbumArtistName, selectedGenre, selectedFormat } = get();
      const hash = createLibraryHash(activeTab, { playlistId: selectedPlaylistId, artistName: selectedArtistName, albumName: selectedAlbumName, albumArtistName: selectedAlbumArtistName }, query, selectedGenre, selectedFormat);
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    }
  },

  setSelectedGenre: (genre: string | null) => {
    set({ selectedGenre: genre });
    if (typeof window !== 'undefined') {
      const { activeTab, selectedPlaylistId, selectedArtistName, selectedAlbumName, selectedAlbumArtistName, searchQuery, selectedFormat } = get();
      const hash = createLibraryHash(activeTab, { playlistId: selectedPlaylistId, artistName: selectedArtistName, albumName: selectedAlbumName, albumArtistName: selectedAlbumArtistName }, searchQuery, genre, selectedFormat);
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    }
  },

  setSelectedFormat: (format: string | null) => {
    set({ selectedFormat: format });
    if (typeof window !== 'undefined') {
      const { activeTab, selectedPlaylistId, selectedArtistName, selectedAlbumName, selectedAlbumArtistName, searchQuery, selectedGenre } = get();
      const hash = createLibraryHash(activeTab, { playlistId: selectedPlaylistId, artistName: selectedArtistName, albumName: selectedAlbumName, albumArtistName: selectedAlbumArtistName }, searchQuery, selectedGenre, format);
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    }
  },

  setSort: (field: SortField, order?: SortOrder) => {
    const currentSortBy = get().sortBy;
    const currentOrder = get().sortOrder;
    let nextOrder = order;

    if (!nextOrder) {
      if (currentSortBy === field) {
        nextOrder = currentOrder === 'asc' ? 'desc' : 'asc';
      } else {
        nextOrder = field === 'dateAdded' || field === 'duration' ? 'desc' : 'asc';
      }
    }

    set({ sortBy: field, sortOrder: nextOrder });
  },

  setViewMode: (mode: 'list' | 'grid') => {
    set({ viewMode: mode });
  },

  updateTrackMetadata: async (trackId, updates) => {
    try {
      await db.tracks.update(trackId, updates as any);
    } catch (err) {
      console.warn('Error updating track metadata in DB:', err);
      throw err;
    }
    const tracks = get().tracks.map((t) =>
      t.id === trackId ? { ...t, ...updates } : t
    );
    set({ tracks });
    usePlayerStore.getState().updateTrackInPlayer(trackId, updates);
  },

  updateTracksMetadata: async (trackIds, updates) => {
    const libraryTrackIds = new Set(get().tracks.map((track) => track.id));
    const existingIds = [...new Set(trackIds)].filter((id) => libraryTrackIds.has(id));
    if (existingIds.length === 0) return;
    try {
      await db.tracks.bulkUpdate(existingIds.map((key) => ({ key, changes: updates })));
    } catch (err) {
      console.warn('Error updating track metadata in bulk:', err);
      throw err;
    }
    const updatedIds = new Set(existingIds);
    set((state) => ({ tracks: state.tracks.map((track) => updatedIds.has(track.id) ? { ...track, ...updates } : track) }));
    usePlayerStore.getState().updateTracksInPlayer(existingIds, updates);
  },

  updateTrackCover: async (trackId: string, imageBlob: Blob | File | null) => {
    try {
      await db.tracks.update(trackId, { coverData: imageBlob } as any);
    } catch (err) {
      console.warn('Error saving cover in IndexedDB:', err);
    }

    const current = get().tracks.find((t) => t.id === trackId);
    let newCoverUrl: string | undefined = undefined;
    if (imageBlob) {
      newCoverUrl = URL.createObjectURL(imageBlob);
    }
    if (current?.coverUrl?.startsWith('blob:')) URL.revokeObjectURL(current.coverUrl);

    const updatedTracks = get().tracks.map((t) =>
      t.id === trackId ? { ...t, coverData: imageBlob, coverUrl: newCoverUrl } : t
    );
    set({ tracks: updatedTracks });
    usePlayerStore.getState().updateTrackInPlayer(trackId, {
      coverData: imageBlob,
      coverUrl: newCoverUrl,
    });
    showToast(
      'Carátula actualizada',
      imageBlob ? 'La nueva imagen se guardó correctamente' : 'Carátula eliminada',
      'info'
    );
  },

  updatePlaylistCover: async (playlistId: string, imageBlob: Blob | File | null) => {
    try {
      await db.playlists.update(playlistId, { coverData: imageBlob } as any);
    } catch (err) {
      console.warn('Error saving playlist cover in IndexedDB:', err);
    }

    const current = get().playlists.find((pl) => pl.id === playlistId);
    let newCoverUrl: string | undefined = undefined;
    if (imageBlob) {
      newCoverUrl = URL.createObjectURL(imageBlob);
    }
    if (current?.coverUrl?.startsWith('blob:')) URL.revokeObjectURL(current.coverUrl);

    const updatedPlaylists = get().playlists.map((pl) =>
      pl.id === playlistId ? { ...pl, coverData: imageBlob, coverUrl: newCoverUrl } : pl
    );
    set({ playlists: updatedPlaylists });
    showToast(
      'Portada de playlist actualizada',
      imageBlob ? 'Imagen de playlist guardada' : 'Portada de playlist eliminada',
      'info'
    );
  },

  loadDemoPack: async () => {
    try {
      showToast('Cargando pack demo', 'Generando 3 pistas musicales con arte...', 'info');
      const pack = await generateDemoTracksPack();
      const newTracks: Track[] = [];
      const newTrackIds: string[] = [];

      for (const item of pack) {
        const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const coverUrl = URL.createObjectURL(item.coverBlob);
        const stored: StoredTrack = {
          id,
          title: item.title,
          artist: item.artist,
          album: item.album,
          genre: item.genre,
          duration: item.duration,
          fileName: item.file.name,
          fileSize: item.file.size,
          fileType: 'audio/wav',
          dateAdded: Date.now(),
          coverData: item.coverBlob,
          audioData: item.file,
          playCount: 0,
        };
        await db.tracks.put(stored);
        newTracks.push({
          ...stored,
          coverUrl,
          file: item.file,
        });
        newTrackIds.push(id);
      }

      // Create a demo playlist
      const playlistId = `pl-demo-${Date.now()}`;
      const demoPlaylist: Playlist = {
        id: playlistId,
        name: 'Favoritos Synth & Chill',
        description: 'Pack de prueba con 3 pistas sintetizadas y carátulas personalizadas',
        trackIds: newTrackIds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.playlists.put(demoPlaylist);

      set((state) => ({
        tracks: [...newTracks, ...state.tracks],
        playlists: [demoPlaylist, ...state.playlists],
      }));
      get().navigateTo('playlists', { playlistId });

      showToast(
        'Pack de demostración cargado',
        'Se añadieron 3 pistas con carátula y la playlist «Favoritos Synth & Chill»',
        'info'
      );
    } catch (err) {
      console.warn('Error loading demo pack:', err);
      showToast('Error', 'No se pudo generar el pack de demostración', 'warning');
    }
  },
}));
