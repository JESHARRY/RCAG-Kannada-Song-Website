/* ==========================================
   State Manager (Store)
   ========================================== */

const Store = {
  songs: [],
  importedSongs: [],
  favorites: new Set(),
  theme: localStorage.getItem('kcs_theme') || 'light',
  
  // PDF Extraction Temporary Workspace State
  pdfExtraction: {
    currentPdfName: '',
    currentPdfSize: 0,
    totalPages: 0,
    extractedSongs: [], // Array of ExtractedSong items
    status: 'idle', // 'idle' | 'reading' | 'extracting' | 'complete'
    progress: 0,
    needsReviewCount: 0
  },
  
  // Extraction History
  extractionHistory: [],

  async init() {
    // 1. Load base 647 songs from data/songs.json
    try {
      const res = await fetch('data/songs.json');
      if (res.ok) {
        this.songs = await res.json();
      }
    } catch (e) {
      console.error('Failed to load songs.json:', e);
      this.songs = [];
    }

    // 2. Load custom imported songs saved by user
    try {
      const custom = localStorage.getItem('kcs_imported_songs');
      if (custom) {
        this.importedSongs = JSON.parse(custom);
      }
    } catch (e) {
      this.importedSongs = [];
    }

    // 3. Load Favorites
    try {
      const favs = localStorage.getItem('kcs_favorites');
      if (favs) {
        this.favorites = new Set(JSON.parse(favs));
      }
    } catch (e) {
      this.favorites = new Set();
    }

    // 4. Load Extraction History
    try {
      const history = localStorage.getItem('kcs_extraction_history');
      if (history) {
        this.extractionHistory = JSON.parse(history);
      }
    } catch (e) {
      this.extractionHistory = [];
    }

    // Apply Theme
    document.documentElement.setAttribute('data-theme', this.theme);
  },

  getAllSongs() {
    return [...this.songs, ...this.importedSongs];
  },

  getSongById(id) {
    return this.getAllSongs().find(s => s.id === id);
  },

  toggleFavorite(id) {
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
    } else {
      this.favorites.add(id);
    }
    localStorage.setItem('kcs_favorites', JSON.stringify(Array.from(this.favorites)));
    return this.favorites.has(id);
  },

  isFavorite(id) {
    return this.favorites.has(id);
  },

  setTheme(newTheme) {
    this.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('kcs_theme', newTheme);
  },

  saveImportedSongs(newSongs, pdfMetadata) {
    // Append new songs to imported array
    this.importedSongs.push(...newSongs);
    localStorage.setItem('kcs_imported_songs', JSON.stringify(this.importedSongs));

    // Add to extraction history log
    const logEntry = {
      id: 'hist_' + Date.now(),
      pdfName: pdfMetadata.pdfName,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      totalPages: pdfMetadata.totalPages,
      detectedCount: pdfMetadata.detectedCount,
      savedCount: newSongs.length
    };

    this.extractionHistory.unshift(logEntry);
    localStorage.setItem('kcs_extraction_history', JSON.stringify(this.extractionHistory));
  }
};
