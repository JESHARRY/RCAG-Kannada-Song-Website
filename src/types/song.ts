export interface Song {
  id: string;
  slug: string;
  number?: number;
  titleKannada: string;
  titleEnglish: string;
  key?: string;
  lyricsKannada: string;
  lyricsEnglish: string;
  chords?: string;
  audioUrl?: string;
  category: string;
  tags: string[];
  originalFile: string;
  hasAudio: boolean;
  hasChords: boolean;
  sourceType?: 'original_app' | 'pdf' | 'user_created';
  sourcePdf?: string;
  sourcePageStart?: number;
  sourcePageEnd?: number;
  sourcePdfSongNumber?: number;
  extractedAt?: string;
  importedAt?: string;
}

export interface ExtractedSong {
  temporaryId: string;
  order: number;
  titleKannada: string;
  titleEnglish?: string;
  lyricsKannada: string;
  lyricsEnglish?: string;
  chords?: string;
  key?: string;
  sourcePdf: string;
  pageStart: number;
  pageEnd: number;
  confidenceScore: number;
  needsReview: boolean;
  status: 'pending' | 'reviewed' | 'duplicate_skip' | 'duplicate_replace' | 'save_new';
  isDuplicate?: boolean;
  matchedSong?: Song;
}

export interface ExtractionHistoryLog {
  id: string;
  pdfName: string;
  date: string;
  totalPages: number;
  detectedCount: number;
  savedCount: number;
}

export interface MigrationReport {
  total_html_files: number;
  non_song_files_count: number;
  expected_song_count: number;
  extracted_song_count: number;
  discrepancies: number;
  songs_with_chords: number;
  songs_with_audio: number;
  duplicate_title_count: number;
  duplicate_examples: Array<{ title: string; file1: string; file2: string }>;
  parsing_warnings: Array<{ file: string; issue: string }>;
}
