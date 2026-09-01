import React, { useState, useEffect } from 'react';
import { Star, Play, Copy, Share2, Guitar, Type, FileText, Tv, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { transposeChordString } from '../utils/chordTransposer';

interface SongDetailPageProps {
  songId: string;
  onNavigate: (path: string) => void;
}

export const SongDetailPage: React.FC<SongDetailPageProps> = ({ songId, onNavigate }) => {
  const { allSongs, isFavorite, toggleFavorite, addRecentSong, playAudioSong, fontSize, setFontSize } = useApp();
  const [activeTab, setActiveTab] = useState<'kannada' | 'english'>('kannada');
  const [semitones, setSemitones] = useState(0);

  const song = allSongs.find(s => s.id === songId);

  useEffect(() => {
    if (songId) {
      addRecentSong(songId);
      window.scrollTo(0, 0);
    }
  }, [songId]);

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
    <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        
        {/* Title Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {song.number && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                #{song.number}
              </span>
            )}
            {song.category && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase">
                {song.category}
              </span>
            )}
          </div>

          <h1 className="font-kannada font-bold text-3xl sm:text-4xl text-white leading-tight mb-1">
            {song.titleKannada}
          </h1>

          {song.titleEnglish && (
            <p className="text-base text-slate-400 font-medium">
              {song.titleEnglish}
            </p>
          )}
        </div>

        {/* Source PDF Banner if applicable */}
        {song.sourceType === 'pdf' && (
          <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800 p-3 rounded-2xl mb-4">
            <FileText className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Extracted from PDF: <strong>{song.sourcePdf}</strong> (Pages {song.sourcePageStart}–{song.sourcePageEnd})</span>
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          
          {/* Main Presentation Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate(`/presentation/song/${song.id}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:scale-[1.02] transition-transform"
            >
              <Tv className="w-4 h-4" />
              <span>▶ Present Song</span>
            </button>

            <button
              onClick={() => onNavigate(`/presentation/editor/${song.id}`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-bold text-xs hover:bg-indigo-900 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Stanzas</span>
            </button>
          </div>

          {/* Language Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('kannada')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-kannada transition-all ${
                activeTab === 'kannada'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => setActiveTab('english')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'english'
                  ? 'bg-indigo-600 text-white shadow-sm'
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

      {/* Lyrics Reading Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
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
