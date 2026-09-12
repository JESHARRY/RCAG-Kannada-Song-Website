import React, { useState, useEffect, useRef } from 'react';
import { CHURCH_LOGO_URL, getAssetUrl } from '../utils/assetPath';
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
  Shield,
  Plus,
  Trash2,
  FileText,
  CheckCircle2
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
  // END WORSHIP & PREACHING NOTES NAVIGATION
  // ----------------------------------------------------
  const [showEndWorshipModal, setShowEndWorshipModal] = useState<boolean>(false);

  const handleStartPreachingNotes = () => {
    setShowEndWorshipModal(false);
    onNavigate('/preaching-notes');
  };

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

        {/* Right: Emergency Blackout, Logo & End Worship Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEndWorshipModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md border border-purple-400/40 transition-all hover:scale-105"
            title="Complete worship presentation & switch to preaching notes mode"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>END WORSHIP</span>
          </button>

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
      {/* 2B. SERVICE BACKGROUND THEME CONTROL BAR */}
      {/* ==================================================== */}
      <div className="bg-slate-950/90 border-b border-slate-800 p-3 px-4 sm:px-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-white tracking-wide uppercase text-xs">
              BACKGROUND VISUAL GALLERY
            </h3>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              (Click background card to PREVIEW — Click APPLY to publish to Projector)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Background Overlay Visibility Slider */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] font-bold">Background Visibility:</span>
              <span className="text-[10px] text-slate-500 font-mono">Clearer</span>
              <input
                type="range"
                min={0.10}
                max={0.65}
                step={0.05}
                value={previewTheme.overlayOpacity !== undefined ? previewTheme.overlayOpacity : 0.25}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPreviewTheme(prev => ({ ...prev, overlayOpacity: val }));
                }}
                className="w-20 accent-amber-400 cursor-pointer"
                title="Adjust background visibility / dark overlay opacity"
              />
              <span className="text-[10px] text-slate-500 font-mono">Darker</span>
              <span className="font-mono text-amber-400 text-xs font-bold w-9 text-right">
                {Math.round((1 - (previewTheme.overlayOpacity !== undefined ? previewTheme.overlayOpacity : 0.25)) * 100)}%
              </span>
            </div>

            <button
              onClick={() => {
                const defaultTheme = PRESET_THEMES.find(t => t.id === 'worship') || PRESET_THEMES[0];
                setPreviewTheme(defaultTheme);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 font-bold text-xs transition-colors"
              title="Reset background theme to Default (General Worship)"
            >
              Reset Background
            </button>

            <button
              onClick={() => handleGoLive()}
              className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg hover:scale-105 transition-all border border-emerald-400/40"
              title="Apply selected theme & active stanza to live projector"
            >
              APPLY TO PROJECTOR
            </button>
          </div>
        </div>

        {/* Thumbnail Cards Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-800">
          {PRESET_THEMES.map((t) => {
            const isPreview = previewTheme.id === t.id;
            const isLive = liveState.theme.id === t.id && liveState.displayMode === 'LIVE';

            return (
              <button
                key={t.id}
                onClick={() => setPreviewTheme(t)}
                className={`group relative shrink-0 w-36 sm:w-40 h-20 rounded-2xl overflow-hidden border transition-all text-left flex flex-col justify-end p-2.5 shadow-md ${
                  isPreview
                    ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-amber-950/40 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01]'
                }`}
                style={{
                  background: t.bgType === 'image' && t.customBgImage
                    ? `url(${getAssetUrl(t.customBgImage)}) center/cover no-repeat`
                    : t.background
                }}
              >
                {/* Overlay inside thumbnail card */}
                <div
                  className="absolute inset-0 bg-black transition-opacity pointer-events-none"
                  style={{ opacity: t.overlayOpacity !== undefined ? Math.min(0.4, t.overlayOpacity) : 0.25 }}
                />

                {/* Status Badges */}
                <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1">
                  {isLive && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                      LIVE
                    </span>
                  )}
                  {isPreview && !isLive && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider shadow">
                      PREVIEW
                    </span>
                  )}
                </div>

                {/* Card Title */}
                <div className="relative z-10 space-y-0.5">
                  <span className="font-bold text-xs text-white leading-tight block drop-shadow-md truncate">
                    {t.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
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
                  placeholder="Search song title or number..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                {songSearchQuery && (
                  <button
                    onClick={() => setSongSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {songSearchQuery.trim() !== '' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 space-y-1 max-h-48 overflow-y-auto shadow-xl">
                  {searchResults.length > 0 ? (
                    searchResults.map(song => (
                      <button
                        key={song.id}
                        onClick={() => handleSelectPreviewSong(song)}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <div className="font-kannada font-bold text-xs text-amber-300 truncate">
                            {song.number}. {song.titleKannada}
                          </div>
                          {song.titleEnglish && (
                            <div className="text-[10px] text-slate-400 truncate">
                              {song.titleEnglish}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                          Load Preview
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 p-2 text-center">No songs match your search</div>
                  )}
                </div>
              )}
            </div>

            {/* Saved Worship Sets Picker */}
            {savedWorshipSets.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <ListMusic className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Saved Worship Sets</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedWorshipSets.map(set => (
                    <button
                      key={set.id}
                      onClick={() => handleSelectWorshipSet(set)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-700 text-xs font-bold text-slate-300 transition-colors"
                    >
                      🎵 {set.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Preview Song Info & Stanza List */}
            <div className="flex-1 flex flex-col min-h-0 space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-kannada font-bold text-sm text-amber-400">
                    {previewSong?.titleKannada || 'No Song Loaded'}
                  </h3>
                  {previewSong?.titleEnglish && (
                    <p className="text-[11px] text-slate-400 font-medium">{previewSong.titleEnglish}</p>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                  {previewSlides.length} Stanzas
                </span>
              </div>

              {/* Stanza Thumbnails Card Grid */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                {previewSlides.map((slide, idx) => {
                  const isSelected = idx === previewIndex;
                  const isLiveOnProjector = liveState.displayMode === 'LIVE' && liveState.slideIndex === idx && liveState.activeSongTitleKn === previewSong?.titleKannada;

                  return (
                    <div
                      key={slide.id + idx}
                      onClick={() => {
                        setPreviewIndex(idx);
                        handleGoLive(idx);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                        isLiveOnProjector
                          ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                          : isSelected
                          ? 'bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500/40'
                          : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          slide.type === 'chorus' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {slide.title || `Stanza ${idx + 1}`}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isLiveOnProjector && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-extrabold text-[10px] animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              LIVE
                            </span>
                          )}
                          {isSelected && !isLiveOnProjector && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold text-[10px]">
                              PREVIEW
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="font-kannada text-xs text-slate-300 font-medium leading-relaxed line-clamp-3">
                        {slide.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ---------------------------------------------------- */}
          {/* RIGHT COLUMN: LIVE PROJECTOR CANVAS & AUDIENCE VIEW  */}
          {/* ---------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-5 flex flex-col min-h-0">

            {/* Main Congregation Projector View Sandbox */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex-1 flex flex-col min-h-0 shadow-xl">

              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-2 text-white">
                  <Tv className="w-4 h-4 text-emerald-400" />
                  <span>Audience Screen Monitor</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400 uppercase font-extrabold">
                  {liveState.displayMode} MODE
                </span>
              </div>

              {/* Simulated Projector Frame Screen */}
              <div
                className="flex-1 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 min-h-[280px] border border-slate-800 shadow-inner select-none transition-all duration-300"
                style={{
                  background: liveState.displayMode === 'BLACKOUT'
                    ? '#000000'
                    : liveState.displayMode === 'LOGO'
                    ? 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
                    : liveState.theme.bgType === 'image' && liveState.theme.customBgImage
                    ? `url(${getAssetUrl(liveState.theme.customBgImage)}) center/cover no-repeat`
                    : liveState.theme.background
                }}
              >
                {/* Background Dark Overlay for Image Themes */}
                {liveState.displayMode === 'LIVE' && liveState.theme.overlayOpacity > 0 && (
                  <div
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
                    style={{ opacity: liveState.theme.overlayOpacity }}
                  />
                )}

                {liveState.displayMode === 'BLACKOUT' ? (
                  <div className="text-slate-600 font-mono text-xs uppercase tracking-widest flex items-center gap-2 relative z-10">
                    <Square className="w-4 h-4 fill-current text-rose-500" />
                    <span>Blackout Mode Active</span>
                  </div>
                ) : liveState.displayMode === 'LOGO' ? (
                  <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade relative z-10">
                    <img
                      src={CHURCH_LOGO_URL}
                      alt="RCAG Worship Logo"
                      className="w-20 h-20 object-contain drop-shadow-xl animate-pulse"
                    />
                    <h2 className="font-kannada font-bold text-2xl text-white">
                      ಕನ್ನಡ ಕ್ರೈಸ್ತ ಆರಾಧನೆ
                    </h2>
                    <p className="text-amber-400 font-sans font-extrabold text-xs tracking-widest uppercase">
                      RCAG Worship Presentation
                    </p>
                  </div>
                ) : (
                  <div className="w-full space-y-4 text-center animate-fade max-w-xl relative z-10">
                    {liveState.currentSlide.title && (
                      <div
                        className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border"
                        style={{
                          color: liveState.theme.accentColor,
                          borderColor: liveState.theme.accentColor
                        }}
                      >
                        {liveState.currentSlide.title}
                      </div>
                    )}
                    <div
                      className="font-kannada font-bold leading-relaxed drop-shadow-md whitespace-pre-line"
                      style={{
                        color: liveState.theme.textColor,
                        fontSize: `${Math.min(32, (liveState.theme.fontSizePx || 54) * 0.55)}px`
                      }}
                    >
                      {liveState.currentSlide.text}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Next Stanza Preview Monitor Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Up Next Stanza Preview</span>
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">
                  {previewNextSlide?.title || 'End of Stanzas'}
                </span>
              </div>
              {previewNextSlide ? (
                <div className="font-kannada text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  {previewNextSlide.text}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic py-2 text-center bg-slate-950 rounded-2xl border border-slate-800">
                  End of current song stanzas
                </div>
              )}
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
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Visual Worship Themes Gallery</label>
              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPreviewTheme(t)}
                    className={`h-20 p-2.5 rounded-2xl border text-left text-xs font-bold transition-all relative overflow-hidden flex flex-col justify-end ${
                      previewTheme.id === t.id
                        ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    style={{
                      background: t.bgType === 'image' && t.customBgImage
                        ? `url(${getAssetUrl(t.customBgImage)}) center/cover no-repeat`
                        : t.background
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-black pointer-events-none"
                      style={{ opacity: t.overlayOpacity !== undefined ? Math.min(0.4, t.overlayOpacity) : 0.25 }}
                    />
                    <span className="relative z-10 text-white font-bold drop-shadow-md text-xs">
                      {t.name}
                    </span>
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

      {/* End Worship Confirmation Modal */}
      {showEndWorshipModal && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-950/80 border border-purple-500/50 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-wide">
                Worship Presentation Completed
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                The worship presentation is complete. Would you like to launch <strong>Preaching Notes Mode</strong> for pastor's sermon notes?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowEndWorshipModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors border border-slate-700"
              >
                Return to Presentation
              </button>

              <button
                onClick={handleStartPreachingNotes}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg transition-all border border-purple-400/40 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>Start Preaching Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
