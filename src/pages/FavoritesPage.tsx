import React from 'react';
import { Star, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SongCard } from '../components/SongCard';
import { SectionVineAccent } from '../components/GrapevineSystem';

interface FavoritesPageProps {
  onNavigate: (path: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate }) => {
  const { allSongs, favorites } = useApp();

  const favSongs = allSongs.filter(s => favorites.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans anim-page-entrance">
      <div>
        <h1 className="font-bold text-2xl text-white mb-1 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          <span>Favorite Songs</span>
          <SectionVineAccent className="w-14 h-5 opacity-70 ml-1" />
        </h1>
        <p className="text-xs text-slate-400">
          Showing <span className="font-mono text-amber-400 font-bold">{favSongs.length}</span> saved favorite songs
        </p>
      </div>

      {favSongs.length === 0 ? (
        <div className="bg-church-surface border border-church-border rounded-xl p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center mx-auto border border-slate-800">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">No favorite songs yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Save songs here for quick access during worship services and practice sessions.
          </p>
          <button
            onClick={() => onNavigate('/songs')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors mx-auto"
          >
            <Music className="w-4 h-4 text-slate-950" />
            <span>Browse Songs Library</span>
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
