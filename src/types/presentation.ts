export type SlideType = 'title' | 'lyrics' | 'chorus' | 'blank' | 'scripture' | 'announcement' | 'notes';

export type DisplayMode = 'LIVE' | 'BLACKOUT' | 'LOGO' | 'NOTES';

export interface PresentationSlide {
  id: string;
  type: SlideType;
  songId?: string;
  songTitleKn?: string;
  songTitleEn?: string;
  title?: string; // Stanza label or slide header e.g. "Verse 1", "Chorus"
  text: string;
  chords?: string;
  notes?: string;
}

export interface PresentationTheme {
  id: string;
  name: string;
  bgType: 'solid' | 'gradient' | 'image';
  background: string;
  textColor: string;
  accentColor: string;
  overlayOpacity: number;
  fontFamily: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fontSizePx?: number; // Configurable font size in px e.g. 54 (range 32-96)
  verticalPositionPercent?: number; // Configurable top offset % e.g. 10 (range 5-50)
  lineHeight?: number; // Configurable line height e.g. 1.4 (range 1.2-2.0)
  fontWeight: 'normal' | 'medium' | 'bold';
  alignment: 'left' | 'center' | 'right';
  verticalPosition: 'top' | 'center' | 'bottom';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  transition: 'none' | 'fade' | 'dissolve' | 'slide-left' | 'slide-right' | 'zoom' | 'crossfade';
  textAnimation: 'none' | 'fade-in' | 'rise';
  customBgImage?: string;
  blur?: number;
}

export interface LiveState {
  sessionId: string;
  senderId: string;
  displayMode: DisplayMode;
  currentSlide: PresentationSlide;
  nextSlide?: PresentationSlide;
  slideIndex: number;
  totalSlides: number;
  activeSongTitleKn?: string;
  activeSongTitleEn?: string;
  theme: PresentationTheme;
  showChords: boolean;
  timestamp: number;
}

export type PresentationMessageType = 
  | 'REQUEST_LIVE_STATE'
  | 'CURRENT_LIVE_STATE'
  | 'GO_LIVE'
  | 'LIVE_STATE_UPDATE'
  | 'BLACKOUT_TOGGLE'
  | 'LOGO_TOGGLE'
  | 'PRESENTATION_STOP'
  | 'NOTES_MODE_START'
  | 'NOTES_MODE_END'
  | 'NOTES_LIVE'
  | 'NOTES_CLEAR'
  | 'PING'
  | 'PONG';

export interface PresentationMessage {
  type: PresentationMessageType;
  senderId: string;
  sessionId?: string;
  payload?: LiveState;
  timestamp: number;
}

export interface WorshipPresentation {
  id: string;
  name: string;
  songIds: string[];
  slides: PresentationSlide[];
  theme: PresentationTheme;
  showChords: boolean;
  autoPlay: boolean;
  autoPlayIntervalSec: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorshipSet {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const PRESET_THEMES: PresentationTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight Worship',
    bgType: 'gradient',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)',
    textColor: '#ffffff',
    accentColor: '#f59e0b',
    overlayOpacity: 0.2,
    fontFamily: 'Noto Sans Kannada',
    fontSize: 'xl',
    fontSizePx: 54,
    verticalPositionPercent: 10,
    lineHeight: 1.4,
    fontWeight: 'bold',
    alignment: 'center',
    verticalPosition: 'top',
    lineSpacing: 'normal',
    transition: 'fade',
    textAnimation: 'fade-in'
  },
  {
    id: 'royal',
    name: 'Royal Worship',
    bgType: 'gradient',
    background: 'linear-gradient(135deg, #31104b 0%, #1e1b4b 60%, #0f172a 100%)',
    textColor: '#f8fafc',
    accentColor: '#fbbf24',
    overlayOpacity: 0.25,
    fontFamily: 'Noto Sans Kannada',
    fontSize: 'xl',
    fontSizePx: 54,
    verticalPositionPercent: 10,
    lineHeight: 1.4,
    fontWeight: 'bold',
    alignment: 'center',
    verticalPosition: 'top',
    lineSpacing: 'normal',
    transition: 'dissolve',
    textAnimation: 'fade-in'
  },
  {
    id: 'minimal',
    name: 'Minimal Dark',
    bgType: 'solid',
    background: '#090d16',
    textColor: '#ffffff',
    accentColor: '#6366f1',
    overlayOpacity: 0,
    fontFamily: 'Noto Sans Kannada',
    fontSize: '2xl',
    fontSizePx: 58,
    verticalPositionPercent: 10,
    lineHeight: 1.4,
    fontWeight: 'bold',
    alignment: 'center',
    verticalPosition: 'top',
    lineSpacing: 'relaxed',
    transition: 'fade',
    textAnimation: 'none'
  },
  {
    id: 'dawn',
    name: 'Dawn Sanctuary',
    bgType: 'gradient',
    background: 'linear-gradient(135deg, #1e293b 0%, #431407 50%, #0f172a 100%)',
    textColor: '#fffbeb',
    accentColor: '#f59e0b',
    overlayOpacity: 0.3,
    fontFamily: 'Noto Sans Kannada',
    fontSize: 'xl',
    fontSizePx: 54,
    verticalPositionPercent: 10,
    lineHeight: 1.4,
    fontWeight: 'bold',
    alignment: 'center',
    verticalPosition: 'top',
    lineSpacing: 'normal',
    transition: 'zoom',
    textAnimation: 'fade-in'
  },
  {
    id: 'scripture',
    name: 'Scripture Parchment',
    bgType: 'gradient',
    background: 'linear-gradient(135deg, #172554 0%, #1e1b4b 100%)',
    textColor: '#fef3c7',
    accentColor: '#f59e0b',
    overlayOpacity: 0.4,
    fontFamily: 'Noto Sans Kannada',
    fontSize: 'xl',
    fontSizePx: 50,
    verticalPositionPercent: 10,
    lineHeight: 1.5,
    fontWeight: 'medium',
    alignment: 'center',
    verticalPosition: 'top',
    lineSpacing: 'relaxed',
    transition: 'fade',
    textAnimation: 'fade-in'
  }
];

