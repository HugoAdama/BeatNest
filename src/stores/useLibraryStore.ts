import { create } from 'zustand';
import type { Track, Playlist } from '../types/music';
import { db, type StoredTrack } from '../db';
import { extractMetadata } from '../lib/metadata';

export type LibraryTab = 'tracks' | 'artists' | 'albums' | 'favorites' | 'playlists';
export type SortField = 'title' | 'artist' | 'album' | 'duration' | 'dateAdded';
export type SortOrder = 'asc' | 'desc';

interface LibraryStore {
  tracks: Track[];
  playlists: Playlist[];
  activeTab: LibraryTab;
  selectedPlaylistId: string | null;
  searchQuery: string;
  selectedGenre: string | null;
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
  deleteTrack: (trackId: string) => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<string>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  setActiveTab: (tab: LibraryTab) => void;
  setSelectedPlaylistId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSort: (field: SortField, order?: SortOrder) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  tracks: [],
  playlists: [],
  activeTab: 'tracks',
  selectedPlaylistId: null,
  searchQuery: '',
  selectedGenre: null,
  sortBy: 'dateAdded',
  sortOrder: 'desc',
  viewMode: 'list',
  isScanning: false,
  scanProgress: null,

  loadFromDatabase: async () => {
    try {
      const storedTracks = await db.tracks.toArray();
      const storedPlaylists = await db.playlists.toArray();

      // Convert stored tracks into memory tracks, regenerating Object URLs for covers
      const hydratedTracks: Track[] = storedTracks.map((st) => {
        let coverUrl: string | undefined = undefined;
        if (st.coverData) {
          try {
            coverUrl = URL.createObjectURL(st.coverData);
          } catch {
            coverUrl = undefined;
          }
        }

        return {
          ...st,
          coverUrl,
        };
      });

      set({
        tracks: hydratedTracks,
        playlists: storedPlaylists,
      });
    } catch (err) {
      console.warn('Error reading from IndexedDB:', err);
    }
  },

  importFiles: async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    // Filter for audio extensions
    const audioExtensions = ['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac', '.opus', '.wma', '.webm'];
    const audioFiles = rawFiles.filter((f) => {
      const lower = f.name.toLowerCase();
      return (
        f.type.startsWith('audio/') ||
        audioExtensions.some((ext) => lower.endsWith(ext))
      );
    });

    const lrcFiles = rawFiles.filter((f) => f.name.toLowerCase().endsWith('.lrc'));
    const lrcMap = new Map<string, File>();
    for (const lf of lrcFiles) {
      const base = lf.name.replace(/\.[^/.]+$/, '').toLowerCase().trim();
      lrcMap.set(base, lf);
    }

    if (audioFiles.length === 0) return;

    set({
      isScanning: true,
      scanProgress: { current: 0, total: audioFiles.length, filename: audioFiles[0].name },
    });

    const existingMap = new Map(get().tracks.map((t) => [t.id, t]));
    const newlyProcessedTracks: Track[] = [];

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      set({
        scanProgress: {
          current: i + 1,
          total: audioFiles.length,
          filename: file.name,
        },
      });

      try {
        const metadataTrack = await extractMetadata(file);

        // Check if matching LRC file exists
        const fileBase = file.name.replace(/\.[^/.]+$/, '').toLowerCase().trim();
        if (lrcMap.has(fileBase)) {
          try {
            metadataTrack.lyrics = await lrcMap.get(fileBase)!.text();
          } catch (err) {
            console.warn('Could not read lyrics for', file.name, err);
          }
        }

        // If track is already in DB, associate the active File object for playback
        if (existingMap.has(metadataTrack.id)) {
          const existing = existingMap.get(metadataTrack.id)!;
          existing.file = file;
          if (metadataTrack.lyrics && !existing.lyrics) {
            existing.lyrics = metadataTrack.lyrics;
            db.tracks.update(existing.id, { lyrics: existing.lyrics }).catch(console.warn);
          }
          if (!existing.coverUrl && metadataTrack.coverUrl) {
            existing.coverUrl = metadataTrack.coverUrl;
          }
        } else {
          existingMap.set(metadataTrack.id, metadataTrack);
          newlyProcessedTracks.push(metadataTrack);

          // Save to IndexedDB
          const toStore: StoredTrack = {
            id: metadataTrack.id,
            title: metadataTrack.title,
            artist: metadataTrack.artist,
            album: metadataTrack.album,
            duration: metadataTrack.duration,
            year: metadataTrack.year,
            genre: metadataTrack.genre,
            coverData: metadataTrack.coverData || null,
            fileName: metadataTrack.fileName,
            fileSize: metadataTrack.fileSize,
            fileType: metadataTrack.fileType,
            dateAdded: metadataTrack.dateAdded,
            isFavorite: false,
            playCount: 0,
            lyrics: metadataTrack.lyrics,
          };
          await db.tracks.put(toStore);
        }
      } catch (err) {
        console.warn(`Error processing ${file.name}:`, err);
      }
    }

    const updatedTracks = Array.from(existingMap.values());
    set({
      tracks: updatedTracks,
      isScanning: false,
      scanProgress: null,
    });
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
    const tracks = get().tracks.map((t) => {
      if (t.id === trackId) {
        const updated = { ...t, isFavorite: !t.isFavorite };
        // Update in DB
        db.tracks.update(trackId, { isFavorite: updated.isFavorite }).catch(console.warn);
        return updated;
      }
      return t;
    });
    set({ tracks });
  },

  deleteTrack: async (trackId: string) => {
    await db.tracks.delete(trackId);
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== trackId),
    }));
  },

  createPlaylist: async (name: string, description: string = '') => {
    const id = `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPlaylist: Playlist = {
      id,
      name,
      description,
      trackIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.playlists.put(newPlaylist);
    set((state) => ({
      playlists: [...state.playlists, newPlaylist],
      selectedPlaylistId: id,
      activeTab: 'playlists',
    }));
    return id;
  },

  deletePlaylist: async (playlistId: string) => {
    await db.playlists.delete(playlistId);
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== playlistId),
      selectedPlaylistId:
        state.selectedPlaylistId === playlistId ? null : state.selectedPlaylistId,
    }));
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

  setActiveTab: (tab: LibraryTab) => {
    set({ activeTab: tab });
  },

  setSelectedPlaylistId: (id: string | null) => {
    set({ selectedPlaylistId: id });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedGenre: (genre: string | null) => {
    set({ selectedGenre: genre });
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
}));
