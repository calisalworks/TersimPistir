import React, { useState } from 'react';
import { Star, X, CheckCircle, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GooglePlayRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const GooglePlayRateModal: React.FC<GooglePlayRateModalProps> = ({
  isOpen,
  onClose,
  isDark = false,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRate = () => {
    setSubmitted(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 },
    });

    // Try Google Play app protocol first, fallback to browser store link
    const playStoreAppUrl = 'market://details?id=reverse.singing.reversesinging';
    const playStoreWebUrl = 'https://play.google.com/store/apps/details?id=reverse.singing.reversesinging';

    try {
      window.location.href = playStoreAppUrl;
      setTimeout(() => {
        window.open(playStoreWebUrl, '_blank');
      }, 500);
    } catch {
      window.open(playStoreWebUrl, '_blank');
    }

    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl transition-all border ${
          isDark
            ? 'bg-[#1A1C28] border-neutral-700/80 text-white'
            : 'bg-white border-neutral-100 text-neutral-900'
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {/* Google Play colored icon badge */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-emerald-400 to-amber-400 p-[2px] flex items-center justify-center shadow-xs">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase">
                Google Play Store
              </span>
              <h3 className="text-base font-bold leading-tight">
                Tersim Pistir'i Puanla
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Kapat"
            className={`p-1.5 rounded-full transition-colors ${
              isDark
                ? 'hover:bg-neutral-800 text-neutral-400'
                : 'hover:bg-neutral-100 text-neutral-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle className="w-14 h-14 text-emerald-500 animate-bounce" />
            <h4 className="text-lg font-bold">Harika! Çok Teşekkürler!</h4>
            <p
              className={`text-xs ${
                isDark ? 'text-neutral-300' : 'text-neutral-600'
              }`}
            >
              Google Play sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4">
            <p
              className={`text-xs leading-relaxed px-1 ${
                isDark ? 'text-neutral-300' : 'text-neutral-600'
              }`}
            >
              Ters ses kaydetme ve ters şarkı meydan okumamızı sevdin mi? 5 yıldız
              vererek oyunun gelişmesine katkıda bulunabilirsin!
            </p>

            {/* Interactive Stars */}
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} yıldız`}
                  className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : isDark
                        ? 'text-neutral-600'
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <span className="text-[11px] font-semibold text-amber-500">
              {rating === 5
                ? '★★★★★ Harika! (5/5)'
                : `${rating} Yıldız Seçildi`}
            </span>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-2">
              <button
                type="button"
                onClick={handleRate}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white rounded-2xl text-sm font-semibold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Google Play'de 5 Yıldız Ver</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Daha Sonra Hatırlat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
