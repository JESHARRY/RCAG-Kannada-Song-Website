import React from 'react';
import { Menu, Sun, Moon, Search, Download, Tv } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onNavigate: (path: string) => void;
  onOpenDownloadModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  onNavigate,
  onOpenDownloadModal,
}) => {
  const { theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Drawer Trigger & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors md:hidden"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('/')} 
            className="cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 text-amber-400 flex items-center justify-center font-bold text-base shadow-sm">
              ✝
            </div>
            <div>
              <h1 className="font-kannada font-bold text-sm sm:text-base text-white leading-tight">
                ಕನ್ನಡ ಕ್ರೈಸ್ತ ಹಾಡುಗಳು
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                Kannada Christian Songs
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Trigger Input */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4">
          <button
            onClick={() => onNavigate('/search')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-400 bg-slate-950/80 border border-slate-800 rounded-full hover:border-indigo-500 transition-colors shadow-inner"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="truncate">Search 647 songs, Kannada titles, lyrics, chords...</span>
          </button>
        </div>

        {/* Right: Presentation & Songbook Download Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('/presentation')}
            title="Worship Presentation Studio"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-full hover:bg-amber-400/20 transition-colors shadow-2xs"
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Presentation</span>
          </button>

          <button
            onClick={onOpenDownloadModal}
            title="Download complete 647 songs PDF"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-200 bg-indigo-950/80 border border-indigo-800/80 rounded-full hover:bg-indigo-900/80 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Download Songbook</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
