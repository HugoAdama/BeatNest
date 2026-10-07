/**
 * Audio synthesis utility for generating in-browser demo tracks
 * without requiring local audio files or external network requests.
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
 * Generates an harmonic C-Major arpeggio sample track in memory.
 */
export async function generateDemoArpeggioTrack(): Promise<File> {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioContextClass();
  const sampleRate = 44100;
  const durationSeconds = 6;
  const numFrames = sampleRate * durationSeconds;
  const audioBuffer = ctx.createBuffer(2, numFrames, sampleRate);

  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  // C Major chord notes: C4, E4, G4, C5, E5, G5
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
