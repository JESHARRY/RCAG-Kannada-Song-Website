import React, { useEffect } from 'react';
import {
  Home,
  Music,
  Guitar,
  Headphones,
  Star,
  Search as SearchIcon,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  History,
  Info,
  X,
  Tv,
  FolderHeart,
  ListMusic
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHURCH_LOGO_URL } from '../utils/assetPath';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenDownloadModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  currentPath,
  onNavigate,
  onOpenDownloadModal,
}) => {
  const { allSongs, favorites } = useApp();

  // Lock body scroll when mobile drawer is active
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const navSections = [
    {
      sectionHeader: 'LIBRARY',
      items: [
        { label: 'HOME', path: '/', icon: Home },
        { label: 'ALL SONGS', path: '/songs', icon: Music, count: allSongs.length },
        { label: 'SEARCH', path: '/search', icon: SearchIcon },
        { label: 'CATEGORIES', path: '/categories', icon: Music },
        { label: 'LYRICS WITH CHORDS', path: '/category/chords', icon: Guitar },
        { label: 'FAVORITES', path: '/favorites', icon: Star, count: favorites.length },
      ]
    },
    {
      sectionHeader: 'WORSHIP',
      items: [
        { label: 'PRESENTATION', path: '/presentation', icon: Tv, highlight: true },
        { label: 'MY PRESENTATIONS', path: '/presentation/library', icon: FolderHeart },
        { label: 'WORSHIP SETS', path: '/presentation/sets', icon: ListMusic },
      ]
    },
    {
      sectionHeader: 'TOOLS',
      items: [
        { label: 'DOWNLOAD SONGBOOK', action: 'download_pdf', icon: Download },
        { label: 'IMPORT SONGS FROM PDF', path: '/extract', icon: Upload },
        { label: 'EXTRACTION HISTORY', path: '/extract/history', icon: History },
        { label: 'MIGRATION REPORT', path: '/report', icon: BarChart2 },
      ]
    },
    {
      divider: true,
      items: [
        { label: 'ABOUT & SETTINGS', path: '/about', icon: Info },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Off-Canvas Dark Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          /* Position & Flex Responsibilities */
          h-screen sticky top-0 shrink-0 z-50 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out text-slate-200

          /* Mobile Drawer Position */
          max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-72
          ${isMobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}

          /* Desktop Sizing Responsibilities */
          ${isCollapsed ? 'md:w-[72px]' : 'md:w-[280px]'}
        `}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between h-16 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={CHURCH_LOGO_URL}
              alt="RCAG Worship Logo"
              className="w-9 h-9 object-contain shrink-0"
              onError={(e) => {
                // Fallback to text icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 truncate">
                <div className="font-kannada font-bold text-sm text-white truncate">
                  ಕನ್ನಡ ಕ್ರೈಸ್ತ ಹಾಡುಗಳು
                </div>
                <div className="text-[11px] text-slate-400 truncate font-medium">
                  RCAG Kannada Songs
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {sec.divider && (
                <div className="my-2 border-t border-slate-800" />
              )}

              {sec.sectionHeader && (!isCollapsed || isMobileOpen) && (
                <div className="px-3 pt-2 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400/90">
                  {sec.sectionHeader}
                </div>
              )}

              {sec.items.map((item: any) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                  <button
                    key={item.path || item.action}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    onClick={() => {
                      if (item.action === 'download_pdf') {
                        onOpenDownloadModal();
                      } else if (item.path) {
                        onNavigate(item.path);
                      }
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center ${
                      isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-between px-3.5'
                    } py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-700 to-indigo-900 text-white shadow-md border border-indigo-600/50'
                        : item.highlight
                        ? 'bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/20'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {(!isCollapsed || isMobileOpen) && item.count !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold font-mono ${
                          isActive
                            ? 'bg-indigo-800 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 font-medium text-center">
            Praise • Worship • Fellowship
          </div>
        )}
      </aside>
    </>
  );
};
