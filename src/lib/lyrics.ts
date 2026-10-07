export interface LyricLine {
  id: number;
  time: number; // in seconds
  text: string;
}

/**
 * Parse standard LRC format string into sorted array of timed lines
 */
export function parseLRC(lrcText: string): LyricLine[] {
  if (!lrcText || !lrcText.trim()) return [];

  const lines = lrcText.split(/\r?\n/);
  const result: LyricLine[] = [];
  let lineId = 0;

  // Regex to match timestamps like [01:23.45] or [01:23:45] or [01:23]
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Skip metadata tags like [ti:Title], [ar:Artist], etc. unless they also contain lyric text
    if (/^\[[a-zA-Z]+:[^\]]*\]$/.test(trimmed)) {
      continue;
    }

    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length > 0) {
      // Text is whatever follows the last timestamp
      const text = trimmed.replace(timeRegex, '').trim();

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const ms = match[3] ? parseFloat(`0.${match[3]}`) : 0;
        const totalSeconds = minutes * 60 + seconds + ms;

        result.push({
          id: lineId++,
          time: totalSeconds,
          text: text || '...',
        });
      }
    } else {
      // Unsynchronized plain text line: distribute or store with negative timestamp
      result.push({
        id: lineId++,
        time: -1,
        text: trimmed,
      });
    }
  }

  // Sort timed lines chronologically
  const timed = result.filter((l) => l.time >= 0).sort((a, b) => a.time - b.time);
  const untimed = result.filter((l) => l.time < 0);

  if (timed.length > 0) {
    return timed;
  }
  return untimed;
}

/**
 * Find index of the currently active lyric line based on track playback time
 */
export function getActiveLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics || lyrics.length === 0) return -1;
  if (lyrics[0].time < 0) return -1; // Untimed plain text

  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= currentTime) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
}
