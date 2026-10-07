import type { Track } from '../types/music';

/**
 * Generates and triggers download of an .m3u playlist file
 */
export function exportPlaylistAsM3U(playlistName: string, tracks: Track[]): void {
  const lines: string[] = ['#EXTM3U'];

  tracks.forEach((track) => {
    const artist = track.artist || 'Desconocido';
    const title = track.title || 'Pista sin título';
    const duration = Math.round(track.duration || 0);
    lines.push(`#EXTINF:${duration},${artist} - ${title}`);
    lines.push(track.fileName || `${artist} - ${title}.mp3`);
  });

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'audio/x-mpegurl;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const safeName = playlistName
    .trim()
    .replace(/[^a-zA-Z0-9_\-\u00C0-\u017F\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${safeName || 'playlist'}.m3u`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
