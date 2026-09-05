import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SongCard } from '../components/SongCard';
import { AlphabetBar } from '../components/AlphabetBar';
import { CreateSongModal } from '../components/CreateSongModal';
import { searchSongs } from '../utils/songSearch';

interface AllSongsPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: string;
}

export const AllSongsPage: React.FC<AllSongsPageProps> = ({
  onNavigate,
  initialCategory = 'all',
}) => {
  const { allSongs, userCreatedSongs } = useApp();
  const [query, setQuery] = useState('');
  const [alphabet, setAlphabet] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Filter songs using unified search utility (numerically sorted)
  const filtered = useMemo(() => {
    return searchSongs(allSongs, query, alphabet, category);
  }, [allSongs, query, alphabet, category]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">

      {/* 1. Dynamic-Island-Style Header Search Bar (All Songs Page ONLY) */}
      <div className="pt-2 pb-2">
        <div
          className={`mx-auto max-w-4xl rounded-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-2 sm:p-2.5 flex items-center gap-3 transition-all duration-300 ${
            isFocused
              ? 'border-amber-400/90 ring-4 ring-amber-400/20 scale-[1.005] shadow-amber-500/10'
              : 'hover:border-slate-600'
          }`}
        >
          {/* Search Icon */}
          <div className="pl-3 text-amber-400 shrink-0">
            <Search className="w-5 h-5" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Kannada, English, lyrics, or song number..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none"
            aria-label="Search songs"
          />

          {/* Clear query button */}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              title="Clear search"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Integrated + Add Song Button inside the Dynamic Island Header */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>+ Add Song</span>
          </button>
        </div>
      </div>

      {/* 2. Category Pills & Count Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
              category === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-500'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All Songs ({allSongs.length})
          </button>

          <button
            onClick={() => setCategory('chords')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
              category === 'chords'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-500'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🎸 With Chords ({allSongs.filter((s) => s.hasChords).length})
          </button>

          {userCreatedSongs.length > 0 && (
            <button
              onClick={() => setCategory('user_created')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                category === 'user_created'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md border border-amber-400'
                  : 'bg-slate-900 border border-slate-800 text-amber-400 hover:border-amber-500/50'
              }`}
            >
              ✨ Custom Created ({userCreatedSongs.length})
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-400">
          {query || alphabet ? (
            <span>
              Showing <span className="font-mono text-amber-400 font-extrabold">{filtered.length}</span> matching songs for <strong className="text-white">"{query || alphabet}"</strong>
            </span>
          ) : (
            <span>
              Showing <span className="font-mono text-amber-400 font-extrabold">{filtered.length}</span> of <span className="font-mono">{allSongs.length}</span> songs
            </span>
          )}
        </div>
      </div>

      {/* 3. Kannada Alphabet Bar */}
      <AlphabetBar selectedLetter={alphabet} onSelectLetter={setAlphabet} />

      {/* 4. Song Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        /* Polished Empty State */
        <div className="p-10 text-center bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-3xl mx-auto border border-slate-700">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">No songs found</h3>
            <p className="text-xs text-slate-400">
              No songs match <strong className="text-amber-300">"{query || alphabet}"</strong>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-300">Try searching by:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Kannada title (e.g. ಯೇಸು)</li>
              <li>English title or transliteration (e.g. Yesu)</li>
              <li>Lyrics phrase or keyword</li>
              <li>3-digit song number (e.g. 023 or #023)</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setQuery('');
              setAlphabet('');
              setCategory('all');
            }}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-xs font-bold text-white shadow-md transition-all"
          >
            Clear Search & Show All Songs
          </button>
        </div>
      )}

      {/* Add New Song Modal */}
      <CreateSongModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
