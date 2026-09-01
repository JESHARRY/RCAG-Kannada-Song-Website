import React, { useState } from 'react';
import { 
  Play, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  ChevronLeft,
  Sparkles,
  FileText
} from 'lucide-react';
import { Song } from '../types/song';
import { PresentationSlide, WorshipPresentation, PRESET_THEMES } from '../types/presentation';
import { parseSongToSlides } from '../utils/stanzaParser';

interface PresentationEditorPageProps {
  songs: Song[];
  songId?: string;
  onNavigate: (path: string) => void;
  onLaunchPresentation: (slides: PresentationSlide[]) => void;
}

export const PresentationEditorPage: React.FC<PresentationEditorPageProps> = ({
  songs,
  songId,
  onNavigate,
  onLaunchPresentation,
}) => {
  const currentSong = songs.find(s => s.id === songId) || songs[0];

  const [slides, setSlides] = useState<PresentationSlide[]>(() => {
    if (currentSong) return parseSongToSlides(currentSong);
    return [];
  });

  const [presentationName, setPresentationName] = useState(
    currentSong ? `${currentSong.titleKannada} Presentation` : 'New Worship Presentation'
  );

  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeSlide = slides[selectedSlideIndex];

  const handleUpdateSlideText = (text: string) => {
    setSlides(prev => {
      const next = [...prev];
      if (next[selectedSlideIndex]) {
        next[selectedSlideIndex] = { ...next[selectedSlideIndex], text };
      }
      return next;
    });
  };

  const handleUpdateSlideTitle = (title: string) => {
    setSlides(prev => {
      const next = [...prev];
      if (next[selectedSlideIndex]) {
        next[selectedSlideIndex] = { ...next[selectedSlideIndex], title };
      }
      return next;
    });
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    setSlides(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    setSelectedSlideIndex(targetIndex);
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToDup = slides[index];
    if (!slideToDup) return;
    const newSlide: PresentationSlide = {
      ...slideToDup,
      id: `slide-dup-${Date.now()}`,
      title: `${slideToDup.title || 'Slide'} (Copy)`
    };
    setSlides(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, newSlide);
      return next;
    });
    setSelectedSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, idx) => idx !== index));
    setSelectedSlideIndex(prev => Math.max(0, prev - 1));
  };

  const handleAddBlankSlide = () => {
    const newSlide: PresentationSlide = {
      id: `slide-blank-${Date.now()}`,
      type: 'blank',
      title: 'Blank Transition',
      text: ''
    };
    setSlides(prev => [...prev, newSlide]);
    setSelectedSlideIndex(slides.length);
  };

  const handleRestoreOriginal = () => {
    if (currentSong) {
      setSlides(parseSongToSlides(currentSong));
      setSelectedSlideIndex(0);
    }
  };

  const handleSavePresentation = () => {
    const newPres: WorshipPresentation = {
      id: `pres-${Date.now()}`,
      name: presentationName,
      songIds: currentSong ? [currentSong.id] : [],
      slides,
      theme: PRESET_THEMES[0],
      showChords: false,
      autoPlay: false,
      autoPlayIntervalSec: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const saved = localStorage.getItem('kcs_saved_presentations');
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem('kcs_saved_presentations', JSON.stringify([newPres, ...existing]));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Error saving presentation locally');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(songId ? `/song/${songId}` : '/songs')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                Stanza & Slide Editor
              </span>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade">
                  ✓ Saved to Presentation Library
                </span>
              )}
            </div>
            <input
              type="text"
              value={presentationName}
              onChange={(e) => setPresentationName(e.target.value)}
              className="font-bold text-xl text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none py-1"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRestoreOriginal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Original</span>
          </button>

          <button
            onClick={handleSavePresentation}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs hover:bg-indigo-100 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Presentation</span>
          </button>

          <button
            onClick={() => onLaunchPresentation(slides)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:scale-[1.02] transition-transform"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Presentation</span>
          </button>
        </div>
      </div>

      {/* Editor Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Slide List Navigator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase text-slate-400">Slides ({slides.length})</span>
            <button
              onClick={handleAddBlankSlide}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Blank</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setSelectedSlideIndex(idx)}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  idx === selectedSlideIndex
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {s.title || 'Slide'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-kannada">
                    {s.text || '[ Blank Slide ]'}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 'up'); }}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 'down'); }}
                    disabled={idx === slides.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Active Slide Text & Details Editor */}
        {activeSlide && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
            
            {/* Top Toolbar for Active Slide */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  Editing Slide #{selectedSlideIndex + 1}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDuplicateSlide(selectedSlideIndex)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>

                <button
                  onClick={() => handleDeleteSlide(selectedSlideIndex)}
                  disabled={slides.length <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Slide Stanza Label Input */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Stanza Header / Label (e.g. Verse 1, Chorus)
              </label>
              <input
                type="text"
                value={activeSlide.title || ''}
                onChange={(e) => handleUpdateSlideTitle(e.target.value)}
                placeholder="Verse 1"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Slide Text Content Input */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Stanza Lyrics Content
              </label>
              <textarea
                rows={7}
                value={activeSlide.text}
                onChange={(e) => handleUpdateSlideText(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-kannada font-bold text-lg leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Live Preview Box */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Live Slide Screen Preview
              </label>
              <div className="aspect-video bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-white border border-slate-800 shadow-inner">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 border border-amber-400/40 px-3 py-0.5 rounded-full">
                  {activeSlide.title || 'Slide'}
                </span>
                <div className="font-kannada font-bold text-xl md:text-2xl leading-relaxed whitespace-pre-line">
                  {activeSlide.text || '[ Blank Screen ]'}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
