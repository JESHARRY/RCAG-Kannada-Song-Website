import React from 'react';
import { Star, Guitar, Headphones, FileText, Tv, Trash2, UserCheck } from 'lucide-react';
import { Song } from '../types/song';
import { useApp } from '../context/AppContext';
import { getSongNumber, formatSongNumber } from '../utils/searchEngine';

interface SongCardProps {
  song: Song;
  index: number;
  onNavigate: (path: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, index, onNavigate }) => {
  const { isFavorite, toggleFavorite, deleteUserSong } = useApp();
  const fav = isFavorite(song.id);

  // Compute stable 3-digit padded display song number
  const numVal = getSongNumber(song, index);
  const displayNumber = formatSongNumber(numVal);

  const handleDeleteCustom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete custom song "${song.titleKannada}"?`)) {
      deleteUserSong(song.id);
    }
  };

  return (
    <div
      onClick={() => onNavigate(`/song/${song.id}`)}
      className="group relative bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Background Accent Subtle Radial Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-600/10 transition-colors" />

      <div>
        {/* Top Header Row: Prominent Song Number & Quick Action Buttons */}
        <div className="flex items-center justify-between gap-2 mb-3.5">

          {/* Prominent Stable 3-Digit Song Number Badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-sm px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 shadow-inner tracking-wider">
              {displayNumber}
            </span>

            {song.sourceType === 'user_created' && (
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60 uppercase">
                <UserCheck className="w-3 h-3 text-amber-400" /> Custom
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Delete button for user-created songs only */}
            {song.sourceType === 'user_created' && (
              <button
                onClick={handleDeleteCustom}
                title="Delete User Created Song"
                className="p-1.5 rounded-full text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Present Lyrics Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(`/presentation/song/${song.id}`);
              }}
              title="Present Lyrics (Tv)"
              className="p-1.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Favorite Star Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(song.id);
              }}
              className={`p-1.5 rounded-full transition-colors ${
                fav
                  ? 'text-amber-400 bg-amber-950/40'
                  : 'text-slate-500 hover:text-amber-400'
              }`}
              aria-label="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Kannada Title */}
        <h3 className="font-kannada font-bold text-lg sm:text-xl text-white leading-snug group-hover:text-amber-300 transition-colors mb-1">
          {song.titleKannada}
        </h3>

        {/* English Title / Transliteration */}
        {song.titleEnglish && (
          <p className="text-xs text-slate-400 line-clamp-1 mb-4 font-medium tracking-wide">
            {song.titleEnglish}
          </p>
        )}
      </div>

      {/* Badges Footer */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80 mt-auto text-[10px] font-bold">
        {song.key && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
            <Guitar className="w-3 h-3 text-indigo-400" /> Key: {song.key}
          </span>
        )}

        {song.hasAudio && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            <Headphones className="w-3 h-3 text-cyan-400" /> Audio
          </span>
        )}

        {song.sourceType === 'pdf' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <FileText className="w-3 h-3 text-emerald-400" /> PDF: p.{song.sourcePageStart}
          </span>
        )}
      </div>
    </div>
  );
};
