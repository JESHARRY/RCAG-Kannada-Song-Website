import React, { useState, useMemo } from 'react';
import {
  Search,
  Guitar,
  Star,
  Download,
  ChevronRight,
  History,
  Sparkles,
  Music,
  Tv,
  BookOpen,
  X,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SongCard } from '../components/SongCard';
import { AlphabetBar } from '../components/AlphabetBar';
import { CHURCH_LOGO_URL } from '../utils/assetPath';
import { searchSongs } from '../utils/songSearch';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenDownloadModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenDownloadModal }) => {
  const { allSongs, favorites, recentSongIds } = useApp();
  const [selectedLetter, setSelectedLetter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Recently viewed songs
  const recentSongs = useMemo(() => {
    return recentSongIds
      .map((id) => allSongs.find((s) => s.id === id))
      .filter(Boolean);
  }, [recentSongIds, allSongs]);

  // Filtered song list using unified search utility (strictly numerically sorted)
  const displaySongs = useMemo(() => {
    return searchSongs(allSongs, searchQuery, selectedLetter, 'all');
  }, [allSongs, searchQuery, selectedLetter]);

  const songsWithChordsCount = useMemo(() => {
    return allSongs.filter((s) => s.hasChords).length;
  }, [allSongs]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16 font-sans">

      {/* 1. Cinematic Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950/70 to-slate-950 text-white p-6 sm:p-12 border border-slate-800/80 shadow-2xl">

        {/* Ambient GPU-friendly background glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">

          {/* Header Badge & Church Branding */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-amber-400 text-xs font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Praise • Worship • Fellowship</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-slate-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-amber-300 font-bold">{allSongs.length}</span> Verified Songs
            </div>
          </div>

          {/* Titles & Logo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
            <img
              src={CHURCH_LOGO_URL}
              alt="RCAG Worship Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="space-y-1">
              <h1 className="font-kannada font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
                ಕನ್ನಡ ಕ್ರೈಸ್ತ ಹಾಡುಗಳು
              </h1>
              <p className="text-indigo-200 font-sans font-bold text-lg sm:text-2xl tracking-wide">
                Kannada Christian Songs
              </p>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
            Your complete worship library for praise, prayer and devotion. Featuring Kannada lyrics, English transliterations, guitar chords, audio stream links, and dual-screen worship presentation software.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('/songs')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Explore Songs Library</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/presentation/sets')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Worship Presentation</span>
            </button>
          </div>

          {/* Hero Integrated Search Input */}
          <div className="relative max-w-2xl pt-3">
            <div className={`relative rounded-2xl bg-slate-950/90 border transition-all duration-300 shadow-2xl ${
              isSearchFocused
                ? 'border-amber-400 ring-4 ring-amber-400/20 scale-[1.005]'
                : 'border-slate-700/80 hover:border-slate-600'
            }`}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ಇಲ್ಲಿ ಹಾಡುಗಳನ್ನು ಹುಡುಕಿ... (Search Kannada, English, lyrics, or song number)"
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Browse by Category Cards */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Browse by Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

          <button
            onClick={() => onNavigate('/songs')}
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Music className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5">All Songs</div>
            <div className="text-xs text-slate-400 font-mono font-bold">{allSongs.length} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/category/chords')}
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-950/70 text-amber-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Guitar className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5">With Chords</div>
            <div className="text-xs text-slate-400 font-mono font-bold">{songsWithChordsCount} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/favorites')}
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-950/70 text-rose-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5">Favorites</div>
            <div className="text-xs text-slate-400 font-mono font-bold">{favorites.length} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/presentation/sets')}
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Tv className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5">Worship Sets</div>
            <div className="text-xs text-slate-400 font-medium">Dual-Screen Studio</div>
          </button>

        </div>
      </section>

      {/* 3. PDF Songbook Action Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-indigo-950 via-indigo-900/90 to-slate-900 border border-indigo-800/60 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Complete 647 Song PDF Songbook</span>
          </h3>
          <p className="text-xs text-indigo-200 max-w-xl">
            Download all 647 songs locally as a beautifully formatted PDF songbook with embedded Noto Sans Kannada Unicode font.
          </p>
        </div>
        <button
          onClick={onOpenDownloadModal}
          title="Download all 647 songs as PDF"
          className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Download Songbook PDF</span>
        </button>
      </div>

      {/* 4. Browse by Kannada Alphabet */}
      <section className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Browse by Kannada Alphabet
        </h3>
        <AlphabetBar
          selectedLetter={selectedLetter}
          onSelectLetter={setSelectedLetter}
        />
      </section>

      {/* 5. Recently Viewed Section */}
      {recentSongs.length > 0 && !selectedLetter && !searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-lg text-white">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSongs.slice(0, 3).map((song, idx) => (
              <SongCard key={song!.id} song={song!} index={idx} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Main Song Catalog Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-xl text-white">
              {selectedLetter
                ? `Songs starting with "${selectedLetter}"`
                : searchQuery
                ? `Search Results for "${searchQuery}"`
                : 'Verified Songbook Collection'}
            </h2>
            <p className="text-xs text-slate-400">
              Showing <strong className="text-amber-400 font-mono font-bold">{displaySongs.length}</strong> of{' '}
              <strong className="font-mono">{allSongs.length}</strong> songs
            </p>
          </div>

          <button
            onClick={() => onNavigate('/songs')}
            className="flex items-center gap-1 text-xs font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Songs ({allSongs.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {displaySongs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySongs.slice(0, 24).map((song, idx) => (
              <SongCard key={song.id} song={song} index={idx} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
            <div className="text-3xl">🔍</div>
            <h3 className="font-bold text-base text-white">No matching songs found</h3>
            <p className="text-xs text-slate-400">Try searching for a different keyword or Kannada letter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLetter('');
              }}
              className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-400"
            >
              Clear Search Filters
            </button>
          </div>
        )}
      </section>

    </div>
  );
};
