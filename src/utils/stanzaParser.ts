import { Song } from '../types/song';
import { PresentationSlide } from '../types/presentation';

/**
 * Parses raw song HTML/text lyrics into semantic presentation slides.
 * Auto-detects Title Slide, Verse 1, Chorus, Verse 2, Chorus, Bridge, Ending.
 */
export function parseSongToSlides(song: Song): PresentationSlide[] {
  const slides: PresentationSlide[] = [];

  // 1. Title Slide
  slides.push({
    id: `slide-title-${song.id}`,
    type: 'title',
    songId: song.id,
    songTitleKn: song.titleKannada,
    songTitleEn: song.titleEnglish,
    title: song.number ? `Song #${song.number}` : 'Song Presentation',
    text: `${song.titleKannada}${song.titleEnglish ? '\n' + song.titleEnglish : ''}`,
    notes: `Song: ${song.titleKannada} (${song.titleEnglish || ''})\nKey: ${song.key || 'N/A'}`
  });

  const rawHtml = song.lyricsKannada || song.lyricsEnglish || '';
  if (!rawHtml.trim()) {
    slides.push({
      id: `slide-empty-${song.id}`,
      type: 'lyrics',
      songId: song.id,
      songTitleKn: song.titleKannada,
      songTitleEn: song.titleEnglish,
      title: 'Lyrics',
      text: 'Lyrics not available'
    });
    return slides;
  }

  // 2. Extract paragraph blocks from HTML
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = pRegex.exec(rawHtml)) !== null) {
    if (match[1] && match[1].trim()) {
      paragraphs.push(match[1].trim());
    }
  }

  // Fallback if no <p> tags found
  if (paragraphs.length === 0) {
    const rawCleaned = rawHtml.replace(/<br\s*\/?>/gi, '\n');
    const blocks = rawCleaned.split(/\n\s*\n/).filter(b => b.trim());
    paragraphs.push(...blocks);
  }

  let verseCounter = 1;
  let chorusText = '';

  paragraphs.forEach((p, idx) => {
    // Extract plain text for presentation display, keeping line breaks
    let cleanText = p
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '')
      .replace(/<span[^>]*data-chord="([^"]+)"[^>]*>(.*?)<\/span>/gi, '$2') // strip chord tags for presentation lyric text unless chords enabled
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    if (!cleanText) return;

    // Detect chords string if available
    const chordMatches: string[] = [];
    const chordRegex = /data-chord="([^"]+)"/g;
    let cMatch: RegExpExecArray | null;
    while ((cMatch = chordRegex.exec(p)) !== null) {
      chordMatches.push(cMatch[1]);
    }
    const chordsSummary = chordMatches.length > 0 ? Array.from(new Set(chordMatches)).join('  ') : undefined;

    let slideType: PresentationSlide['type'] = 'lyrics';
    let slideTitle = `Verse ${verseCounter}`;

    // Determine Stanza Type and Label
    const firstLine = cleanText.split('\n')[0] || '';
    if (/^\d+[\.\)]/.test(firstLine)) {
      // Line starts with 1. or 2)
      const numMatch = firstLine.match(/^(\d+)[\.\)]/);
      if (numMatch) {
        slideTitle = `Verse ${numMatch[1]}`;
        cleanText = cleanText.replace(/^\d+[\.\)]\s*/, '');
      }
      verseCounter++;
    } else if (idx === 0) {
      // First stanza without number is often Chorus / Refrain or Main Verse
      slideType = 'chorus';
      slideTitle = 'Chorus / Refrain';
      chorusText = cleanText;
    } else if (/chorus|refrain|ಪಲ್ಲವಿ|ಅನುಪಲ್ಲವಿ/i.test(firstLine)) {
      slideType = 'chorus';
      slideTitle = 'Chorus';
      chorusText = cleanText;
    } else if (/bridge|ಬ್ರಿಡ್ಜ್/i.test(firstLine)) {
      slideType = 'lyrics';
      slideTitle = 'Bridge';
    } else if (/ending|ಕೊನೆ/i.test(firstLine)) {
      slideType = 'lyrics';
      slideTitle = 'Ending';
    } else {
      slideTitle = `Verse ${verseCounter}`;
      verseCounter++;
    }

    slides.push({
      id: `slide-${song.id}-${idx + 1}`,
      type: slideType,
      songId: song.id,
      songTitleKn: song.titleKannada,
      songTitleEn: song.titleEnglish,
      title: slideTitle,
      text: cleanText,
      chords: chordsSummary
    });
  });

  return slides;
}

/**
 * Parses multiple songs into a continuous multi-song Worship Set slide deck.
 */
export function parseWorshipSetToSlides(songs: Song[]): PresentationSlide[] {
  const allSlides: PresentationSlide[] = [];
  songs.forEach((song, idx) => {
    const songSlides = parseSongToSlides(song);
    allSlides.push(...songSlides);

    // Add a blank transition slide between songs (except after the last song)
    if (idx < songs.length - 1) {
      allSlides.push({
        id: `slide-blank-after-${song.id}`,
        type: 'blank',
        title: 'Transition',
        text: ''
      });
    }
  });
  return allSlides;
}
