/* ==========================================
   PDF Songbook Extraction UI Components
   ========================================== */

const PdfExtractionUI = {
  activeFile: null,

  renderUploadPage() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 2rem; text-align: center;">
          <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            📖 Extract Songs from PDF
          </h1>
          <p style="color: var(--text-secondary);">
            Upload a Kannada Christian songbook PDF and extract <strong>only</strong> the songs contained in that PDF.
          </p>
        </div>

        <div class="pdf-upload-card" id="pdf-drop-zone">
          <div class="upload-icon">📄</div>
          <div class="upload-title">Upload Songbook PDF</div>
          <div class="upload-subtitle">Drag & drop your PDF file here, or click to browse</div>
          
          <input type="file" id="pdf-file-input" accept="application/pdf" style="display: none;">
          <button class="pill-btn active" id="choose-pdf-btn" style="padding: 0.75rem 1.75rem; font-size: 1rem;">
            Choose PDF
          </button>
        </div>

        <div id="file-details-container" style="display: none;">
          <div class="pdf-file-details">
            <div style="display: flex; align-items: center; gap: 0.875rem;">
              <span style="font-size: 1.75rem;">📕</span>
              <div>
                <div style="font-weight: 700;" id="selected-filename">Songbook.pdf</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);" id="selected-filesize">0 MB</div>
              </div>
            </div>
            <button class="icon-btn" id="remove-pdf-btn">Remove</button>
          </div>

          <div style="margin-top: 1.5rem; text-align: center;">
            <button class="pill-btn active" id="start-extract-btn" style="padding: 0.875rem 2.5rem; font-size: 1.1rem; box-shadow: var(--shadow-glow);">
              🚀 Extract Songs
            </button>
          </div>
        </div>

        <div id="extraction-progress-area" style="display: none;"></div>
      </div>
    `;

    this.bindUploadEvents();
  },

  bindUploadEvents() {
    const dropZone = document.getElementById('pdf-drop-zone');
    const fileInput = document.getElementById('pdf-file-input');
    const chooseBtn = document.getElementById('choose-pdf-btn');
    const removeBtn = document.getElementById('remove-pdf-btn');
    const extractBtn = document.getElementById('start-extract-btn');

    chooseBtn?.addEventListener('click', () => fileInput.click());
    dropZone?.addEventListener('click', (e) => {
      if (e.target !== chooseBtn) fileInput.click();
    });

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelected(e.target.files[0]);
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone?.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone?.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length > 0) {
        this.handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    removeBtn?.addEventListener('click', () => {
      this.activeFile = null;
      document.getElementById('file-details-container').style.display = 'none';
      document.getElementById('pdf-drop-zone').style.display = 'block';
    });

    extractBtn?.addEventListener('click', () => {
      if (this.activeFile) {
        this.runExtractionPipeline(this.activeFile);
      }
    });
  },

  handleFileSelected(file) {
    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    this.activeFile = file;

    document.getElementById('selected-filename').textContent = file.name;
    document.getElementById('selected-filesize').textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    document.getElementById('pdf-drop-zone').style.display = 'none';
    document.getElementById('file-details-container').style.display = 'block';
  },

  async runExtractionPipeline(file) {
    document.getElementById('file-details-container').style.display = 'none';
    const progressArea = document.getElementById('extraction-progress-area');
    progressArea.style.display = 'block';

    progressArea.innerHTML = `
      <div class="progress-card">
        <h3 style="margin-bottom: 0.5rem;" id="progress-status-title">Reading PDF...</h3>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="progress-fill"></div>
        </div>
        <p style="color: var(--text-muted); font-size: 0.9rem;" id="progress-status-detail">Initializing PDF.js engine...</p>
      </div>
    `;

    try {
      // 1. Parse PDF pages
      const parsedPdf = await PdfParserService.parsePdf(file, (page, total) => {
        const fill = document.getElementById('progress-fill');
        const detail = document.getElementById('progress-detail');
        if (fill) fill.style.width = Math.round((page / total) * 100) + '%';
        if (detail) detail.textContent = `Processing page ${page} / ${total}`;
      });

      // Check if scanned PDF
      if (parsedPdf.isScanned) {
        progressArea.innerHTML = `
          <div class="alert-banner alert-warning">
            <span style="font-size: 1.5rem;">⚠️</span>
            <div>
              <strong>This PDF appears to be scanned or image-based.</strong>
              <div style="font-size: 0.85rem; margin-top: 0.25rem;">Selectable text could not be extracted directly from this document.</div>
            </div>
          </div>
          <button class="pill-btn active" onclick="OcrService.runOcr()">Use OCR</button>
        `;
        return;
      }

      // 2. Detect Song Boundaries
      document.getElementById('progress-status-title').textContent = 'Detecting song boundaries...';
      const rawBoundaries = SongBoundaryDetector.detectBoundaries(parsedPdf);

      // 3. Extract Songs & Calculate Confidence Scores
      document.getElementById('progress-status-title').textContent = 'Extracting song lyrics & metadata...';
      const extractedSongs = [];

      for (const boundary of rawBoundaries) {
        const song = SongExtractorService.extractSong(boundary);
        const scoreObj = ConfidenceScorer.calculateScore(song);

        song.confidenceScore = scoreObj.confidenceScore;
        song.needsReview = scoreObj.needsReview;

        // 4. Duplicate Check against Store base songs
        const dupCheck = DuplicateDetectorService.checkDuplicate(song, Store.getAllSongs());
        if (dupCheck.isDuplicate) {
          song.isDuplicate = true;
          song.matchedSong = dupCheck.matchedSong;
          song.status = 'duplicate_review';
        }

        extractedSongs.push(song);
      }

      // Save into Store Temporary Workspace
      Store.pdfExtraction = {
        currentPdfName: file.name,
        currentPdfSize: file.size,
        totalPages: parsedPdf.numPages,
        extractedSongs: extractedSongs,
        status: 'complete'
      };

      // 5. Render Results View
      this.renderResultsView();

    } catch (err) {
      console.error('Extraction Error:', err);
      progressArea.innerHTML = `
        <div class="alert-banner alert-danger" style="background-color: var(--danger-light); color: var(--danger); border: 1px solid var(--danger);">
          <span>❌ Error processing PDF: ${err.message}</span>
        </div>
      `;
    }
  },

  renderResultsView() {
    const ext = Store.pdfExtraction;
    const songs = ext.extractedSongs;

    const highConf = songs.filter(s => s.confidenceScore >= 85).length;
    const reviewCount = songs.filter(s => s.needsReview || s.isDuplicate).length;

    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div style="max-width: 1000px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <h1 style="font-size: 1.75rem; font-weight: 700;">Extraction Complete</h1>
            <p style="color: var(--text-muted);">PDF: <strong>${ext.currentPdfName}</strong></p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="icon-btn" onclick="PdfExtractionUI.exportData('json')">📥 Export JSON</button>
            <button class="icon-btn" onclick="PdfExtractionUI.exportData('csv')">📊 Export CSV</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${ext.totalPages}</div>
            <div class="stat-label">Pages Processed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${songs.length}</div>
            <div class="stat-label">Songs Detected</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--success);">${highConf}</div>
            <div class="stat-label">High Confidence</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--warning);">${reviewCount}</div>
            <div class="stat-label">Needs Review</div>
          </div>
        </div>

        <div class="extraction-table-wrapper">
          <table class="extraction-table">
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Song Title</th>
                <th style="width: 100px;">Pages</th>
                <th style="width: 160px;">Status</th>
                <th style="width: 120px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${songs.map((s, idx) => `
                <tr>
                  <td>${s.order}</td>
                  <td>
                    <div style="font-family: var(--font-kannada); font-weight: 600; font-size: 1.05rem;">${s.titleKannada}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${s.titleEnglish || ''}</div>
                  </td>
                  <td>${s.pageStart === s.pageEnd ? s.pageStart : s.pageStart + '–' + s.pageEnd}</td>
                  <td>
                    ${s.isDuplicate ? `
                      <span class="status-badge status-duplicate">⚠ Duplicate</span>
                    ` : s.needsReview ? `
                      <span class="status-badge status-review">⚠ Review (${s.confidenceScore}%)</span>
                    ` : `
                      <span class="status-badge status-good">✓ Good (${s.confidenceScore}%)</span>
                    `}
                  </td>
                  <td style="text-align: right;">
                    <button class="icon-btn" onclick="PdfExtractionUI.openPreviewModal(${idx})">Preview</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <div style="color: var(--text-secondary);">
            Ready to import <strong>${songs.filter(s => s.status !== 'duplicate_skip').length}</strong> songs into your collection.
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button class="icon-btn" onclick="location.hash='#/'">Cancel</button>
            <button class="pill-btn active" onclick="PdfExtractionUI.confirmSaveAll()" style="padding: 0.75rem 2rem;">Confirm & Save</button>
          </div>
        </div>
      </div>

      <!-- Preview Modal Shell -->
      <div class="modal-overlay" id="preview-modal">
        <div class="modal-container">
          <div class="modal-header">
            <h3 id="modal-title">Song Preview</h3>
            <button class="icon-btn" onclick="PdfExtractionUI.closeModal()">✕</button>
          </div>
          <div class="modal-body" id="modal-body"></div>
          <div class="modal-footer" id="modal-footer"></div>
        </div>
      </div>
    `;
  },

  openPreviewModal(index) {
    const song = Store.pdfExtraction.extractedSongs[index];
    if (!song) return;

    const modal = document.getElementById('preview-modal');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    body.innerHTML = `
      <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          Source: <strong>${song.sourcePdf}</strong> — Pages ${song.pageStart === song.pageEnd ? song.pageStart : song.pageStart + '–' + song.pageEnd}
        </div>
        <div style="margin-top: 0.5rem;">
          <label style="font-size: 0.8rem; font-weight: 600;">Kannada Title:</label>
          <input type="text" id="edit-title-kn" value="${song.titleKannada}" class="search-input" style="padding: 0.5rem; margin-top: 0.2rem;">
        </div>
        <div style="margin-top: 0.5rem;">
          <label style="font-size: 0.8rem; font-weight: 600;">English Title:</label>
          <input type="text" id="edit-title-en" value="${song.titleEnglish || ''}" class="search-input" style="padding: 0.5rem; margin-top: 0.2rem;">
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <h4>Kannada Lyrics</h4>
        <div class="lyrics-content kannada" contenteditable="true" id="edit-lyrics-kn" style="margin-top: 0.5rem; padding: 1rem; border: 1px solid var(--border-color);">
          ${song.lyricsKannada}
        </div>
      </div>

      <div>
        <h4>English Transliteration</h4>
        <div class="lyrics-content english" contenteditable="true" id="edit-lyrics-en" style="margin-top: 0.5rem; padding: 1rem; border: 1px solid var(--border-color);">
          ${song.lyricsEnglish || ''}
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="icon-btn" onclick="PdfExtractionUI.deleteSongFromExtraction(${index})" style="color: var(--danger);">🗑 Delete</button>
      <button class="icon-btn" onclick="PdfExtractionUI.markReviewed(${index})">✓ Mark Reviewed</button>
      <button class="pill-btn active" onclick="PdfExtractionUI.savePreviewEdits(${index})">Save Changes</button>
    `;

    modal.classList.add('active');
  },

  closeModal() {
    document.getElementById('preview-modal')?.classList.remove('active');
  },

  savePreviewEdits(index) {
    const song = Store.pdfExtraction.extractedSongs[index];
    if (!song) return;

    song.titleKannada = document.getElementById('edit-title-kn').value.trim();
    song.titleEnglish = document.getElementById('edit-title-en').value.trim();
    song.lyricsKannada = document.getElementById('edit-lyrics-kn').innerHTML;
    song.lyricsEnglish = document.getElementById('edit-lyrics-en').innerHTML;
    song.needsReview = false;

    this.closeModal();
    this.renderResultsView();
  },

  deleteSongFromExtraction(index) {
    Store.pdfExtraction.extractedSongs.splice(index, 1);
    this.closeModal();
    this.renderResultsView();
  },

  markReviewed(index) {
    const song = Store.pdfExtraction.extractedSongs[index];
    if (song) {
      song.needsReview = false;
      song.status = 'reviewed';
    }
    this.closeModal();
    this.renderResultsView();
  },

  confirmSaveAll() {
    const ext = Store.pdfExtraction;
    const songsToSave = ext.extractedSongs.filter(s => s.status !== 'duplicate_skip');

    if (confirm(`You are about to add ${songsToSave.length} songs to your collection. Confirm & Save?`)) {
      SongImporterService.importSongs(songsToSave, {
        pdfName: ext.currentPdfName,
        totalPages: ext.totalPages,
        detectedCount: ext.extractedSongs.length
      });

      alert(`✓ ${songsToSave.length} songs successfully saved to your collection!`);
      location.hash = '#/';
    }
  },

  exportData(format) {
    const songs = Store.pdfExtraction.extractedSongs;
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(songs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `extracted_songs_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (format === 'csv') {
      let csv = "Order,TitleKannada,TitleEnglish,Pages\n";
      songs.forEach(s => {
        csv += `"${s.order}","${s.titleKannada.replace(/"/g, '""')}","${(s.titleEnglish || '').replace(/"/g, '""')}","${s.pageStart}-${s.pageEnd}"\n`;
      });
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `extracted_songs_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  },

  renderHistoryPage() {
    const root = document.getElementById('app-root');
    const history = Store.extractionHistory;

    root.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto;">
        <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem;">📜 Extraction History</h1>
        
        ${history.length === 0 ? `
          <div class="pdf-upload-card">
            <div class="upload-icon">📜</div>
            <div class="upload-title">No Extraction History Yet</div>
            <div class="upload-subtitle">PDF song extractions performed will be logged here.</div>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${history.map(item => `
              <div class="song-card" style="cursor: default;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <h3 style="font-size: 1.1rem; font-weight: 700;">${item.pdfName}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${item.date} — ${item.totalPages} Pages Processed</p>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${item.savedCount} Saved</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${item.detectedCount} Detected</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }
};
