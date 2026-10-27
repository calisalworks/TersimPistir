/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { RecordCircle } from './components/RecordCircle';
import { ActionButtons } from './components/ActionButtons';
import { WaveformDisplay } from './components/WaveformDisplay';
import { BottomNav, NavTab } from './components/BottomNav';
import { RecordingsView } from './components/RecordingsView';
import { SettingsView } from './components/SettingsView';
import { RecordedAudio, PlaybackState, AudioQuality } from './types';
import { AudioRecorderService } from './utils/audioRecorder';
import { AudioPlaybackController } from './utils/audioEngine';
import { generateSyntheticDemoAudio, loadAudioFile } from './utils/demoAudio';
import { MicPermissionModal } from './components/MicPermissionModal';
import { GooglePlayRateModal } from './components/GooglePlayRateModal';

const MAX_RECORDINGS = 5;

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Dark / Light Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('tersim_pistir_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('tersim_pistir_theme', nextTheme);
      return nextTheme;
    });
  };

  // Google Play Rating Modal State
  const [isPlayRateModalOpen, setIsPlayRateModalOpen] = useState(false);

  // Sync theme with Android status bar color and documentElement
  useEffect(() => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#12131C' : '#2196F3');
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Audio Quality permanently fixed to 'high' (48 kHz / 128 kbps)
  const audioQuality: AudioQuality = 'high';

  // Up to 5 recordings kept strictly in memory (Index 0: Latest/Active, 1..4: Previous)
  const [recordings, setRecordings] = useState<RecordedAudio[]>([]);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveVolume, setLiveVolume] = useState(0);

  // Playback State
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isReversed: false,
    playingSlotId: null,
    currentTime: 0,
    duration: 0,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mic Permission & Demo State
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState('');
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // Services references
  const recorderRef = useRef<AudioRecorderService | null>(null);
  const playerRef = useRef<AudioPlaybackController | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Demo audio loader (adds to 5-recording buffer)
  const handleLoadDemoAudio = () => {
    const nextNum = Math.min(recordings.length + 1, MAX_RECORDINGS);
    const demoAudio = generateSyntheticDemoAudio(
      `${nextNum}. Kayıt (Demo Ses)`,
      2.3,
      audioQuality
    );
    setRecordings((prev) => [demoAudio, ...prev].slice(0, MAX_RECORDINGS));
    showToast(`Örnek ses yüklendi! (${Math.min(recordings.length + 1, MAX_RECORDINGS)}/5 kayıt)`);
  };

  // Audio file uploader
  const handleFileUpload = async (file: File) => {
    try {
      showToast('Ses dosyası işleniyor...');
      const loaded = await loadAudioFile(file, file.name, audioQuality);
      setRecordings((prev) => [loaded, ...prev].slice(0, MAX_RECORDINGS));
      showToast(
        `Ses yüklendi (${audioQuality === 'high' ? 'Yüksek' : 'Orta'} Kalite, ${Math.min(
          recordings.length + 1,
          MAX_RECORDINGS
        )}/5 kayıt)!`
      );
    } catch {
      showToast('Ses dosyası açılamadı. Lütfen geçerli bir ses dosyası (.mp3, .wav, vb.) seçin.');
    }
  };

  // Initialize playback controller
  useEffect(() => {
    const player = new AudioPlaybackController();
    player.onProgress = (currentTime, duration) => {
      setPlaybackState((prev) => ({
        ...prev,
        currentTime,
        duration,
      }));
    };
    player.onEnded = () => {
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    };
    playerRef.current = player;

    return () => {
      player.stop();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancelRecording();
      }
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, []);

  // Android Immersive Fullscreen (automatically hides status bar and navigation bar)
  useEffect(() => {
    const triggerImmersive = () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement
          .requestFullscreen({ navigationUI: 'hide' })
          .catch(() => {});
      }
    };

    window.addEventListener('touchstart', triggerImmersive, { once: true });
    window.addEventListener('click', triggerImmersive, { once: true });

    return () => {
      window.removeEventListener('touchstart', triggerImmersive);
      window.removeEventListener('click', triggerImmersive);
    };
  }, []);

  // Active audio: on home screen, directly controls latest recorded audio
  const currentAudio = recordings[0] || null;
  const recordCount = recordings.length;

  // Recording Handlers
  const handleStartRecording = async () => {
    // Stop any ongoing playback
    if (playerRef.current) {
      playerRef.current.stop();
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    }

    const recorder = new AudioRecorderService();
    // Limit visualizer-driven React renders; updating the whole screen every
    // animation frame makes the central record button feel sluggish on phones.
    let lastVolumeRender = 0;
    recorder.onVolumeChange = (vol) => {
      const now = performance.now();
      if (now - lastVolumeRender >= 100) {
        lastVolumeRender = now;
        setLiveVolume(vol);
      }
    };
    // The timer only needs tenth-second precision for the visible counter.
    let lastTimeRender = 0;
    recorder.onTimeUpdate = (secs) => {
      const now = performance.now();
      if (now - lastTimeRender >= 100) {
        lastTimeRender = now;
        setRecordingTime(secs);
      }
    };
    recorderRef.current = recorder;

    try {
      await recorder.startRecording(audioQuality);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setMicErrorMessage(errorMsg);
      setIsMicModalOpen(true);
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;

    try {
      const nextNum = Math.min(recordings.length + 1, MAX_RECORDINGS);
      const slotLabel = `${nextNum}. Kayıt${
        recordings.length === 0 ? ' (İlk Kayıt)' : ' (Son Kayıt)'
      }`;
      const recorded = await recorderRef.current.stopRecording(slotLabel);

      setRecordings((prev) => [recorded, ...prev].slice(0, MAX_RECORDINGS));
      showToast(
        `Yeni ses kaydedildi! (${Math.min(
          recordings.length + 1,
          MAX_RECORDINGS
        )}/5 kayıt) "Kayıtlar" sekmesinden dinleyebilirsiniz.`
      );

      setIsRecording(false);
      setRecordingTime(0);
      setLiveVolume(0);
    } catch {
      setIsRecording(false);
      setRecordingTime(0);
      setLiveVolume(0);
    }
  };

  // Playback Handlers
  const playSlotAudio = (audio: RecordedAudio, reversed: boolean) => {
    if (!playerRef.current) return;

    playerRef.current.play(audio.audioBuffer, reversed, playbackSpeed);
    setPlaybackState({
      isPlaying: true,
      isReversed: reversed,
      playingSlotId: audio.id,
      currentTime: 0,
      duration: audio.duration,
    });
  };

  const handlePlayOriginal = () => {
    if (!currentAudio) return;
    playSlotAudio(currentAudio, false);
  };

  const handlePlayReversed = () => {
    if (!currentAudio) return;
    playSlotAudio(currentAudio, true);
  };

  const handleStopPlayback = () => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }));
  };

  const handleDeleteRecording = (id: string) => {
    if (playbackState.isPlaying && playbackState.playingSlotId === id) {
      handleStopPlayback();
    }
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    showToast('Kayıt silindi.');
  };

  const handleClearAll = () => {
    if (playbackState.isPlaying) {
      handleStopPlayback();
    }
    setRecordings([]);
    showToast('Tüm 5 kayıt hafızadan sıfırlandı.');
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between font-sans antialiased relative select-none transition-colors duration-200 pt-[env(safe-area-inset-top,0px)] ${
        isDark ? 'bg-[#12131C] text-neutral-100' : 'bg-white text-neutral-900'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-neutral-900/95 text-white text-xs py-2 px-3.5 rounded-xl shadow-xl backdrop-blur-xs flex items-center justify-center animate-bounce text-center">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header - Çerçevesiz, Şeffaf ve 2 Kat Daha Büyük Logolu Üst Menü */}
      <div className="w-full max-w-2xl mx-auto shrink-0 border-none outline-none">
        <TopBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenPlayRate={() => setIsPlayRateModalOpen(true)}
        />
      </div>

      {/* Hidden file input for uploading audio */}
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Main View Area - Strictly Non-Scrolling on Home Screen */}
      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col overflow-hidden min-h-0">
        {currentTab === 'home' && (
          <div className="w-full h-full flex flex-col justify-between items-center px-4 py-2 overflow-hidden">
            {/* Center Area: Big Blue Circle Button and Waveform */}
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
              <RecordCircle
                isRecording={isRecording}
                recordingTime={recordingTime}
                liveVolume={liveVolume}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                audioQuality={audioQuality}
                isDark={isDark}
              />

              <WaveformDisplay
                audio={currentAudio}
                playbackState={playbackState}
                isDark={isDark}
              />
            </div>

            {/* Green & Red Action Buttons */}
            <div className="w-full mb-3 shrink-0">
              <ActionButtons
                hasAudio={Boolean(currentAudio)}
                playbackState={playbackState}
                playbackSpeed={playbackSpeed}
                onSetSpeed={setPlaybackSpeed}
                onPlayOriginal={handlePlayOriginal}
                onPlayReversed={handlePlayReversed}
                onStop={handleStopPlayback}
                isDark={isDark}
              />
            </div>
          </div>
        )}

        {currentTab === 'records' && (
          <div className="w-full h-full overflow-y-auto px-2 py-2">
            <RecordingsView
              recordings={recordings}
              playbackState={playbackState}
              onPlayOriginal={(audio) => playSlotAudio(audio, false)}
              onPlayReversed={(audio) => playSlotAudio(audio, true)}
              onStop={handleStopPlayback}
              onDeleteRecording={handleDeleteRecording}
              onClearAll={handleClearAll}
              onSwitchToHome={() => setCurrentTab('home')}
              isDark={isDark}
            />
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="w-full h-full overflow-hidden px-1 sm:px-2 py-1 flex flex-col min-h-0">
            <SettingsView
              onClearAll={handleClearAll}
              isDark={isDark}
              onOpenPlayRate={() => setIsPlayRateModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (playbackState.isPlaying) {
            handleStopPlayback();
          }
          setCurrentTab(tab);
        }}
        recordCount={recordCount}
        isDark={isDark}
      />

      {/* Microphone Permission Fallback Modal */}
      <MicPermissionModal
        isOpen={isMicModalOpen}
        errorMessage={micErrorMessage}
        onClose={() => setIsMicModalOpen(false)}
        onRetry={handleStartRecording}
        onLoadDemo={handleLoadDemoAudio}
        onFileSelect={handleFileUpload}
      />

      {/* Google Play Rating Modal */}
      <GooglePlayRateModal
        isOpen={isPlayRateModalOpen}
        onClose={() => setIsPlayRateModalOpen(false)}
        isDark={isDark}
      />
    </div>
  );
}
