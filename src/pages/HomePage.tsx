import React, { useState } from 'react';
import { 
  Search, 
  Guitar, 
  Headphones, 
  Star, 
  Download, 
  ChevronRight, 
  History, 
  Sparkles,
  Music,
  Tv,
  ListMusic,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SongCard } from '../components/SongCard';
import { AlphabetBar } from '../components/AlphabetBar';
import { filterSongs } from '../utils/searchEngine';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenDownloadModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenDownloadModal }) => {
  const { allSongs, favorites, recentSongIds } = useApp();
  const [selectedLetter, setSelectedLetter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Recent songs
  const recentSongs = recentSongIds
    .map(id => allSongs.find(s => s.id === id))
    .filter(Boolean);

  // Filtered list
  const displaySongs = filterSongs(allSongs, searchQuery, selectedLetter, 'all');

  const songsWithChordsCount = allSongs.filter(s => s.hasChords).length;
  const audioSongsCount = allSongs.filter(s => s.hasAudio).length;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* 1. Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold border border-amber-400/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Praise • Worship • Fellowship</span>
          </div>

          <div className="space-y-1">
            <h1 className="font-kannada font-extrabold text-3xl sm:text-5xl lg:text-6xl leading-tight text-white tracking-tight">
              ಕನ್ನಡ ಕ್ರೈಸ್ತ ಹಾಡುಗಳು
            </h1>
            <p className="text-indigo-200 font-sans font-bold text-lg sm:text-2xl tracking-wide">
              Kannada Christian Songs
            </p>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
            The complete verified songbook collection of 647 songs with Kannada lyrics, English transliterations, guitar chords, audio stream links, and PDF downloads.
          </p>

          {/* Hero Search Input */}
          <div className="relative max-w-xl pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ಇಲ್ಲಿ ಹಾಡುಗಳನ್ನು ಹುಡುಕಿ... (Search Kannada, English, or Lyrics)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950/80 text-white placeholder-slate-400 text-sm font-sans border border-slate-700/80 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* 2. Browse by Category Cards */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Browse by Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          
          <button
            onClick={() => onNavigate('/songs')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/80 text-left transition-all hover:-translate-y-0.5 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Music className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5">All Songs</div>
            <div className="text-xs text-slate-400 font-mono">{allSongs.length} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/category/chords')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/80 text-left transition-all hover:-translate-y-0.5 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Guitar className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5">With Chords</div>
            <div className="text-xs text-slate-400 font-mono">{songsWithChordsCount} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/category/audio')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/80 text-left transition-all hover:-translate-y-0.5 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5">Audio Songs</div>
            <div className="text-xs text-slate-400 font-mono">{audioSongsCount} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/favorites')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/80 text-left transition-all hover:-translate-y-0.5 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 text-rose-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5">Favorites</div>
            <div className="text-xs text-slate-400 font-mono">{favorites.length} Songs</div>
          </button>

          <button
            onClick={() => onNavigate('/presentation/sets')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/80 text-left transition-all hover:-translate-y-0.5 group shadow-sm col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
              <Tv className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-white mb-0.5">Worship Sets</div>
            <div className="text-xs text-slate-400">Presentation</div>
          </button>

        </div>
      </section>

      {/* 3. Action Banner for PDF Songbook Download */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 border border-indigo-800/60 rounded-3xl p-6 sm:p-8 shadow-md text-white">
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
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-md hover:bg-amber-300 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
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
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-lg text-white">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSongs.slice(0, 3).map((song) => (
              <SongCard key={song!.id} song={song!} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Main Song Catalog Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-xl text-white">
              {selectedLetter ? `Songs starting with "${selectedLetter}"` : searchQuery ? 'Search Results' : 'Verified Songbook Collection'}
            </h2>
            <p className="text-xs text-slate-400">
              Showing <strong>{displaySongs.length}</strong> of <strong>{allSongs.length}</strong> songs
            </p>
          </div>

          <button
            onClick={() => onNavigate('/songs')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:underline"
          >
            <span>View All ({allSongs.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displaySongs.slice(0, 18).map((song) => (
            <SongCard key={song.id} song={song} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

    </div>
  );
};
