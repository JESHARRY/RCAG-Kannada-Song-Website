/* ==========================================
   Search & Filter Engine
   ========================================== */

const SearchEngine = {
  // Kannada Alphabet array
  kannadaAlphabet: [
    'ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ',
    'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ', 'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ', 'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ',
    'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ', 'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ', 'ಳ'
  ],

  filterSongs(songs, query = '', alphabet = '', category = 'all') {
    let result = songs;

    // 1. Category Filter
    if (category === 'chords') {
      result = result.filter(s => s.hasChords);
    } else if (category === 'audio') {
      result = result.filter(s => s.hasAudio);
    } else if (category === 'favorites') {
      result = result.filter(s => Store.isFavorite(s.id));
    }

    // 2. Alphabet Filter (Kannada first character matching)
    if (alphabet) {
      result = result.filter(s => {
        const title = (s.titleKannada || '').trim();
        return title.startsWith(alphabet);
      });
    }

    // 3. Text Query Filter (Kannada, English, or Lyrics)
    if (query) {
      const q = query.toLowerCase().trim();
      result = result.filter(s => {
        const titleKn = (s.titleKannada || '').toLowerCase();
        const titleEn = (s.titleEnglish || '').toLowerCase();
        const lyricsKn = (s.lyricsKannada || '').toLowerCase();
        const lyricsEn = (s.lyricsEnglish || '').toLowerCase();
        
        return titleKn.includes(q) || 
               titleEn.includes(q) || 
               lyricsKn.includes(q) || 
               lyricsEn.includes(q);
      });
    }

    return result;
  }
};
