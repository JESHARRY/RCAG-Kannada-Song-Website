import { Song } from '../types/song';

export const KANNADA_ALPHABET = [
  'ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ',
  'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ', 'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ', 'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ',
  'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ', 'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ', 'ಳ'
];

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
      const titleKn = (s.titleKannada || '').toLowerCase();
      const titleEn = (s.titleEnglish || '').toLowerCase();
      const lyricsKn = (s.lyricsKannada || '').toLowerCase();
      const lyricsEn = (s.lyricsEnglish || '').toLowerCase();
      const key = (s.key || '').toLowerCase();

      return (
        titleKn.includes(q) ||
        titleEn.includes(q) ||
        lyricsKn.includes(q) ||
        lyricsEn.includes(q) ||
        key.includes(q)
      );
    });
  }

  return result;
}
