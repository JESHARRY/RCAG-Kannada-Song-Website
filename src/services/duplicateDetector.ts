import { Song, ExtractedSong } from '../types/song';

export const DuplicateDetectorService = {
  checkDuplicate(extractedSong: ExtractedSong, existingSongs: Song[]): { isDuplicate: boolean; matchedSong?: Song; matchScore: number } {
    const extractedTitle = this.normalizeText(extractedSong.titleKannada);
    
    for (const song of existingSongs) {
      const existingTitle = this.normalizeText(song.titleKannada);
      
      if (extractedTitle && existingTitle && (extractedTitle === existingTitle || extractedTitle.includes(existingTitle) || existingTitle.includes(extractedTitle))) {
        return {
          isDuplicate: true,
          matchedSong: song,
          matchScore: 90
        };
      }

      if (extractedSong.titleEnglish && song.titleEnglish) {
        const extEn = this.normalizeText(extractedSong.titleEnglish);
        const exEn = this.normalizeText(song.titleEnglish);
        if (extEn && exEn && extEn === exEn) {
          return {
            isDuplicate: true,
            matchedSong: song,
            matchScore: 85
          };
        }
      }
    }

    return {
      isDuplicate: false,
      matchScore: 0
    };
  },

  normalizeText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\u0C80-\u0CFFa-z0-9]/g, '')
      .trim();
  }
};
