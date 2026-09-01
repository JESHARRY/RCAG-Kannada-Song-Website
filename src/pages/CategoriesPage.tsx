import React from 'react';
import { Guitar, Headphones, BookOpen, Star, Sparkles, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CategoriesPageProps {
  onNavigate: (path: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const { allSongs, favorites } = useApp();

  const categories = [
    {
      id: 'all',
      title: '📖 Complete Songs Book',
      subtitle: 'Full catalog of worship songs in Kannada & English',
      count: allSongs.length,
      color: 'from-indigo-600 to-violet-600',
      path: '/songs',
    },
    {
      id: 'chords',
      title: '🎸 Lyrics with Chords',
      subtitle: 'Popular worship songs with musical key annotations',
      count: allSongs.filter(s => s.hasChords).length,
      color: 'from-blue-600 to-indigo-600',
      path: '/category/chords',
    },
    {
      id: 'audio',
      title: '🎵 Audio Songs',
      subtitle: 'Songs with streamable audio player stream links',
      count: allSongs.filter(s => s.hasAudio).length,
      color: 'from-cyan-600 to-teal-600',
      path: '/category/audio',
    },
    {
      id: 'favorites',
      title: '⭐ Favorites',
      subtitle: 'Your saved favorite songs for quick access',
      count: favorites.length,
      color: 'from-amber-500 to-orange-600',
      path: '/favorites',
    },
    {
      id: 'pdf',
      title: '📄 PDF Imported Songs',
      subtitle: 'Songs extracted and imported from PDF songbooks',
      count: allSongs.filter(s => s.sourceType === 'pdf').length,
      color: 'from-emerald-600 to-teal-600',
      path: '/category/pdf',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">
          📁 Categories
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Browse songs organized by chords, audio features, and custom imports
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onNavigate(cat.path)}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center font-bold text-xl mb-4 shadow-md`}>
                ✨
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {cat.subtitle}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {cat.count} Songs
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                Open →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
