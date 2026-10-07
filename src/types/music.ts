export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  year?: number;
  genre?: string;
  coverUrl?: string; // transient ObjectURL
  coverData?: Blob | null; // persisted in IndexedDB
  file?: File; // transient in current session
  fileName: string;
  fileSize: number;
  fileType: string;
  dateAdded: number;
  isFavorite?: boolean;
  playCount?: number;
  lyrics?: string; // LRC or plain text lyrics
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
  coverUrl?: string;
  coverData?: Blob | null;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type VisualizerMode = 'bars' | 'wave' | 'circle' | 'pulse';

export type ReverbMode = 'off' | 'room' | 'hall' | 'cathedral';

export type SleepTimerOption = 15 | 30 | 45 | 60 | 'track_end' | null;

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: [number, number, number, number, number]; // 60Hz, 250Hz, 1kHz, 4kHz, 16kHz
}

export interface AudioProfile {
  id: string;
  name: string;
  eqGains: [number, number, number, number, number];
  eqEnabled: boolean;
  reverbMode: ReverbMode;
  preampGain: number;
  autoGainEnabled: boolean;
  createdAt: number;
}

export type AudioProfileTargetType = 'genre' | 'playlist';

export interface AudioProfileBinding {
  targetType: AudioProfileTargetType;
  targetId: string;
  profileId: string;
}

export interface PlaybackCollectionContext {
  playlistId?: string;
  playlistTrackIds?: string[];
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  playbackRate: number;
}
