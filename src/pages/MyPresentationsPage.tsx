import React, { useState } from 'react';
import { Play, Edit3, Trash2, BookOpen, Clock, Plus, Sparkles } from 'lucide-react';
import { Song } from '../types/song';
import { PresentationSlide, WorshipPresentation } from '../types/presentation';

interface MyPresentationsPageProps {
  songs: Song[];
  onNavigate: (path: string) => void;
  onLaunchPresentation: (slides: PresentationSlide[]) => void;
}

export const MyPresentationsPage: React.FC<MyPresentationsPageProps> = ({
  songs,
  onNavigate,
  onLaunchPresentation,
}) => {
  const [savedPresentations, setSavedPresentations] = useState<WorshipPresentation[]>(() => {
    try {
      const saved = localStorage.getItem('kcs_saved_presentations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDelete = (id: string) => {
    const updated = savedPresentations.filter(p => p.id !== id);
    setSavedPresentations(updated);
    localStorage.setItem('kcs_saved_presentations', JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-semibold border border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saved Worship Presentations</span>
          </div>
          <h1 className="font-bold text-3xl text-white">My Presentations</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Access your custom edited stanzas, saved slide themes, and worship service presentations.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/songs')}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Presentation from Song</span>
        </button>
      </div>

      {/* Grid */}
      {savedPresentations.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Saved Presentations Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Open any song detail page, edit stanzas or themes in the Presentation Studio, and click "Save Presentation" to store it here.
          </p>
          <button
            onClick={() => onNavigate('/songs')}
            className="px-5 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md"
          >
            Browse 647 Songs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPresentations.map(p => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-indigo-500/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                  <span>{p.slides.length} Slides</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2">
                  {p.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onLaunchPresentation(p.slides)}
                  className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Present</span>
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 transition-colors"
                  title="Delete Presentation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
