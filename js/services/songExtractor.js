/* ==========================================
   Song Extractor Service
   ========================================== */

const SongExtractorService = {
  extractSong(rawBoundary) {
    const lines = rawBoundary.lines;
    const titleHeader = rawBoundary.titleHeader || '';

    // Title parsing
    let titleKannada = '';
    let titleEnglish = '';
    let key = '';

    // Check if title header has Kannada
    if (/[\u0C80-\u0CFF]/.test(titleHeader)) {
      titleKannada = titleHeader;
    } else {
      titleEnglish = titleHeader;
    }

    const kannadaLines = [];
    const englishLines = [];
    const chordLines = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Check Key signature line
      const keyMatch = line.match(/key\s*-\s*([a-g0-9#m\s/]+)/i);
      if (keyMatch) {
        key = keyMatch[1].strip ? keyMatch[1].strip() : keyMatch[1].trim();
        continue;
      }

      // Check title English if not set yet
      if (!titleEnglish && /^[a-z0-9\s-]{4,60}$/i.test(line) && !/[\u0C80-\u0CFF]/.test(line)) {
        titleEnglish = line;
        continue;
      }

      // Separate Kannada script lines vs English transliteration
      if (/[\u0C80-\u0CFF]/.test(line)) {
        kannadaLines.push(line);
      } else {
        englishLines.push(line);
      }
    }

    if (!titleKannada && kannadaLines.length > 0) {
      titleKannada = kannadaLines[0];
    }
    if (!titleEnglish && englishLines.length > 0) {
      titleEnglish = englishLines[0];
    }

    const lyricsKannada = kannadaLines.map(l => `<p>${this.formatLineWithChords(l)}</p>`).join('\n');
    const lyricsEnglish = englishLines.map(l => `<p>${this.formatLineWithChords(l)}</p>`).join('\n');
    const hasChords = /data-chord=|\{[A-G]/.test(lyricsKannada) || /data-chord=|\{[A-G]/.test(lyricsEnglish);

    return {
      temporaryId: 'temp_pdf_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      order: rawBoundary.order,
      titleKannada: titleKannada || 'Untitled Song',
      titleEnglish: titleEnglish || '',
      lyricsKannada: lyricsKannada,
      lyricsEnglish: lyricsEnglish,
      key: key,
      hasChords: hasChords,
      sourcePdf: rawBoundary.sourcePdf,
      pageStart: rawBoundary.pageStart,
      pageEnd: rawBoundary.pageEnd,
      status: 'pending'
    };
  },

  formatLineWithChords(line) {
    // Converts inline bracket chords like {Dm}Text to <span data-chord="Dm">Text</span>
    return line.replace(/\{([A-Ga-g0-9#m]+)\}/g, '<span data-chord="$1"></span>');
  }
};
