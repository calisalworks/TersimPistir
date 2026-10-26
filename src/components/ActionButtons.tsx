import React from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { PlaybackState } from '../types';

interface ActionButtonsProps {
  hasAudio: boolean;
  playbackState: PlaybackState;
  playbackSpeed: number;
  onSetSpeed: (speed: number) => void;
  onPlayOriginal: () => void;
  onPlayReversed: () => void;
  onStop: () => void;
  isDark?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  hasAudio,
  playbackState,
  playbackSpeed,
  onSetSpeed,
  onPlayOriginal,
  onPlayReversed,
  onStop,
  isDark = false,
}) => {
  const isPlayingOriginal = playbackState.isPlaying && !playbackState.isReversed;
  const isPlayingReversed = playbackState.isPlaying && playbackState.isReversed;

  return (
    <div className="w-full flex flex-col items-center gap-2.5 px-4 sm:px-6 shrink-0">
      {/* 1. Orijinali Çal - Canlı Zümrüt Yeşili Arcade Butonu */}
      <button
        onClick={isPlayingOriginal ? onStop : onPlayOriginal}
        disabled={!hasAudio}
        aria-label="Orijinali Çal"
        className={`w-full max-w-md h-[52px] sm:h-[56px] rounded-2xl flex items-center justify-center gap-2.5 text-white font-black text-[17px] sm:text-[18px] tracking-wide select-none cursor-pointer transition-all duration-150 active:translate-y-1 ${
          !hasAudio
            ? isDark
              ? 'bg-neutral-800 text-neutral-500 shadow-none cursor-not-allowed border-b-2 border-neutral-700'
              : 'bg-neutral-200 text-neutral-400 shadow-none cursor-not-allowed border-b-2 border-neutral-300'
            : isPlayingOriginal
            ? 'bg-gradient-to-r from-[#059669] to-[#047857] border-b-0 ring-4 ring-emerald-400/50 translate-y-1 shadow-inner'
            : 'bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] border-b-[4px] border-[#065F46] shadow-lg shadow-emerald-500/30 hover:brightness-105'
        }`}
      >
        {isPlayingOriginal ? (
          <>
            <Pause className="w-6 h-6 fill-white stroke-none drop-shadow-sm animate-pulse" />
            <span className="drop-shadow-sm">DURDUR</span>
          </>
        ) : (
          <>
            <div className="relative">
              <Play className="w-6 h-6 fill-white stroke-none ml-0.5 drop-shadow-sm" />
              {hasAudio && (
                <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1" />
              )}
            </div>
            <span className="drop-shadow-sm">ORİJİNALİ ÇAL</span>
          </>
        )}
      </button>

      {/* 2. Tersi Çal - Canlı Sakız Pembesi / Fuşya Arcade Butonu (Logodaki "tir" Rengi) */}
      <button
        onClick={isPlayingReversed ? onStop : onPlayReversed}
        disabled={!hasAudio}
        aria-label="Tersi Çal"
        className={`w-full max-w-md h-[52px] sm:h-[56px] rounded-2xl flex items-center justify-center gap-2.5 text-white font-black text-[17px] sm:text-[18px] tracking-wide select-none cursor-pointer transition-all duration-150 active:translate-y-1 ${
          !hasAudio
            ? isDark
              ? 'bg-neutral-800 text-neutral-500 shadow-none cursor-not-allowed border-b-2 border-neutral-700'
              : 'bg-neutral-200 text-neutral-400 shadow-none cursor-not-allowed border-b-2 border-neutral-300'
            : isPlayingReversed
            ? 'bg-gradient-to-r from-[#E11D48] to-[#BE123C] border-b-0 ring-4 ring-rose-400/50 translate-y-1 shadow-inner'
            : 'bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#BE123C] border-b-[4px] border-[#881337] shadow-lg shadow-pink-500/30 hover:brightness-105'
        }`}
      >
        {isPlayingReversed ? (
          <>
            <Pause className="w-6 h-6 fill-white stroke-none drop-shadow-sm animate-pulse" />
            <span className="drop-shadow-sm">DURDUR</span>
          </>
        ) : (
          <>
            <RotateCcw className="w-6 h-6 stroke-[3] drop-shadow-sm" />
            <span className="drop-shadow-sm">TERSİ ÇAL</span>
          </>
        )}
      </button>

      {/* Hız Kontrolleri */}
      {hasAudio && (
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <div className="flex items-center gap-1 text-xs font-semibold text-neutral-400">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hız:</span>
          </div>
          {[0.8, 1.0, 1.25].map((speed) => (
            <button
              key={speed}
              onClick={() => onSetSpeed(speed)}
              className={`px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer ${
                playbackSpeed === speed
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs scale-105'
                  : isDark
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {speed === 1.0 ? '1.0x Normal' : `${speed}x`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
