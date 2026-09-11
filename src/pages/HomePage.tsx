import React, { useState, useMemo } from 'react';
import {
  Search,
  Guitar,
  Star,
  Download,
  ChevronRight,
  History,
  Music,
  Tv,
  BookOpen,
  X,
  Compass,
  BookMarked
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
  const [isCrossHovered, setIsCrossHovered] = useState(false);

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
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans anim-page-entrance">

      {/* 1. Authentic Church Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-church-surface border border-church-border/80 text-white p-6 sm:p-10 lg:p-12 min-h-[460px] shadow-md group">
        {/* Ambient Heavenly Light Beam Layer */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-600/5 blur-2xl pointer-events-none" />

        {/* Floating Right-Side Traditional Christian Cross Mosaic */}
        <div
          onMouseEnter={() => setIsCrossHovered(true)}
          onMouseLeave={() => setIsCrossHovered(false)}
          className="hidden lg:flex absolute right-6 xl:right-12 top-1/2 -translate-y-1/2 items-center justify-center w-[300px] h-[420px] pointer-events-auto cursor-pointer z-10 select-none group/cross"
        >
          {/* Subtle Heavenly Background Golden Glow Halo - Breaths with the Cross */}
          <div
            className={`absolute w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none transition-all duration-500 animate-glow-breathing ${
              isCrossHovered ? 'bg-amber-500/25 scale-110 blur-2xl' : ''
            }`}
          />

          {/* LAYER 1: Hover Wrapper - Smoothly zooms out to scale(0.85) when cursor enters */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-500 cubic-bezier(0.16,1,0.3,1)"
            style={{
              transform: isCrossHovered ? 'scale(0.85)' : 'scale(1.0)',
            }}
          >
            {/* LAYER 2: Breathing Wrapper - Continuous subtle ±2.5% scale breathing animation over 8s */}
            <div className="relative w-[300px] h-[420px] flex items-center justify-center animate-cross-breathing select-none pointer-events-none">
              {(() => {
                const nodes: { col: number; row: number; opacity: number }[] = [];
                const stemCols = [-0.5, 0.5];

                // Rows 0 to 3: Top Stem (2 logos wide: col = -0.5, 0.5)
                for (let r = 0; r <= 3; r++) {
                  const opacity = 0.75 + (r / 3) * 0.20;
                  for (const c of stemCols) {
                    nodes.push({ col: c, row: r, opacity });
                  }
                }

                // Rows 4 & 5: 2-Row Wide Horizontal Crossbar (10 cols wide: -4.5 to 4.5)
                for (let r = 4; r <= 5; r++) {
                  for (let c = -4.5; c <= 4.5; c += 1) {
                    const distFromCenter = Math.abs(c);
                    const opacity = 1.0 - (distFromCenter / 4.5) * 0.30;
                    nodes.push({ col: c, row: r, opacity });
                  }
                }

                // Rows 6 to 14: Elongated Lower Shaft (2 logos wide: col = -0.5, 0.5)
                for (let r = 6; r <= 14; r++) {
                  const opacity = 0.95 - ((r - 6) / 8) * 0.45;
                  for (const c of stemCols) {
                    nodes.push({ col: c, row: r, opacity });
                  }
                }

                return nodes.map((node, i) => (
                  <img
                    key={i}
                    src={CHURCH_LOGO_URL}
                    alt=""
                    aria-hidden="true"
                    className="absolute w-[26px] h-[26px] object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.4)] transition-opacity duration-300"
                    style={{
                      left: `calc(50% + ${node.col * 30}px)`,
                      top: `calc(50% + ${(node.row - 5) * 28}px)`,
                      transform: 'translate(-50%, -50%)',
                      opacity: isCrossHovered ? Math.min(1.0, node.opacity + 0.15) : node.opacity,
                    }}
                  />
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-2xl xl:max-w-3xl space-y-5">

          {/* Church Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm">
              <BookMarked className="w-3.5 h-3.5" />
              <span>REVIVAL CENTRE AG CHURCH</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-semibold">
              <span className="font-mono text-amber-400 font-bold">{allSongs.length}</span> Songs in Collection
            </div>
          </div>

          {/* Main Title & Church Logo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
            <img
              src={CHURCH_LOGO_URL}
              alt="Revival Centre AG Church Logo"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="space-y-0.5">
              <h1 className="font-kannada font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight group-hover:text-amber-100 transition-colors">
                ಕನ್ನಡ ಕ್ರೈಸ್ತ ಹಾಡುಗಳು
              </h1>
              <p className="text-slate-300 font-sans font-bold text-lg sm:text-xl tracking-wide">
                Kannada Christian Songs Library
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            The official digital songbook for Revival Centre AG Church. Access lyrics, English transliterations, guitar chords, audio streams, and dual-screen presentation tools for congregational worship.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/songs')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all hover:-translate-y-0.5 shadow-md hover:shadow-amber-500/20"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Songs</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/presentation/sets')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/30 text-slate-200 font-bold text-xs sm:text-sm transition-all hover:-translate-y-0.5"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Worship Presentation</span>
            </button>
          </div>

          {/* Integrated Search Bar */}
          <div className="pt-2 max-w-2xl">
            <div className={`relative rounded-xl bg-[#0d0f14] border transition-all duration-200 ${
              isSearchFocused
                ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : 'border-slate-800 hover:border-slate-700'
            }`}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs by Kannada title, English, lyrics, or song number..."
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Quick Access Tiles */}
      <section className="space-y-3 anim-stagger-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Quick Access
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          <button
            onClick={() => onNavigate('/songs')}
            className="heavenly-card p-4 rounded-xl bg-church-surface border border-church-border text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold mb-2.5 group-hover:scale-110 transition-transform">
              <Music className="w-4 h-4" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5 group-hover:text-amber-300 transition-colors">All Songs</div>
            <div className="text-xs text-slate-400 font-mono">{allSongs.length} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/category/chords')}
            className="heavenly-card p-4 rounded-xl bg-church-surface border border-church-border text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold mb-2.5 group-hover:scale-110 transition-transform">
              <Guitar className="w-4 h-4" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5 group-hover:text-amber-300 transition-colors">With Chords</div>
            <div className="text-xs text-slate-400 font-mono">{songsWithChordsCount} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/favorites')}
            className="heavenly-card p-4 rounded-xl bg-church-surface border border-church-border text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-rose-400 flex items-center justify-center font-bold mb-2.5 group-hover:scale-110 transition-transform">
              <Star className="w-4 h-4" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5 group-hover:text-rose-300 transition-colors">Favorites</div>
            <div className="text-xs text-slate-400 font-mono">{favorites.length} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/presentation/sets')}
            className="heavenly-card p-4 rounded-xl bg-church-surface border border-church-border text-left transition-all group col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-bold mb-2.5 group-hover:scale-110 transition-transform">
              <Tv className="w-4 h-4" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5 group-hover:text-emerald-300 transition-colors">Worship Sets</div>
            <div className="text-xs text-slate-400">Dual-Screen Studio</div>
          </button>

        </div>
      </section>

      {/* 3. PDF Songbook Action Banner */}
      <div className="heavenly-card flex flex-wrap items-center justify-between gap-4 bg-church-surface border border-church-border rounded-xl p-5 sm:p-6 text-white shadow-sm group">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-white flex items-center gap-2 group-hover:text-amber-300 transition-colors">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Complete 647 Song PDF Songbook</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Download all 647 songs formatted as a printable PDF songbook with embedded Kannada Unicode font for offline reference.
          </p>
        </div>
        <button
          onClick={onOpenDownloadModal}
          title="Download all 647 songs as PDF"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all hover:-translate-y-0.5 shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Download Songbook PDF</span>
        </button>
      </div>

      {/* 4. Browse by Kannada Alphabet */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Browse by Kannada Alphabet
        </h3>
        <AlphabetBar
          selectedLetter={selectedLetter}
          onSelectLetter={setSelectedLetter}
        />
      </section>

      {/* 5. Recently Viewed Section */}
      {recentSongs.length > 0 && !selectedLetter && !searchQuery && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-base text-white">Recently Viewed</h2>
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
            <h2 className="font-bold text-lg text-white">
              {selectedLetter
                ? `Songs starting with "${selectedLetter}"`
                : searchQuery
                ? `Search Results for "${searchQuery}"`
                : 'Songbook Collection'}
            </h2>
            <p className="text-xs text-slate-400">
              Showing <strong className="text-amber-400 font-mono font-bold">{displaySongs.length}</strong> of{' '}
              <strong className="font-mono">{allSongs.length}</strong> songs
            </p>
          </div>

          <button
            onClick={() => onNavigate('/songs')}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
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
          <div className="p-8 text-center bg-church-surface border border-church-border rounded-xl space-y-3">
            <div className="text-2xl">🔍</div>
            <h3 className="font-bold text-base text-white">No matching songs found</h3>
            <p className="text-xs text-slate-400">Try searching for a different keyword or Kannada letter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLetter('');
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-400 border border-slate-800"
            >
              Clear Search Filters
            </button>
          </div>
        )}
      </section>

    </div>
  );
};
