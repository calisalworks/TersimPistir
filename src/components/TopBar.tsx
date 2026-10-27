import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Share2, Check, Sun, Moon, Star } from 'lucide-react';
import { NavTab } from './BottomNav';

interface TopBarProps {
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onOpenPlayRate?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab = 'home',
  onSelectTab,
  isDark = false,
  onToggleTheme,
  onOpenPlayRate,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareNotice, setShareNotice] = useState('');
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.calisalworks.tersimpistir';
  const shareTitle = 'Tersim Pistir - Ters Ses Oyunu';
  const shareText = 'Tersim Pistir: Tersine şarkı söyleme meydan okumasında sesini kaydet ve tersine çevir!';

  const showShareNotice = (message: string, didCopy = false) => {
    setCopied(didCopy);
    setShareNotice(message);
    setTimeout(() => {
      setCopied(false);
      setShareNotice('');
    }, 2500);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(playStoreUrl);
      showShareNotice('Bağlantı kopyalandı', true);
    } catch {
      showShareNotice('Paylaşım açılamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleShare = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: shareTitle,
          text: shareText,
          url: playStoreUrl,
          dialogTitle: "Tersim Pistir'i paylaş",
        });
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (message.includes('cancel')) return;
        await copyShareLink();
        return;
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: playStoreUrl,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    await copyShareLink();
  };

  return (
    <>
      <header
        className={`w-full flex items-center justify-between px-2.5 sm:px-5 pt-2 pb-0.5 select-none shrink-0 transition-colors duration-200 border-none shadow-none ${
          isDark
            ? 'bg-[#12131C] text-white'
            : 'bg-white text-neutral-900'
        }`}
      >
        {/* Sol Taraf: Tüm sekmelerde (Ana Sayfa, Kayıtlar, Ayarlar) aynı şekilde gösterilen büyük şeffaf logo */}
        <div className="flex items-center min-w-0 flex-1 pr-2 sm:pr-3">
          <button
            onClick={() => onSelectTab?.('home')}
            className="flex items-center py-0.5 w-full cursor-pointer transition-transform active:scale-[0.99] text-left"
            title="Ana Sayfaya Dön"
          >
            <img
              src="/assets/aistudio/tersim_pistir__1__bfd5069e.png"
              alt="Tersim Pistir"
              className="w-auto h-auto max-h-[150px] sm:max-h-[180px] md:max-h-[200px] max-w-full object-contain object-left border-0 outline-none ring-0 select-none"
              style={{
                background: 'transparent',
                aspectRatio: '1037 / 577',
              }}
            />
          </button>
        </div>

        {/* Sağ Taraf: Google Play Puanlama, Koyu/Açık Tema (Güneş & Hilal) ve Paylaş Butonları */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-center">
          {/* Google Play Puanlama Sembolü */}
          <button
            onClick={onOpenPlayRate}
            aria-label="Google Play'de Puanla"
            title="Google Play'de 5 Yıldız Ver"
            className={`relative p-2 rounded-full transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
              isDark
                ? 'hover:bg-neutral-800 text-amber-400 bg-neutral-800/60'
                : 'hover:bg-amber-50 text-amber-500 bg-amber-50/70 border border-amber-200/60'
            }`}
          >
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-xs" />
            <span className="sr-only">Google Play Puanla</span>
          </button>

          {/* Tema Değiştirme Butonu (Güneş & Hilal) */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Açık Temaya Geç (Güneş Modu)' : 'Karanlık Temaya Geç (Hilal Modu)'}
            title={isDark ? 'Açık Temaya Geç (Güneş)' : 'Koyu Temaya Geç (Hilal)'}
            className={`p-2 rounded-full transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
              isDark
                ? 'bg-neutral-800 text-amber-400 hover:bg-neutral-700 border border-neutral-700'
                : 'bg-neutral-100 text-indigo-700 hover:bg-neutral-200 border border-neutral-200/70'
            }`}
          >
            {isDark ? (
              <Sun className="w-5 h-5 stroke-[2.2] animate-pulse" />
            ) : (
              <Moon className="w-5 h-5 stroke-[2.2] fill-indigo-100" />
            )}
          </button>

          {/* Paylaş Butonu */}
          <button
            onClick={handleShare}
            aria-label="Paylaş"
            title="Tersim Pistir'i Paylaş"
            className={`p-2 rounded-full transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
              isDark
                ? 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-500 stroke-[2.5]" />
            ) : (
              <Share2 className="w-5 h-5 stroke-[2]" />
            )}
          </button>
        </div>
      </header>
      {shareNotice && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg ${
            isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-900 text-white'
          }`}
        >
          {shareNotice}
        </div>
      )}
    </>
  );
};
