import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Play,
  Square,
  Sparkles,
  Eye,
  Tv,
  AlertTriangle,
  FileText,
  ExternalLink,
  Type,
  Palette,
  Sliders,
  Check
} from 'lucide-react';
import { PresentationSlide, LiveState, PRESET_THEMES, DisplayMode, PresentationMessage, PresentationTheme } from '../types/presentation';
import { PresentationChannel, openProjectorWindow, LOCAL_STORAGE_LIVE_STATE_KEY } from '../services/presentationChannel';
import { CHURCH_LOGO_URL, getAssetUrl } from '../utils/assetPath';

interface PreachingNotesPageProps {
  onNavigate: (path: string) => void;
}

export const PreachingNotesPage: React.FC<PreachingNotesPageProps> = ({ onNavigate }) => {
  // Session ID for preaching notes session
  const [sessionId] = useState<string>(() => `notes-session-${Date.now()}`);
  const channelRef = useRef<PresentationChannel | null>(null);

  // Connection & Handshake State
  const [isProjectorConnected, setIsProjectorConnected] = useState<boolean>(false);
  const lastPongTime = useRef<number>(0);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

  // Preaching Note Slides State (loaded from localStorage for refresh recovery)
  const [noteSlides, setNoteSlides] = useState<PresentationSlide[]>(() => {
    try {
      const saved = localStorage.getItem('kcs_preaching_notes_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'note-1',
        type: 'notes',
        title: 'Slide 1',
        text: ''
      }
    ];
  });

  // Operator UI States
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(0);
  const [liveNoteId, setLiveNoteId] = useState<string | null>(null);
  const [liveDisplayMode, setLiveDisplayMode] = useState<DisplayMode>('NOTES');
  const [liveFontSizePx, setLiveFontSizePx] = useState<number>(54);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [popupBlocked, setPopupBlocked] = useState<boolean>(false);

  // Active preaching theme & overlay opacity state
  const [activeTheme, setActiveTheme] = useState<PresentationTheme>(() => PRESET_THEMES.find(t => t.id === 'preaching') || PRESET_THEMES[0]);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(() => activeTheme.overlayOpacity || 0.20);

  // Ref tracking current liveState payload to answer REQUEST_LIVE_STATE requests from projector
  const currentLiveStateRef = useRef<LiveState | null>(null);

  // Helper to construct current live state payload
  const buildLivePayload = (
    mode: DisplayMode,
    slide?: PresentationSlide,
    overrideSlideIndex?: number,
    fontSizeOverride?: number,
    themeOverride?: PresentationTheme,
    opacityOverride?: number
  ): LiveState => {
    const currentSlidePayload = slide || (liveNoteId ? noteSlides.find(s => s.id === liveNoteId) : undefined) || {
      id: 'clear-notes',
      type: 'notes',
      title: '',
      text: ''
    };

    const sIndex = overrideSlideIndex !== undefined
      ? overrideSlideIndex
      : (liveNoteId ? noteSlides.findIndex(s => s.id === liveNoteId) : 0);

    const fSize = fontSizeOverride !== undefined ? fontSizeOverride : liveFontSizePx;
    const targetTheme = themeOverride || activeTheme;
    const targetOpacity = opacityOverride !== undefined ? opacityOverride : overlayOpacity;

    return {
      sessionId,
      senderId: channelRef.current?.windowId || 'op-notes',
      displayMode: mode,
      currentSlide: currentSlidePayload,
      slideIndex: Math.max(0, sIndex),
      totalSlides: noteSlides.length,
      activeSongTitleKn: 'ಪೂಜನ ಸಂದೇಶಗಳು',
      activeSongTitleEn: 'Preaching Notes',
      theme: {
        ...targetTheme,
        overlayOpacity: targetOpacity,
        fontSizePx: fSize
      },
      showChords: false,
      timestamp: Date.now()
    };
  };

  // ----------------------------------------------------
  // BROADCAST CHANNEL & HANDSHAKE INITIALIZATION
  // ----------------------------------------------------
  useEffect(() => {
    const handleMessage = (msg: PresentationMessage) => {
      console.log('[PREACHING NOTES] Received BroadcastChannel message:', msg.type, msg);

      if (msg.type === 'PONG') {
        // Audience window responded to PING
        lastPongTime.current = Date.now();
        setIsProjectorConnected(true);
      } else if (msg.type === 'REQUEST_LIVE_STATE') {
        // Audience window requested state on load/reload
        const stateToSend = currentLiveStateRef.current || buildLivePayload(liveDisplayMode);
        console.log('[PREACHING NOTES] Responding to REQUEST_LIVE_STATE with:', stateToSend);
        channelRef.current?.post('CURRENT_LIVE_STATE', stateToSend, sessionId);
      }
    };

    // Initialize Operator BroadcastChannel
    const channel = new PresentationChannel('operator', handleMessage);
    channelRef.current = channel;

    // Send initial handshake ping
    channel.post('PING', undefined, sessionId);
    channel.post('REQUEST_LIVE_STATE');

    // Heartbeat PING loop every 2 seconds
    heartbeatTimer.current = setInterval(() => {
      channel.post('PING', undefined, sessionId);
      if (Date.now() - lastPongTime.current > 4500) {
        setIsProjectorConnected(false);
      }
    }, 2000);

    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
      channel.close();
    };
  }, [sessionId, liveDisplayMode, activeTheme, overlayOpacity]);

  // Persist preaching notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kcs_preaching_notes_slides', JSON.stringify(noteSlides));
    } catch {}
  }, [noteSlides]);

  // Global Keyboard Shortcuts (B = Blackout, L = Logo when not focused in text inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        handleToggleBlackout();
      } else if (key === 'l') {
        e.preventDefault();
        handleToggleLogo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [liveNoteId, activeNoteIndex, noteSlides, liveDisplayMode, liveFontSizePx, activeTheme, overlayOpacity]);

  // Helper to publish live state over BroadcastChannel & localStorage
  const publishLiveState = (
    mode: DisplayMode,
    slide?: PresentationSlide,
    overrideSlideIndex?: number,
    fontSizeOverride?: number,
    themeOverride?: PresentationTheme,
    opacityOverride?: number
  ) => {
    const payload = buildLivePayload(mode, slide, overrideSlideIndex, fontSizeOverride, themeOverride, opacityOverride);
    currentLiveStateRef.current = payload;
    setLiveDisplayMode(mode);

    console.log('[PREACHING NOTES] Sending LIVE to BroadcastChannel:', mode, payload);

    // Save active live state to localStorage for popup recovery & audience sync
    try {
      localStorage.setItem(LOCAL_STORAGE_LIVE_STATE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to write live state to localStorage', e);
    }

    // Transmit message over BroadcastChannel
    if (mode === 'BLACKOUT') {
      channelRef.current?.post('BLACKOUT_TOGGLE', payload, sessionId);
    } else if (mode === 'LOGO') {
      channelRef.current?.post('LOGO_TOGGLE', payload, sessionId);
    } else if (payload.currentSlide.id === 'clear-notes' || !payload.currentSlide.text?.trim()) {
      channelRef.current?.post('NOTES_CLEAR', payload, sessionId);
    } else {
      channelRef.current?.post('NOTES_LIVE', payload, sessionId);
    }
  };

  // Launch Projector Audience Window
  const handleLaunchProjector = async () => {
    const result = await openProjectorWindow();
    if (result.popupBlocked) {
      setPopupBlocked(true);
    } else {
      setPopupBlocked(false);
    }
  };

  // ----------------------------------------------------
  // PREACHING NOTES ACTIONS & EDITOR CONTROLS
  // ----------------------------------------------------
  const handleAddSlide = () => {
    const newIdx = noteSlides.length;
    const newSlide: PresentationSlide = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'notes',
      title: `Slide ${newIdx + 1}`,
      text: ''
    };
    setNoteSlides(prev => [...prev, newSlide]);
    setActiveNoteIndex(newIdx);
    // PREVIEW ONLY: Adding slide does NOT alter projector!
  };

  const handleDeleteSlide = (indexToDelete: number) => {
    if (noteSlides.length <= 1) return; // Prevent deleting final remaining slide

    const slideToDelete = noteSlides[indexToDelete];
    const isDeletingLive = slideToDelete.id === liveNoteId;

    const updated = noteSlides.filter((_, idx) => idx !== indexToDelete);
    setNoteSlides(updated);

    if (activeNoteIndex >= updated.length) {
      setActiveNoteIndex(updated.length - 1);
    }

    if (isDeletingLive) {
      setLiveNoteId(null);
      publishLiveState('NOTES', { id: 'clear-notes', type: 'notes', title: '', text: '' }, 0);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setNoteSlides(prev => prev.map((s, idx) => idx === activeNoteIndex ? { ...s, title: newTitle } : s));
    // PREVIEW ONLY: Does NOT change live projector automatically!
  };

  const handleTextChange = (newText: string) => {
    setNoteSlides(prev => prev.map((s, idx) => idx === activeNoteIndex ? { ...s, text: newText } : s));
    // PREVIEW ONLY: Does NOT change live projector automatically!
  };

  // Publish target slide to projector
  const handleDisplaySlide = (targetIdx?: number) => {
    const idx = targetIdx !== undefined ? targetIdx : activeNoteIndex;
    const slideToPublish = noteSlides[idx];
    if (!slideToPublish) return;

    setLiveNoteId(slideToPublish.id);
    publishLiveState('NOTES', slideToPublish, idx);
  };

  // Direct Live Step Controls (Prev Live / Next Live)
  const handleLiveStep = (direction: 'prev' | 'next') => {
    let currentLiveIdx = liveNoteId ? noteSlides.findIndex(s => s.id === liveNoteId) : activeNoteIndex;
    if (currentLiveIdx === -1) currentLiveIdx = activeNoteIndex;

    let targetIdx = direction === 'next' ? currentLiveIdx + 1 : currentLiveIdx - 1;
    if (targetIdx < 0) targetIdx = 0;
    if (targetIdx >= noteSlides.length) targetIdx = noteSlides.length - 1;

    setActiveNoteIndex(targetIdx);
    handleDisplaySlide(targetIdx);
  };

  // Clear projector display
  const handleClearDisplay = () => {
    setLiveNoteId(null);
    publishLiveState('NOTES', { id: 'clear-notes', type: 'notes', title: '', text: '' }, 0);
  };

  // Toggle Blackout mode
  const handleToggleBlackout = () => {
    if (liveDisplayMode === 'BLACKOUT') {
      publishLiveState('NOTES');
    } else {
      publishLiveState('BLACKOUT');
    }
  };

  // Toggle Logo mode
  const handleToggleLogo = () => {
    if (liveDisplayMode === 'LOGO') {
      publishLiveState('NOTES');
    } else {
      publishLiveState('LOGO');
    }
  };

  // Live Font Size controls
  const handleLiveFontSizeChange = (newSizePx: number) => {
    const clamped = Math.max(32, Math.min(96, newSizePx));
    setLiveFontSizePx(clamped);
    if (liveNoteId) {
      publishLiveState(liveDisplayMode, undefined, undefined, clamped);
    }
  };

  // Theme & Overlay controls
  const handleSelectTheme = (themeToSet: PresentationTheme) => {
    setActiveTheme(themeToSet);
    const newOpacity = themeToSet.overlayOpacity !== undefined ? themeToSet.overlayOpacity : 0.20;
    setOverlayOpacity(newOpacity);
    if (liveNoteId && liveDisplayMode === 'NOTES') {
      publishLiveState('NOTES', undefined, undefined, undefined, themeToSet, newOpacity);
    }
  };

  const handleOverlayOpacityChange = (newOpacity: number) => {
    setOverlayOpacity(newOpacity);
    const updatedTheme = { ...activeTheme, overlayOpacity: newOpacity };
    setActiveTheme(updatedTheme);
    if (liveNoteId && liveDisplayMode === 'NOTES') {
      publishLiveState('NOTES', undefined, undefined, undefined, updatedTheme, newOpacity);
    }
  };

  // Exit navigation handling
  const handleExitClick = () => {
    if (liveNoteId && liveDisplayMode === 'NOTES') {
      setShowExitModal(true);
    } else {
      onNavigate('/');
    }
  };

  const handleConfirmExit = (clearProjector: boolean) => {
    setShowExitModal(false);
    if (clearProjector) {
      handleClearDisplay();
    }
    onNavigate('/');
  };

  const activeSlide = noteSlides[activeNoteIndex] || noteSlides[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between select-none pb-8">
      
      {/* ==================================================== */}
      {/* 1. TOP PAGE HEADER BAR */}
      {/* ==================================================== */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Exit Preaching Notes</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
              <span>🎤 Preaching Notes Studio</span>
            </h1>

            {/* Real-time Projector Connection Status Indicator */}
            {isProjectorConnected ? (
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🟢 Projector Connected</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/80 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>🟡 Waiting for Projector</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLaunchProjector}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 font-bold text-xs border border-indigo-700 transition-colors shadow-sm"
            title="Open dedicated projector window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Projector Window ↗</span>
          </button>

          <button
            onClick={() => handleDisplaySlide()}
            className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg hover:scale-105 transition-all ring-4 ring-purple-500/30"
          >
            <Play className="w-3.5 h-3.5 fill-current text-white" />
            <span>DISPLAY SLIDE {activeNoteIndex + 1}</span>
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

      {/* ==================================================== */}
      {/* 2. EMERGENCY CONTROL BAR & LIVE STEP CONTROLS */}
      {/* ==================================================== */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-3 px-6 flex flex-wrap items-center justify-between gap-4 shadow-inner">
        
        {/* Left: Direct Live Step Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLiveStep('prev')}
            disabled={!liveNoteId || noteSlides.findIndex(s => s.id === liveNoteId) <= 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Live</span>
          </button>

          {/* PROMINENT GO LIVE BUTTON */}
          <button
            onClick={() => handleDisplaySlide()}
            className="flex items-center gap-2 px-7 py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 text-white font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all ring-4 ring-purple-500/30"
          >
            <Play className="w-4 h-4 fill-current text-white" />
            <span>DISPLAY SLIDE</span>
          </button>

          <button
            onClick={() => handleLiveStep('next')}
            disabled={!liveNoteId || noteSlides.findIndex(s => s.id === liveNoteId) >= noteSlides.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span>Next Live</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Live Display Status Badge & Live Font Size */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Display Mode:</span>
            <span className={`px-3.5 py-1 rounded-full font-extrabold flex items-center gap-1.5 ${
              liveDisplayMode === 'BLACKOUT'
                ? 'bg-black text-rose-400 border border-rose-800'
                : liveDisplayMode === 'LOGO'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                : liveNoteId
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {liveDisplayMode === 'BLACKOUT' ? (
                <>
                  <Square className="w-3 h-3 fill-current text-rose-500" />
                  <span>⬛ BLACKOUT</span>
                </>
              ) : liveDisplayMode === 'LOGO' ? (
                <>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>✝ CHURCH LOGO</span>
                </>
              ) : liveNoteId ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>🟢 LIVE ON PROJECTOR</span>
                </>
              ) : (
                <>
                  <Square className="w-3 h-3 text-slate-400" />
                  <span>📜 DISPLAY CLEARED</span>
                </>
              )}
            </span>
          </div>

          {/* Real-Time Live Font Size Widget */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            <Type className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Projector Font:</span>
            <button
              onClick={() => handleLiveFontSizeChange(liveFontSizePx - 2)}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white flex items-center justify-center transition-colors"
              title="Decrease Live Projector Font Size"
            >
              -
            </button>
            <span className="font-mono font-extrabold text-amber-400 text-xs w-10 text-center">
              {liveFontSizePx}px
            </span>
            <button
              onClick={() => handleLiveFontSizeChange(liveFontSizePx + 2)}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white flex items-center justify-center transition-colors"
              title="Increase Live Projector Font Size"
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Emergency Clear, Blackout & Logo Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearDisplay}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition-colors"
            title="Clear text from projector screen"
          >
            <Square className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Display</span>
          </button>

          <button
            onClick={handleToggleBlackout}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition-colors ${
              liveDisplayMode === 'BLACKOUT'
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
              liveDisplayMode === 'LOGO'
                ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Church Logo idle control (L)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Logo (L)</span>
          </button>
        </div>

      </div>

      {/* ==================================================== */}
      {/* 3. MAIN WORKSPACE CONTAINER */}
      {/* ==================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COLUMN: SLIDE NAVIGATION TABS (4 Cols on Desktop) */}
        <div className="lg:col-span-4 bg-slate-900 border border-purple-500/30 rounded-3xl p-5 space-y-4 flex flex-col min-h-0 shadow-xl">
          
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Sermon Slides</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {noteSlides.length} Slide{noteSlides.length > 1 ? 's' : ''} Created
              </p>
            </div>

            <button
              onClick={handleAddSlide}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md transition-all border border-purple-400/30 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD SLIDE</span>
            </button>
          </div>

          {/* Scrollable Slide Tabs List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[580px]">
            {noteSlides.map((slide, idx) => {
              const isSelected = idx === activeNoteIndex;
              const isLive = slide.id === liveNoteId && liveDisplayMode === 'NOTES';

              return (
                <div
                  key={slide.id}
                  onClick={() => setActiveNoteIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col gap-2 ${
                    isLive
                      ? 'bg-purple-950/90 border-purple-500 ring-2 ring-purple-500/60 shadow-lg shadow-purple-950/50'
                      : isSelected
                      ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-200 truncate flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-purple-300 flex items-center justify-center text-[10px] font-mono font-extrabold border border-slate-700">
                        {idx + 1}
                      </span>
                      <span className="truncate">{slide.title || `Slide ${idx + 1}`}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLive && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-extrabold text-[10px] animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          LIVE
                        </span>
                      )}
                      {isSelected && !isLive && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold text-[10px]">
                          PREVIEW
                        </span>
                      )}
                      {noteSlides.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(idx);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 transition-colors"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-kannada line-clamp-2 leading-relaxed">
                    {slide.text.trim() ? slide.text : <span className="italic text-slate-600">(Empty note text)</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: EDITOR & LIVE MONITOR (8 Cols on Desktop) */}
        <div className="lg:col-span-8 space-y-5 flex flex-col min-h-0">

          {/* Main Sermon Text Editor Container */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            
            {/* Editor Bar Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-700 font-mono font-extrabold text-xs">
                  SLIDE {activeNoteIndex + 1} OF {noteSlides.length}
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  (Editing updates PREVIEW ONLY — Projector unchanged until DISPLAY SLIDE)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveNoteIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeNoteIndex <= 0}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-700 text-xs font-bold"
                >
                  ◀ Prev
                </button>

                <span className="text-xs font-mono font-bold text-slate-300">
                  {activeNoteIndex + 1} / {noteSlides.length}
                </span>

                <button
                  onClick={() => setActiveNoteIndex(prev => Math.min(noteSlides.length - 1, prev + 1))}
                  disabled={activeNoteIndex >= noteSlides.length - 1}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-700 text-xs font-bold"
                >
                  Next ▶
                </button>
              </div>
            </div>

            {/* Slide Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Slide Header / Title (Optional)</span>
                <span className="text-[10px] text-slate-500 font-normal">e.g. God's Grace / Point 1</span>
              </label>
              <input
                type="text"
                value={activeSlide.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={`Slide ${activeNoteIndex + 1} Title`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-bold placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Multiline Sermon Note Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Sermon Note Text (Kannada / English / Mixed)</span>
                <span className="text-[10px] font-mono text-purple-400">
                  {activeSlide.text.length} characters
                </span>
              </label>

              <textarea
                value={activeSlide.text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`Enter pastor's sermon notes here...\n\nExample:\nದೇವರ ಕೃಪೆಯು ನಮಗೆ ಸಾಕು.\nGod's grace is sufficient even when we are weak.`}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-base md:text-lg text-white font-kannada font-medium leading-relaxed placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-y min-h-[220px]"
              />
            </div>

            {/* Long Note Text Warning */}
            {(activeSlide.text.length > 320 || activeSlide.text.split('\n').length > 8) && (
              <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 px-4 text-xs text-amber-200 flex items-center gap-2.5 animate-fade">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Slide Text Warning:</strong> This slide text is relatively long. Consider creating an additional slide for better projector readability.
                </span>
              </div>
            )}

            {/* Live Indicator & Main Display Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-400">Projector Status:</span>
                {activeSlide.id === liveNoteId && liveDisplayMode === 'NOTES' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE ON PROJECTOR</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>PREVIEWING (NOT LIVE)</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleClearDisplay}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition-colors"
                  title="Clear projector screen display without deleting notes"
                >
                  <Square className="w-3.5 h-3.5 text-rose-400" />
                  <span>CLEAR DISPLAY</span>
                </button>

                <button
                  onClick={() => handleDisplaySlide()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg hover:scale-105 transition-all ring-4 ring-purple-500/30"
                  title="Publish currently selected slide to live projector"
                >
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span>DISPLAY SLIDE {activeNoteIndex + 1}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Preaching Presentation Theme & Background Image Selector Card */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2 text-white">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Preaching Background & Theme</span>
              </span>
              <span className="text-[11px] font-mono text-purple-300 font-bold">
                {activeTheme.name}
              </span>
            </div>

            {/* Theme Preset Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_THEMES.filter(t => t.id === 'preaching' || t.id === 'preachingSanctuary' || t.id === 'communion' || t.id === 'bible' || t.id === 'cross' || t.id === 'prayer' || t.id === 'midnight').map((themeOption) => {
                const isSelected = activeTheme.id === themeOption.id;
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => handleSelectTheme(themeOption)}
                    className={`relative rounded-xl overflow-hidden border p-2 text-left transition-all h-20 flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/60 shadow-md scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      background: themeOption.bgType === 'image' && themeOption.customBgImage
                        ? `url(${getAssetUrl(themeOption.customBgImage)}) center/cover no-repeat`
                        : themeOption.background
                    }}
                  >
                    {/* Dark Overlay Preview */}
                    <div
                      className="absolute inset-0 bg-black pointer-events-none"
                      style={{ opacity: themeOption.overlayOpacity || 0.25 }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="text-[10px] font-extrabold text-white bg-slate-950/80 px-1.5 py-0.5 rounded backdrop-blur-xs truncate max-w-[85%]">
                        {themeOption.name}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Background Overlay Darkness Slider */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Background Overlay Darkness:</span>
                <span className="font-mono text-purple-300 font-extrabold">{Math.round(overlayOpacity * 100)}%</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-[10px] text-slate-500 font-normal">Visible Image</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => handleOverlayOpacityChange(parseFloat(e.target.value))}
                  className="w-36 accent-purple-500 cursor-pointer"
                  title="Adjust background overlay darkness percentage"
                />
                <span className="text-[10px] text-slate-500 font-normal">Dark Contrast</span>
              </div>
            </div>
          </div>

          {/* Operator Projector Live Monitor Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-2 text-white">
                <Tv className="w-4 h-4 text-purple-400" />
                <span>Audience Projector Monitor (Live Output)</span>
              </span>
              <span className="font-mono text-[10px] text-purple-400 uppercase font-extrabold">
                Strict Top-Center Position ({liveFontSizePx}px)
              </span>
            </div>

            <div
              className="rounded-2xl p-6 min-h-[160px] relative overflow-hidden flex flex-col items-center justify-start text-center border border-slate-800 transition-all"
              style={{
                background: activeTheme.bgType === 'image' && activeTheme.customBgImage
                  ? `url(${getAssetUrl(activeTheme.customBgImage)}) center/cover no-repeat`
                  : activeTheme.background
              }}
            >
              {/* Dark Overlay inside monitor preview */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  backgroundColor: '#000000',
                  opacity: liveDisplayMode === 'BLACKOUT' ? 1 : overlayOpacity
                }}
              />

              <div className="relative z-10 w-full flex flex-col items-center justify-start h-full my-auto">
                {liveDisplayMode === 'BLACKOUT' ? (
                  <div className="text-rose-400 font-mono text-xs font-bold flex items-center justify-center gap-2 my-auto">
                    <Square className="w-4 h-4 fill-current" />
                    <span>[ BLACKOUT MODE ACTIVE ]</span>
                  </div>
                ) : liveDisplayMode === 'LOGO' ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-center my-auto animate-fade">
                    <img src={CHURCH_LOGO_URL} alt="RCAG Logo" className="w-12 h-12 object-contain drop-shadow-md" />
                    <h3 className="font-kannada font-bold text-sm text-white drop-shadow">ಕನ್ನಡ ಕ್ರೈಸ್ತ ಆರಾಧನೆ</h3>
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">[ CHURCH LOGO MODE ]</p>
                  </div>
                ) : liveNoteId && noteSlides.find(s => s.id === liveNoteId)?.text.trim() ? (
                  <div className="space-y-3 w-full max-w-lg pt-2 animate-fade">
                    {noteSlides.find(s => s.id === liveNoteId)?.title && (
                      <div className="inline-block px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-amber-300 font-bold text-xs uppercase tracking-wider shadow">
                        {noteSlides.find(s => s.id === liveNoteId)?.title}
                      </div>
                    )}
                    <p
                      className="text-white font-kannada font-bold leading-relaxed whitespace-pre-line drop-shadow-lg"
                      style={{
                        fontSize: `${Math.min(26, liveFontSizePx * 0.45)}px`,
                        textShadow: '0 2px 8px rgba(0,0,0,0.9)'
                      }}
                    >
                      {noteSlides.find(s => s.id === liveNoteId)?.text}
                    </p>
                  </div>
                ) : (
                  <div className="text-slate-300 text-xs font-medium my-auto animate-pulse flex flex-col items-center gap-2">
                    <Square className="w-6 h-6 opacity-60" />
                    <span>[ Projector Display Cleared / Neutral ]</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ==================================================== */}
      {/* 4. EXIT CONFIRMATION MODAL */}
      {/* ==================================================== */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-wide">
                Preaching Notes Active
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Preaching Notes are currently being displayed live on the audience projector screen.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleConfirmExit(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-md"
              >
                Clear & Exit
              </button>

              <button
                onClick={() => handleConfirmExit(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors border border-slate-700"
              >
                Exit Without Clearing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
