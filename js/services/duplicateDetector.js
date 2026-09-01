/* ==========================================
   Duplicate Detector Service
   ========================================== */

const DuplicateDetectorService = {
  checkDuplicate(extractedSong, existingSongs) {
    const normTitleKn = this.normalize(extractedSong.titleKannada);
    const normTitleEn = this.normalize(extractedSong.titleEnglish);

    for (const existing of existingSongs) {
      const exTitleKn = this.normalize(existing.titleKannada);
      const exTitleEn = this.normalize(existing.titleEnglish);

      // Exact title match
      if ((normTitleKn && normTitleKn === exTitleKn) || (normTitleEn && normTitleEn === exTitleEn)) {
        return {
          isDuplicate: true,
          matchedSong: existing,
          matchType: 'exact_title',
          score: 100
        };
      }

      // Fuzzy title match (Levenshtein similarity)
      if (normTitleKn && exTitleKn && this.similarity(normTitleKn, exTitleKn) > 0.8) {
        return {
          isDuplicate: true,
          matchedSong: existing,
          matchType: 'fuzzy_title',
          score: Math.round(this.similarity(normTitleKn, exTitleKn) * 100)
        };
      }
    }

    return {
      isDuplicate: false,
      matchedSong: null,
      score: 0
    };
  },

  normalize(str) {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^\u0C80-\u0CFFa-z0-9]/g, '')
      .trim();
  },

  similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
  },

  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
};
