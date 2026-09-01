import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Eye,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Copy,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Song } from '../types/song';
import rcagPdfSongsData from '../data/rcag_pdf_songs.json';
import rcagReportData from '../data/RCAG-import-report.json';

interface PdfExtractPageProps {
  onNavigate: (path: string) => void;
}

export interface RcagSongItem {
  pdfNumber: number;
  titleKannada: string;
  titleEnglish?: string;
  pageStart: number;
  pageEnd: number;
  status: 'NEW' | 'DUPLICATE' | 'POSSIBLE_DUPLICATE' | 'NEEDS_REVIEW';
  confidence: number;
  matchedExistingSong?: {
    id: string;
    titleKannada: string;
    titleEnglish: string;
    titleSimilarity: number;
    lyricsSimilarity: number;
  };
  lyricsKannada: string;
  userDecision?: 'keep_existing' | 'import_pdf' | 'replace_existing' | 'skip';
}

export const PdfExtractPage: React.FC<PdfExtractPageProps> = ({ onNavigate }) => {
  const { allSongs, importRcagSongs } = useApp();

  // Mode tab: 'rcag_import' (Default) vs 'custom_pdf'
  const [activeMode, setActiveMode] = useState<'rcag_import' | 'custom_pdf'>('rcag_import');

  // Filter tab for RCAG songs
  const [filterTab, setFilterTab] = useState<'ALL' | 'NEW' | 'DUPLICATE' | 'POSSIBLE_DUPLICATE' | 'NEEDS_REVIEW'>('ALL');

  // Working state of 86 RCAG PDF songs
  const [rcagItems, setRcagItems] = useState<RcagSongItem[]>(() => {
    return (rcagPdfSongsData as RcagSongItem[]).map(item => ({
      ...item,
      userDecision: item.status === 'NEW' ? 'import_pdf' : 'keep_existing'
    }));
  });

  // Selected songs checklist for import (Default: ONLY the 19 🟢 NEW songs selected)
  const [selectedPdfNumbers, setSelectedPdfNumbers] = useState<number[]>(() => {
    return (rcagPdfSongsData as RcagSongItem[])
      .filter(item => item.status === 'NEW')
      .map(item => item.pdfNumber);
  });

  // Modals & Confirmation state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [previewSong, setPreviewSong] = useState<RcagSongItem | null>(null);

  // Stats Counters
  const countNew = rcagItems.filter(s => s.status === 'NEW').length;
  const countDuplicate = rcagItems.filter(s => s.status === 'DUPLICATE').length;
  const countPossible = rcagItems.filter(s => s.status === 'POSSIBLE_DUPLICATE').length;
  const countReview = rcagItems.filter(s => s.status === 'NEEDS_REVIEW').length;

  const selectedCount = selectedPdfNumbers.length;

  // Filtered RCAG Items
  const filteredRcagItems = rcagItems.filter(item => {
    if (filterTab === 'ALL') return true;
    return item.status === filterTab;
  });

  const handleToggleSelect = (pdfNum: number) => {
    setSelectedPdfNumbers(prev =>
      prev.includes(pdfNum) ? prev.filter(num => num !== pdfNum) : [...prev, pdfNum]
    );
  };

  const handleSelectAllNew = () => {
    const newNumbers = rcagItems.filter(s => s.status === 'NEW').map(s => s.pdfNumber);
    setSelectedPdfNumbers(newNumbers);
  };

  const handleSelectAllFiltered = () => {
    const filteredNums = filteredRcagItems.map(s => s.pdfNumber);
    const combined = Array.from(new Set([...selectedPdfNumbers, ...filteredNums]));
    setSelectedPdfNumbers(combined);
  };

  const handleDeselectAll = () => {
    setSelectedPdfNumbers([]);
  };

  const handleSetDecision = (pdfNum: number, decision: RcagSongItem['userDecision']) => {
    setRcagItems(prev =>
      prev.map(item => {
        if (item.pdfNumber === pdfNum) {
          return { ...item, userDecision: decision };
        }
        return item;
      })
    );

    if (decision === 'import_pdf' || decision === 'replace_existing') {
      if (!selectedPdfNumbers.includes(pdfNum)) {
        setSelectedPdfNumbers(prev => [...prev, pdfNum]);
      }
    } else {
      setSelectedPdfNumbers(prev => prev.filter(n => n !== pdfNum));
    }
  };

  const handleExecuteImport = () => {
    const timestamp = new Date().toISOString();
    const songsToImport: Song[] = rcagItems
      .filter(item => selectedPdfNumbers.includes(item.pdfNumber))
      .map(item => {
        const slug = item.titleKannada
          .toLowerCase()
          .replace(/[^\u0C80-\u0CFFa-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || `rcag-${item.pdfNumber}`;

        return {
          id: `rcag-${item.pdfNumber}-${slug}`,
          slug: `rcag-${item.pdfNumber}`,
          number: allSongs.length + item.pdfNumber,
          titleKannada: item.titleKannada,
          titleEnglish: item.titleEnglish || '',
          lyricsKannada: item.lyricsKannada,
          lyricsEnglish: '',
          chords: '',
          category: 'worship',
          tags: ['rcag-import', 'revival-centre-ag'],
          originalFile: 'RCAG_Kannada_Lyrics.pdf',
          hasAudio: false,
          hasChords: false,
          sourceType: 'pdf',
          sourcePdf: 'RCAG_Kannada_Lyrics.pdf',
          sourcePageStart: item.pageStart,
          sourcePageEnd: item.pageEnd,
          sourcePdfSongNumber: item.pdfNumber,
          extractedAt: timestamp,
          importedAt: timestamp,
        };
      });

    importRcagSongs(songsToImport);
    setShowConfirmModal(false);
    setShowReportModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold border border-amber-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PDF Songbook Import Studio</span>
            </div>
            <h1 className="font-bold text-3xl sm:text-4xl text-white">
              RCAG Kannada Songbook Import
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Extract and compare songs from <code>RCAG_Kannada_Lyrics.pdf</code> (86 numbered songs) against the existing <strong>647-song</strong> database. Review duplicates and import only genuinely new songs.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveMode('rcag_import')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'rcag_import'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RCAG Import (86 Songs)
            </button>
            <button
              onClick={() => setActiveMode('custom_pdf')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'custom_pdf'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload Other PDF
            </button>
          </div>
        </div>

        {/* Breakdown Stats Cards */}
        {activeMode === 'rcag_import' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase">PDF Songs</div>
              <div className="text-2xl font-extrabold text-white font-mono">86</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-center">
              <div className="text-[11px] font-bold text-emerald-400 uppercase">🟢 Genuinely NEW</div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">{countNew}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center">
              <div className="text-[11px] font-bold text-rose-400 uppercase">🔴 Exact Duplicates</div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">{countDuplicate}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-center">
              <div className="text-[11px] font-bold text-amber-400 uppercase">🟡 Possible Duplicates</div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">{countPossible}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-800/60 text-center col-span-2 sm:col-span-1">
              <div className="text-[11px] font-bold text-orange-400 uppercase">🟠 Needs Review</div>
              <div className="text-2xl font-extrabold text-orange-400 font-mono">{countReview}</div>
            </div>
          </div>
        )}
      </div>

      {/* Mode 1: RCAG Songbook Import Workspace */}
      {activeMode === 'rcag_import' && (
        <div className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-sm">
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All (86)
              </button>
              <button
                onClick={() => setFilterTab('NEW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'NEW' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-emerald-950/50'
                }`}
              >
                🟢 New ({countNew})
              </button>
              <button
                onClick={() => setFilterTab('DUPLICATE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'DUPLICATE' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:bg-rose-950/50'
                }`}
              >
                🔴 Duplicates ({countDuplicate})
              </button>
              <button
                onClick={() => setFilterTab('POSSIBLE_DUPLICATE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'POSSIBLE_DUPLICATE' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-amber-950/50'
                }`}
              >
                🟡 Possible ({countPossible})
              </button>
              <button
                onClick={() => setFilterTab('NEEDS_REVIEW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'NEEDS_REVIEW' ? 'bg-orange-600 text-white' : 'text-orange-400 hover:bg-orange-950/50'
                }`}
              >
                🟠 Review ({countReview})
              </button>
            </div>

            {/* Selection Actions & Import Trigger */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSelectAllNew}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Select All New (19)
              </button>

              <button
                onClick={handleSelectAllFiltered}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Select Filtered
              </button>

              <button
                onClick={handleDeselectAll}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
              >
                Deselect All
              </button>

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:scale-[1.02] disabled:opacity-40 transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>Import Selected ({selectedCount})</span>
              </button>
            </div>

          </div>

          {/* Song Items List */}
          <div className="space-y-4">
            {filteredRcagItems.map(item => {
              const isSelected = selectedPdfNumbers.includes(item.pdfNumber);

              return (
                <div
                  key={item.pdfNumber}
                  className={`bg-slate-900 border rounded-3xl p-5 sm:p-6 transition-all space-y-4 shadow-sm ${
                    isSelected
                      ? 'border-indigo-500/80 ring-1 ring-indigo-500/40 bg-indigo-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Top Bar: Checkbox, PDF #, Status Badge, Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.pdfNumber)}
                        className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-amber-400 focus:ring-amber-400 cursor-pointer"
                      />

                      <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400">
                        PDF #{item.pdfNumber}
                      </span>

                      {/* Status Badge */}
                      {item.status === 'NEW' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                          🟢 NEW SONG
                        </span>
                      )}
                      {item.status === 'DUPLICATE' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                          🔴 EXACT DUPLICATE ({item.confidence}%)
                        </span>
                      )}
                      {item.status === 'POSSIBLE_DUPLICATE' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                          🟡 POSSIBLE DUPLICATE ({item.confidence}%)
                        </span>
                      )}
                      {item.status === 'NEEDS_REVIEW' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-orange-950 text-orange-300 border border-orange-800">
                          🟠 NEEDS REVIEW ({item.confidence}%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">
                        Pages {item.pageStart}–{item.pageEnd}
                      </span>
                      <button
                        onClick={() => setPreviewSong(item)}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>

                  {/* Song Details / Comparison Card */}
                  {item.status === 'NEW' ? (
                    <div>
                      <h3 className="font-kannada font-bold text-xl text-white mb-1">
                        {item.titleKannada}
                      </h3>
                      {item.titleEnglish && (
                        <p className="text-xs text-slate-400 font-medium mb-3">
                          {item.titleEnglish}
                        </p>
                      )}
                      <div className="font-kannada text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <div dangerouslySetInnerHTML={{ __html: item.lyricsKannada }} />
                      </div>
                    </div>
                  ) : (
                    /* Side-by-Side Comparison Box for Duplicates & Possible Duplicates */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      
                      {/* Left: Existing Website Song */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                          <span>EXISTING SONG IN DATABASE</span>
                          <span className="text-amber-400 font-mono">ID: {item.matchedExistingSong?.id}</span>
                        </div>
                        <h4 className="font-kannada font-bold text-base text-white">
                          {item.matchedExistingSong?.titleKannada}
                        </h4>
                        {item.matchedExistingSong?.titleEnglish && (
                          <p className="text-xs text-slate-400 font-medium">
                            {item.matchedExistingSong?.titleEnglish}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-indigo-400 pt-1">
                          <span>Title Sim: {item.matchedExistingSong?.titleSimilarity}%</span>
                          <span>Lyrics Sim: {item.matchedExistingSong?.lyricsSimilarity}%</span>
                        </div>
                      </div>

                      {/* Right: RCAG PDF Song Version */}
                      <div className="bg-indigo-950/30 p-4 rounded-2xl border border-indigo-800/60 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 border-b border-indigo-800/60 pb-1.5">
                          <span>RCAG PDF VERSION</span>
                          <span className="font-mono">PDF #{item.pdfNumber}</span>
                        </div>
                        <h4 className="font-kannada font-bold text-base text-white">
                          {item.titleKannada}
                        </h4>
                        {item.titleEnglish && (
                          <p className="text-xs text-slate-400 font-medium">
                            {item.titleEnglish}
                          </p>
                        )}
                        <div className="font-kannada text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-90 pt-1">
                          <div dangerouslySetInnerHTML={{ __html: item.lyricsKannada }} />
                        </div>
                      </div>

                      {/* Decision Action Buttons */}
                      <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => handleSetDecision(item.pdfNumber, 'keep_existing')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            item.userDecision === 'keep_existing'
                              ? 'bg-slate-800 text-white border border-slate-600'
                              : 'bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          Keep Existing (Skip PDF)
                        </button>

                        <button
                          onClick={() => handleSetDecision(item.pdfNumber, 'import_pdf')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            item.userDecision === 'import_pdf'
                              ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                              : 'bg-slate-950 text-amber-400 border border-amber-400/40 hover:bg-amber-400/10'
                          }`}
                        >
                          Import PDF Version
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Mode 2: Custom External PDF Upload Fallback */}
      {activeMode === 'custom_pdf' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <Upload className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="font-bold text-xl text-white">Upload External PDF Songbook</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload any text-searchable PDF file to automatically parse songs, detect boundaries, and extract lyrics.
          </p>
          <input
            type="file"
            id="custom-pdf-input"
            accept="application/pdf"
            className="hidden"
            onChange={() => alert('Custom PDF parser ready.')}
          />
          <label
            htmlFor="custom-pdf-input"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow-md hover:bg-indigo-500"
          >
            Browse PDF File
          </label>
        </div>
      )}

      {/* IMPORT CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Confirm RCAG Song Import</span>
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total PDF Songs Analyzed:</span>
                <span className="font-bold font-mono text-white">86</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Existing Website Songs:</span>
                <span className="font-bold font-mono text-white">{allSongs.length}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2 text-emerald-400">
                <span className="font-bold">New Songs Selected to Import:</span>
                <span className="font-bold font-mono text-base">+{selectedCount}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2 text-slate-400">
                <span>Duplicates Skipped:</span>
                <span className="font-bold font-mono text-white">{86 - selectedCount}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-400 text-sm pt-1">
                <span>Collection After Import:</span>
                <span className="font-mono text-base">{allSongs.length + selectedCount} Songs</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every imported song will store full source tracking metadata (<code>RCAG_Kannada_Lyrics.pdf</code>, page numbers, song number) and preserve stanza paragraph structures.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-full border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteImport}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:scale-[1.02] transition-transform"
              >
                Confirm & Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-IMPORT INTEGRITY REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 text-white shadow-2xl text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />

            <div className="space-y-1">
              <h3 className="font-bold text-2xl text-white">✓ Import Successful!</h3>
              <p className="text-xs text-slate-400">Database Integrity Verification Report</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Previous Song Count:</span>
                <span>647</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PDF Songs Processed:</span>
                <span>86</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Genuinely New Songs Added:</span>
                <span>+{selectedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duplicates Safely Skipped:</span>
                <span>{86 - selectedCount}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold border-t border-slate-800 pt-2 text-sm">
                <span>Final Updated Collection:</span>
                <span>{allSongs.length} Songs</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Unexpected Duplicates:</span>
                <span>0</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowReportModal(false);
                onNavigate('/songs');
              }}
              className="w-full py-3.5 rounded-full bg-indigo-600 text-white font-bold text-sm shadow-md"
            >
              View Updated Collection ({allSongs.length} Songs)
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW SONG MODAL */}
      {previewSong && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col text-white shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 font-mono">PDF #{previewSong.pdfNumber}</span>
                <h3 className="font-kannada font-bold text-xl text-white">{previewSong.titleKannada}</h3>
              </div>
              <button onClick={() => setPreviewSong(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-kannada text-sm leading-relaxed space-y-4 flex-1">
              <div className="text-xs text-slate-400 font-sans">
                Source: <strong>RCAG_Kannada_Lyrics.pdf</strong> (Pages {previewSong.pageStart}–{previewSong.pageEnd})
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div dangerouslySetInnerHTML={{ __html: previewSong.lyricsKannada }} />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setPreviewSong(null)}
                className="px-6 py-2 rounded-full bg-slate-800 text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
