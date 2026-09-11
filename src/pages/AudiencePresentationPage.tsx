import React, { useState, useEffect, useRef } from 'react';
import { PresentationChannel } from '../services/presentationChannel';
import { LiveState, PresentationMessage, PRESET_THEMES } from '../types/presentation';
import { CHURCH_LOGO_URL } from '../utils/assetPath';

export const AudiencePresentationPage: React.FC = () => {
  const [liveState, setLiveState] = useState<LiveState | null>(() => {
    // Try restoring state from localStorage if available
    try {
      const saved = localStorage.getItem('kcs_active_live_state');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return null;
  });

  const channelRef = useRef<PresentationChannel | null>(null);
  const handshakeRetryCount = useRef(0);
  const handshakeTimer = useRef<NodeJS.Timeout | null>(null);
  const liveStateRef = useRef<LiveState | null>(liveState);
  useEffect(() => {
    liveStateRef.current = liveState;
  }, [liveState]);

  useEffect(() => {
    const handleMessage = (msg: PresentationMessage) => {
      console.log('[AUDIENCE] Received message:', msg.type, msg);

      if (msg.type === 'PING') {
        // Respond to heartbeat PING from operator with latest ref state
        channelRef.current?.post('PONG', liveStateRef.current || undefined, liveStateRef.current?.sessionId);
        return;
      }

      if (msg.type === 'CURRENT_LIVE_STATE' || msg.type === 'GO_LIVE' || msg.type === 'LIVE_STATE_UPDATE' || msg.type === 'NOTES_LIVE' || msg.type === 'NOTES_CLEAR' || msg.type === 'BLACKOUT_TOGGLE' || msg.type === 'LOGO_TOGGLE') {
        if (msg.payload) {
          console.log('[AUDIENCE] Switching displayMode to:', msg.payload.displayMode, 'Slide:', msg.payload.currentSlide);
          setLiveState(msg.payload);
          liveStateRef.current = msg.payload;
          try {
            localStorage.setItem('kcs_active_live_state', JSON.stringify(msg.payload));
          } catch {}
        } else if (msg.type === 'BLACKOUT_TOGGLE') {
          setLiveState(prev => {
            const next = prev ? { ...prev, displayMode: 'BLACKOUT' as const } : null;
            liveStateRef.current = next;
            return next;
          });
        } else if (msg.type === 'LOGO_TOGGLE') {
          setLiveState(prev => {
            const next = prev ? { ...prev, displayMode: 'LOGO' as const } : null;
            liveStateRef.current = next;
            return next;
          });
        }
      } else if (msg.type === 'NOTES_MODE_START') {
        setLiveState(prev => {
          const next = prev ? { ...prev, displayMode: 'NOTES' as const } : null;
          liveStateRef.current = next;
          return next;
        });
      } else if (msg.type === 'NOTES_MODE_END' || msg.type === 'PRESENTATION_STOP') {
        setLiveState(prev => {
          const next = prev ? { ...prev, displayMode: 'LOGO' as const } : null;
          liveStateRef.current = next;
          return next;
        });
      }
    };

    // Initialize Audience Channel
    const channel = new PresentationChannel('audience', handleMessage);
    channelRef.current = channel;

    // Send initial REQUEST_LIVE_STATE handshake
    channel.post('REQUEST_LIVE_STATE');

    // Handshake Retry Loop (retries every 500ms up to 6 attempts until state is acquired)
    handshakeTimer.current = setInterval(() => {
      if (handshakeRetryCount.current < 6) {
        handshakeRetryCount.current += 1;
        channel.post('REQUEST_LIVE_STATE');
      } else {
        if (handshakeTimer.current) clearInterval(handshakeTimer.current);
      }
    }, 500);

    return () => {
      if (handshakeTimer.current) clearInterval(handshakeTimer.current);
      channel.close();
    };
  }, []);

  // Keyboard shortcut F for native fullscreen toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Double click for fullscreen toggle
  const handleDoubleClick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Default theme fallback
  const theme = liveState?.theme || PRESET_THEMES[0];
  const displayMode = liveState?.displayMode || 'LOGO';
  const currentSlide = liveState?.currentSlide;

  const fontSizePx = theme.fontSizePx || 54;
  const verticalPos = theme.verticalPositionPercent !== undefined ? theme.verticalPositionPercent : 10;
  const lineHeightVal = theme.lineHeight || 1.4;

  // 1. BLACKOUT MODE
  if (displayMode === 'BLACKOUT') {
    return (
      <div
        onDoubleClick={handleDoubleClick}
        className="fixed inset-0 z-[99999] bg-black w-screen h-screen overflow-hidden select-none cursor-none"
      />
    );
  }

  // 2. LOGO / BRANDING IDLE MODE
  if (displayMode === 'LOGO' || !currentSlide) {
    return (
      <div
        onDoubleClick={handleDoubleClick}
        className="fixed inset-0 z-[99999] bg-slate-950 text-white w-screen h-screen overflow-hidden select-none flex flex-col items-center justify-center p-8 cursor-pointer"
        style={{
          background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
        }}
      >
        <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade max-w-xl">
          <img
            src={CHURCH_LOGO_URL}
            alt="RCAG Worship Logo"
            className="w-36 h-36 object-contain drop-shadow-2xl animate-pulse"
            onError={(e) => {
              // Fallback if asset fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          <div className="space-y-2">
            <h1 className="font-kannada font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-wide drop-shadow-md">
              ಕನ್ನಡ ಕ್ರೈಸ್ತ ಆರಾಧನೆ
            </h1>
            <p className="text-amber-400 font-sans font-extrabold text-xl md:text-2xl tracking-widest uppercase">
              RCAG Worship Presentation
            </p>
          </div>

          <div className="pt-8 text-xs font-semibold text-slate-500 tracking-wider">
            Press <kbd className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">F</kbd> for Fullscreen Projection
          </div>
        </div>
      </div>
    );
  }

  // 3. PREACHING NOTES DISPLAY MODE (Strict Top-Center Layout)
  if (displayMode === 'NOTES' || currentSlide?.type === 'notes') {
    const isNotesCleared = !currentSlide || currentSlide.id === 'clear-notes' || !currentSlide.text?.trim();

    return (
      <div
        onDoubleClick={handleDoubleClick}
        className="fixed inset-0 z-[99999] bg-black w-screen h-screen overflow-hidden select-none cursor-none"
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

        {/* Top Header Bar */}
        <div className="absolute top-6 left-8 right-8 z-20 flex items-center justify-between opacity-70 text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 pointer-events-none">
          <div>
            <span className="font-sans text-purple-400 font-extrabold text-sm md:text-base mr-3 tracking-wider">
              📜 PREACHING NOTES
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-purple-400 font-extrabold text-xs">LIVE</span>
          </div>
        </div>

        {/* Main Notes Canvas: Positioned strictly TOP-CENTER (top: clamp(32px, 5vh, 96px), left: 50%) */}
        {!isNotesCleared && currentSlide && (
          <div
            className="absolute z-10 space-y-6 animate-fade"
            style={{
              top: 'clamp(32px, 5vh, 96px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'clamp(300px, 88vw, 1400px)',
              textAlign: theme.alignment || 'center'
            }}
          >
            {/* Optional Slide Title */}
            {currentSlide.title && currentSlide.title.trim() !== '' && (
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm md:text-base uppercase tracking-widest bg-purple-950/60 border border-purple-500/50 text-amber-300 backdrop-blur-md shadow-lg">
                {currentSlide.title}
              </div>
            )}

            {/* Note Content Body */}
            <div
              className="font-bold whitespace-pre-line tracking-wide drop-shadow-2xl font-kannada"
              style={{
                color: theme.textColor || '#ffffff',
                fontSize: `${fontSizePx}px`,
                lineHeight: lineHeightVal || 1.4,
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.95)'
              }}
            >
              {currentSlide.text}
            </div>
          </div>
        )}

        {/* Bottom Footer Bar */}
        <div className="absolute bottom-6 left-8 right-8 z-20 flex items-center justify-between text-xs font-bold text-slate-400 opacity-60 pointer-events-none">
          <span>RCAG Preaching Notes</span>
          {liveState && liveState.totalSlides > 0 && !isNotesCleared && (
            <span>
              Slide <span className="font-mono text-purple-400 font-extrabold">{liveState.slideIndex + 1}</span> of <span className="font-mono">{liveState.totalSlides}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. LIVE PRESENTATION MODE (Top-Center Layout for Lyrics)
  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="fixed inset-0 z-[99999] bg-black w-screen h-screen overflow-hidden select-none cursor-none"
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

      {/* Top Header Bar: Optional Song Title & Live Badge */}
      <div className="absolute top-6 left-8 right-8 z-20 flex items-center justify-between opacity-70 text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 pointer-events-none">
        <div>
          {liveState?.activeSongTitleKn && (
            <span className="font-kannada text-amber-400 font-bold text-base md:text-lg mr-3">
              {liveState.activeSongTitleKn}
            </span>
          )}
          {liveState?.activeSongTitleEn && (
            <span className="font-sans text-slate-300 font-medium">
              ({liveState.activeSongTitleEn})
            </span>
          )}
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-extrabold text-xs">LIVE</span>
        </div>
      </div>

      {/* Main Stanza Content Canvas (POSITIONED NEAR TOP, HORIZONTALLY CENTERED) */}
      <div
        className="absolute z-10 space-y-6"
        style={{
          top: `${verticalPos}%`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '88%',
          textAlign: theme.alignment || 'center'
        }}
      >
        {currentSlide.type === 'blank' ? (
          <div className="text-slate-600 text-sm font-medium animate-pulse text-center">
            [ Worship Pause ]
          </div>
        ) : (
          <div
            key={currentSlide.id + liveState?.slideIndex}
            className={`w-full space-y-5 transition-all duration-300 ${
              theme.transition === 'slide-left' ? 'anim-slide-left' :
              theme.transition === 'slide-right' ? 'anim-slide-right' :
              theme.transition === 'zoom' ? 'anim-zoom' : 'anim-fade'
            }`}
            style={{
              color: theme.textColor,
              fontFamily: theme.fontFamily === 'Noto Sans Kannada' ? '"Noto Sans Kannada", sans-serif' : '"Outfit", sans-serif'
            }}
          >
            {/* Stanza Badge Header */}
            {currentSlide.title && (
              <div
                className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest border border-current opacity-80 backdrop-blur-sm"
                style={{ borderColor: theme.accentColor, color: theme.accentColor }}
              >
                {currentSlide.title}
              </div>
            )}

            {/* Chords Display if enabled */}
            {liveState?.showChords && currentSlide.chords && (
              <div className="text-amber-400 font-mono font-bold text-xl md:text-2xl tracking-wider py-1 drop-shadow-md">
                🎸 Chords: {currentSlide.chords}
              </div>
            )}

            {/* Lyric Content Text (Explicit Font Size & Line Height) */}
            <div
              className="font-bold whitespace-pre-line tracking-wide drop-shadow-2xl"
              style={{
                fontSize: `${fontSizePx}px`,
                lineHeight: lineHeightVal
              }}
            >
              {currentSlide.text}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Bar: Slide Progress */}
      <div className="absolute bottom-6 left-8 right-8 z-20 flex items-center justify-between text-xs font-bold text-slate-400 opacity-60 pointer-events-none">
        <span>RCAG Kannada Worship</span>
        <span>
          Slide <span className="font-mono text-amber-400 font-extrabold">{liveState ? liveState.slideIndex + 1 : 1}</span> of <span className="font-mono">{liveState ? liveState.totalSlides : 1}</span>
        </span>
      </div>
    </div>
  );
};
