/* ==========================================
   SPA Client Router & View Renderer
   ========================================== */

const Router = {
  routes: {},
  currentCategory: 'all',
  currentAlphabet: '',
  currentSearchQuery: '',
  currentTransposition: 0,

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.replace(/^#/, '');

    // Reset active nav link highlighting
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.remove('active');
    });

    if (path === '/' || path === '' || path === '/home') {
      this.highlightNav('home');
      this.renderHomeView();
    } else if (path.startsWith('/category/')) {
      const cat = path.replace('/category/', '');
      this.currentCategory = cat;
      this.highlightNav(cat === 'chords' ? 'chords' : cat === 'audio' ? 'audio' : cat === 'favorites' ? 'favorites' : 'songbook');
      this.renderHomeView();
    } else if (path.startsWith('/song/')) {
      const songId = path.replace('/song/', '');
      this.renderSongDetailView(songId);
    } else if (path === '/extract') {
      this.highlightNav('extract');
      document.getElementById('page-title-display').textContent = '📖 Extract Songs from PDF';
      PdfExtractionUI.renderUploadPage();
    } else if (path === '/extract/history') {
      this.highlightNav('extract-history');
      document.getElementById('page-title-display').textContent = '📜 Extraction History';
      PdfExtractionUI.renderHistoryPage();
    } else if (path === '/about') {
      this.highlightNav('about');
      document.getElementById('page-title-display').textContent = 'About Us';
      this.renderAboutView();
    } else {
      this.renderHomeView();
    }
  },

  highlightNav(routeName) {
    const link = document.querySelector(`.nav-link[data-route="${routeName}"]`);
    if (link) link.classList.add('active');
  },

  renderHomeView() {
    document.getElementById('page-title-display').textContent = 'ಕ್ರೈಸ್ತ ಆರಾಧನೆ ಹಾಡುಗಳು';
    const root = document.getElementById('app-root');

    const songs = Store.getAllSongs();
    const filteredSongs = SearchEngine.filterSongs(songs, this.currentSearchQuery, this.currentAlphabet, this.currentCategory);

    root.innerHTML = `
      <!-- Search Input -->
      <div class="search-box-container">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" id="main-search-input" placeholder="ಇಲ್ಲಿ ಹಾಡುಗಳನ್ನು ಹುಡುಕಿ... (Search Kannada, English, or Lyrics)" value="${this.currentSearchQuery}">
      </div>

      <!-- Kannada Alphabet Bar -->
      <div class="alphabet-bar">
        <button class="alphabet-btn ${this.currentAlphabet === '' ? 'active' : ''}" onclick="Router.setAlphabet('')">ಎಲ್ಲಾ</button>
        ${SearchEngine.kannadaAlphabet.map(char => `
          <button class="alphabet-btn ${this.currentAlphabet === char ? 'active' : ''}" onclick="Router.setAlphabet('${char}')">${char}</button>
        `).join('')}
      </div>

      <!-- Category Filter Pills -->
      <div class="category-pills">
        <button class="pill-btn ${this.currentCategory === 'all' ? 'active' : ''}" onclick="Router.setCategory('all')">📖 All Songs (${songs.length})</button>
        <button class="pill-btn ${this.currentCategory === 'chords' ? 'active' : ''}" onclick="Router.setCategory('chords')">🎸 With Chords (${songs.filter(s => s.hasChords).length})</button>
        <button class="pill-btn ${this.currentCategory === 'audio' ? 'active' : ''}" onclick="Router.setCategory('audio')">🎵 With Audio (${songs.filter(s => s.hasAudio).length})</button>
        <button class="pill-btn ${this.currentCategory === 'favorites' ? 'active' : ''}" onclick="Router.setCategory('favorites')">⭐ Favorites (${Array.from(Store.favorites).length})</button>
      </div>

      <!-- Songs Count Header -->
      <div style="margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-muted);">
        Showing <strong>${filteredSongs.length}</strong> songs
      </div>

      <!-- Songs Cards Grid -->
      <div class="song-grid">
        ${filteredSongs.map(song => `
          <a href="#/song/${song.id}" class="song-card">
            <div>
              <div class="song-card-title-kn">${song.titleKannada}</div>
              <div class="song-card-title-en">${song.titleEnglish || ''}</div>
            </div>

            <div class="song-badges">
              ${song.key ? `<span class="badge badge-key">Key: ${song.key}</span>` : ''}
              ${song.hasAudio ? `<span class="badge badge-audio">🎵 Audio</span>` : ''}
              ${song.sourceType === 'pdf' ? `<span class="badge badge-source">📄 PDF: p.${song.sourcePageStart}-${song.sourcePageEnd}</span>` : ''}
            </div>
          </a>
        `).join('')}
      </div>
    `;

    // Search input listener
    const searchInput = document.getElementById('main-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.currentSearchQuery = e.target.value;
      this.renderHomeView();
      // Keep focus
      const updatedInput = document.getElementById('main-search-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
      }
    });
  },

  setAlphabet(char) {
    this.currentAlphabet = char;
    this.renderHomeView();
  },

  setCategory(cat) {
    this.currentCategory = cat;
    window.location.hash = `#/category/${cat}`;
  },

  renderSongDetailView(id) {
    const song = Store.getSongById(id);
    if (!song) {
      document.getElementById('app-root').innerHTML = `<h2>Song not found</h2>`;
      return;
    }

    document.getElementById('page-title-display').textContent = song.titleKannada;
    this.currentTransposition = 0;
    const isFav = Store.isFavorite(song.id);

    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div style="max-width: 850px; margin: 0 auto;">
        <!-- Header & Toolbar -->
        <div class="song-detail-header">
          <div class="song-detail-title-kn">${song.titleKannada}</div>
          <div class="song-detail-title-en">${song.titleEnglish || ''}</div>

          ${song.sourceType === 'pdf' ? `
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; padding: 0.5rem; background: var(--primary-light); border-radius: var(--radius-sm);">
              📄 <strong>Source PDF:</strong> ${song.sourcePdf} (Pages ${song.sourcePageStart}–${song.sourcePageEnd})
            </div>
          ` : ''}

          <div class="song-toolbar">
            <div class="view-tabs">
              <button class="tab-btn active" id="tab-kn-btn" onclick="Router.switchSongTab('kn')">ಕನ್ನಡ</button>
              <button class="tab-btn" id="tab-en-btn" onclick="Router.switchSongTab('en')">English</button>
            </div>

            <div class="tool-actions">
              ${song.hasChords ? `
                <div class="transposer-box">
                  <span>Key: <strong id="current-key-display">${song.key || 'Dm'}</strong></span>
                  <button class="transposer-btn" onclick="Router.transpose(-1)">-</button>
                  <button class="transposer-btn" onclick="Router.transpose(1)">+</button>
                </div>
              ` : ''}

              ${song.hasAudio ? `
                <button class="icon-btn" onclick="Player.playSong(Store.getSongById('${song.id}'))">
                  ▶ Play
                </button>
              ` : ''}

              <button class="icon-btn" onclick="Router.toggleFav('${song.id}')" id="fav-btn">
                ${isFav ? '⭐ Favorited' : '☆ Favorite'}
              </button>
              <button class="icon-btn" onclick="Router.copyLyrics('${song.id}')">📋 Copy</button>
              <button class="icon-btn" onclick="Router.shareSong('${song.id}')">🔗 Share</button>
            </div>
          </div>
        </div>

        <!-- Lyrics Container -->
        <div class="lyrics-content kannada" id="song-lyrics-container">
          ${song.lyricsKannada}
        </div>
      </div>
    `;
  },

  switchSongTab(lang) {
    const songId = window.location.hash.replace('#/song/', '');
    const song = Store.getSongById(songId);
    if (!song) return;

    const container = document.getElementById('song-lyrics-container');
    const knBtn = document.getElementById('tab-kn-btn');
    const enBtn = document.getElementById('tab-en-btn');

    if (lang === 'kn') {
      container.className = 'lyrics-content kannada';
      container.innerHTML = song.lyricsKannada;
      knBtn.classList.add('active');
      enBtn.classList.remove('active');
    } else {
      container.className = 'lyrics-content english';
      container.innerHTML = song.lyricsEnglish || '<p>No English transliteration available.</p>';
      enBtn.classList.add('active');
      knBtn.classList.remove('active');
    }

    if (this.currentTransposition !== 0) {
      ChordTransposer.transposeHtml(container, this.currentTransposition);
    }
  },

  transpose(semitones) {
    this.currentTransposition += semitones;
    const container = document.getElementById('song-lyrics-container');
    ChordTransposer.transposeHtml(container, this.currentTransposition);
  },

  toggleFav(id) {
    const isFav = Store.toggleFavorite(id);
    const btn = document.getElementById('fav-btn');
    if (btn) {
      btn.textContent = isFav ? '⭐ Favorited' : '☆ Favorite';
    }
  },

  copyLyrics(id) {
    const song = Store.getSongById(id);
    if (!song) return;
    const text = `${song.titleKannada}\n${song.titleEnglish}\n\n` + document.getElementById('song-lyrics-container').innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert('✓ Lyrics copied to clipboard!');
    });
  },

  shareSong(id) {
    const song = Store.getSongById(id);
    if (!song) return;
    if (navigator.share) {
      navigator.share({
        title: song.titleKannada,
        text: `Check out ${song.titleKannada} on Kannada Christian Songs!`,
        url: window.location.href
      });
    } else {
      this.copyLyrics(id);
    }
  },

  renderAboutView() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; background: var(--bg-card); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--primary);">King's Apps</h2>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Founded by Bro Raju and Sharon Shetty</p>

        <p style="margin-bottom: 1.5rem;">We are a team of spiritually elevated believers who got burden from the Lord to help His drudge through our God given talents and software skills.</p>

        <h3 style="margin-bottom: 0.5rem;">Our Vision</h3>
        <blockquote style="padding: 1rem; background: var(--primary-light); border-left: 4px solid var(--primary); border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
          "Carry each other’s burdens, and in this way you will fulfill the LAW OF CHRIST" <br>
          <span style="font-size: 0.85rem; color: var(--text-muted);">- Galatians 6:2</span>
        </blockquote>

        <h3 style="margin-bottom: 0.5rem;">Our Mission</h3>
        <p>Our mission is to inflate this cyber world with Word of God and win souls for his kingdom by sharing the gospel online.</p>
      </div>
    `;
  }
};
