/* ==========================================
   Interactive Chord Transposer Engine
   ========================================== */

const ChordTransposer = {
  chromaticScale: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  flatScale: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],

  transposeNote(note, semitones) {
    if (!note) return note;

    let index = this.chromaticScale.indexOf(note);
    if (index === -1) {
      index = this.flatScale.indexOf(note);
    }
    if (index === -1) return note;

    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    return this.chromaticScale[newIndex];
  },

  transposeChordString(chordStr, semitones) {
    // Regex matching chord root note (e.g., C#, Dm, F#m7, Bb/D)
    return chordStr.replace(/([A-G][#b]?)/g, (match) => {
      return this.transposeNote(match, semitones);
    });
  },

  transposeHtml(containerElement, semitones) {
    if (!containerElement) return;
    const chordElements = containerElement.querySelectorAll('[data-chord]');
    chordElements.forEach(el => {
      const orig = el.getAttribute('data-original-chord') || el.getAttribute('data-chord');
      if (!el.getAttribute('data-original-chord')) {
        el.setAttribute('data-original-chord', orig);
      }
      const newChord = this.transposeChordString(orig, semitones);
      el.setAttribute('data-chord', newChord);
    });
  }
};
