import pdfMake from 'pdfmake/build/pdfmake';
import { NOTO_SANS_KANNADA_REGULAR_B64 } from '../assets/kannadaFontBase64';
import { Song } from '../types/song';
import { getSongNumber, formatSongNumber } from '../utils/searchEngine';

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
    try {
      // Ensure target songs are sorted numerically by song number
      const sortedSongs = [...(songs && songs.length > 0 ? songs : [])].sort(
        (a, b) => getSongNumber(a) - getSongNumber(b)
      );
      const targetSongs = sortedSongs;
      const totalCount = targetSongs.length;

      if (totalCount === 0) {
        const errMsg = 'No songs available in catalog to generate songbook.';
        onProgress({ status: errMsg, percentage: 0, isComplete: false, error: errMsg });
        return;
      }

      onProgress({
        status: `Verifying song collection integrity (${totalCount} songs)...`,
        percentage: 5,
        isComplete: false
      });

      await new Promise(r => setTimeout(r, 50));

      onProgress({
        status: `Building Songbook document structure for ${totalCount} songs...`,
        percentage: 15,
        isComplete: false
      });

      // Build Document Definition
      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 50, 40, 50],
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
            color: '#1e1b4b',
            margin: [0, 120, 0, 10]
          },
          coverSub: {
            fontSize: 16,
            alignment: 'center',
            color: '#4338ca',
            margin: [0, 0, 0, 25]
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
            color: '#1e1b4b',
            margin: [0, 15, 0, 12]
          },
          songNumber: {
            fontSize: 13,
            bold: true,
            color: '#4338ca',
            margin: [0, 12, 0, 2]
          },
          songTitleKn: {
            fontSize: 15,
            bold: true,
            color: '#0f172a',
            margin: [0, 0, 0, 2]
          },
          songTitleEn: {
            fontSize: 11,
            color: '#64748b',
            margin: [0, 0, 0, 6]
          },
          metaBadge: {
            fontSize: 9,
            color: '#0369a1',
            margin: [0, 0, 0, 6]
          },
          lyricsText: {
            fontSize: 11,
            margin: [0, 4, 0, 6]
          }
        },
        header: (currentPage: number) => {
          if (currentPage === 1) return null;
          return {
            text: 'ಕ್ರೈಸ್ತ ಆರಾಧನೆ ಹಾಡುಗಳು | Kannada Christian Songs',
            alignment: 'right',
            fontSize: 8,
            color: '#94a3b8',
            margin: [0, 20, 40, 0]
          };
        },
        footer: (currentPage: number, pageCount: number) => {
          if (currentPage === 1) return null;
          return {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'center',
            fontSize: 8,
            color: '#94a3b8',
            margin: [0, 15, 0, 0]
          };
        },
        content: []
      };

      // Cover Page
      docDefinition.content.push(
        { text: 'ಕ್ರೈಸ್ತ ಆರಾಧನೆ ಹಾಡುಗಳು', style: 'coverTitle' },
        { text: 'KANNADA CHRISTIAN SONGS', style: 'coverSub' },
        { text: `Complete Songbook Collection — ${totalCount} Songs`, style: 'coverBadge' },
        { text: 'Lyrics • Praise • Worship • Chords', style: 'coverBadge' },
        { text: '', pageBreak: 'after' }
      );

      // Table of Contents Header
      docDefinition.content.push(
        { text: 'Table of Contents (ವಿಷಯ ಸೂಚಿ)', style: 'tocHeader' }
      );

      // 2-Column Table for Table of Contents (O(N) layout vs recursive multi-page columns)
      const half = Math.ceil(targetSongs.length / 2);
      const leftCol = targetSongs.slice(0, half);
      const rightCol = targetSongs.slice(half);

      const tableBody: any[] = [];
      const rowCount = Math.max(leftCol.length, rightCol.length);

      for (let i = 0; i < rowCount; i++) {
        const sLeft = leftCol[i];
        const sRight = rightCol[i];

        const leftNum = sLeft ? formatSongNumber(getSongNumber(sLeft, i + 1)) : '';
        const leftText = sLeft ? `${leftNum}. ${sLeft.titleKannada}${sLeft.titleEnglish ? ` (${sLeft.titleEnglish})` : ''}` : '';

        const rightNum = sRight ? formatSongNumber(getSongNumber(sRight, half + i + 1)) : '';
        const rightText = sRight ? `${rightNum}. ${sRight.titleKannada}${sRight.titleEnglish ? ` (${sRight.titleEnglish})` : ''}` : '';

        tableBody.push([
          { text: leftText, fontSize: 8, margin: [0, 1, 0, 1] },
          { text: rightText, fontSize: 8, margin: [0, 1, 0, 1] }
        ]);
      }

      docDefinition.content.push({
        table: {
          widths: ['50%', '50%'],
          body: tableBody
        },
        layout: 'noBorders'
      });

      docDefinition.content.push({ text: '', pageBreak: 'after' });

      // Clean HTML utility
      const cleanHtml = (raw: string) => {
        if (!raw) return '';
        return raw
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/data-chord="([^"]+)"/g, '[$1]')
          .trim();
      };

      // Add Songs in Batches of 30 for Non-blocking UI updates
      const BATCH_SIZE = 30;
      for (let i = 0; i < totalCount; i++) {
        const s = targetSongs[i];

        if (i % BATCH_SIZE === 0 || i === totalCount - 1) {
          const pct = Math.round(20 + (i / totalCount) * 65);
          onProgress({
            status: `Processing song ${i + 1} of ${totalCount}...`,
            percentage: pct,
            isComplete: false
          });
          // Yield to main thread for smooth progress bar animation
          await new Promise(r => setTimeout(r, 0));
        }

        const numDisplay = `#${formatSongNumber(getSongNumber(s, i + 1))}`;
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

        // Lightweight Divider
        docDefinition.content.push({
          text: '───────────────────────────────────────────────────────────────────',
          fontSize: 7,
          color: '#cbd5e1',
          margin: [0, 4, 0, 10]
        });
      }

      onProgress({
        status: `Compiling PDF layout for ${totalCount} songs...`,
        percentage: 90,
        isComplete: false
      });

      await new Promise(r => setTimeout(r, 50));

      onProgress({
        status: `Generating downloadable PDF binary stream...`,
        percentage: 95,
        isComplete: false
      });

      // Reliable Asynchronous Blob URL Generation
      return new Promise<void>((resolve) => {
        try {
          const pdfDocGenerator = pdfMake.createPdf(docDefinition);

          (pdfDocGenerator as any).getBlob((blob: Blob) => {
            try {
              const blobUrl = URL.createObjectURL(blob);
              const fileName = `Kannada-Christian-Songs-${totalCount}-Songbook.pdf`;

              // Trigger Anchor Download
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                try { document.body.removeChild(a); } catch {}
              }, 1000);

              onProgress({
                status: `✓ Songbook Complete! ${totalCount} songs compiled. Download started automatically.`,
                percentage: 100,
                isComplete: true,
                blobUrl
              });
              resolve();
            } catch (err: any) {
              const errorMsg = err?.message || 'Error triggering download anchor';
              onProgress({ status: errorMsg, percentage: 0, isComplete: false, error: errorMsg });
              resolve();
            }
          });
        } catch (err: any) {
          const errorMsg = err?.message || 'Error compiling PDF stream';
          onProgress({ status: errorMsg, percentage: 0, isComplete: false, error: errorMsg });
          resolve();
        }
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Unexpected PDF generation error';
      onProgress({ status: errorMsg, percentage: 0, isComplete: false, error: errorMsg });
    }
  }
};
