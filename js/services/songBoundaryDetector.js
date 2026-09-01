/* ==========================================
   Song Boundary Detector Service (Strict)
   ========================================== */

const SongBoundaryDetector = {
  detectBoundaries(parsedPdf) {
    const rawSongs = [];
    const pages = parsedPdf.pages;

    let currentSong = null;
    let songCounter = 1;

    for (const page of pages) {
      const pageNum = page.pageNumber;
      const lines = page.lines;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const isTitle = this.isTitleHeader(line, lines, i, currentSong);

        if (isTitle) {
          if (currentSong && currentSong.lines.length > 0) {
            currentSong.pageEnd = pageNum;
            rawSongs.push(currentSong);
          }

          currentSong = {
            order: songCounter++,
            titleHeader: line,
            lines: [],
            pageStart: pageNum,
            pageEnd: pageNum,
            sourcePdf: parsedPdf.pdfName
          };
        } else {
          if (!currentSong) {
            currentSong = {
              order: songCounter++,
              titleHeader: line,
              lines: [],
              pageStart: pageNum,
              pageEnd: pageNum,
              sourcePdf: parsedPdf.pdfName
            };
          } else {
            currentSong.lines.push(line);
            currentSong.pageEnd = pageNum;
          }
        }
      }
    }

    if (currentSong && currentSong.lines.length > 0) {
      rawSongs.push(currentSong);
    }

    return rawSongs;
  },

  isTitleHeader(line, lines, index, currentSong) {
    // Explicit Numbered Heading always starts a new song: e.g. "1. ", "18. ", "102. "
    if (/^\d{1,4}\.\s+[\u0C80-\u0CFF\w]/i.test(line)) {
      return true;
    }

    // If no song has started yet, the first non-empty line is the title
    if (!currentSong) {
      return true;
    }

    return false;
  }
};
