import { AudioQuality } from '../types';

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

/**
 * Reverses an AudioBuffer by flipping sample data in all channels.
 */
export function reverseAudioBuffer(ctx: AudioContext, buffer: AudioBuffer): AudioBuffer {
  const reversed = ctx.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const forwardData = buffer.getChannelData(channel);
    const reverseData = reversed.getChannelData(channel);
    const len = buffer.length;
    for (let i = 0; i < len; i++) {
      reverseData[i] = forwardData[len - 1 - i];
    }
  }

  return reversed;
}

/**
 * Encodes an AudioBuffer into standard 16-bit PCM WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write 16-bit PCM samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = Math.max(-1, Math.min(1, channels[c][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Processes audio buffer according to selected quality:
 * - 'medium': 22050 Hz speech quality
 * - 'high': 44100 / 48000 Hz pristine studio quality
 */
export function processQualityBuffer(
  ctx: AudioContext,
  rawBuffer: AudioBuffer,
  quality: AudioQuality
): AudioBuffer {
  if (quality === 'high') {
    // Keep high quality / original sample rate without reduction
    return rawBuffer;
  }

  // Medium quality: downsample to ~22050 Hz
  const targetSampleRate = 22050;
  if (rawBuffer.sampleRate <= targetSampleRate) {
    return rawBuffer;
  }

  const ratio = rawBuffer.sampleRate / targetSampleRate;
  const newLength = Math.round(rawBuffer.length / ratio);
  const mediumBuffer = ctx.createBuffer(
    rawBuffer.numberOfChannels,
    newLength,
    targetSampleRate
  );

  for (let c = 0; c < rawBuffer.numberOfChannels; c++) {
    const src = rawBuffer.getChannelData(c);
    const dest = mediumBuffer.getChannelData(c);
    for (let i = 0; i < newLength; i++) {
      const srcIndex = Math.min(Math.floor(i * ratio), rawBuffer.length - 1);
      dest[i] = src[srcIndex];
    }
  }

  return mediumBuffer;
}

/**
 * Generates normalized peak amplitudes for waveform visualizer (45 bars)
 */
export function extractWaveform(buffer: AudioBuffer, numBars = 45): number[] {
  const channelData = buffer.getChannelData(0);
  const step = Math.floor(channelData.length / numBars);
  const bars: number[] = [];

  for (let i = 0; i < numBars; i++) {
    const start = i * step;
    let max = 0;
    for (let j = 0; j < step; j++) {
      const val = Math.abs(channelData[start + j] || 0);
      if (val > max) max = val;
    }
    const normalized = Math.min(1, Math.max(0.12, max * 1.4));
    bars.push(Number(normalized.toFixed(2)));
  }

  return bars;
}

/**
 * Playback controller with STRICT pitch preservation (preservesPitch = true).
 * Ensures speed 0.8x and 1.25x do NOT thicken (kalınlaştırma) or thin (inceltme) the voice,
 * playing the original sound timber faster or slower!
 */
export class AudioPlaybackController {
  private audioElement: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;
  private animFrameId: number | null = null;
  private duration = 0;

  public onProgress?: (currentTime: number, duration: number) => void;
  public onEnded?: () => void;

  constructor() {}

  public play(
    buffer: AudioBuffer,
    reversed = false,
    speed = 1.0,
    startFrom = 0
  ) {
    this.stop();

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // If reversed, reverse the audio buffer first
    const targetBuffer = reversed ? reverseAudioBuffer(ctx, buffer) : buffer;
    this.duration = targetBuffer.duration;

    // Convert to WAV Blob
    const wavBlob = audioBufferToWav(targetBuffer);
    const blobUrl = URL.createObjectURL(wavBlob);
    this.currentBlobUrl = blobUrl;

    const audio = new Audio(blobUrl);

    // CRITICAL: preservesPitch = true ensures pitch is NOT altered during speed changes
    audio.preservesPitch = true;
    (audio as unknown as { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
    (audio as unknown as { mozPreservesPitch?: boolean }).mozPreservesPitch = true;

    audio.playbackRate = speed;
    audio.currentTime = startFrom;
    this.audioElement = audio;

    audio.onended = () => {
      this.cleanup();
      if (this.onEnded) {
        this.onEnded();
      }
    };

    audio.onerror = () => {
      this.cleanup();
      if (this.onEnded) {
        this.onEnded();
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }

    this.trackProgress();
  }

  private trackProgress() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    const update = () => {
      if (!this.audioElement) return;

      const currentTime = this.audioElement.currentTime;
      const duration = this.audioElement.duration || this.duration;

      if (this.onProgress) {
        this.onProgress(Math.min(currentTime, duration), duration);
      }

      if (!this.audioElement.paused && !this.audioElement.ended) {
        this.animFrameId = requestAnimationFrame(update);
      }
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  public stop() {
    this.cleanup();
  }

  private cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.removeAttribute('src');
        this.audioElement.load();
      } catch {
        // Ignore
      }
      this.audioElement = null;
    }
    if (this.currentBlobUrl) {
      try {
        URL.revokeObjectURL(this.currentBlobUrl);
      } catch {
        // Ignore
      }
      this.currentBlobUrl = null;
    }
  }
}
