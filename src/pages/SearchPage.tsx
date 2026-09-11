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
    <div className="max-w-4xl mx-auto space-y-5 pb-12 font-sans anim-page-entrance">
      <div>
        <h1 className="font-bold text-2xl text-white mb-1 flex items-center gap-2">
          <SearchIcon className="w-6 h-6 text-amber-400" />
          <span>Search Songbook</span>
        </h1>
        <p className="text-xs text-slate-400">
          Search Kannada titles, English transliteration, song lyrics, or 3-digit song numbers
        </p>
      </div>

      {/* Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type Kannada title, English lyrics, or song number to search..."
          autoFocus
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-church-surface border border-church-border focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 text-white text-sm font-medium shadow-xs focus:outline-none transition-all duration-200"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Section */}
      <div>
        {query.trim() ? (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Found <span className="font-mono text-amber-400 font-bold">{searchResults.length}</span> matching songs for "{query}"
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-church-surface border border-church-border rounded-xl p-8 text-center space-y-2">
                <div className="text-2xl">🔎</div>
                <h3 className="font-bold text-white text-base">No matching songs found</h3>
                <p className="text-xs text-slate-400">Try searching with a different keyword, song number, or Kannada character.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {searchResults.map((song, idx) => (
                  <div
                    key={song.id}
                    onClick={() => onNavigate(`/song/${song.id}`)}
                    className="bg-church-surface border border-church-border rounded-xl p-4 hover:border-amber-500/50 hover:bg-[#1e222f] transition-all cursor-pointer shadow-xs flex items-center justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#0d0f14] text-amber-400 border border-slate-800">
                          #{formatSongNumber(getSongNumber(song, idx))}
                        </span>
                      </div>
                      <div className="font-kannada font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                        <HighlightText text={song.titleKannada} highlight={query} />
                      </div>
                      {song.titleEnglish && (
                        <div className="text-xs text-slate-400">
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
          <div className="bg-church-surface border border-church-border rounded-xl p-8 text-center text-xs text-slate-400">
            Start typing above to see instant search results with matching text highlighted.
          </div>
        )}
      </div>
    </div>
  );
};
