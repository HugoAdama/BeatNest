/**
 * Audio synthesis and artwork generation utility for in-browser demo tracks
 * without requiring external network requests.
 */

export function audioBufferToWav(buffer: AudioBuffer): Blob {
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

/**
 * Creates high-resolution cover artwork with sleek gradients and modern visual elements.
 */
export function createColoredCoverBlob(
  primaryColor: string,
  secondaryColor: string,
  title: string,
  artist: string
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(new Blob([], { type: 'image/png' }));
      return;
    }

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, primaryColor);
    grad.addColorStop(1, secondaryColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Subtle dark glass overlay
    ctx.fillStyle = 'rgba(10, 10, 20, 0.4)';
    ctx.fillRect(0, 0, 400, 400);

    // Decorative geometric rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(200, 200, 120, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(200, 200, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Soundwave bars in center
    const barCount = 12;
    const startX = 130;
    const barWidth = 8;
    const gap = 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < barCount; i++) {
      const h = 25 + Math.sin(i * 0.7) * 20;
      ctx.fillRect(startX + i * (barWidth + gap), 200 - h / 2, barWidth, h);
    }

    // Bottom banner with title & artist
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 310, 400, 90);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(title.slice(0, 22), 24, 348);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillText(artist.slice(0, 28), 24, 375);

    canvas.toBlob((blob) => {
      resolve(blob || new Blob([], { type: 'image/png' }));
    }, 'image/png');
  });
}

/**
 * Generates an harmonic C-Major arpeggio sample track in memory.
 */
export async function generateDemoArpeggioTrack(): Promise<File> {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioContextClass();
  const sampleRate = 44100;
  const durationSeconds = 12;
  const numFrames = sampleRate * durationSeconds;
  const audioBuffer = ctx.createBuffer(2, numFrames, sampleRate);

  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(t * 2.5) % notes.length;
    const freq = notes[noteIndex];
    const envelope = Math.exp(-((t % 0.4) * 4.5));
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.35;
    left[i] = sample;
    right[i] = sample;
  }

  await ctx.close();

  const wavBlob = audioBufferToWav(audioBuffer);
  return new File([wavBlob], 'BeatNest Intro - Demo Arpeggio.wav', { type: 'audio/wav' });
}

export interface DemoTrackItem {
  file: File;
  coverBlob: Blob;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
}

/**
 * Generates a full pack of 3 musical sample tracks with distinct melodies,
 * synth textures and cover art for testing crossfade, playlists, and queue.
 */
export async function generateDemoTracksPack(): Promise<DemoTrackItem[]> {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const sampleRate = 44100;
  const duration = 14; // 14 seconds each: perfect for testing 3s crossfade!
  const numFrames = sampleRate * duration;

  const tracksDef = [
    {
      title: 'Aurora Synthwave',
      artist: 'Solaris Beats',
      album: 'Neon Horizon',
      genre: 'Synthwave',
      colorA: '#7C5CFF',
      colorB: '#0284C7',
      baseFreq: 220, // A3
      harmonics: [1, 1.25, 1.5, 1.875],
      tempo: 2.2,
    },
    {
      title: 'Velvet Horizon',
      artist: 'Lunar Grove',
      album: 'Chill Sessions',
      genre: 'Lo-Fi Chill',
      colorA: '#F59E0B',
      colorB: '#EC4899',
      baseFreq: 174.61, // F3
      harmonics: [1, 1.33, 1.5, 2.0],
      tempo: 1.8,
    },
    {
      title: 'Cyber Pulse',
      artist: 'Neural Wave',
      album: 'Matrix Echoes',
      genre: 'Electronic',
      colorA: '#10B981',
      colorB: '#6366F1',
      baseFreq: 130.81, // C3
      harmonics: [1, 1.2, 1.6, 2.2],
      tempo: 3.0,
    },
  ];

  const items: DemoTrackItem[] = [];

  for (const def of tracksDef) {
    const ctx = new AudioContextClass();
    const audioBuffer = ctx.createBuffer(2, numFrames, sampleRate);
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);

    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const noteIdx = Math.floor(t * def.tempo) % def.harmonics.length;
      const freq = def.baseFreq * def.harmonics[noteIdx];

      // Bass fundamental + pluck envelope
      const env = Math.exp(-((t % (1 / def.tempo)) * 3.8));
      const s1 = Math.sin(2 * Math.PI * freq * t) * env * 0.3;
      const s2 = Math.sin(2 * Math.PI * (freq * 1.5) * t) * env * 0.12;
      const sub = Math.sin(2 * Math.PI * (def.baseFreq * 0.5) * t) * 0.15;

      left[i] = s1 + s2 * 0.8 + sub;
      right[i] = s1 * 0.8 + s2 + sub;
    }

    await ctx.close();

    const wavBlob = audioBufferToWav(audioBuffer);
    const file = new File([wavBlob], `${def.artist} - ${def.title}.wav`, { type: 'audio/wav' });
    const coverBlob = await createColoredCoverBlob(def.colorA, def.colorB, def.title, def.artist);

    items.push({
      file,
      coverBlob,
      title: def.title,
      artist: def.artist,
      album: def.album,
      genre: def.genre,
      duration,
    });
  }

  return items;
}
