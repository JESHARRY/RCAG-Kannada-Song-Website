import React, { useState, useEffect, useRef } from 'react';
import { Star, Play, Copy, Share2, Guitar, Type, FileText, Tv, Edit3, Save, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { transposeChordString } from '../utils/chordTransposer';
import { getSongNumber, formatSongNumber } from '../utils/searchEngine';
import { SongDetailGrapevine } from '../components/GrapevineSystem';

interface SongDetailPageProps {
  songId: string;
  onNavigate: (path: string) => void;
}

export const SongDetailPage: React.FC<SongDetailPageProps> = ({ songId, onNavigate }) => {
  const {
    allSongs,
    isFavorite,
    toggleFavorite,
    addRecentSong,
    playAudioSong,
    fontSize,
    setFontSize,
    saveSongOverride,
    removeSongOverride,
    hasSongOverride
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kannada' | 'english'>('kannada');
  const [semitones, setSemitones] = useState(0);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyricsKannada, setEditedLyricsKannada] = useState('');
  const [editedLyricsEnglish, setEditedLyricsEnglish] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | null>(null);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  const song = allSongs.find(s => s.id === songId);

  useEffect(() => {
    if (songId) {
      addRecentSong(songId);
      window.scrollTo(0, 0);
    }
  }, [songId]);

  useEffect(() => {
    if (song) {
      setEditedLyricsKannada(song.lyricsKannada || '');
      setEditedLyricsEnglish(song.lyricsEnglish || '');
      setIsDirty(false);
      setSaveStatus(null);
    }
  }, [song?.id, song?.lyricsKannada, song?.lyricsEnglish]);

  if (!song) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Song Not Found</h2>
        <button onClick={() => onNavigate('/')} className="text-indigo-400 font-semibold hover:underline">
          Return to Home Page
        </button>
      </div>
    );
  }

  const fav = isFavorite(song.id);
  const isOverridden = hasSongOverride(song.id);

  // Save lyric override
  const handleSaveLyrics = (kannadaVal?: string, englishVal?: string) => {
    const kText = kannadaVal !== undefined ? kannadaVal : editedLyricsKannada;
    const eText = englishVal !== undefined ? englishVal : editedLyricsEnglish;

    // Clean extra blank lines while keeping line structure
    const cleanedKText = kText
      .split('\n')
      .map(line => line.trim())
      .filter((line, idx, arr) => line !== '' || (arr[idx - 1] !== '' && idx > 0)) // preserve single blank lines between stanzas, remove multiple blank lines
      .join('\n');

    saveSongOverride({
      songId: song.id,
      lyricsKannada: cleanedKText,
      lyricsEnglish: eText,
      titleKannada: song.titleKannada,
      titleEnglish: song.titleEnglish,
      updatedAt: new Date().toISOString()
    });

    setIsDirty(false);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Handle textarea text change with debounced autosave
  const handleLyricsChange = (val: string, lang: 'kannada' | 'english') => {
    if (lang === 'kannada') setEditedLyricsKannada(val);
    else setEditedLyricsEnglish(val);

    setIsDirty(true);
    setSaveStatus('unsaved');

    // Debounced autosave (800ms)
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      handleSaveLyrics(lang === 'kannada' ? val : editedLyricsKannada, lang === 'english' ? val : editedLyricsEnglish);
    }, 800);
  };

  // Restore original lyrics
  const handleRestoreOriginal = () => {
    if (confirm('Are you sure you want to restore the original lyrics for this song? Your custom edits will be removed.')) {
      removeSongOverride(song.id);
      setIsEditing(false);
      setIsDirty(false);
      setSaveStatus(null);
    }
  };

  const handleCopy = () => {
    const text = `${song.titleKannada}\n${song.titleEnglish}\n\n` +
      (activeTab === 'kannada' ? song.lyricsKannada : song.lyricsEnglish).replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(text).then(() => {
      alert('✓ Lyrics copied to clipboard!');
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: song.titleKannada,
        text: `Check out ${song.titleKannada} on Kannada Christian Songs!`,
        url: window.location.href,
      });
    } else {
      handleCopy();
    }
  };

  // Font size classes
  const fontSizeClass =
    fontSize === 'sm'
      ? 'text-base leading-relaxed'
      : fontSize === 'base'
      ? 'text-lg leading-relaxed'
      : fontSize === 'lg'
      ? 'text-xl leading-loose'
      : 'text-2xl leading-loose';

  // Process raw lyrics to apply transposed chords
  const renderLyrics = (rawHtml: string) => {
    if (!rawHtml) return '<p>No content available.</p>';
    if (semitones === 0) return rawHtml;

    return rawHtml.replace(/data-chord="([^"]+)"/g, (_, chord) => {
      const transposed = transposeChordString(chord, semitones);
      return `data-chord="${transposed}"`;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-20 font-sans anim-page-entrance">
      {/* Header Container */}
      <div className="bg-church-surface border border-church-border/80 rounded-xl p-5 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Organic Biblical Grapevine Header Accent */}
        <SongDetailGrapevine />

        {/* Soft Heavenly Background Light Bloom */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        {/* Title Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-[#0d0f14] border border-slate-800 text-amber-400 tracking-wide">
              #{formatSongNumber(getSongNumber(song))}
            </span>
            {song.category && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-400 uppercase">
                {song.category}
              </span>
            )}
            {isOverridden && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1">
                <Check className="w-3 h-3 text-amber-400" />
                <span>Custom Edited Lyrics</span>
              </span>
            )}
          </div>

          <h1 className="font-kannada font-bold text-2xl sm:text-4xl text-white leading-tight mb-1">
            {song.titleKannada}
          </h1>

          {song.titleEnglish && (
            <p className="text-sm sm:text-base text-slate-400 font-normal">
              {song.titleEnglish}
            </p>
          )}
        </div>

        {/* Source PDF Banner if applicable */}
        {song.sourceType === 'pdf' && (
          <div className="flex items-center gap-2 text-xs text-emerald-300 bg-slate-900 border border-slate-800 p-3 rounded-lg mb-4">
            <FileText className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Extracted from PDF: <strong>{song.sourcePdf}</strong> (Pages {song.sourcePageStart}–{song.sourcePageEnd})</span>
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate(`/presentation/song/${song.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-xs"
            >
              <Tv className="w-4 h-4" />
              <span>Present Song</span>
            </button>

            <button
              onClick={() => setIsEditing(prev => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs border transition-colors ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Close Editor' : 'Edit Lyrics'}</span>
            </button>

            {isOverridden && (
              <button
                onClick={handleRestoreOriginal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 text-xs font-bold transition-colors"
                title="Restore original static lyrics"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restore Original</span>
              </button>
            )}
          </div>

          {/* Language Tabs */}
          <div className="flex bg-[#0d0f14] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('kannada')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold font-kannada transition-colors ${
                activeTab === 'kannada'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => setActiveTab('english')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'english'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* Additional Controls */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Chord Transposer if chords exist */}
            {song.hasChords && (
              <div className="flex items-center gap-1.5 bg-indigo-950/60 px-3 py-1.5 rounded-xl text-indigo-300 text-xs font-bold border border-indigo-800">
                <Guitar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Key: {song.key || 'Dm'}</span>
                <button
                  onClick={() => setSemitones(prev => prev - 1)}
                  className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="w-4 text-center">{semitones > 0 ? `+${semitones}` : semitones}</span>
                <button
                  onClick={() => setSemitones(prev => prev + 1)}
                  className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            )}

            {/* Audio Play Trigger */}
            {song.hasAudio && (
              <button
                onClick={() => playAudioSong(song)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-sm hover:bg-cyan-700 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Audio</span>
              </button>
            )}

            {/* Font Size Selector */}
            <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
              <Type className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
              {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                    fontSize === size
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(song.id)}
              className={`p-2 rounded-xl border transition-colors ${
                fav
                  ? 'bg-amber-950/50 border-amber-500/60 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Copy Lyrics"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Share Song"
            >
              <Share2 className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>

      {/* ==================================================== */}
      {/* INLINE PERSISTENT LYRICS EDITOR PANEL */}
      {/* ==================================================== */}
      {isEditing && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl animate-fade">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-base text-white">Edit Song Lyrics & Stanzas</span>
            </div>

            <div className="flex items-center gap-3">
              {saveStatus === 'saved' && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>✓ Changes Saved</span>
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Unsaved changes...</span>
                </span>
              )}

              <button
                onClick={() => handleSaveLyrics()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-400">
              {activeTab === 'kannada' ? 'Kannada Lyrics Text (Edit lines or remove blank line gaps)' : 'English Transliteration Text'}
            </label>

            <textarea
              rows={12}
              value={activeTab === 'kannada' ? editedLyricsKannada : editedLyricsEnglish}
              onChange={(e) => handleLyricsChange(e.target.value, activeTab)}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 font-kannada font-bold text-lg leading-relaxed text-white focus:outline-none focus:border-amber-400"
              placeholder="Enter lyrics lines..."
            />

            <p className="text-xs text-slate-400">
              💡 Tip: Remove unnecessary blank line gaps between lines. Stanza boundaries (empty lines) will automatically break slides cleanly in presentation mode.
            </p>
          </div>
        </div>
      )}

      {/* Lyrics Reading Card */}
      <div className="bg-church-surface border border-church-border rounded-xl p-6 sm:p-10 shadow-sm">
        <div
          className={`${activeTab === 'kannada' ? 'font-kannada' : 'font-sans'} ${fontSizeClass} text-slate-100 space-y-4`}
          dangerouslySetInnerHTML={{
            __html: renderLyrics(
              activeTab === 'kannada' ? song.lyricsKannada : song.lyricsEnglish
            ),
          }}
        />
      </div>
    </div>
  );
};

