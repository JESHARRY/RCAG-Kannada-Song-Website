import React from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SongCard } from '../components/SongCard';

interface FavoritesPageProps {
  onNavigate: (path: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate }) => {
  const { allSongs, favorites } = useApp();

  const favSongs = allSongs.filter(s => favorites.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          <span>Your Favorite Songs</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <strong>{favSongs.length}</strong> saved favorite songs
        </p>
      </div>

      {favSongs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <div className="text-5xl mb-4">⭐</div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">No Favorites Saved Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Click the star icon on any song card or detail page to add it to your favorites list for quick access.
          </p>
          <button
            onClick={() => onNavigate('/songs')}
            className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 transition-colors"
          >
            Browse All Songs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favSongs.map((song, idx) => (
            <SongCard key={song.id} song={song} index={idx} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
