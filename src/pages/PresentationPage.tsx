import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize, 
  Minimize, 
  Settings, 
  X, 
  Grid, 
  Edit3, 
  Save, 
  Eye, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Music,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Guitar
} from 'lucide-react';
import { Song } from '../types/song';
import { PresentationSlide, PresentationTheme, PRESET_THEMES, WorshipPresentation } from '../types/presentation';
import { parseSongToSlides } from '../utils/stanzaParser';

interface PresentationPageProps {
  songs: Song[];
  songId?: string; // If launched for single song
  initialSlides?: PresentationSlide[];
  onNavigate: (path: string) => void;
}

export const PresentationPage: React.FC<PresentationPageProps> = ({
  songs,
  songId,
  initialSlides,
  onNavigate,
}) => {
  // Current active song
  const currentSong = songs.find(s => s.id === songId) || songs[0];

  // Initialize Slides
  const [slides, setSlides] = useState<PresentationSlide[]>(() => {
    if (initialSlides && initialSlides.length > 0) return initialSlides;
    if (currentSong) return parseSongToSlides(currentSong);
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Active theme state
  const [theme, setTheme] = useState<PresentationTheme>(PRESET_THEMES[0]);

  // Controls UI visibility (auto-hide on idle)
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals & Panels
  const [showSettings, setShowSettings] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showPresenterWindow, setShowPresenterWindow] = useState(false);

  // Auto Advance State
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(10); // seconds
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Custom Chord display toggle
  const [showChords, setShowChords] = useState(false);

  // Presenter View Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Broadcast Channel for Dual-Screen Presenter Sync
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      broadcastChannelRef.current = new BroadcastChannel('kcs_worship_presentation');
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data && typeof event.data.slideIndex === 'number') {
          setCurrentIndex(event.data.slideIndex);
        }
      };
    } catch {
      // BroadcastChannel fallback if unsupported
    }
    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  // Timer for Presenter View
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto Advance Logic
  useEffect(() => {
    if (autoPlay) {
      autoPlayTimer.current = setInterval(() => {
        setCurrentIndex(prev => (prev < slides.length - 1 ? prev + 1 : 0));
      }, autoPlayInterval * 1000);
    } else if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [autoPlay, autoPlayInterval, slides.length]);

  // Sync with Dual Screen Audience View
  useEffect(() => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        slideIndex: currentIndex,
        totalSlides: slides.length,
        currentSlide: slides[currentIndex]
      });
    }
  }, [currentIndex, slides]);

  // Reset hide timer on mouse movement
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (!showSettings && !showThumbnails && !showShortcutsHelp) {
        setShowControls(false);
      }
    }, 4000);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentIndex(slides.length - 1);
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        } else {
          onNavigate(songId ? `/song/${songId}` : '/songs');
        }
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'p') {
        setAutoPlay(prev => !prev);
      } else if (e.key.toLowerCase() === 't') {
        setShowThumbnails(prev => !prev);
      } else if (e.key.toLowerCase() === 's') {
        setShowSettings(prev => !prev);
      } else if (e.key.toLowerCase() === 'c') {
        setShowChords(prev => !prev);
      } else if (e.key === '?') {
        setShowShortcutsHelp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isFullscreen, songId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentSlide: PresentationSlide = slides[currentIndex] || { id: 'empty-slide', type: 'blank', text: '', title: '' };
  const nextSlide = slides[currentIndex + 1];

  // Font size mapping
  const getFontSizeClass = () => {
    switch (theme.fontSize) {
      case 'sm': return 'text-2xl md:text-3xl lg:text-4xl';
      case 'md': return 'text-3xl md:text-4xl lg:text-5xl';
      case 'lg': return 'text-4xl md:text-5xl lg:text-6xl';
      case 'xl': return 'text-5xl md:text-6xl lg:text-7xl';
      case '2xl': return 'text-6xl md:text-7xl lg:text-8xl';
      default: return 'text-4xl md:text-5xl lg:text-6xl';
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none font-sans"
      style={{
        background: theme.bgType === 'image' && theme.customBgImage
          ? `url(${theme.customBgImage}) center/cover no-repeat`
          : theme.background
      }}
    >
      {/* Background Overlay */}
      {theme.overlayOpacity > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{ 
            backgroundColor: '#000000', 
            opacity: theme.overlayOpacity,
            filter: theme.blur ? `blur(${theme.blur}px)` : 'none'
          }}
        />
      )}

      {/* --- TOP BAR (Auto-Hiding) --- */}
      <div 
        className={`relative z-20 p-4 sm:p-6 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(songId ? `/song/${songId}` : '/songs')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700/80 backdrop-blur-md transition-colors"
          >
            <X className="w-4 h-4 text-amber-400" />
            <span>Exit Presentation</span>
          </button>

          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 text-slate-300 text-xs border border-slate-800/80 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentSong.titleKannada}</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChords(prev => !prev)}
            title="Toggle Chords (C)"
            className={`p-2.5 rounded-full backdrop-blur-md border transition-colors ${
              showChords 
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' 
                : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
          >
            <Guitar className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowThumbnails(prev => !prev)}
            title="Slide Grid (T)"
            className={`p-2.5 rounded-full backdrop-blur-md border transition-colors ${
              showThumbnails 
                ? 'bg-indigo-600 text-white border-indigo-500' 
                : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowPresenterNotes(prev => !prev)}
            title="Presenter View"
            className={`p-2.5 rounded-full backdrop-blur-md border transition-colors ${
              showPresenterNotes 
                ? 'bg-indigo-600 text-white border-indigo-500' 
                : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(prev => !prev)}
            title="Presentation Settings (S)"
            className={`p-2.5 rounded-full backdrop-blur-md border transition-colors ${
              showSettings 
                ? 'bg-indigo-600 text-white border-indigo-500' 
                : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen (F)"
            className="p-2.5 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/80 hover:text-white backdrop-blur-md transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* --- MAIN PRESENTATION CANVAS (16:9 Aspect Ratio Container) --- */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-7xl mx-auto w-full">
        {currentSlide.type === 'blank' ? (
          <div className="text-slate-600 text-sm font-medium animate-pulse">
            [ Blank Slide — Worship Pause ]
          </div>
        ) : (
          <div 
            key={currentIndex}
            className={`w-full space-y-6 transition-all duration-300 ${
              theme.transition === 'slide-left' ? 'anim-slide-left' :
              theme.transition === 'slide-right' ? 'anim-slide-right' :
              theme.transition === 'zoom' ? 'anim-zoom' : 'anim-fade'
            }`}
            style={{
              textAlign: theme.alignment,
              color: theme.textColor,
              fontFamily: theme.fontFamily === 'Noto Sans Kannada' ? '"Noto Sans Kannada", sans-serif' : '"Outfit", sans-serif'
            }}
          >
            {/* Stanza Badge Header */}
            {currentSlide.title && (
              <div 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest border border-current opacity-70"
                style={{ borderColor: theme.accentColor, color: theme.accentColor }}
              >
                {currentSlide.title}
              </div>
            )}

            {/* Chords Display if enabled */}
            {showChords && currentSlide.chords && (
              <div className="text-amber-400 font-mono font-bold text-lg md:text-xl tracking-wider py-1">
                🎸 Chords: {currentSlide.chords}
              </div>
            )}

            {/* Lyric Content Text */}
            <div 
              className={`font-bold leading-relaxed whitespace-pre-line tracking-wide drop-shadow-lg ${getFontSizeClass()}`}
              style={{
                lineHeight: theme.lineSpacing === 'compact' ? '1.3' : theme.lineSpacing === 'relaxed' ? '1.8' : '1.5'
              }}
            >
              {currentSlide.text}
            </div>

            {/* Song Title Subtitle on Title Slide */}
            {currentSlide.type === 'title' && currentSong.titleEnglish && (
              <p className="text-xl md:text-2xl opacity-80 font-sans font-medium pt-2">
                {currentSong.titleEnglish}
              </p>
            )}
          </div>
        )}
      </div>

      {/* --- BOTTOM CONTROL BAR (Auto-Hiding) --- */}
      <div 
        className={`relative z-20 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Counter */}
        <div className="text-xs font-bold text-slate-400 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-md">
          Slide <span className="text-amber-400 font-mono text-sm">{currentIndex + 1}</span> of <span className="font-mono text-sm">{slides.length}</span>
        </div>

        {/* Slide Step Controls */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="p-2 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous Slide (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => setAutoPlay(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              autoPlay ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Auto Advance (P)"
          >
            {autoPlay ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{autoPlay ? 'Auto' : 'Play'}</span>
          </button>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1))}
            disabled={currentIndex === slides.length - 1}
            className="p-2 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next Slide (Right Arrow / Space)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Shortcuts button */}
        <button
          onClick={() => setShowShortcutsHelp(prev => !prev)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900/80 px-3.5 py-2 rounded-full border border-slate-800 backdrop-blur-md"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Shortcuts (?)</span>
        </button>
      </div>

      {/* --- PRESENTER VIEW OVERLAY PANEL --- */}
      {showPresenterNotes && (
        <div className="absolute inset-y-0 right-0 z-30 w-full sm:w-96 bg-slate-950/95 border-l border-slate-800 p-6 flex flex-col justify-between text-white backdrop-blur-xl shadow-2xl animate-fade">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
              <Monitor className="w-4 h-4" />
              <span>Presenter Control View</span>
            </div>
            <button onClick={() => setShowPresenterNotes(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {/* Timer info */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Elapsed Time</div>
                <div className="font-mono text-xl font-bold text-amber-400">{formatTime(elapsedSeconds)}</div>
              </div>
              <button 
                onClick={() => setElapsedSeconds(0)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Current Slide Preview */}
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">CURRENT SLIDE ({currentIndex + 1})</div>
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 font-kannada text-sm leading-relaxed">
                {currentSlide.text}
              </div>
            </div>

            {/* Next Slide Preview */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">NEXT SLIDE ({currentIndex + 2})</div>
              {nextSlide ? (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-kannada text-sm leading-relaxed text-slate-300">
                  <span className="text-[10px] text-amber-400 font-bold block mb-1">{nextSlide.title}</span>
                  {nextSlide.text}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-500 italic">
                  End of Presentation
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- LIVE SLIDE THUMBNAILS GRID MODAL --- */}
      {showThumbnails && (
        <div className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-7xl mx-auto w-full">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Grid className="w-5 h-5 text-amber-400" />
              <span>Jump to Presentation Slide</span>
            </h3>
            <button onClick={() => setShowThumbnails(false)} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 max-w-7xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowThumbnails(false);
                }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all aspect-video ${
                  idx === currentIndex
                    ? 'bg-indigo-900/80 border-amber-400 ring-2 ring-amber-400 text-white shadow-xl'
                    : 'bg-slate-900 border-slate-800 hover:border-indigo-500 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold opacity-80 mb-2">
                  <span>{s.title || `Slide ${idx + 1}`}</span>
                  <span className="font-mono text-amber-400">#{idx + 1}</span>
                </div>
                <div className="font-kannada text-xs line-clamp-3 leading-snug">
                  {s.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- SETTINGS DRAWER MODAL --- */}
      {showSettings && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>Presentation Settings</span>
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Themes Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Worship Themes</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      theme.id === t.id
                        ? 'border-amber-400 bg-indigo-950 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Lyric Font Size</label>
              <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setTheme(prev => ({ ...prev, fontSize: sz }))}
                    className={`py-1.5 text-xs font-bold uppercase rounded-lg transition-colors ${
                      theme.fontSize === sz ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Alignment */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Text Alignment</label>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => setTheme(prev => ({ ...prev, alignment: align }))}
                    className={`py-2 text-xs font-bold uppercase rounded-xl border ${
                      theme.alignment === align ? 'border-amber-400 bg-indigo-950 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Advance Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Auto Advance Speed</label>
              <select
                value={autoPlayInterval}
                onChange={(e) => setAutoPlayInterval(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none"
              >
                <option value={5}>5 Seconds per slide</option>
                <option value={10}>10 Seconds per slide</option>
                <option value={15}>15 Seconds per slide</option>
                <option value={20}>20 Seconds per slide</option>
                <option value={30}>30 Seconds per slide</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* --- KEYBOARD SHORTCUTS HELP MODAL --- */}
      {showShortcutsHelp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Presentation Keyboard Controls</span>
              </h3>
              <button onClick={() => setShowShortcutsHelp(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Next Slide</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">→</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Previous Slide</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">←</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>First Slide</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">Home</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Last Slide</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">End</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Fullscreen</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">F</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Auto Play</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">P</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Thumbnails</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">T</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Settings</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">S</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
