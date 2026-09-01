const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');

// 1. Read Base64 fonts or TTF fonts
const regFontPath = path.join(__dirname, '../src/assets/NotoSansKannada-Regular.ttf');
const boldFontPath = path.join(__dirname, '../src/assets/NotoSansKannada-Bold.ttf');

const fonts = {
  NotoSansKannada: {
    normal: regFontPath,
    bold: boldFontPath,
    italics: regFontPath,
    bolditalics: boldFontPath
  }
};

const printer = new PdfPrinter(fonts);

// 2. Read songs
const songsPath = path.join(__dirname, '../src/data/songs.json');
const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));

console.log(`Loaded ${songs.length} songs for PDF generation verification...`);

if (songs.length !== 647) {
  console.error(`DATA INTEGRITY ERROR: Expected 647 songs, found ${songs.length}`);
  process.exit(1);
}

// 3. Build document definition
const docDefinition = {
  pageSize: 'A4',
  pageMargins: [40, 60, 40, 60],
  defaultStyle: {
    font: 'NotoSansKannada',
    fontSize: 10,
    lineHeight: 1.2
  },
  styles: {
    coverTitle: {
      fontSize: 26,
      bold: true,
      alignment: 'center',
      color: '#312e81',
      margin: [0, 150, 0, 10]
    },
    coverSub: {
      fontSize: 16,
      alignment: 'center',
      color: '#4f46e5',
      margin: [0, 0, 0, 30]
    },
    coverBadge: {
      fontSize: 12,
      alignment: 'center',
      color: '#475569',
      margin: [0, 0, 0, 10]
    },
    tocHeader: {
      fontSize: 18,
      bold: true,
      color: '#312e81',
      margin: [0, 20, 0, 15]
    },
    songNumber: {
      fontSize: 14,
      bold: true,
      color: '#4f46e5',
      margin: [0, 15, 0, 2]
    },
    songTitleKn: {
      fontSize: 16,
      bold: true,
      color: '#0f172a',
      margin: [0, 0, 0, 2]
    },
    songTitleEn: {
      fontSize: 11,
      color: '#64748b',
      margin: [0, 0, 0, 8]
    },
    metaBadge: {
      fontSize: 9,
      color: '#0369a1',
      margin: [0, 0, 0, 8]
    },
    lyricsText: {
      fontSize: 11,
      margin: [0, 4, 0, 8]
    }
  },
  header: function(currentPage, pageCount) {
    if (currentPage === 1) return null;
    return {
      text: 'ಕ್ರೈಸ್ತ ಆರಾಧನೆ ಹಾಡುಗಳು | Kannada Christian Songs',
      alignment: 'right',
      fontSize: 8,
      color: '#94a3b8',
      margin: [0, 25, 40, 0]
    };
  },
  footer: function(currentPage, pageCount) {
    if (currentPage === 1) return null;
    return {
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      color: '#94a3b8',
      margin: [0, 20, 0, 0]
    };
  },
  content: []
};

// --- Cover Page ---
docDefinition.content.push(
  { text: 'ಕ್ರೈಸ್ತ ಆರಾಧನೆ ಹಾಡುಗಳು', style: 'coverTitle' },
  { text: 'KANNADA CHRISTIAN SONGS', style: 'coverSub' },
  { text: 'Complete Songbook Collection — 647 Songs', style: 'coverBadge' },
  { text: 'Lyrics • Praise • Worship • Chords', style: 'coverBadge' },
  { text: '', pageBreak: 'after' }
);

// --- Table of Contents Header ---
docDefinition.content.push(
  { text: 'Table of Contents (ವಿಷಯ ಸೂಚಿ)', style: 'tocHeader' }
);

// Add TOC items
const tocColumns = [];
songs.forEach((s, idx) => {
  const numStr = s.number ? `${s.number}. ` : `${idx + 1}. `;
  tocColumns.push({
    text: `${numStr}${s.titleKannada} (${s.titleEnglish || ''})`,
    fontSize: 8,
    margin: [0, 2, 0, 2]
  });
});

docDefinition.content.push({
  columns: [
    tocColumns.slice(0, Math.ceil(songs.length / 2)),
    tocColumns.slice(Math.ceil(songs.length / 2))
  ],
  columnGap: 15
});

docDefinition.content.push({ text: '', pageBreak: 'after' });

// --- Add 647 Songs ---
songs.forEach((s, idx) => {
  const numDisplay = s.number ? `#${s.number}` : `#${idx + 1}`;
  
  // Song Number
  docDefinition.content.push({ text: numDisplay, style: 'songNumber' });
  
  // Titles
  docDefinition.content.push({ text: s.titleKannada, style: 'songTitleKn' });
  if (s.titleEnglish) {
    docDefinition.content.push({ text: s.titleEnglish, style: 'songTitleEn' });
  }

  // Key & Audio notes
  let metaStr = '';
  if (s.key) metaStr += `🎸 Key: ${s.key}   `;
  if (s.hasAudio) metaStr += `🎧 Audio Available Online`;
  if (metaStr) {
    docDefinition.content.push({ text: metaStr, style: 'metaBadge' });
  }

  // Helper to strip HTML tags for clean PDF text
  const clean = (raw) => {
    if (!raw) return '';
    return raw
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/data-chord="([^"]+)"/g, '[$1]')
      .trim();
  };

  const knLyrics = clean(s.lyricsKannada);
  const enLyrics = clean(s.lyricsEnglish);

  docDefinition.content.push({ text: knLyrics, style: 'lyricsText' });

  if (enLyrics) {
    docDefinition.content.push({ text: 'English / Transliteration:', fontSize: 9, bold: true, color: '#475569', margin: [0, 4, 0, 2] });
    docDefinition.content.push({ text: enLyrics, style: 'lyricsText', color: '#334155' });
  }

  // Separator line
  docDefinition.content.push({
    canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 0.5, lineColor: '#e2e8f0' }],
    margin: [0, 0, 0, 15]
  });
});

// Write PDF
const pdfDoc = printer.createPdfKitDocument(docDefinition);
const outputPath = path.join(__dirname, '../Kannada-Christian-Songs-647-Songbook.pdf');
const writeStream = fs.createWriteStream(outputPath);

pdfDoc.pipe(writeStream);
pdfDoc.end();

writeStream.on('finish', () => {
  const bytes = fs.getClientSize ? fs.getClientSize() : fs.statSync(outputPath).size;
  console.log(`PDF Generated successfully! Saved to: ${outputPath} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
});
