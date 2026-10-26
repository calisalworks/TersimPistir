import React, { useRef } from 'react';
import { MicOff, ExternalLink, Music, Upload, RefreshCw, X } from 'lucide-react';

interface MicPermissionModalProps {
  isOpen: boolean;
  errorMessage: string;
  onClose: () => void;
  onRetry: () => void;
  onLoadDemo: () => void;
  onFileSelect: (file: File) => void;
}

export const MicPermissionModal: React.FC<MicPermissionModalProps> = ({
  isOpen,
  errorMessage,
  onClose,
  onRetry,
  onLoadDemo,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col relative text-neutral-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
            <MicOff className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900">
            Mikrofon İzni Gerekiyor
          </h3>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Tersim Pistir oyununda ses kaydı yapabilmek için mikrofon izni gereklidir. Geliştirme önizleme penceresi (iframe) tarayıcı güvenlik politikası nedeniyle mikrofona doğrudan erişememiş olabilir.
          </p>
        </div>

        {/* Detailed Error Note */}
        {errorMessage && (
          <div className="bg-neutral-100 rounded-xl p-2.5 text-[11px] text-neutral-600 font-mono mb-4 text-center">
            {errorMessage}
          </div>
        )}

        {/* Solutions */}
        <div className="space-y-2.5">
          {/* Solution 1: Open in New Tab */}
          <button
            onClick={handleOpenInNewTab}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Yeni Sekmede Aç (Doğrudan Mikrofon İzni)</span>
          </button>

          {/* Solution 2: Try Synthetic Demo Sound */}
          <button
            onClick={() => {
              onLoadDemo();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Music className="w-4 h-4 text-emerald-600" />
            <span>Mikrofonsuz Dene (Örnek Ses Yükle)</span>
          </button>

          {/* Solution 3: Upload Audio File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Kendi Ses Dosyanı Yükle (.mp3 / .wav)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Solution 4: Retry */}
          <button
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="w-full py-2 text-neutral-500 hover:text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>İzni Tekrar İste</span>
          </button>
        </div>
      </div>
    </div>
  );
};
