import pdfMake from 'pdfmake/build/pdfmake';
import { NOTO_SANS_KANNADA_REGULAR_B64 } from '../assets/kannadaFontBase64';
import { Song } from '../types/song';

// Register embedded Noto Sans Kannada Base64 font into pdfMake
(pdfMake as any).vfs = {
  'NotoSansKannada.ttf': NOTO_SANS_KANNADA_REGULAR_B64
};

(pdfMake as any).fonts = {
  NotoSansKannada: {
    normal: 'NotoSansKannada.ttf',
    bold: 'NotoSansKannada.ttf',
    italics: 'NotoSansKannada.ttf',
    bolditalics: 'NotoSansKannada.ttf'
  }
};

export interface PdfGenerationProgress {
  status: string;
  percentage: number;
  isComplete: boolean;
  error?: string;
  blobUrl?: string;
}

export const PdfSongbookGenerator = {
  async generate647Songbook(
    songs: Song[],
    onProgress: (progress: PdfGenerationProgress) => void,
    options: 'all' | 'kannada_only' | 'kannada_english' | 'chords_only' = 'all'
  ): Promise<void> {

    // 1. Data Integrity Check: Must equal 647 expected songs (or total songs in collection)
    const expectedCount = 647;
    const baseSongs = songs.filter(s => s.sourceType !== 'pdf' || !s.sourceType);
    const countToUse = baseSongs.length >= 647 ? baseSongs.length : songs.length;

    onProgress({
      status: `Verifying song collection integrity (${countToUse} songs)...`,
      percentage: 5,
      isComplete: false
    });

    if (countToUse < expectedCount) {
      const errMsg = `Unable to generate complete songbook. Expected: ${expectedCount}, Found: ${countToUse}. Please check the song database.`;
      onProgress({
        status: errMsg,
        percentage: 0,
        isComplete: false,
        error: errMsg
      });
      return;
    }

    await new Promise(r => setTimeout(r, 100));

    onProgress({
      status: `Building Songbook document structure for ${countToUse} songs...`,
      percentage: 15,
      isComplete: false
    });

    // 2. Build Document Definition
    const docDefinition: any = {
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
          margin: [0, 140, 0, 10]
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
          margin: [0, 0, 0, 8]
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
      header: (currentPage: number) => {
        if (currentPage === 1) return null;
        return {
          text: 'ಕ್ರೈಸ್ತ ಆರಾಧನೆ ಹಾಡುಗಳು | Kannada Christian Songs',
          alignment: 'right',
          fontSize: 8,
          color: '#94a3b8',
          margin: [0, 25, 40, 0]
        };
      },
      footer: (currentPage: number, pageCount: number) => {
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
      { text: `Complete Songbook Collection — ${countToUse} Songs`, style: 'coverBadge' },
      { text: 'Lyrics • Praise • Worship • Chords', style: 'coverBadge' },
      { text: '', pageBreak: 'after' }
    );

    // --- Table of Contents Header ---
    docDefinition.content.push(
      { text: 'Table of Contents (ವಿಷಯ ಸೂಚಿ)', style: 'tocHeader' }
    );

    const tocColumns: any[] = [];
    songs.slice(0, countToUse).forEach((s, idx) => {
      const numStr = s.number ? `${s.number}. ` : `${idx + 1}. `;
      tocColumns.push({
        text: `${numStr}${s.titleKannada} (${s.titleEnglish || ''})`,
        fontSize: 8,
        margin: [0, 2, 0, 2]
      });
    });

    docDefinition.content.push({
      columns: [
        tocColumns.slice(0, Math.ceil(tocColumns.length / 2)),
        tocColumns.slice(Math.ceil(tocColumns.length / 2))
      ],
      columnGap: 15
    });

    docDefinition.content.push({ text: '', pageBreak: 'after' });

    // --- Add Songs Page by Page with Progress ---
    const targetSongs = songs.slice(0, countToUse);
    const cleanHtml = (raw: string) => {
      if (!raw) return '';
      return raw
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/data-chord="([^"]+)"/g, '[$1]')
        .trim();
    };

    for (let i = 0; i < targetSongs.length; i++) {
      const s = targetSongs[i];

      if (i % 50 === 0) {
        const pct = Math.round(20 + (i / targetSongs.length) * 60);
        onProgress({
          status: `Processing song ${i + 1} / ${targetSongs.length}...`,
          percentage: pct,
          isComplete: false
        });
        await new Promise(r => setTimeout(r, 10));
      }

      const numDisplay = s.number ? `#${s.number}` : `#${i + 1}`;
      docDefinition.content.push({ text: numDisplay, style: 'songNumber' });
      docDefinition.content.push({ text: s.titleKannada, style: 'songTitleKn' });

      if (s.titleEnglish && options !== 'kannada_only') {
        docDefinition.content.push({ text: s.titleEnglish, style: 'songTitleEn' });
      }

      let metaStr = '';
      if (s.key) metaStr += `🎸 Key: ${s.key}   `;
      if (s.hasAudio) metaStr += `🎧 Audio Available Online`;
      if (metaStr && options !== 'kannada_only') {
        docDefinition.content.push({ text: metaStr, style: 'metaBadge' });
      }

      const knLyrics = cleanHtml(s.lyricsKannada);
      const enLyrics = cleanHtml(s.lyricsEnglish);

      docDefinition.content.push({ text: knLyrics, style: 'lyricsText' });

      if (enLyrics && options !== 'kannada_only') {
        docDefinition.content.push({ text: 'English / Transliteration:', fontSize: 9, bold: true, color: '#475569', margin: [0, 4, 0, 2] });
        docDefinition.content.push({ text: enLyrics, style: 'lyricsText', color: '#334155' });
      }

      docDefinition.content.push({
        canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 0.5, lineColor: '#e2e8f0' }],
        margin: [0, 0, 0, 15]
      });
    }

    onProgress({
      status: `Rendering PDF binary stream (${countToUse} songs)...`,
      percentage: 90,
      isComplete: false
    });

    // 3. Reliable Asynchronous Blob URL Generation & Download Trigger
    return new Promise<void>((resolve) => {
      try {
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        (pdfDocGenerator as any).getBlob((blob: Blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const fileName = `Kannada-Christian-Songs-${countToUse}-Songbook.pdf`;

          // Explicit anchor click trigger
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
          }, 1000);

          onProgress({
            status: `✓ Songbook Ready! ${countToUse} songs successfully included. Your PDF download should begin automatically.`,
            percentage: 100,
            isComplete: true,
            blobUrl
          });
          resolve();
        });
      } catch (err: any) {
        const errorMsg = err?.message || 'Error compiling PDF stream';
        onProgress({
          status: errorMsg,
          percentage: 0,
          isComplete: false,
          error: errorMsg
        });
        resolve();
      }
    });
  }
};
