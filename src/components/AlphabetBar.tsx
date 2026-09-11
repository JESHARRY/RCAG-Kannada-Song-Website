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
    <div className="bg-church-surface border border-church-border rounded-xl p-2.5 shadow-xs mb-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectLetter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-kannada font-bold whitespace-nowrap transition-colors ${
            selectedLetter === ''
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
              className={`px-2.5 py-1.5 rounded-lg text-sm font-kannada font-bold min-w-[32px] text-center transition-colors ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-amber-300'
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
