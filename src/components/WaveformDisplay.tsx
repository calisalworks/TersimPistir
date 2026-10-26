import React from 'react';
import { RecordedAudio, PlaybackState } from '../types';

interface WaveformDisplayProps {
  audio: RecordedAudio | null;
  playbackState: PlaybackState;
  isDark?: boolean;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  audio,
  playbackState,
  isDark = false,
}) => {
  if (!audio) {
    return (
      <div className="w-full max-w-md px-4 my-1 shrink-0 text-center">
        <div
          className={`h-8 border border-dashed rounded-xl flex items-center justify-center transition-colors ${
            isDark
              ? 'border-neutral-800 bg-[#161722]/80 text-neutral-500'
              : 'border-neutral-200 bg-neutral-50/60 text-neutral-400'
          }`}
        >
          <span className="text-[11px]">
            Ses kaydedildiğinde dalga burada görünecek
          </span>
        </div>
      </div>
    );
  }

  const duration = audio.duration;
  const currentTime = playbackState.currentTime;
  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const isPlaying = playbackState.isPlaying;
  const isReversed = playbackState.isReversed;

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${mins}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="w-full max-w-md px-4 my-1 shrink-0">
      <div
        className={`border rounded-2xl py-1.5 px-3 shadow-xs transition-colors ${
          isDark
            ? 'bg-[#1A1C2A]/90 border-neutral-700/80 text-white'
            : 'bg-white/80 border-neutral-200/80 text-neutral-900'
        }`}
      >
        {/* Header with times */}
        <div
          className={`flex items-center justify-between text-[11px] font-mono mb-1 px-1 ${
            isDark ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        >
          <span
            className={`flex items-center gap-1 font-semibold ${
              isDark ? 'text-neutral-200' : 'text-neutral-700'
            }`}
          >
            {isPlaying && (
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isReversed ? 'bg-red-500' : 'bg-green-500'
                }`}
              />
            )}
            {formatSecs(currentTime)}
          </span>
          <span
            className={`text-[10px] ${
              isDark ? 'text-neutral-400' : 'text-neutral-400'
            }`}
          >
            {isReversed ? 'Ters Oynatılıyor ◀' : 'Orijinal Oynatılıyor ▶'}
          </span>
          <span>{formatSecs(duration)}</span>
        </div>

        {/* Waveform Bars */}
        <div className="h-6 sm:h-8 flex items-center justify-between gap-[2px] px-1 overflow-hidden">
          {audio.waveform.map((bar, idx) => {
            const barRatio = idx / audio.waveform.length;
            const isActive = isReversed
              ? 1 - barRatio <= progressRatio
              : barRatio <= progressRatio;

            return (
              <div
                key={idx}
                className="flex-1 rounded-full transition-colors duration-100"
                style={{
                  height: `${Math.max(15, bar * 100)}%`,
                  backgroundColor: isActive
                    ? isReversed
                      ? '#EF4444' // Red
                      : '#10B981' // Green
                    : isDark
                    ? '#2E334D' // Dark unplayed
                    : '#E5E7EB', // Light unplayed
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
