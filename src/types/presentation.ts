import { PRESENTATION_BG_URLS } from '../utils/assetPath';

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
  category?: 'worship' | 'communion' | 'prayer' | 'bible' | 'cross' | 'easter' | 'goodFriday' | 'christmas' | 'preaching' | 'preachingSanctuary' | 'minimal';
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
    id: 'preaching',
    name: '📖 Preaching (Bible & Lectern)',
    category: 'preaching',
    bgType: 'image',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    customBgImage: PRESENTATION_BG_URLS.preaching,
    textColor: '#ffffff',
    accentColor: '#f59e0b',
    overlayOpacity: 0.20,
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
    id: 'preachingSanctuary',
    name: '🏛 Preaching (Sanctuary & Cross)',
    category: 'preachingSanctuary',
    bgType: 'image',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    customBgImage: PRESENTATION_BG_URLS.preachingSanctuary,
    textColor: '#ffffff',
    accentColor: '#fbbf24',
    overlayOpacity: 0.20,
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
    id: 'worship',
    name: 'General Worship',
    category: 'worship',
    bgType: 'image',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    customBgImage: PRESENTATION_BG_URLS.worship,
    textColor: '#ffffff',
    accentColor: '#f59e0b',
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
    transition: 'fade',
    textAnimation: 'fade-in'
  },
  {
    id: 'communion',
    name: '🍞 Communion Sunday',
    category: 'communion',
    bgType: 'image',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    customBgImage: PRESENTATION_BG_URLS.communion,
    textColor: '#ffffff',
    accentColor: '#fbbf24',
    overlayOpacity: 0.30,
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
    id: 'prayer',
    name: '🙏 Prayer & Sanctuary',
    category: 'prayer',
    bgType: 'image',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    customBgImage: PRESENTATION_BG_URLS.prayer,
    textColor: '#ffffff',
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
    transition: 'fade',
    textAnimation: 'fade-in'
  },
  {
    id: 'bible',
    name: '📖 Word of God / Bible',
    category: 'bible',
    bgType: 'image',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    customBgImage: PRESENTATION_BG_URLS.bible,
    textColor: '#ffffff',
    accentColor: '#f59e0b',
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
    transition: 'fade',
    textAnimation: 'fade-in'
  },
  {
    id: 'cross',
    name: '✝ Cross & Light',
    category: 'cross',
    bgType: 'image',
    background: 'linear-gradient(135deg, #31104b 0%, #0f172a 100%)',
    customBgImage: PRESENTATION_BG_URLS.cross,
    textColor: '#ffffff',
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
    transition: 'fade',
    textAnimation: 'fade-in'
  },
  {
    id: 'easter',
    name: '🌅 Easter Sunrise',
    category: 'easter',
    bgType: 'image',
    background: 'linear-gradient(135deg, #431407 0%, #0f172a 100%)',
    customBgImage: PRESENTATION_BG_URLS.easter,
    textColor: '#ffffff',
    accentColor: '#fbbf24',
    overlayOpacity: 0.20,
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
    id: 'goodFriday',
    name: '✝️ Good Friday Sunset',
    category: 'goodFriday',
    bgType: 'image',
    background: 'linear-gradient(135deg, #450a0a 0%, #0f172a 100%)',
    customBgImage: PRESENTATION_BG_URLS.goodFriday,
    textColor: '#ffffff',
    accentColor: '#f87171',
    overlayOpacity: 0.35,
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
    id: 'christmas',
    name: '⭐ Christmas Sanctuary',
    category: 'christmas',
    bgType: 'image',
    background: 'linear-gradient(135deg, #0c4a6e 0%, #0f172a 100%)',
    customBgImage: PRESENTATION_BG_URLS.christmas,
    textColor: '#ffffff',
    accentColor: '#38bdf8',
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
    transition: 'fade',
    textAnimation: 'fade-in'
  },
  {
    id: 'midnight',
    name: 'Minimal Dark',
    category: 'minimal',
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
  }
];

