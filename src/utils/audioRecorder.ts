import { getAudioContext, processQualityBuffer, extractWaveform } from './audioEngine';
import { RecordedAudio, AudioQuality } from '../types';

export class AudioRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private startTime = 0;
  private quality: AudioQuality = 'medium';

  public onVolumeChange?: (volume: number) => void;
  public onTimeUpdate?: (seconds: number) => void;

  public async startRecording(quality: AudioQuality = 'medium'): Promise<void> {
    this.quality = quality;
    this.stopRecordingStream();
    this.audioChunks = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Tarayıcınız veya önizleme penceresi mikrofon erişimini kısıtlamış olabilir.');
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: quality === 'high' ? 48000 : 24000,
        },
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (innerErr: unknown) {
        const error = innerErr as Error;
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw new Error('Mikrofon izni reddedildi veya önizleme penceresinde engellendi. Lütfen izin verin veya uygulamayı yeni sekmede açın.');
        }
        throw new Error(error.message || 'Mikrofona bağlanılamadı.');
      }
    }
    this.mediaStream = stream;

    // Set up volume analyzer for live visualizer rings
    const ctx = getAudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    this.analyser = analyser;

    this.startTime = Date.now();
    this.trackLiveAudio();

    const bitRate = quality === 'high' ? 128000 : 64000;
    let options: MediaRecorderOptions = { audioBitsPerSecond: bitRate };
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options.mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      options.mimeType = 'audio/ogg;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      options.mimeType = 'audio/mp4';
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, options);
    } catch {
      this.mediaRecorder = new MediaRecorder(stream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
  }

  private trackLiveAudio() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const check = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalizedVol = Math.min(1, avg / 128);

      if (this.onVolumeChange) {
        this.onVolumeChange(normalizedVol);
      }

      if (this.onTimeUpdate && this.startTime) {
        const elapsed = (Date.now() - this.startTime) / 1000;
        this.onTimeUpdate(elapsed);
      }

      this.animFrameId = requestAnimationFrame(check);
    };

    this.animFrameId = requestAnimationFrame(check);
  }

  public async stopRecording(slotName: string): Promise<RecordedAudio> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        reject(new Error('Kayıt başlatılmadı'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const blob = new Blob(this.audioChunks, { type: mimeType });
          const arrayBuffer = await blob.arrayBuffer();

          const ctx = getAudioContext();
          const decoded = await ctx.decodeAudioData(arrayBuffer);
          const processedBuffer = processQualityBuffer(ctx, decoded, this.quality);
          const waveform = extractWaveform(processedBuffer);

          const result: RecordedAudio = {
            id: `rec_${Date.now()}`,
            name: slotName,
            timestamp: Date.now(),
            duration: processedBuffer.duration,
            audioBuffer: processedBuffer,
            waveform,
            blob,
            sampleRate: processedBuffer.sampleRate,
            qualityNote:
              this.quality === 'high'
                ? 'Yüksek Kalite (128 kbps / HD Ses)'
                : 'Orta Kalite (64 kbps / 22.05 kHz)',
          };

          this.cleanup();
          resolve(result);
        } catch (err) {
          this.cleanup();
          reject(err);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  public cancelRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // Ignore
      }
    }
    this.cleanup();
  }

  private cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.stopRecordingStream();
    this.mediaRecorder = null;
    this.analyser = null;
    this.audioChunks = [];
  }

  private stopRecordingStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }
}
