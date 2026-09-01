import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, X, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AudioPlayerBar: React.FC = () => {
  const { currentAudioSong, isPlayingAudio, playAudioSong, pauseAudioSong } = useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');

  useEffect(() => {
    if (!audioRef.current) return;

    if (currentAudioSong && isPlayingAudio) {
      audioRef.current.src = currentAudioSong.audioUrl || '';
      audioRef.current.play().catch(e => console.warn('Audio playback error:', e));
    } else if (!isPlayingAudio) {
      audioRef.current.pause();
    }
  }, [currentAudioSong, isPlayingAudio]);

  if (!currentAudioSong || !currentAudioSong.audioUrl) return null;

  const handleTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setProgress((cur / dur) * 100);
    setCurrentTime(formatTime(cur));
    setDuration(formatTime(dur));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const newTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-72 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-3 sm:px-6 flex items-center justify-between gap-4 shadow-2xl transition-all">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={pauseAudioSong}
      />

      {/* Track Info */}
      <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <Music className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-kannada font-bold text-sm text-slate-900 dark:text-white truncate">
            {currentAudioSong.titleKannada}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {currentAudioSong.titleEnglish || 'Audio Stream'}
          </p>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="flex-1 max-w-lg flex items-center gap-3">
        <button
          onClick={() => (isPlayingAudio ? pauseAudioSong() : playAudioSong(currentAudioSong))}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform shrink-0"
        >
          {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />

        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0 hidden sm:inline">
          {currentTime} / {duration}
        </span>
      </div>

      {/* Close Player */}
      <button
        onClick={pauseAudioSong}
        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
