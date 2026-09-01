import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { DownloadSongbookModal } from './components/DownloadSongbookModal';

import { HomePage } from './pages/HomePage';
import { AllSongsPage } from './pages/AllSongsPage';
import { SearchPage } from './pages/SearchPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SongDetailPage } from './pages/SongDetailPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SettingsAboutPage } from './pages/SettingsAboutPage';
import { PdfExtractPage } from './pages/PdfExtractPage';
import { ExtractHistoryPage } from './pages/ExtractHistoryPage';
import { MigrationReportPage } from './pages/MigrationReportPage';

// Presentation Studio Pages
import { PresentationPage } from './pages/PresentationPage';
import { PresentationEditorPage } from './pages/PresentationEditorPage';
import { WorshipSetsPage } from './pages/WorshipSetsPage';
import { MyPresentationsPage } from './pages/MyPresentationsPage';
import { PresentationSlide } from './types/presentation';

export function AppContent() {
  const { allSongs } = useApp();
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
  
  // Mobile off-canvas drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Desktop sidebar collapsed state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kcs_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Download Songbook Modal state
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Active Presentation Custom Slides (if launched from editor or worship set)
  const [activePresentationSlides, setActivePresentationSlides] = useState<PresentationSlide[] | undefined>(undefined);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/';
      setCurrentPath(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('kcs_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLaunchPresentation = (slides: PresentationSlide[]) => {
    setActivePresentationSlides(slides);
    navigate('/presentation');
  };

  // Route matching
  const renderPage = () => {
    if (currentPath === '/') return <HomePage onNavigate={navigate} onOpenDownloadModal={() => setIsDownloadModalOpen(true)} />;
    if (currentPath === '/songs') return <AllSongsPage onNavigate={navigate} initialCategory="all" />;
    if (currentPath === '/search') return <SearchPage onNavigate={navigate} />;
    if (currentPath === '/categories') return <CategoriesPage onNavigate={navigate} />;
    if (currentPath === '/category/chords') return <AllSongsPage onNavigate={navigate} initialCategory="chords" />;
    if (currentPath === '/category/audio') return <AllSongsPage onNavigate={navigate} initialCategory="audio" />;
    if (currentPath === '/category/pdf') return <AllSongsPage onNavigate={navigate} initialCategory="pdf" />;
    if (currentPath === '/favorites') return <FavoritesPage onNavigate={navigate} />;
    if (currentPath === '/extract') return <PdfExtractPage onNavigate={navigate} />;
    if (currentPath === '/extract/history') return <ExtractHistoryPage />;
    if (currentPath === '/report') return <MigrationReportPage />;
    if (currentPath === '/about') return <SettingsAboutPage />;

    // Presentation Routes
    if (currentPath === '/presentation') {
      return (
        <PresentationPage
          songs={allSongs}
          initialSlides={activePresentationSlides}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/presentation/song/')) {
      const songId = currentPath.replace('/presentation/song/', '');
      return (
        <PresentationPage
          songs={allSongs}
          songId={songId}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/presentation/editor/')) {
      const songId = currentPath.replace('/presentation/editor/', '');
      return (
        <PresentationEditorPage
          songs={allSongs}
          songId={songId}
          onNavigate={navigate}
          onLaunchPresentation={handleLaunchPresentation}
        />
      );
    }

    if (currentPath === '/presentation/sets') {
      return (
        <WorshipSetsPage
          songs={allSongs}
          onNavigate={navigate}
          onLaunchPresentation={handleLaunchPresentation}
        />
      );
    }

    if (currentPath === '/presentation/library') {
      return (
        <MyPresentationsPage
          songs={allSongs}
          onNavigate={navigate}
          onLaunchPresentation={handleLaunchPresentation}
        />
      );
    }

    if (currentPath.startsWith('/song/')) {
      const songId = currentPath.replace('/song/', '');
      return <SongDetailPage songId={songId} onNavigate={navigate} />;
    }

    return <HomePage onNavigate={navigate} onOpenDownloadModal={() => setIsDownloadModalOpen(true)} />;
  };

  // Fullscreen Presentation Mode check (hides App Shell navigation for pure immersive viewing)
  const isPresentationMode = currentPath === '/presentation' || currentPath.startsWith('/presentation/song/');

  if (isPresentationMode) {
    return (
      <div className="min-h-screen bg-black font-sans">
        {renderPage()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-row font-sans transition-colors duration-200">
      
      {/* 1. App Shell Sidebar (Flex child on desktop, Off-canvas drawer on mobile) */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 2. Main Shell (Spans remaining available width dynamically) */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Navbar
          onToggleMobileSidebar={() => setIsMobileOpen(prev => !prev)}
          onNavigate={navigate}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderPage()}
        </main>

        <AudioPlayerBar />
      </div>

      {/* 3. Global Download Songbook Modal */}
      <DownloadSongbookModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
