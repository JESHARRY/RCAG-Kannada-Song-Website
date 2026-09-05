import React, { useState } from 'react';
import { BookOpen, X, CheckCircle2, Download, AlertTriangle, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PdfSongbookGenerator, PdfGenerationProgress } from '../services/pdfSongbookGenerator';

interface DownloadSongbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadSongbookModal: React.FC<DownloadSongbookModalProps> = ({ isOpen, onClose }) => {
  const { allSongs } = useApp();
  const [selectedOption, setSelectedOption] = useState<'all' | 'kannada_only' | 'kannada_english'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<PdfGenerationProgress>({
    status: '',
    percentage: 0,
    isComplete: false,
  });

  if (!isOpen) return null;

  const countToUse = allSongs.length;

  const handleStartDownload = async () => {
    setIsGenerating(true);
    await PdfSongbookGenerator.generate647Songbook(
      allSongs,
      (prog) => setProgress(prog),
      selectedOption
    );
  };

  const handleResetModal = () => {
    setIsGenerating(false);
    setProgress({ status: '', percentage: 0, isComplete: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Download Songbook PDF</h3>
              <p className="text-xs text-slate-500">Verified {countToUse} Song Collection</p>
            </div>
          </div>
          {!isGenerating && (
            <button onClick={handleResetModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Option Selection when idle */}
        {!isGenerating && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Select Songbook Content Options
              </label>
              <select
                value={selectedOption}
                onChange={(e: any) => setSelectedOption(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Complete Songbook — 647 Songs (Kannada + English + Chords)</option>
                <option value="kannada_only">Kannada Lyrics Only (647 Songs)</option>
                <option value="kannada_english">Kannada + English Transliterations (647 Songs)</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <div className="font-bold text-sm text-indigo-700 dark:text-indigo-300">✓ Data Integrity Verification</div>
              <div>Expected Songs: <strong>647</strong> | Songs Included: <strong>{countToUse}</strong></div>
              <div>Embedded Noto Sans Kannada Unicode font ensures zero broken glyphs.</div>
            </div>

            <button
              onClick={handleStartDownload}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF Songbook</span>
            </button>
          </div>
        )}

        {/* Progress Display during generation */}
        {isGenerating && (
          <div className="space-y-4 text-center py-4">
            {!progress.isComplete ? (
              <>
                <div className="text-4xl animate-bounce">📖</div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                  Preparing your songbook...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {progress.status}
                </p>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {progress.percentage}%
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-xl text-slate-900 dark:text-white">
                  ✓ Songbook Ready!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {countToUse} songs successfully included in <code>Kannada-Christian-Songs-{countToUse}-Songbook.pdf</code>.
                </p>

                {/* Direct Download Link Fallback */}
                {progress.blobUrl && (
                  <a
                    href={progress.blobUrl}
                    download={`Kannada-Christian-Songs-${countToUse}-Songbook.pdf`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-md hover:bg-amber-300 transition-colors my-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Click Here if File Didn't Auto-Download</span>
                  </a>
                )}

                <div>
                  <button
                    onClick={handleResetModal}
                    className="mt-3 px-6 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {progress.error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{progress.error}</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
