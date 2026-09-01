import React from 'react';
import { History, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ExtractHistoryPage: React.FC = () => {
  const { extractionHistory } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>PDF Extraction History</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Previous PDF songbook extractions and import logs
        </p>
      </div>

      {extractionHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">No Extraction History Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            PDF song extractions performed will be logged here with date, page counts, and saved items.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {extractionHistory.map(log => (
            <div
              key={log.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{log.pdfName}</h3>
                  <div className="text-xs text-slate-500">{log.date} — {log.totalPages} Pages Processed</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{log.savedCount} Saved</div>
                <div className="text-xs text-slate-500">{log.detectedCount} Detected</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
