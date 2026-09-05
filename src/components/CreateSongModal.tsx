import React, { useState } from 'react';
import { PlusCircle, X, Check, Music, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Song } from '../types/song';

interface CreateSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const CreateSongModal: React.FC<CreateSongModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { allSongs, addUserSong } = useApp();

  const [titleKannada, setTitleKannada] = useState('');
  const [titleEnglish, setTitleEnglish] = useState('');
  const [lyricsKannada, setLyricsKannada] = useState('');
  const [lyricsEnglish, setLyricsEnglish] = useState('');
  const [chords, setChords] = useState('');
  const [songKey, setSongKey] = useState('');
  const [category, setCategory] = useState('general');
  const [errors, setErrors] = useState<{ titleKannada?: string; lyricsKannada?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { titleKannada?: string; lyricsKannada?: string } = {};
    if (!titleKannada.trim()) {
      newErrors.titleKannada = 'Kannada Title is required.';
    }
    if (!lyricsKannada.trim()) {
      newErrors.lyricsKannada = 'Kannada Lyrics text is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Determine highest existing song number to assign next sequential number
    const maxNumber = allSongs.reduce((max, s) => {
      const n = s.number ? Number(s.number) : 0;
      return n > max ? n : max;
    }, allSongs.length);

    const nextNumber = maxNumber + 1;
    const timestamp = Date.now();
    const generatedId = `user-song-${timestamp}`;

    // Clean lyrics into HTML paragraph format compatible with existing parser
    const formatLyricsHtml = (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<p>')) return trimmed;
      const htmlText = trimmed.replace(/\r\n|\r|\n/g, '<br/>\n');
      return `<p>${htmlText}</p>`;
    };

    const newSong: Song = {
      id: generatedId,
      slug: generatedId,
      number: nextNumber,
      titleKannada: titleKannada.trim(),
      titleEnglish: titleEnglish.trim() || titleKannada.trim(),
      key: songKey.trim(),
      lyricsKannada: formatLyricsHtml(lyricsKannada),
      lyricsEnglish: formatLyricsHtml(lyricsEnglish),
      chords: chords.trim(),
      audioUrl: '',
      category: category || 'general',
      tags: ['user_created'],
      originalFile: `user-created-${timestamp}.html`,
      hasAudio: false,
      hasChords: !!chords.trim() || !!songKey.trim(),
      sourceType: 'user_created',
      importedAt: new Date().toISOString()
    };

    addUserSong(newSong);

    // Reset form
    setTitleKannada('');
    setTitleEnglish('');
    setLyricsKannada('');
    setLyricsEnglish('');
    setChords('');
    setSongKey('');
    setCategory('general');
    setErrors({});

    onClose();

    // Navigate to new song page immediately
    onNavigate(`/song/${newSong.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-fade my-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 border border-indigo-700/60 text-amber-400 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Create New Worship Song</h3>
              <p className="text-xs text-slate-400 font-medium">Add a custom song to your local worship library</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kannada Title */}
            <div className="space-y-1">
              <label className="text-slate-300 uppercase tracking-wider block">
                Kannada Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={titleKannada}
                onChange={(e) => setTitleKannada(e.target.value)}
                placeholder="ಉದಾ: ಯೇಸುವೇ ನನ್ನ ಜೀವ"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-kannada text-sm text-white focus:outline-none focus:border-amber-400"
              />
              {errors.titleKannada && <p className="text-rose-400 text-[11px] font-normal">{errors.titleKannada}</p>}
            </div>

            {/* English Title / Transliteration */}
            <div className="space-y-1">
              <label className="text-slate-300 uppercase tracking-wider block">
                English Title / Transliteration
              </label>
              <input
                type="text"
                value={titleEnglish}
                onChange={(e) => setTitleEnglish(e.target.value)}
                placeholder="e.g. Yesuve Nanna Jeeva"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Key */}
            <div className="space-y-1">
              <label className="text-slate-300 uppercase tracking-wider block">
                Musical Key
              </label>
              <input
                type="text"
                value={songKey}
                onChange={(e) => setSongKey(e.target.value)}
                placeholder="e.g. C, Dm, G"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-slate-300 uppercase tracking-wider block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="general">General Worship</option>
                <option value="praise">Praise & Thanksgiving</option>
                <option value="devotional">Devotional</option>
                <option value="chords">Lyrics with Chords</option>
              </select>
            </div>

            {/* Guitar Chords */}
            <div className="space-y-1">
              <label className="text-slate-300 uppercase tracking-wider block">
                Guitar Chords Line
              </label>
              <input
                type="text"
                value={chords}
                onChange={(e) => setChords(e.target.value)}
                placeholder="e.g. C - G - Am - F"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Kannada Lyrics */}
          <div className="space-y-1">
            <label className="text-slate-300 uppercase tracking-wider block">
              Kannada Lyrics Text <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={6}
              value={lyricsKannada}
              onChange={(e) => setLyricsKannada(e.target.value)}
              placeholder="ಕನ್ನಡ ಸಾಲುಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...&#10;ಖಾಲಿ ಸಾಲುಗಳು ನುಡಿಗಳ ಭಾಗಗಳನ್ನು (Stanzas) ವಿಂಗಡಿಸುತ್ತವೆ."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-kannada text-sm text-white leading-relaxed focus:outline-none focus:border-amber-400"
            />
            {errors.lyricsKannada && <p className="text-rose-400 text-[11px] font-normal">{errors.lyricsKannada}</p>}
          </div>

          {/* English Transliteration Lyrics */}
          <div className="space-y-1">
            <label className="text-slate-300 uppercase tracking-wider block">
              English Transliteration / Lyrics (Optional)
            </label>
            <textarea
              rows={4}
              value={lyricsEnglish}
              onChange={(e) => setLyricsEnglish(e.target.value)}
              placeholder="Enter English transliteration lines here..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white leading-relaxed focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-7 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-transform hover:scale-105"
            >
              [ Save Song ]
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
