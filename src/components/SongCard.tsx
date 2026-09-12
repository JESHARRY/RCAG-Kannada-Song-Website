import React, { useState } from 'react';
import { Star, Guitar, Headphones, FileText, Tv, Trash2, UserCheck, ChevronRight } from 'lucide-react';
import { Song } from '../types/song';
import { useApp } from '../context/AppContext';
import { getSongNumber, formatSongNumber } from '../utils/searchEngine';
import { SongCardVineAccent } from './GrapevineSystem';

interface SongCardProps {
  song: Song;
  index: number;
  onNavigate: (path: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, index, onNavigate }) => {
  const { isFavorite, toggleFavorite, deleteUserSong } = useApp();
  const fav = isFavorite(song.id);
  const [isStarAnimating, setIsStarAnimating] = useState(false);

  // Compute stable 3-digit padded display song number
  const numVal = getSongNumber(song, index);
  const displayNumber = formatSongNumber(numVal);

  // Deterministic Vine Accent variant (0..3)
  const vineVariant = (index + (song.titleKannada ? song.titleKannada.length : 0)) % 4;

  const handleDeleteCustom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete custom song "${song.titleKannada}"?`)) {
      deleteUserSong(song.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStarAnimating(true);
    toggleFavorite(song.id);
    setTimeout(() => setIsStarAnimating(false), 350);
  };

  return (
    <div
      onClick={() => onNavigate(`/song/${song.id}`)}
      className="group heavenly-card bg-church-surface border border-church-border rounded-xl p-4.5 sm:p-5 hover:bg-[#1c202c] cursor-pointer flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300"
    >
      {/* Light Sweep Shimmer Accent (Moves smoothly on hover) */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {/* Restrained Biblical Vine Accent Motif */}
      <SongCardVineAccent variant={vineVariant} isFavorite={fav} />

      <div>
        {/* Top Header Row: Song Number Badge & Quick Actions */}
        <div className="flex items-center justify-between gap-2 mb-3 relative z-10">

          {/* Song Number Badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-[#0d0f14] border border-slate-800 text-amber-400 tracking-wide group-hover:border-amber-500/40 group-hover:text-amber-300 transition-colors">
              #{displayNumber}
            </span>

            {song.sourceType === 'user_created' && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-700/60 uppercase">
                <UserCheck className="w-3 h-3 text-amber-400" /> Custom
              </span>
            )}
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-0.5">
            {/* Delete button for user-created songs */}
            {song.sourceType === 'user_created' && (
              <button
                onClick={handleDeleteCustom}
                title="Delete Custom Song"
                className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
              className="p-1.5 rounded-md text-slate-400 hover:text-amber-400 hover:bg-amber-950/40 hover:border hover:border-amber-500/30 transition-all"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Favorite Star Trigger */}
            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-md transition-all ${
                fav
                  ? 'text-amber-400 bg-amber-950/50 border border-amber-500/40'
                  : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
              }`}
              aria-label="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${fav ? 'fill-amber-400 text-amber-400' : ''} ${isStarAnimating ? 'animate-star-pop' : ''}`} />
            </button>
          </div>
        </div>

        {/* Kannada Title */}
        <h3 className="font-kannada font-bold text-lg text-white leading-snug group-hover:text-amber-300 transition-colors mb-1 relative z-10 flex items-center justify-between gap-2">
          <span>{song.titleKannada}</span>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 opacity-0 group-hover:opacity-100" />
        </h3>

        {/* English Title / Transliteration */}
        {song.titleEnglish && (
          <p className="text-xs text-slate-400 line-clamp-1 mb-4 font-normal tracking-wide relative z-10">
            {song.titleEnglish}
          </p>
        )}
      </div>

      {/* Badges Footer */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80 mt-auto text-[10px] font-semibold relative z-10">
        {song.key && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-slate-800 group-hover:border-amber-500/30 transition-colors">
            <Guitar className="w-3 h-3 text-amber-400" /> Key: {song.key}
          </span>
        )}

        {song.hasAudio && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 text-cyan-300 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
            <Headphones className="w-3 h-3 text-cyan-400" /> Audio
          </span>
        )}

        {song.sourceType === 'pdf' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 text-emerald-300 border border-slate-800 group-hover:border-emerald-500/30 transition-colors">
            <FileText className="w-3 h-3 text-emerald-400" /> PDF p.{song.sourcePageStart}
          </span>
        )}
      </div>
    </div>
  );
};
