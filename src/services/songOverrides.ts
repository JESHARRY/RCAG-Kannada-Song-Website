import { Song } from '../types/song';

export const LOCAL_STORAGE_SONG_OVERRIDES_KEY = 'kcs_song_overrides';

export interface SongOverride {
  songId: string;
  lyricsKannada?: string;
  lyricsEnglish?: string;
  titleKannada?: string;
  titleEnglish?: string;
  updatedAt: string;
}

export function getSongOverrides(): Record<string, SongOverride> {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SONG_OVERRIDES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.warn('Error reading song overrides from localStorage:', e);
    return {};
  }
}

export function getSongOverride(songId: string): SongOverride | undefined {
  const overrides = getSongOverrides();
  return overrides[songId];
}

export function saveSongOverride(override: SongOverride): void {
  try {
    const overrides = getSongOverrides();
    overrides[override.songId] = {
      ...override,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_SONG_OVERRIDES_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('kcs_song_overrides_updated', { detail: { songId: override.songId } }));
  } catch (e) {
    console.error('Error saving song override to localStorage:', e);
  }
}

export function removeSongOverride(songId: string): void {
  try {
    const overrides = getSongOverrides();
    if (overrides[songId]) {
      delete overrides[songId];
      localStorage.setItem(LOCAL_STORAGE_SONG_OVERRIDES_KEY, JSON.stringify(overrides));
      window.dispatchEvent(new CustomEvent('kcs_song_overrides_updated', { detail: { songId } }));
    }
  } catch (e) {
    console.error('Error removing song override from localStorage:', e);
  }
}

export function getResolvedSong(song: Song, overrides?: Record<string, SongOverride>): Song {
  const allOverrides = overrides || getSongOverrides();
  const override = allOverrides[song.id];

  if (!override) return song;

  return {
    ...song,
    lyricsKannada: override.lyricsKannada !== undefined ? override.lyricsKannada : song.lyricsKannada,
    lyricsEnglish: override.lyricsEnglish !== undefined ? override.lyricsEnglish : song.lyricsEnglish,
    titleKannada: override.titleKannada !== undefined ? override.titleKannada : song.titleKannada,
    titleEnglish: override.titleEnglish !== undefined ? override.titleEnglish : song.titleEnglish,
  };
}

export function getResolvedSongs(songs: Song[], overrides?: Record<string, SongOverride>): Song[] {
  const allOverrides = overrides || getSongOverrides();
  return songs.map(song => getResolvedSong(song, allOverrides));
}
