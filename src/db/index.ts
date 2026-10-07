import Dexie, { type Table } from 'dexie';
import type { Track, Playlist } from '../types/music';

export interface StoredTrack extends Omit<Track, 'file' | 'coverUrl'> {
  coverData?: Blob | null;
}

export class BeatNestDatabase extends Dexie {
  tracks!: Table<StoredTrack, string>;
  playlists!: Table<Playlist, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('BeatNestDB');
    this.version(1).stores({
      tracks: 'id, title, artist, album, isFavorite, dateAdded, fileName',
      playlists: 'id, name, createdAt, updatedAt',
      settings: 'key',
    });
  }
}

export const db = new BeatNestDatabase();
