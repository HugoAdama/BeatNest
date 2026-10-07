import { useMemo } from 'react';
import type { Track, Playlist } from '../../types/music';
import type { LibraryTab, SortField, SortOrder } from '../../stores/useLibraryStore';

interface LibraryViewModelInput {
  tracks: Track[];
  playlists: Playlist[];
  recentTracks: Track[];
  activeTab: LibraryTab;
  selectedPlaylistId: string | null;
  selectedGenre: string | null;
  selectedFormat: string | null;
  searchQuery: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export function useLibraryViewModel({
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
}: LibraryViewModelInput) {
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    tracks.forEach((track) => {
      if (track.genre?.trim() && track.genre.toLowerCase() !== 'unknown') {
        genres.add(track.genre.trim());
      }
    });
    return Array.from(genres).sort((a, b) => a.localeCompare(b));
  }, [tracks]);

  const displayedTracks = useMemo(() => {
    let list = activeTab === 'history' ? [...recentTracks] : [...tracks];

    if (activeTab === 'playlists' && selectedPlaylistId) {
      const playlist = playlists.find((item) => item.id === selectedPlaylistId);
      if (playlist) {
        const trackMap = new Map(tracks.map((track) => [track.id, track]));
        list = playlist.trackIds
          .map((id) => trackMap.get(id))
          .filter((track): track is Track => Boolean(track));
      }
    } else if (activeTab === 'favorites') {
      list = list.filter((track) => track.isFavorite);
    } else if (activeTab === 'smart-top') {
      list = list.filter((track) => (track.playCount || 0) > 0);
    } else if (activeTab === 'smart-long') {
      list = list.filter((track) => track.duration >= 300);
    }

    if (selectedFormat) {
      list = list.filter((track) => track.fileName.split('.').pop()?.toUpperCase() === selectedFormat);
    }
    if (selectedGenre) {
      list = list.filter((track) => track.genre?.toLowerCase() === selectedGenre.toLowerCase());
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album.toLowerCase().includes(query) ||
        track.fileName.toLowerCase().includes(query)
      );
    }

    if (activeTab !== 'history' && !(activeTab === 'playlists' && selectedPlaylistId)) {
      list.sort((a, b) => {
        const value = (track: Track): string | number => {
          switch (sortBy) {
            case 'title': return track.title.toLowerCase();
            case 'artist': return track.artist.toLowerCase();
            case 'album': return track.album.toLowerCase();
            case 'duration': return track.duration;
            case 'dateAdded': return track.dateAdded;
            case 'playCount': return track.playCount || 0;
            default: return 0;
          }
        };
        const left = value(a);
        const right = value(b);
        if (left === right) return 0;
        const result = left < right ? -1 : 1;
        return sortOrder === 'asc' ? result : -result;
      });
    }
    return list;
  }, [tracks, recentTracks, playlists, activeTab, selectedPlaylistId, selectedGenre, selectedFormat, searchQuery, sortBy, sortOrder]);

  const groupedArtists = useMemo(() => {
    const groups = new Map<string, Track[]>();
    tracks.forEach((track) => groups.set(track.artist, [...(groups.get(track.artist) ?? []), track]));
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tracks]);

  const groupedAlbums = useMemo(() => {
    const groups = new Map<string, Track[]>();
    tracks.forEach((track) => groups.set(track.album, [...(groups.get(track.album) ?? []), track]));
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tracks]);

  const currentPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId) ?? null;
  const availableTracksToAdd = useMemo(() => {
    if (!currentPlaylist) return [];
    const inPlaylist = new Set(currentPlaylist.trackIds);
    return tracks.filter((track) => !inPlaylist.has(track.id));
  }, [currentPlaylist, tracks]);

  const playlistCollageCovers = useMemo(() => {
    if (!currentPlaylist) return [];
    const trackMap = new Map(tracks.map((track) => [track.id, track]));
    return currentPlaylist.trackIds
      .map((id) => trackMap.get(id)?.coverUrl)
      .filter((coverUrl): coverUrl is string => Boolean(coverUrl))
      .slice(0, 4);
  }, [currentPlaylist, tracks]);

  const totalDuration = useMemo(
    () => displayedTracks.reduce((total, track) => total + (track.duration || 0), 0),
    [displayedTracks]
  );

  return {
    uniqueGenres,
    displayedTracks,
    groupedArtists,
    groupedAlbums,
    currentPlaylist,
    availableTracksToAdd,
    playlistCollageCovers,
    totalDuration,
  };
}
