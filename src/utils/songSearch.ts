import { Song } from '../types/song';
import { filterSongs, getSongNumber, formatSongNumber } from './searchEngine';

export { getSongNumber, formatSongNumber, filterSongs };

/**
 * Shared search function for Home and All Songs pages.
 * Filters across Kannada title, English title, clean lyrics, key, and song numbers,
 * returning results strictly sorted by song number (001, 002, 003...).
 */
export function searchSongs(
  songs: Song[],
  query: string = '',
  alphabet: string = '',
  category: string = 'all'
): Song[] {
  if (!songs || songs.length === 0) return [];

  // Sort songs by numeric song number before filtering
  const sorted = [...songs].sort((a, b) => getSongNumber(a) - getSongNumber(b));
  return filterSongs(sorted, query, alphabet, category);
}
