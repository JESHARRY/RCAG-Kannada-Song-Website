import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Play, 
  Search, 
  Music, 
  ArrowUp, 
  ArrowDown, 
  ListPlus,
  CheckCircle2,
  X
} from 'lucide-react';
import { Song } from '../types/song';
import { PresentationSlide, WorshipSet } from '../types/presentation';
import { parseWorshipSetToSlides } from '../utils/stanzaParser';

interface WorshipSetsPageProps {
  songs: Song[];
  onNavigate: (path: string) => void;
  onLaunchPresentation: (slides: PresentationSlide[]) => void;
}

export const WorshipSetsPage: React.FC<WorshipSetsPageProps> = ({
  songs,
  onNavigate,
  onLaunchPresentation,
}) => {
  // Local saved sets
  const [sets, setSets] = useState<WorshipSet[]>(() => {
    try {
      const saved = localStorage.getItem('kcs_saved_worship_sets');
      return saved ? JSON.parse(saved) : [
        {
          id: 'set-sample-1',
          name: 'Sunday Morning Worship',
          description: 'Praise & Worship Set for Sunday Service',
          songIds: [songs[0]?.id, songs[1]?.id, songs[2]?.id].filter(Boolean),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [activeSetId, setActiveSetId] = useState<string>(sets[0]?.id || '');
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [songSearch, setSongSearch] = useState('');
  const [newSetName, setNewSetName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeSet = sets.find(s => s.id === activeSetId);

  const activeSetSongs = activeSet
    ? activeSet.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[]
    : [];

  const handleSaveSetsToStorage = (updated: WorshipSet[]) => {
    setSets(updated);
    localStorage.setItem('kcs_saved_worship_sets', JSON.stringify(updated));
  };

  const handleCreateNewSet = () => {
    if (!newSetName.trim()) return;
    const newSet: WorshipSet = {
      id: `set-${Date.now()}`,
      name: newSetName.trim(),
      description: 'Custom Worship Set',
      songIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newSet, ...sets];
    handleSaveSetsToStorage(updated);
    setActiveSetId(newSet.id);
    setNewSetName('');
    setShowCreateModal(false);
  };

  const handleAddSongToActiveSet = (songIdToAdd: string) => {
    if (!activeSet) return;
    if (activeSet.songIds.includes(songIdToAdd)) return;

    const updated = sets.map(s => {
      if (s.id === activeSet.id) {
        return {
          ...s,
          songIds: [...s.songIds, songIdToAdd],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    handleSaveSetsToStorage(updated);
  };

  const handleRemoveSongFromActiveSet = (songIdToRemove: string) => {
    if (!activeSet) return;
    const updated = sets.map(s => {
      if (s.id === activeSet.id) {
        return {
          ...s,
          songIds: s.songIds.filter(id => id !== songIdToRemove),
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    handleSaveSetsToStorage(updated);
  };

  const handleMoveSongInSet = (index: number, direction: 'up' | 'down') => {
    if (!activeSet) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= activeSet.songIds.length) return;

    const newSongIds = [...activeSet.songIds];
    const temp = newSongIds[index];
    newSongIds[index] = newSongIds[targetIdx];
    newSongIds[targetIdx] = temp;

    const updated = sets.map(s => {
      if (s.id === activeSet.id) {
        return { ...s, songIds: newSongIds, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    handleSaveSetsToStorage(updated);
  };

  const handleStartSetPresentation = () => {
    if (activeSetSongs.length === 0) {
      alert('Please add at least one song to the worship set.');
      return;
    }
    const combinedSlides = parseWorshipSetToSlides(activeSetSongs);
    onLaunchPresentation(combinedSlides);
  };

  const filteredSearchSongs = songs.filter(s =>
    s.titleKannada.toLowerCase().includes(songSearch.toLowerCase()) ||
    (s.titleEnglish && s.titleEnglish.toLowerCase().includes(songSearch.toLowerCase()))
  ).slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 anim-page-entrance">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-church-surface border border-church-border/80 p-6 sm:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-semibold border border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Song Worship Projection</span>
          </div>
          <h1 className="font-bold text-3xl text-white">Worship Sets Studio</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Combine multiple songs from the 647 collection into continuous Sunday service worship sets.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Worship Set</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Worship Sets List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
            <span>My Worship Sets ({sets.length})</span>
          </h3>

          <div className="space-y-2">
            {sets.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSetId(s.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  s.id === activeSetId
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">{s.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{s.songIds.length} Songs</span>
                  <span>{new Date(s.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Active Worship Set Song Order & Launcher */}
        {activeSet ? (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-2xl text-slate-900 dark:text-white">{activeSet.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Continuous set presentation with {activeSetSongs.length} songs
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddSongModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs hover:bg-indigo-100 transition-colors"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>Add Songs to Set</span>
                </button>

                <button
                  onClick={handleStartSetPresentation}
                  disabled={activeSetSongs.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:scale-[1.02] disabled:opacity-40 transition-transform"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Present Set</span>
                </button>
              </div>
            </div>

            {/* Song Items List */}
            {activeSetSongs.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                <Music className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">No Songs in this Set</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Add Songs to Set" to select songs from the 647 catalog and construct your service setlist.
                </p>
                <button
                  onClick={() => setShowAddSongModal(true)}
                  className="px-4 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs"
                >
                  Add Songs Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSetSongs.map((song, idx) => (
                  <div
                    key={song.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-kannada font-bold text-base text-slate-900 dark:text-white truncate">
                          {song.titleKannada}
                        </div>
                        {song.titleEnglish && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                            {song.titleEnglish}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveSongInSet(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSongInSet(idx, 'down')}
                        disabled={idx === activeSetSongs.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveSongFromActiveSet(song.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

      </div>

      {/* ADD SONG MODAL */}
      {showAddSongModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Song to Set</h3>
              <button onClick={() => setShowAddSongModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={songSearch}
                onChange={(e) => setSongSearch(e.target.value)}
                placeholder="Search by Kannada or English title..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredSearchSongs.map((s) => {
                const isAlreadyInSet = activeSet?.songIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      handleAddSongToActiveSet(s.id);
                    }}
                    disabled={isAlreadyInSet}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      isAlreadyInSet
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                    }`}
                  >
                    <div>
                      <div className="font-kannada font-bold text-sm text-slate-900 dark:text-white">{s.titleKannada}</div>
                      <div className="text-xs text-slate-500">{s.titleEnglish}</div>
                    </div>
                    {isAlreadyInSet ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE SET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create New Worship Set</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Set Name</label>
              <input
                type="text"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="e.g. Sunday Youth Service"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-bold focus:outline-none"
              />
            </div>

            <button
              onClick={handleCreateNewSet}
              className="w-full py-3 rounded-full bg-indigo-600 text-white font-bold text-sm shadow-md"
            >
              Create Set
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
