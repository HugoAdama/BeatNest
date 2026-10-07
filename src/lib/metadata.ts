import * as mm from 'music-metadata-browser';
import type { Track } from '../types/music';

/**
 * Generate a unique ID for a file based on name, size, and timestamp
 */
export function generateTrackId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * Helper to get audio duration using HTMLAudioElement fallback
 */
function getDurationFallback(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    const url = URL.createObjectURL(file);
    audio.preload = 'metadata';
    
    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.remove();
    };

    audio.onloadedmetadata = () => {
      const dur = audio.duration || 0;
      cleanup();
      resolve(dur);
    };

    audio.onerror = () => {
      cleanup();
      resolve(0);
    };

    audio.src = url;
  });
}

/**
 * Clean and parse filename when ID3 metadata is absent
 * e.g., "01 - Queen - Bohemian Rhapsody.mp3" -> artist: Queen, title: Bohemian Rhapsody
 */
function parseFilenameDetails(filename: string): { title: string; artist: string } {
  const cleanName = filename.replace(/\.[^/.]+$/, '').trim();
  
  // Try matching "Artist - Title" or "01. Artist - Title"
  const splitHyphen = cleanName.split(' - ');
  if (splitHyphen.length === 2) {
    const artist = splitHyphen[0].replace(/^[\d\s._-]+/, '').trim();
    const title = splitHyphen[1].trim();
    if (artist && title) {
      return { title, artist };
    }
  }

  // Fallback: remove track numbers from title
  const title = cleanName.replace(/^[\d\s._-]+/, '').trim() || cleanName;
  return {
    title,
    artist: 'Artista desconocido',
  };
}

/**
 * Extract metadata from audio file
 */
export async function extractMetadata(file: File): Promise<Track> {
  const id = generateTrackId(file);
  const { title: fallbackTitle, artist: fallbackArtist } = parseFilenameDetails(file.name);

  let title = fallbackTitle;
  let artist = fallbackArtist;
  let album = 'Álbum desconocido';
  let duration = 0;
  let year: number | undefined;
  let genre: string | undefined;
  let coverData: Blob | null = null;
  let coverUrl: string | undefined;

  try {
    const metadata = await mm.parseBlob(file, { duration: true, skipCovers: false });
    
    if (metadata.common.title) title = metadata.common.title.trim();
    if (metadata.common.artist) {
      artist = metadata.common.artist.trim();
    } else if (metadata.common.artists && metadata.common.artists.length > 0) {
      artist = metadata.common.artists.join(', ').trim();
    }
    if (metadata.common.album) album = metadata.common.album.trim();
    if (metadata.common.year) year = metadata.common.year;
    if (metadata.common.genre && metadata.common.genre.length > 0) {
      genre = metadata.common.genre[0];
    }
    if (metadata.format.duration) {
      duration = Math.round(metadata.format.duration);
    }

    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const pic = metadata.common.picture[0];
      const blob = new Blob([new Uint8Array(pic.data)], { type: pic.format });
      coverData = blob;
      coverUrl = URL.createObjectURL(blob);
    }
  } catch (err) {
    console.warn(`Error parsing metadata with music-metadata for ${file.name}, using fallback:`, err);
  }

  // If duration was not found via ID3, measure via audio element
  if (!duration || duration === 0) {
    try {
      duration = Math.round(await getDurationFallback(file));
    } catch {
      duration = 0;
    }
  }

  return {
    id,
    title,
    artist,
    album,
    duration,
    year,
    genre,
    coverUrl,
    coverData,
    file,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'audio/mpeg',
    dateAdded: Date.now(),
    isFavorite: false,
    playCount: 0,
  };
}

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Format file size into human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
