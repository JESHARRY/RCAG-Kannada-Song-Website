export const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const FLAT_SCALE = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function transposeNote(note: string, semitones: number): string {
  if (!note) return note;

  let index = CHROMATIC_SCALE.indexOf(note);
  if (index === -1) {
    index = FLAT_SCALE.indexOf(note);
  }
  if (index === -1) return note;

  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  return CHROMATIC_SCALE[newIndex];
}

export function transposeChordString(chordStr: string, semitones: number): string {
  return chordStr.replace(/([A-G][#b]?)/g, (match) => transposeNote(match, semitones));
}
