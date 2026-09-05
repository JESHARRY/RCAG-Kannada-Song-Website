import { Song } from '../types/song';

export const KANNADA_ALPHABET = [
  'ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ',
  'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ', 'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ', 'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ',
  'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ', 'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ', 'ಳ'
];

/**
 * Extracts numeric song number from song properties, tags, original filename, or fallback index.
 */
export function getSongNumber(song: Song, defaultIndex: number = 0): number {
  if (typeof song.number === 'number' && !isNaN(song.number) && song.number > 0) {
    return song.number;
  }
  if (song.number) {
    const parsed = parseInt(String(song.number), 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (song.tags && Array.isArray(song.tags)) {
    for (const tag of song.tags) {
      if (tag.startsWith('num-')) {
        const parsed = parseInt(tag.replace('num-', ''), 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
  }
  if (song.originalFile) {
    const match = song.originalFile.match(/(\d+)\.html$/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  if (song.id) {
    const match = song.id.match(/(\d+)$/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return defaultIndex + 1;
}

/**
 * Formats numeric song number as 3-digit padded string (e.g. 001, 047, 647).
 */
export function formatSongNumber(num: number): string {
  return String(num).padStart(3, '0');
}

/**
 * Filters songs by category, Kannada alphabet prefix, or multi-field query (title, lyrics, key, number).
 */
export function filterSongs(
  songs: Song[],
  query: string = '',
  alphabet: string = '',
  category: string = 'all'
): Song[] {
  let result = songs;

  // Category filtering
  if (category === 'chords') {
    result = result.filter(s => s.hasChords);
  } else if (category === 'audio') {
    result = result.filter(s => s.hasAudio);
  } else if (category === 'worship') {
    result = result.filter(s => s.hasChords && s.hasAudio);
  } else if (category === 'pdf') {
    result = result.filter(s => s.sourceType === 'pdf');
  } else if (category === 'user_created') {
    result = result.filter(s => s.sourceType === 'user_created');
  }

  // Kannada Alphabet filtering
  if (alphabet) {
    result = result.filter(s => {
      const title = (s.titleKannada || '').trim();
      return title.startsWith(alphabet);
    });
  }

  // Multi-field text query matching
  if (query) {
    const q = query.toLowerCase().trim();
    result = result.filter(s => {
      // Strip HTML tags from lyrics for clean phrase matching
      const cleanLyricsKn = (s.lyricsKannada || '').replace(/<[^>]+>/g, ' ').toLowerCase();
      const cleanLyricsEn = (s.lyricsEnglish || '').replace(/<[^>]+>/g, ' ').toLowerCase();
      const titleKn = (s.titleKannada || '').toLowerCase();
      const titleEn = (s.titleEnglish || '').toLowerCase();
      const key = (s.key || '').toLowerCase();

      const numVal = getSongNumber(s);
      const numStr = String(numVal);
      const paddedNumStr = formatSongNumber(numVal);

      return (
        titleKn.includes(q) ||
        titleEn.includes(q) ||
        cleanLyricsKn.includes(q) ||
        cleanLyricsEn.includes(q) ||
        key.includes(q) ||
        numStr === q ||
        paddedNumStr === q ||
        `#${numStr}` === q ||
        `#${paddedNumStr}` === q
      );
    });
  }

  return result;
}
