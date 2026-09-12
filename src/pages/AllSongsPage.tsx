import React, { useState, useEffect, useMemo } from 'react';
import { Search, PlusCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SongCard } from '../components/SongCard';
import { AlphabetBar } from '../components/AlphabetBar';
import { CreateSongModal } from '../components/CreateSongModal';
import { searchSongs, hasChords } from '../utils/songSearch';

interface AllSongsPageProps {
  onNavigate: (path: string) => void;
  onOpenCreateSongModal?: () => void;
  initialCategory?: string;
}

export const AllSongsPage: React.FC<AllSongsPageProps> = ({
  onNavigate,
  onOpenCreateSongModal,
  initialCategory = 'all',
}) => {
  const { allSongs, userCreatedSongs } = useApp();
  const [query, setQuery] = useState('');
  const [alphabet, setAlphabet] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Sync category state whenever initialCategory prop changes (e.g. via route change)
  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  // Compute total songs with chords using canonical hasChords helper
  const chordSongsCount = useMemo(() => {
    return allSongs.filter(s => hasChords(s)).length;
  }, [allSongs]);

  // Compute total user-created songs
  const customSongsCount = useMemo(() => {
    return allSongs.filter(
      s => s.sourceType === 'user_created' || (s.tags && s.tags.includes('user_created')) || (s.id && s.id.startsWith('user-song-'))
    ).length;
  }, [allSongs]);

  // Filter songs using unified search utility (numerically sorted)
  const filtered = useMemo(() => {
    return searchSongs(allSongs, query, alphabet, category);
  }, [allSongs, query, alphabet, category]);

  const handleCategorySelect = (newCategory: string, routePath: string) => {
    setCategory(newCategory);
    onNavigate(routePath);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 font-sans anim-page-entrance">

      {/* 1. Clean Search & Action Header */}
      <div className="bg-church-surface border border-church-border rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className={`flex-1 w-full relative rounded-lg bg-[#0d0f14] border transition-all duration-200 ${
            isFocused
              ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'border-slate-800 hover:border-slate-700'
          }`}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              value={query}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Kannada title, English, lyrics, or song number..."
              className="w-full pl-10 pr-9 py-2.5 bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none"
              aria-label="Search songs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                title="Clear search"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Add Song Button */}
          <button
            onClick={() => {
              if (onOpenCreateSongModal) onOpenCreateSongModal();
              else setIsCreateModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Add Custom Song</span>
          </button>
        </div>
      </div>

      {/* 2. Category Pills & Count Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('all', '/songs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              category === 'all'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All Songs ({allSongs.length})
          </button>

          <button
            onClick={() => handleCategorySelect('chords', '/category/chords')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              category === 'chords' || category === 'with_chords'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🎸 With Chords ({chordSongsCount})
          </button>

          {(customSongsCount > 0 || userCreatedSongs.length > 0) && (
            <button
              onClick={() => handleCategorySelect('user_created', '/category/user_created')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                category === 'user_created' || category === 'custom' || category === 'user'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-amber-400 hover:border-amber-500/50'
              }`}
            >
              Custom Songs ({customSongsCount || userCreatedSongs.length})
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-400">
          {query || alphabet ? (
            <span>
              Showing <span className="font-mono text-amber-400 font-bold">{filtered.length}</span> matching songs for <strong className="text-white">"{query || alphabet}"</strong>
            </span>
          ) : (
            <span>
              Showing <span className="font-mono text-amber-400 font-bold">{filtered.length}</span> of <span className="font-mono">{allSongs.length}</span> songs
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
            <h3 className="font-bold text-lg text-white">
              {category === 'user_created' || category === 'custom'
                ? 'No custom songs found'
                : category === 'chords' || category === 'with_chords'
                ? 'No songs with chords found'
                : 'No songs found'}
            </h3>
            <p className="text-xs text-slate-400">
              {query || alphabet
                ? `No songs in this category match "${query || alphabet}"`
                : 'There are currently no songs in this category.'}
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
              handleCategorySelect('all', '/songs');
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
