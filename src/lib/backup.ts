import { db } from '../db';
import { useLibraryStore } from '../stores/useLibraryStore';

export interface BeatNestBackupPayload {
  version: number;
  appName: string;
  exportedAt: number;
  includesAudio: false;
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
    fileSize?: number;
  }[];
  tracksSummary: {
    id: string;
    title: string;
    artist: string;
    album: string;
    fileName: string;
    fileSize?: number;
    lyrics?: string;
  }[];
}

/** Export metadata, playlists, favorites, and lyrics. Audio files stay on the device. */
export async function exportLibraryBackup(): Promise<void> {
  const storedTracks = await db.tracks.toArray();
  const storedPlaylists = await db.playlists.toArray();

  const backupData: BeatNestBackupPayload = {
    version: 1,
    appName: 'BeatNest',
    exportedAt: Date.now(),
    includesAudio: false,
    playlists: storedPlaylists.map(({ id, name, description, trackIds, createdAt, updatedAt }) => ({
      id, name, description, trackIds, createdAt, updatedAt,
    })),
    favorites: storedTracks
      .filter((track) => track.isFavorite)
      .map(({ title, artist, album, fileName, fileSize }) => ({ title, artist, album, fileName, fileSize })),
    tracksSummary: storedTracks.map(({ id, title, artist, album, fileName, fileSize, lyrics }) => ({
      id, title, artist, album, fileName, fileSize, lyrics,
    })),
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `beatnest-metadata-backup-${dateStr}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasStringFields(value: unknown, fields: string[]): value is Record<string, unknown> {
  return isRecord(value) && fields.every((field) => typeof value[field] === 'string');
}

function validateBackup(value: unknown): BeatNestBackupPayload {
  if (!isRecord(value) || value.appName !== 'BeatNest' || value.version !== 1) {
    throw new Error('El archivo no tiene un formato de respaldo válido de BeatNest.');
  }

  const validPlaylists = Array.isArray(value.playlists) && value.playlists.every((playlist) =>
    hasStringFields(playlist, ['id', 'name']) &&
    Array.isArray(playlist.trackIds) && playlist.trackIds.every((id) => typeof id === 'string') &&
    typeof playlist.createdAt === 'number' && typeof playlist.updatedAt === 'number' &&
    (playlist.description === undefined || typeof playlist.description === 'string')
  );
  const validFavorites = Array.isArray(value.favorites) && value.favorites.every((favorite) =>
    hasStringFields(favorite, ['title', 'artist', 'album', 'fileName']) &&
    (isRecord(favorite) && (favorite.fileSize === undefined || typeof favorite.fileSize === 'number'))
  );
  const validSummaries = value.tracksSummary === undefined || (
    Array.isArray(value.tracksSummary) && value.tracksSummary.every((track) =>
      hasStringFields(track, ['id', 'title', 'artist', 'album', 'fileName']) &&
      (isRecord(track) && (track.fileSize === undefined || typeof track.fileSize === 'number')) &&
      (track.lyrics === undefined || typeof track.lyrics === 'string')
    )
  );

  if (!validPlaylists || !validFavorites || !validSummaries) {
    throw new Error('El respaldo está incompleto o contiene datos con formato incorrecto.');
  }

  return value as unknown as BeatNestBackupPayload;
}

/** Restores playlists, favorites, and lyrics onto matching tracks already in this browser. */
export async function importLibraryBackup(
  file: File
): Promise<{ playlistsRestored: number; favoritesRestored: number }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('No se pudo leer el JSON del respaldo.');
  }
  const data = validateBackup(parsed);
  const summaries = data.tracksSummary ?? [];

  let favoritesRestored = 0;
  await db.transaction('rw', db.playlists, db.tracks, async () => {
    const currentTracks = await db.tracks.toArray();
    const findLocalTrack = (reference: { fileName: string; fileSize?: number; title: string; artist: string }) =>
      currentTracks.find((track) =>
        track.fileName === reference.fileName &&
        (reference.fileSize === undefined || track.fileSize === reference.fileSize)
      ) ?? currentTracks.find((track) =>
        track.title.toLocaleLowerCase() === reference.title.toLocaleLowerCase() &&
        track.artist.toLocaleLowerCase() === reference.artist.toLocaleLowerCase()
      );

    const localIdsByBackupId = new Map<string, string>();
    for (const summary of summaries) {
      const localTrack = findLocalTrack(summary);
      if (localTrack) localIdsByBackupId.set(summary.id, localTrack.id);
    }
    const playlistsToRestore = data.playlists.map((playlist) => ({
      ...playlist,
      trackIds: playlist.trackIds.map((id) => localIdsByBackupId.get(id) ?? id),
    }));
    if (playlistsToRestore.length > 0) await db.playlists.bulkPut(playlistsToRestore);

    for (const track of currentTracks) {
      const isFavoriteInBackup = data.favorites.some((favorite) =>
        (favorite.fileName === track.fileName &&
          (favorite.fileSize === undefined || favorite.fileSize === track.fileSize)) ||
        (favorite.title.toLocaleLowerCase() === track.title.toLocaleLowerCase() &&
          favorite.artist.toLocaleLowerCase() === track.artist.toLocaleLowerCase())
      );
      const summaryMatch = summaries.find((summary) =>
        summary.fileName === track.fileName ||
        (summary.title.toLocaleLowerCase() === track.title.toLocaleLowerCase() &&
          summary.artist.toLocaleLowerCase() === track.artist.toLocaleLowerCase())
      );

      const updates: { isFavorite?: boolean; lyrics?: string } = {};
      if (isFavoriteInBackup && !track.isFavorite) {
        updates.isFavorite = true;
        favoritesRestored++;
      }
      if (summaryMatch?.lyrics && !track.lyrics) updates.lyrics = summaryMatch.lyrics;
      if (Object.keys(updates).length > 0) await db.tracks.update(track.id, updates);
    }
  });

  await useLibraryStore.getState().loadFromDatabase();
  return {
    playlistsRestored: data.playlists.length,
    favoritesRestored,
  };
}
