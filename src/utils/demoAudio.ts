import { getAudioContext, processQualityBuffer, extractWaveform } from './audioEngine';
import { RecordedAudio, AudioQuality } from '../types';

/**
 * Creates an authentic synthetic voice demo sound buffer using Web Audio oscillators & formants
 * saying musical tones and speech-like pulses, so users can test reverse playback immediately.
 */
export function generateSyntheticDemoAudio(
  title: string,
  durationSeconds = 2.4,
  quality: AudioQuality = 'medium'
): RecordedAudio {
  const ctx = getAudioContext();
  const sampleRate = quality === 'high' ? 44100 : 22050;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate melodic speech formant tones: "Mer - ha - ba"
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (t < 0.7) {
      const env = Math.sin((t / 0.7) * Math.PI);
      sample = (Math.sin(2 * Math.PI * 260 * t) * 0.5 + Math.sin(2 * Math.PI * 520 * t) * 0.3) * env;
    } else if (t >= 0.8 && t < 1.5) {
      const env = Math.sin(((t - 0.8) / 0.7) * Math.PI);
      sample = (Math.sin(2 * Math.PI * 392 * t) * 0.5 + Math.sin(2 * Math.PI * 784 * t) * 0.3) * env;
    } else if (t >= 1.6 && t < 2.3) {
      const env = Math.sin(((t - 1.6) / 0.7) * Math.PI);
      sample = (Math.sin(2 * Math.PI * 330 * t) * 0.6 + Math.sin(2 * Math.PI * 660 * t) * 0.2) * env;
    }

    data[i] = sample * 0.6;
  }

  const waveform = extractWaveform(buffer);

  return {
    id: `demo_${Date.now()}`,
    name: title,
    timestamp: Date.now(),
    duration: durationSeconds,
    audioBuffer: buffer,
    waveform,
    blob: new Blob([], { type: 'audio/wav' }),
    sampleRate,
    qualityNote:
      quality === 'high'
        ? 'Demo Ses (Yüksek Kalite - 44.1 kHz)'
        : 'Demo Ses (Orta Kalite - 22.05 kHz)',
  };
}

/**
 * Loads and processes an uploaded audio file according to the selected quality
 */
export async function loadAudioFile(
  file: File,
  label: string,
  quality: AudioQuality = 'medium'
): Promise<RecordedAudio> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = getAudioContext();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  const processedBuffer = processQualityBuffer(ctx, decoded, quality);
  const waveform = extractWaveform(processedBuffer);

  return {
    id: `upload_${Date.now()}`,
    name: label,
    timestamp: Date.now(),
    duration: processedBuffer.duration,
    audioBuffer: processedBuffer,
    waveform,
    blob: file,
    sampleRate: processedBuffer.sampleRate,
    qualityNote:
      quality === 'high'
        ? 'Yüklenen Ses (Yüksek Kalite)'
        : 'Yüklenen Ses (Orta Kaliteye İşlendi)',
  };
}
