import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { filterSongs } from '../utils/searchEngine';
import { HighlightText } from '../components/HighlightText';

interface SearchPageProps {
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const { allSongs } = useApp();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return filterSongs(allSongs, query, '', 'all');
  }, [allSongs, query]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">
          🔍 Instant Search
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search across Kannada titles, English transliteration, and song lyrics
        </p>
      </div>

      {/* Large Input */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type Kannada title or English lyrics to search..."
          autoFocus
          className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/30 dark:border-indigo-500/30 focus:border-indigo-500 text-slate-900 dark:text-white text-lg font-sans shadow-lg focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Section */}
      <div>
        {query.trim() ? (
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Found {searchResults.length} matching songs for "{query}"
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-2">🔎</div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">No songs found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Try searching with a different keyword or Kannada character.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => onNavigate(`/song/${song.id}`)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-indigo-500 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="font-kannada font-bold text-lg text-slate-900 dark:text-white">
                      <HighlightText text={song.titleKannada} highlight={query} />
                    </div>
                    {song.titleEnglish && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        <HighlightText text={song.titleEnglish} highlight={query} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400">
            Start typing above to see instant search results with matching text highlighted.
          </div>
        )}
      </div>
    </div>
  );
};
