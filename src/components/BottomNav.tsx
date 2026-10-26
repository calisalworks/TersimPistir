import React from 'react';
import { Home, Music2, Sliders, Sparkles } from 'lucide-react';

export type NavTab = 'home' | 'records' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  recordCount: number;
  isDark?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  recordCount,
  isDark = false,
}) => {
  return (
    <nav
      className={`w-full px-3 py-2 select-none shrink-0 border-t transition-colors duration-200 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] ${
        isDark
          ? 'bg-[#151724] border-neutral-800/90 text-white'
          : 'bg-white/95 backdrop-blur-md border-neutral-200/70 text-neutral-900 shadow-lg shadow-neutral-200/50'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Ana Sayfa - Güneş Sarısı / Altın Sarısı (Logodaki "Tersim" rengi) */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex flex-col items-center gap-1 py-1 px-3 cursor-pointer transition-all active:scale-90 group"
          aria-label="Ana Sayfa"
        >
          <div
            className={`relative flex items-center justify-center w-14 h-9 rounded-2xl transition-all duration-300 ${
              currentTab === 'home'
                ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 shadow-md shadow-amber-400/30 scale-105 border-b-2 border-amber-500'
                : isDark
                ? 'bg-neutral-800/70 text-amber-400/70 hover:text-amber-300 hover:bg-neutral-800'
                : 'bg-amber-50 text-amber-600/80 hover:text-amber-600 hover:bg-amber-100/60'
            }`}
          >
            <Home className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentTab === 'home' ? 'fill-amber-950 stroke-[2.2]' : 'stroke-[2]'}`} />
            {currentTab === 'home' && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
              </span>
            )}
          </div>
          <span
            className={`text-[11px] tracking-tight transition-colors ${
              currentTab === 'home'
                ? isDark
                  ? 'font-bold text-amber-300'
                  : 'font-bold text-amber-700'
                : isDark
                ? 'font-medium text-neutral-400'
                : 'font-medium text-neutral-500'
            }`}
          >
            Ana Sayfa
          </span>
        </button>

        {/* 2. Kayıtlar - Canlı Turkuaz / Mavi (Logodaki "Pis" rengi) */}
        <button
          onClick={() => onSelectTab('records')}
          className="flex flex-col items-center gap-1 py-1 px-3 cursor-pointer transition-all active:scale-90 relative group"
          aria-label="Kayıtlar"
        >
          <div
            className={`relative flex items-center justify-center w-14 h-9 rounded-2xl transition-all duration-300 ${
              currentTab === 'records'
                ? 'bg-gradient-to-tr from-cyan-400 to-teal-300 text-teal-950 shadow-md shadow-cyan-400/30 scale-105 border-b-2 border-teal-600'
                : isDark
                ? 'bg-neutral-800/70 text-cyan-400/70 hover:text-cyan-300 hover:bg-neutral-800'
                : 'bg-cyan-50 text-cyan-600/80 hover:text-cyan-600 hover:bg-cyan-100/60'
            }`}
          >
            <Music2 className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentTab === 'records' ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            
            {/* Kayıt Sayısı Rozeti */}
            {recordCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] text-white flex items-center justify-center font-black shadow-xs border border-white">
                {recordCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] tracking-tight transition-colors ${
              currentTab === 'records'
                ? isDark
                  ? 'font-bold text-cyan-300'
                  : 'font-bold text-teal-700'
                : isDark
                ? 'font-medium text-neutral-400'
                : 'font-medium text-neutral-500'
            }`}
          >
            Kayıtlar
          </span>
        </button>

        {/* 3. Ayarlar - Canlı Sakız Pembesi / Fuşya (Logodaki "tir" rengi) */}
        <button
          onClick={() => onSelectTab('settings')}
          className="flex flex-col items-center gap-1 py-1 px-3 cursor-pointer transition-all active:scale-90 group"
          aria-label="Ayarlar"
        >
          <div
            className={`relative flex items-center justify-center w-14 h-9 rounded-2xl transition-all duration-300 ${
              currentTab === 'settings'
                ? 'bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/30 scale-105 border-b-2 border-rose-700'
                : isDark
                ? 'bg-neutral-800/70 text-pink-400/70 hover:text-pink-300 hover:bg-neutral-800'
                : 'bg-pink-50 text-pink-600/80 hover:text-pink-600 hover:bg-pink-100/60'
            }`}
          >
            <Sliders className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentTab === 'settings' ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            {currentTab === 'settings' && (
              <Sparkles className="w-2.5 h-2.5 text-yellow-300 absolute -top-1 -right-0.5 animate-pulse" />
            )}
          </div>
          <span
            className={`text-[11px] tracking-tight transition-colors ${
              currentTab === 'settings'
                ? isDark
                  ? 'font-bold text-pink-300'
                  : 'font-bold text-pink-700'
                : isDark
                ? 'font-medium text-neutral-400'
                : 'font-medium text-neutral-500'
            }`}
          >
            Ayarlar
          </span>
        </button>
      </div>
    </nav>
  );
};
