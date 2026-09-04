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
  Monitor, 
  Sparkles, 
  HelpCircle, 
  Guitar,
  Search,
  Tv,
  Eye,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  ListMusic,
  RefreshCw,
  Sun,
  Moon,
  Layers,
  Square,
  Shield
} from 'lucide-react';

import { Song } from '../types/song';
import { 
  PresentationSlide, 
  PresentationTheme, 
  PRESET_THEMES, 
  LiveState, 
  DisplayMode, 
  PresentationMessage,
  WorshipSet 
} from '../types/presentation';
import { parseSongToSlides, parseWorshipSetToSlides } from '../utils/stanzaParser';
import { 
  PresentationChannel, 
  openProjectorWindow, 
  detectScreenDetails, 
  LOCAL_STORAGE_LIVE_STATE_KEY 
} from '../services/presentationChannel';

interface PresentationPageProps {
  songs: Song[];
  songId?: string; // Optional launched song
  initialSlides?: PresentationSlide[];
  onNavigate: (path: string) => void;
}

export const PresentationPage: React.FC<PresentationPageProps> = ({
  songs,
  songId,
  initialSlides,
  onNavigate,
}) => {
  // Session ID for current worship presentation session
  const [sessionId] = useState<string>(() => `session-${Date.now()}`);

  // Initial Song & Slides setup
  const currentSong = songs.find(s => s.id === songId) || songs[0];

  // ----------------------------------------------------
  // PREVIEW STATE (Operator Workspace - NOT projected)
  // ----------------------------------------------------
  const [previewSlides, setPreviewSlides] = useState<PresentationSlide[]>(() => {
    if (initialSlides && initialSlides.length > 0) return initialSlides;
    if (currentSong) return parseSongToSlides(currentSong);
    return [];
  });
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [previewSong, setPreviewSong] = useState<{ titleKannada: string; titleEnglish?: string } | Song | undefined>(currentSong);
  const [previewTheme, setPreviewTheme] = useState<PresentationTheme>(PRESET_THEMES[0]);
  const [previewShowChords, setPreviewShowChords] = useState<boolean>(false);

  // ----------------------------------------------------
  // LIVE STATE (Congregation Projector View)
  // ----------------------------------------------------
  const [liveState, setLiveState] = useState<LiveState>(() => {
    // Attempt Operator Reload Recovery from localStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LIVE_STATE_KEY);
      if (saved) {
        const parsed: LiveState = JSON.parse(saved);
        if (parsed.currentSlide) return parsed;
      }
    } catch {
      // Fallback
    }

    const initSlides = initialSlides && initialSlides.length > 0 ? initialSlides : (currentSong ? parseSongToSlides(currentSong) : []);
    return {
      sessionId,
      senderId: 'op-init',
      displayMode: 'LIVE',
      currentSlide: initSlides[0] || { id: 'empty', type: 'blank', text: '' },
      nextSlide: initSlides[1],
      slideIndex: 0,
      totalSlides: initSlides.length,
      activeSongTitleKn: currentSong?.titleKannada,
      activeSongTitleEn: currentSong?.titleEnglish,
      theme: PRESET_THEMES[0],
      showChords: false,
      timestamp: Date.now()
    };
  });

  // ----------------------------------------------------
  // CHANNEL & CONNECTION STATE
  // ----------------------------------------------------
  const channelRef = useRef<PresentationChannel | null>(null);
  const [isProjectorConnected, setIsProjectorConnected] = useState<boolean>(false);
  const lastPongTime = useRef<number>(0);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

  // Screen Details & Diagnostics
  const [isExtendedDisplay, setIsExtendedDisplay] = useState<boolean>(false);
  const [popupBlocked, setPopupBlocked] = useState<boolean>(false);
  const [screenCheckDone, setScreenCheckDone] = useState<boolean>(false);

  // Operator UI Panels & Controls
  const [songSearchQuery, setSongSearchQuery] = useState<string>('');
  const [showPresenterNotes, setShowPresenterNotes] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);
  const [savedWorshipSets, setSavedWorshipSets] = useState<WorshipSet[]>([]);

  // ----------------------------------------------------
  // 1. BROADCAST CHANNEL INITIALIZATION & HANDSHAKE
  // ----------------------------------------------------
  useEffect(() => {
    const handleMessage = (msg: PresentationMessage) => {
      if (msg.type === 'PONG') {
        // Audience window responded to PING
        lastPongTime.current = Date.now();
        setIsProjectorConnected(true);
      } else if (msg.type === 'REQUEST_LIVE_STATE') {
        // Audience window requested current live state on load/reload
        setIsProjectorConnected(true);
        lastPongTime.current = Date.now();
        channelRef.current?.post('CURRENT_LIVE_STATE', liveState, sessionId);
      }
    };

    const channel = new PresentationChannel('operator', handleMessage);
    channelRef.current = channel;

    // Heartbeat PING timer every 2 seconds
    heartbeatTimer.current = setInterval(() => {
      channel.post('PING', undefined, sessionId);
      // If no PONG received in last 5 seconds, mark disconnected
      if (Date.now() - lastPongTime.current > 5000) {
        setIsProjectorConnected(false);
      }
    }, 2000);

    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
      channel.close();
    };
  }, [liveState, sessionId]);

  // Load saved worship sets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kcs_saved_worship_sets');
      if (saved) setSavedWorshipSets(JSON.parse(saved));
    } catch {
      // Ignore
    }
  }, []);

  // Screen details detection on mount
  useEffect(() => {
    detectScreenDetails().then(info => {
      setIsExtendedDisplay(info.isExtended || (info.screens && info.screens.length > 1));
      setScreenCheckDone(true);
    });
  }, []);

  // ----------------------------------------------------
  // 2. CORE ACTIONS: GO LIVE & EMERGENCY CONTROLS
  // ----------------------------------------------------

  // GO LIVE: Copies previewState -> liveState and broadcasts to Audience
  const handleGoLive = (targetIndex?: number, targetSlides?: PresentationSlide[]) => {
    const activeSlides = targetSlides || previewSlides;
    const idx = targetIndex !== undefined ? targetIndex : previewIndex;
    const curSlide = activeSlides[idx] || { id: 'empty', type: 'blank', text: '' };
    const nxtSlide = activeSlides[idx + 1];

    const nextLiveState: LiveState = {
      sessionId,
      senderId: channelRef.current?.windowId || 'op',
      displayMode: 'LIVE', // Automatically exit Blackout/Logo on GO LIVE
      currentSlide: curSlide,
      nextSlide: nxtSlide,
      slideIndex: idx,
      totalSlides: activeSlides.length,
      activeSongTitleKn: previewSong?.titleKannada,
      activeSongTitleEn: previewSong?.titleEnglish,
      theme: {
        ...previewTheme,
        fontSizePx: liveState.theme?.fontSizePx || previewTheme.fontSizePx || 54
      },
      showChords: previewShowChords,
      timestamp: Date.now()
    };

    setLiveState(nextLiveState);
    setPreviewIndex(idx);
    channelRef.current?.post('GO_LIVE', nextLiveState, sessionId);
  };

  // Real-time Live Font Size Control
  const handleLiveFontSizeChange = (newSize: number) => {
    const clampedSize = Math.max(32, Math.min(96, newSize));
    const updatedTheme = { ...liveState.theme, fontSizePx: clampedSize };
    const updatedLiveState = { ...liveState, theme: updatedTheme, timestamp: Date.now() };
    setLiveState(updatedLiveState);
    setPreviewTheme(prev => ({ ...prev, fontSizePx: clampedSize }));
    channelRef.current?.post('LIVE_STATE_UPDATE', updatedLiveState, sessionId);
  };

  // Live Slide Step Controls: Next / Previous
  const handleLiveStep = (direction: 'next' | 'prev') => {
    if (!liveState.currentSlide) return;

    let targetIdx = liveState.slideIndex;
    if (direction === 'next') {
      targetIdx = Math.min(liveState.slideIndex + 1, previewSlides.length - 1);
    } else {
      targetIdx = Math.max(liveState.slideIndex - 1, 0);
    }

    const curSlide = previewSlides[targetIdx] || liveState.currentSlide;
    const nxtSlide = previewSlides[targetIdx + 1];

    const nextLiveState: LiveState = {
      ...liveState,
      displayMode: 'LIVE', // GO LIVE automatically resets blackout/logo
      currentSlide: curSlide,
      nextSlide: nxtSlide,
      slideIndex: targetIdx,
      totalSlides: previewSlides.length,
      timestamp: Date.now()
    };

    setLiveState(nextLiveState);
    setPreviewIndex(targetIdx);
    channelRef.current?.post('LIVE_STATE_UPDATE', nextLiveState, sessionId);
  };

  // Emergency Control: BLACKOUT
  const handleToggleBlackout = () => {
    const nextMode: DisplayMode = liveState.displayMode === 'BLACKOUT' ? 'LIVE' : 'BLACKOUT';
    const nextLiveState: LiveState = { ...liveState, displayMode: nextMode, timestamp: Date.now() };
    setLiveState(nextLiveState);
    channelRef.current?.post('BLACKOUT_TOGGLE', nextLiveState, sessionId);
  };

  // Emergency Control: CLEAR / BRANDING LOGO
  const handleToggleLogo = () => {
    const nextMode: DisplayMode = liveState.displayMode === 'LOGO' ? 'LIVE' : 'LOGO';
    const nextLiveState: LiveState = { ...liveState, displayMode: nextMode, timestamp: Date.now() };
    setLiveState(nextLiveState);
    channelRef.current?.post('LOGO_TOGGLE', nextLiveState, sessionId);
  };

  // Emergency Control: STOP PRESENTATION -> LOGO
  const handleStopPresentation = () => {
    const nextLiveState: LiveState = { ...liveState, displayMode: 'LOGO', timestamp: Date.now() };
    setLiveState(nextLiveState);
    channelRef.current?.post('PRESENTATION_STOP', nextLiveState, sessionId);
  };

  // Open Projector Window Trigger
  const handleOpenProjector = async () => {
    setPopupBlocked(false);
    const res = await openProjectorWindow();
    if (res.popupBlocked) {
      setPopupBlocked(true);
    } else {
      setIsProjectorConnected(true);
    }
  };

  // ----------------------------------------------------
  // 3. PREVIEW ACTIONS (Does NOT affect audience!)
  // ----------------------------------------------------

  // Select a song from search -> loads into preview ONLY
  const handleSelectPreviewSong = (song: Song) => {
    const parsed = parseSongToSlides(song);
    setPreviewSong(song);
    setPreviewSlides(parsed);
    setPreviewIndex(0);
    setSongSearchQuery('');
  };

  // Select a worship set -> loads into preview ONLY
  const handleSelectWorshipSet = (set: WorshipSet) => {
    const setSongs = set.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[];
    if (setSongs.length === 0) return;
    const combined = parseWorshipSetToSlides(setSongs);
    setPreviewSong({
      titleKannada: set.name,
      titleEnglish: `${setSongs.length} Songs Setlist`
    });
    setPreviewSlides(combined);
    setPreviewIndex(0);
  };

  // ----------------------------------------------------
  // 4. KEYBOARD INPUT SHIELDING & SHORTCUTS
  // ----------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shield typing in inputs, textareas, contentEditables
      const target = e.target as HTMLElement | null;
      if (
        target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        )
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleLiveStep('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handleLiveStep('prev');
      } else if (e.key === 'Home') {
        e.preventDefault();
        setPreviewIndex(0);
        handleGoLive(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        const lastIdx = previewSlides.length - 1;
        setPreviewIndex(lastIdx);
        handleGoLive(lastIdx);
      } else if (e.key === 'Escape') {
        onNavigate('/songs');
      } else if (e.key.toLowerCase() === 'b') {
        handleToggleBlackout();
      } else if (e.key.toLowerCase() === 'l') {
        handleToggleLogo();
      } else if (e.key.toLowerCase() === 'p') {
        setShowPresenterNotes(prev => !prev);
      } else if (e.key.toLowerCase() === 't') {
        setShowThumbnails(prev => !prev);
      } else if (e.key.toLowerCase() === 's') {
        setShowSettings(prev => !prev);
      } else if (e.key === '?') {
        setShowShortcutsHelp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [liveState, previewSlides, previewIndex, previewSong, previewTheme, previewShowChords]);

  // Filtered song search results
  const searchResults = songSearchQuery.trim()
    ? songs.filter(s =>
        s.titleKannada.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
        (s.titleEnglish && s.titleEnglish.toLowerCase().includes(songSearchQuery.toLowerCase()))
      ).slice(0, 8)
    : [];

  const previewCurrentSlide = previewSlides[previewIndex] || { id: 'empty', type: 'blank', text: '' };
  const previewNextSlide = previewSlides[previewIndex + 1];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between select-none">
      
      {/* ==================================================== */}
      {/* 1. TOP HEADER & PROJECTOR STATUS BAR */}
      {/* ==================================================== */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        
        {/* Left: App Title & Exit */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/songs')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Exit Studio</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="font-bold text-sm text-white">Worship Presenter Studio</span>
          </div>
        </div>

        {/* Center: Projector Connection & Screen Placement Diagnostics */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          
          {/* Connection Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-colors ${
            isProjectorConnected 
              ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isProjectorConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>{isProjectorConnected ? '🟢 Projector Connected' : '🔴 PROJECTOR DISCONNECTED'}</span>
          </div>

          {/* Extended Display Indicator */}
          {screenCheckDone && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] ${
              isExtendedDisplay 
                ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300' 
                : 'bg-amber-950/80 border-amber-700 text-amber-300'
            }`}>
              <Monitor className="w-3.5 h-3.5" />
              <span>{isExtendedDisplay ? '🖥 2 Displays Detected (Extend Mode)' : '🖥 Single Display / Duplicate Mode'}</span>
            </div>
          )}

          {/* Launch Audience Window Button */}
          <button
            onClick={handleOpenProjector}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold shadow-sm transition-all"
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span>Open Projector Display</span>
          </button>
        </div>

        {/* Right: Quick Settings & Help */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPresenterNotes(prev => !prev)}
            title="Toggle Presenter Notes (P)"
            className={`p-2 rounded-xl border transition-colors ${
              showPresenterNotes ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowThumbnails(prev => !prev)}
            title="Slide Grid (T)"
            className={`p-2 rounded-xl border transition-colors ${
              showThumbnails ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(prev => !prev)}
            title="Presentation Settings (S)"
            className={`p-2 rounded-xl border transition-colors ${
              showSettings ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowShortcutsHelp(prev => !prev)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </header>

      {/* Pop-up Blocked Banner Alert */}
      {popupBlocked && (
        <div className="bg-amber-900/90 border-b border-amber-600 p-3 px-6 text-xs text-amber-100 flex items-center justify-between animate-fade">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong>Browser Pop-up Blocked:</strong> Please allow pop-ups for this website or click below to launch manually.
            </span>
          </div>
          <a
            href={window.location.origin + window.location.pathname + '#/presentation/display'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-lg hover:bg-amber-300"
          >
            Open Projector Window Manually ↗
          </a>
        </div>
      )}

      {/* Duplicate Display Mode Diagnostic Alert */}
      {!isExtendedDisplay && screenCheckDone && (
        <div className="bg-slate-900/90 border-b border-amber-500/30 p-2.5 px-6 text-[11px] text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Single Screen / Duplicate Mode Detected:</strong> For independent operator control on your laptop screen without showing search/controls to congregation, set Windows Display Settings to <strong>"Extend these displays"</strong> (Win + P → Extend).
            </span>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. EMERGENCY CONTROL BAR & LIVE STEP CONTROLS */}
      {/* ==================================================== */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 px-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Direct Live Step Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLiveStep('prev')}
            disabled={liveState.slideIndex <= 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Live</span>
          </button>

          {/* PROMINENT GO LIVE BUTTON */}
          <button
            onClick={() => handleGoLive()}
            className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all ring-4 ring-emerald-500/30"
          >
            <Play className="w-4 h-4 fill-current text-white" />
            <span>GO LIVE</span>
          </button>

          <button
            onClick={() => handleLiveStep('next')}
            disabled={liveState.slideIndex >= previewSlides.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span>Next Live</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Live Display Status Badge & Live Font Size */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Display Mode:</span>
            <span className={`px-3 py-1 rounded-full font-extrabold ${
              liveState.displayMode === 'LIVE' 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' 
                : liveState.displayMode === 'BLACKOUT'
                ? 'bg-black text-rose-400 border border-rose-800'
                : 'bg-indigo-950 text-indigo-300 border border-indigo-700'
            }`}>
              {liveState.displayMode === 'LIVE' ? '🟢 LIVE' : liveState.displayMode === 'BLACKOUT' ? '⬛ BLACKOUT' : '✝ CHURCH LOGO / IDLE'}
            </span>
          </div>

          {/* Real-Time Live Font Size Widget */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Live Font:</span>
            <button
              onClick={() => handleLiveFontSizeChange((liveState.theme.fontSizePx || 54) - 2)}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white flex items-center justify-center transition-colors"
              title="Decrease Live Projector Font Size"
            >
              -
            </button>
            <span className="font-mono font-extrabold text-amber-400 text-xs w-10 text-center">
              {liveState.theme.fontSizePx || 54}px
            </span>
            <button
              onClick={() => handleLiveFontSizeChange((liveState.theme.fontSizePx || 54) + 2)}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white flex items-center justify-center transition-colors"
              title="Increase Live Projector Font Size"
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Emergency Blackout & Logo Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBlackout}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition-colors ${
              liveState.displayMode === 'BLACKOUT' 
                ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-500/50' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Blackout emergency control (B)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Blackout (B)</span>
          </button>

          <button
            onClick={handleToggleLogo}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition-colors ${
              liveState.displayMode === 'LOGO' 
                ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-500/50' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Clear / Logo idle control (L)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Logo (L)</span>
          </button>

          <button
            onClick={handleStopPresentation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-950 border border-slate-700 font-bold text-xs transition-colors"
            title="Stop Presentation"
          >
            <X className="w-3.5 h-3.5" />
            <span>Stop</span>
          </button>
        </div>

      </div>

      {/* ==================================================== */}
      {/* 3. MAIN DASHBOARD: 2 COLUMNS (OPERATOR & AUDIENCE) */}
      {/* ==================================================== */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full min-h-0">
        
        {/* ---------------------------------------------------- */}
        {/* LEFT COLUMN: SONG SEARCH, SETS & STANZA THUMBNAILS  */}
        {/* ---------------------------------------------------- */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 flex flex-col min-h-0">
          
          {/* Song Search Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Search 647 Songs Catalog</span>
              </span>
              <span className="text-[10px] text-slate-500">(Preview only)</span>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={songSearchQuery}
                onChange={(e) => setSongSearchQuery(e.target.value)}
                placeholder="Search Kannada or English title..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              {songSearchQuery && (
                <button 
                  onClick={() => setSongSearchQuery('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl max-h-48 overflow-y-auto space-y-1 p-1 shadow-xl animate-fade">
                {searchResults.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectPreviewSong(s)}
                    className="w-full p-2.5 rounded-xl text-left hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-kannada font-bold text-xs text-white truncate">{s.titleKannada}</div>
                      {s.titleEnglish && <div className="text-[10px] text-slate-400 truncate">{s.titleEnglish}</div>}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 shrink-0">
                      Preview ↗
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Worship Set Switcher */}
          {savedWorshipSets.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <ListMusic className="w-3.5 h-3.5 text-amber-400" />
                <span>Worship Sets</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {savedWorshipSets.map(set => (
                  <button
                    key={set.id}
                    onClick={() => handleSelectWorshipSet(set)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-bold text-slate-300 hover:text-white shrink-0 transition-all"
                  >
                    {set.name} ({set.songIds.length})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Preview Song Stanza Thumbnails */}
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
              <div className="min-w-0">
                <span className="text-amber-400 uppercase tracking-wider block text-[10px]">PREVIEW SONG</span>
                <span className="font-kannada text-sm text-white truncate block">
                  {previewSong?.titleKannada || 'Current Presentation'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {previewSlides.length} Stanzas
              </span>
            </div>

            {/* Thumbnails List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {previewSlides.map((s, idx) => {
                const isCurrentlyLive = liveState.displayMode === 'LIVE' &&
                  liveState.activeSongTitleKn === previewSong?.titleKannada &&
                  liveState.slideIndex === idx;
                const isCurrentPreview = idx === previewIndex;

                return (
                  <div
                    key={s.id + idx}
                    onClick={() => {
                      setPreviewIndex(idx);
                      handleGoLive(idx);
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isCurrentlyLive
                        ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/50 text-white shadow-lg'
                        : isCurrentPreview
                        ? 'bg-indigo-950/80 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="text-amber-400">{s.title || `Stanza ${idx + 1}`}</span>
                      <div className="flex items-center gap-1.5">
                        {isCurrentlyLive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                            LIVE
                          </span>
                        ) : isCurrentPreview ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700 text-[9px] font-bold">
                            PREVIEW
                          </span>
                        ) : null}
                        <span className="font-mono text-slate-400">#{idx + 1}</span>
                      </div>
                    </div>
                    <p className="font-kannada text-xs line-clamp-2 leading-relaxed text-slate-200">
                      {s.text || '[ Blank Slide ]'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ---------------------------------------------------- */}
        {/* RIGHT 2 COLUMNS: CURRENT LIVE vs PREVIEW PREVIEW CARDS */}
        {/* ---------------------------------------------------- */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          
          {/* Card 1: CONGREGATION LIVE DISPLAY CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-sm text-emerald-400 tracking-wider">
                  LIVE ON PROJECTOR — CONGREGATION VIEW
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Slide {liveState.slideIndex + 1} of {liveState.totalSlides}
              </div>
            </div>

            {/* Simulated Audience Screen Box */}
            <div 
              className="aspect-video bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative border border-slate-800 shadow-inner overflow-hidden"
              style={{
                background: liveState.theme.bgType === 'image' && liveState.theme.customBgImage
                  ? `url(${liveState.theme.customBgImage}) center/cover no-repeat`
                  : liveState.theme.background
              }}
            >
              {liveState.displayMode === 'BLACKOUT' ? (
                <div className="absolute inset-0 bg-black flex items-center justify-center text-rose-500 font-bold text-sm">
                  [ ⬛ BLACKOUT ACTIVE ]
                </div>
              ) : liveState.displayMode === 'LOGO' ? (
                <div className="flex flex-col items-center space-y-3 text-center text-white">
                  <img src="/assets/church-logo.png" alt="RCAG Worship Logo" className="w-16 h-16 object-contain drop-shadow-xl" />
                  <div className="font-kannada font-bold text-lg">ಕನ್ನಡ ಕ್ರೈಸ್ತ ಆರಾಧನೆ</div>
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">[ CHURCH LOGO IDLE ]</div>
                </div>
              ) : (
                <div 
                  className="absolute z-10 space-y-3 w-4/5"
                  style={{
                    top: `${liveState.theme.verticalPositionPercent || 10}%`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: liveState.theme.alignment || 'center'
                  }}
                >
                  {liveState.currentSlide.title && (
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-current"
                      style={{ color: liveState.theme.accentColor, borderColor: liveState.theme.accentColor }}
                    >
                      {liveState.currentSlide.title}
                    </span>
                  )}
                  {liveState.showChords && liveState.currentSlide.chords && (
                    <div className="text-amber-400 font-mono text-xs font-bold">
                      🎸 {liveState.currentSlide.chords}
                    </div>
                  )}
                  <div 
                    className="font-kannada font-bold text-lg md:text-xl leading-relaxed whitespace-pre-line drop-shadow-md"
                    style={{ 
                      color: liveState.theme.textColor, 
                      lineHeight: liveState.theme.lineHeight || 1.4 
                    }}
                  >
                    {liveState.currentSlide.text || '[ Blank Slide ]'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: OPERATOR PREVIEW & UPCOMING STAGE CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-sm text-indigo-300 tracking-wider">
                  OPERATOR PREVIEW — PREPARING NEXT
                </span>
              </div>
              <button
                onClick={() => handleGoLive()}
                className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-colors"
              >
                PUSH TO LIVE →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Active Preview Stanza */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                  <span>SELECTED PREVIEW ({previewIndex + 1})</span>
                  <span>{previewCurrentSlide.title}</span>
                </div>
                <div className="font-kannada font-bold text-sm text-white leading-relaxed whitespace-pre-line line-clamp-4">
                  {previewCurrentSlide.text || '[ Blank Stanza ]'}
                </div>
              </div>

              {/* Upcoming Next Stanza */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 opacity-80">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>UPCOMING NEXT ({previewIndex + 2})</span>
                  <span>{previewNextSlide?.title}</span>
                </div>
                {previewNextSlide ? (
                  <div className="font-kannada text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                    {previewNextSlide.text}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-4">End of Song / Worship Set</div>
                )}
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* ==================================================== */}
      {/* 4. MODALS & PRESENTER OVERLAYS */}
      {/* ==================================================== */}

      {/* Presenter Settings Drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
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

            {/* FONT SIZE CONTROL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase">Projector Lyric Font Size</label>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {liveState.theme.fontSizePx || 54} px
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLiveFontSizeChange((liveState.theme.fontSizePx || 54) - 2)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-lg flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="range"
                  min={32}
                  max={96}
                  step={2}
                  value={liveState.theme.fontSizePx || 54}
                  onChange={(e) => handleLiveFontSizeChange(Number(e.target.value))}
                  className="flex-1 accent-amber-400 cursor-pointer"
                />
                <button
                  onClick={() => handleLiveFontSizeChange((liveState.theme.fontSizePx || 54) + 2)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-lg flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] text-slate-500">💡 Font size updates live projector immediately in real time.</p>
            </div>

            {/* VERTICAL POSITION CONTROL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase">Projector Lyrics Vertical Position</label>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  Top {previewTheme.verticalPositionPercent || 10}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'TOP 10%', val: 10 },
                  { label: 'CENTER 35%', val: 35 },
                  { label: 'BOTTOM 50%', val: 50 },
                ].map(pos => (
                  <button
                    key={pos.val}
                    onClick={() => setPreviewTheme(prev => ({ ...prev, verticalPositionPercent: pos.val }))}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      (previewTheme.verticalPositionPercent || 10) === pos.val
                        ? 'border-amber-400 bg-indigo-950 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={previewTheme.verticalPositionPercent || 10}
                onChange={(e) => setPreviewTheme(prev => ({ ...prev, verticalPositionPercent: Number(e.target.value) }))}
                className="w-full accent-amber-400 cursor-pointer mt-1"
              />
            </div>

            {/* LINE HEIGHT CONTROL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase">Line Spacing Height</label>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {previewTheme.lineHeight || 1.4}
                </span>
              </div>
              <input
                type="range"
                min={1.2}
                max={2.0}
                step={0.1}
                value={previewTheme.lineHeight || 1.4}
                onChange={(e) => setPreviewTheme(prev => ({ ...prev, lineHeight: Number(e.target.value) }))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Themes Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Worship Themes</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPreviewTheme(t)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      previewTheme.id === t.id
                        ? 'border-amber-400 bg-indigo-950 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t.name}
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
                    onClick={() => setPreviewTheme(prev => ({ ...prev, alignment: align }))}
                    className={`py-2 text-xs font-bold uppercase rounded-xl border ${
                      previewTheme.alignment === align ? 'border-amber-400 bg-indigo-950 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Presenter Notes Overlay */}
      {showPresenterNotes && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-slate-950/95 border-l border-slate-800 p-6 flex flex-col justify-between text-white backdrop-blur-xl shadow-2xl animate-fade">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
              <Monitor className="w-4 h-4" />
              <span>Private Presenter Notes</span>
            </div>
            <button onClick={() => setShowPresenterNotes(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">LIVE SLIDE</div>
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 font-kannada text-sm leading-relaxed">
                {liveState.currentSlide.text}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PREVIEW SLIDE NOTES</div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-sans text-xs leading-relaxed text-slate-300">
                {previewCurrentSlide.notes || 'No private speaker notes added for this stanza.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsHelp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Operator Keyboard Shortcuts</span>
              </h3>
              <button onClick={() => setShowShortcutsHelp(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Next Live Slide</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">→</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Prev Live Slide</span>
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
                <span>Toggle Blackout</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">B</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Toggle Logo</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">L</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Presenter Notes</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">P</kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span>Thumbnails</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">T</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
