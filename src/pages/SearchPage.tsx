import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchSongs, getSongNumber, formatSongNumber } from '../utils/songSearch';
import { HighlightText } from '../components/HighlightText';

interface SearchPageProps {
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const { allSongs } = useApp();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchSongs(allSongs, query, '', 'all');
  }, [allSongs, query]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">
          🔍 Instant Search
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search across Kannada titles, English transliteration, song lyrics, and 3-digit song numbers
        </p>
      </div>

      {/* Large Input */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-amber-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type Kannada title, English lyrics, or song number to search..."
          autoFocus
          className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/30 dark:border-indigo-500/30 focus:border-amber-400 text-slate-950 dark:text-white text-lg font-sans shadow-lg focus:outline-none"
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Try searching with a different keyword, song number, or Kannada character.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((song, idx) => (
                  <div
                    key={song.id}
                    onClick={() => onNavigate(`/song/${song.id}`)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-indigo-500 transition-all cursor-pointer shadow-sm flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 text-amber-500 border border-slate-200 dark:border-slate-800">
                          #{formatSongNumber(getSongNumber(song, idx))}
                        </span>
                      </div>
                      <div className="font-kannada font-bold text-lg text-slate-900 dark:text-white">
                        <HighlightText text={song.titleKannada} highlight={query} />
                      </div>
                      {song.titleEnglish && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <HighlightText text={song.titleEnglish} highlight={query} />
                        </div>
                      )}
                    </div>
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
