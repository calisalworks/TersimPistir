import React, { useState } from 'react';
import {
  HelpCircle,
  Star,
  ChevronDown,
  Trash2,
} from 'lucide-react';

interface SettingsViewProps {
  onClearAll: () => void;
  isDark?: boolean;
  onOpenPlayRate?: () => void;
}

type AccordionSection = 'rules' | 'rate';

export const SettingsView: React.FC<SettingsViewProps> = ({
  onClearAll,
  isDark = false,
  onOpenPlayRate,
}) => {
  // Varsayılan olarak açık olan sekme 'rules' (Nasıl Oynanır)
  const [openSection, setOpenSection] = useState<AccordionSection | null>('rules');

  const toggleSection = (section: AccordionSection) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between px-3 sm:px-4 py-2 overflow-hidden select-none">
      {/* Üst Kısım: Başlık ve Akordiyon */}
      <div className="space-y-2.5 min-h-0 flex-1 flex flex-col">
        {/* Başlık Satırı */}
        <div className="flex items-center justify-between shrink-0 pt-0.5">
          <h2 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Ayarlar
          </h2>
          <span className="text-[11px] font-medium text-neutral-400">
            Tersim Pistir Rehberi
          </span>
        </div>

        {/* Akordiyon Listesi */}
        <div className="space-y-2 shrink-0">
          {/* 1. SEKME: Tersim Pistir Nasıl Oynanır? (Tam ekrana sığacak kompakt 2x2 kart tasarımı) */}
          <div
            className={`border rounded-2xl overflow-hidden shadow-xs transition-colors ${
              isDark
                ? 'bg-[#1A1C2A] border-neutral-700/80 text-white'
                : 'bg-white border-neutral-200/90 text-neutral-900'
            }`}
          >
            <button
              onClick={() => toggleSection('rules')}
              className="w-full px-3.5 py-2.5 sm:py-3 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-neutral-500/5"
              aria-expanded={openSection === 'rules'}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm leading-tight">
                    Tersim Pistir Nasıl Oynanır?
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    4 adımda ters şarkı söyleme rehberi
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 transition-transform duration-200 ${
                  openSection === 'rules' ? 'rotate-180 text-cyan-500' : ''
                }`}
              />
            </button>

            {/* Genişleyen İçerik: Kaydırma yapmadan tam ekrana sığan kompakt 4 adım */}
            {openSection === 'rules' && (
              <div
                className={`px-3 pb-3 pt-1 border-t animate-in fade-in duration-150 ${
                  isDark ? 'border-neutral-800' : 'border-neutral-100'
                }`}
              >
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* 1. Adım */}
                  <div
                    className={`p-2 rounded-xl border flex flex-col justify-between ${
                      isDark
                        ? 'bg-neutral-900/60 border-neutral-800'
                        : 'bg-blue-50/50 border-blue-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        1
                      </span>
                      <span className="font-bold text-[11px] leading-tight truncate">
                        Orijinali Kaydet
                      </span>
                    </div>
                    <p className={`text-[10px] leading-snug ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      Gizli bir kelime veya kısa şarkı kaydet.
                    </p>
                  </div>

                  {/* 2. Adım */}
                  <div
                    className={`p-2 rounded-xl border flex flex-col justify-between ${
                      isDark
                        ? 'bg-neutral-900/60 border-neutral-800'
                        : 'bg-rose-50/50 border-rose-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        2
                      </span>
                      <span className="font-bold text-[11px] leading-tight truncate">
                        Tersini Dinle
                      </span>
                    </div>
                    <p className={`text-[10px] leading-snug ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      "Tersi Çal" ile çıkan ters sesi dinle.
                    </p>
                  </div>

                  {/* 3. Adım */}
                  <div
                    className={`p-2 rounded-xl border flex flex-col justify-between ${
                      isDark
                        ? 'bg-neutral-900/60 border-neutral-800'
                        : 'bg-cyan-50/50 border-cyan-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-4 h-4 rounded-full bg-cyan-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        3
                      </span>
                      <span className="font-bold text-[11px] leading-tight truncate">
                        Tersi Taklit Et
                      </span>
                    </div>
                    <p className={`text-[10px] leading-snug ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      2. oyuncu bu ters sesi taklit edip kaydeder.
                    </p>
                  </div>

                  {/* 4. Adım */}
                  <div
                    className={`p-2 rounded-xl border flex flex-col justify-between ${
                      isDark
                        ? 'bg-neutral-900/60 border-neutral-800'
                        : 'bg-amber-50/50 border-amber-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        4
                      </span>
                      <span className="font-bold text-[11px] leading-tight truncate">
                        Tersim Pistir!
                      </span>
                    </div>
                    <p className={`text-[10px] leading-snug ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      2. sesin tersini çal, orijinal kelime duyulsun!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. SEKME: Google Play Store Puanı */}
          {onOpenPlayRate && (
            <div
              className={`border rounded-2xl overflow-hidden shadow-xs transition-colors ${
                isDark
                  ? 'bg-[#1A1C2A] border-neutral-700/80 text-white'
                  : 'bg-white border-neutral-200/90 text-neutral-900'
              }`}
            >
              <button
                onClick={() => toggleSection('rate')}
                className="w-full px-3.5 py-2.5 sm:py-3 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-neutral-500/5"
                aria-expanded={openSection === 'rate'}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm leading-tight">
                      Google Play Store Puanı
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Bize 5 yıldız vererek destek olun
                    </p>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 transition-transform duration-200 ${
                    openSection === 'rate' ? 'rotate-180 text-amber-500' : ''
                  }`}
                />
              </button>

              {/* Genişleyen İçerik */}
              {openSection === 'rate' && (
                <div
                  className={`px-3 pb-3 pt-1 border-t space-y-2 animate-in fade-in duration-150 ${
                    isDark ? 'border-neutral-800' : 'border-neutral-100'
                  }`}
                >
                  <p className={`text-[11px] leading-tight ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    Tersim Pistir'i beğendiyseniz Google Play'de 5 yıldız bırakarak destek olabilirsiniz!
                  </p>

                  <button
                    type="button"
                    onClick={onOpenPlayRate}
                    className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Google Play'de 5 Yıldız Ver</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alt Kısım: "Hafızadaki kayıtları sil" Butonu (Sabit ve ekrana tam oturan alt alan) */}
      <div className="pt-2 shrink-0 pb-1">
        <button
          onClick={onClearAll}
          className={`w-full py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
            isDark
              ? 'border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 hover:border-rose-700'
              : 'border-rose-200 bg-rose-50/70 text-rose-600 hover:bg-rose-100 hover:border-rose-300 shadow-xs'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Hafızadaki kayıtları sil</span>
        </button>
      </div>
    </div>
  );
};
