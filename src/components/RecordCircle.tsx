import React from 'react';
import { Mic, Square, Sparkles } from 'lucide-react';
import { AudioQuality } from '../types';

interface RecordCircleProps {
  isRecording: boolean;
  recordingTime: number;
  liveVolume: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
  audioQuality?: AudioQuality;
  isDark?: boolean;
}

export const RecordCircle: React.FC<RecordCircleProps> = ({
  isRecording,
  recordingTime,
  liveVolume,
  onStartRecording,
  onStopRecording,
  disabled = false,
  audioQuality = 'medium',
  isDark = false,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (disabled) return;
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  // Dynamic scale ring based on audio volume
  const dynamicScale = 1 + (isRecording ? liveVolume * 0.28 : 0);

  return (
    <div className="relative flex flex-col items-center justify-center my-1 sm:my-2 shrink-0">
      {/* Outer pulsing rings when recording */}
      {isRecording && (
        <>
          <div
            className="absolute rounded-full bg-pink-500 opacity-25 pointer-events-none transition-transform duration-75"
            style={{
              width: '235px',
              height: '235px',
              transform: `scale(${dynamicScale * 1.25})`,
            }}
          />
          <div
            className="absolute rounded-full bg-rose-500 opacity-35 pointer-events-none transition-transform duration-75 animate-ping"
            style={{
              width: '215px',
              height: '215px',
            }}
          />
        </>
      )}

      {/* Logodan Esinlenilmiş Eğlenceli Arcade Tarzı Büyük Kaydet Butonu */}
      <div className="relative p-2 rounded-full">
        {/* Dekoratif Dış Eğlenceli Halka (Parti / Konfeti Esintisi) */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-500 pointer-events-none ${
            isRecording
              ? 'border-pink-500/60 animate-spin-slow'
              : isDark
              ? 'border-cyan-400/30'
              : 'border-cyan-400/50'
          }`}
        />

        <button
          onClick={handleClick}
          disabled={disabled}
          aria-label={isRecording ? 'Kaydı Durdur' : 'Ses Kaydet'}
          className={`relative z-10 w-[185px] h-[185px] sm:w-[215px] sm:h-[215px] rounded-full flex flex-col items-center justify-center text-white select-none cursor-pointer transition-all duration-150 active:translate-y-1.5 active:scale-95 ${
            isRecording
              ? 'bg-gradient-to-b from-[#FB7185] via-[#E11D48] to-[#9F1239] border-b-[6px] border-[#881337] active:border-b-0 shadow-lg shadow-rose-500/40'
              : 'bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#0369A1] border-b-[6px] border-[#075985] active:border-b-0 shadow-xl shadow-cyan-500/35 hover:brightness-105'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {/* Buton Üst Işıltısı (3D Bombe Hissi) */}
          <div className="absolute top-2 w-[70%] h-[32%] rounded-full bg-white/20 blur-[1px] pointer-events-none" />

          {isRecording ? (
            <div className="flex flex-col items-center justify-center gap-1 z-10">
              <div className="relative flex items-center justify-center">
                <Square className="w-11 h-11 sm:w-13 sm:h-13 fill-white stroke-none animate-pulse drop-shadow-md" />
              </div>
              <span className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-yellow-300 drop-shadow-sm">
                {formatTime(recordingTime)}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-widest uppercase bg-black/20 px-2.5 py-0.5 rounded-full">
                Durdur
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 z-10">
              <div className="relative">
                <Mic className="w-14 h-14 sm:w-16 sm:h-16 stroke-[2.2] text-yellow-300 fill-yellow-300/20 drop-shadow-md transition-transform group-hover:scale-105" />
                <Sparkles className="w-4 h-4 text-pink-300 absolute -top-1 -right-2 animate-bounce" />
              </div>
              <span className="text-[23px] sm:text-[25px] font-black tracking-wide text-white drop-shadow-md">
                KAYDET
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Kayıt Durumu Bilgisi */}
      <div className="mt-2 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              isRecording ? 'bg-pink-500 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            {isRecording
              ? 'Mikrofon devrede (Yüksek Kalite / 48 kHz)...'
              : 'Dokun ve konuşmaya başla'}
          </span>
        </div>
      </div>
    </div>
  );
};
