import React from 'react';
import { RecordedAudio, PlaybackState } from '../types';
import { Play, RotateCcw, Pause, Trash2, ArrowRight, Music2 } from 'lucide-react';

interface RecordingsViewProps {
  recordings: RecordedAudio[];
  playbackState: PlaybackState;
  onPlayOriginal: (audio: RecordedAudio) => void;
  onPlayReversed: (audio: RecordedAudio) => void;
  onStop: () => void;
  onDeleteRecording: (id: string) => void;
  onClearAll: () => void;
  onSwitchToHome: () => void;
  isDark?: boolean;
}

export const RecordingsView: React.FC<RecordingsViewProps> = ({
  recordings,
  playbackState,
  onPlayOriginal,
  onPlayReversed,
  onStop,
  onDeleteRecording,
  onClearAll,
  onSwitchToHome,
  isDark = false,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-3 sm:px-4 py-4 space-y-4 pb-20">
      {/* Başlık ve Sayaç */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              Kayıtlar
            </h2>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                recordings.length >= 5
                  ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/30'
              }`}
            >
              {recordings.length}/5 Dolu
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Maksimum 5 kayıt RAM hafızasında tutulur.
          </p>
        </div>

        {recordings.length > 0 && (
          <button
            onClick={onClearAll}
            className={`py-1.5 px-3 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isDark
                ? 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800'
                : 'text-neutral-500 hover:text-rose-600 hover:bg-rose-50'
            }`}
            title="Tüm Kayıtları Sıfırla"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tümünü Sil</span>
          </button>
        )}
      </div>

      {/* Kayıt Listesi (En Fazla 5 Kayıt) */}
      <div className="space-y-3">
        {recordings.length === 0 ? (
          <div
            className={`border rounded-2xl p-6 text-center space-y-3 ${
              isDark
                ? 'bg-[#1A1C2A]/60 border-neutral-800 text-neutral-400'
                : 'bg-neutral-50/80 border-neutral-200 text-neutral-500'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
              <Music2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">Henüz ses kaydı bulunmuyor</p>
              <p className="text-xs opacity-80 mt-1">
                Ana sayfadaki büyük butona dokunarak 5 adede kadar ses kaydedebilirsiniz.
              </p>
            </div>
            <button
              onClick={onSwitchToHome}
              className="py-2 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-xs"
            >
              <span>Ana Sayfada Kaydet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          recordings.map((audio, index) => {
            const isPlaying = playbackState.playingSlotId === audio.id && playbackState.isPlaying;
            const isPlayingOrig = isPlaying && !playbackState.isReversed;
            const isPlayingRev = isPlaying && playbackState.isReversed;

            return (
              <div
                key={audio.id}
                className={`border rounded-2xl p-3.5 shadow-xs transition-colors ${
                  isDark
                    ? 'bg-[#1A1C2A] border-neutral-700/80 text-white'
                    : 'bg-white border-neutral-200/90 text-neutral-900'
                }`}
              >
                {/* Üst Bilgi Satırı */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        index === 0
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-neutral-800 text-neutral-300'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-xs leading-tight">
                        {audio.name || `${index + 1}. Kayıt`}
                      </h3>
                      <span className="text-[10px] text-neutral-400">
                        {audio.duration.toFixed(1)} saniye &bull;{' '}
                        {new Date(audio.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDeleteRecording(audio.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDark
                          ? 'text-neutral-500 hover:text-rose-400 hover:bg-neutral-800'
                          : 'text-neutral-400 hover:text-rose-500 hover:bg-rose-50'
                      }`}
                      title="Bu kaydı sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dalga Formu Önizleme */}
                <div
                  className={`h-7 flex items-center justify-between gap-[2px] my-2 px-2 rounded-lg ${
                    isDark ? 'bg-neutral-900/70' : 'bg-neutral-50'
                  }`}
                >
                  {audio.waveform.map((bar, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${
                        isDark ? 'bg-neutral-600' : 'bg-neutral-300'
                      }`}
                      style={{ height: `${Math.max(15, bar * 100)}%` }}
                    />
                  ))}
                </div>

                {/* Oynatma Butonları */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => (isPlayingOrig ? onStop() : onPlayOriginal(audio))}
                    className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-white transition-all shadow-xs cursor-pointer ${
                      isPlayingOrig
                        ? 'bg-emerald-700 ring-2 ring-emerald-300'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isPlayingOrig ? (
                      <Pause className="w-3.5 h-3.5 fill-white" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    )}
                    <span>Orijinal</span>
                  </button>

                  <button
                    onClick={() => (isPlayingRev ? onStop() : onPlayReversed(audio))}
                    className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-white transition-all shadow-xs cursor-pointer ${
                      isPlayingRev
                        ? 'bg-rose-700 ring-2 ring-rose-300'
                        : 'bg-rose-500 hover:bg-rose-600'
                    }`}
                  >
                    {isPlayingRev ? (
                      <Pause className="w-3.5 h-3.5 fill-white" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>Tersi</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
