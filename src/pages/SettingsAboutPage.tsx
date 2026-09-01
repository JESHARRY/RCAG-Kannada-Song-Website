import React from 'react';
import { Heart, Globe, Mail, Moon, Sun, Type } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsAboutPage: React.FC = () => {
  const { theme, toggleTheme, fontSize, setFontSize } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Title */}
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">
          ⚙️ Settings & About
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          App preferences and vision about King's Apps
        </p>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          App Preferences
        </h2>

        {/* Theme Preference */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">Appearance Theme</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* Font Size Preference */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">Default Lyrics Font Size</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Adjust reading size for Kannada & English text</div>
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  fontSize === size
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
            ✝️
          </div>
          <div>
            <h2 className="font-bold text-xl text-slate-900 dark:text-white">King's Apps</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Founded by Bro Raju and Sharon Shetty</p>
          </div>
        </div>

        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
          We are a team of spiritually elevated believers who got burden from the Lord to help His drudge through our God given talents and software skills.
        </p>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Our Vision</h3>
          <blockquote className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border-l-4 border-indigo-600 rounded-xl text-indigo-950 dark:text-indigo-200 text-sm font-medium">
            "Carry each other’s burdens, and in this way you will fulfill the LAW OF CHRIST"
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">— Galatians 6:2</div>
          </blockquote>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Our Mission</h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            Our mission is to inflate this cyber world with Word of God and win souls for his kingdom by sharing the gospel online.
          </p>
        </div>

        {/* Contact Links */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4">
          <a
            href="mailto:kingsappskannada@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>kingsappskannada@gmail.com</span>
          </a>
          <a
            href="http://kannadachristiansongs.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>kannadachristiansongs.in</span>
          </a>
        </div>
      </div>
    </div>
  );
};
