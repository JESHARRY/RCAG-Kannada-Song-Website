import React from 'react';
import { KANNADA_ALPHABET } from '../utils/searchEngine';

interface AlphabetBarProps {
  selectedLetter: string;
  onSelectLetter: (letter: string) => void;
}

export const AlphabetBar: React.FC<AlphabetBarProps> = ({
  selectedLetter,
  onSelectLetter,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm mb-6">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectLetter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-kannada font-bold whitespace-nowrap transition-all ${
            selectedLetter === ''
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          ಎಲ್ಲಾ (All)
        </button>

        {KANNADA_ALPHABET.map((char) => {
          const isSelected = selectedLetter === char;
          return (
            <button
              key={char}
              onClick={() => onSelectLetter(isSelected ? '' : char)}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-kannada font-semibold min-w-[32px] text-center transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md scale-105'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {char}
            </button>
          );
        })}
      </div>
    </div>
  );
};
