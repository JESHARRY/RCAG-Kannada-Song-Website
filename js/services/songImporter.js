/* ==========================================
   Song Importer Service
   ========================================== */

const SongImporterService = {
  importSongs(extractedSongs, pdfMetadata) {
    const timestamp = new Date().toISOString();
    const importedList = [];

    for (const item of extractedSongs) {
      if (item.status === 'duplicate_skip') continue;

      const slug = (item.titleEnglish || item.titleKannada)
        .toLowerCase()
        .replace(/[^\u0C80-\u0CFFa-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || ('pdf-song-' + Date.now() + '-' + Math.floor(Math.random() * 100));

      const newSong = {
        id: slug,
        originalFilename: item.sourcePdf,
        number: item.order,
        titleKannada: item.titleKannada,
        titleEnglish: item.titleEnglish || '',
        key: item.key || '',
        hasChords: item.hasChords || false,
        hasAudio: false,
        audioUrl: '',
        lyricsKannada: item.lyricsKannada,
        lyricsEnglish: item.lyricsEnglish || '',
        
        // Required Source Metadata
        sourceType: 'pdf',
        sourcePdf: item.sourcePdf,
        sourcePageStart: item.pageStart,
        sourcePageEnd: item.pageEnd,
        extractedAt: timestamp
      };

      importedList.push(newSong);
    }

    // Persist to Store
    Store.saveImportedSongs(importedList, {
      pdfName: pdfMetadata.pdfName,
      totalPages: pdfMetadata.totalPages,
      detectedCount: pdfMetadata.detectedCount
    });

    return importedList;
  }
};
