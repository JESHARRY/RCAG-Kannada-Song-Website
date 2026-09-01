/* ==========================================
   Confidence Scorer Service
   ========================================== */

const ConfidenceScorer = {
  calculateScore(song) {
    let score = 0;

    // 1. Title Quality (Max 30)
    if (song.titleKannada && song.titleKannada !== 'Untitled Song') {
      score += 20;
    }
    if (song.titleEnglish) {
      score += 10;
    }

    // 2. Lyrics Content Quality (Max 30)
    const knLines = (song.lyricsKannada || '').split('</p>').length - 1;
    if (knLines >= 4) {
      score += 30;
    } else if (knLines >= 1) {
      score += 15;
    }

    // 3. Kannada Unicode Validation (Max 20)
    if (/[\u0C80-\u0CFF]/.test(song.lyricsKannada || song.titleKannada)) {
      score += 20;
    }

    // 4. Page Range & Structure (Max 20)
    if (song.pageStart > 0 && song.pageEnd >= song.pageStart) {
      score += 20;
    }

    // Cap between 0 and 100
    score = Math.min(100, Math.max(0, score));

    const needsReview = score < 85;

    return {
      confidenceScore: score,
      needsReview: needsReview
    };
  }
};
