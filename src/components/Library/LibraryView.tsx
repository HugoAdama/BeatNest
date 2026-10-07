import React, { useMemo, useState } from 'react';
import {
  FolderOpen,
  Music,
  Play,
  Heart,
  ListMusic,
  Disc,
  Mic2,
  Sparkles,
  Info,
} from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { TrackRow } from './TrackRow';
import { TrackCard } from './TrackCard';
import { formatDuration } from '../../lib/metadata';

interface LibraryViewProps {
  onOpenCreatePlaylistModal: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onOpenCreatePlaylistModal }) => {
  const {
    tracks,
    playlists,
    activeTab,
    selectedPlaylistId,
    searchQuery,
    sortBy,
    sortOrder,
    viewMode,
    importDirectoryWithPicker,
    importFiles,
  } = useLibraryStore();

  const { playTrack } = usePlayerStore();
  const [isDragOver, setIsDragOver] = useState(false);

  // Filter tracks based on activeTab, selected playlist, and search query
  const displayedTracks = useMemo(() => {
    let list = [...tracks];

    // Filter by Playlist
    if (activeTab === 'playlists' && selectedPlaylistId) {
      const pl = playlists.find((p) => p.id === selectedPlaylistId);
      if (pl) {
        list = list.filter((t) => pl.trackIds.includes(t.id));
      }
    } else if (activeTab === 'favorites') {
      list = list.filter((t) => t.isFavorite);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.fileName.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortBy) {
        case 'title':
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case 'artist':
          valA = a.artist.toLowerCase();
          valB = b.artist.toLowerCase();
          break;
        case 'album':
          valA = a.album.toLowerCase();
          valB = b.album.toLowerCase();
          break;
        case 'duration':
          valA = a.duration;
          valB = b.duration;
          break;
        case 'dateAdded':
          valA = a.dateAdded;
          valB = b.dateAdded;
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [tracks, playlists, activeTab, selectedPlaylistId, searchQuery, sortBy, sortOrder]);

  // Groupings for Artists and Albums view
  const groupedArtists = useMemo(() => {
    const map = new Map<string, typeof tracks>();
    tracks.forEach((t) => {
      const arr = map.get(t.artist) || [];
      arr.push(t);
      map.set(t.artist, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const groupedAlbums = useMemo(() => {
    const map = new Map<string, typeof tracks>();
    tracks.forEach((t) => {
      const arr = map.get(t.album) || [];
      arr.push(t);
      map.set(t.album, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  const totalDuration = useMemo(() => {
    return displayedTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  }, [displayedTracks]);

  // Drag and drop handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await importFiles(e.dataTransfer.files);
    }
  };

  const handlePlayAll = () => {
    if (displayedTracks.length > 0) {
      playTrack(displayedTracks[0], displayedTracks);
    }
  };

  // Generate synthesizer test tone track if user wants to test audio without having files on hand
  const handleGenerateSampleTrack = async () => {
    try {
      // Create a small 5-second harmonious synth audio file in browser
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = 44100;
      const durationSeconds = 5;
      const numFrames = sampleRate * durationSeconds;
      const audioBuffer = ctx.createBuffer(2, numFrames, sampleRate);

      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);

      // Render pleasant acoustic chord arpeggio
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C major pentatonic
      for (let i = 0; i < numFrames; i++) {
        const t = i / sampleRate;
        const noteIndex = Math.floor(t * 2) % notes.length;
        const freq = notes[noteIndex];
        const envelope = Math.exp(-((t % 0.5) * 4));
        const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
        left[i] = sample;
        right[i] = sample;
      }

      // Convert audioBuffer to WAV Blob
      const wavBlob = audioBufferToWav(audioBuffer);
      const demoFile = new File([wavBlob], 'BeatNest Intro - Demo Arpeggio.wav', { type: 'audio/wav' });
      await importFiles([demoFile]);
    } catch (err) {
      console.warn('Could not generate sample track:', err);
    }
  };

  // If entire library is empty
  if (tracks.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col items-center justify-center p-8 text-center transition-all ${
          isDragOver ? 'bg-[#7C5CFF]/10 border-2 border-dashed border-[#7C5CFF]' : ''
        }`}
      >
        <div className="max-w-lg flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#7C5CFF]/20 to-[#4FD1C5]/20 border border-[#7C5CFF]/40 flex items-center justify-center mb-6 shadow-2xl">
            <Music size={36} className="text-[#4FD1C5]" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F7] mb-2">
            Tu música, sin nube
          </h2>
          <p className="text-sm text-[#A0A0AB] mb-8 leading-relaxed">
            BeatNest lee tus canciones directamente desde tu dispositivo sin subirlas a ningún servidor. Privado, instantáneo y 100% offline.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mb-6">
            <button
              onClick={importDirectoryWithPicker}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#7C5CFF] text-white font-medium text-sm hover:bg-[#6D48F7] active:scale-95 transition-all shadow-[0_0_20px_rgba(124,92,255,0.4)]"
            >
              <FolderOpen size={18} />
              <span>Seleccionar carpeta de música</span>
            </button>

            <button
              onClick={handleGenerateSampleTrack}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#1A1A1F] border border-[#2E2E38] text-[#4FD1C5] text-sm hover:border-[#4FD1C5]/50 hover:bg-[#24242B] transition-all"
            >
              <Sparkles size={16} />
              <span>Generar pista demo</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#A0A0AB] bg-[#1A1A1F] px-4 py-2 rounded-xl border border-[#2E2E38]">
            <Info size={14} className="text-[#7C5CFF]" />
            <span>Formatos compatibles: MP3, FLAC, WAV, OGG, M4A, AAC, OPUS</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col overflow-y-auto pb-32 transition-colors ${
        isDragOver ? 'bg-[#7C5CFF]/5 border-2 border-dashed border-[#7C5CFF]' : ''
      }`}
    >
      {/* Header Banner */}
      <div className="px-8 pt-8 pb-4">
        {activeTab === 'playlists' && currentPlaylist ? (
          <div className="flex items-end gap-6 mb-6">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-[#4FD1C5] flex items-center justify-center shadow-2xl shrink-0">
              <ListMusic size={52} className="text-[#0F0F12]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4FD1C5]">
                Playlist
              </span>
              <h2 className="text-3xl font-extrabold text-[#F5F5F7] tracking-tight mt-1 mb-2">
                {currentPlaylist.name}
              </h2>
              {currentPlaylist.description && (
                <p className="text-xs text-[#A0A0AB] mb-3">
                  {currentPlaylist.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-[#A0A0AB]">
                <span>{displayedTracks.length} pistas</span>
                <span>•</span>
                <span>{formatDuration(totalDuration)} tiempo total</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'favorites' ? (
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Heart size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F5F5F7]">Canciones favoritas</h2>
              <p className="text-xs text-[#A0A0AB]">
                {displayedTracks.length} pistas guardadas
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#F5F5F7]">
                {activeTab === 'artists'
                  ? 'Artistas'
                  : activeTab === 'albums'
                  ? 'Álbumes'
                  : 'Todas las pistas'}
              </h2>
              <p className="text-xs text-[#A0A0AB] mt-0.5">
                {displayedTracks.length} pistas • {formatDuration(totalDuration)} en total
              </p>
            </div>

            {displayedTracks.length > 0 && activeTab !== 'artists' && activeTab !== 'albums' && (
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold hover:bg-[#6D48F7] active:scale-95 transition-all shadow-[0_0_15px_rgba(124,92,255,0.4)]"
              >
                <Play size={15} fill="currentColor" />
                <span>Reproducir todo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Render based on view mode and tab */}
      <div className="px-8 flex-1">
        {displayedTracks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center text-[#A0A0AB]">
            <p className="text-sm font-medium text-[#F5F5F7] mb-1">
              No se encontraron canciones
            </p>
            <p className="text-xs">
              {searchQuery
                ? `No hay resultados para «${searchQuery}».`
                : 'Añade pistas a esta sección.'}
            </p>
          </div>
        ) : activeTab === 'artists' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groupedArtists.map(([artistName, artistTracks]) => (
              <div
                key={artistName}
                onClick={() => playTrack(artistTracks[0], artistTracks)}
                className="p-4 rounded-2xl bg-[#1A1A1F] border border-[#2E2E38] hover:border-[#7C5CFF]/60 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-[#24242B] border border-[#2E2E38] flex items-center justify-center mb-3 text-[#7C5CFF] group-hover:bg-[#7C5CFF] group-hover:text-white transition-colors">
                  <Mic2 size={24} />
                </div>
                <h4 className="text-sm font-semibold text-[#F5F5F7] truncate">
                  {artistName}
                </h4>
                <p className="text-xs text-[#A0A0AB] mt-0.5">
                  {artistTracks.length} {artistTracks.length === 1 ? 'pista' : 'pistas'}
                </p>
              </div>
            ))}
          </div>
        ) : activeTab === 'albums' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groupedAlbums.map(([albumName, albumTracks]) => {
              const coverUrl = albumTracks.find((t) => t.coverUrl)?.coverUrl;
              return (
                <div
                  key={albumName}
                  onClick={() => playTrack(albumTracks[0], albumTracks)}
                  className="p-4 rounded-2xl bg-[#1A1A1F] border border-[#2E2E38] hover:border-[#7C5CFF]/60 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="aspect-square rounded-xl bg-[#24242B] border border-[#2E2E38] overflow-hidden flex items-center justify-center mb-3">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={albumName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Disc size={36} className="text-[#7C5CFF]" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-[#F5F5F7] truncate">
                    {albumName}
                  </h4>
                  <p className="text-xs text-[#A0A0AB] mt-0.5">
                    {albumTracks[0]?.artist || 'Varios artistas'} • {albumTracks.length} pistas
                  </p>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-1">
            {/* List column headers */}
            <div className="flex items-center gap-3 px-3.5 py-2 text-[11px] font-bold text-[#A0A0AB] uppercase tracking-wider border-b border-[#2E2E38]">
              <span className="w-8 text-center">#</span>
              <span className="flex-1 md:w-5/12">Título</span>
              <span className="hidden md:block w-3/12">Artista</span>
              <span className="hidden lg:block w-3/12">Álbum</span>
              <span className="w-24 text-right pr-2">Duración</span>
            </div>

            {displayedTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                onOpenCreatePlaylistModal={onOpenCreatePlaylistModal}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayedTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onOpenCreatePlaylistModal={onOpenCreatePlaylistModal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Utility to encode an AudioBuffer to WAV format blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const length = buffer.length * numChannels * 2;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}
