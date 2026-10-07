import type { Track } from '../types/music';
import { db, type StoredTrack } from '../db';
import { extractMetadata } from './metadata';

export interface ImportProgress {
  current: number;
  total: number;
  filename: string;
}

export interface LibraryImportResult {
  tracks: Track[];
  importedCount: number;
  metadataOnlyCount: number;
  failedCount: number;
  estimatedAvailableBytes: number | null;
}

/** Parses selected files and persists track records. UI state and notifications stay in the store. */
export async function importLibraryFiles(
  fileList: FileList | File[],
  currentTracks: Track[],
  onProgress: (progress: ImportProgress | null) => void
): Promise<LibraryImportResult> {
  const rawFiles = Array.from(fileList);
  const audioExtensions = ['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac', '.opus', '.wma', '.webm'];
  const audioFiles = rawFiles.filter((file) => {
    const lowerName = file.name.toLowerCase();
    return file.type.startsWith('audio/') || audioExtensions.some((extension) => lowerName.endsWith(extension));
  });

  let estimatedAvailableBytes: number | null = null;
  try {
    const estimate = await navigator.storage?.estimate();
    if (estimate?.quota !== undefined && estimate.usage !== undefined) {
      estimatedAvailableBytes = Math.max(0, estimate.quota - estimate.usage);
    }
  } catch {
    // Storage estimates are optional; IndexedDB writes below still handle quota errors.
  }

  if (audioFiles.length === 0) {
    return { tracks: currentTracks, importedCount: 0, metadataOnlyCount: 0, failedCount: 0, estimatedAvailableBytes };
  }

  const lyricsByBaseName = new Map<string, File>();
  for (const file of rawFiles.filter((item) => item.name.toLowerCase().endsWith('.lrc'))) {
    const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().trim();
    lyricsByBaseName.set(baseName, file);
  }

  onProgress({ current: 0, total: audioFiles.length, filename: audioFiles[0].name });
  const tracksById = new Map(currentTracks.map((track) => [track.id, track]));
  let importedCount = 0;
  let metadataOnlyCount = 0;
  let failedCount = 0;

  for (let index = 0; index < audioFiles.length; index++) {
    const file = audioFiles[index];
    onProgress({ current: index + 1, total: audioFiles.length, filename: file.name });

    try {
      const metadataTrack = await extractMetadata(file);
      const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().trim();
      const lyricsFile = lyricsByBaseName.get(baseName);
      if (lyricsFile) {
        try {
          metadataTrack.lyrics = await lyricsFile.text();
        } catch (error) {
          console.warn('Could not read lyrics for', file.name, error);
        }
      }

      const existing = tracksById.get(metadataTrack.id);
      if (existing) {
        const storedTrack = await db.tracks.get(existing.id);
        const hasStoredAudio = Boolean(storedTrack?.audioData);
        existing.file = file;
        if (hasStoredAudio) {
          // The same file identity is already persisted; no replacement write is needed.
        } else if (estimatedAvailableBytes !== null && file.size > estimatedAvailableBytes) {
          metadataOnlyCount++;
        } else {
          try {
            await db.tracks.update(existing.id, { audioData: file });
            if (estimatedAvailableBytes !== null) estimatedAvailableBytes -= file.size;
          } catch (storageError) {
            metadataOnlyCount++;
            console.warn('Could not persist audio file; it remains available for this session:', storageError);
          }
        }

        if (metadataTrack.lyrics && !existing.lyrics) {
          existing.lyrics = metadataTrack.lyrics;
          db.tracks.update(existing.id, { lyrics: existing.lyrics }).catch(console.warn);
        }
        if (!existing.coverUrl && metadataTrack.coverUrl) {
          existing.coverUrl = metadataTrack.coverUrl;
          existing.coverData = metadataTrack.coverData;
          await db.tracks.update(existing.id, { coverData: metadataTrack.coverData });
        } else if (metadataTrack.coverUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(metadataTrack.coverUrl);
        }
        continue;
      }

      tracksById.set(metadataTrack.id, metadataTrack);
      const canPersistAudio = estimatedAvailableBytes === null || file.size <= estimatedAvailableBytes;
      const storedTrack: StoredTrack = {
        id: metadataTrack.id,
        title: metadataTrack.title,
        artist: metadataTrack.artist,
        album: metadataTrack.album,
        duration: metadataTrack.duration,
        year: metadataTrack.year,
        genre: metadataTrack.genre,
        coverData: metadataTrack.coverData || null,
        audioData: canPersistAudio ? file : null,
        fileName: metadataTrack.fileName,
        fileSize: metadataTrack.fileSize,
        fileType: metadataTrack.fileType,
        dateAdded: metadataTrack.dateAdded,
        isFavorite: false,
        playCount: 0,
        lyrics: metadataTrack.lyrics,
      };

      try {
        await db.tracks.put(storedTrack);
        if (canPersistAudio) {
          importedCount++;
          if (estimatedAvailableBytes !== null) estimatedAvailableBytes -= file.size;
        } else {
          metadataOnlyCount++;
        }
      } catch (storageError) {
        console.warn('Storage quota limit for audio blob, saving metadata only:', storageError);
        await db.tracks.put({ ...storedTrack, audioData: null });
        metadataOnlyCount++;
      }
    } catch (error) {
      failedCount++;
      console.warn(`Error processing ${file.name}:`, error);
    }
  }

  onProgress(null);
  return {
    tracks: Array.from(tracksById.values()),
    importedCount,
    metadataOnlyCount,
    failedCount,
    estimatedAvailableBytes,
  };
}
