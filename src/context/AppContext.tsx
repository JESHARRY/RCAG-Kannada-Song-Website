import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, ExtractedSong, ExtractionHistoryLog } from '../types/song';
import baseSongsData from '../data/songs.json';
import migrationReportData from '../data/migration_report.json';

interface AppContextType {
  songs: Song[];
  importedSongs: Song[];
  allSongs: Song[];
  favorites: string[];
  recentSongIds: string[];
  theme: 'light' | 'dark';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  currentAudioSong: Song | null;
  isPlayingAudio: boolean;
  extractionHistory: ExtractionHistoryLog[];
  migrationReport: typeof migrationReportData;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addRecentSong: (id: string) => void;
  toggleTheme: () => void;
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
  playAudioSong: (song: Song) => void;
  pauseAudioSong: () => void;
  saveImportedPdfSongs: (newSongs: Song[], historyLog: ExtractionHistoryLog) => void;
  importRcagSongs: (songsToImport: Song[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>(baseSongsData as Song[]);
  const [importedSongs, setImportedSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('kcs_react_imported');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kcs_react_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentSongIds, setRecentSongIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kcs_react_recents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('kcs_theme');
      return (saved as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const [fontSize, setFontSizeState] = useState<'sm' | 'base' | 'lg' | 'xl'>(() => {
    try {
      const saved = localStorage.getItem('kcs_font_size');
      return (saved as 'sm' | 'base' | 'lg' | 'xl') || 'lg';
    } catch {
      return 'lg';
    }
  });

  const [currentAudioSong, setCurrentAudioSong] = useState<Song | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [extractionHistory, setExtractionHistory] = useState<ExtractionHistoryLog[]>(() => {
    try {
      const saved = localStorage.getItem('kcs_react_extraction_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kcs_theme', theme);
  }, [theme]);

  const allSongs = [...songs, ...importedSongs];

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('kcs_react_favs', JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const addRecentSong = (id: string) => {
    setRecentSongIds(prev => {
      const filtered = prev.filter(item => item !== id);
      const next = [id, ...filtered].slice(0, 10);
      localStorage.setItem('kcs_react_recents', JSON.stringify(next));
      return next;
    });
  };

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const setFontSize = (size: 'sm' | 'base' | 'lg' | 'xl') => {
    setFontSizeState(size);
    localStorage.setItem('kcs_font_size', size);
  };

  const playAudioSong = (song: Song) => {
    setCurrentAudioSong(song);
    setIsPlayingAudio(true);
  };

  const pauseAudioSong = () => {
    setIsPlayingAudio(false);
  };

  const saveImportedPdfSongs = (newSongs: Song[], historyLog: ExtractionHistoryLog) => {
    const updatedImported = [...importedSongs, ...newSongs];
    setImportedSongs(updatedImported);
    localStorage.setItem('kcs_react_imported', JSON.stringify(updatedImported));

    const updatedHistory = [historyLog, ...extractionHistory];
    setExtractionHistory(updatedHistory);
    localStorage.setItem('kcs_react_extraction_history', JSON.stringify(updatedHistory));
  };

  const importRcagSongs = (songsToImport: Song[]) => {
    const updatedSongs = [...songs, ...songsToImport];
    setSongs(updatedSongs);
    localStorage.setItem('kcs_react_imported', JSON.stringify(updatedSongs));
  };

  return (
    <AppContext.Provider
      value={{
        songs,
        importedSongs,
        allSongs,
        favorites,
        recentSongIds,
        theme,
        fontSize,
        currentAudioSong,
        isPlayingAudio,
        extractionHistory,
        migrationReport: migrationReportData,
        toggleFavorite,
        isFavorite,
        addRecentSong,
        toggleTheme,
        setFontSize,
        playAudioSong,
        pauseAudioSong,
        saveImportedPdfSongs,
        importRcagSongs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
