import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SongCard } from '../components/SongCard';
import { AlphabetBar } from '../components/AlphabetBar';
import { filterSongs } from '../utils/searchEngine';

interface AllSongsPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: string;
}

export const AllSongsPage: React.FC<AllSongsPageProps> = ({
  onNavigate,
  initialCategory = 'all',
}) => {
  const { allSongs } = useApp();
  const [query, setQuery] = useState('');
  const [alphabet, setAlphabet] = useState('');
  const [category, setCategory] = useState(initialCategory);

  const filtered = useMemo(() => {
    return filterSongs(allSongs, query, alphabet, category);
  }, [allSongs, query, alphabet, category]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">
          {category === 'chords' ? '🎸 Lyrics with Chords' : category === 'audio' ? '🎵 Audio Songs' : '📖 All Kannada Songs'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <strong>{filtered.length}</strong> songs in catalog
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by title, transliteration, lyrics, or key..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base focus:outline-none focus:border-indigo-500 shadow-sm"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            category === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          All ({allSongs.length})
        </button>
        <button
          onClick={() => setCategory('chords')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            category === 'chords'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          🎸 With Chords ({allSongs.filter(s => s.hasChords).length})
        </button>
        <button
          onClick={() => setCategory('audio')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            category === 'audio'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          🎵 With Audio ({allSongs.filter(s => s.hasAudio).length})
        </button>
      </div>

      {/* Kannada Alphabet Bar */}
      <AlphabetBar selectedLetter={alphabet} onSelectLetter={setAlphabet} />

      {/* Song Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((song) => (
          <SongCard key={song.id} song={song} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
};
