import { db } from '../db';
import { useLibraryStore } from '../stores/useLibraryStore';

export interface BeatNestBackupPayload {
  version: number;
  appName: string;
  exportedAt: number;
  playlists: {
    id: string;
    name: string;
    description?: string;
    trackIds: string[];
    createdAt: number;
    updatedAt: number;
  }[];
  favorites: {
    title: string;
    artist: string;
    album: string;
    fileName: string;
  }[];
  tracksSummary: {
    id: string;
    title: string;
    artist: string;
    album: string;
    fileName: string;
    lyrics?: string;
  }[];
}

/**
 * Exports current playlists, favorites, and track metadata to a JSON file.
 */
export async function exportLibraryBackup(): Promise<void> {
  const storedTracks = await db.tracks.toArray();
  const storedPlaylists = await db.playlists.toArray();

  const backupData: BeatNestBackupPayload = {
    version: 1,
    appName: 'BeatNest',
    exportedAt: Date.now(),
    playlists: storedPlaylists,
    favorites: storedTracks
      .filter((t) => t.isFavorite)
      .map((t) => ({
        title: t.title,
        artist: t.artist,
        album: t.album,
        fileName: t.fileName,
      })),
    tracksSummary: storedTracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album,
      fileName: t.fileName,
      lyrics: t.lyrics,
    })),
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `beatnest-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports and restores playlists, favorites, and lyrics from a JSON backup file.
 */
export async function importLibraryBackup(
  file: File
): Promise<{ playlistsRestored: number; favoritesRestored: number }> {
  const content = await file.text();
  const data = JSON.parse(content) as BeatNestBackupPayload;

  if (!data.appName || data.appName !== 'BeatNest' || !Array.isArray(data.playlists)) {
    throw new Error('El archivo no tiene un formato de respaldo válido de BeatNest.');
  }

  // Restore Playlists
  if (data.playlists.length > 0) {
    await db.playlists.bulkPut(data.playlists);
  }

  // Match and restore favorites and lyrics on current tracks
  const currentTracks = await db.tracks.toArray();
  let favoritesCount = 0;

  for (const t of currentTracks) {
    const isFavoriteInBackup = data.favorites.some(
      (fav) =>
        fav.fileName === t.fileName ||
        (fav.title.toLowerCase() === t.title.toLowerCase() &&
          fav.artist.toLowerCase() === t.artist.toLowerCase())
    );

    const summaryMatch = data.tracksSummary?.find(
      (s) =>
        s.fileName === t.fileName ||
        (s.title.toLowerCase() === t.title.toLowerCase() &&
          s.artist.toLowerCase() === t.artist.toLowerCase())
    );

    const updates: Partial<typeof t> = {};
    if (isFavoriteInBackup && !t.isFavorite) {
      updates.isFavorite = true;
      favoritesCount++;
    }
    if (summaryMatch?.lyrics && !t.lyrics) {
      updates.lyrics = summaryMatch.lyrics;
    }

    if (Object.keys(updates).length > 0) {
      await db.tracks.update(t.id, updates as any);
    }
  }

  // Refresh active Zustand memory store
  await useLibraryStore.getState().loadFromDatabase();

  return {
    playlistsRestored: data.playlists.length,
    favoritesRestored: favoritesCount,
  };
}
