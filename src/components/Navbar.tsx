import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  Tv,
  Home,
  Music,
  Star,
  ListMusic,
  BookOpen,
  Search,
  Grid,
  Guitar,
  Folder,
  Upload,
  Mic
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHURCH_LOGO_URL } from '../utils/assetPath';

interface NavbarProps {
  onNavigate: (path: string) => void;
  onOpenDownloadModal: () => void;
  currentPath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenDownloadModal,
  currentPath = '/',
}) => {
  const { theme, toggleTheme, favorites } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Helper to check if a navigation link is active
  const isLinkActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  // Close menu on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMenuOpen(false);
  };

  const handleDownloadClick = () => {
    onOpenDownloadModal();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0f14]/95 backdrop-blur-md border-b border-slate-800/80 transition-colors shadow-md">
      <div className="relative w-full px-3 sm:px-6 lg:px-8 h-16 sm:h-18 grid grid-cols-[1fr_auto_1fr] items-center max-w-7xl mx-auto" ref={menuRef}>

        {/* 1. LEFT ZONE: Home, All Songs, Search */}
        <div className="justify-self-end flex items-center gap-1 sm:gap-2 pr-2 sm:pr-4 lg:pr-6 z-10">
          <button
            onClick={() => handleNavClick('/')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLinkActive('/')
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden min-[400px]:inline">Home</span>
          </button>

          <button
            onClick={() => handleNavClick('/songs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLinkActive('/songs')
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden min-[480px]:inline">All Songs</span>
          </button>

          <button
            onClick={() => handleNavClick('/search')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLinkActive('/search')
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Search</span>
          </button>
        </div>

        {/* 2. CENTER ZONE: Centered Clean Church Branding Capsule */}
        <div
          onClick={() => handleNavClick('/')}
          className="justify-self-center z-20 cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.12)] hover:shadow-[0_0_22px_rgba(245,158,11,0.25)]">
            <img
              src={CHURCH_LOGO_URL}
              alt="Revival Centre AG Church Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            <div className="flex flex-col justify-center text-left">
              <h1 className="font-kannada font-bold text-xs sm:text-sm text-white tracking-tight leading-none mb-0.5 group-hover:text-amber-300 transition-colors">
                ರಿವೈವಲ್ ಸೆಂಟರ್ ಎಜಿ ಚರ್ಚ್
              </h1>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-300 tracking-wide leading-tight">
                Revival Centre AG Church
              </div>
            </div>
          </div>
        </div>

        {/* 3. RIGHT ZONE: Favorites, Menu Button, Theme Toggle */}
        <div className="justify-self-start flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-4 lg:pl-6 z-10">

          {/* Favorites Button with Counter Badge */}
          <button
            onClick={() => handleNavClick('/favorites')}
            title="Favorites"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLinkActive('/favorites')
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Favorites</span>
            {favorites.length > 0 && (
              <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Top-Right Menu Button */}
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isMenuOpen
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700'
            }`}
            aria-label="Toggle Navigation Menu"
            title="Full Navigation Menu"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>

        {/* 4. DROPDOWN POPOVER PANEL */}
        {isMenuOpen && (
          <div className="absolute top-full right-3 sm:right-6 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl z-50 space-y-4 animate-fade">

            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-white">Full Navigation</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: LIBRARY */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-2 mb-1">
                Library
              </div>

              <button
                onClick={() => handleNavClick('/search')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLinkActive('/search') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>Search</span>
              </button>

              <button
                onClick={() => handleNavClick('/categories')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLinkActive('/categories') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4 text-violet-400" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => handleNavClick('/category/chords')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLinkActive('/category/chords') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Guitar className="w-4 h-4 text-amber-400" />
                <span>Lyrics with Chords</span>
              </button>

              <button
                onClick={() => handleNavClick('/favorites')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLinkActive('/favorites') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4 text-rose-400" />
                <span>Favorites ({favorites.length})</span>
              </button>
            </div>

            {/* Section 2: WORSHIP PRESENTATION */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-2 mb-1">
                Worship
              </div>

              <button
                onClick={() => handleNavClick('/presentation')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLinkActive('/presentation') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Tv className="w-4 h-4 text-amber-400" />
                <span>Presentation Studio</span>
              </button>

              <button
                onClick={() => handleNavClick('/presentation/library')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLinkActive('/presentation/library') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Folder className="w-4 h-4 text-emerald-400" />
                <span>My Presentations</span>
              </button>

              <button
                onClick={() => handleNavClick('/presentation/sets')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLinkActive('/presentation/sets') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ListMusic className="w-4 h-4 text-indigo-400" />
                <span>Worship Sets</span>
              </button>

              <button
                onClick={() => handleNavClick('/preaching-notes')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLinkActive('/preaching-notes') ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4 text-purple-400" />
                <span>Preaching Notes</span>
              </button>
            </div>

            {/* Section 3: TOOLS */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-2 mb-1">
                Tools
              </div>

              <button
                onClick={handleDownloadClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Download Songbook PDF</span>
              </button>

              <button
                onClick={() => handleNavClick('/extract')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLinkActive('/extract') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Import Songs from PDF</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </header>
  );
};
