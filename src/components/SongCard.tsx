import React from 'react';
import { Star, Guitar, Headphones, FileText, Tv } from 'lucide-react';
import { Song } from '../types/song';
import { useApp } from '../context/AppContext';

interface SongCardProps {
  song: Song;
  onNavigate: (path: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onNavigate }) => {
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(song.id);

  return (
    <div
      onClick={() => onNavigate(`/song/${song.id}`)}
      className="group relative bg-slate-900 border border-slate-800/90 rounded-2xl p-5 hover:border-indigo-500/80 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {song.number ? `#${song.number}` : 'Song'}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(`/presentation/song/${song.id}`);
              }}
              title="Present Lyrics (Tv)"
              className="p-1.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>

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
        <h3 className="font-kannada font-bold text-lg text-white leading-snug group-hover:text-amber-300 transition-colors mb-1">
          {song.titleKannada}
        </h3>

        {/* English Title / Transliteration */}
        {song.titleEnglish && (
          <p className="text-xs text-slate-400 line-clamp-1 mb-4 font-medium">
            {song.titleEnglish}
          </p>
        )}
      </div>

      {/* Badges Footer */}
      <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-800/80 mt-auto">
        {song.key && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
            <Guitar className="w-3 h-3 text-indigo-400" /> Key: {song.key}
          </span>
        )}

        {song.hasAudio && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            <Headphones className="w-3 h-3 text-cyan-400" /> Audio
          </span>
        )}

        {song.sourceType === 'pdf' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <FileText className="w-3 h-3 text-emerald-400" /> PDF: p.{song.sourcePageStart}-{song.sourcePageEnd}
          </span>
        )}
      </div>
    </div>
  );
};
