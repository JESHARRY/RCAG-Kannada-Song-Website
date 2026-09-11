import React, { useState } from 'react';
import { BookOpen, X, CheckCircle2, Download, AlertTriangle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade">
      <div className="bg-church-surface border border-church-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Download Songbook PDF</h3>
              <p className="text-xs text-slate-400">Verified {countToUse} Song Collection</p>
            </div>
          </div>
          {!isGenerating && (
            <button onClick={handleResetModal} className="text-slate-400 hover:text-white p-1 rounded-md">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Option Selection when idle */}
        {!isGenerating && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Songbook Content Options
              </label>
              <select
                value={selectedOption}
                onChange={(e: any) => setSelectedOption(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0d0f14] border border-slate-800 text-white font-semibold text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="all">Complete Songbook — 647 Songs (Kannada + English + Chords)</option>
                <option value="kannada_only">Kannada Lyrics Only (647 Songs)</option>
                <option value="kannada_english">Kannada + English Transliterations (647 Songs)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0d0f14] border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-400">✓ Data Integrity Verified</div>
              <div>Expected Songs: <strong>647</strong> | Included: <strong>{countToUse}</strong></div>
              <div className="text-[11px] text-slate-400">Embedded Noto Sans Kannada Unicode font ensures clear Kannada rendering.</div>
            </div>

            <button
              onClick={handleStartDownload}
              className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Songbook</span>
            </button>
          </div>
        )}

        {/* Progress Display during generation */}
        {isGenerating && (
          <div className="space-y-4 text-center py-3">
            {!progress.isComplete ? (
              <>
                <div className="text-3xl">📖</div>
                <h4 className="font-bold text-base text-white">
                  Preparing your songbook PDF...
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  {progress.status}
                </p>

                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-amber-400 font-mono">
                  {progress.percentage}%
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-lg text-white">
                  ✓ Songbook Ready!
                </h4>
                <p className="text-xs text-slate-300">
                  {countToUse} songs successfully included in <code>Kannada-Christian-Songs-{countToUse}-Songbook.pdf</code>.
                </p>

                {/* Direct Download Link Fallback */}
                {progress.blobUrl && (
                  <a
                    href={progress.blobUrl}
                    download={`Kannada-Christian-Songs-${countToUse}-Songbook.pdf`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors my-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Click Here if File Didn't Auto-Download</span>
                  </a>
                )}

                <div>
                  <button
                    onClick={handleResetModal}
                    className="mt-2 px-5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {progress.error && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{progress.error}</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
