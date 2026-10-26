export interface RecordedAudio {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  audioBuffer: AudioBuffer;
  waveform: number[];
  blob: Blob;
  sampleRate: number;
  qualityNote: string;
}

export type AudioQuality = 'medium' | 'high';

export interface PlaybackState {
  isPlaying: boolean;
  isReversed: boolean;
  playingSlotId: string | null;
  currentTime: number;
  duration: number;
}
